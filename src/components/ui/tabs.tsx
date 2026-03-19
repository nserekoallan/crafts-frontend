'use client';

import { cn } from '@/lib/utils';

interface Tab {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

/**
 * Horizontal tab navigation component with active state indicator.
 */
export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="border-b border-light-gray">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'text-hunter-green'
                : 'text-medium-gray hover:text-charcoal',
            )}
          >
            {tab.label}
            {activeTab === tab.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-hunter-green" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
