'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Trash2, Smartphone, Tablet, Monitor } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';
import { useToast } from '@/hooks/use-toast';

type ViewportType = 'mobile' | 'tablet' | 'desktop';

interface ViewportConfig {
  width: number;
  height: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const viewportConfigs: Record<ViewportType, ViewportConfig> = {
  mobile: {
    width: 375,
    height: 667,
    icon: Smartphone,
    label: 'Mobile (375×667)'
  },
  tablet: {
    width: 768,
    height: 1024,
    icon: Tablet,
    label: 'Tablet (768×1024)'
  },
  desktop: {
    width: 1920,
    height: 1080,
    icon: Monitor,
    label: 'Desktop (1920×1080)'
  }
};

const LivePreview = () => {
  const [html, setHtml] = useState('<h1>Hello World!</h1>\n<p>Start editing to see live preview.</p>');
  const [css, setCss] = useState('body {\n  font-family: Arial, sans-serif;\n  padding: 20px;\n  margin: 0;\n}\n\nh1 {\n  color: #333;\n}');
  const [js, setJs] = useState('// Write your JavaScript code here\nconsole.log("Hello from JavaScript!");');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [viewport, setViewport] = useState<ViewportType>('desktop');
  const [previewContainerRef, setPreviewContainerRef] = useState<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Calculate scale based on container size and viewport size
  useEffect(() => {
    if (!previewContainerRef) return;

    const updateScale = () => {
      // Wrap DOM measurements in requestAnimationFrame to prevent forced reflow
      requestAnimationFrame(() => {
        const container = previewContainerRef;
        if (!container) return;

        // Account for padding (24px on each side = 48px total)
        const padding = 48;
        const containerWidth = Math.max(container.clientWidth - padding, 200);
        const containerHeight = Math.max(container.clientHeight - padding, 200);
        const config = viewportConfigs[viewport];

        // Calculate scale to fit both width and height, with some margin
        const scaleX = containerWidth / config.width;
        const scaleY = containerHeight / config.height;
        const calculatedScale = Math.min(scaleX, scaleY, 1); // Never scale up, only down

        setScale(Math.max(0.2, calculatedScale)); // Minimum scale of 20%
      });
    };

    // Delay initial measurement to avoid blocking initial paint
    const timeoutId = setTimeout(() => {
      updateScale();
    }, 0);

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });
    resizeObserver.observe(previewContainerRef);

    // Also listen to window resize with throttling
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateScale, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [viewport, previewContainerRef]);

  const updatePreview = useCallback(() => {
    if (!iframeRef.current) {
      return;
    }

    try {
      const config = viewportConfigs[viewport];
      const combinedCode = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=${config.width}, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Live Preview</title>
    <style>
      ${css || ''}
    </style>
  </head>
  <body>
    ${html || ''}
    <script>
      (function() {
        try {
          ${js || ''}
        } catch (error) {
          console.error('JavaScript Error:', error);
          const errorDiv = document.createElement('div');
          errorDiv.style.cssText = 'color: red; background: #ffe6e6; padding: 10px; margin: 10px 0; border: 1px solid red; border-radius: 4px; font-family: monospace;';
          errorDiv.textContent = 'JavaScript Error: ' + error.message;
          document.body.appendChild(errorDiv);
        }
      })();
    </script>
  </body>
</html>`;

      const iframe = iframeRef.current;
      
      // Use srcdoc for safe sandboxed execution
      if ('srcdoc' in iframe) {
        iframe.srcdoc = combinedCode;
      } else {
        // Fallback for older browsers
        const iframeElement = iframe as HTMLIFrameElement;
        const doc = iframeElement.contentDocument || (iframeElement.contentWindow?.document);
        if (doc) {
          doc.open();
          doc.write(combinedCode);
          doc.close();
        }
      }
    } catch (error) {
      console.error('Preview update error:', error);
      toast({
        title: 'Preview Error',
        description: 'An error occurred while updating the preview.',
        variant: 'destructive',
      });
    }
  }, [html, css, js, viewport, toast]);

  // Debounced auto-update
  useEffect(() => {
    if (!autoUpdate) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer with 300ms debounce
    debounceTimerRef.current = setTimeout(() => {
      updatePreview();
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, css, js, autoUpdate]);

  // Initial preview load
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview();
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    updatePreview();
    toast({
      title: 'Preview Refreshed',
      description: 'The preview has been manually updated.',
    });
  };

  const handleClear = () => {
    setHtml('');
    setCss('');
    setJs('');
    toast({
      title: 'Editor Cleared',
      description: 'All code editors have been cleared.',
    });
  };

  const getCombinedCode = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <style>
${css || ''}
  </style>
</head>
<body>
${html || ''}
<script>
${js || ''}
</script>
</body>
</html>`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Live HTML Previewer</CardTitle>
          <CardDescription>
            Instantly preview HTML, CSS, and JavaScript code online. Real-time rendering with auto-update on change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold">Code Editor</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={handleRefresh} 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={handleClear} 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  id="auto-update"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="auto-update" className="cursor-pointer text-muted-foreground">
                  Auto-update preview on change
                </Label>
              </div>
              
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="js">JavaScript</TabsTrigger>
                </TabsList>
                
                <TabsContent value="html" className="space-y-2">
                  <Label htmlFor="html-code">HTML Code</Label>
                  <Textarea
                    id="html-code"
                    placeholder="Enter your HTML code here..."
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                </TabsContent>
                
                <TabsContent value="css" className="space-y-2">
                  <Label htmlFor="css-code">CSS Code</Label>
                  <Textarea
                    id="css-code"
                    placeholder="Enter your CSS code here..."
                    value={css}
                    onChange={(e) => setCss(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                </TabsContent>
                
                <TabsContent value="js" className="space-y-2">
                  <Label htmlFor="js-code">JavaScript Code</Label>
                  <Textarea
                    id="js-code"
                    placeholder="Enter your JavaScript code here..."
                    value={js}
                    onChange={(e) => setJs(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap gap-2">
                <CopyButton
                  textToCopy={getCombinedCode()}
                  successMessage="HTML code copied to clipboard"
                  size="sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold">Live Preview</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={viewport} onValueChange={(value: ViewportType) => setViewport(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(viewportConfigs).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {!autoUpdate && (
                    <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Update Preview
                    </Button>
                  )}
                </div>
              </div>
              
              <div 
                ref={setPreviewContainerRef}
                className="border rounded-lg bg-gray-100 dark:bg-gray-800 relative"
                style={{ minHeight: '500px', maxHeight: '80vh', overflow: 'auto' }}
              >
                <div 
                  className="flex items-start justify-center"
                  style={{ 
                    padding: '24px',
                    minHeight: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <div
                    style={{
                      width: `${viewportConfigs[viewport].width}px`,
                      height: `${viewportConfigs[viewport].height}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.2s ease',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      flexShrink: 0,
                    }}
                  >
                    <iframe
                      ref={iframeRef}
                      className="bg-white"
                      title="Live HTML Preview"
                      sandbox="allow-scripts allow-same-origin"
                      style={{ 
                        width: `${viewportConfigs[viewport].width}px`,
                        height: `${viewportConfigs[viewport].height}px`,
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        display: 'block',
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                Viewport: {viewportConfigs[viewport].width}×{viewportConfigs[viewport].height} 
                {scale < 1 && ` • Scaled to ${Math.round(scale * 100)}% to fit`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LivePreview;
