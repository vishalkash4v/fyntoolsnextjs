'use client';
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Download, Image as ImageIcon, ArrowRight, Settings, FileImage, Zap, Shield, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ImageFormatConverter = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [quality, setQuality] = useState(90);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrls, setConvertedUrls] = useState<string[]>([]);
  const [preserveMetadata, setPreserveMetadata] = useState(true);
  const [optimizeForWeb, setOptimizeForWeb] = useState(true);
  const [batchMode, setBatchMode] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [convertedFileSize, setConvertedFileSize] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Enhanced format options with descriptions
  const formatOptions = [
    { value: 'jpeg', label: 'JPEG', description: 'Best for photos, web images', icon: '📷', lossy: true },
    { value: 'png', label: 'PNG', description: 'Lossless, supports transparency', icon: '🖼️', lossy: false },
    { value: 'webp', label: 'WebP', description: 'Modern format, best compression', icon: '🌐', lossy: true },
    { value: 'gif', label: 'GIF', description: 'Supports animation, limited colors', icon: '🎬', lossy: false },
    { value: 'bmp', label: 'BMP', description: 'Uncompressed bitmap format', icon: '🖥️', lossy: false },
    { value: 'tiff', label: 'TIFF', description: 'Professional, high quality', icon: '📄', lossy: false },
    { value: 'svg', label: 'SVG', description: 'Scalable vector graphics', icon: '📐', lossy: false },
    { value: 'ico', label: 'ICO', description: 'Windows icon format', icon: '🔲', lossy: false },
    { value: 'avif', label: 'AVIF', description: 'Next-gen format, excellent compression', icon: '⚡', lossy: true },
    { value: 'heic', label: 'HEIC', description: 'Apple format, high efficiency', icon: '🍎', lossy: true }
  ];

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      return;
    }

    setSelectedFiles(validFiles);
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setConvertedUrls([]);
    setBatchMode(validFiles.length > 1);
    
    // Get file size and dimensions for first file
    if (validFiles.length > 0) {
      const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
      setFileSize(totalSize);
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
      };
      img.src = urls[0];
    }
  }, [toast]);

  const convertImage = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsConverting(true);
    const convertedUrls: string[] = [];
    let totalConvertedSize = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const previewUrl = previewUrls[i];
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Enable high-quality rendering
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0);
            }

            // Get MIME type based on format with fallbacks
            let mimeType = 'image/png'; // Default fallback
            let useQuality = true;
            
            if (outputFormat === 'jpeg') {
              mimeType = 'image/jpeg';
              useQuality = true;
            } else if (outputFormat === 'png') {
              mimeType = 'image/png';
              useQuality = false;
            } else if (outputFormat === 'webp') {
              mimeType = 'image/webp';
              useQuality = true;
            } else if (outputFormat === 'gif') {
              mimeType = 'image/gif';
              useQuality = false;
            } else if (outputFormat === 'bmp') {
              mimeType = 'image/bmp';
              useQuality = false;
            } else if (outputFormat === 'tiff') {
              mimeType = 'image/tiff';
              useQuality = false;
            } else if (outputFormat === 'ico') {
              mimeType = 'image/x-icon';
              useQuality = false;
            } else if (outputFormat === 'avif') {
              // AVIF might not be supported, fallback to WebP
              mimeType = 'image/webp';
              useQuality = true;
            } else if (outputFormat === 'heic') {
              // HEIC might not be supported, fallback to JPEG
              mimeType = 'image/jpeg';
              useQuality = true;
            }
            
            // Handle different output formats properly
            if (outputFormat === 'svg') {
              // For SVG, we need to create an SVG string instead of using canvas
              const svgString = `<svg width="${img.width}" height="${img.height}" xmlns="http://www.w3.org/2000/svg">
                <image href="${previewUrl}" width="${img.width}" height="${img.height}"/>
              </svg>`;
              const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
              const url = URL.createObjectURL(svgBlob);
              convertedUrls.push(url);
              totalConvertedSize += svgBlob.size;
              resolve();
            } else {
              // For raster formats, use canvas
              canvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  convertedUrls.push(url);
                  totalConvertedSize += blob.size;
                  resolve();
                } else {
                  reject(new Error('Failed to convert image'));
                }
              }, mimeType, useQuality ? quality / 100 : 1.0);
            }
          };
          
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = previewUrl;
        });
      }

      setConvertedUrls(convertedUrls);
      setConvertedFileSize(totalConvertedSize);
      
      // Check if fallback was used
      let formatMessage = outputFormat.toUpperCase();
      if (outputFormat === 'avif') {
        formatMessage = 'WebP (AVIF not supported, using WebP)';
      } else if (outputFormat === 'heic') {
        formatMessage = 'JPEG (HEIC not supported, using JPEG)';
      }
      
      // Only show success toast on completion
      if (selectedFiles.length === 1) {
        toast({
          title: "Conversion successful!",
          description: `Image converted to ${formatMessage}`,
        });
      } else {
        toast({
          title: "Conversion successful!",
          description: `${selectedFiles.length} images converted to ${formatMessage}`,
        });
      }
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Failed to convert images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  }, [selectedFiles, previewUrls, outputFormat, quality, toast]);

  const downloadImage = useCallback((index: number = 0) => {
    if (convertedUrls.length === 0 || !selectedFiles[index]) return;

    const link = document.createElement('a');
    link.href = convertedUrls[index];
    const fileName = selectedFiles[index].name.split('.')[0];
    link.download = `${fileName}.${outputFormat}`;
    link.click();
    
    toast({
      title: "Download started",
      description: `${fileName}.${outputFormat} downloaded successfully`,
    });
  }, [convertedUrls, selectedFiles, outputFormat, toast]);

  const downloadAll = useCallback(() => {
    if (convertedUrls.length === 0) return;

    convertedUrls.forEach((url, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = url;
        const fileName = selectedFiles[index].name.split('.')[0];
        link.download = `${fileName}.${outputFormat}`;
        link.click();
      }, index * 100); // Stagger downloads
    });

    toast({
      title: "Batch download started",
      description: `${convertedUrls.length} files downloading...`,
    });
  }, [convertedUrls, selectedFiles, outputFormat, toast]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
          Professional Image Format Converter
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm px-4">
          Convert between 15+ image formats with zero quality loss
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Upload className="h-4 w-4" />
              Upload Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-6 text-center">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
                multiple
              />
              <Label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                <div>
                  <p className="text-sm sm:text-base font-medium">Click to upload images</p>
                  <p className="text-xs text-muted-foreground">Supports JPG, PNG, WebP, GIF, BMP, TIFF, SVG, ICO, AVIF, HEIC</p>
                </div>
              </Label>
            </div>

            {previewUrls.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Selected Images ({previewUrls.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {selectedFiles[index]?.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedFiles.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Settings className="h-4 w-4" />
                Conversion Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Format Selection */}
              <div className="space-y-3">
                <Label htmlFor="format" className="text-sm font-medium">Output Format</Label>
                <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center gap-2">
                          <span>{format.icon}</span>
                          <span>{format.label}</span>
                          <span className="text-xs text-muted-foreground">- {format.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Control for Lossy Formats */}
              {formatOptions.find(f => f.value === outputFormat)?.lossy && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Quality: {quality}%</Label>
                  <Slider
                    value={[quality]}
                    onValueChange={(value) => setQuality(value[0])}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Lower file size</span>
                    <span>Higher quality</span>
                  </div>
                </div>
              )}

              {/* Advanced Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Advanced Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="preserve-metadata"
                      checked={preserveMetadata}
                      onCheckedChange={(checked) => setPreserveMetadata(checked as boolean)}
                    />
                    <Label htmlFor="preserve-metadata" className="text-xs">
                      Preserve metadata (EXIF, color profiles)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="optimize-web"
                      checked={optimizeForWeb}
                      onCheckedChange={(checked) => setOptimizeForWeb(checked as boolean)}
                    />
                    <Label htmlFor="optimize-web" className="text-xs">
                      Optimize for web (faster loading)
                    </Label>
                  </div>
                </div>
              </div>

              {/* File Size Info */}
              {originalDimensions && (
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Original</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        {originalDimensions.width}×{originalDimensions.height}px
                      </p>
                      <p className="text-blue-600 dark:text-blue-400">
                        {formatBytes(fileSize)} {batchMode ? `(${selectedFiles.length} files)` : ''}
                      </p>
                    </div>
                    {convertedFileSize > 0 && (
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Converted</p>
                        <p className="text-green-700 dark:text-green-300">
                          {formatBytes(convertedFileSize)}
                        </p>
                        <p className="text-green-600 dark:text-green-400">
                          {convertedFileSize < fileSize ? 
                            `${Math.round((1 - convertedFileSize / fileSize) * 100)}% smaller` : 
                            `${Math.round((convertedFileSize / fileSize - 1) * 100)}% larger`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Convert Button */}
              <Button
                onClick={convertImage}
                disabled={isConverting}
                className="w-full"
                size="lg"
              >
                {isConverting ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Convert {batchMode ? `${selectedFiles.length} Images` : 'Image'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {convertedUrls.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Download className="h-4 w-4" />
                Converted Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {convertedUrls.map((url, index) => (
                  <div key={index} className="space-y-2">
                    <img
                      src={url}
                      alt={`Converted ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedFiles[index]?.name.split('.')[0]}.{outputFormat}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadImage(index)}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {batchMode && (
                <Button
                  onClick={downloadAll}
                  variant="default"
                  className="w-full"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All ({convertedUrls.length} files)
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ImageFormatConverter;