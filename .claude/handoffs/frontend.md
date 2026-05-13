# Frontend Handoff

## Last session — 2026-05-13

### Files changed

- `src/app/admin/content/page.tsx`
  - Added `Upload` to lucide imports
  - Added `ImageUploadButton` component (FileReader → base64 data URL)
  - Wired `ImageUploadButton` next to the Image URL label in `BannersTab` (each banner card)
  - Wired `ImageUploadButton` next to the Image URL label in `LifestyleBannerTab`
  - Both tabs already had image previews; no new preview logic needed

- `src/app/admin/artisans/page.tsx`
  - Added `BookOpen`, `Loader2` to lucide imports
  - Added `StoryStatus` type alias; added `storyStatus?` and `storyNote?` to `ArtisanRow`
  - Added `ArtisanDetail` interface (for story review dialog fetch)
  - Added `StoryBadge` component: dim dash / amber "Pending" + Review button / emerald "Approved" / red "Rejected" + Re-review button
  - Added `StoryReviewDialog`: fetches `GET /artisans/:id` for bio, approve/reject via `PATCH /artisans/:id/story-status`
  - Added `storyTarget` state; wired `StoryBadge` in table Story column; mounted dialog

- `src/app/dashboard/settings/page.tsx`
  - Added `StoryStatus` type alias; added `storyStatus?` and `storyNote?` to `ArtisanProfile`
  - Added `submitStorySuccess`, `submitStoryError` state
  - Added `submitStory` mutation → `POST /artisans/story/submit`
  - Added story status UI below bio textarea: contextual badge per status + "Submit Story for Review" button (shown when NONE or REJECTED)

### API calls added / modified

- `POST /artisans/story/submit` — artisan dashboard: submit bio for admin review
- `PATCH /artisans/:id/story-status` — admin: approve/reject artisan story
- `GET /artisans/:id` — already used; now also called in `StoryReviewDialog` to fetch bio

### Backend fields needed (not yet in API contract)

1. `GET /artisans/admin` → `ArtisanWithUser` response must include `storyStatus` and `storyNote` for the Story column in the admin artisans table. Currently the contract defines neither field here. Until deployed, the Story column shows "—" for all rows.

2. `GET /artisans/:id` → public endpoint returns `bio: null` unless `storyStatus === APPROVED`. The admin story review dialog calls this endpoint, so the bio shown may be null for non-approved artisans. The backend should return raw bio to admins regardless of story status.

3. `GET /artisans/:id` (artisan self, used in dashboard settings) → response should include `storyStatus` and `storyNote` for the status indicator and submit button to function correctly.
