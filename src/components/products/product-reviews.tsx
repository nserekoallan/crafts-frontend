'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewUser {
  profile: { firstName: string; lastName: string } | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewUser;
}

interface ReviewsResponse {
  data: Review[];
  meta: { total: number; page: number; limit: number };
}

interface RatingResponse {
  average: number;
  count: number;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StarRating({
  value,
  interactive = false,
  onChange,
  size = 'md',
}: {
  value: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md';
}) {
  const [hovered, setHovered] = useState(0);
  const active = interactive ? (hovered || value) : value;
  const cls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(cls, i <= active ? 'fill-satin-gold text-satin-gold' : 'fill-none text-medium-gray', interactive && 'cursor-pointer transition-colors')}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const name = review.user.profile
    ? `${review.user.profile.firstName} ${review.user.profile.lastName}`
    : 'Anonymous';

  const date = new Date(review.createdAt).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="rounded-xl border border-light-gray bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-charcoal">{name}</p>
          <p className="text-xs text-medium-gray">{date}</p>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>
      {review.comment && (
        <p className="mt-2 text-sm text-medium-gray leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: ratingData } = useQuery({
    queryKey: ['reviews', 'rating', productId],
    queryFn: () =>
      api.get<{ data: RatingResponse }>(`/reviews/product/${productId}/rating`).then((r) => r.data),
  });

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.get<ReviewsResponse>(`/reviews/product/${productId}`),
  });

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: () => api.post('/reviews', { productId, rating, comment: comment.trim() || undefined }),
    onSuccess: () => {
      setSubmitted(true);
      setRating(0);
      setComment('');
      setSubmitError('');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'rating', productId] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSubmitError(msg ?? 'Failed to submit review. Please try again.');
    },
  });

  const reviews = reviewsData?.data ?? [];
  const avg = ratingData?.average ?? 0;
  const count = ratingData?.count ?? 0;

  return (
    <section className="mt-12 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-charcoal">Reviews</h2>
        {count > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating value={Math.round(avg)} size="sm" />
            <span className="text-sm font-medium text-charcoal">{avg.toFixed(1)}</span>
            <span className="text-sm text-medium-gray">({count})</span>
          </div>
        )}
      </div>

      {/* Submission form — customer only */}
      {user?.role === 'customer' && !submitted && (
        <div className="rounded-xl border border-light-gray bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-charcoal mb-3">Leave a Review</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-medium-gray mb-1.5">Rating</p>
              <StarRating value={rating} interactive onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (optional)"
              rows={3}
              className="w-full resize-none rounded-lg border border-light-gray px-3 py-2 text-sm text-charcoal placeholder:text-medium-gray focus:border-hunter-green focus:outline-none"
            />
            {submitError && <p className="text-xs text-red-600">{submitError}</p>}
            <button
              onClick={() => submitReview()}
              disabled={rating === 0 || isPending}
              className="rounded-lg bg-hunter-green px-4 py-2 text-sm font-semibold text-white hover:bg-hunter-green/90 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="rounded-xl bg-hunter-green/10 px-4 py-3 text-sm text-hunter-green font-medium">
          Thank you for your review!
        </div>
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-light-gray bg-light-gray/40" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-light-gray/60">
            <MessageSquare className="h-6 w-6 text-medium-gray" />
          </div>
          <p className="text-sm text-medium-gray">No reviews yet. Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  );
}
