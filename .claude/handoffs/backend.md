## Task
Phase 2 backend: reports summary endpoint, artisan findOne with documents, artisan payouts artisanId filter, user findById, orders userId filter, document status update endpoint, contact form endpoint.

## Files Changed
- `src/platform/reports.service.ts` (new) — getSummary(from, to) with all aggregations
- `src/platform/reports.controller.ts` (new) — GET /admin/reports/summary
- `src/platform/platform.module.ts` — registered ReportsController + ReportsService
- `src/artisans/artisans.service.ts` — findOne now includes documents; adminGetPayouts accepts artisanId filter; updateDocumentStatus method added; DocumentStatus imported
- `src/artisans/artisans.controller.ts` — adminGetPayouts passes artisanId; PATCH documents/:id added; DocumentStatus imported
- `src/users/users.service.ts` — findById method added
- `src/users/users.controller.ts` — GET :id route added at end (after all specific routes)
- `src/orders/orders.service.ts` — findAll accepts optional userId (admin only)
- `src/orders/orders.controller.ts` — findAll passes userId query param
- `src/notifications/contact.dto.ts` (new) — ContactDto with class-validator
- `src/notifications/contact.service.ts` (new) — sends email to hello@craftcontinent.com
- `src/notifications/contact.controller.ts` (new) — POST /contact (@Public)
- `src/notifications/notifications.module.ts` — registered ContactController + ContactService
- `docs/contracts/api-contract.md` — all endpoints documented

## Contract Updates
- GET /admin/reports/summary added (ADMIN, SUPER_ADMIN)
- GET /artisans/:id updated — now includes documents[]
- GET /artisans/payouts/admin updated — now accepts optional ?artisanId=uuid
- PATCH /artisans/documents/:id added (ADMIN, SUPER_ADMIN)
- GET /users/:id added (ADMIN, SUPER_ADMIN)
- GET /orders updated — now accepts optional ?userId=uuid (admin only)
- POST /contact added (@Public)
- DocumentStatus enum added to contract

## Build
PASS (exit 0)

## Status
DONE
