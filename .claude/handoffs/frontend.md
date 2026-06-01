# Frontend Handoff

## Last session — 2026-05-14 (3)

### Files changed

- `src/components/admin/create-artisan-dialog.tsx`
- `src/components/dashboard/create-product-dialog.tsx`
- `src/components/dashboard/edit-product-dialog.tsx`

### What changed

**create-artisan-dialog.tsx**
- Fixed phone regex from `/^\+\d{7,15}$/` to `/^\+[1-9]\d{6,14}$/` to match backend DTO exactly
- Updated validation error text to "International format: +256700000001 (min 8 digits after +)"

**create-product-dialog.tsx**
- Added `uploadingImages`, `imageUploadError`, `createdProductId` state
- Moved image upload out of the main try/catch: product is created first (dialog stays open), then images are uploaded separately
- If no images selected (`imageFiles.length === 0`), skips upload entirely and closes normally
- During upload, button label shows "Uploading images…" and cancel is disabled
- If upload fails: dialog stays open, shows amber inline error, replaces button row with single "Done (add images later)" button that refreshes the product list and closes
- 503 response → specific "Image upload is temporarily unavailable. Your product was saved…" message
- Other errors → server message or "Image N failed to upload."

**edit-product-dialog.tsx**
- `handleImageUpload` catch block now checks `err instanceof ApiError && err.status === 503`
- 503 → "Image upload is temporarily unavailable. Please try again later or contact the platform administrator."
- Other errors → existing "Failed to upload image. Please try again."

### API calls added/modified

None added. Same endpoints, better error handling around `POST /products/:id/images`.

---

## Previous session — 2026-05-14 (2)

### Files changed

- `src/app/dashboard/page.tsx`
- `src/app/dashboard/settings/page.tsx`

### What changed

**dashboard/page.tsx**
- Added `ArtisanProfile` type (id, businessName, bio, region, status, storyStatus, storyNote, adminRating)
- Added `VERIFICATION_BADGE` map (VERIFIED/PENDING/SUSPENDED → label + Tailwind classes)
- Added `ProfileSummaryCard` component: fetches `GET /artisans/:id` with `staleTime: 5min`, renders avatar initials, businessName, region, verification badge, adminRating star label, and two links (Edit Profile → /dashboard/settings, View Public Profile → /artisans/:id target="_blank")
- Added `artisanId = user?.artisan?.id` at page level
- Renders `<ProfileSummaryCard artisanId={artisanId} />` between heading row and balance hero section (only when artisanId is present)

**dashboard/settings/page.tsx**
- Added `adminRating` field to `ArtisanProfile` type
- Added `ExternalLink` to lucide imports
- Added `VERIFICATION_BADGE` map and `StarDisplay` component (5-star visual)
- Page-level `useQuery` for artisan profile (same queryKey as BusinessInfoSection — deduplicated by React Query)
- Added admin-set info banner above all sections: verification status badge, adminRating stars, region, businessName, and "View my public profile" link to /artisans/:id
- Renamed "Business Info" section heading to "Edit Profile"
- Updated storyStatus indicator text: NONE → "Your story hasn't been submitted…", PENDING → "Story submitted — admin will review shortly", APPROVED → "Story approved and visible to buyers ✓", REJECTED → "Story rejected: [note]" + "Update your bio and resubmit."

### API calls added/modified

- `GET /artisans/:id` — now also called from `dashboard/page.tsx` (ProfileSummaryCard) and at page-level in `dashboard/settings/page.tsx`. Both use queryKey `['artisan', 'profile', artisanId]` so the fetch is shared.

---

## Previous session — 2026-05-14

### Files changed

- `src/components/dashboard/edit-product-dialog.tsx`
- `src/app/dashboard/products/page.tsx`

### What changed

**edit-product-dialog.tsx**
- Images query now uses `initialData: { data: product.images ?? [] }` seeded from the prop, so thumbnails appear immediately when the panel is opened without needing a network round-trip.
- Query is now `enabled: open` (not gated on `showImages`) so data stays fresh.
- Removed the `unknown` cast on the query fn; response type is now clean.
- Additional categories section was already complete from a prior session (checkboxes, pre-selection from `product.additionalCategories`, diff + sync on save).

**dashboard/products/page.tsx**
- PENDING_QC products: show "Under review" text label and Edit button only — no Delete, no Submit.
- SUSPENDED products: show "Contact admin" text only — no Edit, no Delete.
- ACTIVE, DRAFT, REJECTED: unchanged behaviour.
- `rejectionReason` and `suspensionReason` were already rendered below the product name.

### API calls added/modified

None added. Existing calls referenced:
- `GET /products/:id` — refreshes images after upload/delete
- `POST /products/:id/images` — upload new image
- `DELETE /products/:id/images/:imageId` — remove image
- `POST /products/:id/categories` — add additional category
- `DELETE /products/:id/categories/:categoryId` — remove additional category

---

## Previous session — 2026-05-13

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
