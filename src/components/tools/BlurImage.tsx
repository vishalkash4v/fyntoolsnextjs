'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

type OutputFormat = 'png' | 'jpeg' | 'webp';

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const MAX_FILE_SIZE_MB = 50;

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const BlurImage = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [blurredUrl, setBlurredUrl] = useState<string>('');
  const [blurValue, setBlurValue] = useState<number>(6);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (blurredUrl) URL.revokeObjectURL(blurredUrl);

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setBlurredUrl('');

    // Load image for processing
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      // Process immediately after upload
      processBlur(img, blurValue, outputFormat);
    };
    img.src = url;
  };

  // Real-time blur processing with debouncing for smooth performance
  const processBlur = useCallback(async (
    img: HTMLImageElement,
    blur: number,
    format: OutputFormat
  ) => {
    // Clear any pending processing
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    // Debounce for smooth slider interaction (50ms delay)
    processingTimeoutRef.current = setTimeout(() => {
      setIsProcessing(true);
      
      // Use requestAnimationFrame for smooth processing
      requestAnimationFrame(() => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          // High-quality rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Apply blur using CSS filter (rendered on canvas)
          ctx.filter = `blur(${blur}px)`;
          ctx.drawImage(img, 0, 0);

          // Convert to desired format
          const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
          const quality = format === 'jpeg' ? 0.92 : undefined;
          const dataUrl = canvas.toDataURL(mimeType, quality);

          if (blurredUrl && blurredUrl.startsWith('data:')) {
            // Only revoke if it's a data URL (not blob URL)
          }
          setBlurredUrl(dataUrl);
        } catch (error: any) {
          console.error('Blur error:', error);
          toast.error(error.message || 'Failed to process image.');
        } finally {
          setIsProcessing(false);
        }
      });
    }, 50); // 50ms debounce for smooth slider interaction
  }, [blurredUrl, toast]);

  // Real-time processing when blur value or format changes
  useEffect(() => {
    if (imageRef.current && previewUrl) {
      processBlur(imageRef.current, blurValue, outputFormat);
    }
  }, [blurValue, outputFormat, previewUrl, processBlur]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (blurredUrl && blurredUrl.startsWith('blob:')) URL.revokeObjectURL(blurredUrl);
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [previewUrl, blurredUrl]);

  const downloadBlurred = () => {
    if (!blurredUrl) return;
    
    // Convert base64 to blob
    const byteString = atob(blurredUrl.split(',')[1]);
    const mimeString = blurredUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `blurred-image.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Blur Image Online
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="blur-image-upload">Upload Image</Label>
          <Input id="blur-image-upload" type="file" accept="image/*" onChange={handleUpload} />
          <p className="text-xs text-muted-foreground">
            Maximum file size: {MAX_FILE_SIZE_MB}MB
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label>Blur Strength: {blurValue}px</Label>
            <Slider
              value={[blurValue]}
              min={0}
              max={30}
              step={1}
              onValueChange={(value) => setBlurValue(value[0] ?? 0)}
            />
          </div>
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
        </div>

        <div className="flex flex-wrap gap-3">
          {isProcessing && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          )}
          <Button onClick={downloadBlurred} variant="outline" disabled={!blurredUrl || isProcessing}>
            <Download className="h-4 w-4 mr-2" />
            Download Blurred Image
          </Button>
        </div>

        {previewUrl && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Original</Label>
              <img src={previewUrl} alt="Original" className="w-full rounded-md border max-h-96 object-contain" />
            </div>
            <div className="space-y-2">
              <Label>Blurred</Label>
              {blurredUrl ? (
                <img src={blurredUrl} alt="Blurred" className="w-full rounded-md border max-h-96 object-contain" />
              ) : (
                <div className="w-full h-40 border rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
                  Preview will appear here
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlurImage;
