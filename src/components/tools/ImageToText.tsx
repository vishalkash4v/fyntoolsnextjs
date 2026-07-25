'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Image as ImageIcon, FileText, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CopyButton from '@/components/common/CopyButton';

const LANGUAGE_OPTIONS = [
  { value: 'eng', label: 'English' },
  { value: 'hin', label: 'Hindi' },
  { value: 'eng+hin', label: 'English + Hindi' },
];

const ImageToText = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState('eng');

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setSelectedFile(file);
    setExtractedText('');
    setProgress(0);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setExtractedText('');
    setProgress(0);
  }, []);

  const extractText = useCallback(async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(selectedFile, language, {
        logger: (m) => {
          if (typeof m.progress === 'number') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result?.data?.text?.trim() || '';
      setExtractedText(text);
      setProgress(100);
      toast.success(text ? 'Text extracted successfully!' : 'No text detected in the image');
    } catch (error) {
      toast.error('Failed to extract text from image');
    } finally {
      setIsExtracting(false);
    }
  }, [selectedFile, language]);

  const downloadText = useCallback(() => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'image'}_text.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Text file downloaded');
  }, [extractedText, selectedFile]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <Label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <ImageIcon className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium">Click to upload image</p>
                  <p className="text-sm text-gray-500">PNG, JPG, JPEG, WebP, BMP</p>
                </div>
              </Label>
            </div>

            {selectedFile && (
              <div className="grid gap-4 md:grid-cols-[1fr_2fr] items-start">
                <div className="space-y-3">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-4 w-4" />
                      <span className="font-medium">{selectedFile.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Size: {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>

                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="w-full max-h-64 object-contain rounded-md border"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Recognition Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={extractText}
                      disabled={isExtracting}
                      className="w-full sm:w-auto"
                    >
                      {isExtracting ? 'Extracting...' : 'Extract Text'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearSelection}
                      disabled={isExtracting}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isExtracting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Extracting text...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {extractedText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Extracted Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[320px] font-mono text-sm"
                placeholder="Extracted text will appear here..."
              />
              <div className="flex gap-2">
                <CopyButton
                  textToCopy={extractedText}
                  successMessage="Text copied to clipboard"
                  variant="outline"
                  size="sm"
                  copyText="Copy Text"
                />
                <Button onClick={downloadText} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download as TXT
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageToText;
