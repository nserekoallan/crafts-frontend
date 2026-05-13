## Task
Phase 1 QA — static validation of all new routes and modified files.

## Checks Run

### Build
- `npx tsc --noEmit` → 0 errors
- `npm run build` → 0 errors, 1 unrelated Turbopack workspace warning

### Routes confirmed in build output
- /account ✅
- /admin/categories ✅
- /admin/orders/[id] ✅
- /dashboard/settings ✅
- /orders/[id] (modified) ✅

### Structural checks
- All hooks (useQuery, useMutation, useState, useEffect) called at top level of components — no loops or conditionals ✅
- ReviewCard uses useQuery at component top level — not inside .map() callback ✅
- api.postForm and api.patchForm skip Content-Type header correctly — browser sets multipart boundary ✅
- Nav links for Categories and Settings added to admin and dashboard layouts respectively ✅
- Header AccountLink and BottomNav account item are dynamic (auth-aware) ✅
- Review section guarded by order.status === 'DELIVERED' ✅
- 409 from POST /reviews handled gracefully — shows "Already reviewed" without crashing ✅

### Contract compliance
All API calls match docs/contracts/api-contract.md:
- GET/PATCH /users/profile ✅
- PATCH /users/avatar (multipart, field: avatar) ✅
- GET/PATCH /users/notification-preferences ✅
- GET /orders/:id ✅
- PATCH /orders/:id/status ✅
- GET /categories ✅
- POST /categories ✅
- PATCH /categories/:id ✅
- DELETE /categories/:id ✅
- PATCH /artisans ✅
- POST /artisans/documents (multipart, fields: document + type) ✅
- POST /reviews ✅
- GET /reviews/product/:productId/rating ✅
- GET /artisans/:id ✅ (used to prefill artisan settings from public endpoint)

### Regressions
- Admin orders list: View → link added; colSpan adjusted from 7→8. Existing status-advance buttons and expand/collapse unchanged ✅
- Customer order list: unchanged ✅
- Customer order detail: only new section added at bottom; all existing sections unchanged ✅
- Artisan dashboard: layout Settings item added — sidebar now has 6 items, no visual conflicts ✅
- Admin layout: Categories added between Products and Orders — 11 items total, no conflicts ✅

## Status
DONE — all checks pass. No regressions detected.
