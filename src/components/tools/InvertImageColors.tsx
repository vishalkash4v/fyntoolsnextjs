'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, Palette } from 'lucide-react';
import { toast } from 'sonner';

type OutputFormat = 'png' | 'jpeg' | 'webp';

const InvertImageColors = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [invertedUrl, setInvertedUrl] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(100);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      return;
    }
    setImageFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setInvertedUrl('');
  };

  const applyInvert = useCallback(() => {
    if (!imageFile) return;
    setIsProcessing(true);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsProcessing(false);
        toast.error('Canvas is not supported in this browser.');
        return;
      }

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const blend = Math.max(0, Math.min(100, intensity)) / 100;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.round(r + ((255 - r) - r) * blend);
        data[i + 1] = Math.round(g + ((255 - g) - g) * blend);
        data[i + 2] = Math.round(b + ((255 - b) - b) * blend);
      }

      ctx.putImageData(imgData, 0, 0);

      const mimeType = outputFormat === 'png' ? 'image/png' : outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
      const quality = outputFormat === 'png' ? undefined : 0.92;
      setInvertedUrl(canvas.toDataURL(mimeType, quality));
      setIsProcessing(false);
      // Only show success toast on manual apply, not on every change
    };

    image.onerror = () => {
      setIsProcessing(false);
      toast.error('Failed to process image.');
    };

    image.src = URL.createObjectURL(imageFile);
  }, [imageFile, intensity, outputFormat, toast]);

  useEffect(() => {
    if (imageFile) {
      const timeoutId = setTimeout(() => {
        applyInvert();
      }, 50); // Reduced debounce for smoother real-time processing
      return () => clearTimeout(timeoutId);
    }
  }, [imageFile, intensity, outputFormat, applyInvert]);

  const downloadInverted = () => {
    if (!invertedUrl) return;
    const link = document.createElement('a');
    link.href = invertedUrl;
    link.download = `inverted-image.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Invert Image Colors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="invert-image-upload">Upload Image</Label>
          <Input id="invert-image-upload" type="file" accept="image/*" onChange={handleUpload} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label>Invert Intensity: {intensity}%</Label>
            <Slider
              value={[intensity]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setIntensity(value[0] ?? 100)}
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
          <Button onClick={applyInvert} disabled={!imageFile || isProcessing}>
            <Upload className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Invert Colors'}
          </Button>
          <Button onClick={downloadInverted} variant="outline" disabled={!invertedUrl}>
            <Download className="h-4 w-4 mr-2" />
            Download Inverted Image
          </Button>
        </div>

        {originalUrl && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Original</Label>
              <img src={originalUrl} alt="Original" className="w-full rounded-md border" />
            </div>
            <div className="space-y-2">
              <Label>Inverted</Label>
              {invertedUrl ? (
                <img src={invertedUrl} alt="Inverted" className="w-full rounded-md border" />
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

export default InvertImageColors;
