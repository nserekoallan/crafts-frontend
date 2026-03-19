'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { PRODUCTS, CATEGORY_FILTERS, PRICE_RANGES } from '@/lib/mock-data';
import type { Product } from '@/lib/mock-data';

/**
 * Shop page with sidebar filters and product grid.
 * Falls back to mock data when the API is unavailable.
 */
export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');

  const { data: products } = useQuery<Product[]>({
    queryKey: ['products', selectedCategory, selectedPrice],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: Product[] }>('/products');
        return res.data;
      } catch {
        return PRODUCTS;
      }
    },
  });

  const filtered = (products ?? PRODUCTS).filter((p) => {
    if (selectedCategory !== 'All') {
      const catMatch =
        p.category === selectedCategory ||
        p.category === selectedCategory.replace(' & ', ' ');
      if (!catMatch) return false;
    }
    if (selectedPrice === 'Under UGX 150K' && p.price >= 150000) return false;
    if (selectedPrice === 'UGX 150K - 300K' && (p.price < 150000 || p.price > 300000)) return false;
    if (selectedPrice === 'UGX 300K - 600K' && (p.price < 300000 || p.price > 600000)) return false;
    if (selectedPrice === 'Over UGX 600K' && p.price <= 600000) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="text-3xl font-bold">Shop</h1>
      <p className="mt-1 text-medium-gray">{filtered.length} handcrafted products</p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-56">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-medium-gray">Category</h3>
              <div className="mt-2 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {CATEGORY_FILTERS.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="justify-start"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-medium-gray">Price Range</h3>
              <div className="mt-2 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {PRICE_RANGES.map((range) => (
                  <Button
                    key={range}
                    variant={selectedPrice === range ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPrice(range)}
                    className="justify-start"
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-medium-gray">No products found matching your filters.</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => { setSelectedCategory('All'); setSelectedPrice('All'); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
