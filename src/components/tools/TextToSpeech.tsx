'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Play,
  Pause,
  Square,
  Download,
  Loader2,
  Sparkles,
  Mic,
  Volume2,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/seo/site';
import { useTtsStore } from '@/lib/tts/store';
import {
  TTS_MAX_CHARS,
  PREMIUM_VOICES,
  alignWordsToText,
  findActiveWordIndex,
  groupVoicesByLanguage,
  type WordTiming,
} from '@/lib/tts/voices';

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

const TextToSpeech: React.FC = () => {
  const {
    text,
    mode,
    status,
    error,
    voiceId,
    rate,
    pitch,
    volume,
    activeWordIndex,
    words,
    audioUrl,
    setText,
    setMode,
    setStatus,
    setError,
    setVoiceId,
    setRate,
    setPitch,
    setVolume,
    setActiveWordIndex,
    setWords,
    setAudioUrl,
    resetPlayback,
  } = useTtsStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const rafRef = useRef<number | null>(null);

  const voiceGroups = useMemo(() => groupVoicesByLanguage(PREMIUM_VOICES), []);
  const charCount = text.length;
  const overLimit = charCount > TTS_MAX_CHARS;

  const stopRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const syncHighlight = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !words.length) return;
    const idx = findActiveWordIndex(words, audio.currentTime * 1000);
    setActiveWordIndex(idx);
    if (!audio.paused && !audio.ended) {
      rafRef.current = requestAnimationFrame(syncHighlight);
    }
  }, [words, setActiveWordIndex]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopRaf();
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
      resetPlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopEverything = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    stopRaf();
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setActiveWordIndex(-1);
    setStatus('idle');
  }, [setActiveWordIndex, setStatus]);

  const playPremiumAudio = useCallback(
    (url: string, aligned: WordTiming[]) => {
      setWords(aligned);
      setAudioUrl(url);
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = url;
      audio.onended = () => {
        stopRaf();
        setActiveWordIndex(-1);
        setStatus('idle');
      };
      audio.onerror = () => {
        setStatus('error');
        setError('Audio playback failed.');
        toast.error('Audio playback failed');
      };
      void audio.play().then(() => {
        setStatus('playing');
        stopRaf();
        rafRef.current = requestAnimationFrame(syncHighlight);
      });
    },
    [setWords, setAudioUrl, setStatus, setError, setActiveWordIndex, syncHighlight]
  );

  const synthesizePremium = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error('Enter some text to speak');
      return;
    }
    if (overLimit) {
      toast.error(`Keep text under ${TTS_MAX_CHARS.toLocaleString()} characters`);
      return;
    }

    stopEverything();
    setStatus('loading');
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 90000);

    try {
      const res = await fetch(`${API_BASE_URL}/tts/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          voice: voiceId,
          rate,
          pitch,
          volume,
        }),
        signal: controller.signal,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success || !json.data?.audioBase64) {
        throw new Error(json?.error || 'Failed to generate speech');
      }

      const blob = base64ToBlob(json.data.audioBase64, json.data.mimeType || 'audio/mpeg');
      const url = URL.createObjectURL(blob);
      const rawWords: WordTiming[] = Array.isArray(json.data.words) ? json.data.words : [];
      const aligned = alignWordsToText(trimmed, rawWords);
      playPremiumAudio(url, aligned);
      toast.success('Premium neural voice ready');
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      console.error(err);
      const message = (err as Error)?.message || 'Speech generation failed';
      setError(message);
      setStatus('error');
      toast.error(message);
    } finally {
      window.clearTimeout(timeout);
      abortRef.current = null;
    }
  }, [
    text,
    overLimit,
    voiceId,
    rate,
    pitch,
    volume,
    stopEverything,
    setStatus,
    setError,
    playPremiumAudio,
  ]);

  const speakFree = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error('Enter some text to speak');
      return;
    }
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Browser speech is not supported here');
      return;
    }

    stopEverything();
    setWords([]);
    setAudioUrl(null);
    setError(null);

    const utterance = new SpeechSynthesisUtterance(trimmed);
    // Map -50..50% ≈ 0.5..1.5 rate
    utterance.rate = Math.max(0.5, Math.min(1.5, 1 + rate / 100));
    // Map -20..20 Hz to pitch ~0.8..1.2
    utterance.pitch = Math.max(0.5, Math.min(2, 1 + pitch / 50));
    utterance.volume = Math.max(0.2, Math.min(1, 1 + volume / 100));
    utterance.onend = () => setStatus('idle');
    utterance.onerror = () => {
      setStatus('error');
      setError('Browser speech failed');
      toast.error('Browser speech failed');
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setStatus('playing');
  }, [text, rate, pitch, volume, stopEverything, setWords, setAudioUrl, setError, setStatus]);

  const handlePlayPause = () => {
    if (status === 'loading') return;

    if (mode === 'free') {
      if (status === 'playing') {
        window.speechSynthesis.pause();
        setStatus('paused');
        return;
      }
      if (status === 'paused') {
        window.speechSynthesis.resume();
        setStatus('playing');
        return;
      }
      speakFree();
      return;
    }

    // Premium
    const audio = audioRef.current;
    if (status === 'playing' && audio) {
      audio.pause();
      stopRaf();
      setStatus('paused');
      return;
    }
    if (status === 'paused' && audio?.src) {
      void audio.play().then(() => {
        setStatus('playing');
        rafRef.current = requestAnimationFrame(syncHighlight);
      });
      return;
    }
    void synthesizePremium();
  };

  const handleDownload = () => {
    if (!audioUrl) {
      toast.error('Generate premium audio first, then download');
      return;
    }
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `fyntools-tts-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success('MP3 download started');
  };

  const highlighted = useMemo(() => {
    if (!text || activeWordIndex < 0 || !words[activeWordIndex]) {
      return <span className="whitespace-pre-wrap break-words text-foreground/90">{text || ' '}</span>;
    }
    const w = words[activeWordIndex];
    const start = w.charStart ?? 0;
    const end = w.charEnd ?? start;
    return (
      <span className="whitespace-pre-wrap break-words text-foreground/90">
        {text.slice(0, start)}
        <mark className="rounded px-0.5 bg-violet-500/30 text-foreground ring-1 ring-violet-400/40">
          {text.slice(start, end) || w.text}
        </mark>
        {text.slice(end)}
      </span>
    );
  }, [text, words, activeWordIndex]);

  return (
    <div className="w-full space-y-4">
      <audio ref={audioRef} className="hidden" preload="auto" />

      {/* Mode switch */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === 'premium' ? 'default' : 'outline'}
          onClick={() => {
            stopEverything();
            setMode('premium');
          }}
          className="gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Premium neural
          <Badge variant="secondary" className="ml-1 text-[10px]">
            Free forever
          </Badge>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'free' ? 'default' : 'outline'}
          onClick={() => {
            stopEverything();
            setMode('free');
          }}
          className="gap-1.5"
        >
          <Mic className="h-3.5 w-3.5" />
          Free browser
        </Button>
        <p className="text-xs text-muted-foreground w-full sm:w-auto sm:ml-auto">
          {mode === 'premium'
            ? 'Microsoft Edge neural voices via FYN servers — no API key, no paywall.'
            : 'Uses your device’s built-in speech engine (offline, quality varies).'}
        </p>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-2 gap-0 min-h-[280px]">
            <div className="p-4 sm:p-5 space-y-2 border-b lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="tts-text" className="text-sm font-medium">
                  Your text
                </Label>
                <span
                  className={`text-xs tabular-nums ${
                    overLimit ? 'text-destructive font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {charCount.toLocaleString()} / {TTS_MAX_CHARS.toLocaleString()}
                </span>
              </div>
              <Textarea
                id="tts-text"
                placeholder="Paste an article, script, or notes… Premium mode highlights each word as it speaks."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[220px] resize-y text-sm leading-relaxed"
              />
            </div>

            <div className="p-4 sm:p-5 bg-muted/20 space-y-2">
              <Label className="text-sm font-medium">Live reading view</Label>
              <div className="min-h-[220px] rounded-lg border bg-background/80 p-4 text-sm leading-relaxed overflow-auto">
                {text.trim() ? (
                  highlighted
                ) : (
                  <p className="text-muted-foreground">
                    Spoken words appear highlighted here during Premium playback.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky-ish control bar */}
      <Card className="sticky bottom-2 z-20 shadow-lg border-primary/15">
        <CardContent className="p-3 sm:p-4 space-y-4">
          {mode === 'premium' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label className="text-xs text-muted-foreground">Voice</Label>
                <Select value={voiceId} onValueChange={setVoiceId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {voiceGroups.map((g) => (
                      <SelectGroup key={g.language}>
                        <SelectLabel>{g.language}</SelectLabel>
                        {g.voices.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name} · {v.gender}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Speed</span>
                  <span className="tabular-nums">{rate >= 0 ? `+${rate}%` : `${rate}%`}</span>
                </div>
                <Slider
                  value={[rate]}
                  min={-50}
                  max={50}
                  step={5}
                  onValueChange={(v) => setRate(v[0] ?? 0)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pitch</span>
                  <span className="tabular-nums">{pitch >= 0 ? `+${pitch}Hz` : `${pitch}Hz`}</span>
                </div>
                <Slider
                  value={[pitch]}
                  min={-20}
                  max={20}
                  step={1}
                  onValueChange={(v) => setPitch(v[0] ?? 0)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Volume2 className="h-3 w-3" /> Volume
                  </span>
                  <span className="tabular-nums">{volume >= 0 ? `+${volume}%` : `${volume}%`}</span>
                </div>
                <Slider
                  value={[volume]}
                  min={-50}
                  max={50}
                  step={5}
                  onValueChange={(v) => setVolume(v[0] ?? 0)}
                />
              </div>
            </div>
          )}

          {mode === 'free' && (
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Speed</span>
                  <span className="tabular-nums">{rate >= 0 ? `+${rate}%` : `${rate}%`}</span>
                </div>
                <Slider value={[rate]} min={-50} max={50} step={5} onValueChange={(v) => setRate(v[0] ?? 0)} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pitch</span>
                  <span className="tabular-nums">{pitch >= 0 ? `+${pitch}` : `${pitch}`}</span>
                </div>
                <Slider value={[pitch]} min={-20} max={20} step={1} onValueChange={(v) => setPitch(v[0] ?? 0)} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Volume</span>
                  <span className="tabular-nums">{volume >= 0 ? `+${volume}%` : `${volume}%`}</span>
                </div>
                <Slider
                  value={[volume]}
                  min={-50}
                  max={50}
                  step={5}
                  onValueChange={(v) => setVolume(v[0] ?? 0)}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={handlePlayPause}
              disabled={!text.trim() || overLimit || status === 'loading'}
              className="min-w-[120px]"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : status === 'playing' ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  {status === 'paused' ? 'Resume' : 'Play'}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={stopEverything}
              disabled={status === 'idle' && !audioUrl}
            >
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownload}
              disabled={mode !== 'premium' || !audioUrl}
              title={mode === 'free' ? 'MP3 export is available in Premium mode' : 'Download MP3'}
            >
              <Download className="mr-2 h-4 w-4" />
              Download MP3
            </Button>

            {status === 'loading' && (
              <span className="text-xs text-muted-foreground">Synthesizing neural audio…</span>
            )}
            {error && <span className="text-xs text-destructive">{error}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextToSpeech;
