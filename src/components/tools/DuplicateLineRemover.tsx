'use client';
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';

const DuplicateLineRemover = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const handleRemoveDuplicates = () => {
    const lines = inputText.split('\n');
    const uniqueLines = Array.from(new Set(lines));
    setOutputText(uniqueLines.join('\n'));
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <Label htmlFor="inputText" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Input Text
        </Label>
        <Textarea
          id="inputText"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your text here, with each item on a new line."
          rows={10}
          className="w-full bg-card text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleRemoveDuplicates} 
          className="w-full md:w-auto bg-primary text-primary-foreground dark:bg-blue-600 dark:text-white hover:bg-primary/90 dark:hover:bg-blue-700"
        >
          <ArrowRightLeft className="mr-2 h-4 w-4" /> 
          Remove Duplicate Lines
        </Button>
        {outputText && (
          <CopyButton
            textToCopy={outputText}
            successMessage="The unique lines have been copied"
            size="sm"
          />
        )}
      </div>
      
      {outputText && (
        <div>
          <Label htmlFor="outputText" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Output Text (Unique Lines)
          </Label>
          <Textarea
            id="outputText"
            value={outputText}
            readOnly
            placeholder="Unique lines will appear here."
            rows={10}
            className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          />
        </div>
      )}
    </div>
  );
};

export default DuplicateLineRemover;