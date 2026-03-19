'use client';

import { BarChart3, Users, PieChart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

/**
 * Report card configuration
 */
const REPORTS = [
  {
    id: 'sales',
    icon: BarChart3,
    title: 'Sales Report',
    description: 'Comprehensive sales data across all channels',
    color: 'text-hunter-green bg-hunter-green/10',
  },
  {
    id: 'artisan-performance',
    icon: Users,
    title: 'Artisan Performance',
    description: 'Individual artisan metrics and rankings',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    id: 'category-analytics',
    icon: PieChart,
    title: 'Category Analytics',
    description: 'Product category performance breakdown',
    color: 'text-satin-gold bg-satin-gold/10',
  },
  {
    id: 'revenue-by-region',
    icon: MapPin,
    title: 'Revenue by Region',
    description: 'Geographic revenue distribution',
    color: 'text-saddle-brown bg-saddle-brown/10',
  },
] as const;

/**
 * Sample monthly revenue data for visualization
 */
const MONTHLY_DATA = [
  { month: 'Week 1', revenue: 12500000 },
  { month: 'Week 2', revenue: 18200000 },
  { month: 'Week 3', revenue: 15800000 },
  { month: 'Week 4', revenue: 21300000 },
  { month: 'Week 5', revenue: 19400000 },
  { month: 'Week 6', revenue: 24100000 },
] as const;

/**
 * ReportsPage - Platform reports and analytics interface
 */
export default function ReportsPage() {
  /**
   * Handle generate report
   * @param {string} reportId - Report ID
   * @param {string} reportTitle - Report title
   */
  const handleGenerateReport = (reportId: string, reportTitle: string) => {
    alert(`Generate ${reportTitle} report`);
  };

  /**
   * Calculate max revenue for bar chart scaling
   */
  const maxRevenue = Math.max(...MONTHLY_DATA.map((d) => d.revenue));

  /**
   * Calculate summary statistics
   */
  const totalRevenue = MONTHLY_DATA.reduce((sum, d) => sum + d.revenue, 0);
  const averageOrderValue = totalRevenue / 156; // Mock: 156 orders

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Reports</h1>
        <p className="text-medium-gray">Generate and view platform reports</p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-light-gray p-6 space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${report.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-charcoal mb-1">{report.title}</h3>
                  <p className="text-sm text-medium-gray">{report.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-medium-gray">Date Range: March 2026</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleGenerateReport(report.id, report.title)}
                >
                  Generate Report
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sample Report Visualization */}
      <div className="bg-white rounded-xl border border-light-gray overflow-hidden">
        <div className="p-6 border-b border-light-gray">
          <h2 className="text-xl font-bold text-charcoal mb-1">
            Monthly Revenue — March 2026
          </h2>
          <p className="text-sm text-medium-gray">Sample report visualization</p>
        </div>

        <div className="p-6">
          {/* Bar Chart */}
          <div className="space-y-4 mb-8">
            {MONTHLY_DATA.map((data) => {
              const percentage = (data.revenue / maxRevenue) * 100;
              return (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-charcoal">{data.month}</span>
                    <span className="font-semibold text-charcoal">
                      {formatPrice(data.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-light-gray rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-hunter-green h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-light-gray">
            <div className="text-center md:text-left">
              <div className="text-sm text-medium-gray mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-charcoal">
                {formatPrice(totalRevenue)}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-sm text-medium-gray mb-1">Average Order Value</div>
              <div className="text-2xl font-bold text-charcoal">
                {formatPrice(averageOrderValue)}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-sm text-medium-gray mb-1">Top Category</div>
              <div className="text-2xl font-bold text-charcoal">Baskets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-light-gray p-6">
          <h3 className="font-bold text-charcoal mb-4">Top Performing Artisans</h3>
          <div className="space-y-3">
            {[
              { name: 'Sarah Namugambe', revenue: 5200000 },
              { name: 'James Ochieng', revenue: 4800000 },
              { name: 'Grace Akinyi', revenue: 4100000 },
            ].map((artisan, idx) => (
              <div
                key={artisan.name}
                className="flex items-center justify-between py-2 border-b border-light-gray last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-hunter-green/10 text-hunter-green text-sm font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-charcoal">{artisan.name}</span>
                </div>
                <span className="font-semibold text-charcoal">
                  {formatPrice(artisan.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-light-gray p-6">
          <h3 className="font-bold text-charcoal mb-4">Category Distribution</h3>
          <div className="space-y-3">
            {[
              { category: 'Baskets', percentage: 35 },
              { category: 'Pottery', percentage: 28 },
              { category: 'Textiles', percentage: 22 },
              { category: 'Jewelry', percentage: 15 },
            ].map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-charcoal">{item.category}</span>
                  <span className="font-semibold text-charcoal">{item.percentage}%</span>
                </div>
                <div className="w-full bg-light-gray rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-satin-gold h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
