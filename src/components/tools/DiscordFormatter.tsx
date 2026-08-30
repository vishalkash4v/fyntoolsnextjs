'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, RotateCcw } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';
import { cn } from '@/lib/utils';

type StyleId =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'spoiler'
  | 'code'
  | 'codeblock'
  | 'quote';

const FORMAT_OPTIONS: { id: StyleId; label: string; hint: string; exclusive?: boolean }[] = [
  { id: 'bold', label: 'Bold', hint: '**text**' },
  { id: 'italic', label: 'Italic', hint: '*text*' },
  { id: 'underline', label: 'Underline', hint: '__text__' },
  { id: 'strikethrough', label: 'Strike', hint: '~~text~~' },
  { id: 'spoiler', label: 'Spoiler', hint: '||text||' },
  { id: 'code', label: 'Inline code', hint: '`text`' },
  { id: 'codeblock', label: 'Code block', hint: '```text```', exclusive: true },
  { id: 'quote', label: 'Quote', hint: '> text', exclusive: true },
];

function applyDiscordStyles(text: string, styles: Set<StyleId>): string {
  if (!text.trim()) return '';
  if (styles.has('codeblock')) return `\`\`\`\n${text}\n\`\`\``;
  if (styles.has('quote')) {
    return text
      .split('\n')
      .map((line) => (line.trim() ? `> ${line}` : '>'))
      .join('\n');
  }

  let out = text;
  if (styles.has('code')) out = `\`${out}\``;
  if (styles.has('spoiler')) out = `||${out}||`;
  if (styles.has('strikethrough')) out = `~~${out}~~`;
  if (styles.has('underline')) out = `__${out}__`;
  if (styles.has('italic')) out = `*${out}*`;
  if (styles.has('bold')) out = `**${out}**`;
  return out;
}

function renderPreview(text: string) {
  let preview = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  preview = preview.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  preview = preview.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  preview = preview.replace(/\*(.*?)\*/g, '<em>$1</em>');
  preview = preview.replace(/__(.*?)__/g, '<u>$1</u>');
  preview = preview.replace(/~~(.*?)~~/g, '<del>$1</del>');
  preview = preview.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>');
  preview = preview.replace(
    /\|\|(.*?)\|\|/g,
    '<span class="bg-foreground text-foreground rounded px-1 hover:text-background cursor-pointer transition-colors">$1</span>'
  );
  preview = preview.replace(
    /^&gt; (.*)$/gm,
    '<blockquote class="border-l-4 border-primary pl-3 text-muted-foreground my-1">$1</blockquote>'
  );
  preview = preview.replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded text-sm overflow-x-auto my-2"><code>$1</code></pre>');

  return preview;
}

const DiscordFormatter = () => {
  const [inputText, setInputText] = useState('');
  const [selected, setSelected] = useState<Set<StyleId>>(new Set(['bold']));

  const formattedText = useMemo(
    () => applyDiscordStyles(inputText, selected),
    [inputText, selected]
  );

  const toggleStyle = (id: StyleId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const opt = FORMAT_OPTIONS.find((o) => o.id === id);
      if (opt?.exclusive) {
        next.clear();
        next.add(id);
        return next;
      }
      next.delete('codeblock');
      next.delete('quote');
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reset = () => {
    setInputText('');
    setSelected(new Set(['bold']));
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
              <Label className="flex items-center justify-between gap-2">
                <span>Apply styles (select multiple)</span>
                {selected.size > 0 && (
                  <Badge variant="secondary">{selected.size} active</Badge>
                )}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.id}
                    type="button"
                    variant={selected.has(opt.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleStyle(opt.id)}
                    disabled={!inputText.trim() && opt.id !== 'bold'}
                    className={cn('text-xs h-auto py-2', selected.has(opt.id) && 'ring-2 ring-primary/30')}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Combine Bold + Italic + Underline + Strike + Spoiler + Code. Code block and Quote replace other styles.
              </p>
            </div>

            <div>
              <Label>Formatted Output (live)</Label>
              <Textarea
                value={formattedText}
                readOnly
                placeholder="Formatted text updates as you type or toggle styles..."
                className="mt-2 min-h-32 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <CopyButton
                textToCopy={formattedText}
                successMessage="Formatted text copied!"
                variant="default"
                size="sm"
                copyText="Copy Text"
                className="flex-1"
                disabled={!formattedText}
              />
              <Button type="button" onClick={reset} variant="outline" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview &amp; Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formattedText ? (
              <div>
                <Label>Discord preview</Label>
                <div
                  className="mt-2 p-3 bg-muted rounded-lg min-h-16 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderPreview(formattedText) }}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Type text and pick styles to see preview.</p>
            )}

            <div>
              <Label>Syntax reference</Label>
              <div className="mt-2 space-y-2 text-sm">
                {FORMAT_OPTIONS.map((opt) => (
                  <div key={opt.id} className="flex justify-between items-center p-2 bg-muted rounded gap-2">
                    <span className="font-medium">{opt.label}</span>
                    <code className="text-xs bg-background px-2 py-1 rounded shrink-0">{opt.hint}</code>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiscordFormatter;
