'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Palette, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';

const ColorConverter = () => {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [hexError, setHexError] = useState(false);

  const hexToRgb = (hex: string) => {
    // Expand 3-digit HEX to 6-digit
    if (hex.length === 4) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      '#' +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / (1 / 12)) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    return {
      r: Math.round(f(0) * 255),
      g: Math.round(f(8) * 255),
      b: Math.round(f(4) * 255),
    };
  };

  const updateFromHex = (newHex: string) => {
    // Remove leading # if present
    newHex = newHex.replace(/^#/, '');
    // Add # for consistency
    newHex = `#${newHex}`;
    // Validate 3-digit or 6-digit HEX
    if (/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/i.test(newHex)) {
      setHexError(false);
      setHex(newHex.toUpperCase());
      const newRgb = hexToRgb(newHex);
      setRgb(newRgb);
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    } else {
      setHexError(true);
      toast.error('Invalid HEX code. Use #FFF or #FFFFFF format.');
    }
  };

  const updateFromRgb = (newRgb: { r: number; g: number; b: number }) => {
    // Clamp RGB values between 0 and 255
    newRgb = {
      r: Math.max(0, Math.min(255, newRgb.r)),
      g: Math.max(0, Math.min(255, newRgb.g)),
      b: Math.max(0, Math.min(255, newRgb.b)),
    };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    setHexError(false);
  };

  const updateFromHsl = (newHsl: { h: number; s: number; l: number }) => {
    // Clamp HSL values
    newHsl = {
      h: Math.max(0, Math.min(360, newHsl.h)),
      s: Math.max(0, Math.min(100, newHsl.s)),
      l: Math.max(0, Math.min(100, newHsl.l)),
    };
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHexError(false);
  };

  const reset = () => {
    setHex('#3b82f6');
    setRgb({ r: 59, g: 130, b: 246 });
    setHsl({ h: 217, s: 91, l: 60 });
    setHexError(false);
    toast.success('Reset to default color!');
  };


  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Color Picker</Label>
                <Input
                  type="color"
                  value={hex}
                  onChange={(e) => updateFromHex(e.target.value)}
                  className="mt-2 h-16"
                />
              </div>

              <div>
                <Label>HEX Value</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={hex}
                    onChange={(e) => updateFromHex(e.target.value)}
                    placeholder="#000000 or #000"
                    className={hexError ? 'border-red-500' : ''}
                  />
                  <CopyButton
                    textToCopy={hex}
                    successMessage="HEX color copied to clipboard!"
                    size="icon"
                  />
                </div>
                {hexError && (
                  <p className="text-red-500 text-sm mt-1">
                    Please enter a valid 3 or 6-digit HEX code (e.g., #FFF or #FFFFFF).
                  </p>
                )}
              </div>

              <div>
                <Label>RGB Values</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Input
                    type="number"
                    value={rgb.r}
                    onChange={(e) => updateFromRgb({ ...rgb, r: Number(e.target.value) })}
                    min="0"
                    max="255"
                    placeholder="R"
                  />
                  <Input
                    type="number"
                    value={rgb.g}
                    onChange={(e) => updateFromRgb({ ...rgb, g: Number(e.target.value) })}
                    min="0"
                    max="255"
                    placeholder="G"
                  />
                  <Input
                    type="number"
                    value={rgb.b}
                    onChange={(e) => updateFromRgb({ ...rgb, b: Number(e.target.value) })}
                    min="0"
                    max="255"
                    placeholder="B"
                  />
                </div>
                <CopyButton
                  textToCopy={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                  successMessage="RGB color copied to clipboard!"
                  size="sm"
                  copyText="Copy RGB"
                  className="mt-2 w-full"
                />
              </div>

              <div>
                <Label>HSL Values</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Input
                    type="number"
                    value={hsl.h}
                    onChange={(e) => updateFromHsl({ ...hsl, h: Number(e.target.value) })}
                    min="0"
                    max="360"
                    placeholder="H"
                  />
                  <Input
                    type="number"
                    value={hsl.s}
                    onChange={(e) => updateFromHsl({ ...hsl, s: Number(e.target.value) })}
                    min="0"
                    max="100"
                    placeholder="S%"
                  />
                  <Input
                    type="number"
                    value={hsl.l}
                    onChange={(e) => updateFromHsl({ ...hsl, l: Number(e.target.value) })}
                    min="0"
                    max="100"
                    placeholder="L%"
                  />
                </div>
                <CopyButton
                  textToCopy={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
                  successMessage="HSL color copied to clipboard!"
                  size="sm"
                  copyText="Copy HSL"
                  className="mt-2 w-full"
                />
              </div>

              <Button onClick={reset} variant="outline" className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Color Preview & Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Color Preview</Label>
              <div
                className="mt-2 w-full h-32 rounded-lg border"
                style={{ backgroundColor: hex }}
              />
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">HEX</div>
                <div className="font-mono text-lg">{hex}</div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">RGB</div>
                <div className="font-mono text-lg">rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">HSL</div>
                <div className="font-mono text-lg">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ColorConverter;