'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  logoSrc?: string | null;
};

/** Isolated chunk — keeps qrcode.react out of the initial UrlShortener bundle. */
export default function UrlShortenerQrDialog({ open, onOpenChange, url, logoSrc }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const downloadQrCode = async () => {
    if (!wrapRef.current || !url) {
      toast.error('QR code not available');
      return;
    }
    try {
      const svg = wrapRef.current.querySelector('svg');
      if (!svg) {
        toast.error('QR code not available');
        return;
      }
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 512);
        ctx.drawImage(img, 0, 0, 512, 512);
        canvas.toBlob((png) => {
          URL.revokeObjectURL(objectUrl);
          if (!png) return;
          const a = document.createElement('a');
          const href = URL.createObjectURL(png);
          a.href = href;
          a.download = `qrcode-${url.replace(/[^a-z0-9]/gi, '-').substring(0, 50)}.png`;
          a.click();
          URL.revokeObjectURL(href);
          toast.success('QR code downloaded');
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        toast.error('Failed to export QR code');
      };
      img.src = objectUrl;
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>Scan this QR code to open the URL</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div
            ref={wrapRef}
            className="p-4 bg-white rounded-lg flex justify-center items-center"
          >
            <QRCodeSVG
              value={url}
              size={256}
              level="H"
              includeMargin
              imageSettings={{
                src: logoSrc || '/logobeta-64.webp',
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center break-all px-4">{url}</p>
          <Button onClick={downloadQrCode} className="w-full" variant="default">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
