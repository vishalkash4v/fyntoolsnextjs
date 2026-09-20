export type TtsVoice = {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  locale: string;
  language: string;
  premium: boolean;
};

export const TTS_MAX_CHARS = 8000;

export const PREMIUM_VOICES: TtsVoice[] = [
  { id: 'en-US-AriaNeural', name: 'Aria', gender: 'Female', locale: 'en-US', language: 'English (US)', premium: true },
  { id: 'en-US-GuyNeural', name: 'Guy', gender: 'Male', locale: 'en-US', language: 'English (US)', premium: true },
  { id: 'en-US-JennyNeural', name: 'Jenny', gender: 'Female', locale: 'en-US', language: 'English (US)', premium: true },
  { id: 'en-US-EmmaMultilingualNeural', name: 'Emma Multilingual', gender: 'Female', locale: 'en-US', language: 'English (US)', premium: true },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', gender: 'Female', locale: 'en-GB', language: 'English (UK)', premium: true },
  { id: 'en-GB-RyanNeural', name: 'Ryan', gender: 'Male', locale: 'en-GB', language: 'English (UK)', premium: true },
  { id: 'en-IN-NeerjaNeural', name: 'Neerja', gender: 'Female', locale: 'en-IN', language: 'English (India)', premium: true },
  { id: 'en-IN-PrabhatNeural', name: 'Prabhat', gender: 'Male', locale: 'en-IN', language: 'English (India)', premium: true },
  { id: 'hi-IN-SwaraNeural', name: 'Swara', gender: 'Female', locale: 'hi-IN', language: 'Hindi', premium: true },
  { id: 'hi-IN-MadhurNeural', name: 'Madhur', gender: 'Male', locale: 'hi-IN', language: 'Hindi', premium: true },
  { id: 'gu-IN-DhwaniNeural', name: 'Dhwani', gender: 'Female', locale: 'gu-IN', language: 'Gujarati', premium: true },
  { id: 'gu-IN-NiranjanNeural', name: 'Niranjan', gender: 'Male', locale: 'gu-IN', language: 'Gujarati', premium: true },
  { id: 'mr-IN-AarohiNeural', name: 'Aarohi', gender: 'Female', locale: 'mr-IN', language: 'Marathi', premium: true },
  { id: 'mr-IN-ManoharNeural', name: 'Manohar', gender: 'Male', locale: 'mr-IN', language: 'Marathi', premium: true },
  { id: 'ta-IN-PallaviNeural', name: 'Pallavi', gender: 'Female', locale: 'ta-IN', language: 'Tamil', premium: true },
  { id: 'ta-IN-ValluvarNeural', name: 'Valluvar', gender: 'Male', locale: 'ta-IN', language: 'Tamil', premium: true },
];

export function groupVoicesByLanguage(voices: TtsVoice[] = PREMIUM_VOICES) {
  const map = new Map<string, TtsVoice[]>();
  for (const v of voices) {
    const list = map.get(v.language) || [];
    list.push(v);
    map.set(v.language, list);
  }
  return [...map.entries()].map(([language, items]) => ({ language, voices: items }));
}

export type WordTiming = {
  text: string;
  offsetMs: number;
  durationMs: number;
  charStart?: number;
  charEnd?: number;
};

export function alignWordsToText(text: string, words: WordTiming[]): WordTiming[] {
  let cursor = 0;
  return words.map((w) => {
    const needle = w.text;
    if (!needle) return { ...w, charStart: cursor, charEnd: cursor };
    const found = text.indexOf(needle, cursor);
    if (found === -1) {
      const lower = text.toLowerCase();
      const idx = lower.indexOf(needle.toLowerCase(), cursor);
      if (idx === -1) return { ...w, charStart: cursor, charEnd: cursor };
      cursor = idx + needle.length;
      return { ...w, charStart: idx, charEnd: idx + needle.length };
    }
    cursor = found + needle.length;
    return { ...w, charStart: found, charEnd: found + needle.length };
  });
}

export function findActiveWordIndex(words: WordTiming[], timeMs: number): number {
  if (!words.length) return -1;
  for (let i = 0; i < words.length; i++) {
    const start = words[i].offsetMs;
    const end = start + Math.max(words[i].durationMs, 40);
    if (timeMs >= start && timeMs < end) return i;
  }
  let last = -1;
  for (let i = 0; i < words.length; i++) {
    if (timeMs >= words[i].offsetMs) last = i;
    else break;
  }
  return last;
}
