'use client';

import React, { useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ButtonProps } from '@/components/ui/button';

type Props = Omit<ButtonProps, 'onClick'> & {
  textToCopy?: string;
  text?: string;
  successMessage?: string;
  emptyMessage?: string;
  resetTimeout?: number;
};

/**
 * GPU-friendly copy control: icon morphs Copy → Check via opacity/transform only.
 */
export default function AnimatedCopyButton({
  textToCopy,
  text,
  successMessage = 'Copied to clipboard!',
  emptyMessage = 'Nothing to copy',
  resetTimeout = 2000,
  className,
  children,
  ...props
}: Props) {
  const [copied, setCopied] = useState(false);
  const payload = textToCopy ?? text ?? '';

  const handleCopy = useCallback(async () => {
    if (!payload) {
      toast.error(emptyMessage);
      return;
    }
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast.success(successMessage);
      window.setTimeout(() => setCopied(false), resetTimeout);
    } catch {
      toast.error('Copy failed');
    }
  }, [payload, emptyMessage, successMessage, resetTimeout]);

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      className={cn(
        'relative active:scale-[0.98] transition-transform duration-100 ease-out',
        className
      )}
      {...props}
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <Copy
          className={cn(
            'absolute h-4 w-4 transition-all duration-200 ease-out',
            copied ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
          )}
          aria-hidden
        />
        <Check
          className={cn(
            'absolute h-4 w-4 text-success transition-all duration-200 ease-out',
            copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          )}
          aria-hidden
        />
      </span>
      {children ?? (copied ? 'Copied' : 'Copy')}
    </Button>
  );
}
