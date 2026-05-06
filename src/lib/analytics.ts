// Analytics event tracking — swap provider by changing the `_send` function.
// In dev: events log to console. In prod: wire to PostHog, GA4, Mixpanel, etc.

export type AnalyticsEvent =
  | { name: 'product_viewed'; props: { product_id: string; product_name: string; artisan_id?: string; price?: number; category?: string } }
  | { name: 'artisan_profile_viewed'; props: { artisan_id: string; artisan_name: string } }
  | { name: 'search_performed'; props: { query: string; results_count?: number; filters_used?: string[] } }
  | { name: 'cart_item_added'; props: { product_id: string; product_name: string; price: number; quantity: number } }
  | { name: 'checkout_started'; props: { cart_total: number; item_count: number } }
  | { name: 'order_placed'; props: { order_id: string; order_total: number; item_count: number } }
  | { name: 'featured_requested'; props: { product_id: string; product_name?: string } }
  | { name: 'product_created'; props: { product_name: string; price?: number } };

type EventName = AnalyticsEvent['name'];
type EventProps<N extends EventName> = Extract<AnalyticsEvent, { name: N }>['props'];

function _send(name: string, props: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[analytics]', name, props);
  }
  // Production: uncomment one of these after setting up the provider:
  // window.posthog?.capture(name, props);
  // window.gtag?.('event', name, props);
  // window.analytics?.track(name, props);
}

export function track<N extends EventName>(name: N, props: EventProps<N>) {
  if (typeof window === 'undefined') return;
  _send(name, props as Record<string, unknown>);
}
