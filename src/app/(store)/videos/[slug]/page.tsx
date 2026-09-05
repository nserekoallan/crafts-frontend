'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { useVideo } from '@/hooks/use-videos';
import { VideoPlayer } from '@/components/video/video-player';
import { formatPrice } from '@/lib/utils';

export default function VideoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { video, isLoading, isError } = useVideo(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
        <div className="aspect-video animate-pulse rounded-xl bg-bg-surface" />
      </div>
    );
  }

  // The API returns 404 for anything not published, so a missing video and an
  // unapproved one are indistinguishable here — which is the intent.
  if (isError || !video) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center lg:px-8">
        <h1 className="text-xl font-semibold text-text-primary">Video not found</h1>
        <p className="mt-2 text-sm text-text-secondary">
          It may have been removed or is not published yet.
        </p>
        <Link href="/videos" className="mt-6 inline-block text-sm text-gold hover:underline">
          Back to all videos
        </Link>
      </div>
    );
  }

  const linked = video.products ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <Link
        href="/videos"
        className="inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All videos
      </Link>

      {video.url && (
        <VideoPlayer
          src={video.url}
          poster={video.posterUrl}
          title={video.title}
          className="mt-4 aspect-video w-full"
        />
      )}

      <header className="mt-6">
        <h1 className="text-xl font-bold text-text-primary md:text-3xl">{video.title}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-tertiary">
          {video.artisan && (
            <Link href={`/artisans/${video.artisan.id}`} className="hover:text-gold">
              {video.artisan.businessName}
            </Link>
          )}
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {video.viewCount.toLocaleString()} views
          </span>
          {video.category && <span>{video.category.name}</span>}
        </div>

        {video.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
            {video.description}
          </p>
        )}
      </header>

      {linked.length > 0 && (
        <section className="mt-10 border-t border-border-dark pt-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
            Shop this video
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {linked.map(({ product }) => {
              const price = Number(product.displayPrice ?? product.price);
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group block overflow-hidden rounded-xl border border-border-dark bg-bg-surface"
                >
                  <div className="aspect-square overflow-hidden bg-black/20">
                    {product.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0].url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm text-text-primary group-hover:text-gold">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      {formatPrice(price, product.currency ?? 'UGX')}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
