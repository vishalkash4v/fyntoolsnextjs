'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';

const BorderRadiusGenerator = () => {
  const [topLeft, setTopLeft] = useState([20]);
  const [topRight, setTopRight] = useState([20]);
  const [bottomLeft, setBottomLeft] = useState([20]);
  const [bottomRight, setBottomRight] = useState([20]);

  const borderRadiusValue = `${topLeft[0]}px ${topRight[0]}px ${bottomRight[0]}px ${bottomLeft[0]}px`;
  const cssCode = `border-radius: ${borderRadiusValue};`;


  const reset = () => {
    setTopLeft([20]);
    setTopRight([20]);
    setBottomLeft([20]);
    setBottomRight([20]);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Border Radius Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Top Left: {topLeft[0]}px</Label>
                <Slider
                  value={topLeft}
                  onValueChange={setTopLeft}
                  max={100}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Top Right: {topRight[0]}px</Label>
                <Slider
                  value={topRight}
                  onValueChange={setTopRight}
                  max={100}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Bottom Left: {bottomLeft[0]}px</Label>
                <Slider
                  value={bottomLeft}
                  onValueChange={setBottomLeft}
                  max={100}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Bottom Right: {bottomRight[0]}px</Label>
                <Slider
                  value={bottomRight}
                  onValueChange={setBottomRight}
                  max={100}
                  min={0}
                  step={1}
                  className="mt-2"
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
              <Button onClick={reset} variant="outline">
                <RotateCcw className="h-4 w-4" />
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
                className="w-32 h-32 bg-primary"
                style={{ borderRadius: borderRadiusValue }}
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

export default BorderRadiusGenerator;
