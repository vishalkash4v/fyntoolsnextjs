/** Button Generator — fonts, presets, stickers, hover gradients, animations */

export type ButtonConfig = {
  buttonText: string;
  backgroundColor: string;
  textColor: string;
  hoverBgColor: string;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  borderWidth: number;
  borderColor: string;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  hoverAnimation: string;
  idleAnimation: string;
  gradient: boolean;
  gradientColor1: string;
  gradientColor2: string;
  gradientAngle: number;
  hoverGradient: boolean;
  hoverGradientColor1: string;
  hoverGradientColor2: string;
  hoverGradientAngle: number;
  glowColor: string;
  glowIntensity: number;
  shadow: 'none' | 'soft' | 'medium' | 'hard' | 'lift';
  textAlign: 'left' | 'center' | 'right';
  fullWidth: boolean;
  sticker: string;
  stickerPosition: 'left' | 'right' | 'only';
  customImage: string | null;
  imageSize: number;
};

export type ButtonPreset = {
  id: string;
  name: string;
  category: string;
  config: Partial<ButtonConfig>;
};

export const DEFAULT_BUTTON_CONFIG: ButtonConfig = {
  buttonText: 'Click Me',
  backgroundColor: '#3b82f6',
  textColor: '#ffffff',
  hoverBgColor: '#2563eb',
  borderRadius: 8,
  paddingX: 20,
  paddingY: 12,
  fontSize: 16,
  fontWeight: 600,
  fontFamily: 'Inter',
  borderWidth: 0,
  borderColor: '#000000',
  letterSpacing: 0,
  textTransform: 'none',
  hoverAnimation: 'none',
  idleAnimation: 'none',
  gradient: false,
  gradientColor1: '#ff7e5f',
  gradientColor2: '#feb47b',
  gradientAngle: 135,
  hoverGradient: false,
  hoverGradientColor1: '#2563eb',
  hoverGradientColor2: '#7c3aed',
  hoverGradientAngle: 135,
  glowColor: '#60a5fa',
  glowIntensity: 0,
  shadow: 'soft',
  textAlign: 'center',
  fullWidth: false,
  sticker: '',
  stickerPosition: 'left',
  customImage: null,
  imageSize: 22,
};

/** Google Fonts + system stacks — loaded on demand in the tool */
export const BUTTON_FONTS: { label: string; value: string; google?: string }[] = [
  { label: 'Inter', value: 'Inter', google: 'Inter:wght@400;500;600;700;800' },
  { label: 'Roboto', value: 'Roboto', google: 'Roboto:wght@400;500;700' },
  { label: 'Open Sans', value: 'Open Sans', google: 'Open+Sans:wght@400;600;700' },
  { label: 'Lato', value: 'Lato', google: 'Lato:wght@400;700' },
  { label: 'Montserrat', value: 'Montserrat', google: 'Montserrat:wght@400;600;700;800' },
  { label: 'Poppins', value: 'Poppins', google: 'Poppins:wght@400;500;600;700' },
  { label: 'Raleway', value: 'Raleway', google: 'Raleway:wght@400;600;700' },
  { label: 'Nunito', value: 'Nunito', google: 'Nunito:wght@400;600;700;800' },
  { label: 'Source Sans 3', value: 'Source Sans 3', google: 'Source+Sans+3:wght@400;600;700' },
  { label: 'Ubuntu', value: 'Ubuntu', google: 'Ubuntu:wght@400;500;700' },
  { label: 'Work Sans', value: 'Work Sans', google: 'Work+Sans:wght@400;600;700' },
  { label: 'Rubik', value: 'Rubik', google: 'Rubik:wght@400;500;700' },
  { label: 'Mulish', value: 'Mulish', google: 'Mulish:wght@400;600;700' },
  { label: 'Manrope', value: 'Manrope', google: 'Manrope:wght@400;600;700;800' },
  { label: 'Outfit', value: 'Outfit', google: 'Outfit:wght@400;600;700' },
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans', google: 'Plus+Jakarta+Sans:wght@400;600;700' },
  { label: 'DM Sans', value: 'DM Sans', google: 'DM+Sans:wght@400;500;700' },
  { label: 'Space Grotesk', value: 'Space Grotesk', google: 'Space+Grotesk:wght@400;500;700' },
  { label: 'Sora', value: 'Sora', google: 'Sora:wght@400;600;700' },
  { label: 'Figtree', value: 'Figtree', google: 'Figtree:wght@400;600;700' },
  { label: 'Josefin Sans', value: 'Josefin Sans', google: 'Josefin+Sans:wght@400;600;700' },
  { label: 'Barlow', value: 'Barlow', google: 'Barlow:wght@400;600;700' },
  { label: 'Karla', value: 'Karla', google: 'Karla:wght@400;600;700' },
  { label: 'Archivo', value: 'Archivo', google: 'Archivo:wght@400;600;700' },
  { label: 'Exo 2', value: 'Exo 2', google: 'Exo+2:wght@400;600;700' },
  { label: 'Quicksand', value: 'Quicksand', google: 'Quicksand:wght@400;600;700' },
  { label: 'Comfortaa', value: 'Comfortaa', google: 'Comfortaa:wght@400;600;700' },
  { label: 'Playfair Display', value: 'Playfair Display', google: 'Playfair+Display:wght@400;700' },
  { label: 'Merriweather', value: 'Merriweather', google: 'Merriweather:wght@400;700' },
  { label: 'Oswald', value: 'Oswald', google: 'Oswald:wght@400;600;700' },
  { label: 'Bebas Neue', value: 'Bebas Neue', google: 'Bebas+Neue' },
  { label: 'Pacifico', value: 'Pacifico', google: 'Pacifico' },
  { label: 'Lobster', value: 'Lobster', google: 'Lobster' },
  { label: 'Dancing Script', value: 'Dancing Script', google: 'Dancing+Script:wght@400;700' },
  { label: 'Orbitron', value: 'Orbitron', google: 'Orbitron:wght@400;600;700' },
  { label: 'Press Start 2P', value: 'Press Start 2P', google: 'Press+Start+2P' },
  { label: 'Indie Flower', value: 'Indie Flower', google: 'Indie+Flower' },
  { label: 'Caveat', value: 'Caveat', google: 'Caveat:wght@400;700' },
  { label: 'System UI', value: 'system-ui, -apple-system, Segoe UI, sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, Times New Roman, serif' },
  { label: 'Courier New', value: 'Courier New, Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
];

export const HOVER_ANIMATIONS = [
  { id: 'none', label: 'None' },
  { id: 'shake', label: 'Shake' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'flip', label: 'Flip' },
  { id: 'fade', label: 'Fade' },
  { id: 'grow', label: 'Grow' },
  { id: 'shrink', label: 'Shrink' },
  { id: 'wiggle', label: 'Wiggle' },
  { id: 'jello', label: 'Jello' },
  { id: 'heartbeat', label: 'Heartbeat' },
  { id: 'float', label: 'Float' },
  { id: 'rubber', label: 'Rubber Band' },
  { id: 'swing', label: 'Swing' },
  { id: 'tada', label: 'Tada' },
  { id: 'shine', label: 'Shine' },
] as const;

export const IDLE_ANIMATIONS = [
  { id: 'none', label: 'None' },
  { id: 'pulse-soft', label: 'Soft Pulse' },
  { id: 'glow-breathe', label: 'Glow Breathe' },
  { id: 'float-idle', label: 'Gentle Float' },
  { id: 'shimmer', label: 'Shimmer' },
] as const;

export const STICKER_PACKS: { id: string; label: string; items: string[] }[] = [
  {
    id: 'animals',
    label: 'Animals',
    items: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🐺', '🐗'],
  },
  {
    id: 'pets',
    label: 'Pets',
    items: ['🐕', '🐩', '🐈', '🐈‍⬛', '🦮', '🐕‍🦺', '🐾', '🦴', '🐠', '🐡', '🐢', '🦜', '🐇'],
  },
  {
    id: 'birds',
    label: 'Birds',
    items: ['🐦', '🐤', '🐣', '🐥', '🦅', '🦆', '🦉', '🦢', '🦩', '🦚', '🐧', '🕊️'],
  },
  {
    id: 'nature',
    label: 'Nature',
    items: ['🌿', '🍀', '🌱', '🌳', '🌴', '🌵', '🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🌾', '🍃', '🍁', '🍂', '🌊', '⛰️', '🏔️', '🌈'],
  },
  {
    id: 'anime',
    label: 'Anime & Faces',
    items: ['😎', '🤩', '🥰', '😇', '😈', '👻', '💀', '🤖', '👽', '🎃', '✨', '💫', '⭐', '🌟', '💖', '💗', '🔥', '⚡'],
  },
  {
    id: 'food',
    label: 'Food',
    items: ['🍕', '🍔', '🍟', '🌮', '🍣', '🍩', '🍪', '☕', '🧋', '🍦', '🍰', '🍎', '🍓', '🥑'],
  },
  {
    id: 'travel',
    label: 'Travel & Objects',
    items: ['🚀', '✈️', '🚗', '🚲', '⛵', '🏠', '💎', '🎁', '🎯', '🏆', '🎮', '📱', '💡', '🔔', '❤️', '👍', '👋', '🛒'],
  },
];

export const BUTTON_PRESETS: ButtonPreset[] = [
  {
    id: 'primary-cta',
    name: 'Primary CTA',
    category: 'Classic',
    config: {
      buttonText: 'Get Started',
      backgroundColor: '#2563eb',
      textColor: '#ffffff',
      hoverBgColor: '#1d4ed8',
      borderRadius: 10,
      fontFamily: 'Inter',
      fontWeight: 600,
      shadow: 'soft',
      gradient: false,
      hoverGradient: false,
      hoverAnimation: 'grow',
      sticker: '',
    },
  },
  {
    id: 'pill-success',
    name: 'Pill Success',
    category: 'Classic',
    config: {
      buttonText: 'Confirm',
      backgroundColor: '#16a34a',
      textColor: '#ffffff',
      hoverBgColor: '#15803d',
      borderRadius: 999,
      paddingX: 28,
      fontFamily: 'Poppins',
      fontWeight: 600,
      shadow: 'soft',
      hoverAnimation: 'pulse',
      sticker: '✓',
    },
  },
  {
    id: 'danger-outline',
    name: 'Danger Outline',
    category: 'Classic',
    config: {
      buttonText: 'Delete',
      backgroundColor: '#ffffff',
      textColor: '#dc2626',
      hoverBgColor: '#fef2f2',
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#dc2626',
      fontFamily: 'Inter',
      shadow: 'none',
      hoverAnimation: 'shake',
      sticker: '🗑️',
    },
  },
  {
    id: 'ghost-minimal',
    name: 'Ghost Minimal',
    category: 'Classic',
    config: {
      buttonText: 'Learn more',
      backgroundColor: 'transparent',
      textColor: '#0f172a',
      hoverBgColor: '#f1f5f9',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#cbd5e1',
      fontFamily: 'DM Sans',
      shadow: 'none',
      hoverAnimation: 'none',
      sticker: '',
    },
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    category: 'Gradient',
    config: {
      buttonText: 'Shop Now',
      gradient: true,
      gradientColor1: '#ff7e5f',
      gradientColor2: '#feb47b',
      gradientAngle: 120,
      hoverGradient: true,
      hoverGradientColor1: '#ff6a4a',
      hoverGradientColor2: '#ff9f6b',
      textColor: '#ffffff',
      borderRadius: 12,
      fontFamily: 'Montserrat',
      fontWeight: 700,
      shadow: 'medium',
      hoverAnimation: 'grow',
      sticker: '🛒',
    },
  },
  {
    id: 'ocean-gradient',
    name: 'Ocean Gradient',
    category: 'Gradient',
    config: {
      buttonText: 'Dive In',
      gradient: true,
      gradientColor1: '#2193b0',
      gradientColor2: '#6dd5ed',
      gradientAngle: 135,
      hoverGradient: true,
      hoverGradientColor1: '#1a7a94',
      hoverGradientColor2: '#4fc3dc',
      textColor: '#ffffff',
      borderRadius: 14,
      fontFamily: 'Nunito',
      fontWeight: 700,
      shadow: 'lift',
      hoverAnimation: 'float',
      sticker: '🌊',
    },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Brand',
    config: {
      buttonText: 'Follow',
      gradient: true,
      gradientColor1: '#f58529',
      gradientColor2: '#dd2a7b',
      gradientAngle: 45,
      hoverGradient: true,
      hoverGradientColor1: '#dd2a7b',
      hoverGradientColor2: '#8134af',
      textColor: '#ffffff',
      borderRadius: 10,
      fontFamily: 'Poppins',
      fontWeight: 600,
      sticker: '📸',
      hoverAnimation: 'pulse',
    },
  },
  {
    id: 'youtube-red',
    name: 'YouTube Red',
    category: 'Brand',
    config: {
      buttonText: 'Subscribe',
      backgroundColor: '#ff0000',
      textColor: '#ffffff',
      hoverBgColor: '#cc0000',
      borderRadius: 4,
      fontFamily: 'Roboto',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      shadow: 'hard',
      sticker: '▶️',
      hoverAnimation: 'grow',
      gradient: false,
    },
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Green',
    category: 'Brand',
    config: {
      buttonText: 'Chat with us',
      backgroundColor: '#25d366',
      textColor: '#ffffff',
      hoverBgColor: '#1ebe57',
      borderRadius: 999,
      fontFamily: 'Open Sans',
      fontWeight: 600,
      sticker: '💬',
      shadow: 'soft',
      hoverAnimation: 'bounce',
    },
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyberpunk',
    category: 'Effects',
    config: {
      buttonText: 'ENTER',
      backgroundColor: '#0f0f1a',
      textColor: '#00ff9d',
      hoverBgColor: '#1a1a2e',
      borderRadius: 6,
      borderWidth: 2,
      borderColor: '#00ff9d',
      fontFamily: 'Orbitron',
      fontWeight: 700,
      letterSpacing: 2,
      textTransform: 'uppercase',
      glowColor: '#00ff9d',
      glowIntensity: 14,
      shadow: 'none',
      hoverAnimation: 'pulse',
      idleAnimation: 'glow-breathe',
      sticker: '⚡',
    },
  },
  {
    id: 'glass',
    name: 'Glass Morphism',
    category: 'Effects',
    config: {
      buttonText: 'Explore',
      backgroundColor: 'rgba(255,255,255,0.25)',
      textColor: '#0f172a',
      hoverBgColor: 'rgba(255,255,255,0.4)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.5)',
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: 600,
      shadow: 'soft',
      hoverAnimation: 'float',
      sticker: '✨',
    },
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    category: 'Soft',
    config: {
      buttonText: 'Save Favorite',
      backgroundColor: '#fce7f3',
      textColor: '#9d174d',
      hoverBgColor: '#fbcfe8',
      borderRadius: 14,
      fontFamily: 'Quicksand',
      fontWeight: 700,
      shadow: 'soft',
      sticker: '💖',
      hoverAnimation: 'heartbeat',
    },
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    category: 'Soft',
    config: {
      buttonText: 'Go Green',
      backgroundColor: '#d1fae5',
      textColor: '#065f46',
      hoverBgColor: '#a7f3d0',
      borderRadius: 12,
      fontFamily: 'Nunito',
      fontWeight: 700,
      sticker: '🌿',
      shadow: 'soft',
      hoverAnimation: 'wiggle',
    },
  },
  {
    id: 'coral-pop',
    name: 'Coral Pop',
    category: 'Soft',
    config: {
      buttonText: 'Try Free',
      backgroundColor: '#fb7185',
      textColor: '#ffffff',
      hoverBgColor: '#f43f5e',
      borderRadius: 12,
      fontFamily: 'Outfit',
      fontWeight: 700,
      shadow: 'lift',
      hoverAnimation: 'rubber',
      sticker: '🪸',
    },
  },
  {
    id: 'lavender',
    name: 'Soft Lavender',
    category: 'Soft',
    config: {
      buttonText: 'Dream On',
      gradient: true,
      gradientColor1: '#c4b5fd',
      gradientColor2: '#a78bfa',
      hoverGradient: true,
      hoverGradientColor1: '#a78bfa',
      hoverGradientColor2: '#8b5cf6',
      textColor: '#ffffff',
      borderRadius: 16,
      fontFamily: 'Comfortaa',
      fontWeight: 700,
      sticker: '💜',
      hoverAnimation: 'float',
    },
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    category: 'Luxury',
    config: {
      buttonText: 'Reserve',
      backgroundColor: '#111827',
      textColor: '#fbbf24',
      hoverBgColor: '#1f2937',
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#fbbf24',
      fontFamily: 'Playfair Display',
      fontWeight: 700,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      shadow: 'hard',
      hoverAnimation: 'shine',
      sticker: '✨',
    },
  },
  {
    id: 'black-friday',
    name: 'Black Friday',
    category: 'Commerce',
    config: {
      buttonText: '50% OFF',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      hoverBgColor: '#1a1a1a',
      borderRadius: 0,
      fontFamily: 'Oswald',
      fontWeight: 700,
      fontSize: 18,
      letterSpacing: 2,
      textTransform: 'uppercase',
      glowColor: '#ef4444',
      glowIntensity: 8,
      hoverAnimation: 'tada',
      idleAnimation: 'pulse-soft',
      sticker: '🔥',
    },
  },
  {
    id: '3d-press',
    name: '3D Press',
    category: 'Effects',
    config: {
      buttonText: 'Press Me',
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
      hoverBgColor: '#4f46e5',
      borderRadius: 10,
      fontFamily: 'Space Grotesk',
      fontWeight: 700,
      shadow: 'hard',
      hoverAnimation: 'shrink',
      sticker: '',
    },
  },
  {
    id: 'retro-pixel',
    name: 'Retro Pixel',
    category: 'Fun',
    config: {
      buttonText: 'PLAY',
      backgroundColor: '#22c55e',
      textColor: '#052e16',
      hoverBgColor: '#16a34a',
      borderRadius: 0,
      borderWidth: 3,
      borderColor: '#14532d',
      fontFamily: 'Press Start 2P',
      fontSize: 12,
      fontWeight: 400,
      paddingX: 16,
      paddingY: 14,
      shadow: 'hard',
      hoverAnimation: 'bounce',
      sticker: '🎮',
    },
  },
  {
    id: 'nature-green',
    name: 'Nature Trail',
    category: 'Fun',
    config: {
      buttonText: 'Explore Nature',
      gradient: true,
      gradientColor1: '#065f46',
      gradientColor2: '#34d399',
      hoverGradient: true,
      hoverGradientColor1: '#047857',
      hoverGradientColor2: '#6ee7b7',
      textColor: '#ffffff',
      borderRadius: 20,
      fontFamily: 'Josefin Sans',
      fontWeight: 600,
      sticker: '🌲',
      shadow: 'medium',
      hoverAnimation: 'float',
    },
  },
  {
    id: 'pet-love',
    name: 'Pet Love',
    category: 'Fun',
    config: {
      buttonText: 'Adopt a Pet',
      backgroundColor: '#f97316',
      textColor: '#ffffff',
      hoverBgColor: '#ea580c',
      borderRadius: 999,
      fontFamily: 'Nunito',
      fontWeight: 800,
      sticker: '🐶',
      shadow: 'lift',
      hoverAnimation: 'heartbeat',
      idleAnimation: 'float-idle',
    },
  },
  {
    id: 'bird-song',
    name: 'Bird Song',
    category: 'Fun',
    config: {
      buttonText: 'Listen',
      backgroundColor: '#0ea5e9',
      textColor: '#ffffff',
      hoverBgColor: '#0284c7',
      borderRadius: 14,
      fontFamily: 'Figtree',
      fontWeight: 700,
      sticker: '🐦',
      hoverAnimation: 'swing',
      shadow: 'soft',
    },
  },
  {
    id: 'anime-spark',
    name: 'Anime Spark',
    category: 'Fun',
    config: {
      buttonText: 'Kawaii!',
      gradient: true,
      gradientColor1: '#ec4899',
      gradientColor2: '#8b5cf6',
      hoverGradient: true,
      hoverGradientColor1: '#db2777',
      hoverGradientColor2: '#7c3aed',
      textColor: '#ffffff',
      borderRadius: 18,
      fontFamily: 'Comfortaa',
      fontWeight: 700,
      sticker: '✨',
      hoverAnimation: 'jello',
      idleAnimation: 'shimmer',
    },
  },
  {
    id: 'indigo-pulse',
    name: 'Indigo Pulse',
    category: 'Classic',
    config: {
      buttonText: 'Continue',
      backgroundColor: '#4f46e5',
      textColor: '#ffffff',
      hoverBgColor: '#4338ca',
      borderRadius: 10,
      fontFamily: 'Manrope',
      fontWeight: 700,
      shadow: 'medium',
      hoverAnimation: 'pulse',
      idleAnimation: 'pulse-soft',
      sticker: '→',
      stickerPosition: 'right',
    },
  },
];

export function shadowCss(shadow: ButtonConfig['shadow']): string {
  switch (shadow) {
    case 'soft':
      return '0 4px 14px rgba(0,0,0,0.12)';
    case 'medium':
      return '0 8px 24px rgba(0,0,0,0.18)';
    case 'hard':
      return '4px 4px 0 rgba(0,0,0,0.25)';
    case 'lift':
      return '0 12px 28px rgba(0,0,0,0.22)';
    default:
      return 'none';
  }
}

export function bgCss(cfg: ButtonConfig, hover = false): string {
  if (hover) {
    if (cfg.hoverGradient) {
      return `linear-gradient(${cfg.hoverGradientAngle}deg, ${cfg.hoverGradientColor1}, ${cfg.hoverGradientColor2})`;
    }
    return cfg.hoverBgColor;
  }
  if (cfg.gradient) {
    return `linear-gradient(${cfg.gradientAngle}deg, ${cfg.gradientColor1}, ${cfg.gradientColor2})`;
  }
  return cfg.backgroundColor;
}

export const KEYFRAMES_CSS = `
@keyframes btn-shake {
  0%,100% { transform: translateX(0); }
  20%,60% { transform: translateX(-4px); }
  40%,80% { transform: translateX(4px); }
}
@keyframes btn-pulse {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
@keyframes btn-bounce {
  0%,100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}
@keyframes btn-flip {
  from { transform: perspective(400px) rotateY(0); }
  to { transform: perspective(400px) rotateY(360deg); }
}
@keyframes btn-fade {
  0%,100% { opacity: 1; }
  50% { opacity: 0.65; }
}
@keyframes btn-grow {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}
@keyframes btn-shrink {
  0%,100% { transform: scale(1); }
  50% { transform: scale(0.94); }
}
@keyframes btn-wiggle {
  0%,100% { transform: rotate(0); }
  25% { transform: rotate(-4deg); }
  75% { transform: rotate(4deg); }
}
@keyframes btn-jello {
  0%,100% { transform: skewX(0); }
  30% { transform: skewX(8deg); }
  50% { transform: skewX(-6deg); }
  70% { transform: skewX(3deg); }
}
@keyframes btn-heartbeat {
  0%,100% { transform: scale(1); }
  14% { transform: scale(1.12); }
  28% { transform: scale(1); }
  42% { transform: scale(1.12); }
  70% { transform: scale(1); }
}
@keyframes btn-float {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes btn-rubber {
  0% { transform: scaleX(1); }
  30% { transform: scaleX(1.15); }
  40% { transform: scaleX(0.9); }
  60% { transform: scaleX(1.05); }
  100% { transform: scaleX(1); }
}
@keyframes btn-swing {
  20% { transform: rotate(12deg); }
  40% { transform: rotate(-8deg); }
  60% { transform: rotate(4deg); }
  80% { transform: rotate(-2deg); }
  100% { transform: rotate(0); }
}
@keyframes btn-tada {
  0% { transform: scale(1) rotate(0); }
  10%,20% { transform: scale(0.92) rotate(-4deg); }
  30%,50%,70% { transform: scale(1.08) rotate(4deg); }
  40%,60% { transform: scale(1.08) rotate(-4deg); }
  100% { transform: scale(1) rotate(0); }
}
@keyframes btn-pulse-soft {
  0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0.35); }
  50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(59,130,246,0); }
}
@keyframes btn-glow-breathe {
  0%,100% { filter: brightness(1); }
  50% { filter: brightness(1.25); }
}
@keyframes btn-float-idle {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes btn-shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes btn-shine {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
  100% { filter: brightness(1); }
}
`.trim();

export function animationName(id: string): string {
  if (!id || id === 'none') return 'none';
  return `btn-${id}`;
}
