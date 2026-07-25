'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';

const DiscordFormatter = () => {
  const [inputText, setInputText] = useState('');
  const [formattedText, setFormattedText] = useState('');

  const formatButtons = [
    { label: 'Bold', format: '**text**', action: (text: string) => `**${text}**` },
    { label: 'Italic', format: '*text*', action: (text: string) => `*${text}*` },
    { label: 'Underline', format: '__text__', action: (text: string) => `__${text}__` },
    { label: 'Strikethrough', format: '~~text~~', action: (text: string) => `~~${text}~~` },
    { label: 'Code', format: '`text`', action: (text: string) => `\`${text}\`` },
    { label: 'Code Block', format: '```text```', action: (text: string) => `\`\`\`\n${text}\n\`\`\`` },
    { label: 'Spoiler', format: '||text||', action: (text: string) => `||${text}||` },
    { label: 'Quote', format: '> text', action: (text: string) => `> ${text}` }
  ];

  const applyFormat = (action: (text: string) => string) => {
    if (inputText.trim()) {
      const formatted = action(inputText);
      setFormattedText(formatted);
    }
  };


  const reset = () => {
    setInputText('');
    setFormattedText('');
  };

  const renderPreview = (text: string) => {
    // Simple preview rendering for Discord formatting
    let preview = text;
    
    // Bold
    preview = preview.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    preview = preview.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Underline
    preview = preview.replace(/__(.*?)__/g, '<u>$1</u>');
    // Strikethrough
    preview = preview.replace(/~~(.*?)~~/g, '<del>$1</del>');
    // Code
    preview = preview.replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>');
    // Spoiler
    preview = preview.replace(/\|\|(.*?)\|\|/g, '<span class="bg-black text-black hover:text-white cursor-pointer">$1</span>');
    // Quote
    preview = preview.replace(/^> (.*)$/gm, '<blockquote class="border-l-4 border-primary pl-4 text-muted-foreground">$1</blockquote>');
    
    return preview;
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Discord Text Formatter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Your Text</Label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here..."
                className="mt-2 min-h-32"
              />
            </div>

            <div>
              <Label>Formatting Options</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {formatButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => applyFormat(button.action)}
                    disabled={!inputText.trim()}
                    className="text-xs"
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Formatted Output</Label>
              <Textarea
                value={formattedText}
                readOnly
                placeholder="Formatted text will appear here..."
                className="mt-2 min-h-32 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <CopyButton
                textToCopy={formattedText}
                successMessage="Formatted text copied to clipboard!"
                variant="default"
                size="sm"
                copyText="Copy Text"
                className="flex-1"
              />
              <Button onClick={reset} variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discord Preview & Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formattedText && (
              <div>
                <Label>Preview (How it looks in Discord):</Label>
                <div 
                  className="mt-2 p-3 bg-muted rounded-lg min-h-16"
                  dangerouslySetInnerHTML={{ __html: renderPreview(formattedText) }}
                />
              </div>
            )}

            <div>
              <Label>Discord Formatting Guide:</Label>
              <div className="mt-2 space-y-2 text-sm">
                {formatButtons.map((button, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">{button.label}:</span>
                    <code className="text-xs bg-background px-2 py-1 rounded">{button.format}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">💡 Tips:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• You can combine formats like ***bold italic***</li>
                <li>• Use ``` for multi-line code blocks</li>
                <li>• Spoiler text reveals on hover/click</li>
                <li>• Quotes work best at line start</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiscordFormatter;
