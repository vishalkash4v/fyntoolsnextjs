'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

const QrGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const { toast } = useToast();

  const downloadQR = () => {
    if (!text) {
      toast({
        title: 'No Data',
        description: 'Please enter text to generate QR code.',
        variant: 'destructive',
      });
      return;
    }

    const svg = document.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = size;
      canvas.height = size;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        const url = canvas.toDataURL();
        const a = document.createElement('a');
        a.download = 'qrcode.png';
        a.href = url;
        a.click();
        
        toast({
          title: 'Downloaded!',
          description: 'QR code saved successfully.',
        });
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text">Text or URL</Label>
          <Textarea
            id="text"
            placeholder="Enter text or URL to generate QR code..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Size: {size}px</Label>
          <Input
            id="size"
            type="range"
            min="128"
            max="512"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
          />
        </div>
      </div>

      {text && (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <QRCodeSVG value={text} size={size} />
          </div>
          <Button onClick={downloadQR}>
            <Download className="mr-2 h-4 w-4" /> Download QR Code
          </Button>
        </div>
      )}
    </div>
  );
};

export default QrGenerator;
