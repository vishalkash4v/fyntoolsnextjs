'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import DOMPurify from 'dompurify';
import { 
  Bold, Italic, Underline, List, ListOrdered, Link, Image, Code, 
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  AlignLeft, AlignCenter, AlignRight, Quote, Minus, Undo, Redo
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProfessionalRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const sanitizePastedHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 'u', 's', 'span',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'img', 'hr', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#)/i,
  });

const linkifyPlainText = (text: string): string => {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const linked = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return linked.replace(/\n/g, '<br>');
};

const ProfessionalRichTextEditor = ({ value, onChange }: ProfessionalRichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      if (currentContent !== value && value !== undefined) {
        editorRef.current.innerHTML = value || '';
        // Save to history
        if (value) {
          setHistory([value]);
          setHistoryIndex(0);
        }
      }
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      if (newHistory.length > 50) newHistory.shift(); // Limit history
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const insertHeading = (level: number) => {
    const headingTag = `h${level}`;
    if (document.queryCommandSupported('formatBlock')) {
      document.execCommand('formatBlock', false, headingTag);
    } else {
      // Fallback: wrap selection in heading tag
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const heading = document.createElement(headingTag);
        heading.textContent = range.toString() || `Heading ${level}`;
        range.deleteContents();
        range.insertNode(heading);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    editorRef.current?.focus();
    updateContent();
  };

  const insertParagraph = () => {
    execCommand('formatBlock', 'p');
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const text = prompt('Enter link text:', url);
      if (text) {
        execCommand('createLink', url);
        // Update the link text if provided
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const link = range.commonAncestorContainer.parentElement?.closest('a');
          if (link && text !== url) {
            link.textContent = text;
          }
        }
      } else {
        execCommand('createLink', url);
      }
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const alt = prompt('Enter alt text (for SEO):', '');
      const img = document.createElement('img');
      img.src = url;
      img.alt = alt || '';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
      } else {
        editorRef.current?.appendChild(img);
      }
      editorRef.current?.focus();
      updateContent();
    }
  };

  const insertBlockquote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  const insertHR = () => {
    execCommand('insertHorizontalRule');
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevContent = history[historyIndex - 1];
      if (editorRef.current) {
        editorRef.current.innerHTML = prevContent;
        setHistoryIndex(historyIndex - 1);
        onChange(prevContent);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextContent = history[historyIndex + 1];
      if (editorRef.current) {
        editorRef.current.innerHTML = nextContent;
        setHistoryIndex(historyIndex + 1);
        onChange(nextContent);
      }
    }
  };

  const formatCode = () => {
    execCommand('formatBlock', 'pre');
    // Wrap in code tag
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const code = document.createElement('code');
      code.textContent = range.toString();
      range.deleteContents();
      range.insertNode(code);
    }
    updateContent();
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Professional Toolbar */}
      <div className="border-b p-2 bg-muted/30 flex flex-wrap gap-1 items-center">
        {/* Headings */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(1)}
            title="Heading 1 (H1)"
            className="h-8 w-8 p-0"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(2)}
            title="Heading 2 (H2)"
            className="h-8 w-8 p-0"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(3)}
            title="Heading 3 (H3)"
            className="h-8 w-8 p-0"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(4)}
            title="Heading 4 (H4)"
            className="h-8 w-8 p-0"
          >
            <Heading4 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(5)}
            title="Heading 5 (H5)"
            className="h-8 w-8 p-0"
          >
            <Heading5 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(6)}
            title="Heading 6 (H6)"
            className="h-8 w-8 p-0"
          >
            <Heading6 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('bold')}
            title="Bold (Ctrl+B)"
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('italic')}
            title="Italic (Ctrl+I)"
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('underline')}
            title="Underline (Ctrl+U)"
            className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered List"
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyLeft')}
            title="Align Left"
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyCenter')}
            title="Align Center"
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyRight')}
            title="Align Right"
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Insert Elements */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertLink}
            title="Insert Link"
            className="h-8 w-8 p-0"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertImage}
            title="Insert Image"
            className="h-8 w-8 p-0"
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertBlockquote}
            title="Blockquote"
            className="h-8 w-8 p-0"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={formatCode}
            title="Code Block"
            className="h-8 w-8 p-0"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertHR}
            title="Horizontal Rule"
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[500px] p-6 prose prose-lg max-w-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onInput={updateContent}
        onBlur={updateContent}
        onPaste={(e) => {
          e.preventDefault();
          const html = e.clipboardData.getData('text/html');
          const text = e.clipboardData.getData('text/plain');

          if (html) {
            const sanitized = sanitizePastedHtml(html);
            document.execCommand('insertHTML', false, sanitized);
          } else if (text) {
            document.execCommand('insertHTML', false, linkifyPlainText(text));
          }
          updateContent();
        }}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
        data-placeholder="Start writing your blog post... Use headings (H1-H6) for structure, paragraphs for content, and proper formatting for SEO."
      />
      
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .prose h1 { font-size: 2.25em; font-weight: 800; margin-top: 0; margin-bottom: 0.8888889em; line-height: 1.1111111; }
        .prose h2 { font-size: 1.5em; font-weight: 700; margin-top: 2em; margin-bottom: 1em; line-height: 1.3333333; }
        .prose h3 { font-size: 1.25em; font-weight: 600; margin-top: 1.6em; margin-bottom: 0.6em; line-height: 1.6; }
        .prose h4 { font-size: 1.125em; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; line-height: 1.5555556; }
        .prose h5 { font-size: 1em; font-weight: 600; margin-top: 1.4em; margin-bottom: 0.5em; line-height: 1.5555556; }
        .prose h6 { font-size: 0.875em; font-weight: 600; margin-top: 1.3em; margin-bottom: 0.5em; line-height: 1.5714286; }
        .prose p { margin-top: 1.25em; margin-bottom: 1.25em; }
        .prose img { max-width: 100%; height: auto; margin: 1.5em 0; border-radius: 0.5rem; }
        .prose blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; margin: 1.5em 0; font-style: italic; }
        .prose code { background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25rem; font-size: 0.875em; }
        .prose pre { background-color: #1f2937; color: #f9fafb; padding: 1em; border-radius: 0.5rem; overflow-x: auto; }
        .prose pre code { background-color: transparent; padding: 0; }
        .prose ul, .prose ol { margin: 1.25em 0; padding-left: 1.625em; }
        .prose li { margin: 0.5em 0; }
        .prose a { color: #2563eb; text-decoration: underline; }
        .prose a:hover { color: #1d4ed8; }
        .prose hr { border: none; border-top: 2px solid #e5e7eb; margin: 2em 0; }
      `}</style>
    </div>
  );
};

export default ProfessionalRichTextEditor;
