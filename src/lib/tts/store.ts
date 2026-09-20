'use client';

import { create } from 'zustand';
import { PREMIUM_VOICES, type WordTiming } from '@/lib/tts/voices';

export type TtsMode = 'free' | 'premium';
export type TtsStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

type TtsState = {
  text: string;
  mode: TtsMode;
  status: TtsStatus;
  error: string | null;
  voiceId: string;
  rate: number; // -50..50 %
  pitch: number; // -20..20 Hz
  volume: number; // -50..50 %
  activeWordIndex: number;
  words: WordTiming[];
  audioUrl: string | null;
  setText: (text: string) => void;
  setMode: (mode: TtsMode) => void;
  setStatus: (status: TtsStatus) => void;
  setError: (error: string | null) => void;
  setVoiceId: (voiceId: string) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  setActiveWordIndex: (index: number) => void;
  setWords: (words: WordTiming[]) => void;
  setAudioUrl: (url: string | null) => void;
  resetPlayback: () => void;
};

export const useTtsStore = create<TtsState>((set, get) => ({
  text: '',
  mode: 'premium',
  status: 'idle',
  error: null,
  voiceId: PREMIUM_VOICES[0].id,
  rate: 0,
  pitch: 0,
  volume: 0,
  activeWordIndex: -1,
  words: [],
  audioUrl: null,
  setText: (text) => set({ text }),
  setMode: (mode) => set({ mode }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setVoiceId: (voiceId) => set({ voiceId }),
  setRate: (rate) => set({ rate }),
  setPitch: (pitch) => set({ pitch }),
  setVolume: (volume) => set({ volume }),
  setActiveWordIndex: (activeWordIndex) => set({ activeWordIndex }),
  setWords: (words) => set({ words }),
  setAudioUrl: (audioUrl) => {
    const prev = get().audioUrl;
    if (prev && prev !== audioUrl) URL.revokeObjectURL(prev);
    set({ audioUrl });
  },
  resetPlayback: () => {
    const prev = get().audioUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({
      status: 'idle',
      error: null,
      activeWordIndex: -1,
      words: [],
      audioUrl: null,
    });
  },
}));
