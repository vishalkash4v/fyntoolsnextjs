'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Download, Palette } from "lucide-react";
import { toast } from "sonner";
import CopyButton from '@/components/common/CopyButton';

const PlaceholderImageGenerator = () => {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [backgroundColor, setBackgroundColor] = useState('#cccccc');
  const [gradientColor1, setGradientColor1] = useState('#667eea');
  const [gradientColor2, setGradientColor2] = useState('#764ba2');
  const [gradientDirection, setGradientDirection] = useState('45deg');
  const [textColor, setTextColor] = useState('#666666');
  const [text, setText] = useState('');
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [generatedUrl, setGeneratedUrl] = useState('');

  const commonSizes = [
    { name: 'Square', width: 400, height: 400 },
    { name: 'Landscape', width: 800, height: 600 },
    { name: 'Portrait', width: 600, height: 800 },
    { name: 'Banner', width: 1200, height: 300 },
    { name: 'Card', width: 300, height: 200 },
    { name: 'Avatar', width: 150, height: 150 },
    { name: 'HD', width: 1920, height: 1080 },
    { name: 'Mobile', width: 375, height: 812 },
  ];

  const gradientPresets = [
    { name: 'Ocean Blue', color1: '#667eea', color2: '#764ba2', direction: '45deg' },
    { name: 'Sunset', color1: '#ff7e5f', color2: '#feb47b', direction: '45deg' },
    { name: 'Purple Rain', color1: '#aa4b6b', color2: '#6b6b83', direction: '135deg' },
    { name: 'Green Tea', color1: '#11998e', color2: '#38ef7d', direction: '90deg' },
    { name: 'Cherry', color1: '#eb3349', color2: '#f45c43', direction: '180deg' },
    { name: 'Sky', color1: '#74b9ff', color2: '#0984e3', direction: '0deg' },
    { name: 'Mint', color1: '#00b894', color2: '#00cec9', direction: '45deg' },
    { name: 'Fire', color1: '#fd79a8', color2: '#fdcb6e', direction: '135deg' },
  ];

  const generateImage = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast.error('Canvas not supported');
      return;
    }

    canvas.width = width;
    canvas.height = height;

    // Create background
    if (backgroundType === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, gradientColor1);
      gradient.addColorStop(1, gradientColor2);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = backgroundColor;
    }
    ctx.fillRect(0, 0, width, height);

    // Add border
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Add text
    const displayText = text || `${width} × ${height}`;
    ctx.fillStyle = textColor;
    
    // Calculate font size based on image size
    const fontSize = Math.min(width, height) / 15;
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add text with background for better readability
    const textMetrics = ctx.measureText(displayText);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    
    // Semi-transparent background for text
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(
      (width - textWidth) / 2 - 10,
      (height - textHeight) / 2 - 5,
      textWidth + 20,
      textHeight + 10
    );

    // Draw text
    ctx.fillStyle = textColor;
    ctx.fillText(displayText, width / 2, height / 2);

    // Convert to desired format
    const mimeType = `image/${format}`;
    const quality = format === 'jpeg' ? 0.9 : undefined;
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setGeneratedUrl(url);
        toast.success('Placeholder image generated!');
      }
    }, mimeType, quality);
  }, [width, height, backgroundType, backgroundColor, gradientColor1, gradientColor2, textColor, text, format]);

  const downloadImage = useCallback(() => {
    if (!generatedUrl) return;

    const link = document.createElement('a');
    link.href = generatedUrl;
    link.download = `placeholder-${width}x${height}.${format}`;
    link.click();
    toast.success('Image downloaded successfully');
  }, [generatedUrl, width, height, format]);


  const applyCommonSize = useCallback((size: { width: number; height: number }) => {
    setWidth(size.width);
    setHeight(size.height);
  }, []);

  const applyGradientPreset = useCallback((preset: { color1: string; color2: string; direction: string }) => {
    setGradientColor1(preset.color1);
    setGradientColor2(preset.color2);
    setGradientDirection(preset.direction);
    setBackgroundType('gradient');
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Image Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  min={1}
                  max={2000}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min={1}
                  max={2000}
                />
              </div>
            </div>

            <div>
              <Label>Common Sizes</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonSizes.map((size) => (
                  <Badge
                    key={size.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => applyCommonSize(size)}
                  >
                    {size.name} ({size.width}×{size.height})
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Background Type</Label>
              <Select value={backgroundType} onValueChange={(value: 'solid' | 'gradient') => setBackgroundType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid Color</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {backgroundType === 'solid' ? (
              <div>
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#cccccc"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Gradient Presets</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {gradientPresets.map((preset) => (
                      <Badge
                        key={preset.name}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => applyGradientPreset(preset)}
                        style={{
                          background: `linear-gradient(${preset.direction}, ${preset.color1}, ${preset.color2})`,
                          color: 'white'
                        }}
                      >
                        {preset.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grad-color1">Color 1</Label>
                    <div className="flex gap-2">
                      <Input
                        id="grad-color1"
                        type="color"
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        placeholder="#667eea"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="grad-color2">Color 2</Label>
                    <div className="flex gap-2">
                      <Input
                        id="grad-color2"
                        type="color"
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        placeholder="#764ba2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="text-color"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#666666"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="custom-text">Custom Text (optional)</Label>
              <Input
                id="custom-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Leave empty for dimensions"
              />
            </div>

            <div>
              <Label htmlFor="format">Output Format</Label>
              <Select value={format} onValueChange={(value: 'png' | 'jpeg' | 'webp') => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateImage} className="w-full">
              <Palette className="h-4 w-4 mr-2" />
              Generate Image
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedUrl ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={generatedUrl}
                    alt="Generated placeholder"
                    className="max-w-full max-h-64 mx-auto"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadImage} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <CopyButton
                    textToCopy={generatedUrl}
                    successMessage="Image URL copied to clipboard"
                    variant="outline"
                    size="sm"
                    copyText="Copy URL"
                    className="flex-1"
                  />
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Size: {width} × {height} pixels</p>
                  <p>Format: {format.toUpperCase()}</p>
                  <p>Background: {backgroundType === 'gradient' ? `${gradientColor1} → ${gradientColor2}` : backgroundColor}</p>
                  <p>Text Color: {textColor}</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Generate an image to see preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaceholderImageGenerator;
