'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';
import { Label } from '@/components/ui/label';

const JsonValidator: React.FC = () => {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const validateAndFormat = () => {
    if (!inputJson.trim()) {
      toast({
        title: 'No JSON',
        description: 'Please enter JSON to validate.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutputJson(formatted);
      setIsValid(true);
      setError('');
      toast({
        title: 'Valid JSON!',
        description: 'JSON is valid and has been formatted.',
      });
    } catch (err) {
      setIsValid(false);
      setError((err as Error).message);
      setOutputJson('');
      toast({
        title: 'Invalid JSON',
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Input JSON</Label>
            {isValid !== null && (
              <div className="flex items-center gap-2">
                {isValid ? (
                  <span className="text-green-600 flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Valid
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center text-sm">
                    <XCircle className="h-4 w-4 mr-1" />
                    Invalid
                  </span>
                )}
              </div>
            )}
          </div>
          <Textarea
            placeholder="Paste your JSON here..."
            value={inputJson}
            onChange={(e) => {
              setInputJson(e.target.value);
              setIsValid(null);
              setError('');
            }}
            className="min-h-[300px] font-mono text-sm"
          />
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Formatted JSON</Label>
          <Textarea
            value={outputJson}
            readOnly
            placeholder="Formatted JSON will appear here..."
            className="min-h-[300px] font-mono text-sm bg-muted"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={validateAndFormat}>
          <CheckCircle className="mr-2 h-4 w-4" /> Validate & Format
        </Button>
        <CopyButton
          textToCopy={outputJson}
          successMessage="Formatted JSON copied to clipboard."
          emptyMessage="Please validate JSON first."
          variant="outline"
          size="sm"
        />
      </div>
    </div>
  );
};

export default JsonValidator;
