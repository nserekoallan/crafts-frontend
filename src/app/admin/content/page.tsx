'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Upload,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Banner {
  id: string | number;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

interface Announcement {
  id: number;
  text: string;
  href: string | null;
  external: boolean;
}

interface TrustPoint {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface FooterTrustItem {
  id: number;
  icon: string;
  label: string;
}

interface LifestyleBanner {
  imageUrl: string;
  headline: string;
  ctaLabel: string;
  ctaHref: string;
}

interface AboutContent {
  heroTitle: string;
  heroDescription: string;
  mission: string;
  ctaText: string;
}

interface SocialLinks {
  instagram: string;
  twitter: string;
  tiktok: string;
}

interface ContactInfo {
  email: string;
  supportHours: string;
}

interface NewsletterSection {
  heading: string;
  subheading: string;
}

interface ContentEntry<T> {
  key: string;
  value: T;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

function fetchContent<T>(key: string): Promise<ContentEntry<T>> {
  return api
    .get<{ data: ContentEntry<T> }>(`/content/${encodeURIComponent(key)}`)
    .then((r) => r.data);
}

function patchContent(key: string, value: unknown): Promise<unknown> {
  return api.patch(`/content/${encodeURIComponent(key)}`, { value });
}

// ---------------------------------------------------------------------------
// Shared UI atoms
// ---------------------------------------------------------------------------

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border-dark bg-bg-surface p-5', className)}>
      {children}
    </div>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-tertiary"
    >
      {children}
    </label>
  );
}

const inputCls =
  'h-9 w-full rounded-lg border border-border-dark bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30';

const textareaCls =
  'w-full rounded-lg border border-border-dark bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30';

function SaveButton({
  onClick,
  isPending,
  saved,
  label = 'Save',
}: {
  onClick: () => void;
  isPending: boolean;
  saved: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
        saved
          ? 'bg-green-600/20 text-green-400'
          : 'bg-gold text-bg-primary hover:bg-gold/90',
        'disabled:opacity-60',
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : saved ? (
        <CheckCircle className="h-3.5 w-3.5" />
      ) : (
        <Save className="h-3.5 w-3.5" />
      )}
      {saved ? 'Saved' : label}
    </button>
  );
}

function useSaveState(): [boolean, boolean, () => void, () => void] {
  const [isPending, setIsPending] = useState(false);
  const [saved, setSaved] = useState(false);

  function startSave() { setIsPending(true); setSaved(false); }
  function doneSave() {
    setIsPending(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return [isPending, saved, startSave, doneSave];
}

// ---------------------------------------------------------------------------
// Image upload — converts to base64 data URL for immediate use
// ---------------------------------------------------------------------------

function ImageUploadButton({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpload(ev.target?.result as string);
      setUploading(false);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected if needed
    e.target.value = '';
  }

  return (
    <label className="flex cursor-pointer items-center gap-1 text-xs text-gold hover:underline">
      {uploading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Upload className="h-3 w-3" />
      )}
      {uploading ? 'Loading…' : 'Upload'}
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </label>
  );
}

// ---------------------------------------------------------------------------
// Tab: Banners
// ---------------------------------------------------------------------------

function BannersTab() {
  const queryClient = useQueryClient();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isPending, saved, startSave, doneSave] = useSaveState();

  const { data } = useQuery({
    queryKey: ['content', 'homepage.banners'],
    queryFn: () => fetchContent<Banner[]>('homepage.banners'),
  });

  useEffect(() => {
    if (data?.value) setBanners(data.value);
  }, [data]);

  function updateBanner(idx: number, field: keyof Banner, value: string) {
    setBanners((prev) => prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  }

  function moveBanner(idx: number, dir: -1 | 1) {
    const next = [...banners];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setBanners(next);
  }

  function removeBanner(idx: number) {
    setBanners((prev) => prev.filter((_, i) => i !== idx));
  }

  function addBanner() {
    if (banners.length >= 5) return;
    setBanners((prev) => [
      ...prev,
      {
        id: Date.now(),
        imageUrl: '',
        title: '',
        subtitle: '',
        ctaLabel: 'Shop Now',
        ctaHref: '/shop',
      },
    ]);
  }

  async function save() {
    startSave();
    try {
      await patchContent('homepage.banners', banners);
      queryClient.invalidateQueries({ queryKey: ['content', 'homepage.banners'] });
      doneSave();
    } catch {
      useSaveState(); // reset
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Up to 5 banners. They rotate on the homepage hero carousel.
        </p>
        <button
          onClick={addBanner}
          disabled={banners.length >= 5}
          className="flex items-center gap-1.5 rounded-lg border border-border-dark px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Add Banner
        </button>
      </div>

      {banners.map((banner, idx) => (
        <SectionCard key={banner.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <button onClick={() => moveBanner(idx, -1)} disabled={idx === 0} className="text-text-tertiary hover:text-gold disabled:opacity-30">
                <ChevronUp className="h-4 w-4" />
              </button>
              <button onClick={() => moveBanner(idx, 1)} disabled={idx === banners.length - 1} className="text-text-tertiary hover:text-gold disabled:opacity-30">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3">
              {/* Image preview + URL */}
              <div className="flex items-start gap-3">
                {banner.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={banner.imageUrl}
                    alt=""
                    className="h-16 w-24 rounded-lg object-cover border border-border-dark"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <Label htmlFor={`banner-img-${idx}`}>Image URL</Label>
                    <ImageUploadButton onUpload={(url) => updateBanner(idx, 'imageUrl', url)} />
                  </div>
                  <input
                    id={`banner-img-${idx}`}
                    type="text"
                    value={banner.imageUrl}
                    onChange={(e) => updateBanner(idx, 'imageUrl', e.target.value)}
                    className={inputCls}
                    placeholder="/products/product-01.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`banner-title-${idx}`}>Title</Label>
                  <input id={`banner-title-${idx}`} type="text" value={banner.title} onChange={(e) => updateBanner(idx, 'title', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <Label htmlFor={`banner-subtitle-${idx}`}>Subtitle</Label>
                  <input id={`banner-subtitle-${idx}`} type="text" value={banner.subtitle} onChange={(e) => updateBanner(idx, 'subtitle', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <Label htmlFor={`banner-cta-label-${idx}`}>CTA Label</Label>
                  <input id={`banner-cta-label-${idx}`} type="text" value={banner.ctaLabel} onChange={(e) => updateBanner(idx, 'ctaLabel', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <Label htmlFor={`banner-cta-href-${idx}`}>CTA Link</Label>
                  <input id={`banner-cta-href-${idx}`} type="text" value={banner.ctaHref} onChange={(e) => updateBanner(idx, 'ctaHref', e.target.value)} className={inputCls} placeholder="/shop" />
                </div>
              </div>
            </div>

            <button onClick={() => removeBanner(idx)} className="mt-0.5 text-text-tertiary transition-colors hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </SectionCard>
      ))}

      <div className="flex justify-end">
        <SaveButton onClick={save} isPending={isPending} saved={saved} label="Save Banners" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Announcements
// ---------------------------------------------------------------------------

function AnnouncementsTab() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Announcement[]>([]);
  const [isPending, saved, startSave, doneSave] = useSaveState();

  const { data } = useQuery({
    queryKey: ['content', 'homepage.announcements'],
    queryFn: () => fetchContent<Announcement[]>('homepage.announcements'),
  });

  useEffect(() => {
    if (data?.value) setItems(data.value);
  }, [data]);

  function update(idx: number, field: keyof Announcement, value: string | boolean | null) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...items];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setItems(next);
  }

  function remove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function add() {
    setItems((prev) => [...prev, { id: Date.now(), text: '', href: null, external: false }]);
  }

  async function save() {
    startSave();
    try {
      await patchContent('homepage.announcements', items);
      queryClient.invalidateQueries({ queryKey: ['content', 'homepage.announcements'] });
      doneSave();
    } catch { /* reset */ }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">Messages rotate in the top announcement bar.</p>
        <button onClick={add} className="flex items-center gap-1.5 rounded-lg border border-border-dark px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:border-gold hover:text-gold">
          <Plus className="h-3.5 w-3.5" /> Add Message
        </button>
      </div>

      {items.map((item, idx) => (
        <SectionCard key={item.id}>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => move(idx, -1)} disabled={idx === 0} className="text-text-tertiary hover:text-gold disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="text-text-tertiary hover:text-gold disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => update(idx, 'text', e.target.value)}
                  className={inputCls}
                  placeholder="Announcement text"
                />
              </div>
              <div className="w-48">
                <input
                  type="text"
                  value={item.href ?? ''}
                  onChange={(e) => update(idx, 'href', e.target.value || null)}
                  className={inputCls}
                  placeholder="Link (optional)"
                />
              </div>
              <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.external}
                  onChange={(e) => update(idx, 'external', e.target.checked)}
                  className="h-3.5 w-3.5 accent-gold"
                />
                External
              </label>
            </div>

            <button onClick={() => remove(idx)} className="text-text-tertiary transition-colors hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </SectionCard>
      ))}

      <div className="flex justify-end">
        <SaveButton onClick={save} isPending={isPending} saved={saved} label="Save Messages" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Trust & Values
// ---------------------------------------------------------------------------

function TrustTab() {
  const queryClient = useQueryClient();

  const [trustPoints, setTrustPoints] = useState<TrustPoint[]>([]);
  const [footerItems, setFooterItems] = useState<FooterTrustItem[]>([]);
  const [isPendingTP, savedTP, startTP, doneTP] = useSaveState();
  const [isPendingFT, savedFT, startFT, doneFT] = useSaveState();

  const { data: tpData } = useQuery({
    queryKey: ['content', 'homepage.trustPoints'],
    queryFn: () => fetchContent<TrustPoint[]>('homepage.trustPoints'),
  });
  const { data: ftData } = useQuery({
    queryKey: ['content', 'footer.trust'],
    queryFn: () => fetchContent<FooterTrustItem[]>('footer.trust'),
  });

  useEffect(() => { if (tpData?.value) setTrustPoints(tpData.value); }, [tpData]);
  useEffect(() => { if (ftData?.value) setFooterItems(ftData.value); }, [ftData]);

  function updateTP(idx: number, field: keyof TrustPoint, value: string) {
    setTrustPoints((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }

  function updateFT(idx: number, field: keyof FooterTrustItem, value: string) {
    setFooterItems((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }

  async function saveTP() {
    startTP();
    try {
      await patchContent('homepage.trustPoints', trustPoints);
      queryClient.invalidateQueries({ queryKey: ['content', 'homepage.trustPoints'] });
      doneTP();
    } catch { /* reset */ }
  }

  async function saveFT() {
    startFT();
    try {
      await patchContent('footer.trust', footerItems);
      queryClient.invalidateQueries({ queryKey: ['content', 'footer.trust'] });
      doneFT();
    } catch { /* reset */ }
  }

  return (
    <div className="space-y-8">
      {/* Homepage trust points */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-text-primary">Homepage Trust Points</h3>
        <div className="space-y-3">
          {trustPoints.map((tp, idx) => (
            <SectionCard key={tp.id}>
              <div className="grid grid-cols-[auto_1fr_1fr_2fr] gap-3 items-start">
                <div>
                  <Label htmlFor={`tp-icon-${idx}`}>Icon</Label>
                  <input id={`tp-icon-${idx}`} type="text" value={tp.icon} onChange={(e) => updateTP(idx, 'icon', e.target.value)} className={cn(inputCls, 'w-28')} placeholder="gem" />
                </div>
                <div>
                  <Label htmlFor={`tp-title-${idx}`}>Title</Label>
                  <input id={`tp-title-${idx}`} type="text" value={tp.title} onChange={(e) => updateTP(idx, 'title', e.target.value)} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`tp-desc-${idx}`}>Description</Label>
                  <input id={`tp-desc-${idx}`} type="text" value={tp.description} onChange={(e) => updateTP(idx, 'description', e.target.value)} className={inputCls} />
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <SaveButton onClick={saveTP} isPending={isPendingTP} saved={savedTP} label="Save Trust Points" />
        </div>
      </div>

      {/* Footer trust items */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-text-primary">Footer Trust Bar</h3>
        <div className="space-y-3">
          {footerItems.map((item, idx) => (
            <SectionCard key={item.id}>
              <div className="flex items-center gap-3">
                <div className="w-28">
                  <Label htmlFor={`ft-icon-${idx}`}>Icon</Label>
                  <input id={`ft-icon-${idx}`} type="text" value={item.icon} onChange={(e) => updateFT(idx, 'icon', e.target.value)} className={inputCls} placeholder="gem" />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`ft-label-${idx}`}>Label</Label>
                  <input id={`ft-label-${idx}`} type="text" value={item.label} onChange={(e) => updateFT(idx, 'label', e.target.value)} className={inputCls} />
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <SaveButton onClick={saveFT} isPending={isPendingFT} saved={savedFT} label="Save Footer Items" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Lifestyle Banner
// ---------------------------------------------------------------------------

function LifestyleBannerTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LifestyleBanner>({
    imageUrl: '/products/product-17.jpg',
    headline: 'Every piece tells a story',
    ctaLabel: 'Discover More',
    ctaHref: '/about',
  });
  const [isPending, saved, startSave, doneSave] = useSaveState();

  const { data } = useQuery({
    queryKey: ['content', 'homepage.lifestyleBanner'],
    queryFn: () => fetchContent<LifestyleBanner>('homepage.lifestyleBanner'),
  });

  useEffect(() => { if (data?.value) setForm(data.value); }, [data]);

  function update(field: keyof LifestyleBanner, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    startSave();
    try {
      await patchContent('homepage.lifestyleBanner', form);
      queryClient.invalidateQueries({ queryKey: ['content', 'homepage.lifestyleBanner'] });
      doneSave();
    } catch { /* reset */ }
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        {form.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.imageUrl}
            alt="Lifestyle banner preview"
            className="mb-4 h-32 w-full rounded-lg object-cover border border-border-dark"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label htmlFor="lb-image">Image URL</Label>
              <ImageUploadButton onUpload={(url) => update('imageUrl', url)} />
            </div>
            <input id="lb-image" type="text" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} className={inputCls} placeholder="/products/product-17.jpg" />
          </div>
          <div>
            <Label htmlFor="lb-headline">Headline</Label>
            <input id="lb-headline" type="text" value={form.headline} onChange={(e) => update('headline', e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lb-cta-label">CTA Label</Label>
              <input id="lb-cta-label" type="text" value={form.ctaLabel} onChange={(e) => update('ctaLabel', e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="lb-cta-href">CTA Link</Label>
              <input id="lb-cta-href" type="text" value={form.ctaHref} onChange={(e) => update('ctaHref', e.target.value)} className={inputCls} placeholder="/about" />
            </div>
          </div>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton onClick={save} isPending={isPending} saved={saved} label="Save Lifestyle Banner" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: About Page
// ---------------------------------------------------------------------------

function AboutPageTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AboutContent>({
    heroTitle: 'About Crafts Continent',
    heroDescription: '',
    mission: '',
    ctaText: '',
  });
  const [isPending, saved, startSave, doneSave] = useSaveState();

  const { data } = useQuery({
    queryKey: ['content', 'about.content'],
    queryFn: () => fetchContent<AboutContent>('about.content'),
  });

  useEffect(() => { if (data?.value) setForm(data.value); }, [data]);

  function update(field: keyof AboutContent, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    startSave();
    try {
      await patchContent('about.content', form);
      queryClient.invalidateQueries({ queryKey: ['content', 'about.content'] });
      doneSave();
    } catch { /* reset */ }
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="space-y-4">
          <div>
            <Label htmlFor="about-title">Hero Title</Label>
            <input id="about-title" type="text" value={form.heroTitle} onChange={(e) => update('heroTitle', e.target.value)} className={inputCls} />
          </div>
          <div>
            <Label htmlFor="about-desc">Hero Description</Label>
            <textarea id="about-desc" rows={4} value={form.heroDescription} onChange={(e) => update('heroDescription', e.target.value)} className={textareaCls} />
          </div>
          <div>
            <Label htmlFor="about-mission">Mission Statement</Label>
            <textarea id="about-mission" rows={4} value={form.mission} onChange={(e) => update('mission', e.target.value)} className={textareaCls} />
          </div>
          <div>
            <Label htmlFor="about-cta">CTA Text</Label>
            <input id="about-cta" type="text" value={form.ctaText} onChange={(e) => update('ctaText', e.target.value)} className={inputCls} />
          </div>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <SaveButton onClick={save} isPending={isPending} saved={saved} label="Save About Page" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Site Settings
// ---------------------------------------------------------------------------

function SiteSettingsTab() {
  const queryClient = useQueryClient();

  const [social, setSocial] = useState<SocialLinks>({ instagram: '', twitter: '', tiktok: '' });
  const [contact, setContact] = useState<ContactInfo>({ email: '', supportHours: '' });
  const [newsletter, setNewsletter] = useState<NewsletterSection>({ heading: '', subheading: '' });
  const [seedConfirm, setSeedConfirm] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const [isPendingSoc, savedSoc, startSoc, doneSoc] = useSaveState();
  const [isPendingCon, savedCon, startCon, doneCon] = useSaveState();
  const [isPendingNL, savedNL, startNL, doneNL] = useSaveState();
  const [isSeedPending, setIsSeedPending] = useState(false);

  const { data: socData } = useQuery({ queryKey: ['content', 'site.socialLinks'], queryFn: () => fetchContent<SocialLinks>('site.socialLinks') });
  const { data: conData } = useQuery({ queryKey: ['content', 'site.contact'], queryFn: () => fetchContent<ContactInfo>('site.contact') });
  const { data: nlData } = useQuery({ queryKey: ['content', 'footer.newsletter'], queryFn: () => fetchContent<NewsletterSection>('footer.newsletter') });

  useEffect(() => { if (socData?.value) setSocial(socData.value); }, [socData]);
  useEffect(() => { if (conData?.value) setContact(conData.value); }, [conData]);
  useEffect(() => { if (nlData?.value) setNewsletter(nlData.value); }, [nlData]);

  async function saveSocial() {
    startSoc();
    try {
      await patchContent('site.socialLinks', social);
      queryClient.invalidateQueries({ queryKey: ['content', 'site.socialLinks'] });
      doneSoc();
    } catch { /* reset */ }
  }

  async function saveContact() {
    startCon();
    try {
      await patchContent('site.contact', contact);
      queryClient.invalidateQueries({ queryKey: ['content', 'site.contact'] });
      doneCon();
    } catch { /* reset */ }
  }

  async function saveNewsletter() {
    startNL();
    try {
      await patchContent('footer.newsletter', newsletter);
      queryClient.invalidateQueries({ queryKey: ['content', 'footer.newsletter'] });
      doneNL();
    } catch { /* reset */ }
  }

  async function seedDefaults() {
    if (!seedConfirm) { setSeedConfirm(true); return; }
    setIsSeedPending(true);
    setSeedConfirm(false);
    try {
      await api.post('/content/seed');
      // Invalidate all content keys
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setSeedDone(true);
      setTimeout(() => setSeedDone(false), 4000);
    } catch { /* swallow */ } finally {
      setIsSeedPending(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Social Links */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-text-primary">Social Links</h3>
        <SectionCard>
          <div className="space-y-3">
            <div>
              <Label htmlFor="soc-ig">Instagram URL</Label>
              <input id="soc-ig" type="url" value={social.instagram} onChange={(e) => setSocial((p) => ({ ...p, instagram: e.target.value }))} className={inputCls} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <Label htmlFor="soc-tw">X / Twitter URL</Label>
              <input id="soc-tw" type="url" value={social.twitter} onChange={(e) => setSocial((p) => ({ ...p, twitter: e.target.value }))} className={inputCls} placeholder="https://x.com/..." />
            </div>
            <div>
              <Label htmlFor="soc-tt">TikTok URL</Label>
              <input id="soc-tt" type="url" value={social.tiktok} onChange={(e) => setSocial((p) => ({ ...p, tiktok: e.target.value }))} className={inputCls} placeholder="https://tiktok.com/@..." />
            </div>
          </div>
        </SectionCard>
        <div className="mt-3 flex justify-end">
          <SaveButton onClick={saveSocial} isPending={isPendingSoc} saved={savedSoc} label="Save Social Links" />
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-text-primary">Contact Info</h3>
        <SectionCard>
          <div className="space-y-3">
            <div>
              <Label htmlFor="con-email">Email Address</Label>
              <input id="con-email" type="email" value={contact.email} onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="con-hours">Support Hours</Label>
              <input id="con-hours" type="text" value={contact.supportHours} onChange={(e) => setContact((p) => ({ ...p, supportHours: e.target.value }))} className={inputCls} placeholder="Mon–Fri 9am–6pm EAT" />
            </div>
          </div>
        </SectionCard>
        <div className="mt-3 flex justify-end">
          <SaveButton onClick={saveContact} isPending={isPendingCon} saved={savedCon} label="Save Contact Info" />
        </div>
      </div>

      {/* Newsletter */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-text-primary">Newsletter Section</h3>
        <SectionCard>
          <div className="space-y-3">
            <div>
              <Label htmlFor="nl-heading">Heading</Label>
              <input id="nl-heading" type="text" value={newsletter.heading} onChange={(e) => setNewsletter((p) => ({ ...p, heading: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="nl-sub">Subheading</Label>
              <input id="nl-sub" type="text" value={newsletter.subheading} onChange={(e) => setNewsletter((p) => ({ ...p, subheading: e.target.value }))} className={inputCls} />
            </div>
          </div>
        </SectionCard>
        <div className="mt-3 flex justify-end">
          <SaveButton onClick={saveNewsletter} isPending={isPendingNL} saved={savedNL} label="Save Newsletter" />
        </div>
      </div>

      {/* Seed Defaults — danger zone */}
      <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-400">Reset to Defaults</h3>
            <p className="mt-1 text-xs text-text-secondary">
              This will overwrite all content keys with the original default values. Existing edits will be lost.
            </p>
            {seedConfirm && (
              <p className="mt-2 text-xs font-semibold text-red-400">
                Are you sure? Click the button again to confirm.
              </p>
            )}
            {seedDone && (
              <p className="mt-2 flex items-center gap-1 text-xs text-green-400">
                <CheckCircle className="h-3.5 w-3.5" /> All content reset to defaults.
              </p>
            )}
          </div>
          <button
            onClick={seedDefaults}
            disabled={isSeedPending}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              seedConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-red-900/60 text-red-400 hover:border-red-600',
              'disabled:opacity-60',
            )}
          >
            {isSeedPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {seedConfirm ? 'Confirm Reset' : 'Seed Defaults'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'banners', label: 'Banners' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'trust', label: 'Trust & Values' },
  { id: 'lifestyle', label: 'Lifestyle Banner' },
  { id: 'about', label: 'About Page' },
  { id: 'settings', label: 'Site Settings' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<TabId>('banners');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Content Management</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Edit banners, announcements, trust points, and other storefront content.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border-dark pb-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-gold text-gold'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'banners' && <BannersTab />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
        {activeTab === 'trust' && <TrustTab />}
        {activeTab === 'lifestyle' && <LifestyleBannerTab />}
        {activeTab === 'about' && <AboutPageTab />}
        {activeTab === 'settings' && <SiteSettingsTab />}
      </div>
    </div>
  );
}
