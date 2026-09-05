'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Video as VideoIcon } from 'lucide-react';
import { useVideos } from '@/hooks/use-videos';
import { useCategories } from '@/hooks/use-categories';
import { formatDuration } from '@/lib/types/video';
import { Stagger, StaggerItem } from '@/components/motion/stagger';

/**
 * Public Video Hub.
 *
 * Only published videos reach this page — the API filters to ACTIVE uploads, so
 * nothing unreviewed can appear here even transiently.
 */
export default function VideosPage() {
  const [categoryId, setCategoryId] = useState<string>('');
  const { videos, isLoading } = useVideos(categoryId ? { categoryId } : {});
  const { categories } = useCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <header className="border-b border-border-dark pb-6">
        <h1 className="text-2xl font-bold text-text-primary md:text-4xl">Watch &amp; Shop</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Short films from the makers — see how each piece is made, then shop the
          products featured in them.
        </p>
      </header>

      {categories.length > 0 && (
        <div className="scrollbar-hide mt-6 flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={categoryId === ''} onClick={() => setCategoryId('')}>
            All
          </FilterChip>
          {categories.map((cat) => (
            <FilterChip
              key={cat.id}
              active={categoryId === cat.id}
              onClick={() => setCategoryId(cat.id)}
            >
              {cat.name}
            </FilterChip>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] animate-pulse rounded-xl bg-bg-surface" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState hasFilter={categoryId !== ''} />
      ) : (
        <Stagger className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {videos.map((video) => (
            <StaggerItem key={video.id}>
              <Link
                href={`/videos/${video.slug}`}
                className="group block overflow-hidden rounded-xl border border-border-dark bg-bg-surface"
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
                      <VideoIcon className="h-8 w-8 text-text-tertiary" />
                    </div>
                  )}

                  <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/90 text-black">
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    </span>
                  </span>

                  {video.durationSeconds ? (
                    <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-medium text-white">
                      {formatDuration(video.durationSeconds)}
                    </span>
                  ) : null}
                </div>

                <div className="p-3">
                  <h2 className="line-clamp-2 text-sm font-medium text-text-primary group-hover:text-gold">
                    {video.title}
                  </h2>
                  {video.artisan && (
                    <p className="mt-1 text-xs text-text-tertiary">{video.artisan.businessName}</p>
                  )}
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-gold bg-gold/10 text-gold'
          : 'border-border-dark text-text-secondary hover:border-gold/50 hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <VideoIcon className="h-10 w-10 text-text-tertiary" />
      <p className="mt-4 text-sm text-text-secondary">
        {hasFilter
          ? 'No videos in this category yet.'
          : 'No videos have been published yet. Check back soon.'}
      </p>
    </div>
  );
}
