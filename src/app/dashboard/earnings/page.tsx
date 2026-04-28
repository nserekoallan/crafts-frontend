'use client';

import { useState } from 'react';
import { DollarSign, Wallet, Clock } from 'lucide-react';
import { useArtisanEarnings } from '@/hooks/use-artisan';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RequestPayoutDialog } from '@/components/dashboard/request-payout-dialog';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
}

function StatCard({ icon: Icon, label, value, iconColor }: StatCardProps) {
  return (
    <div className="rounded-lg border border-light-gray bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={cn('rounded-lg p-3', iconColor)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-medium-gray">{label}</p>
          <p className="mt-1 text-2xl font-bold text-charcoal">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return <div className="h-24 animate-pulse rounded-lg border border-light-gray bg-light-gray/50" />;
}

const PAYOUT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

export default function EarningsPage() {
  const { data, isLoading, error } = useArtisanEarnings();
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);

  const balance = data ? Number(data.balance) : 0;
  const payouts = data?.payouts ?? [];
  const totalPaidOut = payouts
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayouts = payouts.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal md:text-3xl">Earnings</h1>
          <p className="mt-1 text-sm text-medium-gray">Track your revenue and payouts</p>
        </div>
        <Button
          variant="primary"
          className="w-full md:w-auto"
          onClick={() => setShowPayoutDialog(true)}
          disabled={balance <= 0}
        >
          Request Payout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={Wallet}
              label="Available Balance"
              value={formatPrice(balance)}
              iconColor="bg-hunter-green"
            />
            <StatCard
              icon={DollarSign}
              label="Total Paid Out"
              value={formatPrice(totalPaidOut)}
              iconColor="bg-satin-gold"
            />
            <StatCard
              icon={Clock}
              label="Pending Payouts"
              value={String(pendingPayouts)}
              iconColor="bg-charcoal"
            />
          </>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold">Payout History</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-light-gray bg-white">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-medium-gray">Loading payouts…</div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-red-500">Failed to load earnings.</div>
          ) : payouts.length === 0 ? (
            <div className="p-8 text-center text-sm text-medium-gray">No payouts yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-light-gray text-xs font-semibold uppercase tracking-wider text-medium-gray">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-light-gray/30">
                    <td className="px-5 py-3 text-medium-gray">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 font-medium">{formatPrice(Number(payout.amount))}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          PAYOUT_STATUS_COLORS[payout.status] ?? 'bg-light-gray text-charcoal',
                        )}
                      >
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showPayoutDialog && (
        <RequestPayoutDialog
          balance={balance}
          onClose={() => setShowPayoutDialog(false)}
        />
      )}
    </div>
  );
}
