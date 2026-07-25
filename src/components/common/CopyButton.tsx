import React, { useState, useCallback } from 'react';
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ButtonProps } from "@/components/ui/button";

interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  textToCopy?: string;
  /** @deprecated use textToCopy */
  text?: string;
  successMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
  copiedText?: string;
  copyText?: string;
  onCopySuccess?: (text: string) => void;
  onCopyError?: (error: Error) => void;
  showIcon?: boolean;
  allowEmpty?: boolean;
  resetTimeout?: number;
  // External state management (optional - if provided, component will use this instead of internal state)
  copied?: boolean;
  onCopiedChange?: (copied: boolean) => void;
  disableAutoReset?: boolean; // Disable auto-reset timeout (useful when managing reset externally)
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      textToCopy,
      text,
      successMessage,
      errorMessage = "Failed to copy to clipboard",
      emptyMessage = "Nothing to copy",
      copiedText = "Copied",
      copyText = "Copy",
      onCopySuccess,
      onCopyError,
      showIcon = true,
      allowEmpty = false,
      resetTimeout = 2000,
      className,
      variant,
      size = "sm",
      children,
      copied: externalCopied,
      onCopiedChange,
      disableAutoReset = false,
      ...props
    },
    ref
  ) => {
    const resolvedText = textToCopy ?? text ?? "";
    const [internalCopied, setInternalCopied] = useState(false);
    const { toast } = useToast();

    // Use external state if provided, otherwise use internal state
    const isControlled = externalCopied !== undefined && onCopiedChange !== undefined;
    const copied = isControlled ? externalCopied : internalCopied;
    
    const setCopied = useCallback((value: boolean) => {
      if (isControlled) {
        onCopiedChange?.(value);
      } else {
        setInternalCopied(value);
      }
    }, [isControlled, onCopiedChange]);

    const handleCopy = useCallback(async () => {
      if (!resolvedText && !allowEmpty) {
        toast({
          title: "Nothing to copy",
          description: emptyMessage,
          variant: "destructive",
        });
        return;
      }

      try {
        await navigator.clipboard.writeText(resolvedText || '');
        setCopied(true);
        
        toast({
          title: "Copied!",
          description: successMessage || "Text copied to clipboard",
        });

        onCopySuccess?.(resolvedText);

        if (!disableAutoReset) {
          setTimeout(() => {
            setCopied(false);
          }, resetTimeout);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Failed to copy text:', error);
        
        toast({
          title: "Copy failed",
          description: errorMessage,
          variant: "destructive",
        });

        onCopyError?.(error);
      }
    }, [
      resolvedText,
      allowEmpty,
      emptyMessage,
      successMessage,
      errorMessage,
      resetTimeout,
      disableAutoReset,
      toast,
      onCopySuccess,
      onCopyError,
      setCopied,
    ]);

    const buttonVariant = variant !== undefined 
      ? variant 
      : (copied ? "default" : "outline");

    return (
      <Button
        ref={ref}
        onClick={handleCopy}
        variant={buttonVariant}
        size={size}
        className={cn(
          "transition-all duration-200",
          "sm:flex-shrink-0", // Prevent shrinking on mobile
          className
        )}
        {...props}
      >
        {showIcon && (
          copied ? (
            <Check className="h-4 w-4 sm:mr-2" />
          ) : (
            <Copy className="h-4 w-4 sm:mr-2" />
          )
        )}
        <span className="hidden sm:inline">
          {copied ? copiedText : copyText}
        </span>
        {children}
      </Button>
    );
  }
);

CopyButton.displayName = "CopyButton";

export default CopyButton;
