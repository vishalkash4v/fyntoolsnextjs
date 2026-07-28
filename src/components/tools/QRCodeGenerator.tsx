'use client';

import React, { useState, useRef } from 'react';
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { QRCodeCanvas } from 'qrcode.react';
import { useToast } from '@/components/ui/use-toast';
import { Download, Image as ImageIcon, Palette, MessageCircle, Phone, Mail, Instagram, Facebook, Youtube, X, QrCode, Camera, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';

type QRType = 'text' | 'whatsapp' | 'instagram' | 'facebook' | 'youtube' | 'x' | 'sms' | 'phone' | 'email';

const QRCodeGenerator: React.FC = () => {
  const router = useRouter();
  const [qrType, setQrType] = useState<QRType>('text');
  const [text, setText] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+1');
  const [message, setMessage] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [qrValue, setQrValue] = useState<string>('');
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [bgImageSrc, setBgImageSrc] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(0.15);
  const [qrCodeSize, setQrCodeSize] = useState<number>(256);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const qrTypeOptions = [
    { value: 'text', label: 'Text/URL', icon: MessageCircle },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'facebook', label: 'Facebook', icon: Facebook },
    { value: 'youtube', label: 'YouTube', icon: Youtube },
    { value: 'x', label: 'X (Twitter)', icon: X },
    { value: 'sms', label: 'SMS', icon: MessageCircle },
    { value: 'phone', label: 'Phone Call', icon: Phone },
    { value: 'email', label: 'Email', icon: Mail },
  ];

  const generateQRValue = () => {
    switch (qrType) {
      case 'whatsapp':
        if (!phoneNumber) return '';
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        return `https://wa.me/${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
      
      case 'instagram':
        return username ? `https://instagram.com/${username}` : '';
      
      case 'facebook':
        return username ? `https://facebook.com/${username}` : '';
      
      case 'youtube':
        return username ? `https://youtube.com/@${username}` : '';
      
      case 'x':
        return username ? `https://x.com/${username}` : '';
      
      case 'sms':
        if (!phoneNumber) return '';
        return `sms:${countryCode}${phoneNumber.replace(/\D/g, '')}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
      
      case 'phone':
        if (!phoneNumber) return '';
        return `tel:${countryCode}${phoneNumber.replace(/\D/g, '')}`;
      
      case 'email':
        if (!email) return '';
        return `mailto:${email}${subject || message ? '?' : ''}${subject ? `subject=${encodeURIComponent(subject)}` : ''}${subject && message ? '&' : ''}${message ? `body=${encodeURIComponent(message)}` : ''}`;
      
      default:
        return text;
    }
  };

  const handleGenerate = () => {
    const value = generateQRValue();
    
    if (!value.trim()) {
      const fieldName = qrType === 'text' ? 'text or URL' : 
                       qrType === 'whatsapp' || qrType === 'sms' || qrType === 'phone' ? 'phone number' :
                       qrType === 'email' ? 'email address' : 'username';
      
      toast({
        title: 'Input Required',
        description: `Please enter ${fieldName} to generate QR code.`,
        variant: 'destructive',
      });
      setQrValue('');
      return;
    }
    
    setQrValue(value);
    toast({
      title: 'QR Code Generated',
      description: 'Your QR code is ready.',
    });
  };

  const handleDownload = () => {
    if (!qrValue) {
      toast({
        title: 'Nothing to Download',
        description: 'Generate a QR code first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Prefer ref (id is unreliable with qrcode.react); fallback to query
      const canvas =
        qrCanvasRef.current ||
        (document.querySelector('#qrcode-canvas') as HTMLCanvasElement | null) ||
        (document.querySelector('canvas') as HTMLCanvasElement | null);

      if (!canvas) {
        toast({
          title: 'Download Failed',
          description: 'Could not find QR code canvas element.',
          variant: 'destructive',
        });
        return;
      }

      // Draw to a clean offscreen canvas so logos/tainted pixels don't silently fail
      const exportCanvas = document.createElement('canvas');
      const scale = 2;
      exportCanvas.width = canvas.width * scale;
      exportCanvas.height = canvas.height * scale;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = bgColor || '#FFFFFF';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

      exportCanvas.toBlob((blob) => {
        if (!blob) {
          toast({
            title: 'Download Failed',
            description: 'Could not export QR image. Try removing the logo and retry.',
            variant: 'destructive',
          });
          return;
        }
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'fyntools-qrcode.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        toast({
          title: 'Download Started',
          description: 'High-quality QR code PNG is downloading.',
        });
      }, 'image/png');
    } catch (err) {
      console.error(err);
      toast({
        title: 'Download Failed',
        description:
          'Export blocked (often by an external logo). Remove the logo or use a same-origin image.',
        variant: 'destructive',
      });
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 1MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoSrc(reader.result as string);
        toast({
          title: 'Logo Uploaded',
          description: 'Your logo has been added to the QR code preview.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 1MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImageSrc(reader.result as string);
        toast({
          title: 'Background Image Uploaded',
          description: 'Your background image has been added.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: 'Logo Cleared',
      description: 'The logo has been removed.',
    });
  };

  const clearBgImage = () => {
    setBgImageSrc(null);
    if (bgImageInputRef.current) {
      bgImageInputRef.current.value = '';
    }
    toast({
      title: 'Background Image Cleared',
      description: 'The background image has been removed.',
    });
  };

  const imageSettings = logoSrc
    ? {
        src: logoSrc,
        height: qrCodeSize * logoSize,
        width: qrCodeSize * logoSize,
        excavate: true,
        x: undefined,
        y: undefined,
      }
    : undefined;

  const renderInputFields = () => {
    switch (qrType) {
      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (with country code)
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="1234567890"
                className="text-base p-3"
              />
            </div>
            <div>
              <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Pre-filled Message (Optional)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hello! I found you through QR code..."
                className="text-base p-3"
                rows={3}
              />
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="countryCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Country Code
                </Label>
                <Input
                  id="countryCode"
                  type="text"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  placeholder="+1"
                  className="text-base p-3"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="1234567890"
                  className="text-base p-3"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Pre-filled Message (Optional)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message here..."
                className="text-base p-3"
                rows={3}
              />
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="countryCode" className="block text-sm font-medium text-gray-700 mb-1">
                Country Code
              </Label>
              <Input
                id="countryCode"
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="+1"
                className="text-base p-3"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="1234567890"
                className="text-base p-3"
              />
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="text-base p-3"
              />
            </div>
            <div>
              <Label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject (Optional)
              </Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="text-base p-3"
              />
            </div>
            <div>
              <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Email body..."
                className="text-base p-3"
                rows={3}
              />
            </div>
          </div>
        );

      case 'instagram':
      case 'facebook':
      case 'youtube':
      case 'x':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username (without @)
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                className="text-base p-3"
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label htmlFor="qrText" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Text or URL
            </Label>
            <Input
              id="qrText"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., https://www.example.com"
              className="text-base p-3"
            />
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-2 gap-2 mb-8 bg-card/50 p-1 rounded-xl">
        <div className="flex items-center justify-center gap-2 rounded-lg py-3 bg-primary text-primary-foreground font-medium">
          <QrCode className="h-4 w-4" />
          Generate QR Code
        </div>
        <button
          type="button"
          onClick={() => router.push('/qr-scanner')}
          className="flex items-center justify-center gap-2 rounded-lg py-3 text-foreground hover:bg-muted/80 transition-colors font-medium border border-transparent"
        >
          <Camera className="h-4 w-4" />
          Scan QR Code
        </button>
      </div>

      <div className="space-y-8">
        {/* How to Create QR Code Guide */}
        <Card className="glass-card border border-white/20 dark:border-white/10 hover-lift">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold gradient-text mb-6 text-center">How to create a professional QR Code</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-accent to-primary rounded-full animate-glow-pulse"></div>
                </div>
                <h4 className="font-semibold text-lg text-foreground mb-3">Choose your QR Code type</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Select the QR Code type that fits your content—for example, a website URL, a phone contact, or a downloadable PDF.</p>
              </div>
              
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-accent to-primary rounded-full animate-glow-pulse"></div>
                </div>
                <h4 className="font-semibold text-lg text-foreground mb-3">Add details and customize</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Add elements like your brand's primary color, company logo, or a frame with a call-to-action to make your QR Code recognizable and professional.</p>
              </div>
              
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-accent to-primary rounded-full animate-glow-pulse"></div>
                </div>
                <h4 className="font-semibold text-lg text-foreground mb-3">Download and share</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Choose the format that best fits your use case. Download as PNG for high quality prints or use SVG for scalable graphics.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator Section */}
          <Card className="glass-card border border-white/20 dark:border-white/10 hover-lift relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold gradient-text mb-2">QR Code Generator</h3>
                <p className="text-sm text-muted-foreground">Create your custom QR code in seconds</p>
              </div>
              
              <div>
                <Label htmlFor="qrType" className="block text-sm font-medium mb-3">
                  QR Code Type
                </Label>
                <Select value={qrType} onValueChange={(value: QRType) => setQrType(value)}>
                  <SelectTrigger className="w-full glass border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 backdrop-blur-md">
                    <SelectValue placeholder="Select QR type" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border border-white/20 dark:border-white/10 backdrop-blur-xl">
                    {qrTypeOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value} className="hover:bg-white/10 dark:hover:bg-white/5">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-4 w-4 text-primary" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {renderInputFields()}

              <Button onClick={handleGenerate} className="w-full h-12 text-base bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                <QrCode className="mr-2 h-5 w-5" />
                Generate QR Code
              </Button>
            </CardContent>
          </Card>

          {/* Customization Section */}
          <Card className="glass-card border border-white/20 dark:border-white/10 hover-lift relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5"></div>
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold gradient-text mb-2">Customize Appearance</h3>
                <p className="text-sm text-muted-foreground">Make your QR code unique and professional</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fgColor" className="text-sm font-medium mb-2 block">Foreground Color</Label>
                  <div className="relative">
                    <Input
                      id="fgColor"
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-full h-12 p-2 cursor-pointer"
                    />
                    <div className="absolute inset-2 rounded-lg border-2 border-white/50 pointer-events-none"></div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bgColor" className="text-sm font-medium mb-2 block">Background Color</Label>
                  <div className="relative">
                    <Input
                      id="bgColor"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full h-12 p-2 cursor-pointer"
                    />
                    <div className="absolute inset-2 rounded-lg border-2 border-white/50 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="logoUpload" className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Upload Logo (max 1MB)
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="logoUpload"
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleLogoUpload}
                    ref={fileInputRef}
                    className="text-sm flex-1"
                  />
                  {logoSrc && (
                    <Button onClick={clearLogo} variant="outline" size="sm" className="glass border-white/20 dark:border-white/10">
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="qrCodeSize" className="text-sm font-medium mb-3 block">QR Code Size (px)</Label>
                <Input
                  id="qrCodeSize"
                  type="number"
                  value={qrCodeSize}
                  onChange={(e) => setQrCodeSize(Math.max(64, Math.min(1024, parseInt(e.target.value, 10) || 256)))}
                  min="64"
                  max="1024"
                  step="8"
                  className="w-full"
                />
              </div>

              {logoSrc && (
                <div>
                  <Label htmlFor="logoSize" className="text-sm font-medium mb-3 block">
                    Logo Size ({(logoSize * 100).toFixed(0)}%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="logoSizeSlider"
                      type="range"
                      min="0.05"
                      max="0.3"
                      step="0.01"
                      value={logoSize}
                      onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                      className="w-full mt-2 accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>5%</span>
                      <span>30%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Code Preview */}
        {qrValue && (
          <Card className="glass-card border border-white/20 dark:border-white/10 hover-lift glow-hover relative overflow-hidden animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
            <CardContent className="p-12 flex flex-col items-center space-y-8 relative z-10">
              <div className="text-center">
                <h3 className="text-2xl font-bold gradient-text mb-2">Your QR Code is Ready!</h3>
                <p className="text-muted-foreground">Scan to test or download for use</p>
              </div>
              
              <div 
                className="p-8 inline-block shadow-2xl rounded-3xl relative overflow-hidden border-2 border-white/20 dark:border-white/10 hover:scale-105 transition-transform duration-300" 
                style={{ backgroundColor: bgColor }}
              >
                <div className="relative">
                  <QRCodeCanvas
                    id="qrcode-canvas"
                    ref={qrCanvasRef}
                    value={qrValue}
                    size={qrCodeSize}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level="H"
                    includeMargin={true}
                    imageSettings={imageSettings}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 pointer-events-none rounded-2xl"></div>
              </div>
              
              <Button 
                onClick={handleDownload} 
                variant="default"
                size="lg"
                className="px-12 py-4 text-lg shadow-xl hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
              >
                <Download className="mr-3 h-6 w-6" />
                Download High Quality QR Code
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
