'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, Image as ImageIcon, X, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Maximum file size: 15MB
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
const MAX_FILE_SIZE_MB = 15;
const MAX_DIMENSION = 8000; // Max width or height

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

// Before/After Slider Component (Mobile-friendly with touch support)
const BeforeAfterSlider: React.FC<{
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
}> = ({ beforeImage, afterImage, beforeLabel, afterLabel }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  }, [isDragging, updateSliderPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || touchIdRef.current === null) return;
    e.preventDefault();
    e.stopPropagation();
    
    const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
    if (touch) {
      updateSliderPosition(touch.clientX);
    }
  }, [isDragging, updateSliderPosition]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    touchIdRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
        document.removeEventListener('touchcancel', handleEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  const handleStart = useCallback((clientX: number, touchId?: number) => {
    setIsDragging(true);
    if (touchId !== undefined) {
      touchIdRef.current = touchId;
    }
    updateSliderPosition(clientX);
  }, [updateSliderPosition]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden border-2 border-border cursor-col-resize select-none touch-none"
      onMouseDown={(e) => {
        e.preventDefault();
        handleStart(e.clientX);
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          handleStart(touch.clientX, touch.identifier);
        }
      }}
    >
      {/* After (full base) */}
      <img
        src={afterImage}
        alt="After"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
      <div className="absolute top-2 right-2 z-[5] bg-green-600/90 text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow-lg pointer-events-none">
        AFTER
      </div>
      <div className="absolute top-10 right-2 z-[5] bg-black/70 text-white px-2 py-1 rounded text-xs pointer-events-none">
        {afterLabel}
      </div>

      {/* Before reveal from left — width tracks handle with no CSS transition lag */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden z-[2] pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className="absolute top-0 left-0 h-full object-contain max-w-none"
          style={{
            width: containerWidth ? `${containerWidth}px` : '100%',
          }}
          draggable={false}
        />
        <div className="absolute top-2 left-2 bg-red-600/90 text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow-lg">
          BEFORE
        </div>
        <div className="absolute top-10 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Line (no transition-all — that caused stick/image desync) */}
      <div
        className="absolute top-0 bottom-0 w-0.5 sm:w-1 bg-white shadow-2xl z-10 pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing touch-none pointer-events-auto">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-3 border-primary rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-md text-[10px] sm:text-xs font-medium shadow-lg pointer-events-none">
        <span className="hidden sm:inline">Drag slider to compare • </span>
        {Math.round(sliderPosition)}% Before / {Math.round(100 - sliderPosition)}% After
      </div>
    </div>
  );
};

const ImageUpscaler: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [upscaledDimensions, setUpscaledDimensions] = useState<{ width: number; height: number } | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);
  const [upscaledFileSize, setUpscaledFileSize] = useState<number | null>(null);

  const [scale, setScale] = useState<'2x' | '4x'>('2x');
  const [mode, setMode] = useState<'photo' | 'illustration'>('photo');
  const [enhancementLevel, setEnhancementLevel] = useState<number[]>([50]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const API_URL = 'https://express-two-umber.vercel.app/api/images';

  // Calculate estimated processing time (more accurate)
  const calculateEstimatedTime = useCallback((fileSize: number, scale: '2x' | '4x', width: number, height: number) => {
    // Base time factors:
    // - Upload time: ~2-8 seconds depending on file size and network
    // - Processing time: depends on pixel count and scale
    const pixelCount = width * height;
    const megapixels = pixelCount / 1000000;
    
    // Upload time (2-8 seconds based on file size, with network overhead)
    const uploadTime = Math.min(8000, 2000 + (fileSize / (1024 * 1024)) * 3000);
    
    // Processing time (depends on megapixels and scale)
    // Base: 3-5 seconds per megapixel for 2x, 6-10 seconds per megapixel for 4x
    // Larger images take proportionally more time
    const processingTimePerMP = scale === '2x' ? 3000 + (megapixels * 500) : 6000 + (megapixels * 1000);
    const processingTime = megapixels * processingTimePerMP;
    
    // Add buffer for network latency and server processing overhead
    const buffer = 3000;
    
    const total = Math.round(uploadTime + processingTime + buffer);
    // Minimum 5 seconds, maximum 60 seconds
    return Math.max(5000, Math.min(60000, total));
  }, []);

  // Handle file validation and preview
  const handleFile = useCallback((file: File) => {
    // Prevent file selection while processing
    if (isProcessing) {
      setError('Please wait for current processing to complete or cancel it first.');
      return;
    }
    
    setError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      const errorMsg = 'Only JPG, JPEG, PNG, and WebP images are allowed';
      setError(errorMsg);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = `File too large. Maximum file size is ${MAX_FILE_SIZE_MB}MB. Your file is ${formatFileSize(file.size)}.`;
      setError(errorMsg);
      return;
    }

    // Clean up old URLs
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (upscaledUrl) {
      if (upscaledUrl.startsWith('blob:')) URL.revokeObjectURL(upscaledUrl);
    }

    // Reset state
    setUpscaledUrl(null);
    setUpscaledDimensions(null);
    setUpscaledFileSize(null);
    setSelectedFile(file);
    setOriginalFileSize(file.size);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;

      // Validate dimensions
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const errorMsg = `Image dimensions too large. Maximum dimension is ${MAX_DIMENSION}px. Your image is ${width}x${height}px.`;
        setError(errorMsg);
        setSelectedFile(null);
        setPreviewUrl(null);
        URL.revokeObjectURL(url);
        return;
      }

      setOriginalDimensions({ width, height });
    };
    img.onerror = () => {
      setError('Failed to load image. Please try a different file.');
      setSelectedFile(null);
      setPreviewUrl(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [previewUrl, upscaledUrl, isProcessing, toast]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (isProcessing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (isProcessing) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      toast({ 
        title: 'Processing in progress', 
        description: 'Please wait for current processing to complete or cancel it first.', 
        variant: 'destructive' 
      });
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile, isProcessing, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  // Cancel processing
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
    setIsProcessing(false);
    setProgress(0);
    setEstimatedTime(null);
    setTimeRemaining(null);
    toast({ title: 'Processing cancelled', description: 'The upscaling process has been cancelled.' });
  }, [toast]);

  // Process image
  const processImage = useCallback(async () => {
    if (!selectedFile || !originalDimensions) {
      setError('Please select an image first.');
      return;
    }

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
      return;
    }

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setIsProcessing(true);
      setProgress(5);
      setError(null);

      // Calculate and set estimated time based on actual image dimensions
      const estimated = calculateEstimatedTime(
        selectedFile.size, 
        scale, 
        originalDimensions.width, 
        originalDimensions.height
      );
      setEstimatedTime(estimated);
      setTimeRemaining(estimated);

      const startTime = Date.now();

      // Update time remaining every second
      timeIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, estimated - elapsed);
        setTimeRemaining(remaining);
      }, 1000);

      // Prepare form data
      setProgress(5);
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('scale', scale);
      formData.append('mode', mode);
      formData.append('enhancementLevel', enhancementLevel[0].toString());

      setProgress(10);

      // Start upload with realistic progress simulation
      const uploadStartTime = Date.now();
      
      // Simulate upload progress (10-40%) - faster for smaller files
      const uploadProgressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 40) {
            // Faster progress for smaller files
            const increment = selectedFile.size < 2 * 1024 * 1024 ? 3 : 2;
            return Math.min(40, prev + increment);
          }
          return prev;
        });
      }, 150);

      // Start actual upload
      const response = await fetch(`${API_URL}/upscale`, {
        method: 'POST',
        body: formData,
        signal: signal, // Add abort signal
      });

      // Clear upload progress interval
      clearInterval(uploadProgressInterval);
      
      const uploadTime = Date.now() - uploadStartTime;
      console.log(`Upload took ${uploadTime}ms`);

      // Upload complete, now processing (40-95%)
      setProgress(40);
      
      // Simulate processing progress - slower and more realistic
      const processingProgressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 95) {
            // Slower progress during processing
            return Math.min(95, prev + 0.8);
          }
          return prev;
        });
      }, 250);

      // Wait for response while showing processing progress
      const result = await response.json();
      
      // Clear processing progress interval when response arrives
      clearInterval(processingProgressInterval);
      setProgress(90);

      const totalTime = Date.now() - uploadStartTime;
      console.log(`Total processing took ${totalTime}ms`);

      if (!response.ok) {
        let errorMessage = 'Failed to upscale image';
        if (result && result.error) {
          errorMessage = result.error;
        } else {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setProgress(95);

      if (!result.success) {
        throw new Error(result.error || 'Upscaling failed');
      }

      // Clean up old upscaled URL
      if (upscaledUrl && upscaledUrl.startsWith('blob:')) {
        URL.revokeObjectURL(upscaledUrl);
      }

      setUpscaledUrl(result.data);
      setUpscaledDimensions(result.newSize);
      setUpscaledFileSize(parseFloat(result.sizeKB) * 1024);
      setProgress(100);
      
      const actualTime = result.processingTime || estimatedTime || 0;
      setEstimatedTime(null);
      setTimeRemaining(null);

      toast({
        title: 'Image upscaled successfully',
        description: `Output: ${result.newSize.width}×${result.newSize.height}px • ${formatFileSize(parseFloat(result.sizeKB) * 1024)} • Processed in ${(actualTime / 1000).toFixed(1)}s`,
      });
    } catch (err: any) {
      // Clear time interval on error
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }

      // Check if it was aborted
      if (err.name === 'AbortError' || signal.aborted) {
        console.log('Request aborted by user');
        return; // Don't show error for user cancellation
      }

      console.error('Upscale error:', err);
      const errorMsg = err.message || 'An error occurred while processing the image. Please try again.';
      setError(errorMsg);
      toast({ title: 'Processing failed', description: errorMsg, variant: 'destructive' });
      setProgress(0);
      setEstimatedTime(null);
      setTimeRemaining(null);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [selectedFile, originalDimensions, scale, mode, enhancementLevel, error, upscaledUrl, estimatedTime, calculateEstimatedTime, toast]);

  // Download upscaled image
  const downloadImage = useCallback(() => {
    if (!upscaledUrl || !selectedFile) return;

    try {
      const base64Data = upscaledUrl.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid image data');
      }

      const byteString = atob(base64Data);
      const mimeString = upscaledUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      const base = selectedFile.name.replace(/\.[^/.]+$/, '');
      const filename = `${base}_upscaled_${scale}_${mode}_${enhancementLevel[0]}.webp`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      // Silent download - no toast needed
    } catch (err: any) {
      console.error('Download error:', err);
      toast({ title: 'Download failed', description: err.message || 'Could not download image.', variant: 'destructive' });
    }
  }, [upscaledUrl, selectedFile, scale, mode, enhancementLevel, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (upscaledUrl && upscaledUrl.startsWith('blob:')) URL.revokeObjectURL(upscaledUrl);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [previewUrl, upscaledUrl]);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Image Upscaler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag & Drop Upload Area */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 md:p-12 transition-all ${
              isProcessing
                ? 'border-muted bg-muted/30 cursor-not-allowed opacity-60'
                : isDragging
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            } ${error ? 'border-destructive' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="hidden"
            />

            {!previewUrl ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold mb-2">
                    Drag & drop your image here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    Select Image
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: {MAX_FILE_SIZE_MB}MB • Max dimension: {MAX_DIMENSION}px • Supported: JPG, PNG, WebP
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{selectedFile?.name}</span>
                    {originalFileSize && (
                      <span className="text-sm text-muted-foreground">
                        ({formatFileSize(originalFileSize)})
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isProcessing) {
                        cancelProcessing();
                      }
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setUpscaledUrl(null);
                      setOriginalDimensions(null);
                      setUpscaledDimensions(null);
                      setError(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {originalDimensions && (
                  <div className="text-sm text-muted-foreground">
                    Original: {originalDimensions.width}×{originalDimensions.height}px
                  </div>
                )}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-md border"
                />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Controls Panel */}
          {previewUrl && originalDimensions && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Scale Selector */}
                  <div className="space-y-2">
                    <Label>Upscale Factor</Label>
                    <Select value={scale} onValueChange={(value) => setScale(value as '2x' | '4x')} disabled={isProcessing}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2x">2x (Double Size)</SelectItem>
                        <SelectItem value="4x">4x (Quadruple Size)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Output: {originalDimensions.width * (scale === '2x' ? 2 : 4)}×{originalDimensions.height * (scale === '2x' ? 2 : 4)}px
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <Label>Enhancement Mode</Label>
                    <Select value={mode} onValueChange={(value) => setMode(value as 'photo' | 'illustration')} disabled={isProcessing}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">Photo Mode</SelectItem>
                        <SelectItem value="illustration">Illustration Mode</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {mode === 'photo' ? 'Moderate sharpening, natural look' : 'Stronger sharpening, enhanced edges'}
                    </p>
                  </div>

                  {/* Enhancement Level */}
                  <div className="space-y-2">
                    <Label>Enhancement Level: {enhancementLevel[0]}%</Label>
                    <Slider
                      value={enhancementLevel}
                      onValueChange={setEnhancementLevel}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-muted-foreground">
                      Adjust sharpening intensity
                    </p>
                  </div>
                </div>

                {/* Process Button and Cancel Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={processImage}
                    disabled={isProcessing || !!error}
                    className="flex-1"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Upscale Image
                      </>
                    )}
                  </Button>
                  {isProcessing && (
                    <Button
                      onClick={cancelProcessing}
                      variant="destructive"
                      size="lg"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>

                {/* Progress Bar and Time Estimate */}
                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <p className="text-muted-foreground font-medium">
                        {progress < 20 && 'Preparing image...'}
                        {progress >= 20 && progress < 50 && 'Uploading to server...'}
                        {progress >= 50 && progress < 85 && 'Processing & upscaling image...'}
                        {progress >= 85 && progress < 95 && 'Applying enhancements...'}
                        {progress >= 95 && 'Finalizing...'}
                      </p>
                      {timeRemaining !== null && timeRemaining > 0 && (
                        <p className="font-semibold text-primary">
                          ~{Math.ceil(timeRemaining / 1000)}s left
                        </p>
                      )}
                    </div>
                    {estimatedTime && (
                      <p className="text-xs text-center text-muted-foreground">
                        Estimated time: {Math.ceil(estimatedTime / 1000)}s • Progress: {progress}%
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Before/After Comparison */}
          {previewUrl && upscaledUrl && upscaledDimensions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Before & After Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BeforeAfterSlider
                  beforeImage={previewUrl}
                  afterImage={upscaledUrl}
                  beforeLabel={`Original: ${originalDimensions.width}×${originalDimensions.height}px`}
                  afterLabel={`Upscaled: ${upscaledDimensions.width}×${upscaledDimensions.height}px`}
                />
                
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Original: {formatFileSize(originalFileSize || 0)}</div>
                    <div>Upscaled: {formatFileSize(upscaledFileSize || 0)}</div>
                    <div>Scale: {scale} • Mode: {mode} • Enhancement: {enhancementLevel[0]}%</div>
                  </div>
                  <Button onClick={downloadImage} className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Download Upscaled Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUpscaler;
