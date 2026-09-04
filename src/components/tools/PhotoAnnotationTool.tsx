'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Download, Trash2, AlignLeft, AlignCenter, AlignRight, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import Draggable from 'react-draggable';

interface Annotation {
  id: string;
  type: 'text' | 'watermark' | 'image';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  opacity?: number;
  rotation?: number;
  backgroundColor?: string;
  showBackground?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  effect?: 'none' | 'shadow' | 'border' | 'glow';
  isTextWatermark?: boolean;
}

const PhotoAnnotationTool: React.FC = () => {
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation>>({
    type: 'text',
    content: '',
    x: 50,
    y: 50,
    width: 200,
    height: 50,
    fontSize: 20,
    fontFamily: 'Arial',
    color: '#000000',
    opacity: 1,
    rotation: 0,
    backgroundColor: '#ffffff',
    showBackground: false,
    textAlign: 'left',
    effect: 'none',
    isTextWatermark: false,
  });
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [activeAnnotationType, setActiveAnnotationType] = useState<'text' | 'watermark' | 'image' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);

  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  ];

  const effectOptions = [
    { value: 'none', label: 'None' },
    { value: 'shadow', label: 'Shadow' },
    { value: 'border', label: 'Border' },
    { value: 'glow', label: 'Glow' },
  ];

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      const img = new Image();
      img.onload = () => {
        setBaseImage(img);
        toast.success('Image uploaded successfully!');
      };
      img.src = URL.createObjectURL(file);
    }
  }, []);

  const handleOverlayUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: activeAnnotationType || 'image',
          content: e.target?.result as string,
          x: 50,
          y: 50,
          width: 200,
          height: 50,
          opacity: 1,
          rotation: 0,
        };
        setAnnotations((prev) => [...prev, newAnnotation]);
        toast.success(`${activeAnnotationType === 'watermark' ? 'Watermark' : 'Image'} loaded!`);
      };
      reader.readAsDataURL(file);
    }
  }, [activeAnnotationType]);

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann))
    );
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
    toast.success('Annotation removed!');
  };

  const handleDrag = (id: string, e: any, data: any) => {
    updateAnnotation(id, { x: data.x, y: data.y });
  };

  const addTextAnnotation = (type: 'text' | 'watermark', isTextWatermark: boolean = false) => {
    setActiveAnnotationType(type);
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type,
      content: '',
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      fontSize: 20,
      fontFamily: 'Arial',
      color: '#000000',
      opacity: 1,
      rotation: 0,
      backgroundColor: '#ffffff',
      showBackground: false,
      textAlign: 'left',
      effect: 'none',
      isTextWatermark,
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
    setCurrentAnnotation(newAnnotation);
  };

  const drawCanvas = useCallback(async () => {
    if (!baseImage || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxWidth = window.innerWidth < 768 ? window.innerWidth - 40 : window.innerWidth * 0.6;
    const scale = baseImage.width > maxWidth ? maxWidth / baseImage.width : 1;
    canvas.width = baseImage.width * scale;
    canvas.height = baseImage.height * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    for (const annotation of annotations) {
      ctx.save();
      ctx.translate(
        (annotation.x + annotation.width / 2) * scale,
        (annotation.y + annotation.height / 2) * scale
      );
      ctx.rotate((annotation.rotation * Math.PI) / 180);
      ctx.globalAlpha = annotation.opacity || 1;

      if (annotation.type === 'text' || (annotation.type === 'watermark' && annotation.isTextWatermark)) {
        const scaledFontSize = (annotation.fontSize || 20) * scale;
        ctx.font = `${scaledFontSize}px ${annotation.fontFamily || 'Arial'}`;
        ctx.textAlign = annotation.textAlign || 'left';
        ctx.fillStyle = annotation.color || '#000000';

        const textMetrics = ctx.measureText(annotation.content);
        const textWidth = textMetrics.width;
        const textHeight = scaledFontSize;

        if (annotation.showBackground) {
          ctx.fillStyle = annotation.backgroundColor || '#ffffff';
          const padding = 4 * scale;
          ctx.fillRect(
            -textWidth / 2 - padding,
            -textHeight - padding,
            textWidth + padding * 2,
            textHeight + padding * 2
          );
        }

        if (annotation.effect === 'shadow') {
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
        } else if (annotation.effect === 'border') {
          ctx.strokeStyle = annotation.color || '#000000';
          ctx.lineWidth = 1;
          ctx.strokeText(annotation.content, -textWidth / 2, 0);
        } else if (annotation.effect === 'glow') {
          ctx.shadowColor = annotation.color || '#000000';
          ctx.shadowBlur = 8;
        }

        ctx.fillStyle = annotation.color || '#000000';
        ctx.fillText(annotation.content, -textWidth / 2, 0);
      } else if (annotation.type === 'image' || (annotation.type === 'watermark' && !annotation.isTextWatermark)) {
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.drawImage(
              img,
              (-annotation.width / 2) * scale,
              (-annotation.height / 2) * scale,
              annotation.width * scale,
              annotation.height * scale
            );
            resolve();
          };
          img.src = annotation.content;
        });
      }

      ctx.restore();
    }
  }, [baseImage, annotations]);

  useEffect(() => {
    if (baseImage) {
      drawCanvas();
    }
  }, [baseImage, annotations, drawCanvas]);

  const downloadImage = async () => {
    if (!baseImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = baseImage.width;
    canvas.height = baseImage.height;

    ctx.drawImage(baseImage, 0, 0);

    for (const annotation of annotations) {
      ctx.save();
      ctx.translate(
        annotation.x + annotation.width / 2,
        annotation.y + annotation.height / 2
      );
      ctx.rotate((annotation.rotation * Math.PI) / 180);
      ctx.globalAlpha = annotation.opacity || 1;

      if (annotation.type === 'text' || (annotation.type === 'watermark' && annotation.isTextWatermark)) {
        ctx.font = `${annotation.fontSize || 20}px ${annotation.fontFamily || 'Arial'}`;
        ctx.textAlign = annotation.textAlign || 'left';
        ctx.fillStyle = annotation.color || '#000000';

        const textMetrics = ctx.measureText(annotation.content);
        const textWidth = textMetrics.width;
        const textHeight = annotation.fontSize || 20;

        if (annotation.showBackground) {
          ctx.fillStyle = annotation.backgroundColor || '#ffffff';
          const padding = 4;
          ctx.fillRect(
            -textWidth / 2 - padding,
            -textHeight - padding,
            textWidth + padding * 2,
            textHeight + padding * 2
          );
        }

        if (annotation.effect === 'shadow') {
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
        } else if (annotation.effect === 'border') {
          ctx.strokeStyle = annotation.color || '#000000';
          ctx.lineWidth = 1;
          ctx.strokeText(annotation.content, -textWidth / 2, 0);
        } else if (annotation.effect === 'glow') {
          ctx.shadowColor = annotation.color || '#000000';
          ctx.shadowBlur = 8;
        }

        ctx.fillStyle = annotation.color || '#000000';
        ctx.fillText(annotation.content, -textWidth / 2, 0);
      } else if (annotation.type === 'image' || (annotation.type === 'watermark' && !annotation.isTextWatermark)) {
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.drawImage(
              img,
              -annotation.width / 2,
              -annotation.height / 2,
              annotation.width,
              annotation.height
            );
            resolve();
          };
          img.src = annotation.content;
        });
      }

      ctx.restore();
    }

    const link = document.createElement('a');
    link.download = `annotated-photo.${downloadFormat}`;
    link.href = canvas.toDataURL(`image/${downloadFormat}`);
    link.click();
    toast.success('Image downloaded successfully!');
  };

  const addCurrentDate = (id: string) => {
    const today = new Date().toLocaleDateString();
    updateAnnotation(id, {
      content: annotations.find((ann) => ann.id === id)?.content + (annotations.find((ann) => ann.id === id)?.content ? '\n' : '') + `Date: ${today}`,
    });
  };

  return (
    <div className="w-full p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Photo Annotation Tool</CardTitle>
          <CardDescription>
            Add text, watermarks, or images to your photos with real-time editing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!baseImage && (
            <div className="text-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto"
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Base Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {baseImage && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  onClick={() => addTextAnnotation('text')}
                  variant="outline"
                >
                  Add Text
                </Button>
                <Button
                  onClick={() => setActiveAnnotationType('watermark')}
                  variant="outline"
                >
                  Add Watermark
                </Button>
                <Button
                  onClick={() => setActiveAnnotationType('image')}
                  variant="outline"
                >
                  Add Image
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Annotation Controls</h3>
                  {annotations.length > 0 && (
                    <div className="space-y-2">
                      {annotations.map((annotation) => (
                        <div key={annotation.id} className="border rounded p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {annotation.type === 'text' || (annotation.type === 'watermark' && annotation.isTextWatermark)
                                ? 'Text'
                                : annotation.type === 'watermark'
                                ? 'Watermark Image'
                                : 'Image'}
                            </span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeAnnotation(annotation.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {(annotation.type === 'text' || (annotation.type === 'watermark' && annotation.isTextWatermark)) && (
                            <div className="space-y-3">
                              <div>
                                <Label>Text Content</Label>
                                <Textarea
                                  value={annotation.content}
                                  onChange={(e) =>
                                    updateAnnotation(annotation.id, { content: e.target.value })
                                  }
                                  placeholder="Enter text..."
                                  rows={3}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addCurrentDate(annotation.id)}
                                  className="mt-2"
                                >
                                  Add Current Date
                                </Button>
                              </div>

                              <div>
                                <Label>Font Family</Label>
                                <Select
                                  value={annotation.fontFamily}
                                  onValueChange={(value) =>
                                    updateAnnotation(annotation.id, { fontFamily: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {fontOptions.map((font) => (
                                      <SelectItem key={font.value} value={font.value}>
                                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label>Font Size</Label>
                                  <Input
                                    type="number"
                                    value={annotation.fontSize}
                                    onChange={(e) =>
                                      updateAnnotation(annotation.id, {
                                        fontSize: parseInt(e.target.value) || 20,
                                      })
                                    }
                                    min={8}
                                    max={200}
                                  />
                                </div>
                                <div>
                                  <Label>Text Color</Label>
                                  <Input
                                    type="color"
                                    value={annotation.color}
                                    onChange={(e) =>
                                      updateAnnotation(annotation.id, { color: e.target.value })
                                    }
                                  />
                                </div>
                              </div>

                              <div>
                                <Label>Opacity</Label>
                                <Input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={annotation.opacity}
                                  onChange={(e) =>
                                    updateAnnotation(annotation.id, {
                                      opacity: parseFloat(e.target.value),
                                    })
                                  }
                                />
                              </div>

                              <div>
                                <Label>Rotation</Label>
                                <Input
                                  type="number"
                                  value={annotation.rotation}
                                  onChange={(e) =>
                                    updateAnnotation(annotation.id, {
                                      rotation: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  min={-360}
                                  max={360}
                                />
                              </div>

                              <div>
                                <Label>Text Alignment</Label>
                                <div className="flex gap-1 mt-1">
                                  <Button
                                    size="sm"
                                    variant={annotation.textAlign === 'left' ? 'default' : 'outline'}
                                    onClick={() =>
                                      updateAnnotation(annotation.id, { textAlign: 'left' })
                                    }
                                  >
                                    <AlignLeft className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={annotation.textAlign === 'center' ? 'default' : 'outline'}
                                    onClick={() =>
                                      updateAnnotation(annotation.id, { textAlign: 'center' })
                                    }
                                  >
                                    <AlignCenter className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={annotation.textAlign === 'right' ? 'default' : 'outline'}
                                    onClick={() =>
                                      updateAnnotation(annotation.id, { textAlign: 'right' })
                                    }
                                  >
                                    <AlignRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label>Text Effect</Label>
                                <Select
                                  value={annotation.effect}
                                  onValueChange={(value) =>
                                    updateAnnotation(annotation.id, {
                                      effect: value as Annotation['effect'],
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {effectOptions.map((effect) => (
                                      <SelectItem key={effect.value} value={effect.value}>
                                        {effect.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`showBackground-${annotation.id}`}
                                    checked={annotation.showBackground}
                                    onCheckedChange={(checked) =>
                                      updateAnnotation(annotation.id, {
                                        showBackground: checked === true,
                                      })
                                    }
                                  />
                                  <Label htmlFor={`showBackground-${annotation.id}`}>
                                    Add background rectangle
                                  </Label>
                                </div>
                                {annotation.showBackground && (
                                  <div>
                                    <Label>Background Color</Label>
                                    <Input
                                      type="color"
                                      value={annotation.backgroundColor}
                                      onChange={(e) =>
                                        updateAnnotation(annotation.id, {
                                          backgroundColor: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {(annotation.type === 'image' || (annotation.type === 'watermark' && !annotation.isTextWatermark)) && (
                            <div className="space-y-3">
                              <div>
                                <Button
                                  onClick={() => overlayInputRef.current?.click()}
                                  variant="outline"
                                  className="w-full"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Replace {annotation.type === 'watermark' ? 'Watermark' : 'Image'}
                                </Button>
                                <input
                                  ref={overlayInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleOverlayUpload}
                                  className="hidden"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label>Width</Label>
                                  <Input
                                    type="number"
                                    value={annotation.width}
                                    onChange={(e) =>
                                      updateAnnotation(annotation.id, {
                                        width: parseInt(e.target.value) || 200,
                                      })
                                    }
                                    min={10}
                                  />
                                </div>
                                <div>
                                  <Label>Height</Label>
                                  <Input
                                    type="number"
                                    value={annotation.height}
                                    onChange={(e) =>
                                      updateAnnotation(annotation.id, {
                                        height: parseInt(e.target.value) || 50,
                                      })
                                    }
                                    min={10}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Opacity</Label>
                                <Input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={annotation.opacity}
                                  onChange={(e) =>
                                    updateAnnotation(annotation.id, {
                                      opacity: parseFloat(e.target.value),
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Rotation</Label>
                                <Input
                                  type="number"
                                  value={annotation.rotation}
                                  onChange={(e) =>
                                    updateAnnotation(annotation.id, {
                                      rotation: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  min={-360}
                                  max={360}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeAnnotationType === 'watermark' && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Add New Watermark</h4>
                      <div>
                        <Label>Watermark Type</Label>
                        <Select
                          value={currentAnnotation.isTextWatermark ? 'text' : 'image'}
                          onValueChange={(value) => {
                            if (value === 'text') {
                              addTextAnnotation('watermark', true);
                            } else {
                              setCurrentAnnotation((prev) => ({
                                ...prev,
                                isTextWatermark: false,
                              }));
                              overlayInputRef.current?.click();
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Watermark</SelectItem>
                            <SelectItem value="image">Logo/Image Watermark</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Live Preview</h3>
                  <div className="relative flex justify-center">
                    <canvas
                      ref={previewCanvasRef}
                      className="max-w-full border border-border rounded-lg"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    {annotations.map((annotation) => (
                      <Draggable
                        key={annotation.id}
                        position={{ x: annotation.x, y: annotation.y }}
                        onStop={(e, data) => handleDrag(annotation.id, e, data)}
                        bounds="parent"
                      >
                        <div
                          className="absolute cursor-move select-none"
                          style={{
                            width: annotation.width,
                            height: annotation.height,
                            transform: `rotate(${annotation.rotation}deg)`,
                            opacity: annotation.opacity,
                          }}
                        >
                          {annotation.type === 'text' || (annotation.type === 'watermark' && annotation.isTextWatermark) ? (
                            <div
                              style={{
                                fontFamily: annotation.fontFamily,
                                fontSize: annotation.fontSize,
                                color: annotation.color,
                                textAlign: annotation.textAlign,
                                background: annotation.showBackground
                                  ? annotation.backgroundColor
                                  : 'transparent',
                                padding: annotation.showBackground ? '4px' : '0',
                                boxShadow:
                                  annotation.effect === 'shadow'
                                    ? '2px 2px 4px rgba(0,0,0,0.5)'
                                    : annotation.effect === 'glow'
                                    ? `0 0 8px ${annotation.color}`
                                    : 'none',
                                border:
                                  annotation.effect === 'border'
                                    ? `1px solid ${annotation.color}`
                                    : 'none',
                              }}
                            >
                              {annotation.content}
                            </div>
                          ) : (
                            <img
                              src={annotation.content}
                              alt="Annotation"
                              style={{ width: '100%', height: '100%' }}
                            />
                          )}
                        </div>
                      </Draggable>
                    ))}
                  </div>
                </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-4 items-center justify-center flex-wrap">
                <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={downloadImage}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoAnnotationTool;
