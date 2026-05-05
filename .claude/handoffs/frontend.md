# Frontend Handoff

## Last change: portal-layout

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
