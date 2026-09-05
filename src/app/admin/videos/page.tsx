'use client';

import { useState } from 'react';
import { Film, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { useAdminVideos, useVideoModeration } from '@/hooks/use-videos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { formatDuration, type ApiVideo, type VideoStatus } from '@/lib/types/video';

const STATUS_VARIANT: Record<VideoStatus, 'default' | 'pending' | 'delivered' | 'cancelled'> = {
  DRAFT: 'default',
  PENDING_QC: 'pending',
  ACTIVE: 'delivered',
  SUSPENDED: 'cancelled',
  REJECTED: 'cancelled',
};

export default function AdminVideosPage() {
  const [tab, setTab] = useState('queue');
  const showAll = tab === 'all';
  const { videos, isLoading } = useAdminVideos(showAll);
  const { approve, reject, suspend, unsuspend } = useVideoModeration();

  const busy =
    approve.isPending || reject.isPending || suspend.isPending || unsuspend.isPending;

  /**
   * Pre-publication video is stored privately, so there is no public URL to
   * open. Ask the API for a short-lived signed one instead.
   */
  const openForReview = async (video: ApiVideo) => {
    try {
      const res = await api.get<{ data: { url: string } }>(`/videos/${video.id}/review-url`);
      window.open(res.data.url, '_blank', 'noopener');
    } catch {
      // Nothing to watch is itself the useful signal here.
      alert('Could not open this video. The upload may not have finished.');
    }
  };

  const promptReject = (video: ApiVideo) => {
    const reason = window.prompt('Why is this video being rejected? The artisan will see this.');
    if (reason && reason.trim().length >= 3) {
      reject.mutate({ id: video.id, reason: reason.trim() });
    }
  };

  const promptSuspend = (video: ApiVideo) => {
    const reason = window.prompt('Why is this video being suspended?');
    if (reason && reason.trim().length >= 3) {
      suspend.mutate({ id: video.id, reason: reason.trim() });
    }
  };

  return (
    <div>
      <header>
        <h1 className="text-xl font-bold text-text-primary">Videos</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Artisan videos stay private until approved — nothing here is publicly reachable
          before you publish it.
        </p>
      </header>

      <div className="mt-6">
        <Tabs
          tabs={[
            { value: 'queue', label: 'Awaiting review' },
            { value: 'all', label: 'All videos' },
          ]}
          activeTab={tab}
          onTabChange={setTab}
        />
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-bg-surface" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Film className="h-10 w-10 text-text-tertiary" />
          <p className="mt-4 text-sm text-text-secondary">
            {showAll ? 'No videos yet.' : 'Nothing waiting for review.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col gap-3 rounded-xl border border-border-dark bg-bg-surface p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-sm font-medium text-text-primary">
                    {video.title}
                  </h2>
                  <Badge variant={STATUS_VARIANT[video.status]}>{video.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-text-tertiary">
                  {video.artisan?.businessName ?? 'Admin upload'}
                  {video.durationSeconds ? ` · ${formatDuration(video.durationSeconds)}` : ''}
                  {video.sizeBytes
                    ? ` · ${(video.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                    : ''}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => openForReview(video)}>
                  <ExternalLink className="mr-1 h-3.5 w-3.5" /> Watch
                </Button>

                {video.status === 'PENDING_QC' && (
                  <>
                    <Button size="sm" onClick={() => approve.mutate(video.id)} disabled={busy}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => promptReject(video)}
                      disabled={busy}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {video.status === 'ACTIVE' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => promptSuspend(video)}
                    disabled={busy}
                  >
                    Suspend
                  </Button>
                )}

                {video.status === 'SUSPENDED' && (
                  <Button size="sm" onClick={() => unsuspend.mutate(video.id)} disabled={busy}>
                    Restore
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
