'use client';

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string | null;
  title?: string;
  className?: string;
}

/**
 * Native video playback.
 *
 * Deliberately no HLS or streaming library: there is no transcoding pipeline,
 * so every video is a single progressive file. `preload="metadata"` matters
 * more than usual here — buyers are often on metered mobile data, so nothing
 * beyond the header is fetched until they choose to play.
 */
export function VideoPlayer({ src, poster, title, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  const start = () => {
    setStarted(true);
    void videoRef.current?.play();
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        preload="metadata"
        playsInline
        controls={started}
        onError={() => setFailed(true)}
        className="h-full w-full object-contain"
        aria-label={title}
      />

      {/* A container is not a codec: an .mp4 may hold HEVC or AV1 that this
          browser cannot decode. Say so rather than showing a black rectangle. */}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-surface p-6 text-center">
          <p className="text-sm text-text-secondary">
            This video can&apos;t be played in your browser.
          </p>
        </div>
      )}

      {!started && !failed && (
        <button
          type="button"
          onClick={start}
          aria-label={title ? `Play ${title}` : 'Play video'}
          className="group absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/90 text-black shadow-lg transition-transform group-hover:scale-110">
            <Play className="ml-1 h-7 w-7 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
