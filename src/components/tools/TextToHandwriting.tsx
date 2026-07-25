'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { PenTool, Download, FileImage, FileText, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaperSize {
  name: string;
  width: number;
  height: number;
  category: string;
}

const paperSizes: PaperSize[] = [
  // A-Series (ISO 216 - used in India & most countries)
  { name: 'A4', width: 210, height: 297, category: 'A-Series (ISO 216)' },
  { name: 'A5', width: 148, height: 210, category: 'A-Series (ISO 216)' },
  { name: 'A6', width: 105, height: 148, category: 'A-Series (ISO 216)' },
  { name: 'A3', width: 297, height: 420, category: 'A-Series (ISO 216)' },
  { name: 'A2', width: 420, height: 594, category: 'A-Series (ISO 216)' },
  { name: 'A1', width: 594, height: 841, category: 'A-Series (ISO 216)' },
  { name: 'A0', width: 841, height: 1189, category: 'A-Series (ISO 216)' },
  // US/Canada Sizes
  { name: 'Letter', width: 216, height: 279, category: 'US/Canada' },
  { name: 'Legal', width: 216, height: 356, category: 'US/Canada' },
  { name: 'Tabloid', width: 279, height: 432, category: 'US/Canada' },
];

const TextToHandwriting = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [inputText, setInputText] = useState('Welcome to our handwriting tool! Type your text here and see it transform into beautiful handwriting instantly.');
  const [fontStyle, setFontStyle] = useState('"Kalam", cursive');
  const [fontSize, setFontSize] = useState([16]);
  const [lineHeight, setLineHeight] = useState([1.3]);
  const [quality, setQuality] = useState([2]);
  const [paperSize, setPaperSize] = useState('A4');
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);
  const [generatedPages, setGeneratedPages] = useState<string[]>([]);
  const { toast } = useToast();

  const getCurrentPaperSize = () => {
    return paperSizes.find(size => size.name === paperSize) || paperSizes[0];
  };

  const mmToPx = (mm: number, dpi: number = 96) => {
    return (mm * dpi) / 25.4;
  };

  const generateHandwriting = () => {
    if (!inputText.trim()) return;

    const currentPaperSize = getCurrentPaperSize();
    const pixelRatio = quality[0];
    const dpi = 96 * pixelRatio;

    // Convert mm to pixels
    const pageWidth = mmToPx(currentPaperSize.width, dpi);
    const pageHeight = mmToPx(currentPaperSize.height, dpi);
    const padding = mmToPx(20, dpi); // 20mm padding
    const marginX = mmToPx(25, dpi); // 25mm left margin

    const lines = inputText.split('\n');
    const lineSpacing = fontSize[0] * lineHeight[0] * pixelRatio;
    const maxWidth = pageWidth - marginX - padding;
    const maxLinesPerPage = Math.floor((pageHeight - padding * 2 - mmToPx(30, dpi)) / lineSpacing);

    // Process text and split into pages
    const pages: string[][] = [];
    let currentPage: string[] = [];
    let currentPageLines = 0;

    lines.forEach((line) => {
      if (!line.trim()) {
        if (currentPageLines < maxLinesPerPage) {
          currentPage.push('');
          currentPageLines++;
        } else {
          pages.push([...currentPage]);
          currentPage = [''];
          currentPageLines = 1;
        }
        return;
      }

      // Create temporary canvas to measure text
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCtx.font = `${fontSize[0] * pixelRatio}px ${fontStyle}`;
      const words = line.split(' ');
      let currentLine = '';

      words.forEach((word, wordIndex) => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const testWidth = tempCtx.measureText(testLine).width;

        if (testWidth > maxWidth && currentLine) {
          // Add current line and start new one
          if (currentPageLines >= maxLinesPerPage) {
            pages.push([...currentPage]);
            currentPage = [];
            currentPageLines = 0;
          }
          currentPage.push(currentLine);
          currentPageLines++;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      // Add remaining text
      if (currentLine) {
        if (currentPageLines >= maxLinesPerPage) {
          pages.push([...currentPage]);
          currentPage = [];
          currentPageLines = 0;
        }
        currentPage.push(currentLine);
        currentPageLines++;
      }
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    // Generate canvases for each page
    const newGeneratedPages: string[] = [];
    canvasRefs.current = [];

    pages.forEach((pageLines, pageIndex) => {
      const canvas = document.createElement('canvas');
      canvasRefs.current.push(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = pageWidth;
      canvas.height = pageHeight;

      // Enable anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageWidth, pageHeight);

      // Add lined paper effect
      ctx.strokeStyle = '#e8e8e8';
      ctx.lineWidth = 0.5 * pixelRatio;
      const startY = padding + mmToPx(20, dpi);
      for (let i = startY; i < pageHeight - padding; i += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(padding, i);
        ctx.lineTo(pageWidth - padding, i);
        ctx.stroke();
      }

      // Add margin line
      ctx.strokeStyle = '#ff9999';
      ctx.lineWidth = 0.8 * pixelRatio;
      ctx.beginPath();
      ctx.moveTo(marginX, padding);
      ctx.lineTo(marginX, pageHeight - padding);
      ctx.stroke();

      // Set text properties
      ctx.fillStyle = '#1a1a2e';
      ctx.font = `${fontSize[0] * pixelRatio}px ${fontStyle}`;
      ctx.textBaseline = 'alphabetic';

      // Draw text with handwriting variations
      let y = startY + fontSize[0] * pixelRatio * 0.8;

      pageLines.forEach((line) => {
        if (!line.trim()) {
          y += lineSpacing;
          return;
        }

        const words = line.split(' ');
        let x = marginX + mmToPx(5, dpi);

        words.forEach((word) => {
          const randomX = x + (Math.random() - 0.5) * 3 * pixelRatio;
          const randomY = y + (Math.random() - 0.5) * 4 * pixelRatio;
          const angle = (Math.random() - 0.5) * 0.04;

          ctx.save();
          ctx.translate(randomX, randomY);
          ctx.rotate(angle);

          const chars = word.split('');
          let charX = 0;
          chars.forEach((char) => {
            const charRandomX = charX + (Math.random() - 0.5) * 1 * pixelRatio;
            const charRandomY = (Math.random() - 0.5) * 2 * pixelRatio;
            ctx.fillText(char, charRandomX, charRandomY);
            charX += ctx.measureText(char).width + (Math.random() - 0.5) * 0.5 * pixelRatio;
          });

          ctx.restore();

          x += ctx.measureText(word + ' ').width + (Math.random() - 0.5) * 2 * pixelRatio;
        });

        y += lineSpacing;
      });

      // Convert to data URL
      newGeneratedPages.push(canvas.toDataURL('image/png', 1.0));
    });

    setGeneratedPages(newGeneratedPages);
  };

  // Auto-generate when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim()) {
        generateHandwriting();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputText, fontStyle, fontSize, lineHeight, quality, paperSize]);

  // Initial generation
  useEffect(() => {
    generateHandwriting();
  }, []);

const downloadImages = async () => {
  if (generatedPages.length === 0) {
    toast({
      title: "Error",
      description: "Please generate handwriting first.",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  setProgress(0);

  // If we only have one page, download it immediately as an image
  if (generatedPages.length === 1) {
    const link = document.createElement('a');
    link.download = `handwriting-${paperSize.toLowerCase()}.png`;
    link.href = generatedPages[0];
    link.click();
    setLoading(false);
  } else {
    // Multiple images - trigger download immediately
    // In this case, we will just download each page as a separate image
    generatedPages.forEach((pageDataUrl, index) => {
      const link = document.createElement('a');
      link.download = `handwriting-page-${index + 1}.png`;
      link.href = pageDataUrl;
      link.click();
    });

    setLoading(false);
    toast({
      title: "Downloaded!",
      description: `${generatedPages.length} page(s) downloaded successfully.`,
    });
  }
};

const downloadPDF = async () => {
  if (generatedPages.length === 0) {
    toast({
      title: "Error",
      description: "Please generate handwriting first.",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  setProgress(0);

  // Use the generated pages directly for PDF download (without further processing)
  try {
    const jsPDF = (await import('jspdf')).default;
    const currentPaperSize = getCurrentPaperSize();

    const pdf = new jsPDF({
      orientation: currentPaperSize.width > currentPaperSize.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [currentPaperSize.width, currentPaperSize.height],
    });

    generatedPages.forEach((pageDataUrl, index) => {
      if (index > 0) {
        pdf.addPage();
      }
      pdf.addImage(pageDataUrl, 'PNG', 0, 0, currentPaperSize.width, currentPaperSize.height);
    });

    pdf.save(`handwriting-${paperSize.toLowerCase()}-${generatedPages.length}pages.pdf`);

    setLoading(false);
    toast({
      title: "PDF Downloaded!",
      description: `${generatedPages.length} page PDF created successfully.`,
    });
  } catch (error) {
    setLoading(false);
    toast({
      title: "Error",
      description: "Failed to create PDF. Please try again.",
      variant: "destructive",
    });
  }
};

const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const text = e.target.value;
  const wordCount = text.trim().split(/\s+/).length; // Split by spaces to count words

  if (wordCount <= 500) {
    setInputText(text); // Update the input text only if word count is <= 500
  } else {
    // Optionally show a toast or error message
    toast({
      title: "Word limit reached",
      description: "You cannot enter more than 500 words.",
      variant: "destructive",
    });
  }
};


  const fontOptions = [
    { value: 'cursive', label: 'Cursive' },
    { value: '"Dancing Script", cursive', label: 'Dancing Script' },
    { value: '"Kalam", cursive', label: 'Kalam' },
    { value: '"Caveat", cursive', label: 'Caveat' },
    { value: '"Indie Flower", cursive', label: 'Indie Flower' },
    { value: '"Shadows Into Light", cursive', label: 'Shadows Into Light' },
    { value: '"Patrick Hand", cursive', label: 'Patrick Hand' },
    { value: '"Amatic SC", cursive', label: 'Amatic SC' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-6 w-6" />
            Text to Handwriting Converter
          </CardTitle>
          <CardDescription>
            Convert typed text into high-quality handwritten-style text with live preview and multiple page sizes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="input-text" className="block text-sm font-medium mb-2">
              Enter Your Text (Live Preview)
            </label>
            <Textarea
              id="input-text"
              placeholder="Type your text here and watch it transform into handwriting automatically..."
              value={inputText}
              
                onChange={handleInputChange} // Use handleInputChange instead of direct onChange
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Paper Size
              </label>
              <Select value={paperSize} onValueChange={setPaperSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (210×297mm)</SelectItem>
                  <SelectItem value="A5">A5 (148×210mm)</SelectItem>
                  <SelectItem value="A6">A6 (105×148mm)</SelectItem>
                  <SelectItem value="A3">A3 (297×420mm)</SelectItem>
                  <SelectItem value="Letter">Letter (8.5×11in)</SelectItem>
                  <SelectItem value="Legal">Legal (8.5×14in)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Font Style
              </label>
              <Select value={fontStyle} onValueChange={setFontStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Font Size: {fontSize[0]}px
              </label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                max={32}
                min={14}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Line Height: {lineHeight[0]}
              </label>
              <Slider
                value={lineHeight}
                onValueChange={setLineHeight}
                max={3}
                min={1.2}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quality: {quality[0]}x
              </label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                max={3}
                min={1}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>
          <Card className="bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recommended Settings</CardTitle>
              <CardDescription>
                You can change all options, but these defaults give the most realistic output.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-amber-900/90 dark:text-amber-100/90">
              Paper Size: A4, Font Style: Kalam, Font Size: 16px, Line Height: 1.3, Quality: 2x
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/20 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Live Handwriting Preview</CardTitle>
              <CardDescription>
                {generatedPages.length > 1
                  ? `${generatedPages.length} pages generated • ${getCurrentPaperSize().name} (${getCurrentPaperSize().width}×${getCurrentPaperSize().height}mm)`
                  : `1 page • ${getCurrentPaperSize().name} (${getCurrentPaperSize().width}×${getCurrentPaperSize().height}mm)`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {generatedPages.map((pageDataUrl, index) => (
                  <div key={index} className="flex justify-center">
                    <div className="relative">
                      <img
                        src={pageDataUrl}
                        alt={`Handwriting Page ${index + 1}`}
                        className="border rounded-lg shadow-sm bg-white max-w-full h-auto block mx-auto"
                        style={{ maxHeight: '300px' }}
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        Page {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={downloadImages} variant="outline" className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  Download Images {generatedPages.length > 1 && '(All at one time)'}
                </Button>
                <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
              {loading && (
                <div className="flex justify-center items-center space-x-2">
                  <div className="loader"></div> {/* Add your custom loader here */}
                  <span>Downloading... {Math.round(progress)}%</span>
                </div>
              )}

            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/20 border-blue-200 dark:border-blue-800/50">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Enhanced Quality Features</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                <li>• Live preview - see changes instantly as you type</li>
                <li>• Mobile-optimized responsive design</li>
                <li>• High-resolution output with anti-aliasing</li>
                <li>• Realistic character spacing and rotation</li>
                <li>• 8+ handwriting font styles available</li>
                <li>• Adjustable quality settings (1x to 3x)</li>
                <li>• Lined paper with margin lines</li>
                <li>• Natural handwriting variations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 dark:from-slate-900/40 dark:to-slate-800/30 border-slate-200/70 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg">Handwriting Samples</CardTitle>
              <CardDescription>
                See real output examples generated with this tool.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { src: "/handwrittensample1.png", label: "Sample 1" },
                  { src: "/handwrittensample2.png", label: "Sample 2" },
                  { src: "/handwrittensample3.png", label: "Sample 3" },
                  { src: "/handwrittensample4.png", label: "Sample 4" },
                ].map((sample) => (
                  <div key={sample.src} className="rounded-lg border bg-white/80 dark:bg-slate-900/40 p-2">
                    <img
                      src={sample.src}
                      alt={`Handwriting ${sample.label}`}
                      className="w-full h-auto rounded-md"
                      loading="lazy"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">{sample.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextToHandwriting;
