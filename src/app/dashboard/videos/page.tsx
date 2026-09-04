'use client';

import { useState } from 'react';
import { Film, Plus, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useMyVideos, useSubmitVideo, useDeleteVideo } from '@/hooks/use-videos';
import { CreateVideoDialog } from '@/components/dashboard/create-video-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDuration, type ApiVideo, type VideoStatus } from '@/lib/types/video';

const STATUS_VARIANT: Record<VideoStatus, 'default' | 'pending' | 'delivered' | 'cancelled'> = {
  DRAFT: 'default',
  PENDING_QC: 'pending',
  ACTIVE: 'delivered',
  SUSPENDED: 'cancelled',
  REJECTED: 'cancelled',
};

const STATUS_LABEL: Record<VideoStatus, string> = {
  DRAFT: 'Draft',
  PENDING_QC: 'In review',
  ACTIVE: 'Published',
  SUSPENDED: 'Suspended',
  REJECTED: 'Rejected',
};

export default function DashboardVideosPage() {
  const { user } = useAuth();
  const artisanId = user?.artisan?.id;
  const { videos, isLoading } = useMyVideos(artisanId);
  const submit = useSubmitVideo();
  const remove = useDeleteVideo();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Videos</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Short films of your work. Published videos appear in the Watch &amp; Shop hub.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Upload
        </Button>
      </header>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] animate-pulse rounded-xl bg-bg-surface" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Film className="h-10 w-10 text-text-tertiary" />
          <p className="mt-4 text-sm text-text-secondary">
            You haven&apos;t uploaded any videos yet.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSubmit={() => submit.mutate(video.id)}
              onDelete={() => remove.mutate(video.id)}
              busy={submit.isPending || remove.isPending}
            />
          ))}
        </div>
      )}

      <CreateVideoDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}

function VideoCard({
  video,
  onSubmit,
  onDelete,
  busy,
}: {
  video: ApiVideo;
  onSubmit: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  // Only a draft or a rejected video can go back into review, matching the
  // transitions the API enforces.
  const canSubmit =
    Boolean(video.uploadedAt) && (video.status === 'DRAFT' || video.status === 'REJECTED');

  return (
    <div className="overflow-hidden rounded-xl border border-border-dark bg-bg-surface">
      <div className="relative aspect-[9/16] bg-black">
        {video.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.posterUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="h-7 w-7 text-text-tertiary" />
          </div>
        )}
        {video.durationSeconds ? (
          <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] text-white">
            {formatDuration(video.durationSeconds)}
          </span>
        ) : null}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 text-sm text-text-primary">{video.title}</h2>
          <Badge variant={STATUS_VARIANT[video.status]}>{STATUS_LABEL[video.status]}</Badge>
        </div>

        {video.status === 'REJECTED' && video.rejectionReason && (
          <p className="mt-2 text-xs text-red-400">{video.rejectionReason}</p>
        )}

        {!video.uploadedAt && (
          <p className="mt-2 text-xs text-text-tertiary">Upload did not finish.</p>
        )}

        <div className="mt-3 flex gap-2">
          {canSubmit && (
            <Button size="sm" onClick={onSubmit} disabled={busy}>
              <Send className="mr-1 h-3.5 w-3.5" /> Submit
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onDelete} disabled={busy}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
