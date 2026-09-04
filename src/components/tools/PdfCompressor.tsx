'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  estimateCompressedBytes,
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

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const PdfCompressor = () => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [bulk, setBulk] = useState(false);
  const [levelId, setLevelId] = useState<PdfCompressLevelId>('optimized');
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ label: '', percent: 0 });

  const level = useMemo(
    () => PDF_COMPRESS_LEVELS.find((l) => l.id === levelId) ?? PDF_COMPRESS_LEVELS[2]!,
    [levelId]
  );

  const totalOriginal = queue.reduce((s, q) => s + q.file.size, 0);
  const estimatedTotal = queue.reduce(
    (s, q) => s + estimateCompressedBytes(q.file.size, level),
    0
  );

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
    setProgress({ label: '', percent: 0 });
  };

  const runCompress = async () => {
    if (!queue.length || running) return;
    setRunning(true);

    const updated = [...queue];
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i]!;
      updated[i] = { ...item, status: 'working', error: undefined };
      setQueue([...updated]);
      setProgress({ label: item.file.name, percent: 0 });

      try {
        const result = await compressPdfFile(item.file, levelId, (p) => {
          setProgress({
            label: `${p.fileName} — page ${p.page}/${p.totalPages}`,
            percent: p.percent,
          });
        });
        updated[i] = { ...item, status: 'done', result };
        setQueue([...updated]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Compression failed';
        updated[i] = { ...item, status: 'error', error: msg };
        setQueue([...updated]);
      }
    }

    setRunning(false);
    setProgress({ label: 'Done', percent: 100 });
    const ok = updated.filter((u) => u.status === 'done').length;
    toast({
      title: 'Compression finished',
      description: `${ok} of ${updated.length} PDF${updated.length === 1 ? '' : 's'} ready to download.`,
    });
  };

  const downloadOne = (item: QueuedFile) => {
    if (!item.result) return;
    downloadBlob(item.result.blob, item.result.fileName);
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
            PDF Compressor — Compress PDF to 150KB
          </CardTitle>
          <CardDescription>
            Free online PDF compressor for single or bulk files. Six quality levels with estimated
            size before you compress — ideal for government forms, email, and 150KB PDF upload limits.
            Runs in your browser (no signup).
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
              Max {formatBytes(MAX_FILE_BYTES)} per file · Client-side only
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
                const est =
                  queue.length > 0
                    ? queue.reduce((s, q) => s + estimateCompressedBytes(q.file.size, l), 0)
                    : null;
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
                      {l.targetBytes && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          ~150 KB
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{l.subtitle}</p>
                    {est != null && (
                      <p className="text-xs font-medium mt-2 text-primary">
                        Est. ~{formatBytes(est)}
                        {queue.length === 1 ? '' : ` total`}
                      </p>
                    )}
                    {est == null && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ~{Math.round(l.estimateRatio * 100)}% of original
                        {l.targetBytes ? ' (or under 150 KB)' : ''}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            {queue.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected: <strong>{level.name}</strong> — original{' '}
                {formatBytes(totalOriginal)} → estimated ~{formatBytes(estimatedTotal)}
              </p>
            )}
          </div>

          {/* Queue */}
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
                            {' '}
                            →{' '}
                            <span className="text-primary font-medium">
                              {formatBytes(item.result.bytes)}
                            </span>{' '}
                            (
                            {Math.max(
                              0,
                              Math.round(
                                (1 - item.result.bytes / item.result.originalBytes) * 100
                              )
                            )}
                            % smaller)
                          </>
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
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="truncate pr-2">{progress.label}</span>
                <span>{progress.percent}%</span>
              </div>
              <Progress value={progress.percent} />
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
              Pages are re-encoded as high-efficiency JPEG images inside a new PDF. That is how free
              compressors shrink scanned forms and photo-heavy PDFs toward 150KB limits. Text-only
              PDFs may not shrink as much — use Compact or Compress to ~150 KB for upload portals.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default PdfCompressor;
