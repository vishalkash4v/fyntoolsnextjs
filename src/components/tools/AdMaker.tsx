'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Download,
  ImagePlus,
  Loader2,
  Megaphone,
  Mic,
  Music,
  Pause,
  Play,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/seo/site';
import {
  AD_CATEGORIES,
  AD_LANGUAGES,
  AD_TONES,
  MAX_IMAGES,
  ORIENTATIONS,
  orientationSize,
} from '@/lib/admaker/constants';
import { buildAiImagePrompt, fetchPollinationsImage } from '@/lib/admaker/pollinations';
import { renderAdVideo } from '@/lib/admaker/renderVideo';
import {
  createSceneId,
  scenesFromApi,
  useAdMakerStore,
  type AdMediaItem,
} from '@/lib/admaker/store';
import { PREMIUM_VOICES, groupVoicesByLanguage } from '@/lib/tts/voices';

function uid() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

const STEPS = [
  { n: 1 as const, title: 'Campaign', desc: 'Setup & branding' },
  { n: 2 as const, title: 'Visuals', desc: 'Images & modes' },
  { n: 3 as const, title: 'Script', desc: 'Scenes timeline' },
  { n: 4 as const, title: 'Studio', desc: 'Preview & audio' },
  { n: 5 as const, title: 'Render', desc: 'Download MP4' },
];

const AdMaker: React.FC = () => {
  const store = useAdMakerStore();
  const {
    step,
    projectName,
    category,
    subCategory,
    language,
    tone,
    productBrief,
    orientation,
    logo,
    mediaMode,
    targetImageCount,
    images,
    scenes,
    bgm,
    bgmVolume,
    voiceVolume,
    ttsVoiceId,
    isGeneratingCopy,
    isGeneratingImages,
    isGeneratingVoice,
    isRendering,
    renderProgress,
    renderMessage,
    outputUrl,
  } = store;

  const [aiPrompt, setAiPrompt] = useState('');
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewKey, setPreviewKey] = useState(0);
  const previewTimer = useRef<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgmInputRef = useRef<HTMLInputElement>(null);

  const categoryMeta = useMemo(
    () => AD_CATEGORIES.find((c) => c.id === category) || AD_CATEGORIES[0],
    [category]
  );
  const orient = orientationSize(orientation);
  const voiceGroups = useMemo(() => groupVoicesByLanguage(PREMIUM_VOICES), []);
  const aspectClass =
    orientation === 'portrait'
      ? 'aspect-[9/16] max-h-[520px]'
      : orientation === 'square'
        ? 'aspect-square max-h-[420px]'
        : 'aspect-video max-h-[420px]';

  useEffect(() => {
    return () => {
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
    };
  }, []);

  useEffect(() => {
    // Suggest TTS voice from language
    if (/hindi/i.test(language)) store.setTtsVoiceId('hi-IN-SwaraNeural');
    else if (/punjabi/i.test(language)) store.setTtsVoiceId('en-IN-NeerjaNeural');
    else if (/india/i.test(language)) store.setTtsVoiceId('en-IN-NeerjaNeural');
    else if (/us/i.test(language)) store.setTtsVoiceId('en-US-AriaNeural');
    else store.setTtsVoiceId('en-US-AriaNeural');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const stopPreview = () => {
    if (previewTimer.current) window.clearTimeout(previewTimer.current);
    previewTimer.current = null;
    setPreviewPlaying(false);
  };

  const playPreviewFrom = (startIdx: number) => {
    if (!scenes.length || !images.length) return;
    stopPreview();
    setPreviewPlaying(true);
    setPreviewIndex(startIdx);
    setPreviewKey((k) => k + 1);

    const run = (idx: number) => {
      setPreviewIndex(idx);
      setPreviewKey((k) => k + 1);
      const dur = Math.max(1.5, scenes[idx]?.duration || 3) * 1000;
      previewTimer.current = window.setTimeout(() => {
        if (idx + 1 < scenes.length) run(idx + 1);
        else stopPreview();
      }, dur);
    };
    run(startIdx);
  };

  const fileToItem = (file: File, source: 'upload' | 'ai'): AdMediaItem => ({
    id: uid(),
    name: file.name,
    blob: file,
    url: URL.createObjectURL(file),
    source,
  });

  const onPickImages = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) return toast.error(`Max ${MAX_IMAGES} images`);
    const picked = [...files].filter((f) => f.type.startsWith('image/')).slice(0, room);
    const items: AdMediaItem[] = [];
    for (const f of picked) {
      if (f.size > 12 * 1024 * 1024) {
        toast.error(`Skipped ${f.name} (>12MB)`);
        continue;
      }
      items.push(fileToItem(f, 'upload'));
    }
    store.addImages(items);
    toast.success(`Added ${items.length} local image(s)`);
  };

  const onPickLogo = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.includes('png') && !f.name.toLowerCase().endsWith('.png')) {
      toast.error('Please upload a PNG logo (transparency supported)');
      return;
    }
    store.setLogo(fileToItem(f, 'upload'));
    toast.success('Logo ready for watermark');
  };

  const onPickBgm = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) return toast.error('Audio must be under 20MB');
    store.setBgm(fileToItem(f, 'upload'));
    toast.success('Background music attached');
  };

  const generateAiImages = async (count: number) => {
    if (count <= 0) return;
    store.setGeneratingImages(true);
    try {
      const created: AdMediaItem[] = [];
      for (let i = 0; i < count; i++) {
        const prompt = buildAiImagePrompt({
          projectName,
          category: categoryMeta.label,
          subCategory,
          sceneHint: aiPrompt || scenes[i]?.textOverlay,
          index: images.length + i,
        });
        const blob = await fetchPollinationsImage(prompt, orientation);
        created.push({
          id: uid(),
          name: `ai-${Date.now()}-${i}.jpg`,
          blob,
          url: URL.createObjectURL(blob),
          source: 'ai',
        });
        store.setRenderProgress(Math.round(((i + 1) / count) * 100), `AI image ${i + 1}/${count}`);
      }
      store.addImages(created);
      toast.success(`Generated ${created.length} AI image(s)`);
    } catch (err) {
      toast.error((err as Error).message || 'AI image generation failed');
    } finally {
      store.setGeneratingImages(false);
      store.setRenderProgress(0, '');
    }
  };

  const fillImagesForMode = async () => {
    if (mediaMode === 'user') {
      if (!images.length) toast.error('Upload at least one image');
      return;
    }
    const need =
      mediaMode === 'ai'
        ? Math.max(0, targetImageCount - images.length)
        : Math.max(0, targetImageCount - images.length);
    if (mediaMode === 'ai' && images.length && images.every((i) => i.source === 'upload')) {
      // optional clear — keep uploads if any
    }
    if (need <= 0) {
      toast.message('Image quota already filled');
      return;
    }
    await generateAiImages(need);
  };

  const generateScript = async () => {
    if (!projectName.trim()) return toast.error('Enter a project name');
    store.setGeneratingCopy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admaker/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          category: categoryMeta.label,
          subCategory,
          language,
          tone,
          productBrief,
          sceneCount: Math.max(3, Math.min(8, targetImageCount || 5)),
          orientation,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Script generation failed');
      const next = scenesFromApi(json.data.scenes || []);
      store.setScenes(next);
      toast.success(`${next.length} scenes ready — edit freely`);
      store.setStep(3);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to generate script');
    } finally {
      store.setGeneratingCopy(false);
    }
  };

  const generateVoiceovers = async () => {
    if (!scenes.length) return toast.error('Generate a script first');
    store.setGeneratingVoice(true);
    try {
      for (let i = 0; i < scenes.length; i++) {
        const sc = scenes[i];
        const text = sc.ttsScript.trim() || sc.textOverlay.trim();
        if (!text) continue;
        const res = await fetch(`${API_BASE_URL}/tts/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: ttsVoiceId,
            rate: 0,
            pitch: 0,
            volume: 0,
          }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success || !json.data?.audioBase64) {
          throw new Error(json?.error || `Voiceover failed on scene ${i + 1}`);
        }
        const blob = base64ToBlob(json.data.audioBase64, json.data.mimeType || 'audio/mpeg');
        const url = URL.createObjectURL(blob);
        store.updateScene(sc.id, { voiceBlob: blob, voiceUrl: url });
        store.setRenderProgress(Math.round(((i + 1) / scenes.length) * 100), `VO ${i + 1}/${scenes.length}`);
      }
      toast.success('Voiceovers generated (local blobs)');
    } catch (err) {
      toast.error((err as Error).message || 'Voiceover generation failed');
    } finally {
      store.setGeneratingVoice(false);
      store.setRenderProgress(0, '');
    }
  };

  const handleRender = async () => {
    if (!scenes.length || !images.length) return toast.error('Need scenes + images');
    store.setRendering(true);
    store.setOutputUrl(null);
    try {
      const blob = await renderAdVideo({
        scenes,
        images,
        logo,
        bgm,
        bgmVolume,
        voiceVolume,
        projectName,
        orientation,
        onProgress: (pct, message) => store.setRenderProgress(pct, message),
      });
      store.setOutputUrl(URL.createObjectURL(blob));
      toast.success('MP4 ready');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Render failed');
    } finally {
      store.setRendering(false);
    }
  };

  const currentScene = scenes[previewIndex] || scenes[0];
  const currentImage =
    images[(currentScene?.imageIndex ?? 0) % Math.max(images.length, 1)] || images[0];

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-1">
            <Megaphone className="h-4 w-4" />
            AI Ad Maker
            <Badge variant="secondary" className="text-[10px]">
              5-step studio · $0 media hosting
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Campaign → visuals → script timeline → live studio preview → browser FFmpeg render.
            Images, logo, BGM and voiceovers stay on your device.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={store.resetProject}>
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STEPS.map((s) => (
          <button
            key={s.n}
            type="button"
            onClick={() => store.setStep(s.n)}
            className={`rounded-xl border px-2.5 py-2 text-left transition-colors ${
              step === s.n ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Step {s.n}</div>
            <div className="text-sm font-semibold">{s.title}</div>
            <div className="text-[11px] text-muted-foreground hidden md:block">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campaign configuration</CardTitle>
            <CardDescription>Name, niche, language, tone, orientation, and logo watermark.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Project name</Label>
              <Input
                value={projectName}
                onChange={(e) => store.setProjectName(e.target.value)}
                placeholder="e.g. Glow Lab Serum"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => {
                    store.setCategory(v);
                    const m = AD_CATEGORIES.find((c) => c.id === v);
                    if (m) store.setSubCategory(m.subs[0]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select value={subCategory} onValueChange={store.setSubCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryMeta.subs.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={store.setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_LANGUAGES.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => store.setTone(v as typeof tone)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_TONES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Orientation</Label>
              <div className="grid sm:grid-cols-3 gap-2">
                {ORIENTATIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => store.setOrientation(o.id)}
                    className={`rounded-xl border p-3 text-left ${
                      orientation === o.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="font-semibold text-sm">{o.label}</div>
                    <div className="text-xs text-muted-foreground">{o.hint}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {o.width}×{o.height}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Logo watermark (PNG)</Label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,.png"
                className="hidden"
                onChange={(e) => {
                  onPickLogo(e.target.files);
                  e.target.value = '';
                }}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                  <Upload className="mr-2 h-3.5 w-3.5" />
                  {logo ? 'Replace logo' : 'Upload logo'}
                </Button>
                {logo && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.url} alt="Logo" className="h-10 w-auto object-contain" />
                    <Button type="button" variant="ghost" size="sm" onClick={() => store.setLogo(null)}>
                      Remove
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Brief (optional)</Label>
              <Textarea
                value={productBrief}
                onChange={(e) => store.setProductBrief(e.target.value)}
                placeholder="Offer, audience, USP…"
                className="min-h-[80px]"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  if (!projectName.trim()) return toast.error('Project name required');
                  store.setStep(2);
                }}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visuals & media modes</CardTitle>
              <CardDescription>User uploads, AI fills, or full AI — all stored as local blobs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-2">
                {(
                  [
                    { id: 'user' as const, title: 'User only', desc: 'Upload up to 50 images' },
                    { id: 'combo' as const, title: 'Combo', desc: 'Upload some, AI fills the rest' },
                    { id: 'ai' as const, title: 'AI only', desc: 'Generate all from your campaign' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => store.setMediaMode(m.id)}
                    className={`rounded-xl border p-3 text-left ${
                      mediaMode === m.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="font-semibold text-sm">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </button>
                ))}
              </div>

              {(mediaMode === 'combo' || mediaMode === 'ai') && (
                <div className="space-y-2 max-w-sm">
                  <div className="flex justify-between text-sm">
                    <Label>Target image count</Label>
                    <span className="tabular-nums text-muted-foreground">{targetImageCount}</span>
                  </div>
                  <Slider
                    value={[targetImageCount]}
                    min={3}
                    max={12}
                    step={1}
                    onValueChange={(v) => store.setTargetImageCount(v[0] ?? 6)}
                  />
                </div>
              )}

              {mediaMode !== 'ai' && (
                <>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      void onPickImages(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      void onPickImages(e.dataTransfer.files);
                    }}
                    className="w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-8 text-center"
                  >
                    <Upload className="mx-auto h-7 w-7 text-primary mb-2" />
                    <div className="text-sm font-medium">Drop / browse images</div>
                    <div className="text-xs text-muted-foreground">
                      {images.length}/{MAX_IMAGES} · local only
                    </div>
                  </button>
                </>
              )}

              {(mediaMode === 'combo' || mediaMode === 'ai') && (
                <div className="space-y-2">
                  <Label>AI prompt hint (optional)</Label>
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. soft daylight bathroom shelf, glass dropper bottle"
                    className="min-h-[70px]"
                  />
                  <Button type="button" onClick={() => void fillImagesForMode()} disabled={isGeneratingImages}>
                    {isGeneratingImages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
                      </>
                    ) : (
                      <>
                        <ImagePlus className="mr-2 h-4 w-4" />
                        {mediaMode === 'ai' ? 'Generate AI images' : 'Fill remaining with AI'}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                  {images.map((img) => (
                    <div key={img.id} className="relative group aspect-video rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 rounded bg-black/70 p-1 opacity-0 group-hover:opacity-100"
                        onClick={() => store.removeImage(img.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-white" />
                      </button>
                      {img.source === 'ai' && (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-violet-600 text-white px-1 rounded">
                          AI
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => store.setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!images.length) return toast.error('Add images first');
                store.setStep(3);
              }}
            >
              Script editor <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  AI script & scene timeline
                </CardTitle>
                <CardDescription>
                  Gemini returns JSON scenes with on-screen copy + voiceover lines. Edit, reorder, set duration.
                </CardDescription>
              </div>
              <Button type="button" onClick={generateScript} disabled={isGeneratingCopy}>
                {isGeneratingCopy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate scenes
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {!scenes.length && (
                <p className="text-sm text-muted-foreground">
                  No scenes yet — generate a director-style script to populate the timeline.
                </p>
              )}
              {scenes.map((sc, idx) => (
                <div key={sc.id} className="rounded-xl border p-3 space-y-2 bg-card">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">Scene {idx + 1}</Badge>
                    <div className="flex gap-1">
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => store.moveScene(sc.id, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => store.moveScene(sc.id, 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Text overlay</Label>
                      <Input
                        value={sc.textOverlay}
                        onChange={(e) => store.updateScene(sc.id, { textOverlay: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">TTS / voiceover</Label>
                      <Input
                        value={sc.ttsScript}
                        onChange={(e) => store.updateScene(sc.id, { ttsScript: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Duration</span>
                        <span className="tabular-nums">{sc.duration.toFixed(1)}s</span>
                      </div>
                      <Slider
                        value={[sc.duration]}
                        min={2}
                        max={6}
                        step={0.5}
                        onValueChange={(v) => store.updateScene(sc.id, { duration: v[0] ?? 3 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Image</Label>
                      <Select
                        value={String(sc.imageIndex % Math.max(images.length, 1))}
                        onValueChange={(v) => store.updateScene(sc.id, { imageIndex: Number(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {images.map((img, i) => (
                            <SelectItem key={img.id} value={String(i)}>
                              Image {i + 1} {img.source === 'ai' ? '(AI)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              {scenes.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    store.setScenes([
                      ...scenes,
                      {
                        id: createSceneId(),
                        textOverlay: 'New scene',
                        ttsScript: 'New voiceover line',
                        duration: 3,
                        imageIndex: scenes.length % Math.max(images.length, 1),
                      },
                    ])
                  }
                >
                  Add scene
                </Button>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => store.setStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!scenes.length) return toast.error('Generate or add scenes');
                store.setStep(4);
              }}
            >
              Open studio <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live DOM preview</CardTitle>
                <CardDescription>Instant playback with CSS fade + slow zoom — no FFmpeg wait.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className={`relative mx-auto w-full ${aspectClass} overflow-hidden rounded-xl border bg-black`}
                >
                  {currentImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={previewKey}
                      src={currentImage.url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover animate-ad-kenburns"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logo.url}
                      alt=""
                      className="absolute top-3 right-3 h-10 w-auto max-w-[28%] object-contain opacity-85"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="rounded-lg bg-black/55 px-3 py-2 text-white text-sm sm:text-base font-semibold leading-snug">
                      {currentScene?.textOverlay || '—'}
                    </div>
                    <div className="mt-2 text-[11px] text-white/70">
                      Scene {previewIndex + 1}/{scenes.length || 1}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => (previewPlaying ? stopPreview() : playPreviewFrom(previewIndex))}
                    disabled={!scenes.length}
                  >
                    {previewPlaying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" /> Play preview
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => playPreviewFrom(0)} disabled={!scenes.length}>
                    Restart
                  </Button>
                </div>
                <style>{`
                  @keyframes ad-kenburns {
                    from { transform: scale(1); }
                    to { transform: scale(1.12); }
                  }
                  .animate-ad-kenburns {
                    animation: ad-kenburns 4s ease-out forwards;
                  }
                `}</style>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audio studio</CardTitle>
                <CardDescription>Background music + Edge neural voiceovers (via FYN TTS API).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Music className="h-4 w-4" /> Background music
                  </Label>
                  <input
                    ref={bgmInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a"
                    className="hidden"
                    onChange={(e) => {
                      onPickBgm(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => bgmInputRef.current?.click()}>
                      <Upload className="mr-2 h-3.5 w-3.5" />
                      {bgm ? 'Replace BGM' : 'Upload BGM'}
                    </Button>
                    {bgm && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => store.setBgm(null)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  {bgm && <audio controls src={bgm.url} className="w-full h-9" />}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>BGM volume</span>
                      <span>{bgmVolume}%</span>
                    </div>
                    <Slider value={[bgmVolume]} min={0} max={100} step={5} onValueChange={(v) => store.setBgmVolume(v[0] ?? 35)} />
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <Label className="flex items-center gap-2">
                    <Mic className="h-4 w-4" /> Voiceover (Edge TTS)
                  </Label>
                  <Select value={ttsVoiceId} onValueChange={store.setTtsVoiceId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {voiceGroups.map((g) => (
                        <React.Fragment key={g.language}>
                          {g.voices.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {g.language}: {v.name}
                            </SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Voice volume</span>
                      <span>{voiceVolume}%</span>
                    </div>
                    <Slider
                      value={[voiceVolume]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(v) => store.setVoiceVolume(v[0] ?? 100)}
                    />
                  </div>
                  <Button type="button" onClick={generateVoiceovers} disabled={isGeneratingVoice || !scenes.length}>
                    {isGeneratingVoice ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating VO…
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" /> Generate voiceover
                      </>
                    )}
                  </Button>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {scenes.map((sc, i) =>
                      sc.voiceUrl ? (
                        <div key={sc.id} className="flex items-center gap-2 text-xs">
                          <span className="w-14 shrink-0 text-muted-foreground">Scene {i + 1}</span>
                          <audio controls src={sc.voiceUrl} className="h-8 flex-1" />
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => store.setStep(3)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="button" onClick={() => store.setStep(5)}>
              Render MP4 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client-side FFmpeg render</CardTitle>
            <CardDescription>
              Ken Burns zoom + crossfades + logo/text (canvas-baked) + BGM/VO mix. VFS wiped after export.
              Output {orient.width}×{orient.height}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm grid sm:grid-cols-2 gap-2">
              <div>Scenes: {scenes.length}</div>
              <div>Images: {images.length}</div>
              <div>BGM: {bgm ? 'Yes' : 'No'}</div>
              <div>Voiceovers: {scenes.filter((s) => s.voiceBlob).length}/{scenes.length}</div>
            </div>
            {(isRendering || renderProgress > 0) && (
              <div className="space-y-2">
                <Progress value={renderProgress} />
                <p className="text-xs text-muted-foreground">{renderMessage || `${renderProgress}%`}</p>
              </div>
            )}
            {outputUrl && (
              <div className="space-y-3">
                <video src={outputUrl} controls className={`w-full max-w-xl rounded-xl border bg-black ${aspectClass}`} />
                <Button asChild>
                  <a href={outputUrl} download={`${projectName || 'fyntools-ad'}.mp4`}>
                    <Download className="mr-2 h-4 w-4" /> Download MP4
                  </a>
                </Button>
              </div>
            )}
            <div className="flex flex-wrap justify-between gap-2">
              <Button type="button" variant="outline" onClick={() => store.setStep(4)} disabled={isRendering}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" onClick={handleRender} disabled={isRendering || !scenes.length || !images.length}>
                {isRendering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rendering…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Render & download
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdMaker;
