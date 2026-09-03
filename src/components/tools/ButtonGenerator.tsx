'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Upload, X } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';
import {
  BUTTON_FONTS,
  BUTTON_PRESETS,
  DEFAULT_BUTTON_CONFIG,
  HOVER_ANIMATIONS,
  IDLE_ANIMATIONS,
  KEYFRAMES_CSS,
  STICKER_PACKS,
  animationName,
  bgCss,
  shadowCss,
  type ButtonConfig,
} from '@/lib/button-generator/buttonData';

function loadGoogleFont(familyValue: string) {
  const meta = BUTTON_FONTS.find((f) => f.value === familyValue);
  if (!meta?.google) return;
  const id = `btn-font-${meta.google.replace(/[^a-z0-9]+/gi, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${meta.google}&display=swap`;
  document.head.appendChild(link);
}

const ButtonGenerator = () => {
  const [cfg, setCfg] = useState<ButtonConfig>(DEFAULT_BUTTON_CONFIG);
  const [isHovered, setIsHovered] = useState(false);
  const [stickerPack, setStickerPack] = useState(STICKER_PACKS[0].id);
  const [presetFilter, setPresetFilter] = useState('All');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ButtonConfig>(key: K, value: ButtonConfig[K]) => {
    setCfg((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    loadGoogleFont(cfg.fontFamily);
  }, [cfg.fontFamily]);

  useEffect(() => {
    // Prefetch fonts used by presets for snappy switching
    BUTTON_PRESETS.forEach((p) => {
      if (p.config.fontFamily) loadGoogleFont(p.config.fontFamily);
    });
  }, []);

  const applyPreset = (partial: Partial<ButtonConfig>) => {
    setCfg((prev) => ({
      ...DEFAULT_BUTTON_CONFIG,
      ...prev,
      ...partial,
      // reset effects that presets often omit intentionally
      glowIntensity: partial.glowIntensity ?? 0,
      idleAnimation: partial.idleAnimation ?? 'none',
      customImage: partial.customImage ?? null,
      gradient: partial.gradient ?? false,
      hoverGradient: partial.hoverGradient ?? false,
      borderWidth: partial.borderWidth ?? 0,
      letterSpacing: partial.letterSpacing ?? 0,
      textTransform: partial.textTransform ?? 'none',
      stickerPosition: partial.stickerPosition ?? 'left',
    }));
  };

  const reset = () => setCfg(DEFAULT_BUTTON_CONFIG);

  const onImageUpload = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') set('customImage', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const glow =
    cfg.glowIntensity > 0 ? `0 0 ${cfg.glowIntensity}px ${cfg.glowColor}` : '';
  const boxShadow = [glow, shadowCss(cfg.shadow)].filter((s) => s && s !== 'none').join(', ') || 'none';

  const activeAnim = isHovered
    ? animationName(cfg.hoverAnimation)
    : animationName(cfg.idleAnimation);

  const buttonStyle: React.CSSProperties = {
    background: bgCss(cfg, isHovered),
    color: cfg.textColor,
    borderRadius: `${cfg.borderRadius}px`,
    padding: `${cfg.paddingY}px ${cfg.paddingX}px`,
    fontSize: `${cfg.fontSize}px`,
    fontWeight: cfg.fontWeight,
    fontFamily: cfg.fontFamily,
    letterSpacing: `${cfg.letterSpacing}px`,
    textTransform: cfg.textTransform,
    border: `${cfg.borderWidth}px solid ${cfg.borderColor}`,
    cursor: 'pointer',
    transition: 'background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
    boxShadow,
    textAlign: cfg.textAlign,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent:
      cfg.textAlign === 'left' ? 'flex-start' : cfg.textAlign === 'right' ? 'flex-end' : 'center',
    gap: '0.5rem',
    width: cfg.fullWidth ? '100%' : 'auto',
    animation: activeAnim !== 'none' ? `${activeAnim} 0.9s ease` : undefined,
    animationIterationCount:
      !isHovered && cfg.idleAnimation !== 'none' ? 'infinite' : undefined,
  };

  const contentNodes = () => {
    const img =
      cfg.customImage != null ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cfg.customImage}
          alt=""
          width={cfg.imageSize}
          height={cfg.imageSize}
          style={{ width: cfg.imageSize, height: cfg.imageSize, objectFit: 'contain', borderRadius: 4 }}
        />
      ) : null;
    const sticker =
      cfg.sticker && !cfg.customImage ? (
        <span aria-hidden style={{ fontSize: `${Math.max(cfg.fontSize, 16)}px`, lineHeight: 1 }}>
          {cfg.sticker}
        </span>
      ) : null;
    const label =
      cfg.stickerPosition === 'only' && (cfg.sticker || cfg.customImage) ? null : (
        <span>{cfg.buttonText}</span>
      );

    if (cfg.stickerPosition === 'right') {
      return (
        <>
          {label}
          {img || sticker}
        </>
      );
    }
    return (
      <>
        {img || sticker}
        {label}
      </>
    );
  };

  const htmlCode = useMemo(() => {
    const imgTag = cfg.customImage
      ? `<img src="YOUR_IMAGE_URL" alt="" width="${cfg.imageSize}" height="${cfg.imageSize}" />`
      : '';
    const stickerTag = !cfg.customImage && cfg.sticker
      ? `<span class="btn-sticker">${cfg.sticker}</span>`
      : '';
    const icon = imgTag || stickerTag;

    let inner = '';
    if (cfg.stickerPosition === 'only') {
      inner = icon || `<span class="btn-sticker">⭐</span>`;
    } else if (cfg.stickerPosition === 'right') {
      inner = `${cfg.buttonText}${icon ? ` ${icon}` : ''}`;
    } else {
      inner = `${icon ? `${icon} ` : ''}${cfg.buttonText}`;
    }
    return `<button class="fyn-btn">${inner}</button>`;
  }, [cfg]);

  const cssCode = useMemo(() => {
    const hoverBg = bgCss(cfg, true);
    const normalBg = bgCss(cfg, false);
    const hoverAnim =
      cfg.hoverAnimation !== 'none'
        ? `  animation: ${animationName(cfg.hoverAnimation)} 0.9s ease;`
        : '';
    const idleAnim =
      cfg.idleAnimation !== 'none'
        ? `  animation: ${animationName(cfg.idleAnimation)} 2s ease infinite;`
        : '';

    return `${KEYFRAMES_CSS}

.fyn-btn {
  background: ${normalBg};
  color: ${cfg.textColor};
  border-radius: ${cfg.borderRadius}px;
  padding: ${cfg.paddingY}px ${cfg.paddingX}px;
  font-size: ${cfg.fontSize}px;
  font-weight: ${cfg.fontWeight};
  font-family: ${cfg.fontFamily}, sans-serif;
  letter-spacing: ${cfg.letterSpacing}px;
  text-transform: ${cfg.textTransform};
  border: ${cfg.borderWidth}px solid ${cfg.borderColor};
  box-shadow: ${boxShadow};
  text-align: ${cfg.textAlign};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
${idleAnim}
}
.fyn-btn:hover {
  background: ${hoverBg};
${hoverAnim}
}
.fyn-btn img, .fyn-btn .btn-sticker {
  display: inline-flex;
  line-height: 1;
}
`.trim();
  }, [cfg, boxShadow]);

  const reactCode = useMemo(
    () => `export default function FynButton() {
  return (
    <button className="fyn-btn">
      ${htmlCode.replace('<button class="fyn-btn">', '').replace('</button>', '')}
    </button>
  );
}

/* Also paste the CSS from the CSS tab into your stylesheet. */`,
    [htmlCode]
  );

  const categories = ['All', ...Array.from(new Set(BUTTON_PRESETS.map((p) => p.category)))];
  const presets =
    presetFilter === 'All'
      ? BUTTON_PRESETS
      : BUTTON_PRESETS.filter((p) => p.category === presetFilter);
  const pack = STICKER_PACKS.find((p) => p.id === stickerPack) ?? STICKER_PACKS[0];

  return (
    <div className="space-y-6">
      <style>{KEYFRAMES_CSS}</style>

      {/* Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Popular Button Presets</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Click any preset to load all settings — colors, fonts, hover gradient, animation & stickers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setPresetFilter(c)}
                className={`h-7 rounded-full border px-2.5 text-[11px] transition-colors ${
                  presetFilter === c
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {presets.map((p) => {
              const preview = { ...DEFAULT_BUTTON_CONFIG, ...p.config };
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.config)}
                  className="rounded-lg border p-2.5 text-left hover:border-primary/60 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex justify-center mb-2 min-h-[36px] items-center">
                    <span
                      style={{
                        background: bgCss(preview, false),
                        color: preview.textColor,
                        borderRadius: preview.borderRadius,
                        padding: '6px 12px',
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: preview.fontFamily,
                        border:
                          preview.borderWidth > 0
                            ? `${preview.borderWidth}px solid ${preview.borderColor}`
                            : 'none',
                        display: 'inline-flex',
                        gap: 4,
                        alignItems: 'center',
                      }}
                    >
                      {preview.sticker && preview.stickerPosition !== 'right' && (
                        <span>{preview.sticker}</span>
                      )}
                      {preview.buttonText}
                      {preview.sticker && preview.stickerPosition === 'right' && (
                        <span>{preview.sticker}</span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs font-medium truncate">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.category}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls */}
        <div className="lg:w-[48%] space-y-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Text & Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Button text</Label>
                <Input
                  value={cfg.buttonText}
                  onChange={(e) => set('buttonText', e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Font family ({BUTTON_FONTS.length} fonts)</Label>
                <select
                  value={cfg.fontFamily}
                  onChange={(e) => set('fontFamily', e.target.value)}
                  className="mt-1.5 w-full h-9 rounded-md border bg-background px-2 text-sm"
                >
                  {BUTTON_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Size ({cfg.fontSize}px)</Label>
                  <Slider
                    value={[cfg.fontSize]}
                    onValueChange={(v) => set('fontSize', v[0])}
                    min={10}
                    max={42}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Weight ({cfg.fontWeight})</Label>
                  <Slider
                    value={[cfg.fontWeight]}
                    onValueChange={(v) => set('fontWeight', v[0])}
                    min={300}
                    max={900}
                    step={100}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Letter spacing</Label>
                  <Slider
                    value={[cfg.letterSpacing]}
                    onValueChange={(v) => set('letterSpacing', v[0])}
                    min={-1}
                    max={6}
                    step={0.5}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Text transform</Label>
                  <select
                    value={cfg.textTransform}
                    onChange={(e) =>
                      set('textTransform', e.target.value as ButtonConfig['textTransform'])
                    }
                    className="mt-1.5 w-full h-9 rounded-md border bg-background px-2 text-sm"
                  >
                    <option value="none">None</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Align</Label>
                  <select
                    value={cfg.textAlign}
                    onChange={(e) => set('textAlign', e.target.value as ButtonConfig['textAlign'])}
                    className="mt-1.5 w-full h-9 rounded-md border bg-background px-2 text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.fullWidth}
                      onChange={(e) => set('fullWidth', e.target.checked)}
                    />
                    Full width
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Colors & Gradients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Text</Label>
                  <Input
                    type="color"
                    value={cfg.textColor.startsWith('#') ? cfg.textColor : '#ffffff'}
                    onChange={(e) => set('textColor', e.target.value)}
                    className="mt-1 h-9 p-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Background</Label>
                  <Input
                    type="color"
                    value={
                      cfg.backgroundColor.startsWith('#') ? cfg.backgroundColor : '#3b82f6'
                    }
                    onChange={(e) => set('backgroundColor', e.target.value)}
                    className="mt-1 h-9 p-1"
                    disabled={cfg.gradient}
                  />
                </div>
                <div>
                  <Label className="text-xs">Hover solid</Label>
                  <Input
                    type="color"
                    value={cfg.hoverBgColor.startsWith('#') ? cfg.hoverBgColor : '#2563eb'}
                    onChange={(e) => set('hoverBgColor', e.target.value)}
                    className="mt-1 h-9 p-1"
                    disabled={cfg.hoverGradient}
                  />
                </div>
              </div>

              <div className="rounded-md border p-3 space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cfg.gradient}
                    onChange={(e) => set('gradient', e.target.checked)}
                  />
                  Background gradient
                </label>
                {cfg.gradient && (
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="color"
                      value={cfg.gradientColor1}
                      onChange={(e) => set('gradientColor1', e.target.value)}
                      className="h-9 p-1"
                    />
                    <Input
                      type="color"
                      value={cfg.gradientColor2}
                      onChange={(e) => set('gradientColor2', e.target.value)}
                      className="h-9 p-1"
                    />
                    <div>
                      <Label className="text-[10px]">Angle {cfg.gradientAngle}°</Label>
                      <Slider
                        value={[cfg.gradientAngle]}
                        onValueChange={(v) => set('gradientAngle', v[0])}
                        min={0}
                        max={360}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-md border p-3 space-y-2 bg-muted/30">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cfg.hoverGradient}
                    onChange={(e) => set('hoverGradient', e.target.checked)}
                  />
                  Hover gradient
                </label>
                {cfg.hoverGradient && (
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="color"
                      value={cfg.hoverGradientColor1}
                      onChange={(e) => set('hoverGradientColor1', e.target.value)}
                      className="h-9 p-1"
                    />
                    <Input
                      type="color"
                      value={cfg.hoverGradientColor2}
                      onChange={(e) => set('hoverGradientColor2', e.target.value)}
                      className="h-9 p-1"
                    />
                    <div>
                      <Label className="text-[10px]">Angle {cfg.hoverGradientAngle}°</Label>
                      <Slider
                        value={[cfg.hoverGradientAngle]}
                        onValueChange={(v) => set('hoverGradientAngle', v[0])}
                        min={0}
                        max={360}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Shape, Border & Shadow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Radius ({cfg.borderRadius}px)</Label>
                  <Slider
                    value={[cfg.borderRadius]}
                    onValueChange={(v) => set('borderRadius', v[0])}
                    min={0}
                    max={50}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Border ({cfg.borderWidth}px)</Label>
                  <Slider
                    value={[cfg.borderWidth]}
                    onValueChange={(v) => set('borderWidth', v[0])}
                    min={0}
                    max={8}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Padding X ({cfg.paddingX})</Label>
                  <Slider
                    value={[cfg.paddingX]}
                    onValueChange={(v) => set('paddingX', v[0])}
                    min={8}
                    max={64}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Padding Y ({cfg.paddingY})</Label>
                  <Slider
                    value={[cfg.paddingY]}
                    onValueChange={(v) => set('paddingY', v[0])}
                    min={4}
                    max={40}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Border color</Label>
                  <Input
                    type="color"
                    value={cfg.borderColor.startsWith('#') ? cfg.borderColor : '#000000'}
                    onChange={(e) => set('borderColor', e.target.value)}
                    className="mt-1.5 h-9 p-1"
                  />
                </div>
                <div>
                  <Label>Shadow</Label>
                  <select
                    value={cfg.shadow}
                    onChange={(e) => set('shadow', e.target.value as ButtonConfig['shadow'])}
                    className="mt-1.5 w-full h-9 rounded-md border bg-background px-2 text-sm"
                  >
                    <option value="none">None</option>
                    <option value="soft">Soft</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard / Neo</option>
                    <option value="lift">Lifted</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Glow color</Label>
                  <Input
                    type="color"
                    value={cfg.glowColor}
                    onChange={(e) => set('glowColor', e.target.value)}
                    className="mt-1.5 h-9 p-1"
                  />
                </div>
                <div>
                  <Label>Glow ({cfg.glowIntensity}px)</Label>
                  <Slider
                    value={[cfg.glowIntensity]}
                    onValueChange={(v) => set('glowIntensity', v[0])}
                    min={0}
                    max={24}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Animations</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div>
                <Label>Hover animation</Label>
                <select
                  value={cfg.hoverAnimation}
                  onChange={(e) => set('hoverAnimation', e.target.value)}
                  className="mt-1.5 w-full h-9 rounded-md border bg-background px-2 text-sm"
                >
                  {HOVER_ANIMATIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Idle animation</Label>
                <select
                  value={cfg.idleAnimation}
                  onChange={(e) => set('idleAnimation', e.target.value)}
                  className="mt-1.5 w-full h-9 rounded-md border bg-background px-2 text-sm"
                >
                  {IDLE_ANIMATIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stickers, Emojis & Images</CardTitle>
              <CardDescription className="text-xs">
                Animals, pets, birds, nature, anime faces — or upload your own icon/logo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {STICKER_PACKS.map((p) => (
                  <Badge
                    key={p.id}
                    variant={stickerPack === p.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStickerPack(p.id)}
                  >
                    {p.label}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto rounded-md border p-2">
                <button
                  type="button"
                  className="h-9 w-9 rounded border text-xs text-muted-foreground"
                  onClick={() => set('sticker', '')}
                  title="Clear sticker"
                >
                  ∅
                </button>
                {pack.items.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => set('sticker', emoji)}
                    className={`h-9 w-9 rounded border text-lg hover:bg-accent ${
                      cfg.sticker === emoji ? 'border-primary bg-primary/10' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sticker position</Label>
                  <select
                    value={cfg.stickerPosition}
                    onChange={(e) =>
                      set('stickerPosition', e.target.value as ButtonConfig['stickerPosition'])
                    }
                    className="mt-1.5 w-full h-9 rounded-md border bg-background px-2 text-sm"
                  >
                    <option value="left">Left of text</option>
                    <option value="right">Right of text</option>
                    <option value="only">Icon only</option>
                  </select>
                </div>
                <div>
                  <Label>Image size ({cfg.imageSize}px)</Label>
                  <Slider
                    value={[cfg.imageSize]}
                    onValueChange={(v) => set('imageSize', v[0])}
                    min={12}
                    max={48}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onImageUpload(e.target.files?.[0])}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload image / logo
                </Button>
                {cfg.customImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set('customImage', null)}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Remove image
                  </Button>
                )}
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={reset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset all
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview + code */}
        <div className="lg:w-[52%] space-y-4 lg:sticky lg:top-4 self-start">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Live Preview</CardTitle>
              <CardDescription className="text-xs">Hover to test hover gradient & animations</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-xl border p-10 min-h-[160px] flex items-center justify-center"
                style={{
                  background:
                    'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.08), transparent 40%), radial-gradient(circle at 80% 70%, rgba(236,72,153,0.08), transparent 40%), hsl(var(--muted) / 0.35)',
                }}
              >
                <button
                  type="button"
                  style={buttonStyle}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {contentNodes()}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Export Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  ['HTML', htmlCode],
                  ['CSS', cssCode],
                  ['React', reactCode],
                ] as const
              ).map(([label, code]) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label>{label}</Label>
                    <CopyButton
                      textToCopy={code}
                      successMessage={`${label} copied!`}
                      variant="outline"
                      size="sm"
                      copyText={`Copy ${label}`}
                    />
                  </div>
                  <pre className="overflow-x-auto max-h-40 text-[11px] leading-relaxed p-2.5 rounded-md bg-muted/60 border">
                    {code}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ButtonGenerator;
