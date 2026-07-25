'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Scissors, Download } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

const SplitImage = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [rows, setRows] = useState<number>(2);
  const [columns, setColumns] = useState<number>(2);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sliceCount, setSliceCount] = useState<number>(0);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.');
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSliceCount(0);
  };

  const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/png', quality = 0.92) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create image blob.'));
      }, type, quality);
    });

  const splitAndDownloadZip = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first.');
      return;
    }

    const safeRows = Math.max(1, Math.min(20, rows));
    const safeColumns = Math.max(1, Math.min(20, columns));
    const totalSlices = safeRows * safeColumns;

    if (totalSlices > 100) {
      toast.error('Please keep total slices at 100 or less.');
      return;
    }

    setIsProcessing(true);

    try {
      const image = new Image();
      const imageReady = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Failed to load image.'));
      });
      image.src = URL.createObjectURL(imageFile);
      await imageReady;

      const zip = new JSZip();
      const baseWidth = Math.floor(image.width / safeColumns);
      const baseHeight = Math.floor(image.height / safeRows);

      for (let row = 0; row < safeRows; row += 1) {
        for (let col = 0; col < safeColumns; col += 1) {
          const sx = col * baseWidth;
          const sy = row * baseHeight;
          const sw = col === safeColumns - 1 ? image.width - sx : baseWidth;
          const sh = row === safeRows - 1 ? image.height - sy : baseHeight;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas context not available.');
          }

          canvas.width = sw;
          canvas.height = sh;
          ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

          const blob = await canvasToBlob(canvas, 'image/png', 0.92);
          zip.file(`split-row-${row + 1}-col-${col + 1}.png`, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'split-images.zip');
      setSliceCount(totalSlices);
      toast.success(`Downloaded ${totalSlices} split images as ZIP.`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to split image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Split Image Online
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="split-image-upload">Upload Image</Label>
          <Input id="split-image-upload" type="file" accept="image/*" onChange={handleUpload} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="split-rows">Rows</Label>
            <Input
              id="split-rows"
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) => setRows(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="split-columns">Columns</Label>
            <Input
              id="split-columns"
              type="number"
              min={1}
              max={20}
              value={columns}
              onChange={(e) => setColumns(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={splitAndDownloadZip} disabled={!imageFile || isProcessing}>
            <Upload className="h-4 w-4 mr-2" />
            {isProcessing ? 'Splitting...' : 'Split and Download ZIP'}
          </Button>
        </div>

        {sliceCount > 0 && (
          <div className="text-sm text-muted-foreground">
            Last download generated <strong>{sliceCount}</strong> slices.
          </div>
        )}

        {previewUrl && (
          <div className="space-y-2">
            <Label>Image Preview</Label>
            <img src={previewUrl} alt="Uploaded for split" className="w-full rounded-md border" />
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Download className="h-3 w-3" />
              Split output is downloaded as ZIP containing PNG slices.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SplitImage;
