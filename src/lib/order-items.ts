/** Order item as returned by GET /orders and GET /orders/:id. Decimals arrive as strings. */
export interface CustomerOrderItem {
  id: string;
  quantity: number;
  price: number | string;
  artisanAmount: number | string | null;
  platformAmount: number | string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    images?: Array<{ url: string }>;
  };
}

export const PAID_ORDER_STATUSES = ['PAID', 'PROCESSING', 'QC_PASSED', 'SHIPPED', 'DELIVERED'];

// Per-tab marker for the order this checkout created. sessionStorage survives the
// round trip to a card provider's hosted page in the same tab.
const CHECKOUT_ORDER_KEY = 'cc_checkout_order';

export function rememberCheckoutOrder(orderId: string): void {
  try {
    sessionStorage.setItem(CHECKOUT_ORDER_KEY, orderId);
  } catch {
    // Storage unavailable (private mode): the cart simply isn't auto-cleared.
  }
}

/**
 * True exactly once, for the order this tab's checkout created — so revisiting
 * an old confirmation page never empties a cart the customer has since refilled.
 */
export function consumeCheckoutOrder(orderId: string): boolean {
  try {
    if (sessionStorage.getItem(CHECKOUT_ORDER_KEY) !== orderId) return false;
    sessionStorage.removeItem(CHECKOUT_ORDER_KEY);
    return true;
  } catch {
    return false;
  }
}

export function orderItemImage(item: CustomerOrderItem): string | null {
  return item.product.images?.[0]?.url ?? null;
}

/**
 * What the customer paid for this line. `price` is the artisan's price; the
 * customer was charged artisanAmount + platformAmount (artisan price + markup).
 */
export function orderItemLineTotal(item: CustomerOrderItem): number {
  if (item.artisanAmount == null) return Number(item.price) * item.quantity;
  return Number(item.artisanAmount) + Number(item.platformAmount ?? 0);
}
