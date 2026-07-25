'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Code, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';

const HtmlFormatter = () => {
  const [inputHtml, setInputHtml] = useState('');
  const [formattedHtml, setFormattedHtml] = useState('');

  const formatHtml = () => {
    try {
      const formatted = formatHtmlString(inputHtml);
      setFormattedHtml(formatted);
      toast.success('HTML formatted successfully!');
    } catch (error) {
      toast.error('Error formatting HTML. Please check your input.');
    }
  };

  const formatHtmlString = (html: string): string => {
    // Remove extra whitespace
    html = html.replace(/>\s+</g, '><').trim();
    
    let formatted = '';
    let indent = 0;
    const indentSize = 2;
    
    // Self-closing tags
    const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
    
    const tokens = html.match(/<\/?[^>]+>|[^<]+/g) || [];
    
    tokens.forEach((token) => {
      if (token.startsWith('</')) {
        // Closing tag
        indent = Math.max(0, indent - indentSize);
        formatted += ' '.repeat(indent) + token + '\n';
      } else if (token.startsWith('<')) {
        // Opening tag
        const tagName = token.match(/<(\w+)/)?.[1]?.toLowerCase();
        const isSelfClosing = selfClosingTags.includes(tagName || '') || token.endsWith('/>');
        
        formatted += ' '.repeat(indent) + token + '\n';
        
        if (!isSelfClosing) {
          indent += indentSize;
        }
      } else if (token.trim()) {
        // Text content
        formatted += ' '.repeat(indent) + token.trim() + '\n';
      }
    });
    
    return formatted.trim();
  };


  const reset = () => {
    setInputHtml('');
    setFormattedHtml('');
  };

  const sampleHtml = `<html><head><title>Sample</title></head><body><div class="container"><h1>Hello World</h1><p>This is a paragraph with <a href="#">a link</a>.</p><ul><li>Item 1</li><li>Item 2</li></ul></div></body></html>`;

  const loadSample = () => {
    setInputHtml(sampleHtml);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              HTML Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Paste your HTML code here</Label>
              <Textarea
                value={inputHtml}
                onChange={(e) => setInputHtml(e.target.value)}
                placeholder="Enter your HTML code..."
                className="mt-2 min-h-48 font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={formatHtml} disabled={!inputHtml.trim()} className="flex-1">
                Format HTML
              </Button>
              <Button onClick={loadSample} variant="outline" size="sm">
                Sample
              </Button>
              <Button onClick={reset} variant="outline" size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Formatted HTML</Label>
              <Textarea
                value={formattedHtml}
                readOnly
                placeholder="Formatted HTML will appear here..."
                className="mt-2 min-h-48 font-mono text-sm"
              />
            </div>

            <CopyButton
              textToCopy={formattedHtml}
              successMessage="Formatted HTML copied to clipboard!"
              variant="default"
              size="sm"
              copyText="Copy Formatted HTML"
              className="w-full"
            />

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">ℹ️ About HTML Formatting:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Adds proper indentation for nested elements</li>
                <li>• Places each tag on a new line</li>
                <li>• Preserves HTML structure and functionality</li>
                <li>• Makes code more readable and maintainable</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HtmlFormatter;
