'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, MapPin, Calendar, Info } from "lucide-react";
import { toast } from "sonner";

interface ExifData {
  [key: string]: any;
}

const ImageMetadataViewer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [metadata, setMetadata] = useState<ExifData>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    extractMetadata(file);
  }, []);

  const extractMetadata = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      // Basic file metadata
      const basicMetadata = {
        'File Name': file.name,
        'File Size': `${(file.size / 1024).toFixed(2)} KB`,
        'File Type': file.type,
        'Last Modified': new Date(file.lastModified).toLocaleString(),
      };

      // Extract image dimensions
      const img = new Image();
      img.onload = () => {
        const imageMetadata = {
          ...basicMetadata,
          'Width': `${img.width}px`,
          'Height': `${img.height}px`,
          'Aspect Ratio': `${(img.width / img.height).toFixed(2)}:1`,
        };

        // Try to extract EXIF data (simplified version)
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const dataView = new DataView(arrayBuffer);
          
          // Check for JPEG EXIF data
          if (dataView.getUint16(0) === 0xFFD8) {
            const exifData = extractExifData(dataView);
            setMetadata({ ...imageMetadata, ...exifData });
          } else {
            setMetadata(imageMetadata);
          }
        };
        reader.readAsArrayBuffer(file);
      };
      img.src = URL.createObjectURL(file);
    } catch (error) {
      toast.error('Failed to extract metadata');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const extractExifData = (dataView: DataView): ExifData => {
    const exifData: ExifData = {};
    
    try {
      // This is a simplified EXIF extraction
      // In a real implementation, you'd use a library like exif-js or piexifjs
      
      // Look for EXIF marker (0xFFE1)
      let offset = 2;
      while (offset < dataView.byteLength - 2) {
        const marker = dataView.getUint16(offset);
        if (marker === 0xFFE1) {
          const length = dataView.getUint16(offset + 2);
          const exifString = new TextDecoder().decode(
            new Uint8Array(dataView.buffer, offset + 4, 4)
          );
          
          if (exifString === 'Exif') {
            // EXIF data found - this would need proper parsing
            exifData['EXIF Found'] = 'Yes';
            exifData['EXIF Size'] = `${length} bytes`;
            break;
          }
        }
        offset += 2;
      }
    } catch (error) {
      // Silent fail for EXIF extraction
    }
    
    return exifData;
  };

  const formatMetadataKey = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const getMetadataIcon = (key: string) => {
    if (key.toLowerCase().includes('camera') || key.toLowerCase().includes('make')) {
      return <Camera className="h-4 w-4" />;
    }
    if (key.toLowerCase().includes('gps') || key.toLowerCase().includes('location')) {
      return <MapPin className="h-4 w-4" />;
    }
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
      return <Calendar className="h-4 w-4" />;
    }
    return <Info className="h-4 w-4" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <Label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium">Click to upload image</p>
                <p className="text-sm text-gray-500">JPEG, PNG, WebP, GIF supported</p>
              </div>
            </Label>
          </div>
        </CardContent>
      </Card>

      {previewUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Image Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-80 object-contain rounded-lg shadow-lg"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Metadata & EXIF Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getMetadataIcon(key)}
                        <span className="font-medium text-sm">{formatMetadataKey(key)}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {value?.toString() || 'N/A'}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(metadata).length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No metadata extracted yet
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImageMetadataViewer;
