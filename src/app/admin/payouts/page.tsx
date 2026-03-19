'use client';

import { useMemo } from 'react';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';
import { PAYOUT_REQUESTS, type PayoutRequest } from '@/lib/mock-data';

type PayoutStatus = PayoutRequest['status'];
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

/**
 * PayoutsPage - Artisan payout management interface
 */
export default function PayoutsPage() {
  /**
   * Calculate summary statistics
   */
  const summaryStats = useMemo(() => {
    const pending = PAYOUT_REQUESTS.filter((p) => p.status === 'pending').reduce(
      (sum, p) => sum + p.amount,
      0
    );
    const processing = PAYOUT_REQUESTS.filter((p) => p.status === 'processing').reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // Completed this month (using current date for demo)
    const now = new Date();
    const thisMonth = PAYOUT_REQUESTS.filter(
      (p) =>
        p.status === 'completed' &&
        p.processedDate &&
        new Date(p.processedDate).getMonth() === now.getMonth() &&
        new Date(p.processedDate).getFullYear() === now.getFullYear()
    ).reduce((sum, p) => sum + p.amount, 0);

    return { pending, processing, completed: thisMonth };
  }, []);

  /**
   * Handle process payout
   * @param {string} payoutId - Payout request ID
   * @param {string} artisanName - Artisan name
   */
  const handleProcess = (payoutId: string, artisanName: string) => {
    alert(`Process payout for ${artisanName} (${payoutId})`);
  };

  /**
   * Handle hold payout
   * @param {string} payoutId - Payout request ID
   * @param {string} artisanName - Artisan name
   */
  const handleHold = (payoutId: string, artisanName: string) => {
    alert(`Put on hold payout for ${artisanName} (${payoutId})`);
  };

  /**
   * Handle complete payout
   * @param {string} payoutId - Payout request ID
   * @param {string} artisanName - Artisan name
   */
  const handleComplete = (payoutId: string, artisanName: string) => {
    alert(`Complete payout for ${artisanName} (${payoutId})`);
  };

  /**
   * Get badge variant for payout status
   * @param {PayoutStatus} status - Payout status
   */
  const getStatusVariant = (status: PayoutStatus) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'completed':
        return 'delivered';
      case 'on_hold':
        return 'cancelled';
      default:
        return 'default';
    }
  };

  /**
   * Get status display text
   * @param {PayoutStatus} status - Payout status
   */
  const getStatusText = (status: PayoutStatus): string => {
    if (status === 'on_hold') return 'On Hold';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Payouts</h1>
        <p className="text-medium-gray">Manage artisan payout requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-light-gray p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-medium-gray mb-1">Total Pending</div>
              <div className="text-2xl font-bold text-charcoal">
                {formatPrice(summaryStats.pending)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-light-gray p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-medium-gray mb-1">Processing</div>
              <div className="text-2xl font-bold text-charcoal">
                {formatPrice(summaryStats.processing)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-light-gray p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-medium-gray mb-1">Completed This Month</div>
              <div className="text-2xl font-bold text-charcoal">
                {formatPrice(summaryStats.completed)}
              </div>
            </div>
          </div>
        </div>
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
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Processed
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-medium-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {PAYOUT_REQUESTS.map((payout) => (
                <tr key={payout.id} className="hover:bg-light-gray/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-charcoal">
                    {payout.artisanName}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-charcoal">
                    {formatPrice(payout.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant={getStatusVariant(payout.status)}>
                      {getStatusText(payout.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-medium-gray">
                    {new Date(payout.requestedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-medium-gray">
                    {payout.processedDate
                      ? new Date(payout.processedDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    {payout.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleProcess(payout.id, payout.artisanName)}
                      >
                        Process
                      </Button>
                    )}
                    {payout.status === 'processing' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHold(payout.id, payout.artisanName)}
                        >
                          Hold
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleComplete(payout.id, payout.artisanName)}
                        >
                          Complete
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {PAYOUT_REQUESTS.map((payout) => (
          <div key={payout.id} className="bg-white rounded-xl border border-light-gray p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-charcoal mb-1">
                  {payout.artisanName}
                </div>
                <div className="text-lg font-bold text-charcoal">
                  {formatPrice(payout.amount)}
                </div>
              </div>
              <Badge variant={getStatusVariant(payout.status)}>
                {getStatusText(payout.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-medium-gray">Requested:</span>
                <div className="font-medium text-charcoal">
                  {new Date(payout.requestedDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-medium-gray">Processed:</span>
                <div className="font-medium text-charcoal">
                  {payout.processedDate
                    ? new Date(payout.processedDate).toLocaleDateString()
                    : '-'}
                </div>
              </div>
            </div>

            {(payout.status === 'pending' || payout.status === 'processing') && (
              <div className="flex gap-2 pt-2">
                {payout.status === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleProcess(payout.id, payout.artisanName)}
                  >
                    Process
                  </Button>
                )}
                {payout.status === 'processing' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleHold(payout.id, payout.artisanName)}
                    >
                      Hold
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleComplete(payout.id, payout.artisanName)}
                    >
                      Complete
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
