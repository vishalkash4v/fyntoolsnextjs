'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Upload,
  Download,
  FileText,
  X,
  Loader2,
  Files,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  PDF_COMPRESS_LEVELS,
  type PdfCompressLevelId,
  type PdfCompressResult,
  compressPdfFile,
  formatBytes,
} from '@/lib/pdf/compressPdf';

const MAX_FILE_BYTES = 40 * 1024 * 1024; // 40MB per file
const MAX_BULK = 12;

type QueuedFile = {
  id: string;
  file: File;
  status: 'queued' | 'working' | 'done' | 'error';
  error?: string;
  result?: PdfCompressResult;
};

function downloadFile(url: string, name: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const PdfCompressor = () => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [bulk, setBulk] = useState(false);
  const [levelId, setLevelId] = useState<PdfCompressLevelId>('optimized');
  const [targetSize, setTargetSize] = useState('');
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ label: '', message: '', stage: '', percent: 0 });

  const addFiles = useCallback(
    (list: FileList | File[]) => {
      const incoming = Array.from(list).filter((f) => {
        const ok =
          f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        if (!ok) {
          toast({
            title: 'Not a PDF',
            description: `${f.name} was skipped.`,
            variant: 'destructive',
          });
        }
        if (f.size > MAX_FILE_BYTES) {
          toast({
            title: 'File too large',
            description: `${f.name} exceeds 40MB.`,
            variant: 'destructive',
          });
          return false;
        }
        return ok;
      });

      if (!incoming.length) return;

      setQueue((prev) => {
        const next = bulk ? [...prev] : [];
        for (const file of incoming) {
          if (!bulk && next.length >= 1) break;
          if (bulk && next.length >= MAX_BULK) {
            toast({
              title: 'Bulk limit',
              description: `Max ${MAX_BULK} PDFs per batch.`,
              variant: 'destructive',
            });
            break;
          }
          next.push({
            id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
            file,
            status: 'queued',
          });
        }
        return next;
      });
    },
    [bulk, toast]
  );

  const removeFile = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const clearAll = () => {
    setQueue([]);
    setProgress({ label: '', message: '', stage: '', percent: 0 });
  };

  const runCompress = async () => {
    if (!queue.length || running) return;
    setRunning(true);

    const updated = [...queue];
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i]!;
      updated[i] = { ...item, status: 'working', error: undefined };
      setQueue([...updated]);
      setProgress({ label: item.file.name, message: 'Waiting to start…', stage: 'queued', percent: 0 });

      try {
        const result = await compressPdfFile(item.file, levelId, (p) => {
          setProgress({
            label: p.fileName,
            message: p.message,
            stage: p.stage,
            percent: p.percent,
          });
        }, targetSize ? Number(targetSize) : null);
        updated[i] = { ...item, status: 'done', result };
        setQueue([...updated]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Compression failed';
        updated[i] = { ...item, status: 'error', error: msg };
        setQueue([...updated]);
      }
    }

    setRunning(false);
    setProgress({ label: 'Done', message: 'All queued files have finished processing.', stage: 'complete', percent: 100 });
    const ok = updated.filter((u) => u.status === 'done').length;
    toast({
      title: 'Compression finished',
      description: `${ok} of ${updated.length} PDF${updated.length === 1 ? '' : 's'} ready to download.`,
    });
  };

  const downloadOne = (item: QueuedFile) => {
    if (!item.result) return;
    downloadFile(item.result.downloadUrl, item.result.fileName);
  };

  const downloadAll = async () => {
    const done = queue.filter((q) => q.result);
    for (const item of done) {
      downloadOne(item);
      await new Promise((r) => setTimeout(r, 250));
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            PDF Compressor — Reduce PDF Size
          </CardTitle>
          <CardDescription>
            Uses a server-side Ghostscript engine to optimize PDF objects and embedded images without rasterizing every page. Actual output size is measured; the original is kept if optimization makes the file larger.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={!bulk ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setBulk(false);
                setQueue((q) => q.slice(0, 1));
              }}
              disabled={running}
            >
              Single PDF
            </Button>
            <Button
              type="button"
              variant={bulk ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={() => setBulk(true)}
              disabled={running}
            >
              <Files className="h-4 w-4" />
              Bulk (up to {MAX_BULK})
            </Button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
              dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
              running && 'opacity-60 pointer-events-none'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple={bulk}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium mb-1">
              {bulk ? 'Drop PDF files here' : 'Drop a PDF here'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Max {formatBytes(MAX_FILE_BYTES)} per file · Secure server-side processing
            </p>
            <Button type="button" onClick={() => inputRef.current?.click()} disabled={running}>
              Choose PDF{bulk ? 's' : ''}
            </Button>
          </div>

          {/* Levels */}
          <div className="space-y-2">
            <Label>Compression level</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PDF_COMPRESS_LEVELS.map((l) => {
                const selected = levelId === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    disabled={running}
                    onClick={() => setLevelId(l.id)}
                    className={cn(
                      'text-left rounded-lg border p-3 transition-all',
                      selected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm">{l.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{l.subtitle}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              Choose a quality level, then optionally set a target size. Actual output is measured from the finished PDF; target sizes are best-effort, not guaranteed.
            </p>
          </div>

          {/* Target size */}
          <div className="space-y-2 rounded-lg border p-4">
            <Label htmlFor="pdf-target-size">Target file size (optional)</Label>
            <select
              id="pdf-target-size"
              value={targetSize}
              onChange={(event) => setTargetSize(event.target.value)}
              disabled={running}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No fixed target — optimize for selected quality</option>
              <option value="102400">Under 100 KB (best effort)</option>
              <option value="153600">Under 150 KB (best effort)</option>
              <option value="204800">Under 200 KB (best effort)</option>
              <option value="307200">Under 300 KB (best effort)</option>
              <option value="512000">Under 500 KB (best effort)</option>
              <option value="1048576">Under 1 MB (best effort)</option>
              <option value="2097152">Under 2 MB (best effort)</option>
              <option value="5242880">Under 5 MB (best effort)</option>
              <option value="10485760">Under 10 MB (best effort)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              A target size triggers multiple compression attempts. Very small targets may reduce scan readability, and some PDFs cannot reach the requested size.
            </p>
          </div>

          {old}
          {queue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {queue.length} file{queue.length === 1 ? '' : 's'}
                </Label>
                <Button type="button" variant="ghost" size="sm" onClick={clearAll} disabled={running}>
                  Clear
                </Button>
              </div>
              <ul className="space-y-2">
                {queue.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatBytes(item.file.size)}
                        {item.result && (
                          <>
                            {' '}→{' '}
                            <span className="text-primary font-medium">
                              {formatBytes(item.result.bytes)} actual output
                            </span>
                            {item.result.compressed ? (
                              <span> ({Math.round((1 - item.result.bytes / item.result.originalBytes) * 100)}% smaller)</span>
                            ) : (
                              <span> (original retained)</span>
                            )}
                          </>
                        )}
                        {item.result && (
                          <p className="text-xs text-muted-foreground mt-1">{item.result.message}</p>
                        )}
                        {item.result && (
                          <p className="text-xs text-muted-foreground mt-1">Processed in {(item.result.durationMs / 1000).toFixed(1)}s{item.result.contentPreset ? ' · Detected content: ' + item.result.contentPreset : ''}</p>
                        )}
                      </div>
                      {item.error && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {item.error}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'done' && (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <Button type="button" size="sm" onClick={() => downloadOne(item)}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </>
                      )}
                      {item.status === 'working' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {item.status !== 'working' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Remove"
                          disabled={running}
                          onClick={() => removeFile(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {running && (
            <div className="space-y-3 rounded-xl border p-4" aria-live="polite" aria-atomic="true">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-sm">Processing your PDF</p>
                    <span className="text-sm font-medium tabular-nums">{progress.percent}%</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{progress.label}</p>
                  <p className="mt-1 text-sm">{progress.message || 'Please keep this tab open while your PDF is processed.'}</p>
                </div>
              </div>
              <Progress value={progress.percent} />
              {progress.stage === 'optimizing' && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span>Optimization can take longer for scanned PDFs or documents with many large images. The percentage will update when the server completes the next step.</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                {[
                  { id: 'uploading', label: 'Upload' },
                  { id: 'analyzing', label: 'Analyze' },
                  { id: 'optimizing', label: 'Optimize' },
                  { id: 'verifying', label: 'Verify' },
                  { id: 'uploading-result', label: 'Prepare download' },
                ].map((step) => {
                  const active = progress.stage === step.id || (step.id === 'uploading' && progress.stage === 'uploaded');
                  const done = progress.stage === 'complete' ||
                    (step.id === 'uploading' && ['analyzing', 'optimizing', 'verifying', 'uploading-result'].includes(progress.stage)) ||
                    (step.id === 'analyzing' && ['optimizing', 'verifying', 'uploading-result'].includes(progress.stage)) ||
                    (step.id === 'optimizing' && ['verifying', 'uploading-result'].includes(progress.stage)) ||
                    (step.id === 'verifying' && progress.stage === 'uploading-result');
                  return (
                    <div key={step.id} className={cn(
                      'rounded-md border px-2 py-2 text-center',
                      active && 'border-primary bg-primary/5 font-semibold',
                      done && 'border-primary/30 text-primary'
                    )}>
                      {done ? '✓ ' : active ? '● ' : ''}{step.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              className="flex-1"
              disabled={!queue.length || running}
              onClick={() => void runCompress()}
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Compressing…
                </>
              ) : (
                `Compress ${queue.length || ''} PDF${queue.length === 1 ? '' : 's'}`.trim()
              )}
            </Button>
            {queue.some((q) => q.result) && (
              <Button type="button" variant="outline" onClick={() => void downloadAll()} disabled={running}>
                <Download className="h-4 w-4 mr-2" />
                Download all
              </Button>
            )}
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              PDFs are processed on the FYN Tools backend with Ghostscript. Text and vector content are preserved where the optimizer supports it, but image downsampling can affect fine detail. If the result is not smaller, the original is retained. Files are temporarily stored in Cloudflare R2 to provide a download link; configure a lifecycle rule to automatically delete objects under pdf-compressor/ after 1 day. Always review important documents after compression.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default PdfCompressor;
