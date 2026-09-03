'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Upload, Download, Link, RotateCcw, GraduationCap, Briefcase, Mail } from 'lucide-react';
import { toast } from 'sonner';

/** Email-friendly photo KB resize presets — resize photo to KB targets. */
const emailKbPresets = [
  { id: 'email-50', label: '50 KB', max_kb: 50, maxSide: 720, note: 'Strict form uploads' },
  { id: 'email-100', label: '100 KB', max_kb: 100, maxSide: 1024, note: 'Common portal limit' },
  { id: 'email-150', label: '150 KB', max_kb: 150, maxSide: 1280, note: 'Popular exam/form size' },
  { id: 'email-200', label: '200 KB', max_kb: 200, maxSide: 1400, note: 'Email thumbnail friendly' },
  { id: 'email-500', label: '500 KB', max_kb: 500, maxSide: 1600, note: 'Balanced email photo' },
  { id: 'email-1024', label: '1 MB (Email)', max_kb: 1024, maxSide: 1920, note: 'Email-friendly photo resizer' },
] as const;

// Social Media Presets
const socialMediaPresets = {
  "Instagram": {
    profile: {
      width_px: 320,
      height_px: 320,
      aspect_ratio: "1:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Cropped to circle. Use higher resolution to avoid blur."
    },
    feed_square: {
      width_px: 1080,
      height_px: 1080,
      aspect_ratio: "1:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Standard square post"
    },
    feed_portrait: {
      width_px: 1080,
      height_px: 1350,
      aspect_ratio: "4:5",
      formats: ["jpg", "jpeg", "png"],
      notes: "Vertical / portrait post"
    },
    feed_landscape: {
      width_px: 1080,
      height_px: 566,
      aspect_ratio: "1.91:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Horizontal / wide post"
    },
    story_reel: {
      width_px: 1080,
      height_px: 1920,
      aspect_ratio: "9:16",
      formats: ["jpg", "jpeg", "png"],
      notes: "Stories / Reels full vertical"
    },
    reel_thumbnail: {
      width_px: 1080,
      height_px: 1920,
      aspect_ratio: "9:16",
      formats: ["jpg", "jpeg", "png"],
      notes: "Thumbnail / cover image for Reel. Will crop depending on grid view."
    }
  },
  "Facebook": {
    profile: {
      width_px: 320,
      height_px: 320,
      aspect_ratio: "1:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Square profile picture. Will be displayed as circle or square depending on context."
    },
    cover: {
      width_px: 851,
      height_px: 315,
      aspect_ratio: "2.7:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Cover photo (desktop). On mobile will be cropped (640×360 view)."
    },
    post_square: {
      width_px: 1080,
      height_px: 1080,
      aspect_ratio: "1:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Square image post"
    },
    post_vertical: {
      width_px: 1080,
      height_px: 1350,
      aspect_ratio: "4:5",
      formats: ["jpg", "jpeg", "png"],
      notes: "Vertical image post"
    },
    post_landscape: {
      width_px: 1080,
      height_px: 566,
      aspect_ratio: "1.91:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Landscape post / wide image"
    },
    story: {
      width_px: 1080,
      height_px: 1920,
      aspect_ratio: "9:16",
      formats: ["jpg", "jpeg", "png"],
      notes: "Facebook Story full vertical"
    },
    link_share: {
      width_px: 1200,
      height_px: 630,
      aspect_ratio: "1.91:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Image shown when you share a link (og:image)"
    }
  },
  "X (formerly Twitter)": {
    profile: {
      width_px: 400,
      height_px: 400,
      aspect_ratio: "1:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Square profile picture"
    },
    header: {
      width_px: 1500,
      height_px: 500,
      aspect_ratio: "3:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Banner / header image"
    },
    in_stream: {
      width_px: 1600,
      height_px: 900,
      aspect_ratio: "16:9",
      formats: ["jpg", "jpeg", "png", "gif"],
      notes: "Image in tweet / X post"
    },
    card_link: {
      width_px: 1200,
      height_px: 628,
      aspect_ratio: "1.91:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Link card image / summary card"
    }
  },
  "LinkedIn": {
    profile: {
      width_px: 400,
      height_px: 400,
      aspect_ratio: "1:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Square profile picture"
    },
    cover: {
      width_px: 1584,
      height_px: 396,
      aspect_ratio: "4:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Background / cover image for profile"
    },
    post_square: {
      width_px: 1080,
      height_px: 1080,
      aspect_ratio: "1:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Square post image"
    },
    post_horizontal: {
      width_px: 1200,
      height_px: 627,
      aspect_ratio: "1.91:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Horizontal landscape post"
    },
    post_vertical: {
      width_px: 1080,
      height_px: 1920,
      aspect_ratio: "9:16",
      formats: ["jpg", "jpeg", "png"],
      notes: "Vertical post – rare but supported"
    }
  },
  "Snapchat": {
    geofilter: {
      width_px: 1080,
      height_px: 1920,
      aspect_ratio: "9:16",
      formats: ["png"],
      notes: "Transparent PNG overlay geofilter; must keep key design elements away from edges."
    }
  },
  "Tinder": {
    profile_photo: {
      width_px: 800,
      height_px: 800,
      aspect_ratio: "1:1",
      formats: ["jpg", "jpeg", "png"],
      notes: "Square profile picture. Also must allow for cropping to 4:5 and 3:4 internally."
    }
  }
};

// Education and Government Portal Presets
const educationJobPresets = {
  "GATE": {
    photo: {
      width_cm: 3.5,
      height_cm: 4.5,
      min_px: [200, 260],
      max_px: [530, 690],
      min_kb: 5,
      max_kb: 600,
      formats: ["jpg", "jpeg"],
      notes: "Color photo, white/light background; face ~60-70% of area."
    },
    signature: {
      height_cm: 1.0,
      width_cm_min: 2.75,
      width_cm_max: 3.75,
      min_px: [250, 80],
      max_px: [580, 180],
      min_kb: 3,
      max_kb: 300,
      formats: ["jpg", "jpeg"],
      notes: "Signature in black/dark-blue ink, should cover 70-80% of uploaded area."
    }
  },
  "NEET (NTA)": {
    photo: {
      width_cm: 3.5,
      height_cm: 4.5,
      postcard_cm: [10.16, 15.24],
      min_kb: 10,
      max_kb: 200,
      formats: ["jpg", "jpeg"],
      notes: "Recent passport-size color photo; also require postcard size for some admit card uses."
    },
    signature: {
      min_kb: 4,
      max_kb: 30,
      formats: ["jpg", "jpeg"],
      notes: "Sign with black pen on white paper; scan & upload per NTA bulletin."
    }
  },
  "JEE Main (NTA)": {
    photo: {
      width_cm: 3.5,
      height_cm: 4.5,
      min_kb: 10,
      max_kb: 300,
      formats: ["jpg", "jpeg"],
      notes: "White background; recent color photograph."
    },
    signature: {
      min_kb: 4,
      max_kb: 30,
      formats: ["jpg", "jpeg"],
      notes: "Black/blue ink, scanned and cropped."
    }
  },
  "UPSC": {
    photo: {
      min_kb: 20,
      max_kb: 200,
      formats: ["jpg", "jpeg"],
      notes: "Photo must have ~75% face coverage (3/4th face coverage); recent, clear."
    },
    signature: {
      min_kb: 20,
      max_kb: 100,
      min_px: [350, 350],
      max_px: [500, 500],
      formats: ["jpg", "jpeg"],
      notes: "Sign on white paper with black pen; scan clearly."
    }
  },
  "SSC (CGL / other SSC)": {
    photo: {
      width_cm: 3.5,
      height_cm: 4.5,
      min_kb: 20,
      max_kb: 50,
      formats: ["jpg", "jpeg"],
      notes: "Passport-size color photo; no cap/sunglasses; face ~40% area (varies by notification)."
    },
    signature: {
      min_kb: 10,
      max_kb: 20,
      formats: ["jpg", "jpeg"],
      notes: "Signature in running hand, black ink preferred."
    }
  },
  "IBPS / Bank Exams": {
    photo: {
      width_cm: 4.5,
      height_cm: 3.5,
      min_kb: 20,
      max_kb: 50,
      formats: ["jpg", "jpeg"],
      notes: "Passport style color photo; white/light background."
    },
    signature: {
      min_kb: 10,
      max_kb: 20,
      formats: ["jpg", "jpeg"],
      notes: "Black/blue pen signature scanned and cropped."
    }
  },
  "HPPSC": {
    photo: {
      px: [110, 140],
      max_kb: 40,
      formats: ["jpg", "jpeg"],
      notes: "HPPSC states typical pixel size 140 px (height) × 110 px (width) and <=40 KB."
    },
    signature: {
      max_kb: 40,
      formats: ["jpg", "jpeg"]
    }
  },
  "HPSSC": {
    photo: {
      px: [110, 140],
      min_kb: 20,
      max_kb: 50,
      formats: ["jpg", "jpeg"],
      notes: "HPSSC common requirements similar to HPPSC; check the specific notification."
    },
    signature: {
      min_kb: 10,
      max_kb: 20,
      formats: ["jpg", "jpeg"]
    }
  },
  "RRB (Railways)": {
    photo: {
      width_cm: 3.5,
      height_cm: 4.5,
      min_kb: 20,
      max_kb: 50,
      formats: ["jpg", "jpeg"]
    },
    signature: {
      min_kb: 10,
      max_kb: 20,
      formats: ["jpg", "jpeg"]
    }
  },
  "Driving License (RTO)": {
    photo: {
      width_cm: 2.5,
      height_cm: 3.5,
      max_kb: 20,
      formats: ["jpg", "jpeg"],
      notes: "State RTOs vary; use 300x350 px / 2.5x3.5 cm as common preset."
    },
    signature: {
      notes: "Usually not required for initial upload; vary by state."
    }
  },
  "Passport (India)": {
    photo: {
      width_mm: 45,
      height_mm: 35,
      width_cm: 4.5,
      height_cm: 3.5,
      min_kb: null,
      max_kb: 100,
      formats: ["jpg", "jpeg"],
      notes: "Passport-size: 45×35 mm (often stated as 4.5×3.5 cm); white/light background."
    },
    signature: {
      notes: "Signature usually on form - digital upload not always required for passport."
    }
  }
};

const ImageResizer = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0, fileSize: 0 });
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [quality, setQuality] = useState(90);
  const [format, setFormat] = useState('jpeg');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dpi, setDpi] = useState(300);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedPresetType, setSelectedPresetType] = useState<'photo' | 'signature' | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preset-type' | 'presets' | 'tools'>('upload');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<'education' | 'social' | 'manual' | 'email' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scalePercent, setScalePercent] = useState(0);
  const [resizedFileSize, setResizedFileSize] = useState<number | null>(null);

  // Helper functions
  const cmToPixels = (cm: number, dpi: number = 300) => Math.round(cm * dpi / 2.54);
  const mmToPixels = (mm: number, dpi: number = 300) => Math.round(mm * dpi / 25.4);
  
  const updateScaleFromSizes = (newWidth: number, newHeight: number) => {
    if (!originalImage) return;
    const originalPixels = originalImage.width * originalImage.height;
    const newPixels = Math.max(1, newWidth) * Math.max(1, newHeight);
    const scale = Math.sqrt(newPixels / Math.max(1, originalPixels));
    const percent = Math.round((scale - 1) * 100);
    setScalePercent(percent);
  };

  const applyPreset = (presetKey: string, type: 'photo' | 'signature' = 'photo', presetSource: 'education' | 'social' = 'education') => {
    let preset, presetData;
    
    if (presetSource === 'social') {
      preset = socialMediaPresets[presetKey as keyof typeof socialMediaPresets];
      if (!preset || !preset[type]) return;
      presetData = preset[type] as any;
    } else {
      preset = educationJobPresets[presetKey as keyof typeof educationJobPresets];
      if (!preset || !preset[type]) return;
      presetData = preset[type] as any;
    }

    setSelectedPreset(presetKey);
    setSelectedPresetType(type);
    setCurrentStep('tools');
    
    // Set format based on preset
    if (presetData.formats && presetData.formats.length > 0) {
      setFormat(presetData.formats[0]);
    }

    // Calculate dimensions based on preset
    let newWidth = 0, newHeight = 0;

    if (presetData.width_cm && presetData.height_cm) {
      newWidth = cmToPixels(presetData.width_cm, dpi);
      newHeight = cmToPixels(presetData.height_cm, dpi);
    } else if (presetData.width_mm && presetData.height_mm) {
      newWidth = mmToPixels(presetData.width_mm, dpi);
      newHeight = mmToPixels(presetData.height_mm, dpi);
    } else if (presetData.width_px && presetData.height_px) {
      newWidth = presetData.width_px;
      newHeight = presetData.height_px;
    } else if (presetData.px && Array.isArray(presetData.px) && presetData.px.length === 2) {
      newWidth = presetData.px[0];
      newHeight = presetData.px[1];
    } else if (presetData.min_px && Array.isArray(presetData.min_px) && presetData.min_px.length === 2) {
      newWidth = presetData.min_px[0];
      newHeight = presetData.min_px[1];
    } else if (presetData.max_px && Array.isArray(presetData.max_px) && presetData.max_px.length === 2) {
      newWidth = presetData.max_px[0];
      newHeight = presetData.max_px[1];
    }

    if (newWidth > 0 && newHeight > 0) {
      setDimensions({ width: newWidth, height: newHeight });
      updateScaleFromSizes(newWidth, newHeight);
    }

    // Adjust quality to meet file size requirements
    if (presetData.max_kb && newWidth > 0 && newHeight > 0) {
      const maxBytes = presetData.max_kb * 1024;
      // Estimate quality needed for target file size
      const estimatedQuality = Math.min(95, Math.max(10, Math.round((maxBytes / (newWidth * newHeight * 0.1)) * 100)));
      setQuality(estimatedQuality);
    }
  };

  const handlePresetCategorySelect = (category: 'education' | 'social' | 'manual' | 'email') => {
    setSelectedPresetCategory(category);
    setCurrentStep('presets');
  };

  const applyEmailKbPreset = (presetId: string) => {
    const preset = emailKbPresets.find((p) => p.id === presetId);
    if (!preset || !originalImage) return;

    const scale = Math.min(1, preset.maxSide / Math.max(originalImage.width, originalImage.height));
    const newWidth = Math.max(1, Math.round(originalImage.width * scale));
    const newHeight = Math.max(1, Math.round(originalImage.height * scale));

    setSelectedPreset(preset.label);
    setSelectedPresetType('photo');
    setSelectedPresetCategory('email');
    setFormat('jpeg');
    setDimensions({ width: newWidth, height: newHeight });
    updateScaleFromSizes(newWidth, newHeight);

    const maxBytes = preset.max_kb * 1024;
    const estimatedQuality = Math.min(
      92,
      Math.max(12, Math.round((maxBytes / Math.max(1, newWidth * newHeight * 0.12)) * 100))
    );
    setQuality(estimatedQuality);
    setCurrentStep('tools');
    toast.success(`Email / KB preset: ${preset.label} — resize photo to ~${preset.max_kb} KB`);
  };

  const handleManualResize = () => {
    setSelectedPresetCategory('manual');
    setSelectedPreset('Manual');
    setSelectedPresetType('photo');
    setCurrentStep('tools');
  };

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setOriginalSize({
          width: img.width,
          height: img.height,
          fileSize: file.size
        });
        setDimensions({
          width: img.width,
          height: img.height
        });
        setResizedImage(null);
        setResizedFileSize(null);
        setScalePercent(0);
        setSelectedPreset(null);
        setSelectedPresetType(null);
        setCurrentStep('preset-type');
        setSelectedPresetCategory(null);
      };
      img.src = URL.createObjectURL(file);
    }
  }, []);

  const handleDimensionChange = (field: 'width' | 'height', value: number) => {
    if (maintainAspectRatio && originalImage) {
      const aspectRatio = originalImage.width / originalImage.height;
      if (field === 'width') {
        const next = {
          width: value,
          height: Math.round(value / aspectRatio)
        };
        setDimensions(next);
        updateScaleFromSizes(next.width, next.height);
      } else {
        const next = {
          width: Math.round(value * aspectRatio),
          height: value
        };
        setDimensions(next);
        updateScaleFromSizes(next.width, next.height);
      }
    } else {
      setDimensions(prev => {
        const next = { ...prev, [field]: value } as { width: number; height: number };
        updateScaleFromSizes(next.width, next.height);
        return next;
      });
    }
  };

  const handleScaleChange = (percent: number) => {
    setScalePercent(percent);
    if (!originalImage) return;
    const scale = 1 + percent / 100;
    const newWidth = Math.max(1, Math.round(originalImage.width * scale));
    const newHeight = Math.max(1, Math.round(originalImage.height * scale));
    setDimensions(prev => ({
      width: newWidth,
      height: maintainAspectRatio ? newHeight : prev.height
    }));
  };

  const resizeImage = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Use image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw resized image
    ctx.drawImage(originalImage, 0, 0, dimensions.width, dimensions.height);

    // Convert to desired format with quality using Blob and correct MIME (supports webp)
    const mimeType = format === 'png' ? 'image/png' : (format === 'webp' ? 'image/webp' : 'image/jpeg');
    const qualityValue = format === 'png' ? 1 : quality / 100;

    canvas.toBlob((blob) => {
      if (blob) {
        if (resizedImage) {
          URL.revokeObjectURL(resizedImage);
        }
        const url = URL.createObjectURL(blob);
        setResizedImage(url);
        setResizedFileSize(blob.size);
        // Removed toast to avoid repeated notifications during auto-resize
      } else {
        toast.error('Failed to generate resized image');
      }
    setIsProcessing(false);
    }, mimeType, qualityValue);
  }, [originalImage, dimensions, format, quality, resizedImage]);

  // Auto-resize with proper debouncing
  useEffect(() => {
    if (!originalImage || dimensions.width <= 0 || dimensions.height <= 0) return;

    const timeoutId = setTimeout(() => {
      resizeImage();
    }, 800); // Increased debounce time to prevent excessive processing
    
    return () => clearTimeout(timeoutId);
  }, [dimensions, format, quality]);

  const downloadImage = () => {
    if (!resizedImage) return;

    const link = document.createElement('a');
    link.download = `resized-image.${format}`;
    link.href = resizedImage;
    link.click();
    // Silent download - no toast needed
  };

  const resetToOriginal = () => {
    if (originalImage) {
      setDimensions({
        width: originalImage.width,
        height: originalImage.height
      });
      setResizedImage(null);
      setResizedFileSize(null);
      setScalePercent(0);
      setSelectedPreset(null);
      setSelectedPresetType(null);
      setCurrentStep('upload');
      setSelectedPresetCategory(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEstimatedFileSize = () => {
    if (!originalImage) return '0 KB';
    
    // More accurate estimation based on format and compression
    const pixelCount = dimensions.width * dimensions.height;
    let bytesPerPixel = 3; // RGB
    
    if (format === 'png') {
      bytesPerPixel = 4; // RGBA, but PNG is lossless so varies
    } else if (format === 'jpeg' || format === 'jpg') {
      bytesPerPixel = (quality / 100) * 0.8; // JPEG compression
    } else if (format === 'webp') {
      bytesPerPixel = (quality / 100) * 0.6; // WebP is more efficient
    }
    
    const estimatedSize = pixelCount * bytesPerPixel;
    return formatFileSize(estimatedSize);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Resizer</CardTitle>
          <CardDescription>
            Manually resize dimensions and file size of images and documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Upload Image */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
                <Upload className="mx-auto h-16 w-16 text-muted-foreground/50 mb-6" />
                <h3 className="text-2xl font-semibold text-muted-foreground mb-3">Step 1: Upload Your Image</h3>
                <p className="text-muted-foreground/75 mb-6 max-w-md mx-auto">
                  Choose an image file to start the resizing process. We support JPG, PNG, WebP and other common formats.
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="px-8"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Choose Image File
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
          )}

          {/* Step 2: Choose Preset Category */}
          {currentStep === 'preset-type' && originalImage && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2">Step 2: Choose Your Purpose</h3>
                <p className="text-muted-foreground">What do you want to resize your image for?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Education/Government */}
                <div className="border rounded-lg p-6 text-center hover:border-primary/50 transition-all cursor-pointer"
                     onClick={() => handlePresetCategorySelect('education')}>
                  <GraduationCap className="mx-auto h-12 w-12 text-primary mb-4" />
                  <h4 className="font-semibold mb-2">Education & Government</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    For exams like GATE, NEET, UPSC, SSC, IBPS, and other government portals
                  </p>
                  <div className="text-xs text-primary font-medium">
                    Photo & Signature presets
                  </div>
                </div>

                {/* Social Media */}
                <div className="border rounded-lg p-6 text-center hover:border-primary/50 transition-all cursor-pointer"
                     onClick={() => handlePresetCategorySelect('social')}>
                  <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
                  <h4 className="font-semibold mb-2">Social Media</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    For Instagram, Facebook, LinkedIn, Twitter, and other social platforms
                  </p>
                  <div className="text-xs text-primary font-medium">
                    Profile, posts, stories, covers
                  </div>
                </div>

                {/* Email / KB */}
                <div className="border rounded-lg p-6 text-center hover:border-primary/50 transition-all cursor-pointer"
                     onClick={() => handlePresetCategorySelect('email')}>
                  <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
                  <h4 className="font-semibold mb-2">Email / Photo KB Resize</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Resize photo to KB — 50KB, 100KB, 150KB, email-friendly sizes
                  </p>
                  <div className="text-xs text-primary font-medium">
                    Email friendly photo resizer
                  </div>
                </div>

                {/* Manual */}
                <div className="border rounded-lg p-6 text-center hover:border-primary/50 transition-all cursor-pointer"
                     onClick={handleManualResize}>
                  <Link className="mx-auto h-12 w-12 text-primary mb-4" />
                  <h4 className="font-semibold mb-2">Manual Resize</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Custom dimensions, DPI settings, and full control over the output
                  </p>
                  <div className="text-xs text-primary font-medium">
                    Complete customization
                  </div>
                </div>
              </div>

              {/* Current Image Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  Your Image
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><span className="font-medium">Size:</span> {formatFileSize(originalSize.fileSize)}</div>
                  <div><span className="font-medium">Dimensions:</span> {originalSize.width} × {originalSize.height}px</div>
                  <div><span className="font-medium">Aspect Ratio:</span> {(originalSize.width / originalSize.height).toFixed(2)}</div>
                  <div><span className="font-medium">Format:</span> {originalImage?.src.split('.').pop()?.toUpperCase()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Choose Specific Presets */}
          {currentStep === 'presets' && originalImage && selectedPresetCategory && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2">Step 3: Choose Your Preset</h3>
                <p className="text-muted-foreground">
                  Select the specific{' '}
                  {selectedPresetCategory === 'education'
                    ? 'exam/portal'
                    : selectedPresetCategory === 'email'
                      ? 'email / KB size'
                      : 'social media'}{' '}
                  preset that matches your needs
                </p>
              </div>

              {/* Email / KB presets */}
              {selectedPresetCategory === 'email' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
                    Photo KB resize for email attachments and forms — we scale long edge and tune JPEG quality toward your KB target.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {emailKbPresets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="border rounded-lg p-4 text-left hover:border-primary/50 transition-all"
                        onClick={() => applyEmailKbPreset(p.id)}
                      >
                        <div className="font-semibold">{p.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{p.note}</div>
                        <div className="text-xs text-primary mt-2">Max side ~{p.maxSide}px</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Presets */}
              {selectedPresetCategory === 'education' && (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Education & Government Portal Presets
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.keys(educationJobPresets).map((presetKey) => {
                      const preset = educationJobPresets[presetKey as keyof typeof educationJobPresets];
                      const hasPhoto = preset.photo && Object.keys(preset.photo).length > 1;
                      const hasSignature = preset.signature && Object.keys(preset.signature).length > 1;
                      
                      return (
                        <div key={presetKey} className="border rounded-lg p-4 space-y-3">
                          <div className="font-medium flex items-center">
                            <GraduationCap className="mr-2 h-4 w-4" />
                            {presetKey}
                          </div>
                           <div className="flex flex-wrap gap-2">
                             {hasPhoto && (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => applyPreset(presetKey, 'photo', 'education')}
                                 className="text-sm h-9 px-3 sm:px-4 flex-shrink-0"
                               >
                                 📷 Photo
                               </Button>
                             )}
                             {hasSignature && (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => applyPreset(presetKey, 'signature', 'education')}
                                 className="text-sm h-9 px-3 sm:px-4 flex-shrink-0"
                               >
                                 ✍️ Signature
                               </Button>
                             )}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Social Media Presets */}
              {selectedPresetCategory === 'social' && (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Social Media Presets
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.keys(socialMediaPresets).map((presetKey) => {
                      const preset = socialMediaPresets[presetKey as keyof typeof socialMediaPresets];
                      
                      return (
                        <div key={presetKey} className="border rounded-lg p-4 space-y-3">
                          <div className="font-medium flex items-center">
                            <Briefcase className="mr-2 h-4 w-4" />
                            {presetKey}
                          </div>
                           <div className="flex flex-wrap gap-2">
                             {Object.keys(preset).map((subType) => {
                               const displayName = subType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                               const icon = subType.includes('profile') ? '👤' : 
                                           subType.includes('cover') || subType.includes('header') ? '🖼️' :
                                           subType.includes('story') || subType.includes('reel') ? '📱' :
                                           subType.includes('post') ? '📝' :
                                           subType.includes('feed') ? '📸' :
                                           subType.includes('link') || subType.includes('card') ? '🔗' :
                                           subType.includes('geofilter') ? '📍' : '📷';
                               
                               return (
                                 <Button
                                   key={subType}
                                   variant="outline"
                                   size="sm"
                                   onClick={() => applyPreset(presetKey, subType as any, 'social')}
                                   className="text-sm h-9 px-2 sm:px-4 flex-shrink-0"
                                 >
                                   <span className="hidden sm:inline">{icon} </span>
                                   <span className="truncate">{displayName}</span>
                                 </Button>
                               );
                             })}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Tools and Preview */}
          {currentStep === 'tools' && originalImage && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2">Step 4: Fine-tune & Download</h3>
                <p className="text-muted-foreground">
                  Adjust settings if needed and download your resized image
                </p>
              </div>

              {/* Comparison Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image Info */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Original Image
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Size:</span> {formatFileSize(originalSize.fileSize)}</div>
                    <div><span className="font-medium">Dimensions:</span> {originalSize.width} × {originalSize.height}px</div>
                    <div><span className="font-medium">Aspect Ratio:</span> {(originalSize.width / originalSize.height).toFixed(2)}</div>
                    <div><span className="font-medium">Format:</span> {originalImage?.src.split('.').pop()?.toUpperCase()}</div>
                  </div>
                </div>

                {/* Output Image Info */}
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Output Image
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Size:</span> {resizedFileSize != null ? formatFileSize(resizedFileSize) : getEstimatedFileSize()}</div>
                    <div><span className="font-medium">Dimensions:</span> {dimensions.width} × {dimensions.height}px</div>
                    <div><span className="font-medium">Aspect Ratio:</span> {(dimensions.width / dimensions.height).toFixed(2)}</div>
                    <div><span className="font-medium">Format:</span> {format.toUpperCase()}</div>
                  </div>
                  {selectedPreset && selectedPresetType && (
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                      <span className="font-medium">Preset:</span> {selectedPreset} - {selectedPresetType === 'photo' ? '📷 Photo' : selectedPresetType === 'signature' ? '✍️ Signature' : (selectedPresetType as string).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Controls (only for manual or for fine-tuning) */}
              {selectedPresetCategory === 'manual' && (
                <div className="space-y-6">
                  <h4 className="font-semibold">Manual Controls</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="dpi">DPI: {dpi}</Label>
                        <Slider
                          id="dpi"
                          min={72}
                          max={600}
                          step={1}
                          value={[dpi]}
                          onValueChange={(value) => setDpi(value[0])}
                          className="mt-2"
                          aria-label="DPI (dots per inch) setting"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="width">Width (px)</Label>
                          <Input
                            id="width"
                            type="number"
                            value={dimensions.width}
                            onChange={(e) => handleDimensionChange('width', parseInt(e.target.value) || 0)}
                            min={1}
                            max={5000}
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">Height (px)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={dimensions.height}
                            onChange={(e) => handleDimensionChange('height', parseInt(e.target.value) || 0)}
                            min={1}
                            max={5000}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="aspectRatio"
                          checked={maintainAspectRatio}
                          onCheckedChange={(checked) => setMaintainAspectRatio(checked === true)}
                        />
                        <Label htmlFor="aspectRatio" className="flex items-center">
                          <Link className="mr-1 h-3 w-3" />
                          Maintain aspect ratio
                        </Label>
                      </div>

                      <div>
                        <Label htmlFor="scale">Scale: {scalePercent}%</Label>
                        <Slider
                          id="scale"
                          min={-90}
                          max={200}
                          step={1}
                          value={[scalePercent]}
                          onValueChange={(value) => handleScaleChange(value[0])}
                          className="mt-2"
                          aria-label="Image scale percentage"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="format">Output Format</Label>
                        <Select value={format} onValueChange={setFormat}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="webp">WebP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {format !== 'png' && (
                        <div>
                          <Label htmlFor="quality">Quality: {quality}%</Label>
                          <Slider
                            id="quality"
                            min={10}
                            max={100}
                            step={1}
                            value={[quality]}
                            onValueChange={(value) => setQuality(value[0])}
                            className="mt-2"
                            aria-label="Image quality percentage"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="space-y-4">
                <h4 className="font-semibold">Preview</h4>
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-64 border border-border rounded-lg"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setCurrentStep('preset-type')} variant="outline" className="w-full sm:w-auto">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Back to Presets
                </Button>
                <Button onClick={resetToOriginal} variant="outline" className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
                {resizedImage && (
                  <Button onClick={downloadImage} disabled={isProcessing} size="lg" className="w-full sm:w-auto">
                    <Download className="mr-2 h-5 w-5" />
                    {isProcessing ? 'Processing...' : 'Download Image'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageResizer;
