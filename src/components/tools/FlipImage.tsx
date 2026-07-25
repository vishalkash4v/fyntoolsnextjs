'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FlipHorizontal, Upload } from 'lucide-react';
import { toast } from 'sonner';

type OutputFormat = 'png' | 'jpeg' | 'webp';

const FlipImage = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [flippedUrl, setFlippedUrl] = useState<string>('');
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(true);
  const [flipVertical, setFlipVertical] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      return;
    }
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setPreviewUrl(url);
    setFlippedUrl('');
  };

  const applyFlip = useCallback(() => {
    if (!imageFile) {
      return;
    }

    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsProcessing(false);
        toast.error('Canvas is not supported in this browser.');
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.save();
      ctx.translate(flipHorizontal ? img.width : 0, flipVertical ? img.height : 0);
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      const mimeType = outputFormat === 'png' ? 'image/png' : outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
      const quality = outputFormat === 'png' ? undefined : 0.92;
      setFlippedUrl(canvas.toDataURL(mimeType, quality));
      setIsProcessing(false);
      // Only show success toast on manual apply, not on every change
    };

    img.onerror = () => {
      setIsProcessing(false);
      toast.error('Failed to process image.');
    };

    img.src = URL.createObjectURL(imageFile);
  }, [imageFile, flipHorizontal, flipVertical, outputFormat, toast]);

  useEffect(() => {
    if (imageFile) {
      const timeoutId = setTimeout(() => {
        applyFlip();
      }, 50); // Reduced debounce for smoother real-time processing
      return () => clearTimeout(timeoutId);
    }
  }, [imageFile, flipHorizontal, flipVertical, outputFormat, applyFlip]);

  const downloadImage = () => {
    if (!flippedUrl) return;
    const link = document.createElement('a');
    link.href = flippedUrl;
    link.download = `flipped-image.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlipHorizontal className="h-5 w-5" />
          Flip Image Online
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="flip-image-upload">Upload Image</Label>
          <Input id="flip-image-upload" type="file" accept="image/*" onChange={handleUpload} />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="flip-horizontal"
              checked={flipHorizontal}
              onCheckedChange={(checked) => setFlipHorizontal(Boolean(checked))}
            />
            <Label htmlFor="flip-horizontal" className="flex items-center gap-2">
              <FlipHorizontal className="h-4 w-4" />
              Flip Horizontally
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="flip-vertical"
              checked={flipVertical}
              onCheckedChange={(checked) => setFlipVertical(Boolean(checked))}
            />
            <Label htmlFor="flip-vertical" className="flex items-center gap-2">
              <FlipHorizontal className="h-4 w-4" />
              Flip Vertically
            </Label>
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
          <Button onClick={applyFlip} disabled={!imageFile || isProcessing}>
            <Upload className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Apply Flip'}
          </Button>
          <Button onClick={downloadImage} variant="outline" disabled={!flippedUrl}>
            <Download className="h-4 w-4 mr-2" />
            Download Flipped Image
          </Button>
        </div>

        {previewUrl && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Original</Label>
              <img src={previewUrl} alt="Original" className="w-full rounded-md border" />
            </div>
            <div className="space-y-2">
              <Label>Flipped</Label>
              {flippedUrl ? (
                <img src={flippedUrl} alt="Flipped" className="w-full rounded-md border" />
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

export default FlipImage;
