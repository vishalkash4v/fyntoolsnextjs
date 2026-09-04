'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Upload, X, Check } from 'lucide-react';
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
  findStickerPackForEmoji,
  isHexColor,
  mergeButtonConfig,
  shadowCss,
  type ButtonConfig,
  type ButtonPreset,
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

/** Color picker for hex + text field for rgba/transparent */
function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const hex = isHexColor(value) ? value : '#3b82f6';
  return (
    <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 flex gap-1.5">
        <Input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 shrink-0 p-1 cursor-pointer"
          disabled={disabled || !isHexColor(value)}
          title={isHexColor(value) ? 'Pick color' : 'Use text field for rgba/transparent'}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex or rgba()"
          className="h-9 flex-1 text-xs font-mono"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
  children,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-md border p-3 space-y-2 ${checked ? 'border-primary/40 bg-primary/5' : ''}`}>
      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        {label}
        {checked && <Badge variant="secondary" className="text-[10px] h-5">On</Badge>}
      </label>
      {children}
    </div>
  );
}

const ButtonGenerator = () => {
  const [cfg, setCfg] = useState<ButtonConfig>(DEFAULT_BUTTON_CONFIG);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [stickerPack, setStickerPack] = useState(STICKER_PACKS[0].id);
  const [presetFilter, setPresetFilter] = useState('All');
  const fileRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof ButtonConfig>(key: K, value: ButtonConfig[K]) => {
    setActivePresetId(null);
    setCfg((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    loadGoogleFont(cfg.fontFamily);
  }, [cfg.fontFamily]);

  useEffect(() => {
    BUTTON_PRESETS.forEach((p) => {
      if (p.config.fontFamily) loadGoogleFont(p.config.fontFamily);
    });
  }, []);

  const applyPreset = (preset: ButtonPreset) => {
    const next = mergeButtonConfig(preset.config);
    setCfg(next);
    setActivePresetId(preset.id);
    if (next.sticker) {
      const pack = findStickerPackForEmoji(next.sticker);
      if (pack) setStickerPack(pack);
    }
    if (next.fontFamily) loadGoogleFont(next.fontFamily);
    setTimeout(() => {
      settingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const reset = () => {
    setCfg(DEFAULT_BUTTON_CONFIG);
    setActivePresetId(null);
  };

  const onImageUpload = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setActivePresetId(null);
        setCfg((prev) => ({ ...prev, customImage: reader.result as string, sticker: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const glow = cfg.glowIntensity > 0 ? `0 0 ${cfg.glowIntensity}px ${cfg.glowColor}` : '';
  const boxShadow =
    [glow, shadowCss(cfg.shadow)].filter((s) => s && s !== 'none').join(', ') || 'none';

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
          style={{
            width: cfg.imageSize,
            height: cfg.imageSize,
            objectFit: 'contain',
            borderRadius: 4,
          }}
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
    const stickerTag =
      !cfg.customImage && cfg.sticker ? `<span class="btn-sticker">${cfg.sticker}</span>` : '';
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

  const activePreset = BUTTON_PRESETS.find((p) => p.id === activePresetId);

  const settingsSummary = useMemo(() => {
    const items: string[] = [
      cfg.fontFamily.split(',')[0],
      `${cfg.fontSize}px / ${cfg.fontWeight}`,
      cfg.textTransform !== 'none' ? cfg.textTransform : null,
      cfg.letterSpacing ? `spacing ${cfg.letterSpacing}px` : null,
      cfg.gradient
        ? `grad ${cfg.gradientAngle}°`
        : isHexColor(cfg.backgroundColor)
          ? cfg.backgroundColor
          : 'custom bg',
      cfg.hoverGradient ? 'hover grad' : cfg.hoverBgColor !== DEFAULT_BUTTON_CONFIG.hoverBgColor ? 'custom hover' : null,
      cfg.borderRadius >= 100 ? 'pill' : `r${cfg.borderRadius}`,
      `pad ${cfg.paddingY}×${cfg.paddingX}`,
      cfg.borderWidth > 0 ? `border ${cfg.borderWidth}px` : null,
      cfg.shadow !== 'none' ? cfg.shadow : null,
      cfg.glowIntensity > 0 ? `glow ${cfg.glowIntensity}px` : null,
      cfg.hoverAnimation !== 'none' ? `hover:${cfg.hoverAnimation}` : null,
      cfg.idleAnimation !== 'none' ? `idle:${cfg.idleAnimation}` : null,
      cfg.sticker || cfg.customImage ? 'icon' : null,
    ].filter(Boolean) as string[];
    return items;
  }, [cfg]);

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
            Click a preset — every control below updates to match (colors, gradient, hover, font,
            padding, glow, animations & sticker).
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
              const preview = mergeButtonConfig(p.config);
              const selected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`rounded-lg border p-2.5 text-left transition-colors ${
                    selected
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                      : 'hover:border-primary/60 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex justify-center mb-2 min-h-[36px] items-center">
                    <span
                      style={{
                        background: bgCss(preview, false),
                        color: preview.textColor,
                        borderRadius: Math.min(preview.borderRadius, 24),
                        padding: '6px 12px',
                        fontSize: 11,
                        fontWeight: preview.fontWeight,
                        fontFamily: preview.fontFamily,
                        letterSpacing: preview.letterSpacing,
                        textTransform: preview.textTransform,
                        border:
                          preview.borderWidth > 0
                            ? `${preview.borderWidth}px solid ${preview.borderColor}`
                            : 'none',
                        boxShadow: shadowCss(preview.shadow),
                        display: 'inline-flex',
                        gap: 4,
                        alignItems: 'center',
                      }}
                    >
                      {preview.sticker && preview.stickerPosition !== 'right' && (
                        <span>{preview.sticker}</span>
                      )}
                      {preview.stickerPosition !== 'only' && preview.buttonText}
                      {preview.sticker && preview.stickerPosition === 'right' && (
                        <span>{preview.sticker}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {selected && <Check className="h-3 w-3 text-primary shrink-0" />}
                    <div className="text-xs font-medium truncate">{p.name}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{p.category}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls */}
        <div
          ref={settingsRef}
          className="lg:w-[48%] space-y-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1"
        >
          {/* Active settings summary */}
          <Card className="border-dashed">
            <CardHeader className="pb-2 py-3">
              <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                Active settings
                {activePreset && (
                  <Badge variant="default" className="text-[10px] font-normal">
                    Preset: {activePreset.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <div className="flex flex-wrap gap-1">
                {settingsSummary.map((s) => (
                  <Badge key={s} variant="outline" className="text-[10px] font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

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
                  <Label>Font size ({cfg.fontSize}px)</Label>
                  <Slider
                    value={[cfg.fontSize]}
                    onValueChange={(v) => set('fontSize', v[0])}
                    min={10}
                    max={42}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Font weight ({cfg.fontWeight})</Label>
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
                  <Label>Letter spacing ({cfg.letterSpacing}px)</Label>
                  <Slider
                    value={[cfg.letterSpacing]}
                    onValueChange={(v) => set('letterSpacing', v[0])}
                    min={-1}
                    max={8}
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
                  <Label>Text align</Label>
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
                    Full width button
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Colors & Gradients</CardTitle>
              <CardDescription className="text-xs">
                Hex or rgba() — glass presets use rgba for transparency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ColorField label="Text color" value={cfg.textColor} onChange={(v) => set('textColor', v)} />
                <ColorField
                  label="Background"
                  value={cfg.backgroundColor}
                  onChange={(v) => set('backgroundColor', v)}
                  disabled={cfg.gradient}
                />
                <ColorField
                  label="Hover (solid)"
                  value={cfg.hoverBgColor}
                  onChange={(v) => set('hoverBgColor', v)}
                  disabled={cfg.hoverGradient}
                />
              </div>

              <SettingToggle
                label="Background gradient"
                checked={cfg.gradient}
                onChange={(v) => set('gradient', v)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <ColorField
                    label="Gradient start"
                    value={cfg.gradientColor1}
                    onChange={(v) => set('gradientColor1', v)}
                  />
                  <ColorField
                    label="Gradient end"
                    value={cfg.gradientColor2}
                    onChange={(v) => set('gradientColor2', v)}
                  />
                  <div>
                    <Label className="text-xs">Angle ({cfg.gradientAngle}°)</Label>
                    <Slider
                      value={[cfg.gradientAngle]}
                      onValueChange={(v) => set('gradientAngle', v[0])}
                      min={0}
                      max={360}
                      className="mt-2"
                      disabled={!cfg.gradient}
                    />
                  </div>
                </div>
              </SettingToggle>

              <SettingToggle
                label="Hover gradient"
                checked={cfg.hoverGradient}
                onChange={(v) => set('hoverGradient', v)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <ColorField
                    label="Hover grad start"
                    value={cfg.hoverGradientColor1}
                    onChange={(v) => set('hoverGradientColor1', v)}
                  />
                  <ColorField
                    label="Hover grad end"
                    value={cfg.hoverGradientColor2}
                    onChange={(v) => set('hoverGradientColor2', v)}
                  />
                  <div>
                    <Label className="text-xs">Hover angle ({cfg.hoverGradientAngle}°)</Label>
                    <Slider
                      value={[cfg.hoverGradientAngle]}
                      onValueChange={(v) => set('hoverGradientAngle', v[0])}
                      min={0}
                      max={360}
                      className="mt-2"
                      disabled={!cfg.hoverGradient}
                    />
                  </div>
                </div>
              </SettingToggle>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Shape, Border & Effects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>
                  Border radius ({cfg.borderRadius}px)
                  {cfg.borderRadius >= 100 && (
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      Pill
                    </Badge>
                  )}
                </Label>
                <Slider
                  value={[Math.min(cfg.borderRadius, 999)]}
                  onValueChange={(v) => set('borderRadius', v[0])}
                  min={0}
                  max={999}
                  className="mt-2"
                />
                <div className="flex gap-1.5 mt-2">
                  {[0, 8, 12, 16, 999].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => set('borderRadius', r)}
                      className={`h-6 px-2 rounded border text-[10px] ${
                        cfg.borderRadius === r ? 'border-primary bg-primary/10' : ''
                      }`}
                    >
                      {r === 999 ? 'Pill' : r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Padding X ({cfg.paddingX}px)</Label>
                  <Slider
                    value={[cfg.paddingX]}
                    onValueChange={(v) => set('paddingX', v[0])}
                    min={4}
                    max={80}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Padding Y ({cfg.paddingY}px)</Label>
                  <Slider
                    value={[cfg.paddingY]}
                    onValueChange={(v) => set('paddingY', v[0])}
                    min={4}
                    max={48}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Border width ({cfg.borderWidth}px)</Label>
                  <Slider
                    value={[cfg.borderWidth]}
                    onValueChange={(v) => set('borderWidth', v[0])}
                    min={0}
                    max={8}
                    className="mt-2"
                  />
                </div>
                <ColorField
                  label="Border color"
                  value={cfg.borderColor}
                  onChange={(v) => set('borderColor', v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Shadow style</Label>
                  <select
                    value={cfg.shadow}
                    onChange={(e) => set('shadow', e.target.value as ButtonConfig['shadow'])}
                    className="mt-1.5 w-full h-9 rounded-md border bg-background px-2 text-sm"
                  >
                    <option value="none">None</option>
                    <option value="soft">Soft</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard / Neo-brutalist</option>
                    <option value="lift">Lifted / floating</option>
                  </select>
                </div>
                <div>
                  <Label>Glow intensity ({cfg.glowIntensity}px)</Label>
                  <Slider
                    value={[cfg.glowIntensity]}
                    onValueChange={(v) => set('glowIntensity', v[0])}
                    min={0}
                    max={32}
                    className="mt-2"
                  />
                </div>
              </div>
              <ColorField
                label="Glow color"
                value={cfg.glowColor}
                onChange={(v) => set('glowColor', v)}
                disabled={cfg.glowIntensity === 0}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Animations</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <Label>Idle animation (always on)</Label>
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
                {cfg.sticker
                  ? `Selected: ${cfg.sticker} · position: ${cfg.stickerPosition}`
                  : cfg.customImage
                    ? 'Custom image uploaded'
                    : 'No icon — pick from packs or upload'}
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
                  className={`h-9 w-9 rounded border text-xs ${
                    !cfg.sticker && !cfg.customImage ? 'border-primary bg-primary/10' : ''
                  }`}
                  onClick={() => {
                    set('sticker', '');
                    set('customImage', null);
                  }}
                  title="No icon"
                >
                  ∅
                </button>
                {pack.items.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setActivePresetId(null);
                      setCfg((prev) => ({ ...prev, sticker: emoji, customImage: null }));
                    }}
                    className={`h-9 w-9 rounded border text-lg hover:bg-accent ${
                      cfg.sticker === emoji ? 'border-primary bg-primary/10 ring-1 ring-primary/40' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Icon / sticker position</Label>
                  <select
                    value={cfg.stickerPosition}
                    onChange={(e) =>
                      set('stickerPosition', e.target.value as ButtonConfig['stickerPosition'])
                    }
                    className="mt-1.5 w-full h-9 rounded-md border bg-background px-2 text-sm"
                  >
                    <option value="left">Left of text</option>
                    <option value="right">Right of text</option>
                    <option value="only">Icon only (no text)</option>
                  </select>
                </div>
                <div>
                  <Label>Icon size ({cfg.imageSize}px)</Label>
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
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
                Reset all to default
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview + code */}
        <div className="lg:w-[52%] space-y-4 lg:sticky lg:top-4 self-start">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Live Preview</CardTitle>
              <CardDescription className="text-xs">
                Hover to test hover gradient &amp; animations
                {activePreset && ` · ${activePreset.name} preset loaded`}
              </CardDescription>
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
