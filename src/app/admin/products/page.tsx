'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { PRODUCTS } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, cn } from '@/lib/utils';

/**
 * Get product status based on ID for demo purposes
 * @param {string} id - Product ID
 */
function getProductStatus(id: string): 'flagged' | 'under_review' | 'approved' {
  const numId = parseInt(id.replace('prod-', ''));
  if (numId % 5 === 0) return 'flagged';
  if (numId % 3 === 0) return 'under_review';
  return 'approved';
}

/**
 * ProductsPage - Product management interface for administrators
 */
export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  /**
   * Get unique categories from products
   */
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(PRODUCTS.map((p) => p.category)));
    return ['all', ...uniqueCategories];
  }, []);

  /**
   * Filtered products based on search and category
   */
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  /**
   * Handle view product
   * @param {string} productId - Product ID
   */
  const handleViewProduct = (productId: string) => {
    alert(`View product ${productId}`);
  };

  /**
   * Handle flag product
   * @param {string} productId - Product ID
   * @param {string} productName - Product name
   */
  const handleFlagProduct = (productId: string, productName: string) => {
    alert(`Flag product "${productName}" (${productId}) for review`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Products</h1>
        <p className="text-medium-gray">Review and manage all marketplace products</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-light-gray p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-medium-gray" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-hunter-green focus:border-transparent"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                categoryFilter === category
                  ? 'bg-hunter-green text-white'
                  : 'bg-light-gray text-charcoal hover:bg-medium-gray/20'
              )}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-medium-gray">
        Showing {filteredProducts.length} of {PRODUCTS.length} products
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-light-gray overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-gray/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Artisan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {filteredProducts.map((product) => {
                const status = getProductStatus(product.id);
                return (
                  <tr key={product.id} className="hover:bg-light-gray/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                        <span className="text-sm font-medium text-charcoal">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-medium-gray">
                      {product.artisanName}
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-charcoal">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge
                        variant={
                          status === 'approved'
                            ? 'delivered'
                            : status === 'under_review'
                            ? 'processing'
                            : 'cancelled'
                        }
                      >
                        {status === 'under_review'
                          ? 'Under Review'
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProduct(product.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFlagProduct(product.id, product.name)}
                      >
                        Flag
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredProducts.map((product) => {
          const status = getProductStatus(product.id);
          return (
            <div key={product.id} className="bg-white rounded-xl border border-light-gray p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-charcoal mb-1">{product.name}</div>
                  <div className="text-sm text-medium-gray mb-2">
                    by {product.artisanName}
                  </div>
                  <Badge
                    variant={
                      status === 'approved'
                        ? 'delivered'
                        : status === 'under_review'
                        ? 'processing'
                        : 'cancelled'
                    }
                  >
                    {status === 'under_review'
                      ? 'Under Review'
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-medium-gray">Category:</span>
                  <div className="font-medium text-charcoal">{product.category}</div>
                </div>
                <div>
                  <span className="text-medium-gray">Price:</span>
                  <div className="font-semibold text-charcoal">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewProduct(product.id)}
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleFlagProduct(product.id, product.name)}
                >
                  Flag
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl border border-light-gray p-12 text-center">
          <p className="text-medium-gray">No products found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
