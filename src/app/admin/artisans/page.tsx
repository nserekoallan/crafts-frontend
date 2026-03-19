'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { ARTISANS } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type VerificationFilter = 'all' | 'verified' | 'pending' | 'suspended';

/**
 * ArtisansPage - Artisan management interface for administrators
 */
export default function ArtisansPage() {
  const [filter, setFilter] = useState<VerificationFilter>('all');

  /**
   * Filtered artisans based on verification filter
   * Note: All artisans default to verified for demo purposes
   */
  const filteredArtisans = useMemo(() => {
    if (filter === 'all') return ARTISANS;
    // For demo, show all as verified, but filter UI is functional
    if (filter === 'verified') return ARTISANS;
    return [];
  }, [filter]);

  /**
   * Handle view artisan profile
   * @param {string} artisanId - Artisan ID
   */
  const handleViewProfile = (artisanId: string) => {
    alert(`View profile for artisan ${artisanId}`);
  };

  /**
   * Handle suspend artisan
   * @param {string} artisanId - Artisan ID
   * @param {string} artisanName - Artisan name
   */
  const handleSuspend = (artisanId: string, artisanName: string) => {
    alert(`Suspend artisan ${artisanName} (${artisanId})`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Artisans</h1>
        <p className="text-medium-gray">Manage artisan accounts and verifications</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-light-gray p-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'verified', 'pending', 'suspended'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === status
                  ? 'bg-hunter-green text-white'
                  : 'bg-light-gray text-charcoal hover:bg-medium-gray/20'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-medium-gray">
        Showing {filteredArtisans.length} artisan{filteredArtisans.length !== 1 ? 's' : ''}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-light-gray overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-gray/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Artisan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Craft
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Products
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
              {filteredArtisans.map((artisan) => (
                <tr key={artisan.id} className="hover:bg-light-gray/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={artisan.avatarUrl}
                        alt={artisan.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-charcoal">
                        {artisan.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-medium-gray">
                    {artisan.region}, {artisan.country}
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal">
                    {artisan.craft}
                  </td>
                  <td className="px-6 py-4 text-sm text-medium-gray">
                    {artisan.products}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant="delivered">Verified</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProfile(artisan.id)}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSuspend(artisan.id, artisan.name)}
                    >
                      Suspend
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredArtisans.map((artisan) => (
          <div key={artisan.id} className="bg-white rounded-xl border border-light-gray p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Image
                src={artisan.avatarUrl}
                alt={artisan.name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-charcoal mb-1">{artisan.name}</div>
                <div className="text-sm text-medium-gray">
                  {artisan.region}, {artisan.country}
                </div>
              </div>
              <Badge variant="delivered">Verified</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-medium-gray">Craft:</span>
                <div className="font-medium text-charcoal">{artisan.craft}</div>
              </div>
              <div>
                <span className="text-medium-gray">Products:</span>
                <div className="font-medium text-charcoal">{artisan.products}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => handleViewProfile(artisan.id)}
              >
                View Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => handleSuspend(artisan.id, artisan.name)}
              >
                Suspend
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredArtisans.length === 0 && (
        <div className="bg-white rounded-xl border border-light-gray p-12 text-center">
          <p className="text-medium-gray">No artisans found with this status</p>
        </div>
      )}
    </div>
  );
}
