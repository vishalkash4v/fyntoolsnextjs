'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Upload, Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const PixelateTool = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [pixelSize, setPixelSize] = useState([8]);
  const [cropArea, setCropArea] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 200
  });
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [previewScale, setPreviewScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      const img = new Image();
      img.onload = () => {
        setImage(img);
        const maxDimension = Math.max(img.width, img.height);
        const scale = maxDimension > 500 ? 500 / maxDimension : 1;
        setPreviewScale(scale);
        
        setCropArea({
          x: Math.round(img.width * 0.2),
          y: Math.round(img.height * 0.2),
          width: Math.round(img.width * 0.3),
          height: Math.round(img.height * 0.3)
        });
      };
      img.src = URL.createObjectURL(file);
    }
  }, []);

  const drawPreview = useCallback((img: HTMLImageElement) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaledWidth = img.width * previewScale;
    const scaledHeight = img.height * previewScale;
    
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Draw original image
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

    // Apply pixelation to the specified area
    const scaledCropArea = {
      x: cropArea.x * previewScale,
      y: cropArea.y * previewScale,
      width: cropArea.width * previewScale,
      height: cropArea.height * previewScale
    };

    // Ensure the area is within bounds
    const clampedArea = {
      x: Math.max(0, Math.min(scaledCropArea.x, scaledWidth - scaledCropArea.width)),
      y: Math.max(0, Math.min(scaledCropArea.y, scaledHeight - scaledCropArea.y)),
      width: Math.min(scaledCropArea.width, scaledWidth - scaledCropArea.x),
      height: Math.min(scaledCropArea.height, scaledHeight - scaledCropArea.y)
    };

    if (clampedArea.width > 0 && clampedArea.height > 0) {
      const imageData = ctx.getImageData(clampedArea.x, clampedArea.y, clampedArea.width, clampedArea.height);
      const data = imageData.data;
      const size = Math.max(2, pixelSize[0] * previewScale);

      for (let y = 0; y < clampedArea.height; y += size) {
        for (let x = 0; x < clampedArea.width; x += size) {
          const pixelIndex = (y * clampedArea.width + x) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          const a = data[pixelIndex + 3];

          for (let dy = 0; dy < size && y + dy < clampedArea.height; dy++) {
            for (let dx = 0; dx < size && x + dx < clampedArea.width; dx++) {
              const targetIndex = ((y + dy) * clampedArea.width + (x + dx)) * 4;
              data[targetIndex] = r;
              data[targetIndex + 1] = g;
              data[targetIndex + 2] = b;
              data[targetIndex + 3] = a;
            }
          }
        }
      }

      ctx.putImageData(imageData, clampedArea.x, clampedArea.y);
    }

    // Draw selection rectangle and handles
    drawSelectionBox(ctx, scaledWidth, scaledHeight);
  }, [cropArea, pixelSize, previewScale]);

  const drawSelectionBox = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const scaledX = cropArea.x * previewScale;
    const scaledY = cropArea.y * previewScale;
    const scaledW = cropArea.width * previewScale;
    const scaledH = cropArea.height * previewScale;

    // Draw selection rectangle
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);
    ctx.setLineDash([]);

    // Draw resize handles
    const handleSize = 10;
    ctx.fillStyle = '#ff0000';
    
    // Corner handles
    ctx.fillRect(scaledX - handleSize/2, scaledY - handleSize/2, handleSize, handleSize); // top-left
    ctx.fillRect(scaledX + scaledW - handleSize/2, scaledY - handleSize/2, handleSize, handleSize); // top-right
    ctx.fillRect(scaledX - handleSize/2, scaledY + scaledH - handleSize/2, handleSize, handleSize); // bottom-left
    ctx.fillRect(scaledX + scaledW - handleSize/2, scaledY + scaledH - handleSize/2, handleSize, handleSize); // bottom-right
    
    // Edge handles
    ctx.fillRect(scaledX + scaledW/2 - handleSize/2, scaledY - handleSize/2, handleSize, handleSize); // top
    ctx.fillRect(scaledX + scaledW/2 - handleSize/2, scaledY + scaledH - handleSize/2, handleSize, handleSize); // bottom
    ctx.fillRect(scaledX - handleSize/2, scaledY + scaledH/2 - handleSize/2, handleSize, handleSize); // left
    ctx.fillRect(scaledX + scaledW - handleSize/2, scaledY + scaledH/2 - handleSize/2, handleSize, handleSize); // right
  };

  const getResizeHandle = (mouseX: number, mouseY: number) => {
    const scaledX = cropArea.x * previewScale;
    const scaledY = cropArea.y * previewScale;
    const scaledW = cropArea.width * previewScale;
    const scaledH = cropArea.height * previewScale;
    const handleSize = 10;
    const tolerance = handleSize / 2;

    // Check corner handles
    if (Math.abs(mouseX - scaledX) <= tolerance && Math.abs(mouseY - scaledY) <= tolerance) return 'top-left';
    if (Math.abs(mouseX - (scaledX + scaledW)) <= tolerance && Math.abs(mouseY - scaledY) <= tolerance) return 'top-right';
    if (Math.abs(mouseX - scaledX) <= tolerance && Math.abs(mouseY - (scaledY + scaledH)) <= tolerance) return 'bottom-left';
    if (Math.abs(mouseX - (scaledX + scaledW)) <= tolerance && Math.abs(mouseY - (scaledY + scaledH)) <= tolerance) return 'bottom-right';
    
    // Check edge handles
    if (Math.abs(mouseX - (scaledX + scaledW/2)) <= tolerance && Math.abs(mouseY - scaledY) <= tolerance) return 'top';
    if (Math.abs(mouseX - (scaledX + scaledW/2)) <= tolerance && Math.abs(mouseY - (scaledY + scaledH)) <= tolerance) return 'bottom';
    if (Math.abs(mouseX - scaledX) <= tolerance && Math.abs(mouseY - (scaledY + scaledH/2)) <= tolerance) return 'left';
    if (Math.abs(mouseX - (scaledX + scaledW)) <= tolerance && Math.abs(mouseY - (scaledY + scaledH/2)) <= tolerance) return 'right';
    
    return '';
  };

  // Auto-apply pixelation when image, crop area, or pixel size changes
  useEffect(() => {
    if (image) {
      drawPreview(image);
    }
  }, [image, cropArea, pixelSize, drawPreview]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;
    
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const handle = getResizeHandle(mouseX, mouseY);
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ x: mouseX, y: mouseY });
    } else {
      // Check if clicking inside the crop area for dragging
      const scaledX = cropArea.x * previewScale;
      const scaledY = cropArea.y * previewScale;
      const scaledW = cropArea.width * previewScale;
      const scaledH = cropArea.height * previewScale;
      
      if (mouseX >= scaledX && mouseX <= scaledX + scaledW &&
          mouseY >= scaledY && mouseY <= scaledY + scaledH) {
        setIsDragging(true);
        setDragStart({ 
          x: (mouseX / previewScale) - cropArea.x, 
          y: (mouseY / previewScale) - cropArea.y 
        });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isResizing) {
      const deltaX = (mouseX - dragStart.x) / previewScale;
      const deltaY = (mouseY - dragStart.y) / previewScale;
      
      const newArea = { ...cropArea };
      
      switch (resizeHandle) {
        case 'top-left':
          newArea.x += deltaX;
          newArea.y += deltaY;
          newArea.width -= deltaX;
          newArea.height -= deltaY;
          break;
        case 'top-right':
          newArea.y += deltaY;
          newArea.width += deltaX;
          newArea.height -= deltaY;
          break;
        case 'bottom-left':
          newArea.x += deltaX;
          newArea.width -= deltaX;
          newArea.height += deltaY;
          break;
        case 'bottom-right':
          newArea.width += deltaX;
          newArea.height += deltaY;
          break;
        case 'top':
          newArea.y += deltaY;
          newArea.height -= deltaY;
          break;
        case 'bottom':
          newArea.height += deltaY;
          break;
        case 'left':
          newArea.x += deltaX;
          newArea.width -= deltaX;
          break;
        case 'right':
          newArea.width += deltaX;
          break;
      }
      
      // Ensure minimum size and bounds
      newArea.width = Math.max(20, Math.min(newArea.width, image.width - newArea.x));
      newArea.height = Math.max(20, Math.min(newArea.height, image.height - newArea.y));
      newArea.x = Math.max(0, Math.min(newArea.x, image.width - newArea.width));
      newArea.y = Math.max(0, Math.min(newArea.y, image.height - newArea.height));
      
      setCropArea(newArea);
      setDragStart({ x: mouseX, y: mouseY });
    } else if (isDragging) {
      const newX = Math.max(0, Math.min((mouseX / previewScale) - dragStart.x, image.width - cropArea.width));
      const newY = Math.max(0, Math.min((mouseY / previewScale) - dragStart.y, image.height - cropArea.height));
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else {
      // Update cursor based on hover
      const handle = getResizeHandle(mouseX, mouseY);
      if (handle) {
        const cursors: { [key: string]: string } = {
          'top-left': 'nw-resize',
          'top-right': 'ne-resize',
          'bottom-left': 'sw-resize',
          'bottom-right': 'se-resize',
          'top': 'n-resize',
          'bottom': 's-resize',
          'left': 'w-resize',
          'right': 'e-resize'
        };
        canvas.style.cursor = cursors[handle];
      } else {
        const scaledX = cropArea.x * previewScale;
        const scaledY = cropArea.y * previewScale;
        const scaledW = cropArea.width * previewScale;
        const scaledH = cropArea.height * previewScale;
        
        if (mouseX >= scaledX && mouseX <= scaledX + scaledW &&
            mouseY >= scaledY && mouseY <= scaledY + scaledH) {
          canvas.style.cursor = 'move';
        } else {
          canvas.style.cursor = 'default';
        }
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  const downloadImage = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    // Draw original image
    ctx.drawImage(image, 0, 0);

    // Apply pixelation to the specified area
    const imageData = ctx.getImageData(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    const data = imageData.data;
    const size = pixelSize[0];

    for (let y = 0; y < cropArea.height; y += size) {
      for (let x = 0; x < cropArea.width; x += size) {
        const pixelIndex = (y * cropArea.width + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const a = data[pixelIndex + 3];

        for (let dy = 0; dy < size && y + dy < cropArea.height; dy++) {
          for (let dx = 0; dx < size && x + dx < cropArea.width; dx++) {
            const targetIndex = ((y + dy) * cropArea.width + (x + dx)) * 4;
            data[targetIndex] = r;
            data[targetIndex + 1] = g;
            data[targetIndex + 2] = b;
            data[targetIndex + 3] = a;
          }
        }
      }
    }

    ctx.putImageData(imageData, cropArea.x, cropArea.y);

    // Create download link
    const mimeType = downloadFormat === 'jpg' || downloadFormat === 'jpeg' ? 'image/jpeg' : `image/${downloadFormat}`;
    const quality = downloadFormat === 'jpg' || downloadFormat === 'jpeg' ? 0.9 : undefined;
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `pixelated-image.${downloadFormat}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Image downloaded successfully!');
      }
    }, mimeType, quality);
  };

  const resetImage = () => {
    if (image) {
      drawPreview(image);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Upload Section */}
      <div className="space-y-4">
        <div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            variant="outline"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {image && (
        <>
          {/* Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pixelation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Pixelation Size: {pixelSize[0]}px</Label>
                  <Slider
                    value={pixelSize}
                    onValueChange={setPixelSize}
                    max={50}
                    min={2}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="format">Download Format</Label>
                  <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selection Area</CardTitle>
                <CardDescription>Drag corners and edges to resize, or use precise inputs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="x">X Position</Label>
                    <Input
                      id="x"
                      type="number"
                      value={Math.round(cropArea.x)}
                      onChange={(e) => setCropArea(prev => ({ ...prev, x: Math.max(0, parseInt(e.target.value) || 0) }))}
                      min={0}
                      max={image ? image.width - cropArea.width : 0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="y">Y Position</Label>
                    <Input
                      id="y"
                      type="number"
                      value={Math.round(cropArea.y)}
                      onChange={(e) => setCropArea(prev => ({ ...prev, y: Math.max(0, parseInt(e.target.value) || 0) }))}
                      min={0}
                      max={image ? image.height - cropArea.height : 0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={Math.round(cropArea.width)}
                      onChange={(e) => setCropArea(prev => ({ ...prev, width: Math.max(20, parseInt(e.target.value) || 100) }))}
                      min={20}
                      max={image ? image.width - cropArea.x : 100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={Math.round(cropArea.height)}
                      onChange={(e) => setCropArea(prev => ({ ...prev, height: Math.max(20, parseInt(e.target.value) || 100) }))}
                      min={20}
                      max={image ? image.height - cropArea.y : 100}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <CardDescription>
                Drag the red box to move • Drag corners/edges to resize • Live pixelation preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full h-auto border border-border rounded-lg"
                  style={{ maxWidth: '100%', maxHeight: '500px' }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Live preview with resizable selection. Pixelation is applied automatically as you adjust settings.
              </p>
            </CardContent>
          </Card>

          {/* Hidden canvas for final processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={downloadImage} className="flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
            <Button onClick={resetImage} variant="outline" className="flex-1 sm:flex-none">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Preview
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PixelateTool;
