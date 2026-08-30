'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';
import { extractTextFromPdfFile, type PdfExtractResult } from '@/lib/pdf/extractPdfText';

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

const PdfTextExtractor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<PdfExtractResult | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'plain'>('formatted');
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageLabel, setPageLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setProgress(0);
    setPageLabel('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const validateAndSetFile = useCallback((file: File | undefined) => {
    if (!file) return false;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please select a valid PDF file');
      return false;
    }

    if (file.size > MAX_BYTES) {
      toast.error(`PDF must be under ${MAX_BYTES / (1024 * 1024)} MB`);
      return false;
    }

    setSelectedFile(file);
    setResult(null);
    setProgress(0);
    setPageLabel('');
    return true;
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      validateAndSetFile(e.target.files?.[0]);
    },
    [validateAndSetFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      validateAndSetFile(e.dataTransfer.files?.[0]);
    },
    [validateAndSetFile]
  );

  const extractText = useCallback(async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setProgress(0);
    setPageLabel('');
    setResult(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const extracted = await extractTextFromPdfFile(buffer, (p) => {
        setProgress(p.percent);
        setPageLabel(`Page ${p.page} of ${p.totalPages}`);
      });

      if (!extracted.plain) {
        toast.error(
          'No selectable text found — this PDF may be scanned images only.',
          { duration: 6000 }
        );
        setResult(extracted);
        return;
      }

      setResult(extracted);
      setViewMode('formatted');
      toast.success(
        `Extracted ${extracted.wordCount.toLocaleString()} words from ${extracted.pageCount} page(s)`
      );
    } catch (error) {
      console.error(error);
      const msg =
        error instanceof Error && /password/i.test(error.message)
          ? 'This PDF is password-protected. Remove the password and try again.'
          : 'Failed to extract text from PDF. The file may be corrupted or unsupported.';
      toast.error(msg);
    } finally {
      setIsExtracting(false);
    }
  }, [selectedFile]);

  const downloadPlainText = useCallback(() => {
    if (!result?.plain) return;
    const blob = new Blob([result.plain], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedFile?.name.replace(/\.pdf$/i, '') || 'document'}_extracted.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded as .txt');
  }, [result, selectedFile]);

  const displayText =
    viewMode === 'formatted' ? result?.formatted ?? '' : result?.plain ?? '';

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
            <div
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <Label
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <FileText className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Click or drag & drop a PDF</p>
                  <p className="text-sm text-muted-foreground">
                    Runs in your browser — file is not uploaded. Max 25 MB.
                  </p>
                </div>
              </Label>
            </div>

            {selectedFile && (
              <div className="bg-muted/40 p-4 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="font-medium break-all">{selectedFile.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={reset} aria-label="Remove file">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={extractText} disabled={isExtracting} className="w-full sm:w-auto">
                  {isExtracting ? 'Extracting…' : 'Extract Text'}
                </Button>
              </div>
            )}

            {isExtracting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{pageLabel || 'Parsing PDF…'}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {result?.likelyScanned && !result.plain && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-medium">No text layer detected</p>
              <p className="text-muted-foreground">
                This PDF looks like scanned images without embedded text. Use our{' '}
                <Link href="/image-to-text" className="text-primary underline-offset-4 hover:underline">
                  Image to Text (OCR)
                </Link>{' '}
                tool on exported page screenshots instead.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {result?.plain && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Extracted Text
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{result.pageCount} page(s)</Badge>
              <Badge variant="secondary">{result.wordCount.toLocaleString()} words</Badge>
              <Badge variant="secondary">{result.charCount.toLocaleString()} chars</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as 'formatted' | 'plain')}
            >
              <TabsList>
                <TabsTrigger value="formatted">Formatted (layout + styles)</TabsTrigger>
                <TabsTrigger value="plain">Plain text</TabsTrigger>
              </TabsList>
              <TabsContent value="formatted" className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Preserves line breaks, columns, page breaks, and **bold** / *italic* cues from PDF fonts.
                </p>
              </TabsContent>
              <TabsContent value="plain" className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Normalized text — single spaces, no markdown, ready for editing or search.
                </p>
              </TabsContent>
            </Tabs>

            <Textarea
              value={displayText}
              readOnly
              className="min-h-[420px] font-mono text-sm leading-relaxed"
              placeholder="Extracted text will appear here…"
            />

            <div className="flex flex-wrap gap-2">
              <CopyButton
                textToCopy={result.formatted}
                successMessage="Formatted text copied (layout + styles)"
                variant="outline"
                size="sm"
                copyText="Copy formatted"
              />
              <CopyButton
                textToCopy={result.plain}
                successMessage="Plain text copied"
                variant="outline"
                size="sm"
                copyText="Copy plain text"
              />
              <Button onClick={downloadPlainText} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download .txt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PdfTextExtractor;
