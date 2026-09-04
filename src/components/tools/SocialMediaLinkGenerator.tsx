'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Smartphone, Globe, QrCode, Copy, Check, AlertCircle, Youtube, Instagram, Facebook, Twitter, MessageCircle, Link as LinkIcon, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CopyButton from '@/components/common/CopyButton';
import { QRCodeSVG } from 'qrcode.react';
import { platformConfigs, getPlatformConfig, PlatformConfig } from '@/utils/deepLinkConfig';
import { Download } from 'lucide-react';

const SocialMediaLinkGenerator = () => {
  const [platform, setPlatform] = useState<string>('');
  const [input, setInput] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [appLink, setAppLink] = useState('');
  const [webLink, setWebLink] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Platform icons mapping
  const platformIcons: Record<string, React.ComponentType<any>> = {
    youtube: Youtube,
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    whatsapp: MessageCircle,
    telegram: MessageCircle,
    linkedin: Linkedin
  };

  // Get platform icon
  const getPlatformIcon = (platformId: string) => {
    const Icon = platformIcons[platformId] || LinkIcon;
    return <Icon className="h-4 w-4" />;
  };

  // Sanitize input to prevent XSS and invalid URLs
  const sanitizeInput = (input: string): string => {
    // Remove any script tags and dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  // Validate and generate deep link
  const generateDeepLink = () => {
    setError('');
    setGeneratedLink('');
    setAppLink('');
    setWebLink('');

    if (!platform) {
      setError('Please select a platform');
      toast({
        title: "Error",
        description: "Please select a platform",
        variant: "destructive"
      });
      return;
    }

    if (!input.trim()) {
      setError('Please enter a URL, ID, or username');
      toast({
        title: "Error",
        description: "Please enter a URL, ID, or username",
        variant: "destructive"
      });
      return;
    }

    const config = getPlatformConfig(platform);
    if (!config) {
      setError('Invalid platform selected');
      toast({
        title: "Error",
        description: "Invalid platform selected",
        variant: "destructive"
      });
      return;
    }

    // Sanitize input
    const sanitizedInput = sanitizeInput(input);

    // Extract ID from input
    const extractedId = config.extractId(sanitizedInput);
    
    if (!extractedId) {
      setError(`Invalid ${config.name} URL or identifier. Please check your input and try again.`);
      toast({
        title: "Invalid Input",
        description: `Could not extract ${config.name} identifier from the provided input.`,
        variant: "destructive"
      });
      return;
    }

    // Build app and web links
    const appDeepLink = config.buildAppLink(extractedId);
    const webFallbackLink = config.buildWebLink(extractedId);

    // Validate web link
    try {
      new URL(webFallbackLink);
    } catch (e) {
      setError('Generated web URL is invalid');
      toast({
        title: "Error",
        description: "Generated web URL is invalid",
        variant: "destructive"
      });
      return;
    }

    // Generate smart redirect link with simplified encoding
    // Use base64 encoding for cleaner URLs (shorter, less % symbols)
    const encodeBase64 = (str: string) => {
      try {
        return btoa(encodeURIComponent(str)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      } catch {
        return encodeURIComponent(str);
      }
    };
    
    const smartLink = `${window.location.origin}/deep-link-redirect?` + 
      `a=${encodeBase64(appDeepLink)}&` +
      `w=${encodeBase64(webFallbackLink)}&` +
      `p=${encodeBase64(config.name)}&` +
      `t=${encodeBase64(`Open ${config.name} Content`)}`;

    setAppLink(appDeepLink);
    setWebLink(webFallbackLink);
    setGeneratedLink(smartLink);
    setPlatformName(config.name);

    toast({
      title: "Deep Link Generated!",
      description: `Smart deep link created for ${config.name}`,
    });
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (!generatedLink) {
      toast({
        title: "No Link",
        description: "Please generate a deep link first",
        variant: "destructive"
      });
      return;
    }

    const svg = document.getElementById('deep-link-qr')?.querySelector('svg');
    if (!svg) {
      toast({
        title: "Error",
        description: "QR code not found",
        variant: "destructive"
      });
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 512;
    canvas.height = 512;
    
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = `deep-link-${platform}-qr.png`;
        a.href = url;
        a.click();
        
        toast({
          title: "Download Started",
          description: "QR code image download has started.",
        });
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const currentConfig = platform ? getPlatformConfig(platform) : null;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            Open Link in App
          </CardTitle>
          <CardDescription>
            Generate smart app-opening links that automatically open content in mobile apps if installed, or seamlessly fallback to web browser. Works perfectly on Android, iOS, and Desktop. Free app opener tool - no registration required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">Select Platform</Label>
            <Select value={platform} onValueChange={(value) => {
              setPlatform(value);
              setInput('');
              setError('');
              setGeneratedLink('');
            }}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Choose a social media platform" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(platformConfigs).map((config) => (
                  <SelectItem key={config.id} value={config.id}>
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(config.id)}
                      <span>{config.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input Field */}
          {platform && currentConfig && (
            <div className="space-y-2">
              <Label htmlFor="input">{currentConfig.inputLabel}</Label>
              <Input
                id="input"
                placeholder={currentConfig.inputPlaceholder}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && generateDeepLink()}
              />
              <p className="text-xs text-muted-foreground">
                Example: {currentConfig.exampleUrl}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button 
            onClick={generateDeepLink} 
            className="w-full" 
            disabled={!platform || !input.trim()}
            size="lg"
          >
            Generate Smart Deep Link
          </Button>

          {/* Generated Link Display */}
          {generatedLink && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label className="text-base font-semibold mb-2 block">Generated Smart Deep Link</Label>
                <div className="flex gap-2">
                  <Input 
                    value={generatedLink} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <CopyButton
                    textToCopy={generatedLink}
                    successMessage="Deep link copied to clipboard!"
                    variant="default"
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </CopyButton>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This smart link will try to open {platformName} app first, then fallback to web browser automatically. 
                  <span className="block mt-1 text-primary font-medium">🔗 Link made by <a href="https://fyntools.com" target="_blank" rel="noopener noreferrer" className="underline">fyntools.com</a></span>
                </p>
              </div>

              {/* Link Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      App Deep Link
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input 
                        value={appLink} 
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <CopyButton
                        textToCopy={appLink}
                        successMessage="App link copied!"
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Web Fallback Link
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input 
                        value={webLink} 
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <CopyButton
                        textToCopy={webLink}
                        successMessage="Web link copied!"
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* QR Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </CardTitle>
                  <CardDescription>
                    Scan this QR code to open the deep link on mobile devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <div id="deep-link-qr" className="p-4 bg-white rounded-lg">
                    <QRCodeSVG value={generatedLink} size={256} />
                  </div>
                  <Button onClick={downloadQRCode} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </CardContent>
              </Card>

              {/* Test Link Button */}
              <Button 
                onClick={() => window.open(generatedLink, '_blank')}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Test Deep Link (Opens in New Tab)
              </Button>
            </div>
          )}

          {/* How It Works */}
          {!generatedLink && (
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                <strong>How it works:</strong> When someone clicks your generated link, it first attempts to open the content in the {platformName || 'target'} app. If the app is not installed, it automatically redirects to the web version. This works seamlessly on Android, iOS, and desktop browsers.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Platform Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supported Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.values(platformConfigs).map((config) => (
                <div key={config.id} className="flex items-center gap-2 text-sm">
                  {getPlatformIcon(config.id)}
                  <span>{config.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Smart app detection</li>
              <li>• Automatic web fallback</li>
              <li>• QR code generation</li>
              <li>• Mobile & desktop support</li>
              <li>• Android & iOS compatible</li>
              <li>• Secure & validated URLs</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialMediaLinkGenerator;
