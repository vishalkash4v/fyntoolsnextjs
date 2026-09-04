'use client';
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import CopyButton from '@/components/common/CopyButton';

const WhitespaceRemover: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [sizeInfo, setSizeInfo] = useState<{
    beforeChars: number;
    afterChars: number;
    beforeBytes: number;
    afterBytes: number;
  } | null>(null);

  useEffect(() => {
    setSizeInfo(null);
  }, [inputText]);

  const handleRemoveWhitespace = () => {
    if (!inputText) {
      setOutputText('');
      setSizeInfo(null);
      return;
    }
    // Remove leading/trailing whitespace from each line and replace multiple spaces with a single space.
    const lines = inputText.split('\n');
    const processedLines = lines.map(line => line.trim().replace(/\s+/g, ' '));
    // Remove empty lines except if the original text was just newlines
    const result = processedLines
      .filter((line, index, arr) => {
        if (line.length > 0) return true;
        // Keep a single empty line if it's between non-empty lines or was intentional
        if (index > 0 && index < arr.length - 1 && arr[index - 1].length > 0 && arr[index + 1].length > 0)
          return true;
        return false;
      })
      .join('\n');

    const enc = new TextEncoder();
    setSizeInfo({
      beforeChars: inputText.length,
      afterChars: result.length,
      beforeBytes: enc.encode(inputText).length,
      afterBytes: enc.encode(result).length,
    });
    setOutputText(result);
  };

  return (
    <div className="w-full space-y-6">
      <Textarea
        placeholder="Enter text with extra spaces..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="min-h-[150px] text-base p-4 bg-card text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
      />
      
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleRemoveWhitespace} 
          className="w-full sm:w-auto bg-primary text-primary-foreground dark:bg-blue-600 dark:text-white hover:bg-primary/90 dark:hover:bg-blue-700"
        >
          Remove Extra Spaces
        </Button>
        {outputText && inputText.length > 0 && (
          <CopyButton
            textToCopy={outputText}
            successMessage="The processed text has been copied"
            size="sm"
          />
        )}
      </div>
      
      {outputText !== null && inputText.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Processed Text:
            </h3>
            {sizeInfo && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Before: {sizeInfo.beforeChars.toLocaleString()} chars ({sizeInfo.beforeBytes.toLocaleString()} bytes UTF-8)
                <span className="mx-2 text-gray-400 dark:text-gray-500">→</span>
                After: {sizeInfo.afterChars.toLocaleString()} chars ({sizeInfo.afterBytes.toLocaleString()} bytes UTF-8)
              </p>
            )}
          </div>
          <Textarea
            value={outputText}
            readOnly
            className="min-h-[150px] text-base p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          />
        </div>
      )}
    </div>
  );
};

export default WhitespaceRemover;
