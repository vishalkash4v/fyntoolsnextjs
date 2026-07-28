'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Upload, Download, Image as ImageIcon, X, Loader2, Zap, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';

// Maximum file size: 15MB (increased like upscaler)
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
const MAX_FILE_SIZE_MB = 15;
const MAX_DIMENSION = 8000; // Max width or height

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Before/After Slider Component (Mobile-friendly)
const BeforeAfterSlider: React.FC<{
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
}> = ({ beforeImage, afterImage, beforeLabel, afterLabel }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const touchIdRef = useRef<number | null>(null);

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
      onMouseDown={(e) => handleStart(e.clientX)}
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          handleStart(touch.clientX, touch.identifier);
        }
      }}
    >
      {/* Before Image - Full background (left side) */}
      <div className="absolute inset-0">
        <img 
          src={beforeImage} 
          alt="Before" 
          className="w-full h-full object-contain"
          draggable={false}
        />
        {/* Before Label - Red, on left side */}
        <div className="absolute top-2 left-2 bg-red-600/90 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold shadow-lg">
          BEFORE
        </div>
        <div className="absolute top-8 sm:top-10 left-2 bg-black/70 text-white px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs max-w-[40%] truncate">
          {beforeLabel}
        </div>
      </div>

      {/* After Image - Clipped to show on right side */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <img 
          src={afterImage} 
          alt="After" 
          className="w-full h-full object-contain"
          draggable={false}
        />
        {/* After Label - Green, on right side */}
        <div className="absolute top-2 right-2 bg-green-600/90 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold shadow-lg">
          AFTER
        </div>
        <div className="absolute top-8 sm:top-10 right-2 bg-black/70 text-white px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs max-w-[40%] truncate">
          {afterLabel}
        </div>
      </div>

      {/* Slider Line */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 sm:w-1 bg-white shadow-2xl z-10 transition-all pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
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

type CompressionMode = 'auto' | 'targetSize' | 'manual';
type SocialPreset = 'none' | 'instagram-post' | 'instagram-story' | 'youtube-thumbnail' | 'whatsapp';

const ImageCompressor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [previewCompressedUrl, setPreviewCompressedUrl] = useState<string | null>(null); // Real-time preview
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [compressedDimensions, setCompressedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);
  const [compressedFileSize, setCompressedFileSize] = useState<number | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [finalFormat, setFinalFormat] = useState<string>('webp');
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageRefForPreview = useRef<HTMLImageElement | null>(null);

  const [mode, setMode] = useState<CompressionMode>('auto');
  const [targetSizeKB, setTargetSizeKB] = useState<string>('');
  const [quality, setQuality] = useState<number[]>([80]);
  const [outputFormat, setOutputFormat] = useState<string>('webp');
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(true);
  const [progressive, setProgressive] = useState<boolean>(false);
  const [smartResize, setSmartResize] = useState<boolean>(false);
  const [preset, setPreset] = useState<SocialPreset>('none');

  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { toast } = useToast();

  // Real-time preview processing for manual mode
  const processRealTimePreview = useCallback(async (
    img: HTMLImageElement,
    qualityValue: number,
    format: string
  ) => {
    // Clear any pending preview
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    // Debounce for smooth slider interaction (100ms delay)
    previewTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          
          if (!ctx) return;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0);

          const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
          const quality = format === 'jpeg' || format === 'webp' ? qualityValue / 100 : undefined;
          const dataUrl = canvas.toDataURL(mimeType, quality);

          setPreviewCompressedUrl(dataUrl);
          
          // Calculate preview stats
          const previewSize = (dataUrl.length * 3) / 4;
          if (originalFileSize) {
            const previewRatio = ((1 - previewSize / originalFileSize) * 100);
            setCompressionRatio(previewRatio);
            setCompressedFileSize(previewSize);
          }
          setCompressedDimensions({ width: img.width, height: img.height });
        } catch (error) {
          console.error('Preview error:', error);
        }
      });
    }, 100); // 100ms debounce
  }, [originalFileSize]);

  // Handle file validation and preview
  const handleFile = useCallback((file: File) => {
    if (isCompressing) {
      setError('Please wait for current compression to complete or cancel it first.');
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
    if (compressedUrl) {
      if (compressedUrl.startsWith('blob:')) URL.revokeObjectURL(compressedUrl);
    }

    // Reset state
    setCompressedUrl(null);
    setCompressedDimensions(null);
    setCompressedFileSize(null);
    setCompressionRatio(null);
    setProcessingTime(null);
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
      imageRefForPreview.current = img;
      // Auto-process in manual mode for real-time preview
      if (mode === 'manual') {
        processRealTimePreview(img, quality[0], outputFormat);
      }
    };
    img.onerror = () => {
      setError('Failed to load image. Please try a different file.');
      setSelectedFile(null);
      setPreviewUrl(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [previewUrl, compressedUrl, isCompressing, mode, quality, outputFormat]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (isCompressing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [isCompressing]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (isCompressing) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setError('Please wait for current compression to complete or cancel it first.');
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile, isCompressing]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  // Genuine compression via browser-image-compression (never return a larger file)
  const compressImageFrontend = useCallback(async (
    file: File,
    quality: number,
    format: string,
    targetSizeKB: number | undefined,
    smartResizeEnabled: boolean | undefined,
    currentPreset: SocialPreset
  ): Promise<{ dataUrl: string; dimensions: { width: number; height: number }; fileSize: number; format: string }> => {
    const mime =
      format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';

    // Optional dimension constraints from presets / smart resize
    let maxWidthOrHeight: number | undefined;
    if (currentPreset === 'instagram-post' || currentPreset === 'instagram-story') {
      maxWidthOrHeight = currentPreset === 'instagram-story' ? 1920 : 1080;
    } else if (currentPreset === 'youtube-thumbnail') {
      maxWidthOrHeight = 1280;
    } else if (currentPreset === 'whatsapp') {
      maxWidthOrHeight = 1600;
    } else if (smartResizeEnabled) {
      maxWidthOrHeight = 2048;
    }

    const quality01 = Math.min(1, Math.max(0.1, quality / 100));
    const targetMB = targetSizeKB ? Math.max(0.01, targetSizeKB / 1024) : undefined;

    const tryCompress = async (q: number, maxMB?: number) =>
      imageCompression(file, {
        maxSizeMB: maxMB ?? Math.max(0.05, (file.size * 0.92) / (1024 * 1024)),
        maxWidthOrHeight,
        useWebWorker: true,
        fileType: mime,
        initialQuality: q,
        alwaysKeepResolution: !maxWidthOrHeight,
      });

    let compressed = await tryCompress(quality01, targetMB);

    // Retry harder if still larger than original (common with PNG→PNG / already-optimized JPEG)
    if (compressed.size >= file.size) {
      const harderFormats: string[] =
        mime === 'image/png' ? ['image/webp', 'image/jpeg'] : mime === 'image/webp' ? ['image/jpeg'] : [];
      for (const alt of harderFormats) {
        const altFile = await imageCompression(file, {
          maxSizeMB: Math.max(0.04, (file.size * 0.85) / (1024 * 1024)),
          maxWidthOrHeight: maxWidthOrHeight ?? 2560,
          useWebWorker: true,
          fileType: alt,
          initialQuality: Math.min(0.75, quality01),
        });
        if (altFile.size < compressed.size) {
          compressed = altFile;
        }
        if (compressed.size < file.size) break;
      }
    }

    if (compressed.size >= file.size) {
      // Still not smaller — return original bytes rather than a fake "compression"
      const dataUrl = await imageCompression.getDataUrlFromFile(file);
      const bitmap = await createImageBitmap(file);
      const dims = { width: bitmap.width, height: bitmap.height };
      bitmap.close?.();
      return {
        dataUrl,
        dimensions: dims,
        fileSize: file.size,
        format: file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpeg',
      };
    }

    const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
    const bitmap = await createImageBitmap(compressed);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close?.();
    const outFormat = compressed.type.includes('png')
      ? 'png'
      : compressed.type.includes('webp')
        ? 'webp'
        : 'jpeg';

    return { dataUrl, dimensions: dims, fileSize: compressed.size, format: outFormat };
  }, []);

  // Compress image - Frontend only, instant processing
  const compressImage = useCallback(async () => {
    if (!selectedFile || !originalDimensions) {
      setError('Please select an image first.');
      return;
    }

    if (error) {
      return;
    }

    try {
      setIsCompressing(true);
      setProgress(10);
      setError(null);

      const startTime = Date.now();
      setProgress(30);

      // Determine compression parameters
      let compressionQuality = quality[0];
      let compressionFormat = outputFormat;
      let targetKB: number | undefined;

      if (mode === 'auto') {
        // Auto mode: try WebP first, fallback to JPEG
        compressionFormat = 'webp';
        compressionQuality = 80;
      } else if (mode === 'targetSize') {
        const kb = parseFloat(targetSizeKB || '0');
        if (kb <= 0) {
          throw new Error('Please enter a valid target size in KB');
        }
        targetKB = kb;
        compressionFormat = preset === 'none' ? outputFormat : 'jpeg';
      } else if (mode === 'manual') {
        compressionQuality = quality[0];
        compressionFormat = outputFormat;
      }

      // Apply preset format
      if (preset !== 'none') {
        compressionFormat = 'jpeg';
      }

      setProgress(50);

      // Compress using frontend Canvas API
      const result = await compressImageFrontend(
        selectedFile,
        compressionQuality,
        compressionFormat,
        targetKB,
        smartResize,
        preset
      );

      setProgress(80);

      // Clean up old compressed URL
      if (compressedUrl && compressedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(compressedUrl);
      }

      const processingTime = Date.now() - startTime;
      const compressionRatio = originalFileSize 
        ? ((1 - result.fileSize / originalFileSize) * 100)
        : 0;

      setCompressedUrl(result.dataUrl);
      setCompressedDimensions(result.dimensions);
      setCompressedFileSize(result.fileSize);
      setCompressionRatio(compressionRatio);
      setProcessingTime(processingTime);
      setFinalFormat(result.format || compressionFormat);
      setProgress(100);
      
      // In manual mode, also update preview to match final result
      if (mode === 'manual') {
        setPreviewCompressedUrl(result.dataUrl);
      }

      if (result.fileSize >= (originalFileSize || 0)) {
        toast({
          title: 'Already optimized',
          description:
            'This file is already small. We kept the original instead of making it larger.',
        });
      } else {
        toast({
          title: 'Image compressed successfully',
          description: `Size reduced by ${compressionRatio.toFixed(1)}% • ${formatFileSize(result.fileSize)}`,
        });
      }
    } catch (err: any) {
      console.error('Compression error:', err);
      const errorMsg = err.message || 'An error occurred while compressing the image. Please try again.';
      setError(errorMsg);
      toast({ title: 'Compression failed', description: errorMsg, variant: 'destructive' });
      setProgress(0);
    } finally {
      setIsCompressing(false);
    }
  }, [selectedFile, originalDimensions, mode, targetSizeKB, quality, outputFormat, smartResize, preset, error, compressedUrl, originalFileSize, compressImageFrontend, toast]);

  // Download compressed image
  const downloadImage = useCallback(() => {
    if (!compressedUrl || !selectedFile) return;

    try {
      const base64Data = compressedUrl.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid image data');
      }

      const byteString = atob(base64Data);
      const mimeString = compressedUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      const base = selectedFile.name.replace(/\.[^/.]+$/, '');
      // Get extension from final format
      const ext = finalFormat === 'jpeg' ? 'jpg' : finalFormat === 'jpg' ? 'jpg' : finalFormat;
      const filename = `${base}_compressed_${mode}_${quality[0] || 'auto'}.${ext}`;

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
  }, [compressedUrl, selectedFile, mode, quality, finalFormat, toast]);

  // Calculate email-safe size (typically < 1MB)
  const isEmailSafe = compressedFileSize ? compressedFileSize < 1024 * 1024 : false;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (compressedUrl && compressedUrl.startsWith('blob:')) URL.revokeObjectURL(compressedUrl);
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [previewUrl, compressedUrl]);

  // Reset preset when mode changes
  useEffect(() => {
    if (mode === 'auto') {
      setPreset('none');
    }
  }, [mode]);

  // Real-time preview in manual mode
  useEffect(() => {
    if (mode === 'manual' && imageRefForPreview.current && selectedFile && !isCompressing) {
      processRealTimePreview(imageRefForPreview.current, quality[0], outputFormat);
    }
  }, [mode, quality, outputFormat, selectedFile, isCompressing, processRealTimePreview]);

  // Cleanup preview timeout
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
      if (previewCompressedUrl && previewCompressedUrl.startsWith('data:')) {
        // Data URLs don't need revoking, but we can clear the state
      }
    };
  }, [previewCompressedUrl]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Smart Image Compressor
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
              isCompressing
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
              disabled={isCompressing}
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
                    disabled={isCompressing}
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
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setCompressedUrl(null);
                      setOriginalDimensions(null);
                      setCompressedDimensions(null);
                      setError(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={isCompressing}
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
                {/* Compression Mode */}
                <div className="space-y-2">
                  <Label>Compression Mode</Label>
                  <Select value={mode} onValueChange={(value) => setMode(value as CompressionMode)} disabled={isCompressing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Auto (Recommended)
                        </div>
                      </SelectItem>
                      <SelectItem value="targetSize">Target Size</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {mode === 'auto' && 'Automatically selects best format and quality'}
                    {mode === 'targetSize' && 'Compress to a specific file size'}
                    {mode === 'manual' && 'Full control over quality and format'}
                  </p>
                </div>

                {/* Social Media Presets */}
                <div className="space-y-2">
                  <Label>Social Media Presets (Optional)</Label>
                  <Select value={preset} onValueChange={(value) => setPreset(value as SocialPreset)} disabled={isCompressing || mode === 'auto'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="instagram-post">Instagram Post (1080×1080)</SelectItem>
                      <SelectItem value="instagram-story">Instagram Story (1080×1920)</SelectItem>
                      <SelectItem value="youtube-thumbnail">YouTube Thumbnail (1280×720)</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp Optimized (1600×1600)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Size Mode */}
                {mode === 'targetSize' && (
                  <div className="space-y-2">
                    <Label>Target Size (KB)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={targetSizeKB}
                      onChange={(e) => setTargetSizeKB(e.target.value)}
                      placeholder="e.g., 100"
                      disabled={isCompressing}
                    />
                    <p className="text-xs text-muted-foreground">
                      System will adjust quality to reach this size
                    </p>
                  </div>
                )}

                {/* Manual Mode Controls */}
                {mode === 'manual' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quality: {quality[0]}%</Label>
                      <Slider
                        value={quality}
                        onValueChange={setQuality}
                        min={10}
                        max={100}
                        step={1}
                        className="w-full"
                        disabled={isCompressing}
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher quality = larger file size
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Output Format</Label>
                      <Select value={outputFormat} onValueChange={setOutputFormat} disabled={isCompressing}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="webp">WebP (Best Compression)</SelectItem>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Advanced Options */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Smart Resize + Compress</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically reduce resolution for huge savings
                      </p>
                    </div>
                    <Switch
                      checked={smartResize}
                      onCheckedChange={setSmartResize}
                      disabled={isCompressing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Remove Metadata</Label>
                      <p className="text-xs text-muted-foreground">
                        Strip EXIF data for smaller files
                      </p>
                    </div>
                    <Switch
                      checked={removeMetadata}
                      onCheckedChange={setRemoveMetadata}
                      disabled={isCompressing}
                    />
                  </div>

                  {mode === 'manual' && (
                    <>

                      {outputFormat === 'jpeg' && (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Progressive JPEG</Label>
                            <p className="text-xs text-muted-foreground">
                              Better loading experience
                            </p>
                          </div>
                          <Switch
                            checked={progressive}
                            onCheckedChange={setProgressive}
                            disabled={isCompressing}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Compress Button */}
                <Button
                  onClick={compressImage}
                  disabled={isCompressing || !!error || (mode === 'targetSize' && !targetSizeKB)}
                  className="w-full"
                  size="lg"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      {mode === 'manual' && previewCompressedUrl ? 'Finalize Compression' : 'Compress Image'}
                    </>
                  )}
                </Button>

                {/* Progress Bar and Time Estimate */}
                {isCompressing && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <p className="text-muted-foreground font-medium">
                        {progress < 20 && 'Preparing image...'}
                        {progress >= 20 && progress < 50 && 'Uploading to server...'}
                        {progress >= 50 && progress < 85 && 'Compressing image...'}
                        {progress >= 85 && progress < 95 && 'Optimizing...'}
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

          {/* Compression Results - Show preview in manual mode, final result otherwise */}
          {previewUrl && (compressedUrl || (mode === 'manual' && previewCompressedUrl)) && compressedDimensions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compression Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Before/After Comparison */}
                <BeforeAfterSlider
                  beforeImage={previewUrl}
                  afterImage={mode === 'manual' && previewCompressedUrl ? previewCompressedUrl : compressedUrl || ''}
                  beforeLabel={`Original: ${originalDimensions.width}×${originalDimensions.height}px • ${formatFileSize(originalFileSize || 0)}`}
                  afterLabel={`Compressed: ${compressedDimensions.width}×${compressedDimensions.height}px • ${formatFileSize(compressedFileSize || 0)}`}
                />

                {/* Stats */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Original Size</span>
                      <span className="font-semibold">{formatFileSize(originalFileSize || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Compressed Size</span>
                      <span className="font-semibold text-green-600">{formatFileSize(compressedFileSize || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Reduction</span>
                      <span className="font-semibold text-primary">{compressionRatio?.toFixed(1)}%</span>
                    </div>
                    {processingTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Processing Speed</span>
                        <span className="font-semibold">{(processingTime / 1000).toFixed(1)}s</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Original Dimensions</span>
                      <span className="font-semibold">{originalDimensions.width}×{originalDimensions.height}px</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Compressed Dimensions</span>
                      <span className="font-semibold">{compressedDimensions.width}×{compressedDimensions.height}px</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email Safe</span>
                      <span className={`font-semibold ${isEmailSafe ? 'text-green-600' : 'text-orange-600'}`}>
                        {isEmailSafe ? 'Yes ✓' : 'No (too large)'}
                      </span>
                    </div>
                    {compressedFileSize && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Estimated Email Size</span>
                        <span className="font-semibold">
                          {compressedFileSize < 1024 * 1024 
                            ? `${(compressedFileSize / 1024).toFixed(0)}KB (Safe)` 
                            : `${(compressedFileSize / (1024 * 1024)).toFixed(2)}MB (Large)`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                <Button onClick={downloadImage} className="w-full" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download Compressed Image
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageCompressor;
