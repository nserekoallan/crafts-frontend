'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Film, X } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useCategories } from '@/hooks/use-categories';
import { ApiError } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import {
  ACCEPTED_VIDEO_TYPES,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
  readVideoMetadata,
  uploadVideo,
} from '@/lib/video-upload';

interface CreateVideoDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Artisan video upload.
 *
 * The file goes straight to storage, not through the API, so this shows real
 * byte-level progress — a multi-minute upload behind a spinner is
 * indistinguishable from a hang on a slow connection.
 */
export function CreateVideoDialog({ open, onClose }: CreateVideoDialogProps) {
  const queryClient = useQueryClient();
  const { categories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setTitle('');
    setDescription('');
    setCategoryId('');
    setFile(null);
    setFileError('');
    setDuration(null);
    setProgress(0);
    setError('');
  };

  const close = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    e.target.value = '';
    if (!chosen) return;

    setFileError('');
    setDuration(null);

    if (!ACCEPTED_VIDEO_TYPES.includes(chosen.type)) {
      setFileError('Please choose an MP4, WebM or MOV file.');
      return;
    }
    if (chosen.size > MAX_VIDEO_BYTES) {
      setFileError(`Video must be under ${Math.floor(MAX_VIDEO_BYTES / (1024 * 1024))}MB.`);
      return;
    }

    try {
      const meta = await readVideoMetadata(chosen);
      if (meta.durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
        setFileError(`Video must be ${MAX_VIDEO_DURATION_SECONDS} seconds or shorter.`);
        return;
      }
      setDuration(meta.durationSeconds);
      setFile(chosen);
    } catch {
      // The browser could not decode it — usually an unsupported codec inside a
      // container we do accept.
      setFileError('This file could not be read as a video. Try exporting it as MP4 (H.264).');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      await uploadVideo({
        file,
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: categoryId || undefined,
        onProgress: setProgress,
      });
      await queryClient.invalidateQueries({ queryKey: ['videos'] });
      reset();
      onClose();
    } catch (err) {
      // apiErrorMessage only unwraps ApiError; the upload helper throws plain
      // Errors with specific, user-facing text (expired signature, CORS, codec)
      // that would otherwise be flattened into the generic fallback.
      setError(
        err instanceof ApiError
          ? apiErrorMessage(err, 'Upload failed. Please try again.')
          : err instanceof Error
            ? err.message
            : 'Upload failed. Please try again.',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} title="Upload a video">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Video file</label>

          {file ? (
            <div className="flex items-center gap-3 rounded-lg border border-border-dark bg-bg-surface p-3">
              <Film className="h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text-primary">{file.name}</p>
                <p className="text-xs text-text-tertiary">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                  {duration !== null ? ` · ${duration}s` : ''}
                </p>
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="rounded p-1 text-text-tertiary hover:text-text-primary"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-white/20 p-6 text-text-tertiary transition-colors hover:border-hunter-green hover:text-hunter-green"
            >
              <Film className="h-6 w-6" />
              <span className="text-xs">Choose a video</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_VIDEO_TYPES.join(',')}
            className="hidden"
            onChange={handleFile}
          />

          {fileError && <p className="mt-1.5 text-xs text-red-400">{fileError}</p>}

          <p className="mt-1.5 text-xs text-text-tertiary">
            Up to {MAX_VIDEO_DURATION_SECONDS} seconds and{' '}
            {Math.floor(MAX_VIDEO_BYTES / (1024 * 1024))}MB. MP4 (H.264 + AAC) plays on the
            widest range of phones.
          </p>
        </div>

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          required
          disabled={uploading}
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={2000}
          disabled={uploading}
        />

        <Select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={uploading}
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>

        {uploading && (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-surface">
              <div
                className="h-full rounded-full bg-gold transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-text-tertiary">
              {progress < 100 ? `Uploading… ${progress}%` : 'Finishing up…'}
            </p>
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={close} disabled={uploading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={uploading} disabled={!file || !title.trim()}>
            Upload
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
