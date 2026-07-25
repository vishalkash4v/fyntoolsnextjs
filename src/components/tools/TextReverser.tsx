'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';

const TextReverser = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const handleReverse = () => {
    setOutputText(inputText.split('').reverse().join(''));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  return (
    <div className="space-y-4 p-4 max-w-4xl mx-auto">
      <div>
        <Label htmlFor="inputText" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Enter Text
        </Label>
        <Textarea
          id="inputText"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type or paste your text here..."
          className="min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleReverse} 
          className="w-full sm:w-auto bg-primary text-primary-foreground dark:bg-blue-600 dark:text-white hover:bg-primary/90 dark:hover:bg-blue-700"
        >
          <ArrowRightLeft className="mr-2 h-4 w-4" /> 
          Reverse Text
        </Button>
        {outputText && (
          <CopyButton
            textToCopy={outputText}
            successMessage="The reversed text has been copied"
            size="sm"
          />
        )}
      </div>
      {outputText && (
        <div>
          <Label htmlFor="outputText" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Reversed Text
          </Label>
          <Textarea
            id="outputText"
            value={outputText}
            readOnly
            placeholder="Reversed text will appear here..."
            className="min-h-[100px] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          />
        </div>
      )}
    </div>
  );
};

export default TextReverser;