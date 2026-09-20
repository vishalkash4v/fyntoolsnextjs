'use client';

import { create } from 'zustand';
import {
  DEFAULT_SCENE_DURATION,
  MAX_IMAGES,
  type AdTone,
  type MediaMode,
  type OrientationId,
} from '@/lib/admaker/constants';

export type AdMediaItem = {
  id: string;
  name: string;
  url: string;
  blob: Blob;
  source: 'upload' | 'ai';
};

export type AdScene = {
  id: string;
  textOverlay: string;
  ttsScript: string;
  duration: number;
  /** Index into `images` (wrapped if needed). */
  imageIndex: number;
  voiceBlob?: Blob | null;
  voiceUrl?: string | null;
};

export type AdMakerStep = 1 | 2 | 3 | 4 | 5;

type AdMakerState = {
  step: AdMakerStep;
  projectName: string;
  category: string;
  subCategory: string;
  language: string;
  tone: AdTone;
  productBrief: string;
  orientation: OrientationId;
  logo: AdMediaItem | null;
  mediaMode: MediaMode;
  targetImageCount: number;
  images: AdMediaItem[];
  scenes: AdScene[];
  bgm: AdMediaItem | null;
  bgmVolume: number; // 0–100
  voiceVolume: number; // 0–100
  ttsVoiceId: string;
  isGeneratingCopy: boolean;
  isGeneratingImages: boolean;
  isGeneratingVoice: boolean;
  isRendering: boolean;
  renderProgress: number;
  renderMessage: string;
  outputUrl: string | null;
  setStep: (step: AdMakerStep) => void;
  setProjectName: (v: string) => void;
  setCategory: (v: string) => void;
  setSubCategory: (v: string) => void;
  setLanguage: (v: string) => void;
  setTone: (v: AdTone) => void;
  setProductBrief: (v: string) => void;
  setOrientation: (v: OrientationId) => void;
  setLogo: (item: AdMediaItem | null) => void;
  setMediaMode: (v: MediaMode) => void;
  setTargetImageCount: (n: number) => void;
  addImages: (items: AdMediaItem[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  setScenes: (scenes: AdScene[]) => void;
  updateScene: (id: string, patch: Partial<AdScene>) => void;
  moveScene: (id: string, dir: -1 | 1) => void;
  setBgm: (item: AdMediaItem | null) => void;
  setBgmVolume: (n: number) => void;
  setVoiceVolume: (n: number) => void;
  setTtsVoiceId: (id: string) => void;
  setGeneratingCopy: (v: boolean) => void;
  setGeneratingImages: (v: boolean) => void;
  setGeneratingVoice: (v: boolean) => void;
  setRendering: (v: boolean) => void;
  setRenderProgress: (n: number, message?: string) => void;
  setOutputUrl: (url: string | null) => void;
  resetProject: () => void;
};

function revoke(url: string | null | undefined) {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
}

export const useAdMakerStore = create<AdMakerState>((set, get) => ({
  step: 1,
  projectName: '',
  category: 'ecommerce',
  subCategory: 'Fashion',
  language: 'English',
  tone: 'persuasive',
  productBrief: '',
  orientation: 'portrait',
  logo: null,
  mediaMode: 'combo',
  targetImageCount: 6,
  images: [],
  scenes: [],
  bgm: null,
  bgmVolume: 35,
  voiceVolume: 100,
  ttsVoiceId: 'en-US-AriaNeural',
  isGeneratingCopy: false,
  isGeneratingImages: false,
  isGeneratingVoice: false,
  isRendering: false,
  renderProgress: 0,
  renderMessage: '',
  outputUrl: null,

  setStep: (step) => set({ step }),
  setProjectName: (projectName) => set({ projectName }),
  setCategory: (category) => set({ category }),
  setSubCategory: (subCategory) => set({ subCategory }),
  setLanguage: (language) => set({ language }),
  setTone: (tone) => set({ tone }),
  setProductBrief: (productBrief) => set({ productBrief }),
  setOrientation: (orientation) => set({ orientation }),

  setLogo: (logo) => {
    revoke(get().logo?.url);
    set({ logo });
  },

  setMediaMode: (mediaMode) => set({ mediaMode }),
  setTargetImageCount: (targetImageCount) =>
    set({ targetImageCount: Math.max(1, Math.min(MAX_IMAGES, targetImageCount)) }),

  addImages: (items) =>
    set((s) => {
      const room = MAX_IMAGES - s.images.length;
      if (room <= 0) return s;
      return { images: [...s.images, ...items.slice(0, room)] };
    }),

  removeImage: (id) =>
    set((s) => {
      revoke(s.images.find((i) => i.id === id)?.url);
      return { images: s.images.filter((i) => i.id !== id) };
    }),

  clearImages: () =>
    set((s) => {
      s.images.forEach((i) => revoke(i.url));
      return { images: [] };
    }),

  setScenes: (scenes) =>
    set((s) => {
      s.scenes.forEach((sc) => revoke(sc.voiceUrl));
      return { scenes };
    }),

  updateScene: (id, patch) =>
    set((s) => ({
      scenes: s.scenes.map((sc) => {
        if (sc.id !== id) return sc;
        if (patch.voiceUrl !== undefined && sc.voiceUrl && patch.voiceUrl !== sc.voiceUrl) {
          revoke(sc.voiceUrl);
        }
        return { ...sc, ...patch };
      }),
    })),

  moveScene: (id, dir) =>
    set((s) => {
      const idx = s.scenes.findIndex((sc) => sc.id === id);
      if (idx < 0) return s;
      const next = idx + dir;
      if (next < 0 || next >= s.scenes.length) return s;
      const copy = [...s.scenes];
      const [item] = copy.splice(idx, 1);
      copy.splice(next, 0, item);
      return { scenes: copy };
    }),

  setBgm: (bgm) => {
    revoke(get().bgm?.url);
    set({ bgm });
  },
  setBgmVolume: (bgmVolume) => set({ bgmVolume }),
  setVoiceVolume: (voiceVolume) => set({ voiceVolume }),
  setTtsVoiceId: (ttsVoiceId) => set({ ttsVoiceId }),
  setGeneratingCopy: (isGeneratingCopy) => set({ isGeneratingCopy }),
  setGeneratingImages: (isGeneratingImages) => set({ isGeneratingImages }),
  setGeneratingVoice: (isGeneratingVoice) => set({ isGeneratingVoice }),
  setRendering: (isRendering) => set({ isRendering }),
  setRenderProgress: (renderProgress, renderMessage) =>
    set({ renderProgress, ...(renderMessage !== undefined ? { renderMessage } : {}) }),

  setOutputUrl: (outputUrl) => {
    revoke(get().outputUrl);
    set({ outputUrl });
  },

  resetProject: () => {
    const s = get();
    s.images.forEach((i) => revoke(i.url));
    s.scenes.forEach((sc) => revoke(sc.voiceUrl));
    revoke(s.logo?.url);
    revoke(s.bgm?.url);
    revoke(s.outputUrl);
    set({
      step: 1,
      projectName: '',
      category: 'ecommerce',
      subCategory: 'Fashion',
      language: 'English',
      tone: 'persuasive',
      productBrief: '',
      orientation: 'portrait',
      logo: null,
      mediaMode: 'combo',
      targetImageCount: 6,
      images: [],
      scenes: [],
      bgm: null,
      bgmVolume: 35,
      voiceVolume: 100,
      ttsVoiceId: 'en-US-AriaNeural',
      isGeneratingCopy: false,
      isGeneratingImages: false,
      isGeneratingVoice: false,
      isRendering: false,
      renderProgress: 0,
      renderMessage: '',
      outputUrl: null,
    });
  },
}));

export function createSceneId() {
  return `sc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function scenesFromApi(
  raw: Array<{ textOverlay?: string; ttsScript?: string; duration?: number }>,
  fallbackDuration = DEFAULT_SCENE_DURATION
): AdScene[] {
  return raw.map((s, i) => ({
    id: createSceneId() + i,
    textOverlay: String(s.textOverlay || '').trim(),
    ttsScript: String(s.ttsScript || s.textOverlay || '').trim(),
    duration: Math.max(1.5, Math.min(8, Number(s.duration) || fallbackDuration)),
    imageIndex: i,
    voiceBlob: null,
    voiceUrl: null,
  }));
}
