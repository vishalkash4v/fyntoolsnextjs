'use client';

import React, { useState, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CopyButton from '@/components/common/CopyButton';

const WordCounter: React.FC = () => {
  const [text, setText] = useState<string>('');

  const wordCount = useMemo(() => {
    if (text.trim() === '') {
      return 0;
    }
    return text.trim().split(/\s+/).length;
  }, [text]);

  const characterCount = useMemo(() => {
    return text.length;
  }, [text]);

  const characterCountNoSpaces = useMemo(() => {
    return text.replace(/\s/g, '').length;
  }, [text]);

  const sentenceCount = useMemo(() => {
    if (text.trim() === '') {
      return 0;
    }
    // Split by common sentence terminators. Filter out empty strings.
    return text.trim().split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  }, [text]);

  const paragraphCount = useMemo(() => {
    if (text.trim() === '') {
      return 0;
    }
    // Split by one or more newlines. Filter out empty strings.
    return text.trim().split(/\n+/).filter(paragraph => paragraph.trim().length > 0).length;
  }, [text]);


  return (
    <div className="w-full space-y-6">
      <Textarea
        placeholder="Type or paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[200px] text-base p-4"
      />
      {text.length > 0 && (
        <CopyButton
          textToCopy={text}
          successMessage="The text has been copied to your clipboard."
          variant="outline"
          size="sm"
          copyText="Copy Text"
        />
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Words</CardDescription>
            <CardTitle className="text-4xl">{wordCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Characters</CardDescription>
            <CardTitle className="text-4xl">{characterCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Characters (No Spaces)</CardDescription>
            <CardTitle className="text-4xl">{characterCountNoSpaces}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sentences</CardDescription>
            <CardTitle className="text-4xl">{sentenceCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paragraphs</CardDescription>
            <CardTitle className="text-4xl">{paragraphCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default WordCounter;
