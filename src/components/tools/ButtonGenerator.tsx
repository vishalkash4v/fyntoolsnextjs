'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '@/components/common/CopyButton';

const ButtonGenerator = () => {
  const [buttonText, setButtonText] = useState('Click Me');
  const [backgroundColor, setBackgroundColor] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('#ffffff');
  const [hoverBgColor, setHoverBgColor] = useState('#2563eb');
  const [borderRadius, setBorderRadius] = useState([8]);
  const [padding, setPadding] = useState([12]);
  const [fontSize, setFontSize] = useState([16]);
  const [fontWeight, setFontWeight] = useState([500]);
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [borderWidth, setBorderWidth] = useState([0]);
  const [borderColor, setBorderColor] = useState('#000000');
  const [hoverAnimation, setHoverAnimation] = useState('none');
  const [gradient, setGradient] = useState(false);
  const [gradientColor1, setGradientColor1] = useState('#ff7e5f');
  const [gradientColor2, setGradientColor2] = useState('#feb47b');
  const [glowColor, setGlowColor] = useState('#00ff00');
  const [glowIntensity, setGlowIntensity] = useState([5]);
  const [shadow, setShadow] = useState('none');
  const [textAlign, setTextAlign] = useState('center');
  const [buttonSize, setButtonSize] = useState('medium');
  const [isHovered, setIsHovered] = useState(false);

  // Button size presets
  const sizePresets = {
    small: { padding: [8], fontSize: [14] },
    medium: { padding: [12], fontSize: [16] },
    large: { padding: [16], fontSize: [18] },
  };

  // Apply size preset
  const handleSizeChange = (size: string) => {
    setButtonSize(size);
    setPadding(sizePresets[size].padding);
    setFontSize(sizePresets[size].fontSize);
  };

  const glowStyle = glowIntensity[0] > 0 ? `0 0 ${glowIntensity[0]}px ${glowColor}` : 'none';
  const backgroundStyle = gradient
    ? `linear-gradient(45deg, ${gradientColor1}, ${gradientColor2})`
    : backgroundColor;

  const buttonStyle: React.CSSProperties = {
    background: isHovered ? hoverBgColor : backgroundStyle,
    color: textColor,
    borderRadius: `${borderRadius[0]}px`,
    padding: `${padding[0]}px ${padding[0] * 1.5}px`,
    fontSize: `${fontSize[0]}px`,
    fontWeight: fontWeight[0],
    fontFamily,
    border: `${borderWidth[0]}px solid ${borderColor}`,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: `${glowStyle}${
      shadow !== 'none' ? `, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` : ''
    }`,
   
    animation: isHovered && hoverAnimation !== 'none' ? `${hoverAnimation} 1s` : 'none',
  };

  const htmlCode = `<button class="custom-button">${buttonText}</button>`;
  const cssCode = `
@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}
@keyframes flip {
  0% { transform: perspective(400px) rotateY(0); }
  100% { transform: perspective(400px) rotateY(360deg); }
}
@keyframes fade {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}
@keyframes grow {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.custom-button {
  background: ${backgroundStyle} !important;
  color: ${textColor} !important;
  border-radius: ${borderRadius[0]}px !important;
  padding: ${padding[0]}px ${padding[0] * 1.5}px;
  font-size: ${fontSize[0]}px;
  font-weight: ${fontWeight[0]};
  font-family: ${fontFamily};
  border: ${borderWidth[0]}px solid ${borderColor};
  box-shadow: ${glowStyle}${shadow !== 'none' ? ', 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : ''};
  text-align: ${textAlign};
  transition: all 0.3s ease;
}
.custom-button:hover {
  background: ${hoverBgColor} !important;
  ${hoverAnimation !== 'none' ? `animation: ${hoverAnimation} 1s;` : ''}
}
`;

  const tailwindCode = `
<button class="
  rounded-${borderRadius[0]}
  px-${Math.round(padding[0] * 1.5 / 4)}
  py-${Math.round(padding[0] / 4)}
  text-${fontSize[0]}
  font-${fontWeight[0]}
  font-${fontFamily.toLowerCase().replace(/ /g, '-')}
  ${borderWidth[0] > 0 ? `border-${borderWidth[0]} border-[${borderColor}]` : ''}
  ${gradient ? `bg-gradient-to-r from-[${gradientColor1}] to-[${gradientColor2}]` : `bg-[${backgroundColor}]`}
  text-[${textColor}]
  hover:bg-[${hoverBgColor}]
  ${shadow !== 'none' ? 'shadow-md' : ''}
  ${glowIntensity[0] > 0 ? `shadow-[0_0_${glowIntensity[0]}px_${glowColor}]` : ''}
  text-${textAlign}
  ${hoverAnimation !== 'none' ? `hover:animate-${hoverAnimation}` : ''}
">
  ${buttonText}
</button>
`;

  const reactCode = `
import React from 'react';

const CustomButton = () => {
  const buttonStyle = {
    background: '${backgroundStyle}',
    color: '${textColor}',
    borderRadius: '${borderRadius[0]}px',
    padding: '${padding[0]}px ${padding[0] * 1.5}px',
    fontSize: '${fontSize[0]}px',
    fontWeight: ${fontWeight[0]},
    fontFamily: '${fontFamily}',
    border: '${borderWidth[0]}px solid ${borderColor}',
    boxShadow: '${glowStyle}${shadow !== 'none' ? ', 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : ''}',
    textAlign: '${textAlign}',
    transition: 'all 0.3s ease',
  };

  return (
    <button
      style={buttonStyle}
      className="custom-button"
      onMouseEnter={(e) => e.currentTarget.style.background = '${hoverBgColor}'}
      onMouseLeave={(e) => e.currentTarget.style.background = '${backgroundStyle}'}
    >
      ${buttonText}
    </button>
  );
};

export default CustomButton;
`;


  const reset = () => {
    setButtonText('Click Me');
    setBackgroundColor('#3b82f6');
    setTextColor('#ffffff');
    setHoverBgColor('#2563eb');
    setBorderRadius([8]);
    setPadding([12]);
    setFontSize([16]);
    setFontWeight([500]);
    setFontFamily('Roboto');
    setBorderWidth([0]);
    setBorderColor('#000000');
    setHoverAnimation('none');
    setGradient(false);
    setGradientColor1('#ff7e5f');
    setGradientColor2('#feb47b');
    setGlowColor('#00ff00');
    setGlowIntensity([5]);
    setShadow('none');
    setTextAlign('center');
    setButtonSize('medium');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      {/* Left: Tools */}
      <div className="md:w-1/2 md:max-h-screen md:overflow-y-auto space-y-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Text */}
            <div>
              <Label className="dark:text-white">Text</Label>
              <Input value={buttonText} onChange={e => setButtonText(e.target.value)} className="mt-2" />
            </div>
            {/* Font Style */}
            <div>
              <Label className="dark:text-white">Font Family</Label>
              <select
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value)}
                className="mt-2 p-2 w-full rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600"
              >
                <option value="Roboto">Roboto</option>
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
              </select>
            </div>
            {/* Font Size */}
            <div>
              <Label htmlFor="font-size-slider-btn" className="dark:text-white">Font Size ({fontSize[0]}px)</Label>
              <Slider id="font-size-slider-btn" value={fontSize} onValueChange={setFontSize} min={12} max={36} className="mt-2" aria-label="Font size" />
            </div>
            {/* Button Size Presets */}
            <div>
              <Label className="dark:text-white">Button Size</Label>
              <select
                value={buttonSize}
                onChange={e => handleSizeChange(e.target.value)}
                className="mt-2 p-2 w-full rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            {/* Border Radius */}
            <div>
              <Label htmlFor="border-radius-slider" className="dark:text-white">Border Radius ({borderRadius[0]}px)</Label>
              <Slider id="border-radius-slider" value={borderRadius} onValueChange={setBorderRadius} min={0} max={50} className="mt-2" aria-label="Border radius" />
            </div>
            {/* Border Effects */}
            <div>
              <Label htmlFor="border-width-slider" className="dark:text-white">Border Width ({borderWidth[0]}px)</Label>
              <Slider id="border-width-slider" value={borderWidth} onValueChange={setBorderWidth} min={0} max={10} className="mt-2" aria-label="Border width" />
              <Label htmlFor="border-color-input" className="dark:text-white mt-2">Border Color</Label>
              <Input id="border-color-input" type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="mt-2" aria-label="Border color" />
            </div>
            {/* Colors */}
            <div>
              <Label htmlFor="text-color-input" className="dark:text-white">Text Color</Label>
              <Input id="text-color-input" type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="mt-2" aria-label="Text color" />
              <Label htmlFor="bg-color-input" className="dark:text-white mt-2">Background Color</Label>
              <Input id="bg-color-input" type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="mt-2" aria-label="Background color" />
              <Label htmlFor="hover-bg-color-input" className="dark:text-white mt-2">Hover Background</Label>
              <Input id="hover-bg-color-input" type="color" value={hoverBgColor} onChange={e => setHoverBgColor(e.target.value)} className="mt-2" aria-label="Hover background color" />
            </div>
            {/* Gradient */}
            <div>
              <Label htmlFor="gradient-checkbox" className="dark:text-white">Gradient</Label>
              <input id="gradient-checkbox" type="checkbox" checked={gradient} onChange={e => setGradient(e.target.checked)} className="mt-2" />
              {gradient && <>
                <Label htmlFor="gradient-color-1-input" className="dark:text-white mt-2">Gradient Color 1</Label>
                <Input id="gradient-color-1-input" type="color" value={gradientColor1} onChange={e => setGradientColor1(e.target.value)} className="mt-2" aria-label="Gradient color 1" />
                <Label htmlFor="gradient-color-2-input" className="dark:text-white mt-2">Gradient Color 2</Label>
                <Input id="gradient-color-2-input" type="color" value={gradientColor2} onChange={e => setGradientColor2(e.target.value)} className="mt-2" aria-label="Gradient color 2" />
              </>}
            </div>
            {/* Glow */}
            <div>
              <Label htmlFor="glow-color-input" className="dark:text-white">Glow Color</Label>
              <Input id="glow-color-input" type="color" value={glowColor} onChange={e => setGlowColor(e.target.value)} className="mt-2" aria-label="Glow color" />
              <Label htmlFor="glow-intensity-slider" className="dark:text-white mt-2">Glow Intensity ({glowIntensity[0]}px)</Label>
              <Slider id="glow-intensity-slider" value={glowIntensity} onValueChange={setGlowIntensity} min={0} max={20} className="mt-2" aria-label="Glow intensity" />
            </div>
            {/* Shadow */}
            <div>
              <Label className="dark:text-white">Shadow</Label>
              <select
                value={shadow}
                onChange={e => setShadow(e.target.value)}
                className="mt-2 p-2 w-full rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600"
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
              </select>
            </div>
            {/* Text Alignment */}
            <div>
              <Label className="dark:text-white">Text Alignment</Label>
              <select
                value={textAlign}
                onChange={e => setTextAlign(e.target.value)}
                className="mt-2 p-2 w-full rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            {/* Hover Animations */}
            <div>
              <Label className="dark:text-white">Hover Animation</Label>
              <select
                value={hoverAnimation}
                onChange={e => setHoverAnimation(e.target.value)}
                className="mt-2 p-2 w-full rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600"
              >
                <option value="none">None</option>
                <option value="shake">Shake</option>
                <option value="pulse">Pulse</option>
                <option value="bounce">Bounce</option>
                <option value="flip">Flip</option>
                <option value="fade">Fade</option>
                <option value="grow">Grow</option>
              </select>
            </div>
            <Button onClick={reset} variant="outline" className="w-full mt-4">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right: Preview & Code */}
      <div className="md:w-1/2 space-y-6 md:sticky md:top-4">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader><CardTitle className="dark:text-white">Preview</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center p-10 bg-white dark:bg-gray-700">
            <button
              style={buttonStyle}
              className="custom-button"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {buttonText}
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader><CardTitle className="dark:text-white">Code</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* HTML */}
            <div>
              <Label className="dark:text-white">HTML</Label>
              <div className="overflow-x-auto p-2 bg-gray-100 dark:bg-gray-900 dark:text-white rounded">
                <pre>{htmlCode}</pre>
              </div>
              <CopyButton
                textToCopy={htmlCode}
                successMessage="HTML copied!"
                variant="default"
                size="sm"
                copyText="Copy HTML"
                className="mt-2 w-full"
              />
            </div>
            {/* CSS */}
            <div>
              <Label className="dark:text-white">CSS</Label>
              <div className="overflow-x-auto p-2 bg-gray-100 dark:bg-gray-900 dark:text-white rounded">
                <pre>{cssCode}</pre>
              </div>
              <CopyButton
                textToCopy={cssCode}
                successMessage="CSS copied!"
                variant="default"
                size="sm"
                copyText="Copy CSS"
                className="mt-2 w-full"
              />
            </div>
            {/* Tailwind */}
            <div>
              <Label className="dark:text-white">Tailwind</Label>
              <div className="overflow-x-auto p-2 bg-gray-100 dark:bg-gray-900 dark:text-white rounded">
                <pre>{tailwindCode}</pre>
              </div>
              <CopyButton
                textToCopy={tailwindCode}
                successMessage="Tailwind copied!"
                variant="default"
                size="sm"
                copyText="Copy Tailwind"
                className="mt-2 w-full"
              />
            </div>
            {/* React */}
            <div>
              <Label className="dark:text-white">React</Label>
              <div className="overflow-x-auto p-2 bg-gray-100 dark:bg-gray-900 dark:text-white rounded">
                <pre>{reactCode}</pre>
              </div>
              <CopyButton
                textToCopy={reactCode}
                successMessage="React copied!"
                variant="default"
                size="sm"
                copyText="Copy React"
                className="mt-2 w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ButtonGenerator;