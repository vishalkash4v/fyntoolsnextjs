'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Palette } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';

const GradientGenerator = () => {
  const [gradientType, setGradientType] = useState('linear');
  const [direction, setDirection] = useState('45deg');
  const [color1, setColor1] = useState('#3b82f6');
  const [color2, setColor2] = useState('#8b5cf6');
  const [color1Position, setColor1Position] = useState([0]);
  const [color2Position, setColor2Position] = useState([100]);

  const directions = [
    { value: '0deg', label: 'Top' },
    { value: '45deg', label: 'Top Right' },
    { value: '90deg', label: 'Right' },
    { value: '135deg', label: 'Bottom Right' },
    { value: '180deg', label: 'Bottom' },
    { value: '225deg', label: 'Bottom Left' },
    { value: '270deg', label: 'Left' },
    { value: '315deg', label: 'Top Left' },
  ];

  const generateGradient = () => {
    if (gradientType === 'linear') {
      return `linear-gradient(${direction}, ${color1} ${color1Position[0]}%, ${color2} ${color2Position[0]}%)`;
    } else if (gradientType === 'radial') {
      return `radial-gradient(circle, ${color1} ${color1Position[0]}%, ${color2} ${color2Position[0]}%)`;
    } else {
      return `conic-gradient(from 0deg, ${color1} ${color1Position[0]}%, ${color2} ${color2Position[0]}%)`;
    }
  };

  const gradientStyle = generateGradient();
  const cssCode = `background: ${gradientStyle};`;


  const reset = () => {
    setGradientType('linear');
    setDirection('45deg');
    setColor1('#3b82f6');
    setColor2('#8b5cf6');
    setColor1Position([0]);
    setColor2Position([100]);
  };

  const randomGradient = () => {
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#8b5cf6', '#06b6d4'];
    setColor1(colors[Math.floor(Math.random() * colors.length)]);
    setColor2(colors[Math.floor(Math.random() * colors.length)]);
    setColor1Position([Math.floor(Math.random() * 30)]);
    setColor2Position([70 + Math.floor(Math.random() * 30)]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Gradient Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Gradient Type</Label>
                <Select value={gradientType} onValueChange={setGradientType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                    <SelectItem value="conic">Conic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {gradientType === 'linear' && (
                <div>
                  <Label>Direction</Label>
                  <Select value={direction} onValueChange={setDirection}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {directions.map(dir => (
                        <SelectItem key={dir.value} value={dir.value}>
                          {dir.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gradient-color-1">First Color</Label>
                  <Input
                    id="gradient-color-1"
                    type="color"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="mt-2 h-12"
                    aria-label="First gradient color"
                  />
                  <Label htmlFor="gradient-color-1-position" className="text-sm mt-2">Position: {color1Position[0]}%</Label>
                  <Slider
                    id="gradient-color-1-position"
                    value={color1Position}
                    onValueChange={setColor1Position}
                    max={100}
                    min={0}
                    step={1}
                    className="mt-1"
                    aria-label="First color position"
                  />
                </div>

                <div>
                  <Label htmlFor="gradient-color-2">Second Color</Label>
                  <Input
                    id="gradient-color-2"
                    type="color"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="mt-2 h-12"
                    aria-label="Second gradient color"
                  />
                  <Label htmlFor="gradient-color-2-position" className="text-sm mt-2">Position: {color2Position[0]}%</Label>
                  <Slider
                    id="gradient-color-2-position"
                    value={color2Position}
                    onValueChange={setColor2Position}
                    max={100}
                    min={0}
                    step={1}
                    className="mt-1"
                    aria-label="Second color position"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={randomGradient} variant="outline" className="flex-1">
                Random
              </Button>
              <Button onClick={reset} variant="outline" aria-label="Reset gradient">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview & CSS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Gradient Preview</Label>
              <div 
                className="mt-2 w-full h-48 rounded-lg border"
                style={{ background: gradientStyle }}
              />
            </div>

            <div>
              <Label>CSS Code</Label>
              <div className="mt-2 p-3 bg-muted rounded-md font-mono text-sm">
                {cssCode}
              </div>
              <CopyButton
                textToCopy={cssCode}
                successMessage="CSS gradient copied to clipboard!"
                size="sm"
                className="mt-2 w-full"
                copyText="Copy CSS"
              />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">💡 Usage Tips:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Linear gradients flow in straight lines</li>
                <li>• Radial gradients radiate from center</li>
                <li>• Conic gradients rotate around center</li>
                <li>• Adjust color positions for different effects</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GradientGenerator;
