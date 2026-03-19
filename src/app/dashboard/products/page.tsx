'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Plus, Search } from 'lucide-react';
import { PRODUCTS, type Product } from '@/lib/mock-data';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type ProductStatus = 'active' | 'draft' | 'out_of_stock';

interface ProductWithStatus extends Product {
  status: ProductStatus;
  stock: number;
}

/**
 * Derives product status from product ID using a deterministic formula.
 */
function getProductStatus(id: string): ProductStatus {
  const n = parseInt(id, 10);
  if (n % 5 === 0) return 'out_of_stock';
  if (n % 3 === 0) return 'draft';
  return 'active';
}

/**
 * Derives stock count from product ID using a deterministic formula.
 */
function getStockCount(id: string): number {
  return ((parseInt(id, 10) * 7) % 50) + 5;
}

/**
 * Returns badge variant for product status.
 */
function getStatusBadgeVariant(status: ProductStatus): 'default' | 'pending' | 'cancelled' {
  if (status === 'active') return 'default';
  if (status === 'draft') return 'pending';
  return 'cancelled';
}

/**
 * Returns human-readable status label.
 */
function getStatusLabel(status: ProductStatus): string {
  if (status === 'active') return 'Active';
  if (status === 'draft') return 'Draft';
  return 'Out of Stock';
}

const STATUS_FILTERS: Array<'all' | ProductStatus> = ['all', 'active', 'draft', 'out_of_stock'];

/**
 * Artisan product management page with search, filtering, and responsive layout.
 */
export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');

  // Enrich products with status and stock
  const productsWithStatus: ProductWithStatus[] = useMemo(
    () =>
      PRODUCTS.map((product) => ({
        ...product,
        status: getProductStatus(product.id),
        stock: getStockCount(product.id),
      })),
    [],
  );

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    return productsWithStatus.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [productsWithStatus, searchTerm, statusFilter]);

  /**
   * Handles the Add Product button click.
   */
  function handleAddProduct() {
    alert('Add Product functionality coming soon!');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal md:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-medium-gray">Manage your product listings</p>
        </div>
        <Button variant="primary" onClick={handleAddProduct} className="w-full md:w-auto">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-medium-gray" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                statusFilter === filter
                  ? 'bg-hunter-green text-white'
                  : 'bg-light-gray text-charcoal hover:bg-charcoal-light',
              )}
            >
              {filter === 'all' ? 'All' : filter === 'out_of_stock' ? 'Out of Stock' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table (Desktop) */}
      <div className="hidden overflow-hidden rounded-lg border border-light-gray lg:block">
        <table className="w-full">
          <thead className="bg-light-gray/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray bg-white">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-medium-gray">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-light-gray/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-light-gray">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                      </div>
                      <span className="font-medium text-charcoal">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-medium-gray">{product.category}</td>
                  <td className="px-4 py-3 text-charcoal">{product.stock}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariant(product.status)}>{getStatusLabel(product.status)}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Products Grid (Mobile) */}
      <div className="grid gap-4 lg:hidden">
        {filteredProducts.length === 0 ? (
          <div className="rounded-lg border border-light-gray bg-white px-4 py-8 text-center text-sm text-medium-gray">
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="rounded-lg border border-light-gray bg-white p-4 shadow-sm">
              <div className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-light-gray">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-charcoal">{product.name}</h3>
                    <Badge variant={getStatusBadgeVariant(product.status)}>{getStatusLabel(product.status)}</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-charcoal">
                      <span className="font-medium">{formatPrice(product.price)}</span>
                    </p>
                    <p className="text-medium-gray">{product.category}</p>
                    <p className="text-medium-gray">Stock: {product.stock}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
