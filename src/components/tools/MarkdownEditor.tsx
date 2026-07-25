'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';
import { Label } from '@/components/ui/label';

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState('# Hello World\n\nThis is a **markdown** editor.\n\n- Item 1\n- Item 2\n- Item 3');
  const { toast } = useToast();

  const convertToHtml = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br>');
  };


  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'document.md';
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: 'Markdown file downloaded.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Markdown Editor</Label>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Enter your markdown here..."
          />
        </div>
        <div className="space-y-2">
          <Label>Preview</Label>
          <div 
            className="min-h-[300px] p-4 border rounded-md prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: convertToHtml(markdown) }}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <CopyButton
          textToCopy={convertToHtml(markdown)}
          successMessage="HTML copied to clipboard."
          variant="default"
          size="sm"
          copyText="Copy HTML"
        />
        <Button variant="outline" onClick={downloadMarkdown} className="flex-shrink-0">
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Download MD</span>
        </Button>
      </div>
    </div>
  );
};

export default MarkdownEditor;
