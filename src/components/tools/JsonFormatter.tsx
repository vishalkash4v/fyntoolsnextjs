'use client';
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Minus, Maximize2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import AnimatedCopyButton from '@/components/ui/AnimatedCopyButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToolStorage } from '@/hooks/useToolStorage';

type ActionType = 'beautify' | 'minify';

const JsonFormatter: React.FC = () => {
  const [inputText, setInputText] = useToolStorage<string>({
    key: 'json-formatter:input',
    initial: '',
  });
  const [outputText, setOutputText] = useState<string>('');
  const [isValidJson, setIsValidJson] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [actionType, setActionType] = useState<ActionType>('beautify');
  const { toast } = useToast();

  const handleAction = (action: ActionType) => {
    if (!inputText.trim()) {
      setOutputText('');
      setIsValidJson(null);
      setErrorMessage('');
      toast({ title: "Input is empty", description: "Please enter JSON to process.", variant: "default" });
      return;
    }

    try {
      const parsedJson = JSON.parse(inputText);
      
      if (action === 'beautify') {
        setOutputText(JSON.stringify(parsedJson, null, 2));
        setIsValidJson(true);
        setErrorMessage('');
        toast({ title: "JSON Beautified", description: "Successfully beautified the JSON with proper formatting." });
      } else {
        // Minify
        setOutputText(JSON.stringify(parsedJson));
        setIsValidJson(true);
        setErrorMessage('');
        toast({ title: "JSON Minified", description: "Successfully minified the JSON." });
      }
    } catch (error) {
      const errorMsg = (error as Error).message;
      setOutputText('');
      setIsValidJson(false);
      setErrorMessage(errorMsg);
      toast({ title: "Invalid JSON", description: errorMsg, variant: "destructive" });
    }
  };

  const handleFormat = () => handleAction('beautify');
  const handleMinify = () => handleAction('minify');

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setIsValidJson(null);
    setErrorMessage('');
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
    setIsValidJson(null);
    setErrorMessage('');
    
    // Auto-validate as user types (optional)
    if (value.trim()) {
      try {
        JSON.parse(value);
        setIsValidJson(true);
        setErrorMessage('');
      } catch {
        setIsValidJson(false);
      }
    }
  };


  return (
    <div className="space-y-6">
      {/* Action Tabs */}
      <Tabs value={actionType} onValueChange={(value) => setActionType(value as ActionType)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="beautify" className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4" />
            Beautify JSON
          </TabsTrigger>
          <TabsTrigger value="minify" className="flex items-center gap-2">
            <Minus className="w-4 h-4" />
            Minify JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="beautify" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="inputText">Input JSON</Label>
                {isValidJson !== null && (
                  isValidJson ? 
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center"><CheckCircle className="h-4 w-4 mr-1"/>Valid JSON</span> : 
                  <span className="text-xs text-red-600 dark:text-red-400 flex items-center"><XCircle className="h-4 w-4 mr-1"/>Invalid JSON</span>
                )}
              </div>
              <Textarea
                id="inputText"
                placeholder='{"name": "example", "value": 123}'
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                className="min-h-[300px] text-sm font-mono"
              />
              {errorMessage && isValidJson === false && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {errorMessage}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputText">Beautified JSON</Label>
              <Textarea
                id="outputText"
                value={outputText}
                readOnly
                placeholder="Beautified JSON will appear here..."
                className="min-h-[300px] text-sm font-mono bg-muted/50"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleFormat} className="flex-1">
              <Maximize2 className="w-4 h-4 mr-2" />
              Beautify JSON
            </Button>
            {outputText && (
              <AnimatedCopyButton
                textToCopy={outputText}
                successMessage="Beautified JSON copied to clipboard"
                size="sm"
              />
            )}
            <Button onClick={handleClear} variant="outline" className="flex-1">Clear All</Button>
          </div>
        </TabsContent>

        <TabsContent value="minify" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="inputTextMinify">Input JSON</Label>
                {isValidJson !== null && (
                  isValidJson ? 
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center"><CheckCircle className="h-4 w-4 mr-1"/>Valid JSON</span> : 
                  <span className="text-xs text-red-600 dark:text-red-400 flex items-center"><XCircle className="h-4 w-4 mr-1"/>Invalid JSON</span>
                )}
              </div>
              <Textarea
                id="inputTextMinify"
                placeholder='{"name": "example", "value": 123}'
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                className="min-h-[300px] text-sm font-mono"
              />
              {errorMessage && isValidJson === false && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {errorMessage}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputTextMinify">Minified JSON</Label>
              <Textarea
                id="outputTextMinify"
                value={outputText}
                readOnly
                placeholder="Minified JSON will appear here..."
                className="min-h-[300px] text-sm font-mono bg-muted/50"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleMinify} className="flex-1">
              <Minus className="w-4 h-4 mr-2" />
              Minify JSON
            </Button>
            {outputText && (
              <AnimatedCopyButton
                textToCopy={outputText}
                successMessage="Minified JSON copied to clipboard"
                size="sm"
              />
            )}
            <Button onClick={handleClear} variant="outline" className="flex-1">Clear All</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JsonFormatter;
