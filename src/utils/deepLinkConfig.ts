/**
 * Deep Link Configuration for Social Media Platforms
 * Supports app deep linking with web fallback
 */

export interface PlatformConfig {
  id: string;
  name: string;
  icon?: string;
  appScheme: string;
  webBaseUrl: string;
  extractId: (url: string) => string | null;
  buildAppLink: (id: string, params?: Record<string, string>) => string;
  buildWebLink: (id: string, params?: Record<string, string>) => string;
  validateUrl: (url: string) => boolean;
  inputPlaceholder: string;
  inputLabel: string;
  exampleUrl: string;
}

// Extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Extract Instagram media ID or username
const extractInstagramId = (url: string): { type: 'media' | 'profile', id: string } | null => {
  // Profile: instagram.com/username or @username
  const profileMatch = url.match(/(?:instagram\.com\/|@)([a-zA-Z0-9_.]+)/);
  if (profileMatch && profileMatch[1] && !profileMatch[1].includes('/')) {
    return { type: 'profile', id: profileMatch[1] };
  }
  
  // Media post: instagram.com/p/POST_ID or instagram.com/reel/REEL_ID
  const mediaMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
  if (mediaMatch && mediaMatch[1]) {
    return { type: 'media', id: mediaMatch[1] };
  }
  
  // Direct username without URL
  if (/^[a-zA-Z0-9_.]+$/.test(url) && !url.includes('.')) {
    return { type: 'profile', id: url };
  }
  
  return null;
};

// Extract Facebook post ID or profile
const extractFacebookId = (url: string): { type: 'post' | 'profile', id: string } | null => {
  // Profile: facebook.com/username
  const profileMatch = url.match(/facebook\.com\/([a-zA-Z0-9.]+)/);
  if (profileMatch && profileMatch[1] && !profileMatch[1].includes('/posts/')) {
    return { type: 'profile', id: profileMatch[1] };
  }
  
  // Post: facebook.com/username/posts/POST_ID
  const postMatch = url.match(/facebook\.com\/.*\/posts\/(\d+)/);
  if (postMatch && postMatch[1]) {
    return { type: 'post', id: postMatch[1] };
  }
  
  // Direct username
  if (/^[a-zA-Z0-9.]+$/.test(url)) {
    return { type: 'profile', id: url };
  }
  
  return null;
};

// Extract Twitter/X tweet ID or username
const extractTwitterId = (url: string): { type: 'tweet' | 'profile', id: string } | null => {
  // Tweet: twitter.com/username/status/TWEET_ID or x.com/username/status/TWEET_ID
  const tweetMatch = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  if (tweetMatch && tweetMatch[1]) {
    return { type: 'tweet', id: tweetMatch[1] };
  }
  
  // Profile: twitter.com/username or x.com/username
  const profileMatch = url.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/);
  if (profileMatch && profileMatch[1]) {
    return { type: 'profile', id: profileMatch[1] };
  }
  
  // Direct username
  if (/^[a-zA-Z0-9_]+$/.test(url) && url.length <= 15) {
    return { type: 'profile', id: url };
  }
  
  return null;
};

// Extract WhatsApp number or text
const extractWhatsAppData = (url: string): { phone?: string, text?: string } | null => {
  // wa.me/PHONE or whatsapp://send?phone=PHONE&text=TEXT
  const phoneMatch = url.match(/(?:wa\.me\/|whatsapp:\/\/send\?phone=)(\+?\d+)/);
  const textMatch = url.match(/[?&]text=([^&]+)/);
  
  // If it's just a phone number (digits only, possibly with +)
  const phoneOnlyMatch = url.trim().match(/^(\+?\d{10,15})$/);
  
  if (phoneMatch || phoneOnlyMatch) {
    return {
      phone: phoneMatch ? phoneMatch[1] : (phoneOnlyMatch ? phoneOnlyMatch[1] : undefined),
      text: textMatch ? decodeURIComponent(textMatch[1]) : undefined
    };
  }
  
  // If it's just text (no phone number, not a URL)
  const trimmed = url.trim();
  if (trimmed && !trimmed.match(/^https?:\/\//) && !trimmed.match(/^wa\.me\//) && !trimmed.match(/^whatsapp:\/\//)) {
    return {
      text: trimmed
    };
  }
  
  // If URL has text parameter but no phone
  if (textMatch) {
    return {
      text: decodeURIComponent(textMatch[1])
    };
  }
  
  return null;
};

// Extract Telegram username or channel
const extractTelegramId = (url: string): string | null => {
  // t.me/username or tg://resolve?domain=username
  const match = url.match(/(?:t\.me\/|tg:\/\/resolve\?domain=)([a-zA-Z0-9_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Direct username
  if (/^[a-zA-Z0-9_]{5,32}$/.test(url)) {
    return url;
  }
  
  return null;
};

// Extract LinkedIn profile or post
const extractLinkedInId = (url: string): { type: 'profile' | 'post', id: string } | null => {
  // Profile: linkedin.com/in/username
  const profileMatch = url.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
  if (profileMatch && profileMatch[1]) {
    return { type: 'profile', id: profileMatch[1] };
  }
  
  // Post: linkedin.com/feed/update/urn:li:activity:POST_ID
  const postMatch = url.match(/linkedin\.com\/feed\/update\/urn:li:activity:(\d+)/);
  if (postMatch && postMatch[1]) {
    return { type: 'post', id: postMatch[1] };
  }
  
  // Direct username
  if (/^[a-zA-Z0-9-]+$/.test(url)) {
    return { type: 'profile', id: url };
  }
  
  return null;
};

export const platformConfigs: Record<string, PlatformConfig> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    appScheme: 'vnd.youtube',
    webBaseUrl: 'https://www.youtube.com',
    extractId: extractYouTubeId,
    buildAppLink: (id) => `vnd.youtube://${id}`,
    buildWebLink: (id) => `https://www.youtube.com/watch?v=${id}`,
    validateUrl: (url) => extractYouTubeId(url) !== null,
    inputPlaceholder: 'Paste YouTube URL or enter Video ID (e.g., dQw4w9WgXcQ)',
    inputLabel: 'YouTube Video URL or ID',
    exampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    appScheme: 'instagram',
    webBaseUrl: 'https://www.instagram.com',
    extractId: (url) => {
      const result = extractInstagramId(url);
      return result ? `${result.type}:${result.id}` : null;
    },
    buildAppLink: (id) => {
      const [type, ...idParts] = id.split(':');
      const actualId = idParts.join(':');
      if (type === 'media') {
        return `instagram://media?id=${actualId}`;
      }
      return `instagram://user?username=${actualId}`;
    },
    buildWebLink: (id) => {
      const [type, ...idParts] = id.split(':');
      const actualId = idParts.join(':');
      if (type === 'media') {
        return `https://www.instagram.com/p/${actualId}/`;
      }
      return `https://www.instagram.com/${actualId}/`;
    },
    validateUrl: (url) => extractInstagramId(url) !== null,
    inputPlaceholder: 'Paste Instagram URL or enter username (e.g., @username or instagram.com/p/POST_ID)',
    inputLabel: 'Instagram URL or Username',
    exampleUrl: 'https://www.instagram.com/username/'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    appScheme: 'fb',
    webBaseUrl: 'https://www.facebook.com',
    extractId: (url) => {
      const result = extractFacebookId(url);
      return result ? `${result.type}:${result.id}` : null;
    },
    buildAppLink: (id) => {
      const [type, ...idParts] = id.split(':');
      const actualId = idParts.join(':');
      if (type === 'post') {
        return `fb://post/${actualId}`;
      }
      return `fb://profile/${actualId}`;
    },
    buildWebLink: (id) => {
      const [type, ...idParts] = id.split(':');
      const actualId = idParts.join(':');
      if (type === 'post') {
        return `https://www.facebook.com/${actualId}`;
      }
      return `https://www.facebook.com/${actualId}`;
    },
    validateUrl: (url) => extractFacebookId(url) !== null,
    inputPlaceholder: 'Paste Facebook URL or enter username',
    inputLabel: 'Facebook URL or Username',
    exampleUrl: 'https://www.facebook.com/username'
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter (X)',
    appScheme: 'twitter',
    webBaseUrl: 'https://x.com',
    extractId: (url) => {
      const result = extractTwitterId(url);
      return result ? `${result.type}:${result.id}` : null;
    },
    buildAppLink: (id) => {
      const [type, ...idParts] = id.split(':');
      const actualId = idParts.join(':');
      if (type === 'tweet') {
        return `twitter://status?id=${actualId}`;
      }
      return `twitter://user?screen_name=${actualId}`;
    },
    buildWebLink: (id) => {
      const [type, ...idParts] = id.split(':');
      const actualId = idParts.join(':');
      if (type === 'tweet') {
        return `https://x.com/i/web/status/${actualId}`;
      }
      return `https://x.com/${actualId}`;
    },
    validateUrl: (url) => extractTwitterId(url) !== null,
    inputPlaceholder: 'Paste Twitter/X URL or enter username (e.g., @username or x.com/username/status/TWEET_ID)',
    inputLabel: 'Twitter/X URL or Username',
    exampleUrl: 'https://x.com/username/status/1234567890'
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    appScheme: 'whatsapp',
    webBaseUrl: 'https://wa.me',
    extractId: (url) => {
      const data = extractWhatsAppData(url);
      if (!data) return null;
      // Use a delimiter instead of JSON for simpler parsing (phone::text)
      return `${data.phone || ''}::${data.text || ''}`;
    },
    buildAppLink: (id) => {
      const parts = id.split('::');
      const phone = parts[0] || '';
      const text = parts[1] || '';
      const encodedText = text ? encodeURIComponent(text) : '';
      
      if (phone) {
        // Remove + from phone if present for URL
        const cleanPhone = phone.replace(/^\+/, '');
        return `whatsapp://send?phone=${cleanPhone}${encodedText ? `&text=${encodedText}` : ''}`;
      }
      return encodedText ? `whatsapp://send?text=${encodedText}` : 'whatsapp://send';
    },
    buildWebLink: (id) => {
      const parts = id.split('::');
      const phone = parts[0] || '';
      const text = parts[1] || '';
      const encodedText = text ? encodeURIComponent(text) : '';
      
      if (phone) {
        // Remove + from phone if present for URL
        const cleanPhone = phone.replace(/^\+/, '');
        return `https://wa.me/${cleanPhone}${encodedText ? `?text=${encodedText}` : ''}`;
      }
      return encodedText ? `https://wa.me/?text=${encodedText}` : 'https://wa.me/';
    },
    validateUrl: (url) => extractWhatsAppData(url) !== null || url.trim().length > 0,
    inputPlaceholder: 'Enter phone number (with country code, e.g., +1234567890) or message text',
    inputLabel: 'WhatsApp Phone Number or Message',
    exampleUrl: '+1234567890 or Hello World message'
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    appScheme: 'tg',
    webBaseUrl: 'https://t.me',
    extractId: extractTelegramId,
    buildAppLink: (id) => `tg://resolve?domain=${id}`,
    buildWebLink: (id) => `https://t.me/${id}`,
    validateUrl: (url) => extractTelegramId(url) !== null,
    inputPlaceholder: 'Paste Telegram URL or enter username (e.g., @username or t.me/username)',
    inputLabel: 'Telegram URL or Username',
    exampleUrl: 'https://t.me/username'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    appScheme: 'linkedin',
    webBaseUrl: 'https://www.linkedin.com',
    extractId: (url) => {
      const result = extractLinkedInId(url);
      return result ? `${result.type}:${result.id}` : null;
    },
    buildAppLink: (id) => {
      const [type, ...idParts] = id.split(':');
      const actualId = idParts.join(':');
      if (type === 'post') {
        return `linkedin://feed/update/${actualId}`;
      }
      return `linkedin://profile/view?id=${actualId}`;
    },
    buildWebLink: (id) => {
      const [type, ...idParts] = id.split(':');
      const actualId = idParts.join(':');
      if (type === 'post') {
        return `https://www.linkedin.com/feed/update/urn:li:activity:${actualId}`;
      }
      return `https://www.linkedin.com/in/${actualId}/`;
    },
    validateUrl: (url) => extractLinkedInId(url) !== null,
    inputPlaceholder: 'Paste LinkedIn URL or enter username (e.g., linkedin.com/in/username)',
    inputLabel: 'LinkedIn URL or Username',
    exampleUrl: 'https://www.linkedin.com/in/username/'
  }
};

export const getPlatformConfig = (platformId: string): PlatformConfig | null => {
  return platformConfigs[platformId] || null;
};

export const getAllPlatforms = (): PlatformConfig[] => {
  return Object.values(platformConfigs);
};
