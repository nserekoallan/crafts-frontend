import { api } from './api';
import type { ApiVideo, CreateVideoResponse } from './types/video';

/** Keep in step with ALLOWED_VIDEO_MIME_TYPES in the API. */
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/** Keep in step with MAX_VIDEO_BYTES in the API. */
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024;

/** Keep in step with MAX_VIDEO_DURATION_SECONDS in the API. */
export const MAX_VIDEO_DURATION_SECONDS = 60;

export interface VideoMetadata {
  durationSeconds: number;
  width: number;
  height: number;
}

/**
 * Reads duration and dimensions from a local file.
 *
 * Mirrors the dimension check the product image flow does with `Image()`.
 * Rejects when the browser cannot decode the file at all, which is the earliest
 * signal that a container holds a codec this device will not play.
 */
export function readVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        durationSeconds: Math.round(el.duration),
        width: el.videoWidth,
        height: el.videoHeight,
      });
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This file could not be read as a video.'));
    };
    el.src = url;
  });
}

/**
 * Grabs a poster frame client-side.
 *
 * There is no server-side transcoding — ffmpeg will not fit on the API box — so
 * the browser is the only place a thumbnail can come from. Failure is expected
 * on some Android codecs, so callers must treat this as best-effort.
 */
export function capturePosterFrame(file: File, atSecond = 1): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.muted = true;
    el.playsInline = true;

    const fail = (message: string) => {
      URL.revokeObjectURL(url);
      reject(new Error(message));
    };

    el.onloadedmetadata = () => {
      // A clip shorter than the requested offset still needs a frame.
      el.currentTime = Math.min(atSecond, Math.max(el.duration - 0.1, 0));
    };

    el.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = el.videoWidth;
      canvas.height = el.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return fail('Could not capture a preview frame.');
      ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          blob ? resolve(blob) : reject(new Error('Could not capture a preview frame.'));
        },
        'image/jpeg',
        0.8,
      );
    };

    el.onerror = () => fail('Could not capture a preview frame.');
    el.src = url;
  });
}

/**
 * Uploads the file directly to R2.
 *
 * Uses XMLHttpRequest rather than fetch purely for `upload.onprogress` — a
 * multi-minute upload with no progress indicator reads as a hang. The
 * Content-Type must match the value signed into the URL or R2 returns 403.
 */
function putToStorage(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      // 403 here is nearly always an expired signature or a Content-Type that
      // does not match what was signed.
      reject(new Error(`Upload failed (${xhr.status}). Please try again.`));
    };

    // A CORS rejection surfaces here with no status at all.
    xhr.onerror = () =>
      reject(new Error('Upload failed. Check your connection and try again.'));
    xhr.onabort = () => reject(new Error('Upload cancelled.'));

    xhr.send(file);
  });
}

export interface UploadVideoInput {
  file: File;
  title: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  onProgress?: (percent: number) => void;
}

/**
 * Full upload: reserve → PUT to R2 → confirm.
 *
 * Client-side validation here is UX, not enforcement — the API re-checks the
 * object's real size after the fact, because a presigned PUT cannot impose a
 * ceiling of its own.
 */
export async function uploadVideo(input: UploadVideoInput): Promise<ApiVideo> {
  const { file, onProgress } = input;

  if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    throw new Error('Please choose an MP4, WebM or MOV file.');
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`Video must be under ${Math.floor(MAX_VIDEO_BYTES / (1024 * 1024))}MB.`);
  }

  const meta = await readVideoMetadata(file);
  if (meta.durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
    throw new Error(`Video must be ${MAX_VIDEO_DURATION_SECONDS} seconds or shorter.`);
  }

  const created = await api.post<{ data: CreateVideoResponse }>('/videos', {
    title: input.title,
    description: input.description || undefined,
    mimeType: file.type,
    categoryId: input.categoryId || undefined,
    tags: input.tags?.length ? input.tags : undefined,
  });

  const { video, uploadUrl } = created.data;

  await putToStorage(uploadUrl, file, onProgress);

  const completed = await api.patch<{ data: ApiVideo }>(`/videos/${video.id}/complete`, {
    durationSeconds: meta.durationSeconds,
  });

  return completed.data;
}
