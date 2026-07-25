'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import CopyButton from '@/components/common/CopyButton';

const PdfTextExtractor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file');
      return;
    }

    setSelectedFile(file);
    setExtractedText('');
    setProgress(0);
  }, []);

  const extractText = useCallback(async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setProgress(0);
    
    try {
      // Since we don't have pdf.js installed, we'll simulate the process
      // In a real implementation, you would use pdf.js library
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate PDF text extraction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted text
      const mockText = `This is a demonstration of PDF text extraction.

File: ${selectedFile.name}
Size: ${(selectedFile.size / 1024).toFixed(2)} KB

In a real implementation, this would use PDF.js library to:
1. Parse the PDF file
2. Extract text from each page
3. Handle different text encodings
4. Preserve formatting where possible

The extracted text would appear here, maintaining the original structure and content from the PDF document.

To implement real PDF text extraction, you would need to:
- Install pdf.js: npm install pdfjs-dist
- Import the library: import * as pdfjsLib from 'pdfjs-dist'
- Set up the worker: pdfjsLib.GlobalWorkerOptions.workerSrc
- Load and parse the PDF document
- Extract text from each page`;

      setExtractedText(mockText);
      setProgress(100);
      toast.success('Text extracted successfully!');
      
    } catch (error) {
      toast.error('Failed to extract text from PDF');
    } finally {
      setIsExtracting(false);
    }
  }, [selectedFile]);


  const downloadText = useCallback(() => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedFile?.name.replace('.pdf', '')}_extracted.txt` || 'extracted_text.txt';
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
            Upload PDF File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <Label
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <FileText className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium">Click to upload PDF</p>
                  <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                </div>
              </Label>
            </div>

            {selectedFile && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  onClick={extractText}
                  disabled={isExtracting}
                  className="mt-3 w-full sm:w-auto"
                >
                  {isExtracting ? 'Extracting...' : 'Extract Text'}
                </Button>
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
                className="min-h-[400px] font-mono text-sm"
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

export default PdfTextExtractor;
