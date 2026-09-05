'use client';

import Link from 'next/link';
import { ArrowRight, Play, Video as VideoIcon } from 'lucide-react';
import { useVideos } from '@/hooks/use-videos';
import { formatDuration } from '@/lib/types/video';
import { Stagger, StaggerItem } from '@/components/motion/stagger';

/**
 * Homepage strip of published videos.
 *
 * Collapses entirely when nothing is published — the homepage should look
 * unchanged until there is real content, not carry an empty shelf.
 */
export function VideoStrip() {
  const { videos, isLoading } = useVideos({ limit: 8 });

  if (isLoading || videos.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold md:text-sm">
          Watch &amp; Shop
        </h2>
        <Link
          href="/videos"
          className="flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-gold"
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <Stagger className="scrollbar-hide mt-5 flex gap-3 overflow-x-auto pb-2 md:gap-4">
        {videos.map((video) => (
          <StaggerItem key={video.id} className="shrink-0">
            <Link
              href={`/videos/${video.slug}`}
              className="group relative block w-40 overflow-hidden rounded-xl border border-border-dark md:w-56"
            >
              <div className="relative aspect-[9/16] overflow-hidden bg-black">
                {video.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.posterUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <VideoIcon className="h-7 w-7 text-text-tertiary" />
                  </div>
                )}

                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/90 text-black">
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </span>
                </span>

                {video.durationSeconds ? (
                  <span className="absolute right-2 top-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-medium text-white">
                    {formatDuration(video.durationSeconds)}
                  </span>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="line-clamp-2 text-xs font-medium text-white md:text-sm">
                    {video.title}
                  </h3>
                </div>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
