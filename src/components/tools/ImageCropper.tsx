'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Image as ImageIcon, Crop, Scissors, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CropPreset {
  name: string;
  width: number;
  height: number;
  category: string;
  description: string;
  color: string;
  icon: string;
}

const ImageCropper = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cropPresets: CropPreset[] = [
    // Instagram - Updated 2024 dimensions
    { name: 'Instagram Square Post', width: 1080, height: 1080, category: 'Instagram', description: 'Perfect square for feed posts', color: 'bg-gradient-to-br from-purple-500 to-pink-500', icon: '📱' },
    { name: 'Instagram Portrait Post', width: 1080, height: 1350, category: 'Instagram', description: 'Vertical posts for better engagement', color: 'bg-gradient-to-br from-purple-500 to-pink-500', icon: '📱' },
    { name: 'Instagram Story', width: 1080, height: 1920, category: 'Instagram', description: 'Full-screen mobile story', color: 'bg-gradient-to-br from-purple-500 to-pink-500', icon: '📱' },
    { name: 'Instagram Reels', width: 1080, height: 1920, category: 'Instagram', description: 'Vertical video content', color: 'bg-gradient-to-br from-purple-500 to-pink-500', icon: '🎬' },
    { name: 'Instagram Profile Picture', width: 320, height: 320, category: 'Instagram', description: 'Profile avatar', color: 'bg-gradient-to-br from-purple-500 to-pink-500', icon: '👤' },
    
    // Facebook - Updated 2024 dimensions
    { name: 'Facebook Post', width: 1200, height: 630, category: 'Facebook', description: 'Standard timeline post', color: 'bg-gradient-to-br from-blue-600 to-blue-700', icon: '📘' },
    { name: 'Facebook Cover Photo', width: 1640, height: 859, category: 'Facebook', description: 'Profile cover image', color: 'bg-gradient-to-br from-blue-600 to-blue-700', icon: '📘' },
    { name: 'Facebook Story', width: 1080, height: 1920, category: 'Facebook', description: 'Mobile story format', color: 'bg-gradient-to-br from-blue-600 to-blue-700', icon: '📘' },
    { name: 'Facebook Event Cover', width: 1920, height: 1005, category: 'Facebook', description: 'Event page banner', color: 'bg-gradient-to-br from-blue-600 to-blue-700', icon: '📘' },
    { name: 'Facebook Profile Picture', width: 400, height: 400, category: 'Facebook', description: 'Profile avatar', color: 'bg-gradient-to-br from-blue-600 to-blue-700', icon: '👤' },
    
    // Twitter/X - Updated 2024 dimensions
    { name: 'Twitter Post', width: 1200, height: 675, category: 'Twitter', description: 'Timeline image post', color: 'bg-gradient-to-br from-gray-800 to-black', icon: '🐦' },
    { name: 'Twitter Header', width: 1500, height: 500, category: 'Twitter', description: 'Profile banner', color: 'bg-gradient-to-br from-gray-800 to-black', icon: '🐦' },
    { name: 'Twitter Profile Picture', width: 400, height: 400, category: 'Twitter', description: 'Profile avatar', color: 'bg-gradient-to-br from-gray-800 to-black', icon: '👤' },
    
    // LinkedIn - Updated 2024 dimensions
    { name: 'LinkedIn Post', width: 1200, height: 627, category: 'LinkedIn', description: 'Professional post image', color: 'bg-gradient-to-br from-blue-700 to-blue-800', icon: '💼' },
    { name: 'LinkedIn Cover', width: 1584, height: 396, category: 'LinkedIn', description: 'Profile background', color: 'bg-gradient-to-br from-blue-700 to-blue-800', icon: '💼' },
    { name: 'LinkedIn Profile Picture', width: 400, height: 400, category: 'LinkedIn', description: 'Professional avatar', color: 'bg-gradient-to-br from-blue-700 to-blue-800', icon: '👤' },
    
    // YouTube - Updated 2024 dimensions
    { name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'YouTube', description: 'Video preview image', color: 'bg-gradient-to-br from-red-600 to-red-700', icon: '📺' },
    { name: 'YouTube Channel Art', width: 2560, height: 1440, category: 'YouTube', description: 'Channel banner', color: 'bg-gradient-to-br from-red-600 to-red-700', icon: '📺' },
    { name: 'YouTube Shorts', width: 1080, height: 1920, category: 'YouTube', description: 'Vertical short videos', color: 'bg-gradient-to-br from-red-600 to-red-700', icon: '🎬' },
    
    // TikTok - 2024 dimensions
    { name: 'TikTok Video', width: 1080, height: 1920, category: 'TikTok', description: 'Vertical video content', color: 'bg-gradient-to-br from-black to-gray-800', icon: '🎵' },
    { name: 'TikTok Profile Picture', width: 200, height: 200, category: 'TikTok', description: 'Profile avatar', color: 'bg-gradient-to-br from-black to-gray-800', icon: '👤' },
    
    // Pinterest - 2024 dimensions
    { name: 'Pinterest Pin', width: 1000, height: 1500, category: 'Pinterest', description: 'Vertical pin format', color: 'bg-gradient-to-br from-red-500 to-red-600', icon: '📌' },
    { name: 'Pinterest Board Cover', width: 222, height: 150, category: 'Pinterest', description: 'Board cover image', color: 'bg-gradient-to-br from-red-500 to-red-600', icon: '📌' },
    
    // Common Formats
    { name: 'Square (1:1)', width: 1000, height: 1000, category: 'Common', description: 'Perfect square ratio', color: 'bg-gradient-to-br from-gray-600 to-gray-700', icon: '⬜' },
    { name: 'Landscape (16:9)', width: 1920, height: 1080, category: 'Common', description: 'Widescreen format', color: 'bg-gradient-to-br from-gray-600 to-gray-700', icon: '🖥️' },
    { name: 'Portrait (4:5)', width: 1080, height: 1350, category: 'Common', description: 'Mobile-friendly vertical', color: 'bg-gradient-to-br from-gray-600 to-gray-700', icon: '📱' },
    { name: 'Widescreen (21:9)', width: 2560, height: 1080, category: 'Common', description: 'Ultra-wide format', color: 'bg-gradient-to-br from-gray-600 to-gray-700', icon: '🖥️' },
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCroppedUrl(null);
      setSelectedPreset('');

      // Get original dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        // Set initial crop area to center
        const size = Math.min(img.width, img.height);
        setCropArea({
          x: (img.width - size) / 2,
          y: (img.height - size) / 2,
          width: size,
          height: size
        });
      };
      img.src = url;
    }
  }, [toast]);

  const handlePresetSelect = useCallback((presetName: string) => {
    setSelectedPreset(presetName);
    const preset = cropPresets.find(p => p.name === presetName);
    if (preset && originalDimensions) {
      const aspectRatio = preset.width / preset.height;
      let newWidth, newHeight;
      
      if (originalDimensions.width / originalDimensions.height > aspectRatio) {
        newHeight = originalDimensions.height;
        newWidth = newHeight * aspectRatio;
      } else {
        newWidth = originalDimensions.width;
        newHeight = newWidth / aspectRatio;
      }
      
      setCropArea({
        x: (originalDimensions.width - newWidth) / 2,
        y: (originalDimensions.height - newHeight) / 2,
        width: newWidth,
        height: newHeight
      });
    }
  }, [originalDimensions]);

  const adjustCropArea = useCallback((direction: 'up' | 'down' | 'left' | 'right', amount: number = 10) => {
    if (!originalDimensions) return;
    
    setCropArea(prev => {
      const newArea = { ...prev };
      
      switch (direction) {
        case 'up':
          newArea.y = Math.max(0, prev.y - amount);
          break;
        case 'down':
          newArea.y = Math.min(originalDimensions.height - prev.height, prev.y + amount);
          break;
        case 'left':
          newArea.x = Math.max(0, prev.x - amount);
          break;
        case 'right':
          newArea.x = Math.min(originalDimensions.width - prev.width, prev.x + amount);
          break;
      }
      
      return newArea;
    });
  }, [originalDimensions]);

  const getEventPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = previewContainerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) / (previewScale * zoomLevel),
      y: (clientY - rect.top) / (previewScale * zoomLevel)
    };
  }, [previewScale, zoomLevel]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!previewContainerRef.current || !originalDimensions) return;
    
    e.preventDefault();
    const { x, y } = getEventPosition(e);
    
    setIsDragging(true);
    setDragStart({ x, y });
  }, [getEventPosition, originalDimensions]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !previewContainerRef.current || !originalDimensions) return;
    
    e.preventDefault();
    const { x, y } = getEventPosition(e);
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(originalDimensions.width - prev.width, prev.x + deltaX)),
      y: Math.max(0, Math.min(originalDimensions.height - prev.height, prev.y + deltaY))
    }));
    
    setDragStart({ x, y });
  }, [isDragging, dragStart, getEventPosition, originalDimensions]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const cropImage = useCallback(async () => {
    if (!selectedFile || !originalDimensions || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(selectedFile);

    img.onload = () => {
      let outputWidth: number;
      let outputHeight: number;

      if (isCustomMode && customWidth && customHeight) {
        outputWidth = parseInt(customWidth, 10) || cropArea.width;
        outputHeight = parseInt(customHeight, 10) || cropArea.height;
      } else if (selectedPreset) {
        const preset = cropPresets.find((p) => p.name === selectedPreset);
        outputWidth = preset?.width || cropArea.width;
        outputHeight = preset?.height || cropArea.height;
      } else {
        outputWidth = Math.round(cropArea.width);
        outputHeight = Math.round(cropArea.height);
      }

      // Clamp source crop to image bounds
      const sx = Math.max(0, Math.min(cropArea.x, img.width - 1));
      const sy = Math.max(0, Math.min(cropArea.y, img.height - 1));
      const sw = Math.max(1, Math.min(cropArea.width, img.width - sx));
      const sh = Math.max(1, Math.min(cropArea.height, img.height - sy));

      canvas.width = Math.max(1, outputWidth);
      canvas.height = Math.max(1, outputHeight);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            toast({
              title: 'Crop failed',
              description: 'Could not create cropped image.',
              variant: 'destructive',
            });
            return;
          }
          if (croppedUrl) URL.revokeObjectURL(croppedUrl);
          const url = URL.createObjectURL(blob);
          setCroppedUrl(url);
          toast({
            title: 'Image cropped successfully!',
            description: `Cropped to ${canvas.width}×${canvas.height}px`,
          });
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast({
        title: 'Crop failed',
        description: 'Could not load the source image.',
        variant: 'destructive',
      });
    };

    img.src = objectUrl;
  }, [
    selectedFile,
    originalDimensions,
    cropArea,
    selectedPreset,
    isCustomMode,
    customWidth,
    customHeight,
    croppedUrl,
    toast,
  ]);

  const downloadCropped = useCallback(() => {
    if (croppedUrl && selectedFile) {
      const link = document.createElement('a');
      link.href = croppedUrl;
      const name = selectedFile.name.replace(/\.[^/.]+$/, '');
      const presetSuffix = selectedPreset ? `_${selectedPreset.replace(/\s+/g, '_')}` : '_cropped';
      // Always PNG — blob is created as image/png
      link.download = `${name}${presetSuffix}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [croppedUrl, selectedFile, selectedPreset]);

  useEffect(() => {
    if (previewContainerRef.current && originalDimensions) {
      const maxW = isMobile ? 350 : 500;
      const maxH = isMobile ? 300 : 400;
      const scale = Math.min(
        maxW / originalDimensions.width,
        maxH / originalDimensions.height,
        1
      );
      setPreviewScale(scale);
    }
  }, [originalDimensions, isMobile]);

  const groupedPresets = cropPresets.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, CropPreset[]>);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
          Professional Image Cropper
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm px-4">
          Crop images to exact social media dimensions with zero quality loss
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Upload className="h-4 w-4" />
              Upload High-Quality Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-6 text-center">
              <ImageIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
              <Label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80">
                  {isMobile ? 'Tap to upload' : 'Click to upload an image'}
                </span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                Supports JPG, PNG, WebP, GIF (up to 50MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {selectedFile && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Crop className="h-4 w-4" />
                Choose Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Selection */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={!isCustomMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsCustomMode(false)}
                  className="flex-1"
                >
                  Presets
                </Button>
                <Button
                  variant={isCustomMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsCustomMode(true)}
                  className="flex-1"
                >
                  Custom Size
                </Button>
              </div>

              {!isCustomMode ? (
                // Preset Selection
                <div className="space-y-4">
                  {Object.entries(groupedPresets).map(([category, presets]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">{category}</h3>
                      <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5'}`}>
                        {presets.map((preset) => {
                          const aspectRatio = preset.width / preset.height;
                          const isVertical = aspectRatio < 1;
                          const isSquare = Math.abs(aspectRatio - 1) < 0.1;
                          
                          return (
                            <div
                              key={preset.name}
                              className={`relative cursor-pointer transition-all duration-200 ${
                                selectedPreset === preset.name
                                  ? 'ring-2 ring-primary ring-offset-1'
                                  : 'hover:scale-105'
                              }`}
                              onClick={() => handlePresetSelect(preset.name)}
                            >
                              <div className={`${preset.color} rounded-lg p-2 sm:p-3 text-white min-h-[100px] sm:min-h-[120px]`}>
                                <div className="flex flex-col items-center space-y-1 h-full">
                                  <div className="text-lg">{preset.icon}</div>
                                  <div 
                                    className="bg-white/20 rounded border border-white/30 flex-shrink-0"
                                    style={{
                                      width: isVertical ? '20px' : isSquare ? '25px' : '30px',
                                      height: isVertical ? '30px' : isSquare ? '25px' : '20px',
                                    }}
                                  />
                                  <div className="text-center flex-1 flex flex-col justify-center">
                                    <h4 className="font-medium text-xs leading-tight">{preset.name}</h4>
                                    <p className="text-xs opacity-90 mt-1">{preset.width}×{preset.height}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Custom Size Input
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="custom-width" className="text-xs">Width (px)</Label>
                      <Input
                        id="custom-width"
                        type="number"
                        placeholder="e.g., 1080"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-height" className="text-xs">Height (px)</Label>
                      <Input
                        id="custom-height"
                        type="number"
                        placeholder="e.g., 1080"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  {customWidth && customHeight && (
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        Custom size: {customWidth}×{customHeight}px
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {previewUrl && originalDimensions && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Move className="h-4 w-4" />
                Adjust Crop Area
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Zoom Controls */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
                  className="p-2"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.2))}
                  className="p-2"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Mobile-friendly crop area */}
              <div className="flex flex-col items-center space-y-3">
                {!isMobile && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustCropArea('up')}
                      className="p-2"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  {!isMobile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustCropArea('left')}
                      className="p-2"
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <div 
                    ref={previewContainerRef}
                    className="relative border-2 border-dashed border-border rounded-lg overflow-hidden cursor-move touch-none bg-muted"
                    style={{
                      width: `${originalDimensions.width * previewScale * zoomLevel}px`,
                      height: `${originalDimensions.height * previewScale * zoomLevel}px`,
                      maxWidth: '100%'
                    }}
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                  >
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-fill"
                      draggable={false}
                    />
                    <div
                      className="absolute border-2 border-primary bg-primary/10"
                      style={{
                        left: `${cropArea.x * previewScale * zoomLevel}px`,
                        top: `${cropArea.y * previewScale * zoomLevel}px`,
                        width: `${cropArea.width * previewScale * zoomLevel}px`,
                        height: `${cropArea.height * previewScale * zoomLevel}px`
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div
                      className="absolute bg-transparent"
                      style={{
                        left: `${cropArea.x * previewScale * zoomLevel}px`,
                        top: `${cropArea.y * previewScale * zoomLevel}px`,
                        width: `${cropArea.width * previewScale * zoomLevel}px`,
                        height: `${cropArea.height * previewScale * zoomLevel}px`,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                      }}
                    />
                  </div>
                  
                  {!isMobile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustCropArea('right')}
                      className="p-2"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {!isMobile && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustCropArea('down')}
                      className="p-2"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile touch controls */}
              {isMobile && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustCropArea('up')}
                    className="flex items-center gap-2"
                  >
                    <ArrowUp className="h-3 w-3" />
                    Up
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustCropArea('down')}
                    className="flex items-center gap-2"
                  >
                    <ArrowDown className="h-3 w-3" />
                    Down
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustCropArea('left')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Left
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustCropArea('right')}
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Right
                  </Button>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  Original: {originalDimensions.width}×{originalDimensions.height}px
                </p>
                {(selectedPreset || (isCustomMode && customWidth && customHeight)) && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Output: {isCustomMode ? `${customWidth}×${customHeight}px` : `${cropPresets.find(p => p.name === selectedPreset)?.width}×${cropPresets.find(p => p.name === selectedPreset)?.height}px`}
                  </p>
                )}
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  {isMobile ? 'Tap and drag the crop area or use buttons below' : 'Use arrow buttons or drag the crop area to adjust position'}
                </p>
              </div>

              <Button 
                onClick={cropImage} 
                disabled={!selectedFile || (!selectedPreset && !isCustomMode)}
                className="w-full"
                size="lg"
              >
                <Scissors className="h-4 w-4 mr-2" />
                Crop Image
              </Button>
            </CardContent>
          </Card>
        )}

        {previewUrl && croppedUrl && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Before & After</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-center">
                    <h3 className="font-semibold text-muted-foreground text-xs sm:text-sm">Original</h3>
                    {originalDimensions && (
                      <p className="text-xs text-muted-foreground">
                        {originalDimensions.width}×{originalDimensions.height}px
                      </p>
                    )}
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                    <img 
                      src={previewUrl} 
                      alt="Original" 
                      className="w-full h-40 sm:h-48 md:h-56 object-contain"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-center">
                    <h3 className="font-semibold text-green-600 text-xs sm:text-sm">Cropped</h3>
                    {(selectedPreset || (isCustomMode && customWidth && customHeight)) && (
                      <p className="text-xs text-muted-foreground">
                        {isCustomMode ? `${customWidth}×${customHeight}px` : `${cropPresets.find(p => p.name === selectedPreset)?.width}×${cropPresets.find(p => p.name === selectedPreset)?.height}px`}
                      </p>
                    )}
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                    <img 
                      src={croppedUrl} 
                      alt="Cropped" 
                      className="w-full h-40 sm:h-48 md:h-56 object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button onClick={downloadCropped} className="w-full" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download High-Quality Cropped Image
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Zero quality loss • Perfect for social media and print
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropper;
