export type OrientationId = 'landscape' | 'portrait' | 'square';

export type MediaMode = 'user' | 'combo' | 'ai';

export type AdTone =
  | 'persuasive'
  | 'premium'
  | 'urgent'
  | 'friendly'
  | 'bold';

export const AD_CATEGORIES = [
  {
    id: 'ecommerce',
    label: 'E‑commerce',
    subs: ['Fashion', 'Electronics', 'Beauty', 'Home & Kitchen', 'Grocery'],
  },
  {
    id: 'local-business',
    label: 'Local Business',
    subs: ['Restaurant', 'Salon', 'Clinic', 'Real Estate', 'Gym'],
  },
  {
    id: 'saas',
    label: 'SaaS / App',
    subs: ['Productivity', 'Finance', 'Education', 'Health', 'AI Tools'],
  },
  {
    id: 'services',
    label: 'Services',
    subs: ['Consulting', 'Agency', 'Legal', 'Travel', 'Events'],
  },
  {
    id: 'personal-brand',
    label: 'Personal Brand',
    subs: ['Creator', 'Coach', 'Influencer', 'Portfolio'],
  },
] as const;

export const AD_LANGUAGES = [
  { id: 'English', label: 'English (Global)' },
  { id: 'English (India)', label: 'English (India)' },
  { id: 'English (US)', label: 'English (US)' },
  { id: 'Hindi', label: 'Hindi' },
  { id: 'Punjabi', label: 'Punjabi' },
] as const;

export const AD_TONES: { id: AdTone; label: string }[] = [
  { id: 'persuasive', label: 'Persuasive' },
  { id: 'premium', label: 'Premium / Luxury' },
  { id: 'urgent', label: 'Urgent / Offer' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'bold', label: 'Bold / Hype' },
];

export const ORIENTATIONS: {
  id: OrientationId;
  label: string;
  hint: string;
  width: number;
  height: number;
}[] = [
  { id: 'landscape', label: '16:9 Landscape', hint: 'YouTube / Desktop', width: 1920, height: 1080 },
  { id: 'portrait', label: '9:16 Portrait', hint: 'Reels / TikTok / Shorts', width: 1080, height: 1920 },
  { id: 'square', label: '1:1 Square', hint: 'Instagram feed', width: 1080, height: 1080 },
];

export const MAX_IMAGES = 50;
export const DEFAULT_SCENE_DURATION = 3;
export const CROSSFADE_SEC = 0.8;
export const AI_IMAGE_STYLE_SUFFIX =
  ', cinematic lighting, shot on 35mm lens, photorealistic, raw, highly detailed, --no text, --no watermark';

export function orientationSize(id: OrientationId) {
  return ORIENTATIONS.find((o) => o.id === id) || ORIENTATIONS[0];
}
