# Frontend Handoff

## Last change — Dashboard asymmetric hero layout redesign

### Files changed

- `src/app/dashboard/page.tsx` — layout redesign

### What changed

- Removed lucide imports: `DollarSign`, `Eye`, `ShoppingCart`, `TrendingUp`, `Wallet`. Kept `AlertTriangle` and `Star`.
- Deleted `StatSkeleton` function.
- Deleted `stats` array and the 4-card uniform grid.
- Replaced old page header with `items-baseline justify-between` row: `{user?.firstName}'s Studio` (h1) and a live date label (text-xs, right-aligned).
- Added asymmetric hero grid (`mt-6 grid lg:grid-cols-5 gap-4`):
  - Balance card (`lg:col-span-3`): label in tracking-widest uppercase, 5xl balance figure, "Ready to transfer" subtext, "Manage earnings →" gold link to `/dashboard/earnings`.
  - Supporting metrics panel (`lg:col-span-2`): three stacked rows (Total Revenue, Product Views, Total Orders) divided by `divide-y divide-border-dark`, each with its own skeleton.
- Alert strip badges updated to dark-mode: `bg-amber-500/15 border border-amber-500/20 text-amber-400` and `bg-red-500/15 border border-red-500/20 text-red-400`.
- Top Products section heading replaced with `<p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Top Performers</p>`.
- Top Products table: added `#` rank column (zero-padded `tabular-nums`); revenue cell changed to `font-semibold text-gold`.
- Recent Orders section heading replaced with the same `<p>` pattern.

### API calls added/modified

None — page reads from existing hooks (`useArtisanEarnings`, `useArtisanAnalytics`, `useArtisanOrders`, `useArtisanProducts`). No new endpoints.

---



## Last change — Admin overview page visual hierarchy redesign

### Files changed

- `src/app/admin/page.tsx`

### What changed

- Removed all lucide-react imports (no icons used in the page anymore)
- Removed `Button` import from `@/components/ui/button` (no longer needed)
- Replaced `<h1>Platform Overview</h1>` header with a slim two-column strip: `Admin Console` label (left) and formatted date (right), both in `text-text-tertiary`
- Stats array: dropped `icon` and `color` fields; added `numValue` and `alert: true` on the Pending Verification entry
- Stat cards: removed circular icon containers; labels are now small-caps above `text-4xl` numbers; Pending Verification card gets amber ring + amber number when count > 0
- Removed the entire "Action Queue" 4-card grid and the `actionItems` array that drove it
- Added "Needs Attention" pill strip: amber rounded-full pills rendered only for counts > 0; falls back to "platform is healthy" text when all counts are zero
- Table header class: `font-semibold text-text-secondary tracking-wider` → `font-medium text-text-tertiary tracking-widest`
- Pending artisan "Review" button: replaced `<Button variant="primary" size="sm">` with a plain `<Link>` styled as a minimal bordered label (`Review →`)
- Removed the entire "Quick Actions" panel (former third column in `lg:grid-cols-3` layout)
- Pending Verifications section: outer `grid grid-cols-1 lg:grid-cols-3` wrapper replaced with a plain `<div>`; card is now full-width

### API calls added/modified

None.

---

## Previous change — Badge dark-mode variant colors

### Files changed

- `src/components/ui/badge.tsx` — replaced all variant color strings inside `badgeVariants` with dark-appropriate values (transparent overlays + colored text + subtle borders). No other changes.

### Variant mapping (new)

| variant | classes |
|---|---|
| default | `bg-white/8 text-text-secondary border border-white/10` |
| pending | `bg-amber-500/15 text-amber-400 border border-amber-500/20` |
| processing | `bg-blue-500/15 text-blue-400 border border-blue-500/20` |
| shipped | `bg-violet-500/15 text-violet-400 border border-violet-500/20` |
| delivered | `bg-emerald-500/15 text-emerald-400 border border-emerald-500/20` |
| cancelled | `bg-red-500/15 text-red-400 border border-red-500/20` |

### API calls added/modified

None.

---

## Previous change — Artisan dashboard rebuild + analytics hook

### Files changed

- `src/hooks/use-artisan.ts` — added `ProductAnalytic` interface, `ArtisanAnalyticsData` interface, and `useArtisanAnalytics()` hook (calls `GET /artisans/me/analytics`, staleTime 60s, enabled for artisan role only)
- `src/app/dashboard/page.tsx` — full rebuild

### Dashboard sections

1. Stats row (4 cards): Available Balance (earnings.balance), Total Revenue (analytics totals), Total Views, Total Orders — skeletons while loading
2. Alert strip: only when `PENDING_QC` or `SUSPENDED` product count > 0; links to `/dashboard/products`
3. Top Products table: top 5 by revenue desc — columns: name / views / orders / revenue / star rating (shows "—" when avgRating is null)
4. Recent Orders table: last 5 orders with `<Badge variant>` status mapping

### Status badge mapping

`DELIVERED` → delivered, `SHIPPED` → shipped, `PROCESSING/QC_PASSED/PAID` → processing, `PENDING` → pending, `CANCELLED` → cancelled, unknown → default

### API calls added

- `GET /artisans/me/analytics` via `useArtisanAnalytics()`

---

## Previous change: admin dashboard rebuild

### Files changed
- `src/app/admin/page.tsx` — full rebuild

### What changed

**New queries added (via `useQueries`):**
- `['admin', 'products-total']` → `GET /products?limit=1` → `meta.total`
- `['admin', 'qc-pending']` → `GET /products?status=PENDING_QC&limit=1` → `meta.total`
- `['admin', 'featured-pending']` → `GET /featured-requests?status=PENDING&limit=1` → `meta.total`
- `['admin', 'payouts-pending']` → `GET /artisans/payouts/admin?status=PENDING&limit=1` → `meta.total`

**Layout changes:**
- Stats row expanded from 3 to 4 cards (added Total Products with Package icon, hunter-green)
- New Action Queue section: full-width card with 4 action items (QC Queue, Featured Requests, Artisan Verifications, Pending Payouts); amber highlight when count > 0 via `ring-1 ring-amber-500/40`
- Recent Orders table: currency via `useCurrency().formatPrice`, all theme tokens updated to dark (`text-text-primary`, `text-text-secondary`, `bg-bg-elevated/50`)
- Pending Verifications + Quick Actions: all `text-charcoal` replaced with `text-text-primary`, fixed malformed `bg-bg-surface/60/60` skeleton class

**Currency fix:**
- Removed `formatPrice` from `@/lib/utils` import
- Added `import { useCurrency } from '@/lib/currency'` and `const { formatPrice } = useCurrency()` inside the component

**All API calls are defined in `docs/contracts/api-contract.md`.**

---

## Previous change: portal-layout

### Files changed

| File | Change |
|---|---|
| `src/components/layout/portal-header.tsx` | NEW. Slim `h-14` top bar shared by both portals. Shows logo, portal label badge, user name, Store link, Log out. Props: `label`, `accentClass`. |
| `src/app/admin/layout.tsx` | REWRITTEN. Full-height dark sidebar (`#0D0D0D`) with `bg-satin-gold/10 text-satin-gold` active tint. Uses `PortalHeader`. Mobile: horizontal scroll strip sticky below portal header. |
| `src/app/dashboard/layout.tsx` | REWRITTEN. Same structure as admin layout, narrower sidebar (`w-52`). Active tint: `bg-hunter-green/20 text-hunter-green-light`. Portal label: "Artisan Studio". |

### Design decisions

- No border-l accent stripes — active state is a background tint only.
- Both portals use `bg-[#0D0D0D]` for sidebar and portal header, `bg-[#111110]` for the page canvas — visually separate from the store's dark canvas.
- Inactive nav items: `text-white/50`, hover `text-white/80` with `bg-white/[0.05]` fill.
- `PortalHeader` is sticky `top-0 z-50`; mobile nav strips are sticky `top-14` (below portal header).
- The previous `sticky top-24` / `sticky top-[72px]` offsets (which assumed the store header) are gone — portals now manage their own stacking entirely.

### API calls added/modified

None.