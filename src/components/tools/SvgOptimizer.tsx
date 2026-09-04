'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileCode, Zap } from "lucide-react";
import { toast } from "sonner";
import CopyButton from '@/components/common/CopyButton';

const SvgOptimizer = () => {
  const [inputSvg, setInputSvg] = useState('');
  const [outputSvg, setOutputSvg] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [options, setOptions] = useState({
    removeComments: true,
    removeMetadata: true,
    removeUnusedNamespaces: true,
    removeEmptyAttributes: true,
    removeEmptyElements: true,
    removeDefaultAttributes: true,
    minifyStyles: true,
    removeWhitespace: true,
  });

  const optimizeSvg = useCallback(async () => {
    if (!inputSvg.trim()) {
      toast.error('Please enter SVG code to optimize');
      return;
    }

    setIsOptimizing(true);
    try {
      let optimized = inputSvg;

      // Remove XML comments
      if (options.removeComments) {
        optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
      }

      // Remove metadata elements
      if (options.removeMetadata) {
        optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
        optimized = optimized.replace(/<title[\s\S]*?<\/title>/gi, '');
        optimized = optimized.replace(/<desc[\s\S]*?<\/desc>/gi, '');
      }

      // Remove unused namespaces
      if (options.removeUnusedNamespaces) {
        optimized = optimized.replace(/xmlns:[^=]*="[^"]*"/g, '');
      }

      // Remove empty attributes
      if (options.removeEmptyAttributes) {
        optimized = optimized.replace(/\s+[a-zA-Z-]+=""/g, '');
      }

      // Remove default attributes
      if (options.removeDefaultAttributes) {
        optimized = optimized.replace(/\s+fill="black"/g, '');
        optimized = optimized.replace(/\s+stroke="none"/g, '');
        optimized = optimized.replace(/\s+stroke-width="1"/g, '');
      }

      // Remove empty elements
      if (options.removeEmptyElements) {
        optimized = optimized.replace(/<([^>]+)><\/\1>/g, '');
      }

      // Minify inline styles
      if (options.minifyStyles) {
        optimized = optimized.replace(/style="([^"]*)"/g, (match, style) => {
          const minified = style.replace(/\s*:\s*/g, ':').replace(/\s*;\s*/g, ';');
          return `style="${minified}"`;
        });
      }

      // Remove unnecessary whitespace
      if (options.removeWhitespace) {
        optimized = optimized.replace(/>\s+</g, '><');
        optimized = optimized.replace(/\s+/g, ' ');
        optimized = optimized.trim();
      }

      setOutputSvg(optimized);
      
      const originalSize = new Blob([inputSvg]).size;
      const optimizedSize = new Blob([optimized]).size;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      toast.success(`SVG optimized! Saved ${savings}% (${originalSize - optimizedSize} bytes)`);
    } catch (error) {
      toast.error('Failed to optimize SVG');
    } finally {
      setIsOptimizing(false);
    }
  }, [inputSvg, options]);


  const downloadSvg = useCallback(() => {
    const blob = new Blob([outputSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'optimized.svg';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded successfully');
  }, [outputSvg]);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Input SVG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputSvg}
              onChange={(e) => setInputSvg(e.target.value)}
              placeholder="Paste your SVG code here..."
              className="min-h-[300px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Optimized SVG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outputSvg}
              readOnly
              placeholder="Optimized SVG will appear here..."
              className="min-h-[300px] font-mono text-sm bg-gray-50"
            />
            {outputSvg && (
              <div className="flex gap-2 mt-4">
                <CopyButton
                  textToCopy={outputSvg}
                  successMessage="Optimized SVG copied to clipboard"
                  variant="outline"
                  size="sm"
                  copyText="Copy"
                />
                <Button onClick={downloadSvg} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(options).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, [key]: !!checked }))
                  }
                />
                <Label htmlFor={key} className="text-sm">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
              </div>
            ))}
          </div>
          <Button
            onClick={optimizeSvg}
            disabled={isOptimizing || !inputSvg.trim()}
            className="mt-4 w-full"
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize SVG'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SvgOptimizer;
