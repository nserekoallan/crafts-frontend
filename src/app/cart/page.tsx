'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { INITIAL_CART_ITEMS } from '@/lib/mock-data';
import type { CartItem } from '@/lib/mock-data';

/**
 * Cart page with item list, quantity controls, and checkout summary.
 */
export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);

  function updateQuantity(id: string, delta: number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <h1 className="text-3xl font-bold">Your Cart</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-medium-gray">Your cart is empty.</p>
          <Link href="/shop">
            <Button variant="primary" className="mt-4">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border border-light-gray bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.name} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal">{item.name}</h3>
                <p className="text-sm text-medium-gray">by {item.artisanName}</p>
                <p className="mt-1 font-heading font-bold text-hunter-green">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-light-gray">
                  <button className="flex h-8 w-8 items-center justify-center hover:bg-light-gray" onClick={() => updateQuantity(item.id, -1)}>
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button className="flex h-8 w-8 items-center justify-center hover:bg-light-gray" onClick={() => updateQuantity(item.id, 1)}>
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button className="p-2 text-medium-gray hover:text-red-500" onClick={() => removeItem(item.id)} aria-label="Remove item">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="rounded-xl border border-light-gray bg-white p-6">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">Subtotal</span>
              <span className="font-heading font-bold text-hunter-green">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-sm text-medium-gray">Shipping and taxes calculated at checkout.</p>
            <Button variant="gold" size="lg" className="mt-4 w-full">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
