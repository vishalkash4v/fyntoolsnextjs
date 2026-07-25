'use client';
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link, Link2Off } from 'lucide-react';
import { Label } from '@/components/ui/label';
import CopyButton from '@/components/common/CopyButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ActionType = 'encode' | 'decode';

const UrlEncodeDecoder: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [actionType, setActionType] = useState<ActionType>('encode');
  const { toast } = useToast();

  const handleEncode = () => {
    if (!inputText.trim()) {
      setOutputText('');
      toast({ title: "Input is empty", description: "Please enter text to encode.", variant: "default" });
      return;
    }

    try {
      const encoded = encodeURIComponent(inputText);
      setOutputText(encoded);
      toast({ title: "URL Encoded", description: "Successfully encoded the text." });
    } catch (error) {
      toast({ title: "Encoding Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleDecode = () => {
    if (!inputText.trim()) {
      setOutputText('');
      toast({ title: "Input is empty", description: "Please enter URL-encoded text to decode.", variant: "default" });
      return;
    }

    try {
      const decoded = decodeURIComponent(inputText);
      setOutputText(decoded);
      toast({ title: "URL Decoded", description: "Successfully decoded the URL-encoded text." });
    } catch (error) {
      toast({ title: "Decoding Error", description: "Invalid URL-encoded string. Please check your input.", variant: "destructive" });
      setOutputText('');
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
  };

  return (
    <div className="space-y-6">
      {/* Action Tabs */}
      <Tabs value={actionType} onValueChange={(value) => setActionType(value as ActionType)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            URL Encode
          </TabsTrigger>
          <TabsTrigger value="decode" className="flex items-center gap-2">
            <Link2Off className="w-4 h-4" />
            URL Decode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inputTextEncode">Input Text</Label>
              <Textarea
                id="inputTextEncode"
                placeholder="Enter text to encode (e.g., Hello World!)"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                className="min-h-[300px] text-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputTextEncode">Encoded Result</Label>
              <Textarea
                id="outputTextEncode"
                value={outputText}
                readOnly
                placeholder="Encoded URL will appear here..."
                className="min-h-[300px] text-sm font-mono bg-muted/50"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleEncode} className="flex-1">
              <Link className="w-4 h-4 mr-2" />
              Encode URL
            </Button>
            {outputText && (
              <CopyButton
                textToCopy={outputText}
                successMessage="Encoded text copied to clipboard"
                size="sm"
              />
            )}
            <Button onClick={handleClear} variant="outline" className="flex-1">Clear All</Button>
          </div>
        </TabsContent>

        <TabsContent value="decode" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inputTextDecode">Encoded URL</Label>
              <Textarea
                id="inputTextDecode"
                placeholder="Enter URL-encoded text (e.g., Hello%20World%21)"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                className="min-h-[300px] text-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputTextDecode">Decoded Result</Label>
              <Textarea
                id="outputTextDecode"
                value={outputText}
                readOnly
                placeholder="Decoded text will appear here..."
                className="min-h-[300px] text-sm font-mono bg-muted/50"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDecode} className="flex-1">
              <Link2Off className="w-4 h-4 mr-2" />
              Decode URL
            </Button>
            {outputText && (
              <CopyButton
                textToCopy={outputText}
                successMessage="Decoded text copied to clipboard"
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

export default UrlEncodeDecoder;
