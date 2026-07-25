'use client';

import React from 'react';
import CopyButton from '@/components/common/CopyButton';

interface IpInfoRowProps {
  label: string;
  value: string | number | boolean | null | undefined;
  isCopiable?: boolean;
}

const IpInfoRow: React.FC<IpInfoRowProps> = ({ label, value, isCopiable = false }) => {
  if (value === null || typeof value === 'undefined' || value === '') {
    return null;
  }

  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-y-1.5 md:gap-y-0 md:gap-x-4 py-3 md:py-2 border-b border-border/20 last:border-b-0 w-full">
      <span className="text-xs md:text-sm font-semibold text-muted-foreground md:font-normal md:pt-1 flex-shrink-0 md:w-[120px] md:min-w-[120px]">
        {label}
        <span className="hidden md:inline">:</span>
      </span>
      <div className="flex-1 min-w-0 w-full flex items-start gap-2 overflow-hidden">
        {isCopiable ? (
          <>
            <span className="font-mono text-xs md:text-sm break-all break-words flex-1 min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{displayValue}</span>
            <CopyButton
              textToCopy={displayValue}
              successMessage={`${label} copied to clipboard.`}
              variant="ghost"
              size="sm"
              className="h-auto p-1 flex-shrink-0 mt-0.5"
              copyText=""
              showIcon={true}
            />
          </>
        ) : (
          <span className="text-xs md:text-sm font-medium text-left break-all break-words flex-1 min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{displayValue}</span>
        )}
      </div>
    </div>
  );
};

export default IpInfoRow;
