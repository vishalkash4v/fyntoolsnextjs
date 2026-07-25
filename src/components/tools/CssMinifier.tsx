'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Minimize } from 'lucide-react';
import { Label } from '@/components/ui/label';
import CopyButton from '@/components/common/CopyButton';

const CssMinifier: React.FC = () => {
  const [inputCss, setInputCss] = useState('');
  const [outputCss, setOutputCss] = useState('');
  const { toast } = useToast();

  const minifyCss = () => {
    if (!inputCss.trim()) {
      toast({
        title: 'No CSS',
        description: 'Please enter CSS code to minify.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let minified = inputCss
        // Remove comments (handles both /* */ and // comments)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        
        // Remove all whitespace (spaces, tabs, newlines) and replace with single space
        .replace(/\s+/g, ' ')
        
        // Remove spaces around specific characters (order matters)
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*>\s*/g, '>')
        .replace(/\s*\+\s*/g, '+')
        .replace(/\s*~\s*/g, '~')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*\[\s*/g, '[')
        .replace(/\s*\]\s*/g, ']')
        .replace(/\s*=\s*/g, '=')
        
        // Remove semicolon before closing brace
        .replace(/;\s*}/g, '}')
        
        // Remove redundant semicolons (double or more semicolons)
        .replace(/;;+/g, ';')
        
        // Color optimization: Convert #ffffff to #fff, #000000 to #000, etc.
        // Match # followed by 6 hex digits where each pair is identical
        .replace(/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])(?![0-9a-fA-F])/g, (match, r1, r2, g1, g2, b1, b2) => {
          // Check if it's a valid 6-digit hex that can be shortened (e.g., #ffffff -> #fff)
          if (r1 === r2 && g1 === g2 && b1 === b2) {
            return '#' + r1 + g1 + b1;
          }
          return match;
        })
        
        // RGBA/RGB optimization: Remove spaces, convert 0.8 to .8
        .replace(/rgba?\s*\(([^)]+)\)/gi, (match, content) => {
          // Remove spaces and optimize decimal values (0.8 -> .8)
          const cleaned = content
            .replace(/\s+/g, '')
            .replace(/\b0+\.(\d+)/g, '.$1');
          const prefix = match.toLowerCase().includes('rgba') ? 'rgba(' : 'rgb(';
          return prefix + cleaned + ')';
        })
        
        // Optimize decimal values in numeric contexts: 0.8 -> .8
        // Match decimal numbers that are values (after colon, comma, or space)
        .replace(/([:,\s\(])0+\.(\d+)/g, '$1.$2')
        
        // Clean up any remaining multiple spaces
        .replace(/\s+/g, ' ')
        
        // Final trim
        .trim();

      setOutputCss(minified);
      
      const originalSize = new Blob([inputCss]).size;
      const minifiedSize = new Blob([minified]).size;
      const savings = originalSize > 0 
        ? ((originalSize - minifiedSize) / originalSize * 100).toFixed(1)
        : '0';
      
      toast({
        title: 'CSS Minified!',
        description: `Reduced size by ${savings}% (${originalSize} → ${minifiedSize} bytes)`,
      });
    } catch (error) {
      toast({
        title: 'Minification Error',
        description: 'An error occurred while minifying CSS. The CSS may contain invalid syntax.',
        variant: 'destructive',
      });
      // Still try to provide basic minification even if optimization fails
      const basicMinified = inputCss
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        .replace(/;\s*}/g, '}')
        .replace(/;;+/g, ';')
        .trim();
      setOutputCss(basicMinified);
    }
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Input CSS</Label>
          <Textarea
            placeholder="Paste your CSS code here..."
            value={inputCss}
            onChange={(e) => setInputCss(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label>Minified CSS</Label>
          <Textarea
            value={outputCss}
            readOnly
            placeholder="Minified CSS will appear here..."
            className="min-h-[300px] font-mono text-sm bg-muted"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={minifyCss}>
          <Minimize className="mr-2 h-4 w-4" /> Minify CSS
        </Button>
        <CopyButton
          textToCopy={outputCss}
          successMessage="Minified CSS copied to clipboard."
          emptyMessage="Please minify CSS first."
          size="sm"
        />
      </div>
    </div>
  );
};

export default CssMinifier;
