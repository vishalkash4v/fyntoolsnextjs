'use client';
﻿
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Download, Image as ImageIcon, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const LogoToFavicon = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [faviconSizes, setFaviconSizes] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  const sizes = [
    { size: 16, name: '16x16 (Browser Tab)' },
    { size: 32, name: '32x32 (Browser Address Bar)' },
    { size: 48, name: '48x48 (Windows)' },
    { size: 96, name: '96x96 (Android)' },
    { size: 180, name: '180x180 (Apple Touch)' },
    { size: 192, name: '192x192 (Android Chrome)' },
    { size: 512, name: '512x512 (PWA)' }
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
      setFaviconSizes({});
    }
  }, [toast]);

  const generateFavicons = useCallback(async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    const generatedSizes: { [key: string]: string } = {};

    try {
      const img = new Image();
      img.onload = async () => {
        for (const { size } of sizes) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          canvas.width = size;
          canvas.height = size;

          if (ctx) {
            // Add white background for transparency
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, size, size);

            // Draw image with proper scaling
            ctx.drawImage(img, 0, 0, size, size);

            // Convert to data URL
            const dataUrl = canvas.toDataURL('image/png');
            generatedSizes[size.toString()] = dataUrl;
          }
        }

        setFaviconSizes(generatedSizes);
        setIsGenerating(false);

        toast({
          title: "Favicons generated successfully!",
          description: `Generated ${sizes.length} different favicon sizes.`,
        });
      };

      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: "An error occurred while generating favicons.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  }, [selectedFile, toast]);

  const downloadFavicon = useCallback((size: string, dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `favicon-${size}x${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const downloadAll = useCallback(() => {
    Object.entries(faviconSizes).forEach(([size, dataUrl]) => {
      setTimeout(() => downloadFavicon(size, dataUrl), 100);
    });
  }, [faviconSizes, downloadFavicon]);

  const downloadZip = useCallback(async () => {
    if (!Object.keys(faviconSizes).length) return;

    const zip = new JSZip();
    const manifest = {
      name: "FYN Tools",
      short_name: "FYN Tools",
      icons: [
        { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png" }
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone"
    };

    await Promise.all(
      Object.entries(faviconSizes).map(async ([size, dataUrl]) => {
        const blob = await fetch(dataUrl).then((res) => res.blob());
        zip.file(`favicon-${size}x${size}.png`, blob);
      })
    );

    zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'favicon-icons.zip');
  }, [faviconSizes]);

  return (
    <div className="w-full py-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Logo to Favicon Converter
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Convert your logo into multiple favicon sizes for websites and apps
        </p>
      </div>

      <div className="grid gap-6 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Steps</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <div>1. Upload a square logo file (PNG/JPG/SVG).</div>
            <div>2. Click "Generate Favicons".</div>
            <div>3. Download the ZIP and upload files to your website root.</div>
            <div>4. Paste the HTML links inside your site's <code>{'<head>'}</code> tag.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              Upload Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-5 sm:p-6 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <span className="text-sm font-medium text-primary hover:text-primary/80">
                  Click to upload your logo
                </span>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                Best results with square logos (PNG, JPG, SVG)
              </p>
            </div>

            {previewUrl && (
              <div className="bg-muted/50 rounded-lg p-4 text-center break-words">
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  className="mx-auto w-28 h-28 sm:w-32 sm:h-32 object-contain rounded"
                />
                <p className="text-sm font-medium mt-2">
                  {selectedFile?.name}
                </p>
              </div>
            )}

            {selectedFile && (
              <Button
                onClick={generateFavicons}
                disabled={isGenerating}
                className="w-full"
              >
                <Star className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating Favicons...' : 'Generate Favicons'}
              </Button>
            )}
          </CardContent>
        </Card>

        {Object.keys(faviconSizes).length > 0 && (
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="h-5 w-5" />
                Generated Favicons
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={downloadZip} variant="outline" size="sm">
                  Download ZIP
                </Button>
                <Button onClick={downloadAll} variant="outline" size="sm">
                  Download All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 overflow-x-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sizes.map(({ size, name }) => (
                  <div key={size} className="bg-muted/50 rounded-lg p-4 text-center break-words">
                    <img
                      src={faviconSizes[size.toString()]}
                      alt={`${size}x${size} favicon`}
                      className="mx-auto mb-2 border rounded"
                      style={{ width: '48px', height: '48px' }}  // Ensure uniform size for images
                    />
                    <p className="text-xs font-medium mb-1">{name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{size}×{size}px</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadFavicon(size.toString(), faviconSizes[size.toString()])}
                      className="w-full text-xs"
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Where to upload the ZIP files
                  </h3>
                  <div className="text-xs text-blue-800/80 dark:text-blue-200/80 space-y-2">
                    <div>1. Download the ZIP and extract it.</div>
                    <div>2. Upload all files to your website root folder.</div>
                    <div>3. For React/Vite: place files in <code>public/</code>.</div>
                    <div>4. For WordPress: upload to your theme folder or root.</div>
                  </div>
                </div>

                <div className="p-4 bg-muted/40 rounded-lg">
                  <h3 className="font-medium mb-2">Paste these links in your HTML head</h3>
                  <pre className="text-xs bg-card p-3 rounded overflow-x-auto">
{`<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png">
<link rel="manifest" href="/site.webmanifest">`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LogoToFavicon;



