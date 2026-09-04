'use client';
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Binary, ArrowUpDown, Upload, FileText, Image, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CopyButton from '@/components/common/CopyButton';

const Base64Converter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [fileType, setFileType] = useState<'text' | 'image' | 'audio'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit

  const handleTextEncode = () => {
    try {
      const encoded = btoa(inputText);
      setOutputText(encoded);
    } catch (error) {
      toast({
        title: "Encoding Error",
        description: "Failed to encode the text. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const handleTextDecode = () => {
    try {
      const decoded = atob(inputText);
      setOutputText(decoded);
    } catch (error) {
      toast({
        title: "Decoding Error",
        description: "Invalid Base64 string. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1]; // Remove data URL prefix
      setOutputText(result); // Keep full data URL for images
      setInputText(base64); // Just base64 for text area
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePreview = () => {
    if (!inputText) return;

    // If it's a data URL, use it directly after validation
    if (inputText.startsWith('data:')) {
      if (
        (fileType === 'image' && inputText.startsWith('data:image')) ||
        (fileType === 'audio' && inputText.startsWith('data:audio'))
      ) {
        setOutputText(inputText);
      } else {
        toast({
          title: 'Invalid Data URL',
          description: `The provided Data URL does not seem to be for an ${fileType}.`,
          variant: 'destructive',
        });
      }
      return;
    }

    // It's a raw base64 string, so we guess the mime type
    let mimeType = '';
    if (fileType === 'image') {
      mimeType = 'image/png'; // A reasonable default
    } else if (fileType === 'audio') {
      mimeType = 'audio/mpeg'; // A reasonable default
    }

    if (mimeType) {
      setOutputText(`data:${mimeType};base64,${inputText}`);
      toast({
        title: 'Preview Generated',
        description: `Assuming mime type is ${mimeType}. For other types, please provide a full Data URL.`,
      });
    }
  };

  const handleConvert = () => {
    if (fileType === 'text') {
      if (mode === 'encode') {
        handleTextEncode();
      } else {
        handleTextDecode();
      }
    }
  };


  const handleSwapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInputText(''); // Clear input on swap for simplicity
    setOutputText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAcceptedFileTypes = () => {
    switch (fileType) {
      case 'image':
        return 'image/*';
      case 'audio':
        return 'audio/*';
      default:
        return '*/*';
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Binary className="h-6 w-6" />
            Base64 Encoder/Decoder
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Encode text/files to Base64, or decode Base64 strings to preview images and audio (up to 2MB).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            defaultValue="text"
            onValueChange={(value) => {
              setFileType(value as 'text' | 'image' | 'audio');
              handleClear();
            }}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <FileText className="h-4 w-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Image className="h-4 w-4" />
                Image
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Music className="h-4 w-4" />
                Audio
              </TabsTrigger>
            </TabsList>

            {/* Mode Toggle for All Tabs */}
            <div className="flex flex-col sm:flex-row gap-2 pt-8">
              <Button
                variant={mode === 'encode' ? 'default' : 'outline'}
                onClick={() => setMode('encode')}
                className="flex-1 text-gray-900 dark:text-white bg-primary dark:bg-blue-600 hover:bg-primary/90 dark:hover:bg-blue-700"
              >
                {fileType === 'text' ? 'Encode to Base64' : 'File to Base64'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapMode}
                title="Swap Modes"
                className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Button
                variant={mode === 'decode' ? 'default' : 'outline'}
                onClick={() => setMode('decode')}
                className="flex-1 text-gray-900 dark:text-white bg-primary dark:bg-blue-600 hover:bg-primary/90 dark:hover:bg-blue-700"
              >
                {fileType === 'text' ? 'Decode from Base64' : 'Base64 to File'}
              </Button>
            </div>

            <TabsContent value="text" className="space-y-6">
              {/* Text Input */}
              <div className="space-y-2">
                <Label htmlFor="textInput" className="text-gray-700 dark:text-gray-200">
                  {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
                </Label>
                <Textarea
                  id="textInput"
                  placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-32 bg-card text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleConvert} disabled={!inputText} className="flex-1 bg-primary dark:bg-blue-600 text-gray-900 dark:text-white hover:bg-primary/90 dark:hover:bg-blue-700">
                  {mode === 'encode' ? 'Encode' : 'Decode'}
                </Button>
                {outputText && (
                  <CopyButton
                    textToCopy={outputText}
                    successMessage="Result copied to clipboard"
                    size="sm"
                  />
                )}
                <Button variant="outline" onClick={handleClear} className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
                  Clear
                </Button>
              </div>

              {/* Text Output */}
              {outputText && (
                <div className="space-y-2">
                  <Label htmlFor="textOutput" className="text-gray-700 dark:text-gray-200">
                    {mode === 'encode' ? 'Base64 Encoded' : 'Decoded Text'}
                  </Label>
                  <Textarea
                    id="textOutput"
                    value={outputText}
                    readOnly
                    className="min-h-32 bg-card text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="image" className="space-y-6">
              {mode === 'encode' ? (
                <>
                  {/* File Upload for Images */}
                  <div className="space-y-2">
                    <Label htmlFor="imageInput" className="text-gray-700 dark:text-gray-200">Upload Image (Max 2MB)</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        ref={fileInputRef}
                        id="imageInput"
                        type="file"
                        accept={getAcceptedFileTypes()}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Image
                      </Button>
                      <Button variant="outline" onClick={handleClear} className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Image Preview and Base64 Output */}
                  {outputText && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-200">Image Preview</Label>
                        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <img
                            src={outputText}
                            alt="Uploaded"
                            className="max-w-full max-h-64 object-contain mx-auto"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="imageBase64" className="text-gray-700 dark:text-gray-200">Base64 Output</Label>
                        <Textarea
                          id="imageBase64"
                          value={inputText}
                          readOnly
                          className="min-h-32 font-mono text-xs bg-card text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                        />
                        {inputText && (
                          <div className="flex flex-wrap gap-2">
                            <CopyButton
                              textToCopy={inputText}
                              successMessage="Base64 output copied to clipboard"
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Base64/DataURL Input for decoding */}
                  <div className="space-y-2">
                    <Label htmlFor="base64ToImageInput" className="text-gray-700 dark:text-gray-200">Base64 or Data URL to Preview</Label>
                    <Textarea
                      id="base64ToImageInput"
                      placeholder="Paste Base64 string or a full Data URL (e.g., data:image/png;base64,...)"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-32 font-mono text-xs bg-card text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleGeneratePreview} disabled={!inputText} className="flex-1 bg-primary dark:bg-blue-600 text-gray-900 dark:text-white hover:bg-primary/90 dark:hover:bg-blue-700">
                      Generate Preview
                    </Button>
                    <Button variant="outline" onClick={handleClear} className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
                      Clear
                    </Button>
                  </div>

                  {/* Image Preview */}
                  {outputText && (
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Image Preview</Label>
                      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        <img
                          src={outputText}
                          alt="Preview from Base64"
                          className="max-w-full max-h-64 object-contain mx-auto"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="audio" className="space-y-6">
              {mode === 'encode' ? (
                <>
                  {/* File Upload for Audio */}
                  <div className="space-y-2">
                    <Label htmlFor="audioInput" className="text-gray-700 dark:text-gray-200">Upload Audio File (Max 2MB)</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        ref={fileInputRef}
                        id="audioInput"
                        type="file"
                        accept={getAcceptedFileTypes()}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Audio
                      </Button>
                      <Button variant="outline" onClick={handleClear} className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Audio Preview and Base64 Output */}
                  {outputText && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-200">Audio Preview</Label>
                        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <audio
                            src={outputText}
                            controls
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="audioBase64" className="text-gray-700 dark:text-gray-200">Base64 Output</Label>
                        <Textarea
                          id="audioBase64"
                          value={inputText}
                          readOnly
                          className="min-h-32 font-mono text-xs bg-card text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                        />
                        {inputText && (
                          <div className="flex flex-wrap gap-2">
                            <CopyButton
                              textToCopy={inputText}
                              successMessage="Base64 output copied to clipboard"
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Base64/DataURL Input for decoding */}
                  <div className="space-y-2">
                    <Label htmlFor="base64ToAudioInput" className="text-gray-700 dark:text-gray-200">Base64 or Data URL to Preview</Label>
                    <Textarea
                      id="base64ToAudioInput"
                      placeholder="Paste Base64 string or a full Data URL (e.g., data:audio/mpeg;base64,...)"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-32 font-mono text-xs bg-card text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleGeneratePreview} disabled={!inputText} className="flex-1 bg-primary dark:bg-blue-600 text-gray-900 dark:text-white hover:bg-primary/90 dark:hover:bg-blue-700">
                      Generate Preview
                    </Button>
                    <Button variant="outline" onClick={handleClear} className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
                      Clear
                    </Button>
                  </div>

                  {/* Audio Preview */}
                  {outputText && (
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Audio Preview</Label>
                      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        <audio
                          src={outputText}
                          controls
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Base64Converter;