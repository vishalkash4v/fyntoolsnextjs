'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Upload,
  Copy,
  Trash2,
  Flashlight,
  FlashlightOff,
  Play,
  Square,
  Download,
  Search,
  Link2,
  History,
  SlidersHorizontal,
  Maximize,
  Minimize,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

type ScanItem = {
  value: string;
  type: string;
  timestamp: string;
  source: 'camera' | 'image';
};

const STORAGE_KEY = 'barcode_scanner_history_v1';
const SCANNER_ID = 'barcode-reader-mount';

const SUPPORTED_FORMATS = [
  'EAN_13',
  'UPC_A',
  'CODE_128',
  'CODE_39',
  'QR_CODE',
] as const;

type SmartType = 'url' | 'product' | 'text';
type ProductInfo = {
  code: string;
  name: string;
  brand: string;
  image: string;
} | null;

const BarcodeScanner = () => {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [continuousScan, setContinuousScan] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [fps, setFps] = useState(18);
  const [scanBoxSize, setScanBoxSize] = useState(300);
  const [duplicateDelayMs, setDuplicateDelayMs] = useState(2500);
  const [result, setResult] = useState<ScanItem | null>(null);
  const [batchResults, setBatchResults] = useState<ScanItem[]>([]);
  const [history, setHistory] = useState<ScanItem[]>([]);
  const [productInfo, setProductInfo] = useState<ProductInfo>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const detectorRef = useRef<any>(null);
  const detectorRafRef = useRef<number | null>(null);
  const continuousRef = useRef(continuousScan);
  const duplicateDelayRef = useRef(duplicateDelayMs);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastScanAtRef = useRef<number>(0);
  const lastScanTextRef = useRef<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ScanItem[];
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {
      // Ignore invalid local storage payload.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
  }, [history]);

  useEffect(() => {
    continuousRef.current = continuousScan;
  }, [continuousScan]);

  useEffect(() => {
    duplicateDelayRef.current = duplicateDelayMs;
  }, [duplicateDelayMs]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(() => undefined);
      }
      if (scanner) {
        scanner.clear().catch(() => undefined);
      }
      if (detectorRafRef.current) {
        cancelAnimationFrame(detectorRafRef.current);
      }
    };
  }, []);

  const detectSmartType = (value: string, format: string): SmartType => {
    if (/^https?:\/\//i.test(value)) return 'url';
    if (/^(EAN|UPC|CODE_128|CODE_39)/i.test(format) && /^\d{8,14}$/.test(value.replace(/\D/g, ''))) {
      return 'product';
    }
    if (/^\d{8,14}$/.test(value.replace(/\D/g, ''))) return 'product';
    return 'text';
  };

  const fetchProductInfo = useCallback(async (value: string, format: string) => {
    const smartType = detectSmartType(value, format);
    if (smartType !== 'product') {
      setProductInfo(null);
      return;
    }
    const code = value.replace(/\D/g, '');
    if (!code) return;
    setIsFetchingProduct(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`);
      if (!response.ok) throw new Error('Product fetch failed');
      const payload = await response.json();
      const product = payload?.product;
      if (!product) {
        setProductInfo(null);
        return;
      }
      setProductInfo({
        code,
        name: product.product_name || 'Unknown product',
        brand: product.brands || 'Unknown brand',
        image: product.image_front_small_url || product.image_front_url || '',
      });
    } catch {
      setProductInfo(null);
    } finally {
      setIsFetchingProduct(false);
    }
  }, []);

  const playFeedback = () => {
    try {
      if ('vibrate' in navigator) navigator.vibrate(200);
    } catch {
      // no-op
    }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1380;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.11);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } catch {
      // no-op
    }
  };

  const appendScan = useCallback(
    (value: string, type: string, source: 'camera' | 'image') => {
      const item: ScanItem = {
        value,
        type: type || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        source,
      };
      setResult(item);
      setHistory((prev) => [item, ...prev].slice(0, 100));
      if (continuousScan) {
        setBatchResults((prev) => [item, ...prev].slice(0, 500));
      }
      playFeedback();
      setSuccessPulse(true);
      setTimeout(() => setSuccessPulse(false), 550);
      fetchProductInfo(item.value, item.type).catch(() => undefined);
    },
    [continuousScan, fetchProductInfo],
  );

  const ensureScanner = async () => {
    if (scannerRef.current) return scannerRef.current;
    const mod = await import('html5-qrcode');
    const scanner = new mod.Html5Qrcode(SCANNER_ID, false);
    scannerRef.current = scanner;
    return scanner;
  };

  const stopDetectorLoop = () => {
    if (detectorRafRef.current) {
      cancelAnimationFrame(detectorRafRef.current);
      detectorRafRef.current = null;
    }
  };

  const initBarcodeDetector = async () => {
    try {
      const DetectorCtor = (window as any).BarcodeDetector;
      if (!DetectorCtor) {
        detectorRef.current = null;
        return;
      }
      const supported = await DetectorCtor.getSupportedFormats();
      const preferredFormats = [
        'ean_13',
        'ean_8',
        'upc_a',
        'upc_e',
        'code_128',
        'code_39',
        'itf',
        'codabar',
        'qr_code',
      ].filter((f) => supported.includes(f));
      detectorRef.current = new DetectorCtor({
        formats: preferredFormats.length ? preferredFormats : undefined,
      });
    } catch {
      detectorRef.current = null;
    }
  };

  const startDetectorLoop = () => {
    stopDetectorLoop();
    const step = async () => {
      if (!isScanning) {
        if (!scannerRef.current?.isScanning) {
          detectorRafRef.current = requestAnimationFrame(step);
          return;
        }
      }
      const detector = detectorRef.current;
      const videoEl = document.querySelector(`#${SCANNER_ID} video`) as HTMLVideoElement | null;
      if (!detector || !videoEl || videoEl.readyState < 2) {
        detectorRafRef.current = requestAnimationFrame(step);
        return;
      }
      try {
        const now = Date.now();
        const detections = await detector.detect(videoEl);
        const first = detections?.[0];
        const raw = first?.rawValue;
        const fmt = String(first?.format || 'UNKNOWN').toUpperCase();
        if (raw) {
          if (!(lastScanTextRef.current === raw && now - lastScanAtRef.current < duplicateDelayRef.current)) {
            lastScanTextRef.current = raw;
            lastScanAtRef.current = now;
            appendScan(raw, fmt, 'camera');
            if (!continuousRef.current) {
              stopScan().catch(() => undefined);
              return;
            }
          }
        }
      } catch {
        // keep loop alive
      }
      detectorRafRef.current = requestAnimationFrame(step);
    };
    detectorRafRef.current = requestAnimationFrame(step);
  };

  const stopScan = useCallback(async () => {
    const scanner = scannerRef.current;
    stopDetectorLoop();
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      await scanner.clear();
    } catch {
      // ignore cleanup failure
    } finally {
      setIsScanning(false);
      setFlashOn(false);
    }
  }, []);

  const startScan = useCallback(async () => {
    setErrorMessage('');
    setIsStarting(true);
    try {
      const mod = await import('html5-qrcode');
      const scanner = await ensureScanner();
      const cameras = await mod.Html5Qrcode.getCameras();
      if (!cameras.length) {
        throw new Error('No camera found on this device.');
      }

      const rearCamera =
        cameras.find((c) => /back|rear|environment/i.test(c.label)) ?? cameras[0];
      const frontFacing = !/back|rear|environment/i.test(rearCamera.label || '');
      setIsFrontCamera(frontFacing);

      const qrWidth = Math.max(240, Math.min(scanBoxSize, Math.floor(window.innerWidth * 0.88)));
      const qrHeight = Math.max(140, Math.floor(qrWidth * 0.52));

      const onDecoded = (decodedText: string, decodedResult: any) => {
        const now = Date.now();
        const format =
          decodedResult?.result?.format?.formatName ||
          decodedResult?.result?.format?.toString?.() ||
          'UNKNOWN';
        if (lastScanTextRef.current === decodedText && now - lastScanAtRef.current < duplicateDelayMs) {
          return;
        }
        lastScanTextRef.current = decodedText;
        lastScanAtRef.current = now;
        appendScan(decodedText, format, 'camera');
        if (!continuousScan) {
          stopScan().catch(() => undefined);
        }
      };

      const scanConfig = {
        fps,
        qrbox: { width: qrWidth, height: qrHeight },
        aspectRatio: 1.777,
        disableFlip: !frontFacing,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      };

      // IMPORTANT: html5-qrcode start() only accepts deviceId/facingMode in camera config.
      const cameraProfiles: Array<any> = [
        { deviceId: { exact: rearCamera.id } },
        { deviceId: { ideal: rearCamera.id } },
        { facingMode: { ideal: frontFacing ? 'user' : 'environment' } },
        { facingMode: frontFacing ? 'user' : 'environment' },
        {},
      ];

      let started = false;
      let lastStartError: unknown = null;
      for (const profile of cameraProfiles) {
        try {
          await scanner.start(profile as any, scanConfig as any, onDecoded, () => undefined);
          started = true;
          break;
        } catch (e) {
          lastStartError = e;
          try {
            if (scanner?.isScanning) {
              await scanner.stop();
            }
            await scanner.clear();
          } catch {
            // ignore reset issues between retries
          }
        }
      }
      if (!started) {
        throw lastStartError || new Error('Unable to initialize camera scanner');
      }
      setIsScanning(true);
      const videoEl = document.querySelector(`#${SCANNER_ID} video`) as HTMLVideoElement | null;
      if (videoEl) {
        videoEl.style.transform = frontFacing ? 'scaleX(-1)' : 'scaleX(1)';
        videoEl.style.transformOrigin = 'center center';
        videoEl.style.objectFit = 'cover';
      }
      const mediaStream = (videoEl?.srcObject as MediaStream | null) ?? null;
      const track = mediaStream?.getVideoTracks?.()[0];
      if (track) {
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        const advanced: any = {};
        if (capabilities.width?.max && capabilities.height?.max) {
          const width = Math.min(1280, capabilities.width.max);
          const height = Math.min(720, capabilities.height.max);
          track.applyConstraints({ width: { ideal: width }, height: { ideal: height } }).catch(() => undefined);
        }
        if (capabilities.frameRate?.max) {
          track.applyConstraints({ frameRate: { ideal: Math.min(30, capabilities.frameRate.max) } }).catch(() => undefined);
        }
        if (capabilities.focusMode?.includes?.('continuous')) advanced.focusMode = 'continuous';
        if (capabilities.exposureMode?.includes?.('continuous')) advanced.exposureMode = 'continuous';
        if (capabilities.whiteBalanceMode?.includes?.('continuous')) advanced.whiteBalanceMode = 'continuous';
        if (capabilities.zoom?.max && capabilities.zoom?.max >= 1) advanced.zoom = 1;
        if (Object.keys(advanced).length) {
          track.applyConstraints({ advanced: [advanced] }).catch(() => undefined);
        }
      }
      await initBarcodeDetector();
      startDetectorLoop();
      toast.success('Scanner started');
    } catch (error: any) {
      const message = String(error?.message || '');
      if (/permission|NotAllowedError/i.test(message)) {
        setErrorMessage('Camera permission denied. Please allow camera access and try again.');
      } else if (/NotReadableError|TrackStartError|Could not start video source/i.test(message)) {
        setErrorMessage('Camera is busy in another app/tab. Close other camera apps and retry.');
      } else if (/OverconstrainedError|constraints/i.test(message)) {
        setErrorMessage('Camera constraints failed. Retrying with basic profile failed too. Please try another browser.');
      } else {
        setErrorMessage(`Unable to start scanner. ${message ? `(${message})` : ''}`.trim());
      }
    } finally {
      setIsStarting(false);
    }
  }, [appendScan, continuousScan, duplicateDelayMs, fps, scanBoxSize, stopScan]);

  const toggleFlash = async () => {
    const scanner = scannerRef.current;
    if (!scanner || !isScanning) return;
    try {
      await scanner.applyVideoConstraints({
        advanced: [{ torch: !flashOn } as any],
      });
      setFlashOn((prev) => !prev);
    } catch {
      toast.error('Flashlight not supported on this device/camera.');
    }
  };

  const scanImageFile = async (file: File) => {
    setErrorMessage('');
    try {
      const scanner = await ensureScanner();
      if (isScanning) await stopScan();
      let decodedText = '';
      let decodedType = 'UNKNOWN';
      if (typeof scanner.scanFileV2 === 'function') {
        const detailed = await scanner.scanFileV2(file, true);
        decodedText = detailed?.decodedText || '';
        decodedType =
          detailed?.result?.format?.formatName ||
          detailed?.result?.format?.toString?.() ||
          'UNKNOWN';
      } else {
        decodedText = await scanner.scanFile(file, true);
      }
      if (!decodedText) {
        setErrorMessage('No barcode detected in uploaded image.');
        return;
      }
      appendScan(decodedText, decodedType, 'image');
      toast.success('Barcode detected from image');
    } catch {
      setErrorMessage('No barcode detected in uploaded image.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyResult = async () => {
    if (!result?.value) return;
    await navigator.clipboard.writeText(result.value);
    toast.success('Copied');
  };

  const copyAllResults = async () => {
    const payload = batchResults.length ? batchResults : history;
    if (!payload.length) {
      toast.info('No results to copy');
      return;
    }
    const text = payload.map((x) => `${x.value} | ${x.type} | ${new Date(x.timestamp).toLocaleString()}`).join('\n');
    await navigator.clipboard.writeText(text);
    toast.success('All results copied');
  };

  const clearResult = () => {
    setResult(null);
    setBatchResults([]);
    setErrorMessage('');
    setProductInfo(null);
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success('History cleared');
  };

  const exportCsv = () => {
    if (!history.length) {
      toast.info('No history to export');
      return;
    }
    const header = 'value,type,source,timestamp';
    const rows = history.map((item) =>
      [`"${item.value.replace(/"/g, '""')}"`, item.type, item.source, item.timestamp].join(','),
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'barcode-scan-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    if (!history.length) {
      toast.info('No history to export');
      return;
    }
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'barcode-scan-history.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const canOpenUrl = useMemo(() => {
    if (!result?.value) return false;
    try {
      const u = new URL(result.value.startsWith('http') ? result.value : `https://${result.value}`);
      return Boolean(u.hostname);
    } catch {
      return false;
    }
  }, [result?.value]);

  const openAsUrl = () => {
    if (!result?.value) return;
    const finalUrl = result.value.startsWith('http') ? result.value : `https://${result.value}`;
    window.open(finalUrl, '_blank');
  };

  const smartType = useMemo(() => {
    if (!result) return 'text' as SmartType;
    return detectSmartType(result.value, result.type);
  }, [result]);

  const analytics = useMemo(() => {
    const total = history.length;
    const unique = new Set(history.map((h) => h.value)).size;
    const last = history[0]?.timestamp ?? null;
    return { total, unique, last };
  }, [history]);

  const toggleFullscreen = async () => {
    const container = scannerContainerRef.current;
    if (!container) return;
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      toast.error('Fullscreen is not supported in this browser.');
    }
  };

  return (
    <div className="w-full space-y-4 pb-24 px-0 sm:px-2">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Scan Barcode Online Using Camera (Free)</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/barcode-generator')}>
              Back to Generator
            </Button>
          </div>
          <CardDescription>
            Premium barcode scanner with smart detection, product lookup, settings, and exports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-6">
          <div className="hidden md:flex flex-wrap gap-2">
            <Button onClick={isScanning ? stopScan : startScan} disabled={isStarting}>
              {isScanning ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isStarting ? 'Starting Camera...' : isScanning ? 'Stop Scan' : 'Start Scan'}
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            <Button variant="outline" onClick={() => setContinuousScan((v) => !v)}>
              Continuous: {continuousScan ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline" onClick={toggleFlash} disabled={!isScanning}>
              {flashOn ? <FlashlightOff className="mr-2 h-4 w-4" /> : <Flashlight className="mr-2 h-4 w-4" />}
              Flash
            </Button>
            <Button variant="outline" onClick={() => setShowSettings((v) => !v)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="mr-2 h-4 w-4" /> : <Maximize className="mr-2 h-4 w-4" />}
              Fullscreen
            </Button>
          </div>

          {showSettings && (
            <Card className="border-dashed">
              <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">FPS: {fps}</label>
                  <input type="range" min={6} max={24} value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-sm font-medium">Scan Box Size: {scanBoxSize}px</label>
                  <input type="range" min={220} max={420} value={scanBoxSize} onChange={(e) => setScanBoxSize(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-sm font-medium">Duplicate Delay: {Math.round(duplicateDelayMs / 100) / 10}s</label>
                  <input type="range" min={1200} max={5000} step={100} value={duplicateDelayMs} onChange={(e) => setDuplicateDelayMs(Number(e.target.value))} className="w-full" />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input id="continuous-toggle" type="checkbox" checked={continuousScan} onChange={(e) => setContinuousScan(e.target.checked)} />
                  <label htmlFor="continuous-toggle" className="text-sm">Continuous Scan Mode</label>
                </div>
              </CardContent>
            </Card>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) scanImageFile(file);
            }}
          />

          <div ref={scannerContainerRef} className={`relative rounded-xl border bg-black overflow-hidden transition-all ${isFullscreen ? 'fixed inset-0 z-[120] rounded-none border-none' : ''}`}>
            <div id={SCANNER_ID} className="w-full min-h-[360px] sm:min-h-[420px]" />
            {!isScanning && (
              <div className="absolute inset-0 grid place-items-center text-white/70 pointer-events-none">
                <div className="text-center">
                  <Camera className="mx-auto h-7 w-7 mb-2" />
                  <p>Press Start Scan to begin camera scanning</p>
                  <p className="text-xs mt-1 text-white/50">Large scan area optimized for 1D and 2D codes</p>
                </div>
              </div>
            )}
            {isScanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="scan-box-wrap relative w-[86%] max-w-[480px] h-[62%] shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                  <div className={`absolute inset-0 rounded-lg transition-all duration-200 ${successPulse ? 'ring-4 ring-emerald-300/90 scale-[1.02]' : 'ring-1 ring-emerald-400/70'}`} />
                  <span className={`scan-corner top-0 left-0 border-t-4 border-l-4 ${successPulse ? 'border-emerald-300' : 'border-emerald-400'}`} />
                  <span className={`scan-corner top-0 right-0 border-t-4 border-r-4 ${successPulse ? 'border-emerald-300' : 'border-emerald-400'}`} />
                  <span className={`scan-corner bottom-0 left-0 border-b-4 border-l-4 ${successPulse ? 'border-emerald-300' : 'border-emerald-400'}`} />
                  <span className={`scan-corner bottom-0 right-0 border-b-4 border-r-4 ${successPulse ? 'border-emerald-300' : 'border-emerald-400'}`} />
                  <span className={`scan-laser ${successPulse ? 'scan-laser-success' : ''}`} />
                </div>
              </div>
            )}
            {successPulse && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Scanned
              </div>
            )}
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card className="border transition-all duration-300">
              <CardContent className="pt-6 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{result.type}</Badge>
                  <Badge variant="outline">{result.source === 'camera' ? 'Camera' : 'Image'}</Badge>
                  <Badge variant="outline">{smartType.toUpperCase()}</Badge>
                </div>
                <div className="p-3 rounded-md bg-muted break-all font-mono text-sm">{result.value}</div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={copyResult}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearResult}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(result.value)}`, '_blank')}>
                    <Search className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  {smartType === 'product' && (
                    <Button variant="outline" size="sm" onClick={() => window.open(`https://www.amazon.in/s?k=${encodeURIComponent(result.value)}`, '_blank')}>
                      <Search className="mr-2 h-4 w-4" />
                      Amazon
                    </Button>
                  )}
                  {canOpenUrl && (
                    <Button variant="outline" size="sm" onClick={openAsUrl}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Open URL
                    </Button>
                  )}
                </div>
                {(isFetchingProduct || productInfo) && (
                  <div className="rounded-lg border p-3 bg-background">
                    <p className="text-sm font-medium mb-2">Product Info</p>
                    {isFetchingProduct && <p className="text-sm text-muted-foreground">Fetching product details...</p>}
                    {!isFetchingProduct && productInfo && (
                      <div className="flex gap-3 items-center">
                        {productInfo.image ? (
                          <img src={productInfo.image} alt={productInfo.name} className="w-14 h-14 rounded object-cover border" />
                        ) : (
                          <div className="w-14 h-14 rounded border grid place-items-center text-xs text-muted-foreground">No Image</div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{productInfo.name}</p>
                          <p className="text-xs text-muted-foreground">{productInfo.brand}</p>
                          <p className="text-xs text-muted-foreground">Code: {productInfo.code}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {batchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Batch Scan Results ({batchResults.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-72 overflow-auto">
                {batchResults.map((item, idx) => (
                  <div key={`${item.timestamp}-${idx}`} className="rounded border p-2 text-sm">
                    <div className="flex gap-2 mb-1">
                      <Badge variant="secondary">{item.type}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="break-all">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Scan History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="rounded-md border p-2">
                  <p className="text-xs text-muted-foreground">Total scans</p>
                  <p className="font-semibold">{analytics.total}</p>
                </div>
                <div className="rounded-md border p-2">
                  <p className="text-xs text-muted-foreground">Unique scans</p>
                  <p className="font-semibold">{analytics.unique}</p>
                </div>
                <div className="rounded-md border p-2">
                  <p className="text-xs text-muted-foreground">Last scan</p>
                  <p className="font-semibold text-xs">{analytics.last ? new Date(analytics.last).toLocaleString() : '-'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportCsv}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportJson}>
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
                <Button variant="outline" size="sm" onClick={copyAllResults}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Copy All
                </Button>
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear History
                </Button>
              </div>
              <div className="space-y-2 max-h-72 overflow-auto">
                {history.length === 0 && (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground">No scans yet. Start camera or upload an image to begin.</p>
                  </div>
                )}
                {history.map((item, idx) => (
                  <div key={`${item.timestamp}-${idx}`} className="rounded border p-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="secondary">{item.type}</Badge>
                      <Badge variant="outline">{item.source}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm break-all">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur p-3">
            <div className="grid grid-cols-5 gap-2">
              <Button size="sm" onClick={isScanning ? stopScan : startScan} disabled={isStarting}>
                {isScanning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={toggleFlash} disabled={!isScanning}>
                {flashOn ? <FlashlightOff className="h-4 w-4" /> : <Flashlight className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setContinuousScan((v) => !v)}>
                {continuousScan ? '∞' : '1'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowSettings((v) => !v)}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <style>{`
        .scan-corner {
          position: absolute;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          filter: drop-shadow(0 0 6px rgba(16,185,129,0.35));
        }
        .scan-laser {
          position: absolute;
          top: 50%;
          left: 18%;
          width: 64%;
          height: 2px;
          background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(239,68,68,0.95) 35%, rgba(248,113,113,0.95) 50%, rgba(239,68,68,0.95) 65%, rgba(0,0,0,0) 100%);
          box-shadow: 0 0 10px rgba(239,68,68,0.9), 0 0 20px rgba(239,68,68,0.35);
          transform: translateX(-38%) translateY(-50%);
          animation: scanner-laser-pan 1.7s ease-in-out infinite alternate;
          will-change: transform;
        }
        .scan-laser-success {
          background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(16,185,129,0.95) 35%, rgba(52,211,153,0.95) 50%, rgba(16,185,129,0.95) 65%, rgba(0,0,0,0) 100%);
          box-shadow: 0 0 10px rgba(16,185,129,0.95), 0 0 20px rgba(16,185,129,0.45);
        }
        @keyframes scanner-laser-pan {
          0% { transform: translateX(-38%) translateY(-50%); }
          100% { transform: translateX(38%) translateY(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .scan-laser { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
