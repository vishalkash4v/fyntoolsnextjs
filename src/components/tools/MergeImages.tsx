'use client';
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Layers, Link2, Clipboard, X, RotateCw, FlipHorizontal, FlipVertical, Type, Image as ImageIcon, ZoomIn, ZoomOut, Undo2, Redo2, Settings, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';

type MergeMode = 'horizontal' | 'vertical' | 'collage';
type OutputFormat = 'png' | 'jpeg' | 'webp';
type SizeAdjustment = 'none' | 'magnify-smallest' | 'reduce-biggest' | 'crop-biggest' | 'match-smallest' | 'match-biggest';
type BorderShape = 'square' | 'rounded' | 'circle';

// Limits
const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per image
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB total
const MAX_CANVAS_DIMENSION = 10000; // Max canvas width/height

// Collage Layouts
interface CollageLayout {
  name: string;
  rows: number;
  cols: number;
  description: string;
}

const COLLAGE_LAYOUTS: CollageLayout[] = [
  { name: '2x2', rows: 2, cols: 2, description: '4 photos grid' },
  { name: '3x2', rows: 3, cols: 2, description: '6 photos grid' },
  { name: '3x3', rows: 3, cols: 3, description: '9 photos grid' },
  { name: '4x3', rows: 4, cols: 3, description: '12 photos grid' },
  { name: '4x4', rows: 4, cols: 4, description: '16 photos grid' },
  { name: '5x4', rows: 5, cols: 4, description: '20 photos grid' },
];

interface ImageData {
  file: File | null;
  url: string;
  width: number;
  height: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  errors?: string[]; // Validation errors for this image
}

const MergeImages = () => {
  const { theme } = useTheme();
  const [images, setImages] = useState<ImageData[]>([]);
  const [mergeMode, setMergeMode] = useState<MergeMode>('horizontal');
  const [gap, setGap] = useState<number>(0);
  
  // Set default background color based on theme
  const getDefaultBgColor = () => {
    if (typeof window === 'undefined') {
      return theme === 'dark' ? '#1a1a1a' : '#ffffff';
    }
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return '#1a1a1a';
    }
    return '#ffffff';
  };
  
  const [bgColor, setBgColor] = useState<string>(getDefaultBgColor());
  
  // Update bgColor when theme changes
  useEffect(() => {
    if (bgColor === '#ffffff' || bgColor === '#1a1a1a') {
      setBgColor(getDefaultBgColor());
    }
  }, [theme]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [outputQuality, setOutputQuality] = useState<number>(92);
  const [mergedDataUrl, setMergedDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const mergeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  
  // Collage mode
  const [selectedCollageLayout, setSelectedCollageLayout] = useState<string>('2x2');
  const [collageGap, setCollageGap] = useState<number>(5);
  
  // Basic mode settings
  const [borderThickness, setBorderThickness] = useState<number>(0);
  const [borderColor, setBorderColor] = useState<string>('#000000');
  const [borderShape, setBorderShape] = useState<BorderShape>('square');
  const [outputWidth, setOutputWidth] = useState<number>(0); // 0 means auto-calculate
  const [outputHeight, setOutputHeight] = useState<number>(0); // 0 means auto-calculate
  const [sizeAdjustment, setSizeAdjustment] = useState<SizeAdjustment>('none');
  
  // Advanced mode settings
  const [padding, setPadding] = useState<number>(0);
  const [autoResize, setAutoResize] = useState<boolean>(false);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [roundedCorners, setRoundedCorners] = useState<number>(0);
  const [shadowEnabled, setShadowEnabled] = useState<boolean>(false);
  const [textOverlay, setTextOverlay] = useState<{ text: string; x: number; y: number; fontSize: number; color: string; bold: boolean; italic: boolean } | null>(null);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(100);
  const [gridColumns, setGridColumns] = useState<number>(2);
  const [socialPreset, setSocialPreset] = useState<string>('custom');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load image from URL
  const loadImageFromUrl = async (url: string): Promise<File> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split('/').pop() || 'image.jpg';
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      throw new Error('Failed to load image from URL');
    }
  };

  // Validate image against requirements
  const validateImage = useCallback((imgData: ImageData, allImages: ImageData[], currentMergeMode: MergeMode, currentGap: number, currentCollageLayout: string, currentCollageGap: number): string[] => {
    const errors: string[] = [];
    
    if (!imgData.file) return errors;
    
    // Check file size
    if (imgData.file.size > MAX_FILE_SIZE) {
      errors.push(`File size (${(imgData.file.size / (1024 * 1024)).toFixed(2)}MB) exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }
    
    // Check total size
    const totalSize = allImages.reduce((sum, img) => sum + (img.file?.size || 0), 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      errors.push(`Total size (${(totalSize / (1024 * 1024)).toFixed(2)}MB) exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit`);
    }
    
    // Check dimensions (estimate canvas size)
    if (currentMergeMode === 'horizontal') {
      const estimatedWidth = allImages.reduce((sum, img) => sum + img.width, 0) + currentGap * (allImages.length - 1);
      const estimatedHeight = Math.max(...allImages.map(img => img.height));
      if (estimatedWidth > MAX_CANVAS_DIMENSION || estimatedHeight > MAX_CANVAS_DIMENSION) {
        errors.push(`Resulting canvas (${estimatedWidth}×${estimatedHeight}px) exceeds ${MAX_CANVAS_DIMENSION}px limit`);
      }
    } else if (currentMergeMode === 'vertical') {
      const estimatedWidth = Math.max(...allImages.map(img => img.width));
      const estimatedHeight = allImages.reduce((sum, img) => sum + img.height, 0) + currentGap * (allImages.length - 1);
      if (estimatedWidth > MAX_CANVAS_DIMENSION || estimatedHeight > MAX_CANVAS_DIMENSION) {
        errors.push(`Resulting canvas (${estimatedWidth}×${estimatedHeight}px) exceeds ${MAX_CANVAS_DIMENSION}px limit`);
      }
    } else if (currentMergeMode === 'collage') {
      const layout = COLLAGE_LAYOUTS.find(l => l.name === currentCollageLayout);
      if (layout) {
        const maxWidth = Math.max(...allImages.map(img => img.width));
        const maxHeight = Math.max(...allImages.map(img => img.height));
        const estimatedWidth = (maxWidth * layout.cols) + (currentCollageGap * (layout.cols + 1));
        const estimatedHeight = (maxHeight * layout.rows) + (currentCollageGap * (layout.rows + 1));
        if (estimatedWidth > MAX_CANVAS_DIMENSION || estimatedHeight > MAX_CANVAS_DIMENSION) {
          errors.push(`Resulting canvas (${estimatedWidth}×${estimatedHeight}px) exceeds ${MAX_CANVAS_DIMENSION}px limit`);
        }
      }
    }
    
    return errors;
  }, []);

  // Load image from File
  const loadImageData = async (file: File, allImages: ImageData[] = []): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const imgData: ImageData = {
          file,
          url: URL.createObjectURL(file),
          width: img.width,
          height: img.height,
          rotation: 0,
          flipH: false,
          flipV: false,
          errors: []
        };
        
        // Validate the image
        imgData.errors = validateImage(imgData, [...allImages, imgData], mergeMode, gap, selectedCollageLayout, collageGap);
        
        resolve(imgData);
      };
      img.onerror = () => reject(new Error(`Failed to load ${file.name}`));
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file upload with limits
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileArray.length === 0) {
      return;
    }

    // Check total count limit
    if (images.length + fileArray.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more.`);
      return;
    }

    // Check file size limits
    const oversizedFiles: string[] = [];
    let totalSize = images.reduce((sum, img) => sum + (img.file?.size || 0), 0);
    
    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
      }
      totalSize += file.size;
    }

    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB limit: ${oversizedFiles.slice(0, 3).join(', ')}`);
      return;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      toast.error(`Total size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit. Please remove some images.`);
      return;
    }

    try {
      // Load images one by one to validate against existing images
      const newImages: ImageData[] = [];
      for (const file of fileArray) {
        const imgData = await loadImageData(file, [...images, ...newImages]);
        newImages.push(imgData);
      }
      
      setImages((prev) => {
        const updated = [...prev, ...newImages];
        // Re-validate all images after adding new ones
        return updated.map(img => ({
          ...img,
          errors: validateImage(img, updated, mergeMode, gap, selectedCollageLayout, collageGap)
        }));
      });
      
      // Show warning if any images have errors
      const imagesWithErrors = newImages.filter(img => img.errors && img.errors.length > 0);
      if (imagesWithErrors.length > 0) {
        toast.warning(`${imagesWithErrors.length} image(s) have size/limit issues. Check the highlighted images.`);
      }
    } catch (error) {
      toast.error('Failed to load some images.');
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files);
    }
  }, []);

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type });
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        await handleFileUpload(imageFiles);
        // Silent paste - no toast
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Handle image link paste
  const handleImageLinkPaste = async () => {
    const link = linkInputRef.current?.value.trim();
    if (!link) {
      return;
    }

    try {
      const file = await loadImageFromUrl(link);
      const imageData = await loadImageData(file);
      setImages((prev) => [...prev, imageData]);
      // Silent load - no toast
      if (linkInputRef.current) linkInputRef.current.value = '';
    } catch (error) {
      toast.error('Failed to load image from URL. Make sure the URL is accessible.');
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].url);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Calculate adjusted image dimensions based on size adjustment option
  const getAdjustedDimensions = (images: ImageData[], adjustment: SizeAdjustment) => {
    if (images.length === 0 || adjustment === 'none') {
      return images.map(img => ({ width: img.width, height: img.height }));
    }

    const widths = images.map(img => img.width);
    const heights = images.map(img => img.height);
    const areas = images.map(img => img.width * img.height);
    
    // Find reference dimensions based on adjustment type
    let referenceWidth: number;
    let referenceHeight: number;
    
    if (adjustment === 'magnify-smallest') {
      // Use biggest image as reference - scale all to match biggest
      referenceWidth = Math.max(...widths);
      referenceHeight = Math.max(...heights);
    } else if (adjustment === 'reduce-biggest') {
      // Use smallest image as reference - scale all to match smallest
      referenceWidth = Math.min(...widths);
      referenceHeight = Math.min(...heights);
    } else if (adjustment === 'crop-biggest') {
      // Use smallest dimensions as reference for cropping biggest
      referenceWidth = Math.min(...widths);
      referenceHeight = Math.min(...heights);
    } else if (adjustment === 'match-smallest') {
      // Use smallest dimensions as reference
      referenceWidth = Math.min(...widths);
      referenceHeight = Math.min(...heights);
    } else if (adjustment === 'match-biggest') {
      // Use biggest dimensions as reference
      referenceWidth = Math.max(...widths);
      referenceHeight = Math.max(...heights);
    } else {
      return images.map(img => ({ width: img.width, height: img.height }));
    }
    
    // Apply adjustment to each image
    return images.map((img) => {
      const imgAspectRatio = img.width / img.height;
      const refAspectRatio = referenceWidth / referenceHeight;
      
      if (adjustment === 'crop-biggest') {
        // Only crop the biggest image to smallest dimensions, keep others original
        const imgArea = img.width * img.height;
        const maxArea = Math.max(...areas);
        if (Math.abs(imgArea - maxArea) < 0.01) { // Handle floating point precision
          // This is the biggest image - resize to smallest dimensions
          return { width: referenceWidth, height: referenceHeight };
        }
        // Other images keep original size
        return { width: img.width, height: img.height };
      } else if (adjustment === 'magnify-smallest') {
        // Scale all images to match biggest dimensions while maintaining aspect ratio
        // Find the scale needed to fit within reference (biggest) dimensions
        const scaleWidth = referenceWidth / img.width;
        const scaleHeight = referenceHeight / img.height;
        const scale = Math.min(scaleWidth, scaleHeight);
        return {
          width: Math.round(img.width * scale),
          height: Math.round(img.height * scale)
        };
      } else if (adjustment === 'reduce-biggest') {
        // Scale all images to match smallest dimensions while maintaining aspect ratio
        // Find the scale needed to fit within reference (smallest) dimensions
        const scaleWidth = referenceWidth / img.width;
        const scaleHeight = referenceHeight / img.height;
        const scale = Math.min(scaleWidth, scaleHeight);
        return {
          width: Math.round(img.width * scale),
          height: Math.round(img.height * scale)
        };
      } else {
        // match-smallest or match-biggest: scale to fit within reference while maintaining aspect ratio
        let scale: number;
        
        // Calculate scale to fit within reference dimensions
        const scaleWidth = referenceWidth / img.width;
        const scaleHeight = referenceHeight / img.height;
        scale = Math.min(scaleWidth, scaleHeight); // Use smaller scale to fit within bounds
        
        return {
          width: Math.round(img.width * scale),
          height: Math.round(img.height * scale)
        };
      }
    });
  };

  // Real-time merge with debouncing for smooth performance
  const merge = useCallback(async () => {
    if (images.length < 2) {
      setMergedDataUrl('');
      return;
    }

    // For collage mode, check if we have enough images for selected layout
    if (mergeMode === 'collage') {
      const layout = COLLAGE_LAYOUTS.find(l => l.name === selectedCollageLayout);
      if (layout && images.length < 2) {
        setMergedDataUrl('');
        return;
      }
    }

    // Clear any pending merge
    if (mergeTimeoutRef.current) {
      clearTimeout(mergeTimeoutRef.current);
    }

    // Debounce for smooth slider interaction (100ms delay)
    mergeTimeoutRef.current = setTimeout(() => {
      setIsProcessing(true);
      
      // Use requestAnimationFrame for smooth processing
      requestAnimationFrame(async () => {
        try {
          const loadedImages = await Promise.all(
        images.map(async (imgData) => {
          const img = new Image();
          return new Promise<{ img: HTMLImageElement; data: ImageData }>((resolve, reject) => {
            img.onload = () => resolve({ img, data: imgData });
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = imgData.url;
          });
        })
      );

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast.error('Canvas is not supported in this browser.');
        setIsProcessing(false);
        return;
      }

      // Optimize canvas rendering for performance
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Get adjusted dimensions
      const adjustedDims = getAdjustedDimensions(images, sizeAdjustment);
      
      let canvasWidth: number;
      let canvasHeight: number;

      if (mergeMode === 'collage') {
        // Collage mode - calculate based on layout
        const layout = COLLAGE_LAYOUTS.find(l => l.name === selectedCollageLayout) || COLLAGE_LAYOUTS[0];
        const maxImageWidth = Math.max(...adjustedDims.map(dim => dim.width));
        const maxImageHeight = Math.max(...adjustedDims.map(dim => dim.height));
        
        // Calculate cell size based on largest image
        const cellWidth = maxImageWidth;
        const cellHeight = maxImageHeight;
        
        // Calculate canvas size with gaps
        canvasWidth = (cellWidth * layout.cols) + (collageGap * (layout.cols + 1));
        canvasHeight = (cellHeight * layout.rows) + (collageGap * (layout.rows + 1));
        
        // Use output size if specified
        if (outputWidth && outputWidth > 0) canvasWidth = outputWidth;
        if (outputHeight && outputHeight > 0) canvasHeight = outputHeight;
      } else if (mergeMode === 'horizontal') {
        const totalWidth = adjustedDims.reduce((sum, dim) => sum + dim.width, 0) + gap * (loadedImages.length - 1);
        const maxHeight = Math.max(...adjustedDims.map(dim => dim.height));
        // Use output size if specified and valid, otherwise calculate from content
        canvasWidth = (outputWidth && outputWidth > 0) ? outputWidth : totalWidth;
        canvasHeight = (outputHeight && outputHeight > 0) ? outputHeight : maxHeight;
      } else {
        const maxWidth = Math.max(...adjustedDims.map(dim => dim.width));
        const totalHeight = adjustedDims.reduce((sum, dim) => sum + dim.height, 0) + gap * (loadedImages.length - 1);
        // Use output size if specified and valid, otherwise calculate from content
        canvasWidth = (outputWidth && outputWidth > 0) ? outputWidth : maxWidth;
        canvasHeight = (outputHeight && outputHeight > 0) ? outputHeight : totalHeight;
      }

      // Ensure minimum dimensions and check max limits
      if (canvasWidth <= 0 || canvasHeight <= 0) {
        toast.error('Invalid canvas dimensions. Please check output size settings.');
        setIsProcessing(false);
        return;
      }

      // Check maximum canvas dimensions to prevent memory issues
      if (canvasWidth > MAX_CANVAS_DIMENSION || canvasHeight > MAX_CANVAS_DIMENSION) {
        toast.error(`Canvas dimensions too large. Maximum is ${MAX_CANVAS_DIMENSION}px. Current: ${canvasWidth}×${canvasHeight}px`);
        setIsProcessing(false);
        return;
      }

      // Check if canvas size would cause memory issues (rough estimate: width * height * 4 bytes)
      const estimatedMemory = canvasWidth * canvasHeight * 4;
      const maxMemory = 500 * 1024 * 1024; // 500MB limit
      if (estimatedMemory > maxMemory) {
        toast.error('Resulting image would be too large. Please reduce image count or dimensions.');
        setIsProcessing(false);
        return;
      }

      try {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      } catch (error) {
        toast.error('Failed to create canvas. Image dimensions may be too large.');
        setIsProcessing(false);
        return;
      }

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Reset filter before drawing (filters should be applied per image, not globally)
      ctx.filter = 'none';
      
      // Draw images based on mode
      if (mergeMode === 'collage') {
        // Collage mode - grid layout
        const layout = COLLAGE_LAYOUTS.find(l => l.name === selectedCollageLayout) || COLLAGE_LAYOUTS[0];
        const cellWidth = Math.floor((canvasWidth - (collageGap * (layout.cols + 1))) / layout.cols);
        const cellHeight = Math.floor((canvasHeight - (collageGap * (layout.rows + 1))) / layout.rows);
        
        let imageIndex = 0;
        for (let row = 0; row < layout.rows && imageIndex < loadedImages.length; row++) {
          for (let col = 0; col < layout.cols && imageIndex < loadedImages.length; col++) {
            const { img, data } = loadedImages[imageIndex];
            const x = collageGap + (col * (cellWidth + collageGap));
            const y = collageGap + (row * (cellHeight + collageGap));
            
            // Calculate scaling to fit cell while maintaining aspect ratio
            const scaleX = cellWidth / img.width;
            const scaleY = cellHeight / img.height;
            const scale = Math.min(scaleX, scaleY);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const offsetX = (cellWidth - scaledWidth) / 2;
            const offsetY = (cellHeight - scaledHeight) / 2;
            
            ctx.save();
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
            ctx.translate(x + offsetX + scaledWidth / 2, y + offsetY + scaledHeight / 2);
            ctx.rotate((data.rotation * Math.PI) / 180);
            ctx.scale(data.flipH ? -1 : 1, data.flipV ? -1 : 1);
            ctx.globalAlpha = opacity / 100;
            ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
            ctx.restore();
            
            imageIndex++;
          }
        }
      } else if (mergeMode === 'horizontal') {
        let x = 0;
        loadedImages.forEach(({ img, data }, index) => {
          const dim = adjustedDims[index];
          const y = Math.max(0, Math.floor((canvasHeight - dim.height) / 2));
          
          ctx.save();
          // Apply filters per image
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
          ctx.translate(x + dim.width / 2, y + dim.height / 2);
          ctx.rotate((data.rotation * Math.PI) / 180);
          ctx.scale(data.flipH ? -1 : 1, data.flipV ? -1 : 1);
          ctx.globalAlpha = opacity / 100;
          ctx.drawImage(img, -dim.width / 2, -dim.height / 2, dim.width, dim.height);
          ctx.restore();
          x += dim.width + gap;
        });
      } else {
        let y = 0;
        loadedImages.forEach(({ img, data }, index) => {
          const dim = adjustedDims[index];
          const x = Math.max(0, Math.floor((canvasWidth - dim.width) / 2));
          
          ctx.save();
          // Apply filters per image
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
          ctx.translate(x + dim.width / 2, y + dim.height / 2);
          ctx.rotate((data.rotation * Math.PI) / 180);
          ctx.scale(data.flipH ? -1 : 1, data.flipV ? -1 : 1);
          ctx.globalAlpha = opacity / 100;
          ctx.drawImage(img, -dim.width / 2, -dim.height / 2, dim.width, dim.height);
          ctx.restore();
          y += dim.height + gap;
        });
      }

      // Add border
      if (borderThickness > 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderThickness;
        
        if (borderShape === 'rounded') {
          const radius = Math.min(canvas.width, canvas.height) * 0.1;
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(canvas.width - radius, 0);
          ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
          ctx.lineTo(canvas.width, canvas.height - radius);
          ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
          ctx.lineTo(radius, canvas.height);
          ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.stroke();
        } else if (borderShape === 'circle') {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = Math.min(canvas.width, canvas.height) / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
        } else {
          ctx.strokeRect(borderThickness / 2, borderThickness / 2, canvas.width - borderThickness, canvas.height - borderThickness);
        }
      }

      // Add rounded corners (for advanced mode)
      if (roundedCorners > 0) {
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        const radius = roundedCorners;
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvas.width - radius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
        ctx.lineTo(canvas.width, canvas.height - radius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
        ctx.lineTo(radius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      // Add shadow (for advanced mode)
      if (shadowEnabled) {
        // Shadow is applied via CSS or separate canvas layer
      }

      // Add text overlay (for advanced mode)
      if (textOverlay) {
        ctx.save();
        ctx.font = `${textOverlay.bold ? 'bold ' : ''}${textOverlay.italic ? 'italic ' : ''}${textOverlay.fontSize}px Arial`;
        ctx.fillStyle = textOverlay.color;
        ctx.fillText(textOverlay.text, textOverlay.x, textOverlay.y);
        ctx.restore();
      }

      const mimeType = outputFormat === 'png' ? 'image/png' : outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
      const quality = outputFormat === 'png' ? undefined : outputQuality / 100;
          const dataUrl = canvas.toDataURL(mimeType, quality);
          
          // Save to history
          setHistory((prev) => [...prev.slice(0, historyIndex + 1), dataUrl].slice(-5));
          setHistoryIndex((prev) => Math.min(prev + 1, 4));
          
          setMergedDataUrl(dataUrl);
          // Silent merge - no toast for real-time processing
        } catch (error: any) {
          console.error('Merge error:', error);
          const errorMessage = error?.message || 'Failed to merge images';
          
          // Provide specific error messages
          if (errorMessage.includes('memory') || errorMessage.includes('too large')) {
            toast.error('Images are too large. Please reduce image count or dimensions.');
          } else if (errorMessage.includes('canvas')) {
            toast.error('Canvas creation failed. Please try with fewer or smaller images.');
          } else if (errorMessage.includes('load')) {
            toast.error('Failed to load one or more images. Please check your images and try again.');
          } else {
            toast.error(`Merge failed: ${errorMessage}. Please try again with fewer images.`);
          }
        } finally {
          setIsProcessing(false);
        }
      });
    }, 100); // 100ms debounce
  }, [images, mergeMode, gap, bgColor, outputFormat, outputQuality, borderThickness, borderColor, borderShape, outputWidth, outputHeight, sizeAdjustment, padding, autoResize, maintainAspectRatio, roundedCorners, shadowEnabled, textOverlay, brightness, contrast, saturation, blur, opacity, historyIndex, selectedCollageLayout, collageGap, toast]);

  // Re-validate images when settings change
  useEffect(() => {
    setImages((prev) => prev.map(img => ({
      ...img,
      errors: validateImage(img, prev, mergeMode, gap, selectedCollageLayout, collageGap)
    })));
  }, [mergeMode, gap, collageGap, selectedCollageLayout, outputWidth, outputHeight, validateImage]);

  // Auto-merge on any change
  useEffect(() => {
    merge();
    return () => {
      if (mergeTimeoutRef.current) {
        clearTimeout(mergeTimeoutRef.current);
      }
    };
  }, [merge]);


  // Download merged image
  const downloadMerged = () => {
    if (!mergedDataUrl) return;
    const link = document.createElement('a');
    link.href = mergedDataUrl;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    link.download = `merged-image.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setMergedDataUrl(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setMergedDataUrl(history[historyIndex + 1]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Merge Images Online
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Upload Section - Simple */}
          <Tabs defaultValue="photo" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="photo">Photo</TabsTrigger>
              <TabsTrigger value="link">Link</TabsTrigger>
              <TabsTrigger value="clipboard">Clipboard</TabsTrigger>
            </TabsList>
            <TabsContent value="photo" className="space-y-3">
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-primary/50 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
                <p className="text-base sm:text-lg font-medium mb-2">Drag & Drop Images Here</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  Max {MAX_IMAGES} images • {MAX_FILE_SIZE / (1024 * 1024)}MB per image
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files || [])}
                  className="hidden"
                />
              </div>
            </TabsContent>
            <TabsContent value="link" className="space-y-3">
              <div className="flex gap-2">
                <Input
                  ref={linkInputRef}
                  type="url"
                  placeholder="Paste image URL here"
                  className="flex-1"
                />
                <Button onClick={handleImageLinkPaste}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Load
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="clipboard" className="space-y-3">
              <div className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center">
                <Clipboard className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium mb-2">Paste Image from Clipboard</p>
                <p className="text-sm text-muted-foreground">Press Ctrl+V (Cmd+V on Mac) to paste</p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Image Previews - Mobile Optimized */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label>Uploaded Images ({images.length}/{MAX_IMAGES})</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {images.length >= 2 && images.filter(img => img.errors && img.errors.length > 0).length === 0 && (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      ✓ Ready to merge
                    </Badge>
                  )}
                  {images.filter(img => img.errors && img.errors.length > 0).length > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {images.filter(img => img.errors && img.errors.length > 0).length} image(s) with issues
                    </Badge>
                  )}
                  {images.length >= MAX_IMAGES && (
                    <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400">
                      ⚠ Max limit reached
                    </Badge>
                  )}
                </div>
              </div>
              {images.filter(img => img.errors && img.errors.length > 0).length > 0 && (
                <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Images with Issues:
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {images.map((img, idx) => 
                      img.errors && img.errors.length > 0 && (
                        <div key={idx} className="pl-6">
                          <strong>Image #{idx + 1}:</strong> {img.errors.join('; ')}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
              {images.length >= MAX_IMAGES && (
                <p className="text-xs text-muted-foreground bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                  Maximum {MAX_IMAGES} images allowed. Remove some images to add more.
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {images.map((imgData, index) => {
                  const hasErrors = imgData.errors && imgData.errors.length > 0;
                  return (
                    <div 
                      key={index} 
                      className={`relative group ${hasErrors ? 'ring-2 ring-destructive ring-offset-2' : ''}`}
                    >
                      <div className="absolute -top-2 -right-2 z-10">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {hasErrors && (
                        <div className="absolute top-0 left-0 z-10 bg-destructive text-destructive-foreground rounded-br-md rounded-tl-md p-1">
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                      )}
                      <img
                        src={imgData.url}
                        alt={`Image ${index + 1}`}
                        className={`w-full h-24 sm:h-32 object-cover rounded-md border-2 ${
                          hasErrors 
                            ? 'border-destructive opacity-75' 
                            : 'border-primary/20'
                        }`}
                      />
                      <div className={`absolute bottom-0 left-0 right-0 text-white text-xs text-center py-1 rounded-b-md ${
                        hasErrors ? 'bg-destructive/80' : 'bg-black/60'
                      }`}>
                        #{index + 1}
                        {hasErrors && (
                          <div className="text-[10px] mt-0.5 opacity-90">
                            {imgData.errors?.length} issue{imgData.errors && imgData.errors.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      {hasErrors && (
                        <div className="absolute inset-0 bg-destructive/10 rounded-md pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Basic and Advanced Tabs */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* BASIC MODE */}
            <TabsContent value="basic" className="space-y-4">
              {/* Merge Mode - Mobile Friendly */}
              <div className="space-y-3">
                <Label>Merge Mode</Label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <Button
                    variant={mergeMode === 'horizontal' ? 'default' : 'outline'}
                    onClick={() => setMergeMode('horizontal')}
                    className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 sm:py-4 text-xs sm:text-sm"
                  >
                    <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Horizontal</span>
                  </Button>
                  <Button
                    variant={mergeMode === 'vertical' ? 'default' : 'outline'}
                    onClick={() => setMergeMode('vertical')}
                    className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 sm:py-4 text-xs sm:text-sm"
                  >
                    <Layers className="h-4 w-4 sm:h-5 sm:w-5 rotate-90" />
                    <span>Vertical</span>
                  </Button>
                  <Button
                    variant={mergeMode === 'collage' ? 'default' : 'outline'}
                    onClick={() => setMergeMode('collage')}
                    className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 sm:py-4 text-xs sm:text-sm"
                  >
                    <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Collage</span>
                  </Button>
                </div>
              </div>

              {/* Collage Layout Selection */}
              {mergeMode === 'collage' && (
                <div className="space-y-3 border-t pt-4">
                  <Label>Collage Layout</Label>
                  {images.length < 2 ? (
                    <p className="text-sm text-muted-foreground">Add at least 2 images to create a collage</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {COLLAGE_LAYOUTS.map((layout) => {
                          const totalSlots = layout.rows * layout.cols;
                          const isAvailable = images.length <= totalSlots;
                          const isRecommended = images.length === totalSlots;
                          return (
                            <Button
                              key={layout.name}
                              variant={selectedCollageLayout === layout.name ? 'default' : 'outline'}
                              onClick={() => setSelectedCollageLayout(layout.name)}
                              disabled={!isAvailable}
                              className={`flex flex-col items-center gap-1 h-auto py-2 text-xs ${
                                isRecommended ? 'ring-2 ring-green-500' : ''
                              }`}
                            >
                              <span className="font-semibold">{layout.name}</span>
                              <span className="text-[10px] opacity-70">{layout.description}</span>
                              {isRecommended && (
                                <span className="text-[10px] text-green-600 font-medium">✓ Perfect fit</span>
                              )}
                              {!isAvailable && images.length > totalSlots && (
                                <span className="text-[10px] text-orange-500">Will use first {totalSlots}</span>
                              )}
                              {!isAvailable && images.length < totalSlots && (
                                <span className="text-[10px] text-red-500">Need {totalSlots - images.length} more</span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedCollageLayout} • You have {images.length} image{images.length !== 1 ? 's' : ''} • 
                        {(() => {
                          const layout = COLLAGE_LAYOUTS.find(l => l.name === selectedCollageLayout);
                          if (layout) {
                            const totalSlots = layout.rows * layout.cols;
                            if (images.length === totalSlots) {
                              return ' Perfect match!';
                            } else if (images.length < totalSlots) {
                              return ` Add ${totalSlots - images.length} more for perfect fit`;
                            } else {
                              return ` First ${totalSlots} images will be used`;
                            }
                          }
                          return '';
                        })()}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Collage Gap */}
              {mergeMode === 'collage' && (
                <div className="space-y-2">
                  <Label>Gap Between Photos: {collageGap}px</Label>
                  <Slider
                    value={[collageGap]}
                    onValueChange={(value) => setCollageGap(value[0])}
                    min={0}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {/* Border Settings - Mobile Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="border-thickness">Border Thickness (px)</Label>
                  <Input
                    id="border-thickness"
                    type="number"
                    min={0}
                    value={borderThickness}
                    onChange={(e) => setBorderThickness(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border-color">Border Color</Label>
                  <Input
                    id="border-color"
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border-shape">Border Shape</Label>
                  <Select value={borderShape} onValueChange={(value) => setBorderShape(value as BorderShape)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Output Size - Mobile Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="output-width">Output Width (px) - 0 for Auto</Label>
                  <Input
                    id="output-width"
                    type="number"
                    min={0}
                    value={outputWidth}
                    onChange={(e) => setOutputWidth(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="Auto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output-height">Output Height (px) - 0 for Auto</Label>
                  <Input
                    id="output-height"
                    type="number"
                    min={0}
                    value={outputHeight}
                    onChange={(e) => setOutputHeight(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="Auto"
                  />
                </div>
              </div>

              {/* Size Adjustment */}
              <div className="space-y-2">
                <Label htmlFor="size-adjustment">Size Adjustment</Label>
                <Select value={sizeAdjustment} onValueChange={(value) => setSizeAdjustment(value as SizeAdjustment)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Keep Original Sizes)</SelectItem>
                    <SelectItem value="magnify-smallest">Magnify Smallest</SelectItem>
                    <SelectItem value="reduce-biggest">Reduce Biggest</SelectItem>
                    <SelectItem value="crop-biggest">Crop Biggest</SelectItem>
                    <SelectItem value="match-smallest">Match Smallest</SelectItem>
                    <SelectItem value="match-biggest">Match Biggest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gap - Only show for horizontal/vertical mode */}
              {mergeMode !== 'collage' && (
                <div className="space-y-2">
                  <Label htmlFor="gap">Gap Between Images (px)</Label>
                  <Input
                    id="gap"
                    type="number"
                    min={0}
                    value={gap}
                    onChange={(e) => setGap(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              )}

              {/* Background Color */}
              <div className="space-y-2">
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder={theme === 'dark' ? '#1a1a1a' : '#ffffff'}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: Use a contrasting color for better visibility. Current theme suggests {theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'light' : 'dark'} backgrounds.
                </p>
              </div>
            </TabsContent>

            {/* ADVANCED MODE */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Auto Resize to Same Size</Label>
                    <Switch checked={autoResize} onCheckedChange={setAutoResize} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Maintain Aspect Ratio</Label>
                    <Switch checked={maintainAspectRatio} onCheckedChange={setMaintainAspectRatio} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merge-padding">Padding (px)</Label>
                  <Input
                    id="merge-padding"
                    type="number"
                    min={0}
                    value={padding}
                    onChange={(e) => setPadding(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rounded-corners">Rounded Corners (px)</Label>
                  <Input
                    id="rounded-corners"
                    type="number"
                    min={0}
                    value={roundedCorners}
                    onChange={(e) => setRoundedCorners(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Shadow Effect</Label>
                    <Switch checked={shadowEnabled} onCheckedChange={setShadowEnabled} />
                  </div>
                </div>
              </div>

              {/* Image Adjustments */}
              <div className="space-y-4 border-t pt-4">
                <Label className="text-lg font-semibold">Image Adjustments</Label>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label>Brightness</Label>
                      <span className="text-sm text-muted-foreground">{brightness}%</span>
                    </div>
                    <Slider
                      value={[brightness]}
                      onValueChange={(value) => setBrightness(value[0])}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label>Contrast</Label>
                      <span className="text-sm text-muted-foreground">{contrast}%</span>
                    </div>
                    <Slider
                      value={[contrast]}
                      onValueChange={(value) => setContrast(value[0])}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label>Saturation</Label>
                      <span className="text-sm text-muted-foreground">{saturation}%</span>
                    </div>
                    <Slider
                      value={[saturation]}
                      onValueChange={(value) => setSaturation(value[0])}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label>Blur</Label>
                      <span className="text-sm text-muted-foreground">{blur}px</span>
                    </div>
                    <Slider
                      value={[blur]}
                      onValueChange={(value) => setBlur(value[0])}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label>Opacity</Label>
                      <span className="text-sm text-muted-foreground">{opacity}%</span>
                    </div>
                    <Slider
                      value={[opacity]}
                      onValueChange={(value) => setOpacity(value[0])}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </div>

              {/* Text Overlay */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Text Overlay</Label>
                  <Button
                    size="sm"
                    variant={textOverlay ? 'default' : 'outline'}
                    onClick={() => setTextOverlay(textOverlay ? null : { text: 'Your Text', x: 100, y: 100, fontSize: 24, color: '#000000', bold: false, italic: false })}
                  >
                    <Type className="h-4 w-4 mr-2" />
                    {textOverlay ? 'Remove Text' : 'Add Text'}
                  </Button>
                </div>
                {textOverlay && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Enter text"
                      value={textOverlay.text}
                      onChange={(e) => setTextOverlay({ ...textOverlay, text: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Font Size"
                      value={textOverlay.fontSize}
                      onChange={(e) => setTextOverlay({ ...textOverlay, fontSize: Number(e.target.value) || 24 })}
                    />
                    <Input
                      type="color"
                      value={textOverlay.color}
                      onChange={(e) => setTextOverlay({ ...textOverlay, color: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={textOverlay.bold ? 'default' : 'outline'}
                        onClick={() => setTextOverlay({ ...textOverlay, bold: !textOverlay.bold })}
                      >
                        Bold
                      </Button>
                      <Button
                        size="sm"
                        variant={textOverlay.italic ? 'default' : 'outline'}
                        onClick={() => setTextOverlay({ ...textOverlay, italic: !textOverlay.italic })}
                      >
                        Italic
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Output Options */}
          <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as OutputFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPG</SelectItem>
                  <SelectItem value="webp">WEBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {outputFormat !== 'png' && (
              <div className="space-y-2">
                <Label>Output Quality: {outputQuality}%</Label>
                <Slider
                  value={[outputQuality]}
                  onValueChange={(value) => setOutputQuality(value[0])}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
            )}
          </div>

          {/* Action Buttons - Simplified for Mobile */}
          <div className="flex flex-col sm:flex-row gap-3 border-t pt-4">
            {isProcessing && (
              <div className="text-sm text-muted-foreground flex items-center gap-2 sm:absolute sm:left-4">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            )}
            <Button 
              onClick={downloadMerged} 
              disabled={!mergedDataUrl || isProcessing} 
              size="lg"
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Merged Image
            </Button>
          </div>

          {/* Limits and Privacy Notice */}
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-xs text-muted-foreground">
              <strong>📋 Limits:</strong> Max {MAX_IMAGES} images • {MAX_FILE_SIZE / (1024 * 1024)}MB per image • {MAX_TOTAL_SIZE / (1024 * 1024)}MB total
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <strong>🔒 Privacy:</strong> All processing happens locally in your browser. Images are never uploaded to servers.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Merged Preview - Real-time Display, Mobile Optimized */}
      {images.length >= 2 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl">Live Preview</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewZoom(Math.max(25, previewZoom - 25))}
                  className="flex-1 sm:flex-initial"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground flex items-center min-w-[50px] justify-center">{previewZoom}%</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewZoom(Math.min(200, previewZoom + 25))}
                  className="flex-1 sm:flex-initial"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {mergedDataUrl ? (
              <div
                ref={previewRef}
                className="flex justify-center items-center bg-muted/30 rounded-lg p-2 sm:p-4 overflow-auto"
                style={{ maxHeight: '70vh', minHeight: '200px' }}
              >
                <img
                  src={mergedDataUrl}
                  alt="Merged output"
                  className="rounded-md border-2 border-primary/20 shadow-lg max-w-full h-auto"
                  style={{
                    width: `${previewZoom}%`,
                    objectFit: 'contain'
                  }}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center bg-muted/30 rounded-lg p-8 min-h-[200px]">
                {isProcessing ? (
                  <div className="text-center space-y-2">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Merging images...</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Preview will appear here</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MergeImages;
