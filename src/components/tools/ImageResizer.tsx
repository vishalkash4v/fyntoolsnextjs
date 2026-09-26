'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Crop, Download, Image as ImageIcon, RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
  SlidersHorizontal, Sparkles, Upload, Check, Maximize2, Move, Wand2
} from 'lucide-react';
import { toast } from 'sonner';

type FitMode = 'fit' | 'fill' | 'stretch';
type PresetKind = 'photo' | 'signature';

type Preset = {
  id: string;
  platform: string;
  label: string;
  kind?: PresetKind;
  width?: number;
  height?: number;
  ratio?: number;
  maxKB?: number;
  minKB?: number;
  format?: 'jpeg' | 'png' | 'webp';
  note: string;
  verified?: boolean;
};

const socialPresets: Preset[] = [
  { id:'instagram-square', platform:'Instagram', label:'Post — Square', width:1080, height:1080, ratio:1, note:'1:1 feed image' },
  { id:'instagram-portrait', platform:'Instagram', label:'Post — Portrait', width:1080, height:1350, ratio:4/5, note:'4:5 feed image' },
  { id:'instagram-landscape', platform:'Instagram', label:'Post — Landscape', width:1080, height:566, ratio:1.91, note:'Wide feed image' },
  { id:'instagram-story', platform:'Instagram', label:'Story / Reel', width:1080, height:1920, ratio:9/16, note:'Full-screen vertical' },
  { id:'instagram-profile', platform:'Instagram', label:'Profile Photo', width:1080, height:1080, ratio:1, note:'Square source; platform displays it circularly' },
  { id:'facebook-post', platform:'Facebook', label:'Post — Square', width:1080, height:1080, ratio:1, note:'General square post' },
  { id:'facebook-portrait', platform:'Facebook', label:'Post — Portrait', width:1080, height:1350, ratio:4/5, note:'Tall feed image' },
  { id:'facebook-link', platform:'Facebook', label:'Link Preview', width:1200, height:630, ratio:1.91, note:'Open Graph / shared-link style' },
  { id:'facebook-story', platform:'Facebook', label:'Story', width:1080, height:1920, ratio:9/16, note:'Full-screen vertical' },
  { id:'x-profile', platform:'X', label:'Profile Photo', width:400, height:400, ratio:1, note:'X official recommended profile dimensions', verified:true },
  { id:'x-header', platform:'X', label:'Header / Banner', width:1500, height:500, ratio:3, note:'X official recommended header dimensions', verified:true },
  { id:'x-post', platform:'X', label:'Post Image', width:1600, height:900, ratio:16/9, note:'16:9 working preset' },
  { id:'linkedin-profile', platform:'LinkedIn', label:'Profile Photo', width:400, height:400, ratio:1, note:'LinkedIn recommended profile dimensions', verified:true },
  { id:'linkedin-cover', platform:'LinkedIn', label:'Personal Cover', width:1584, height:396, ratio:4, note:'LinkedIn official recommended cover dimensions', verified:true },
  { id:'linkedin-post', platform:'LinkedIn', label:'Post — Landscape', width:1200, height:627, ratio:1.91, note:'LinkedIn shared image / link-preview style', verified:true },
  { id:'linkedin-square', platform:'LinkedIn', label:'Post — Square', width:1080, height:1080, ratio:1, note:'Square creator preset' },
  { id:'youtube-thumbnail', platform:'YouTube', label:'Video Thumbnail', width:3840, height:2160, ratio:16/9, note:'Current YouTube Help recommends 3840×2160 for custom video thumbnails; 16:9.', verified:true },
  { id:'youtube-banner', platform:'YouTube', label:'Channel Banner', width:2560, height:1440, ratio:16/9, note:'YouTube recommended banner size; keep important text in the safe area', verified:true },
  { id:'youtube-profile', platform:'YouTube', label:'Channel Profile', width:800, height:800, ratio:1, note:'Square/round profile source' },
  { id:'pinterest-pin', platform:'Pinterest', label:'Standard Pin', width:1000, height:1500, ratio:2/3, note:'Pinterest recommends 2:3 / 1000×1500 for standard image ads', verified:true },
  { id:'tiktok-video', platform:'TikTok', label:'Vertical Creative', width:1080, height:1920, ratio:9/16, note:'Full-screen vertical creator preset' },
  { id:'whatsapp-dp', platform:'WhatsApp', label:'Profile Photo', width:1080, height:1080, ratio:1, note:'Square profile source; displayed circularly' },
  { id:'whatsapp-status', platform:'WhatsApp', label:'Status', width:1080, height:1920, ratio:9/16, note:'Full-screen status preset' },
];

const examPresets: Preset[] = [
  { id:'hppsc-photo', platform:'HPPSC', label:'Photo', kind:'photo', width:110, height:140, ratio:110/140, maxKB:40, format:'jpeg', note:'Official FAQ: 110×140 px (width×height), JPG, ≤40 KB.', verified:true },
  { id:'hppsc-signature', platform:'HPPSC', label:'Signature', kind:'signature', width:140, height:110, ratio:140/110, maxKB:40, format:'jpeg', note:'Official FAQ: 140×110 px (width×height), JPG, ≤40 KB.', verified:true },
  { id:'upsc-photo', platform:'UPSC', label:'Photo — 20–300 KB', kind:'photo', ratio:3/4, minKB:20, maxKB:300, format:'jpeg', note:'Current UPSC notices specify JPG and 20–300 KB; exact image dimensions can depend on the application module. Verify the active notice.', verified:true },
  { id:'upsc-signature', platform:'UPSC', label:'Signature — 20–300 KB', kind:'signature', ratio:3, minKB:20, maxKB:300, format:'jpeg', note:'Current UPSC notices specify JPG and 20–300 KB; verify the active application module before submission.', verified:true },
  { id:'ssc-signature', platform:'SSC', label:'Signature — 10–20 KB', kind:'signature', width:900, height:300, ratio:3, minKB:10, maxKB:20, format:'jpeg', note:'SSC 2026 notice: JPEG/JPG, 10–20 KB, about 6.0×2.0 cm. Pixel dimensions are a practical 300 DPI working canvas; verify the live form.', verified:true },
  { id:'ssc-photo', platform:'SSC', label:'Live Photo / Application', kind:'photo', ratio:3/4, note:'SSC 2026 application uses live photo capture for relevant notices; use this preset for pre-crop only and follow the live form instructions.', verified:true },
  { id:'gate-photo', platform:'GATE', label:'Passport Photo', kind:'photo', width:300, height:400, ratio:3/4, maxKB:600, format:'jpeg', note:'Common working canvas only; GATE requirements can vary by year. Verify the current brochure.' },
  { id:'neet-photo', platform:'NEET / NTA', label:'Passport Photo', kind:'photo', width:300, height:400, ratio:3/4, note:'Use as a working crop; current NTA instructions should be checked for the exact session.' },
  { id:'jee-photo', platform:'JEE Main / NTA', label:'Passport Photo', kind:'photo', width:300, height:400, ratio:3/4, note:'Use as a working crop; current NTA instructions should be checked for the exact session.' },
  { id:'ibps-photo', platform:'IBPS / Banking', label:'Photo', kind:'photo', width:350, height:450, ratio:7/9, note:'Common banking-exam working preset; requirements vary by notification.' },
  { id:'ibps-signature', platform:'IBPS / Banking', label:'Signature', kind:'signature', width:350, height:150, ratio:7/3, note:'Common working preset; verify the active IBPS notification.' },
  { id:'rrb-photo', platform:'RRB / Railway', label:'Photo', kind:'photo', width:300, height:400, ratio:3/4, note:'Common working preset; verify the active RRB notification.' },
  { id:'passport-india', platform:'Passport India', label:'Passport Photo', kind:'photo', width:413, height:531, ratio:45/35, note:'45×35 mm proportional working canvas at ~300 DPI; follow the current Passport Seva guidance.' },
  { id:'driving-license', platform:'Driving Licence / RTO', label:'Photo', kind:'photo', width:300, height:420, ratio:5/7, note:'RTO requirements vary by state and service; verify the application portal.' },
];

const utilityPresets: Preset[] = [
  { id:'email-50', platform:'Email & Forms', label:'50 KB', width:720, height:720, maxKB:50, format:'jpeg', note:'Target upper file-size limit; final bytes vary by image.' },
  { id:'email-100', platform:'Email & Forms', label:'100 KB', width:1024, height:1024, maxKB:100, format:'jpeg', note:'Common small-upload target; final bytes vary.' },
  { id:'email-150', platform:'Email & Forms', label:'150 KB', width:1280, height:1280, maxKB:150, format:'jpeg', note:'Common form/photo target; final bytes vary.' },
  { id:'email-200', platform:'Email & Forms', label:'200 KB', width:1400, height:1400, maxKB:200, format:'jpeg', note:'Useful for portals with a 200 KB ceiling.' },
  { id:'web-1200', platform:'Web', label:'Web Hero 1200 px', width:1200, height:800, ratio:3/2, note:'Flexible web image working size' },
  { id:'og-image', platform:'Web / SEO', label:'Open Graph 1200×630', width:1200, height:630, ratio:1.91, note:'Common social link preview canvas' },
  { id:'favicon', platform:'Web', label:'Favicon 512×512', width:512, height:512, ratio:1, note:'High-resolution square source for favicon generation' },
];

const allPresets = [...socialPresets, ...examPresets, ...utilityPresets];

const clamp = (n:number, min:number, max:number) => Math.min(max, Math.max(min, n));
const formatBytes = (bytes:number) => {
  if (!bytes) return '0 B';
  const units = ['B','KB','MB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
};

function centeredCrop(width:number, height:number, aspect:number, zoom:number) {
  const sourceAspect = width / height;
  let w = 1;
  let h = 1;
  if (sourceAspect > aspect) w = (height * aspect) / width;
  else h = (width / aspect) / height;
  w = clamp(w * zoom, 0.05, 1);
  h = clamp(h * zoom, 0.05, 1);
  return { x:(1-w)/2, y:(1-h)/2, w, h };
}

const ImageResizer = () => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalSize, setOriginalSize] = useState({ width:0, height:0, bytes:0, type:'' });
  const [target, setTarget] = useState({ width:1080, height:1080 });
  const [fitMode, setFitMode] = useState<FitMode>('fill');
  const [crop, setCrop] = useState({ x:.1, y:.1, w:.8, h:.8 });
  const [cropAspect, setCropAspect] = useState<number | null>(1);
  const [lockAspect, setLockAspect] = useState(true);
  const [cropZoom, setCropZoom] = useState(1);
  const [quality, setQuality] = useState(88);
  const [format, setFormat] = useState<'jpeg'|'png'|'webp'>('jpeg');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [background, setBackground] = useState('#ffffff');
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [outputBytes, setOutputBytes] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [presetSearch, setPresetSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<'social'|'exam'|'utility'|'manual'>('social');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [showCrop, setShowCrop] = useState(true);
  const [drag, setDrag] = useState<{startX:number;startY:number;crop:{x:number;y:number;w:number;h:number}} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
  }, [sourceUrl, resizedUrl]);

  const updateCropForTarget = useCallback((width:number, height:number, zoom=1) => {
    if (!image || width <= 0 || height <= 0) return;
    const aspect = width / height;
    setCropAspect(aspect);
    setCrop(centeredCrop(image.width, image.height, aspect, zoom));
    setCropZoom(zoom);
  }, [image]);

  const loadFile = useCallback((file:File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a JPG, PNG, WebP or other supported image file.');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      setSourceUrl(url);
      setImage(img);
      setOriginalSize({ width:img.width, height:img.height, bytes:file.size, type:file.type });
      setTarget({ width:img.width, height:img.height });
      setCropAspect(img.width / img.height);
      setCrop({ x:0, y:0, w:1, h:1 });
      setCropZoom(1);
      setFitMode('fill');
      setResizedUrl(null);
      setOutputBytes(null);
      setSelectedPreset(null);
      setBrightness(0); setContrast(0); setSaturation(0); setSharpness(0); setGrayscale(0);
      setRotation(0); setFlipX(false); setFlipY(false);
      toast.success('Image loaded — choose a preset or crop manually.');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error('Could not read this image.');
    };
    img.src = url;
  }, [sourceUrl]);

  const handleFile = (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  const applyPreset = (preset:Preset) => {
    setSelectedPreset(preset);
    if (preset.width && preset.height) {
      setTarget({ width:preset.width, height:preset.height });
      updateCropForTarget(preset.width, preset.height);
    } else if (preset.ratio && image) {
      const width = Math.min(1600, image.width);
      const height = Math.max(1, Math.round(width / preset.ratio));
      setTarget({ width, height });
      updateCropForTarget(width, height);
    }
    if (preset.format) setFormat(preset.format);
    if (preset.maxKB) setQuality(clamp(Math.round(84 - Math.max(0, preset.maxKB - 100) / 40), 35, 88));
    setFitMode('fill');
    setShowCrop(true);
    toast.success(`${preset.platform} — ${preset.label} preset applied`);
  };

  const rotateRight = () => {
    setRotation(r => (r + 90) % 360);
    setTarget(t => ({ width:t.height, height:t.width }));
    if (image && cropAspect) setCropAspect(1 / cropAspect);
  };

  const chooseCropRatio = (ratio:number | null) => {
    setCropAspect(ratio);
    setLockAspect(Boolean(ratio));
    if (image && ratio) setCrop(centeredCrop(image.width, image.height, ratio, cropZoom));
  };

  const resetCrop = () => {
    if (!image) return;
    const aspect = cropAspect || image.width / image.height;
    setCrop(centeredCrop(image.width, image.height, aspect, cropZoom));
  };

  const setZoom = (zoom:number) => {
    setCropZoom(zoom);
    if (image && cropAspect) setCrop(centeredCrop(image.width, image.height, cropAspect, zoom));
  };

  const onCropPointerDown = (e:React.PointerEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const px = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const py = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const inside = px >= crop.x && px <= crop.x + crop.w && py >= crop.y && py <= crop.y + crop.h;
    if (!inside) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ startX:px, startY:py, crop:{...crop} });
  };

  const onCropPointerMove = (e:React.PointerEvent<HTMLDivElement>) => {
    if (!drag || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const dx = (e.clientX - rect.left) / rect.width - drag.startX;
    const dy = (e.clientY - rect.top) / rect.height - drag.startY;
    setCrop({
      ...drag.crop,
      x:clamp(drag.crop.x + dx, 0, 1 - drag.crop.w),
      y:clamp(drag.crop.y + dy, 0, 1 - drag.crop.h),
    });
  };

  const stopDrag = () => setDrag(null);

  const drawOutput = useCallback(() => {
    if (!image || !canvasRef.current) return;
    setProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: sharpness > 0 });
    if (!ctx) { setProcessing(false); return; }

    const outW = clamp(Math.round(target.width), 1, 8000);
    const outH = clamp(Math.round(target.height), 1, 8000);
    canvas.width = outW;
    canvas.height = outH;

    const radians = (rotation * Math.PI) / 180;
    const sourceW = image.width;
    const sourceH = image.height;
    let sx = 0, sy = 0, sw = sourceW, sh = sourceH;

    if (fitMode === 'fill' && crop) {
      sx = Math.round(crop.x * sourceW);
      sy = Math.round(crop.y * sourceH);
      sw = Math.max(1, Math.round(crop.w * sourceW));
      sh = Math.max(1, Math.round(crop.h * sourceH));
    }

    ctx.save();
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, outW, outH);
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate(radians);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

    const filterParts = [
      `brightness(${100 + brightness}%)`,
      `contrast(${100 + contrast}%)`,
      `saturate(${100 + saturation}%)`,
      `grayscale(${grayscale}%)`,
    ];
    ctx.filter = filterParts.join(' ');

    if (fitMode === 'stretch') {
      ctx.drawImage(image, 0, 0, sourceW, sourceH, -outW/2, -outH/2, outW, outH);
    } else if (fitMode === 'fit') {
      const scale = Math.min(outW / sw, outH / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      ctx.drawImage(image, sx, sy, sw, sh, -dw/2, -dh/2, dw, dh);
    } else {
      ctx.drawImage(image, sx, sy, sw, sh, -outW/2, -outH/2, outW, outH);
    }
    ctx.restore();

    if (sharpness > 0) {
      const strength = Math.min(0.75, sharpness / 100);
      const frame = ctx.getImageData(0, 0, outW, outH);
      const src = frame.data;
      const copy = new Uint8ClampedArray(src);
      for (let y=1; y<outH-1; y++) {
        for (let x=1; x<outW-1; x++) {
          const i=(y*outW+x)*4;
          for (let c=0;c<3;c++) {
            const center=copy[i+c] * (1 + 4*strength);
            const neighbours =
              copy[((y-1)*outW+x)*4+c] +
              copy[((y+1)*outW+x)*4+c] +
              copy[(y*outW+x-1)*4+c] +
              copy[(y*outW+x+1)*4+c];
            src[i+c]=clamp(Math.round(center - strength*neighbours),0,255);
          }
        }
      }
      ctx.putImageData(frame,0,0);
    }

    const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const q = format === 'png' ? undefined : quality / 100;
    canvas.toBlob((blob) => {
      if (!blob) {
        setProcessing(false);
        toast.error('Could not create the output image.');
        return;
      }
      if (resizedUrl) URL.revokeObjectURL(resizedUrl);
      const url=URL.createObjectURL(blob);
      setResizedUrl(url);
      setOutputBytes(blob.size);
      setProcessing(false);
    }, mime, q);
  }, [image, target, fitMode, crop, rotation, flipX, flipY, brightness, contrast, saturation, sharpness, grayscale, background, format, quality, resizedUrl]);

  useEffect(() => {
    if (!image) return;
    const id=window.setTimeout(drawOutput, 250);
    return () => window.clearTimeout(id);
  }, [drawOutput, image]);

  const download = () => {
    if (!resizedUrl) return;
    const a=document.createElement('a');
    a.href=resizedUrl;
    const ext=format === 'jpeg' ? 'jpg' : format;
    const suffix=selectedPreset ? `-${selectedPreset.platform.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${selectedPreset.label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}` : '';
    a.download=`fyntools-resized-image${suffix}.${ext}`;
    a.click();
  };

  const resetAll = () => {
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null); setImage(null); setResizedUrl(null); setOutputBytes(null);
    setOriginalSize({width:0,height:0,bytes:0,type:''});
    setSelectedPreset(null); setPresetSearch(''); setRotation(0); setFlipX(false); setFlipY(false);
    setBrightness(0); setContrast(0); setSaturation(0); setSharpness(0); setGrayscale(0);
    setCrop({x:0,y:0,w:1,h:1}); setCropZoom(1); setFitMode('fill');
  };

  const filtered = useMemo(() => {
    const source = activeGroup === 'social' ? socialPresets : activeGroup === 'exam' ? examPresets : utilityPresets;
    const q=presetSearch.trim().toLowerCase();
    return source.filter(p => !q || `${p.platform} ${p.label} ${p.note}`.toLowerCase().includes(q));
  }, [activeGroup,presetSearch]);

  const setTargetDimension = (field:'width'|'height', value:number) => {
    const safe=clamp(Math.round(value || 1),1,8000);
    setTarget(prev => {
      if (fitMode !== 'stretch' && lockAspect && cropAspect) {
        return field === 'width'
          ? {width:safe,height:Math.max(1,Math.round(safe/cropAspect))}
          : {width:Math.max(1,Math.round(safe*cropAspect)),height:safe};
      }
      return {...prev,[field]:safe};
    });
  };

  return (
    <div className="w-full">
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Image Resizer & Smart Cropper
          </CardTitle>
          <CardDescription>
            Resize, crop, fit, stretch, rotate and enhance images for exams, forms, websites and social platforms.
            Everything is processed locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

          {!image ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.03] px-5 py-12 text-center transition hover:border-primary/60 hover:bg-primary/[0.06]"
            >
              <Upload className="mx-auto mb-3 h-10 w-10 text-primary" />
              <div className="text-lg font-semibold">Upload an image</div>
              <div className="mt-1 text-sm text-muted-foreground">JPG, PNG, WebP and other browser-supported formats</div>
              <div className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Choose Image</div>
            </button>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/50 p-3"><div className="text-xs text-muted-foreground">Original</div><div className="font-semibold">{originalSize.width} × {originalSize.height}px</div><div className="text-xs text-muted-foreground">{formatBytes(originalSize.bytes)}</div></div>
                <div className="rounded-xl bg-muted/50 p-3"><div className="text-xs text-muted-foreground">Output</div><div className="font-semibold">{target.width} × {target.height}px</div><div className="text-xs text-muted-foreground">{outputBytes ? formatBytes(outputBytes) : 'Processing preview…'}</div></div>
                <div className="rounded-xl bg-muted/50 p-3"><div className="text-xs text-muted-foreground">Preset</div><div className="font-semibold truncate">{selectedPreset ? `${selectedPreset.platform} · ${selectedPreset.label}` : 'Manual'}</div><div className="text-xs text-muted-foreground">{fitMode === 'fill' ? 'Fill + crop' : fitMode === 'fit' ? 'Fit' : 'Stretch'}</div></div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-2xl border bg-muted/30 p-2">
                    <div className="relative mx-auto max-w-full overflow-hidden rounded-xl bg-black/5">
                    <div
                      ref={previewRef}
                      className="relative max-h-[520px] max-w-full overflow-hidden rounded-xl bg-black/5"
                      onPointerMove={onCropPointerMove}
                      onPointerUp={stopDrag}
                      onPointerCancel={stopDrag}
                    >
                      <img src={sourceUrl || ''} alt="Image resize preview" className="block max-h-[500px] max-w-full select-none object-contain" draggable={false} />
                      {showCrop && fitMode === 'fill' && (
                        <div
                          className="absolute inset-0 cursor-move"
                          onPointerDown={onCropPointerDown}
                          aria-label="Drag crop area to choose which part of the image to keep"
                        >
                          <div className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,.45)]" style={{left:`${crop.x*100}%`,top:`${crop.y*100}%`,width:`${crop.w*100}%`,height:`${crop.h*100}%`}}>
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-60"><i className="border-r border-white/60" /><i className="border-r border-white/60" /><i /><i className="border-r border-t border-white/60" /><i className="border-r border-t border-white/60" /><i className="border-t border-white/60" /><i className="border-r border-t border-white/60" /><i className="border-r border-t border-white/60" /><i className="border-t border-white/60" /></div>
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white">Drag to choose area</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant={fitMode === 'fill' ? 'default' : 'outline'} onClick={() => {setFitMode('fill'); updateCropForTarget(target.width,target.height,cropZoom);}}><Crop className="mr-1 h-4 w-4" /> Fill / Crop</Button>
                    <Button size="sm" variant={fitMode === 'fit' ? 'default' : 'outline'} onClick={() => setFitMode('fit')}><Maximize2 className="mr-1 h-4 w-4" /> Fit</Button>
                    <Button size="sm" variant={fitMode === 'stretch' ? 'default' : 'outline'} onClick={() => setFitMode('stretch')}>Stretch</Button>
                    <Button size="sm" variant="outline" onClick={resetCrop}><RotateCcw className="mr-1 h-4 w-4" /> Reset crop</Button>
                    <Button size="sm" variant={lockAspect ? 'outline' : 'default'} onClick={() => setLockAspect(v=>!v)}>
                      {lockAspect ? 'Lock ratio' : 'Free ratio'}
                    </Button>
                    <Button size="sm" variant={showCrop ? 'outline' : 'default'} onClick={() => setShowCrop(v=>!v)}><Move className="mr-1 h-4 w-4" /> {showCrop ? 'Hide crop' : 'Show crop'}</Button>
                  </div>

                  {fitMode === 'fill' && (
                    <div className="rounded-xl border p-3">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {[['1:1',1],['4:5',4/5],['3:4',3/4],['16:9',16/9],['9:16',9/16]].map(([label,ratio]) => (
                          <Button key={String(label)} size="sm" variant={cropAspect === Number(ratio) ? 'default' : 'outline'} onClick={() => chooseCropRatio(Number(ratio))}>{String(label)}</Button>
                        ))}
                        <Button size="sm" variant={cropAspect === null ? 'default' : 'outline'} onClick={() => chooseCropRatio(null)}>Free</Button>
                      </div>
                      <div className="flex items-center justify-between text-sm"><Label>Crop zoom</Label><span className="text-muted-foreground">{Math.round(cropZoom*100)}%</span></div>
                      <Slider min={0.35} max={1} step={0.01} value={[cropZoom]} onValueChange={v=>setZoom(v[0])} className="mt-3" aria-label="Crop zoom" />
                      <p className="mt-2 text-xs text-muted-foreground">Drag the crop box over the preview to choose exactly which part stays visible.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <section className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold"><Maximize2 className="h-4 w-4" /> Output size</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label htmlFor="out-w">Width (px)</Label><Input id="out-w" type="number" min={1} max={8000} value={target.width} onChange={e=>setTargetDimension('width',Number(e.target.value))} /></div>
                      <div><Label htmlFor="out-h">Height (px)</Label><Input id="out-h" type="number" min={1} max={8000} value={target.height} onChange={e=>setTargetDimension('height',Number(e.target.value))} /></div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">Aspect ratio: {(target.width/target.height).toFixed(2)}:1</div>
                  </section>

                  <section className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold"><SlidersHorizontal className="h-4 w-4" /> Adjustments</div>
                    {[
                      ['Brightness',brightness,setBrightness,-100,100],
                      ['Contrast',contrast,setContrast,-100,100],
                      ['Saturation',saturation,setSaturation,-100,100],
                      ['Sharpness',sharpness,setSharpness,0,100],
                      ['Grayscale',grayscale,setGrayscale,0,100],
                    ].map(([label,value,setter,min,max]) => (
                      <div key={String(label)} className="mb-3">
                        <div className="flex justify-between text-xs"><span>{String(label)}</span><span className="text-muted-foreground">{Number(value)}</span></div>
                        <Slider min={Number(min)} max={Number(max)} step={1} value={[Number(value)]} onValueChange={v=>(setter as React.Dispatch<React.SetStateAction<number>>)(v[0])} className="mt-1" aria-label={String(label)} />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" onClick={rotateRight}><RotateCw className="mr-1 h-4 w-4" /> Rotate</Button>
                      <Button size="sm" variant="outline" onClick={()=>setFlipX(v=>!v)}><FlipHorizontal className="mr-1 h-4 w-4" /> Flip H</Button>
                      <Button size="sm" variant="outline" onClick={()=>setFlipY(v=>!v)}><FlipVertical className="mr-1 h-4 w-4" /> Flip V</Button>
                      <Button size="sm" variant="outline" onClick={()=>{setBrightness(0);setContrast(0);setSaturation(0);setSharpness(0);setGrayscale(0);setRotation(0);setFlipX(false);setFlipY(false);}}>Reset edits</Button>
                    </div>
                  </section>

                  <section className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold"><Wand2 className="h-4 w-4" /> Export</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Format</Label><select value={format} onChange={e=>setFormat(e.target.value as 'jpeg'|'png'|'webp')} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="jpeg">JPEG</option><option value="png">PNG</option><option value="webp">WebP</option></select></div>
                      <div><Label>Quality {quality}%</Label><Slider min={20} max={100} step={1} value={[quality]} onValueChange={v=>setQuality(v[0])} className="mt-4" disabled={format==='png'} aria-label="JPEG or WebP quality" /></div>
                    </div>
                    <div className="mt-3"><Label>Background for Fit</Label><div className="mt-1 flex gap-2"><Input type="color" value={background} onChange={e=>setBackground(e.target.value)} className="h-10 w-16 p-1" /><Input value={background} onChange={e=>setBackground(e.target.value)} /></div></div>
                  </section>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={download} disabled={!resizedUrl || processing} size="lg"><Download className="mr-2 h-5 w-5" />{processing ? 'Processing…' : 'Download Image'}</Button>
                <Button variant="outline" onClick={() => inputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Choose another</Button>
                <Button variant="ghost" onClick={resetAll}>Start over</Button>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
                <strong className="text-foreground">Privacy:</strong> the image is processed in your browser with Canvas. The tool does not upload your image to an FYN Tools server.
              </div>
            </>
          )}

          {image && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Quick presets</h3>
                  <p className="text-sm text-muted-foreground">Choose a platform, exam or file-size target, then fine-tune the crop manually.</p>
                </div>
                <div className="relative w-full sm:w-72"><Input value={presetSearch} onChange={e=>setPresetSearch(e.target.value)} placeholder="Search presets… e.g. HPPSC, UPSC, Instagram" aria-label="Search image resize presets" /></div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button variant={activeGroup==='social'?'default':'outline'} onClick={()=>setActiveGroup('social')}>Social & Creator</Button>
                <Button variant={activeGroup==='exam'?'default':'outline'} onClick={()=>setActiveGroup('exam')}>Exams & Forms</Button>
                <Button variant={activeGroup==='utility'?'default':'outline'} onClick={()=>setActiveGroup('utility')}>KB & Web</Button>
                <Button variant={activeGroup==='manual'?'default':'outline'} onClick={()=>{setActiveGroup('manual');setSelectedPreset(null);}}>Manual</Button>
              </div>

              {activeGroup === 'manual' ? (
                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 text-primary" /><div><div className="font-semibold">Manual mode is ready</div><p className="mt-1 text-sm text-muted-foreground">Set any width and height up to 8000 px, choose Fit, Fill/Crop or Stretch, then adjust the image before downloading.</p></div></div>
                </div>
              ) : (
                <div className="grid max-h-[460px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map(p => (
                    <button key={p.id} type="button" onClick={()=>applyPreset(p)} className={`rounded-xl border p-3 text-left transition hover:border-primary/60 hover:bg-primary/[0.03] ${selectedPreset?.id===p.id?'border-primary bg-primary/[0.05]':''}`}>
                      <div className="flex items-start justify-between gap-2"><div className="font-medium">{p.platform}</div>{p.verified && <span title="Checked against an official source" className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"><Check className="h-3 w-3" /> Official</span>}</div>
                      <div className="mt-1 text-sm">{p.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{p.width && p.height ? `${p.width}×${p.height}px` : p.maxKB ? `${p.minKB || ''}${p.minKB ? '–' : '≤'}${p.maxKB} KB` : p.ratio ? `Ratio ${p.ratio.toFixed(2)}:1` : 'Flexible'}</div>
                      <div className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{p.note}</div>
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-xl border bg-background p-4 text-xs text-muted-foreground">
                <strong className="text-foreground">Important for exam uploads:</strong> official requirements can change by recruitment/exam notice. The presets marked Official are tied to sources checked for this update; all other exam presets are practical working presets, not guarantees. Always compare the final file against the current application portal before submitting.
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageResizer;
