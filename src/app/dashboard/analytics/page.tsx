'use client';

import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="mt-1 text-sm text-medium-gray">Insights about your shop&apos;s performance</p>

      <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-hunter-green/10">
          <BarChart3 className="h-8 w-8 text-hunter-green" />
        </div>
        <h2 className="text-xl font-semibold text-charcoal">Analytics Coming Soon</h2>
        <p className="max-w-sm text-sm text-medium-gray">
          Detailed traffic, conversion, and revenue analytics will be available here once your shop
          accumulates data.
        </p>
      </div>
    </div>
  );
}
