'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { ColorResult, HSLColor } from 'react-color';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CopyButton from '@/components/common/CopyButton';

const SketchPicker = dynamic(
  () => import('react-color').then((m) => m.SketchPicker as React.ComponentType<{
    color: ColorResult['rgb'];
    onChangeComplete: (c: ColorResult) => void;
    className?: string;
  }>),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[300px] w-[220px] rounded border bg-muted/40 animate-pulse"
        aria-label="Loading color picker"
        role="status"
      />
    ),
  }
);

const ColorPickerTool = () => {
  const [color, setColor] = useState<ColorResult['rgb']>({ r: 51, g: 51, b: 51, a: 1 });
  const [hex, setHex] = useState<string>('#333333');
  const [hsl, setHsl] = useState<HSLColor>({ h: 0, s: 0, l: 0.2, a: 1 });
  const { toast } = useToast();

  const handleChangeComplete = (colorResult: ColorResult) => {
    setColor(colorResult.rgb);
    setHex(colorResult.hex);
    setHsl(colorResult.hsl);
  };

  const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  const hslString = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-shrink-0">
          <SketchPicker
            color={color}
            onChangeComplete={handleChangeComplete}
            className="shadow-lg"
          />
        </div>
        <div className="flex-grow space-y-4 w-full md:max-w-sm">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div
                className="w-full h-24 rounded-lg border shadow-inner"
                style={{ backgroundColor: colorString }}
                aria-label="Selected color preview"
              />
              <div className="space-y-2">
                <Label htmlFor="hex">HEX</Label>
                <div className="flex gap-2">
                  <Input id="hex" value={hex} readOnly />
                  <CopyButton text={hex} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rgba">RGBA</Label>
                <div className="flex gap-2">
                  <Input id="rgba" value={colorString} readOnly />
                  <CopyButton text={colorString} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hsl">HSL</Label>
                <div className="flex gap-2">
                  <Input id="hsl" value={hslString} readOnly />
                  <CopyButton text={hslString} />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  toast({ title: 'Color ready', description: `${hex} — use copy buttons for formats` })
                }
              >
                Color selected
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerTool;
