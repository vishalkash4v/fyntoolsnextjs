'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Camera, ExternalLink, RotateCcw, RefreshCw, Image as ImageIcon, Smartphone, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';
import jsQR from 'jsqr';

// Play success sound and vibrate (long) on successful scan
const playSuccessFeedback = () => {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([400, 100, 400]); // Long vibrate pattern
    }
  } catch (_) {}
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (_) {}
};

interface CameraDevice {
  deviceId: string;
  label: string;
  facingMode?: 'user' | 'environment';
}

const QRScanner = () => {
  const [scannedResult, setScannedResult] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'align'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanFrameRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const lastPreviewUpdateRef = useRef<number>(0);
  const isScanningRef = useRef(false);
  const playbackStartedRef = useRef(false);
  const scanStartTimeRef = useRef<number>(0);

  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  // Detect device type
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    const ios = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const android = /android/i.test(userAgent.toLowerCase());
    
    setIsMobile(mobile);
    setIsIOS(ios);
    setIsAndroid(android);
  }, []);

  // Check for camera API only - no getUserMedia on mount (Safari blocks it without user gesture)
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Camera API not supported in this browser');
    } else {
      setHasCamera(true); // Allow user to try - actual permission requested on Start click
    }
  }, []);

  // QR Code detection function using jsQR
  const detectQRCode = useCallback((imageData: ImageData) => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });
      
      if (code) {
        return code.data;
      }
      
      return null;
    } catch (error) {
      console.error('QR detection error:', error);
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setScanStatus('idle');
    setScanMessage('');
    playbackStartedRef.current = false;

    if (scanFrameRef.current !== null) {
      cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = null;
    }
  }, [stream]);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanningRef.current) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA || video.videoWidth === 0 || video.videoHeight === 0) {
      scanFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Draw to visible display canvas (works when video element fails to render - Safari/Firefox)
    const displayCanvas = displayCanvasRef.current;
    if (displayCanvas) {
      const dCtx = displayCanvas.getContext('2d');
      if (dCtx) {
        const maxW = 640;
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        let dw = vw, dh = vh;
        if (vw > maxW) {
          dw = maxW;
          dh = Math.round((vh * maxW) / vw);
        }
        if (displayCanvas.width !== dw || displayCanvas.height !== dh) {
          displayCanvas.width = dw;
          displayCanvas.height = dh;
        }
        dCtx.drawImage(video, 0, 0, vw, vh, 0, 0, dw, dh);
      }
    }
    
    const now = Date.now();
    
    // Update preview image more frequently for desktop (every 500ms)
    if (!isMobile && previewCanvasRef.current && now - lastPreviewUpdateRef.current > 500) {
      const previewCanvas = previewCanvasRef.current;
      const previewCtx = previewCanvas.getContext('2d');
      if (previewCtx) {
        const previewWidth = Math.min(video.videoWidth, 640);
        const previewHeight = Math.min(video.videoHeight, 480);
        previewCanvas.width = previewWidth;
        previewCanvas.height = previewHeight;
        previewCtx.drawImage(video, 0, 0, previewWidth, previewHeight);
        setPreviewImage(previewCanvas.toDataURL('image/jpeg', 0.8));
        lastPreviewUpdateRef.current = now;
      }
    }
    
    // Throttle scanning to avoid excessive CPU usage (scan every ~200ms)
    if (now - lastScanTimeRef.current < 200) {
      scanFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    lastScanTimeRef.current = now;
    
    // Use video dimensions, but limit for performance
    const maxDimension = isMobile ? 800 : 1200;
    let width = video.videoWidth;
    let height = video.videoHeight;
    
    if (width > maxDimension || height > maxDimension) {
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = detectQRCode(imageData);
    
    if (result && result !== scannedResult) {
      setScanStatus('success');
      setScanMessage('Success!');
      playSuccessFeedback();
      setScannedResult(result);
      // Capture final preview before stopping (for desktop)
      if (!isMobile && previewCanvasRef.current && videoRef.current) {
        const previewCanvas = previewCanvasRef.current;
        const previewCtx = previewCanvas.getContext('2d');
        if (previewCtx) {
          const previewWidth = Math.min(videoRef.current.videoWidth, 640);
          const previewHeight = Math.min(videoRef.current.videoHeight, 480);
          previewCanvas.width = previewWidth;
          previewCanvas.height = previewHeight;
          previewCtx.drawImage(videoRef.current, 0, 0, previewWidth, previewHeight);
          setPreviewImage(previewCanvas.toDataURL('image/jpeg', 0.9));
        }
      }
      // Brief green flash before stopping
      setTimeout(() => {
        stopCamera();
        toast.success('QR Code detected!');
      }, 600);
      return;
    }
    
    // Update status: show "align properly" (red) after 2s of scanning with no result
    const scanningDuration = now - scanStartTimeRef.current;
    if (scanningDuration > 2000) {
      setScanStatus('align');
      setScanMessage('Align QR code properly');
    } else {
      setScanStatus('scanning');
      setScanMessage('Align QR in frame');
    }
    
    // Continue scanning
    scanFrameRef.current = requestAnimationFrame(scanFrame);
  }, [detectQRCode, stopCamera, scannedResult, isMobile]);

  // Attach stream to video and start playback - runs AFTER React renders video element (isScanning=true)
  useEffect(() => {
    const video = videoRef.current;
    if (!stream || !isScanning || !video) return;

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    (video as any).defaultMuted = true;

    const beginScanning = () => {
      if (playbackStartedRef.current || !videoRef.current) return;
      playbackStartedRef.current = true;
      scanStartTimeRef.current = Date.now();
      lastScanTimeRef.current = 0;
      setScanStatus('scanning');
      setScanMessage('Align QR in frame');
      if (scanFrameRef.current) cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = requestAnimationFrame(scanFrame);
    };

    const tryPlay = (attempt = 0) => {
      const v = videoRef.current;
      if (!v || playbackStartedRef.current) return;
      v.play()
        .then(beginScanning)
        .catch((err) => {
          console.warn('Video play attempt', attempt + 1, err);
          if (attempt < 4) {
            setTimeout(() => tryPlay(attempt + 1), 150 * (attempt + 1));
          } else {
            console.error('Video play failed after retries:', err);
            const isSecure = window.isSecureContext || window.location?.protocol === 'https:' || window.location?.hostname === 'localhost';
            toast.error(
              isSecure
                ? 'Could not start camera preview. Try again or use upload.'
                : 'Camera needs HTTPS. Use https:// or localhost.'
            );
            setIsProcessing(false);
            stopCamera();
          }
        });
    };

    const onCanPlay = () => {
      if (!playbackStartedRef.current) tryPlay(0);
    };
    const onLoadedMetadata = () => {
      if (!playbackStartedRef.current) tryPlay(0);
    };

    video.onloadedmetadata = onLoadedMetadata;
    video.oncanplay = onCanPlay;
    video.onloadeddata = onCanPlay;

    // Start play attempts: immediate, then after layout
    tryPlay(0);
    const t1 = setTimeout(() => { if (!playbackStartedRef.current) tryPlay(0); }, 100);
    const t2 = setTimeout(() => { if (!playbackStartedRef.current) tryPlay(0); }, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      video.srcObject = null;
      video.onloadedmetadata = null;
      video.oncanplay = null;
      video.onloadeddata = null;
    };
  }, [stream, isScanning, stopCamera, scanFrame]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError('');
      setIsProcessing(true);
      
      // Stop any existing stream first
      if (stream) {
        stopCamera();
        // Wait a bit for stream to fully stop
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Get current camera device
      const currentCamera = availableCameras[currentCameraIndex];
      
      // Build constraints based on device and available camera
      let constraints: MediaStreamConstraints;
      
      if (currentCamera && currentCamera.deviceId) {
        constraints = { video: { deviceId: { exact: currentCamera.deviceId } } };
      } else if (isMobile) {
        // Mobile: prefer back camera - use minimal constraints for compatibility (Safari, Firefox)
        constraints = { video: { facingMode: { ideal: 'environment' } } };
      } else {
        // Desktop: any camera
        constraints = { video: true };
      }

      // Try to get media stream
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintError: any) {
        // If constraints fail, try with simpler constraints
        console.log('Primary constraints failed, trying fallback...', constraintError);
        try {
          if (currentCamera && currentCamera.deviceId) {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { ideal: currentCamera.deviceId } },
            });
          } else {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          }
        } catch (fallbackError: any) {
          throw fallbackError;
        }
      }

      // Enumerate devices now that we have permission (for camera switcher)
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices
          .filter(d => d.kind === 'videoinput')
          .map((d, i) => {
            const label = d.label || `Camera ${i + 1}`;
            const isBack = /back|rear|environment|facing back/i.test(label);
            return { deviceId: d.deviceId, label, facingMode: isBack ? 'environment' as const : 'user' as const };
          });
        videoDevices.sort((a, b) => (a.facingMode === 'environment' ? -1 : b.facingMode === 'environment' ? 1 : 0));
        setAvailableCameras(videoDevices);
      } catch (_) {}

      playbackStartedRef.current = false;
      setStream(mediaStream);
      setIsScanning(true);
      setIsProcessing(false);
      // Video attachment happens in useEffect - video element exists only after React re-renders with isScanning=true
    } catch (error: any) {
      console.error('Camera access error:', error);
      setIsProcessing(false);
      let errorMessage = 'Failed to access camera';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and try again.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found. Please connect a camera or use image upload.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera is already in use by another application. Please close other apps using the camera.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera settings not supported. Trying with basic settings...';
        try {
          const minimalStream = await navigator.mediaDevices.getUserMedia({ video: true });
          playbackStartedRef.current = false;
          setStream(minimalStream);
          setIsScanning(true);
          setIsProcessing(false);
          return; // Video attachment in useEffect
        } catch (finalError) {
          errorMessage = 'Unable to access camera with any settings.';
        }
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  }, [availableCameras, currentCameraIndex, isMobile, scanFrame, stopCamera, stream]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WebP, etc.)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file is too large. Please use an image smaller than 10MB.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Stop camera if running
    if (isScanning) {
      stopCamera();
    }

    setIsProcessing(true);

    const img = new Image();
    img.onerror = () => {
      toast.error('Failed to load image. Please try another file.');
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    img.onload = () => {
      if (!canvasRef.current) {
        setIsProcessing(false);
        return;
      }
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }
      
      // Calculate optimal canvas size (max 2000px to avoid memory issues)
      const maxDimension = 2000;
      let width = img.width;
      let height = img.height;
      
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = detectQRCode(imageData);
      
      setIsProcessing(false);

      if (result) {
        playSuccessFeedback();
        setScannedResult(result);
        toast.success('QR Code detected in image!');
      } else {
        toast.error('No QR Code found in image. Please try another image.');
      }

      // Clean up
      URL.revokeObjectURL(img.src);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    // Load image
    img.src = URL.createObjectURL(file);
  }, [detectQRCode, isScanning, stopCamera]);

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    if (availableCameras.length <= 1) {
      toast.info('Only one camera available');
      return;
    }

    const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
    setCurrentCameraIndex(nextIndex);
    
    // Restart camera with new device
    await stopCamera();
    setTimeout(() => {
      startCamera();
    }, 300);
  }, [availableCameras, currentCameraIndex, startCamera, stopCamera]);

  const openLink = () => {
    if (scannedResult && (scannedResult.startsWith('http') || scannedResult.startsWith('https'))) {
      window.open(scannedResult, '_blank');
    }
  };

  const reset = () => {
    setScannedResult('');
    setPreviewImage(null);
    setScanStatus('idle');
    setScanMessage('');
    stopCamera();
    setCameraError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUrl = scannedResult.startsWith('http') || scannedResult.startsWith('https');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // After rotation (phones/tablets) or window resize, ensure video keeps playing
  useEffect(() => {
    const fixPlayback = () => {
      const v = videoRef.current;
      if (!v || !isScanning || !stream) return;
      v.play().catch(() => {});
    };
    window.addEventListener('orientationchange', fixPlayback);
    window.addEventListener('resize', fixPlayback);
    return () => {
      window.removeEventListener('orientationchange', fixPlayback);
      window.removeEventListener('resize', fixPlayback);
    };
  }, [isScanning, stream]);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Scan QR codes using your camera or upload an image from gallery
            {isMobile && <span className="block mt-1 text-xs">Optimized for mobile devices</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera Section */}
          {hasCamera && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Camera Scanner</h3>
                {availableCameras.length > 1 && (
                  <Button
                    onClick={switchCamera}
                    variant="outline"
                    size="sm"
                    disabled={isScanning || isProcessing}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Switch Camera
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={isScanning ? stopCamera : startCamera}
                  variant={isScanning ? "destructive" : "default"}
                  className="flex-1"
                  size={isMobile ? "lg" : "default"}
                  disabled={isProcessing}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {isProcessing ? 'Starting...' : isScanning ? 'Stop Camera' : 'Start Camera'}
                </Button>
              </div>
              
              {cameraError && (
                <Alert variant="destructive">
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              )}

              {/* Live Camera Preview Card - ALWAYS below Start button */}
              <div className="w-full">
                <p className="text-xs text-center text-muted-foreground mb-2 sm:hidden">
                  Hold steady — align the QR inside the frame
                </p>
                <Card className="overflow-hidden border-2">
                  <div
                    className={`relative w-full min-h-[240px] sm:min-h-[320px] aspect-[4/3] bg-black overflow-hidden transition-all duration-300 ${
                      scanStatus === 'success'
                        ? 'ring-4 ring-green-500 ring-inset'
                        : scanStatus === 'align'
                        ? 'ring-4 ring-red-500 ring-inset'
                        : 'ring-1 ring-border'
                    }`}
                  >
                    {/* Video - receives stream; may not render in some browsers */}
                    <video
                      ref={videoRef}
                      className="absolute inset-0 h-full w-full object-cover bg-black"
                      style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)', opacity: isScanning ? 1 : 0 }}
                      playsInline
                      muted
                      autoPlay
                      disablePictureInPicture
                    />
                    {/* Canvas mirror - reliable preview when video display fails (Safari, Firefox) */}
                    {isScanning && (
                      <canvas
                        ref={displayCanvasRef}
                        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                        style={{ transform: 'translateZ(0)' }}
                      />
                    )}

                    {/* Placeholder overlay when camera not started - covers video so user sees instructions */}
                    {!isScanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-400 p-6">
                        <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                          <div className="absolute inset-0 border-2 border-dashed border-zinc-600 rounded-xl" />
                          <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-zinc-500 rounded-tl" />
                          <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-zinc-500 rounded-tr" />
                          <div className="absolute left-0 bottom-0 h-6 w-6 border-l-2 border-b-2 border-zinc-500 rounded-bl" />
                          <div className="absolute right-0 bottom-0 h-6 w-6 border-r-2 border-b-2 border-zinc-500 rounded-br" />
                          <div className="absolute inset-2 border border-zinc-600/50 rounded-lg" />
                        </div>
                        <p className="text-sm font-medium text-center">
                          Click Start Camera to scan QR code
                        </p>
                        <p className="text-xs text-zinc-500 text-center max-w-[200px]">
                          Point your camera at a QR code once started
                        </p>
                      </div>
                    )}

                    {/* Live overlay when scanning */}
                    {isScanning && (
                      <>
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-md bg-red-600/95 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                          LIVE
                        </div>
                        {scanStatus === 'success' && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-green-500/30">
                            <div className="rounded-xl bg-green-600 px-6 py-3 text-lg font-bold text-white shadow-xl">
                              Success!
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-[8%]">
                          <div className="relative w-[min(85%,280px)] aspect-square max-h-[75%]">
                            <span
                              className={`absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 shadow-sm ${
                                scanStatus === 'success'
                                  ? 'border-green-400'
                                  : scanStatus === 'align'
                                  ? 'border-red-400'
                                  : 'border-white/90'
                              }`}
                            />
                            <span
                              className={`absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 shadow-sm ${
                                scanStatus === 'success'
                                  ? 'border-green-400'
                                  : scanStatus === 'align'
                                  ? 'border-red-400'
                                  : 'border-white/90'
                              }`}
                            />
                            <span
                              className={`absolute left-0 bottom-0 h-8 w-8 rounded-bl-lg border-l-4 border-b-4 shadow-sm ${
                                scanStatus === 'success'
                                  ? 'border-green-400'
                                  : scanStatus === 'align'
                                  ? 'border-red-400'
                                  : 'border-white/90'
                              }`}
                            />
                            <span
                              className={`absolute right-0 bottom-0 h-8 w-8 rounded-br-lg border-r-4 border-b-4 shadow-sm ${
                                scanStatus === 'success'
                                  ? 'border-green-400'
                                  : scanStatus === 'align'
                                  ? 'border-red-400'
                                  : 'border-white/90'
                              }`}
                            />
                            <div
                              className={`absolute inset-0 rounded-lg ring-1 ${
                                scanStatus === 'success'
                                  ? 'ring-green-400/50'
                                  : scanStatus === 'align'
                                  ? 'ring-red-400/50'
                                  : 'ring-white/20'
                              }`}
                            />
                          </div>
                        </div>
                        <div
                          className={`absolute bottom-0 left-0 right-0 px-3 py-2 pt-8 ${
                            scanStatus === 'success'
                              ? 'bg-gradient-to-t from-green-900/90 to-transparent'
                              : scanStatus === 'align'
                              ? 'bg-gradient-to-t from-red-900/90 to-transparent'
                              : 'bg-gradient-to-t from-black/70 to-transparent'
                          }`}
                        >
                          <p
                            className={`text-center text-sm font-medium sm:text-base ${
                              scanStatus === 'success'
                                ? 'text-green-100'
                                : scanStatus === 'align'
                                ? 'text-red-100'
                                : 'text-white/95'
                            }`}
                          >
                            {scanMessage || 'Position the QR code in the frame'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
                {!isMobile && previewImage && isScanning && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground text-center">Live preview</p>
                    <div className="relative mx-auto max-w-sm overflow-hidden rounded-lg border border-border bg-muted">
                      <img
                        src={previewImage}
                        alt=""
                        className="max-h-40 w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* File Upload Section - Enhanced for mobile gallery access */}
          <div className="space-y-4">
            <h3 className="font-semibold">Upload from Gallery</h3>
            <div className="space-y-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
                size={isMobile ? "lg" : "default"}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {isMobile ? 'Choose from Gallery' : 'Upload QR Code Image'}
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground text-center">
                Supports JPG, PNG, WebP, and other image formats
                {isMobile && <span className="block mt-1">Tap to choose from gallery or take a photo</span>}
              </p>
            </div>
          </div>

          {/* Hidden Canvas for Processing */}
          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={previewCanvasRef} className="hidden" />

          {/* Results Section */}
          {scannedResult && (
            <div className="space-y-4">
              <h3 className="font-semibold">Scanned Result</h3>
              <Alert>
                <AlertDescription>
                  <div className="space-y-3">
                    <div className="font-mono text-sm bg-muted p-3 rounded break-all">
                      {scannedResult}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <CopyButton
                        textToCopy={scannedResult}
                        successMessage="Result copied to clipboard!"
                        variant="outline"
                        size="sm"
                      />
                      {isUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={openLink}
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Open Link
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={reset}
                      >
                        <RotateCcw className="mr-2 h-3 w-3" />
                        Scan Another
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!hasCamera && !cameraError && (
            <Alert>
              <AlertDescription>
                Camera not available on this device. You can still upload images containing QR codes from your gallery.
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">How to use:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {hasCamera && (
                <li>1. Tap "Start Camera" to scan QR codes in real-time</li>
              )}
              <li>{hasCamera ? '2' : '1'}. Upload an image from your gallery</li>
              <li>{hasCamera ? '3' : '2'}. The scanned content will appear below</li>
              <li>{hasCamera ? '4' : '3'}. Copy the result or open links directly</li>
              {isMobile && (
                <>
                  <li className="mt-2 pt-2 border-t border-border">
                    <strong>Mobile Tips:</strong>
                  </li>
                  <li>• Allow camera permissions when prompted</li>
                  <li>• Use back camera for better QR code scanning</li>
                  <li>• Ensure good lighting for best results</li>
                  <li>• Hold phone steady for faster detection</li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;
