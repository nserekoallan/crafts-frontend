'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { QC_QUEUE_ITEMS, type QcItem } from '@/lib/mock-data';

type QcPriority = QcItem['priority'];
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * QcPage - Quality Control queue management interface
 */
export default function QcPage() {
  const [priorityFilter, setPriorityFilter] = useState<QcPriority | 'all'>('all');

  /**
   * Filtered QC items based on priority
   */
  const filteredItems = useMemo(() => {
    if (priorityFilter === 'all') return QC_QUEUE_ITEMS;
    return QC_QUEUE_ITEMS.filter((item) => item.priority === priorityFilter);
  }, [priorityFilter]);

  /**
   * Handle approve item
   * @param {string} itemId - QC item ID
   * @param {string} productName - Product name
   */
  const handleApprove = (itemId: string, productName: string) => {
    alert(`Approve "${productName}" (${itemId})`);
  };

  /**
   * Handle reject item
   * @param {string} itemId - QC item ID
   * @param {string} productName - Product name
   */
  const handleReject = (itemId: string, productName: string) => {
    alert(`Reject "${productName}" (${itemId})`);
  };

  /**
   * Handle request changes
   * @param {string} itemId - QC item ID
   * @param {string} productName - Product name
   */
  const handleRequestChanges = (itemId: string, productName: string) => {
    alert(`Request changes for "${productName}" (${itemId})`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Quality Control Queue</h1>
        <p className="text-medium-gray">Review and approve products before listing</p>
      </div>

      {/* Priority Filter */}
      <div className="bg-white rounded-xl border border-light-gray p-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'urgent', 'normal'] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => setPriorityFilter(priority)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                priorityFilter === priority
                  ? 'bg-hunter-green text-white'
                  : 'bg-light-gray text-charcoal hover:bg-medium-gray/20'
              )}
            >
              {priority === 'all'
                ? 'All Items'
                : priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-medium-gray">
        {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} in queue
      </div>

      {/* QC Queue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-light-gray p-6 space-y-4"
          >
            {/* Header with Priority */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-charcoal mb-1">{item.productName}</h3>
                <p className="text-sm text-medium-gray">by {item.artisanName}</p>
              </div>
              <Badge
                variant={item.priority === 'urgent' ? 'cancelled' : 'default'}
                className={cn(
                  item.priority === 'urgent'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                )}
              >
                {item.priority}
              </Badge>
            </div>

            {/* Product Image */}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-light-gray">
              <Image
                src={item.productImage}
                alt={item.productName}
                fill
                className="object-cover"
              />
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-medium-gray">Submitted:</span>
                <span className="font-medium text-charcoal">
                  {new Date(item.submittedDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-medium-gray">Status:</span>
                <Badge
                  variant={item.status === 'pending' ? 'pending' : 'processing'}
                >
                  {item.status === 'in_review' ? 'In Review' : 'Pending'}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white border-green-600"
                onClick={() => handleApprove(item.id, item.productName)}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => handleRequestChanges(item.id, item.productName)}
              >
                Request Changes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleReject(item.id, item.productName)}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-xl border border-light-gray p-12 text-center">
          <p className="text-medium-gray">No items in queue with this priority</p>
        </div>
      )}
    </div>
  );
}
