'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';

const BoxShadowGenerator = () => {
  const [horizontalOffset, setHorizontalOffset] = useState([10]);
  const [verticalOffset, setVerticalOffset] = useState([10]);
  const [blurRadius, setBlurRadius] = useState([15]);
  const [spreadRadius, setSpreadRadius] = useState([0]);
  const [shadowColor, setShadowColor] = useState('#ec2e9b');
  const [opacity, setOpacity] = useState([50]);

  const shadowValue = `${horizontalOffset[0]}px ${verticalOffset[0]}px ${blurRadius[0]}px ${spreadRadius[0]}px ${shadowColor}${Math.round(opacity[0] * 2.55).toString(16).padStart(2, '0')}`;
  const cssCode = `box-shadow: ${shadowValue};`;


  const reset = () => {
    setHorizontalOffset([10]);
    setVerticalOffset([10]);
    setBlurRadius([15]);
    setSpreadRadius([0]);
    setShadowColor('#ec2e9b');
    setOpacity([50]);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shadow Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="horizontal-offset-slider">Horizontal Offset: {horizontalOffset[0]}px</Label>
                <Slider
                  id="horizontal-offset-slider"
                  value={horizontalOffset}
                  onValueChange={setHorizontalOffset}
                  max={50}
                  min={-50}
                  step={1}
                  className="mt-2"
                  aria-label="Horizontal shadow offset"
                />
              </div>

              <div>
                <Label htmlFor="vertical-offset-slider">Vertical Offset: {verticalOffset[0]}px</Label>
                <Slider
                  id="vertical-offset-slider"
                  value={verticalOffset}
                  onValueChange={setVerticalOffset}
                  max={50}
                  min={-50}
                  step={1}
                  className="mt-2"
                  aria-label="Vertical shadow offset"
                />
              </div>

              <div>
                <Label htmlFor="blur-radius-slider">Blur Radius: {blurRadius[0]}px</Label>
                <Slider
                  id="blur-radius-slider"
                  value={blurRadius}
                  onValueChange={setBlurRadius}
                  max={100}
                  min={0}
                  step={1}
                  className="mt-2"
                  aria-label="Blur radius"
                />
              </div>

              <div>
                <Label htmlFor="spread-radius-slider">Spread Radius: {spreadRadius[0]}px</Label>
                <Slider
                  id="spread-radius-slider"
                  value={spreadRadius}
                  onValueChange={setSpreadRadius}
                  max={50}
                  min={-50}
                  step={1}
                  className="mt-2"
                  aria-label="Spread radius"
                />
              </div>

              <div>
                <Label htmlFor="shadow-color-input">Shadow Color</Label>
                <Input
                  id="shadow-color-input"
                  type="color"
                  value={shadowColor}
                  onChange={(e) => setShadowColor(e.target.value)}
                  className="mt-2 h-12"
                  aria-label="Shadow color"
                />
              </div>

              <div>
                <Label htmlFor="opacity-slider">Opacity: {opacity[0]}%</Label>
                <Slider
                  id="opacity-slider"
                  value={opacity}
                  onValueChange={setOpacity}
                  max={100}
                  min={0}
                  step={1}
                  className="mt-2"
                  aria-label="Shadow opacity"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <CopyButton
                textToCopy={cssCode}
                successMessage="CSS code copied to clipboard!"
                variant="default"
                size="sm"
                copyText="Copy CSS"
                className="flex-1"
              />
              <Button onClick={reset} variant="outline" aria-label="Reset shadow settings">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div
                className="w-32 h-32 bg-card border rounded-lg"
                style={{ boxShadow: shadowValue }}
              />
              
              <div className="w-full">
                <Label>Generated CSS:</Label>
                <div className="mt-2 p-3 bg-muted rounded-md font-mono text-sm">
                  {cssCode}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BoxShadowGenerator;
