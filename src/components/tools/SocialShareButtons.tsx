'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const IconBase: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex h-5 w-5 items-center justify-center">
    {children}
  </span>
);

const Icons = {
  whatsapp: (
    <IconBase>
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <path fill="#25D366" d="M16 3C9.4 3 4 8.3 4 14.9c0 2.4.7 4.6 2 6.6L4 29l7.7-2c1.8 1 3.9 1.6 6.3 1.6 6.6 0 12-5.4 12-12S22.6 3 16 3z"/>
        <path fill="#fff" d="M22.3 19.9c-.3.8-1.7 1.5-2.3 1.6-.6.1-1.4.1-2.3-.2-.6-.2-1.3-.4-2.2-.8-3.9-1.7-6.4-5.5-6.6-5.8-.2-.3-1.6-2.1-1.6-4s1-2.8 1.4-3.2c.3-.3.7-.4 1-.4h.7c.3 0 .7 0 1 .8.3.8 1.1 2.8 1.2 3 .1.2.2.5 0 .8-.2.3-.3.5-.5.7-.2.2-.4.4-.6.6-.2.2-.4.4-.2.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.8 1.8.3.1.6.1.8-.1.3-.3.9-1 1.1-1.3.2-.3.4-.3.7-.2.3.1 2 .9 2.3 1.1.3.1.6.2.7.3.1.2.1.9-.2 1.7z"/>
      </svg>
    </IconBase>
  ),
  telegram: (
    <IconBase>
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <path fill="#229ED9" d="M16 3C8.8 3 3 8.8 3 16s5.8 13 13 13 13-5.8 13-13S23.2 3 16 3z"/>
        <path fill="#fff" d="M22.8 10.3c.2-.9-.7-1.3-1.4-1.1l-12 4.6c-.8.3-.8 1.4 0 1.7l3.1 1 1.2 3.8c.2.7 1.1.8 1.6.3l1.7-1.7 3.4 2.5c.6.4 1.4.1 1.5-.6l1-10.5zM13.7 16.4l6.5-4.1-4.9 5.1-.2 2.5-1-3.1-2.4-.4z"/>
      </svg>
    </IconBase>
  ),
  facebook: (
    <IconBase>
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <path fill="#1877F2" d="M16 3C8.8 3 3 8.8 3 16s5.8 13 13 13 13-5.8 13-13S23.2 3 16 3z"/>
        <path fill="#fff" d="M18.1 10.9h2.6V8.3h-2.6c-2.4 0-3.9 1.5-3.9 4v1.6h-2.2v2.7h2.2V24h2.8v-7.4h2.4l.4-2.7h-2.8v-1.3c0-1 .5-1.7 1.7-1.7z"/>
      </svg>
    </IconBase>
  ),
  instagram: (
    <IconBase>
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <defs>
          <linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#feda75"/>
            <stop offset="30%" stopColor="#fa7e1e"/>
            <stop offset="60%" stopColor="#d62976"/>
            <stop offset="100%" stopColor="#4f5bd5"/>
          </linearGradient>
        </defs>
        <path fill="url(#ig)" d="M10 5h12a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V10a5 5 0 0 1 5-5z"/>
        <path fill="#fff" d="M16 11a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6.1-8.7a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"/>
      </svg>
    </IconBase>
  ),
  x: (
    <IconBase>
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <rect width="32" height="32" rx="16" fill="#0f172a"/>
        <path fill="#fff" d="M21.6 9h2.6l-5.7 6.6L25 23h-5.1l-3.9-4.5L11.6 23H9l6.2-7.1L9 9h5.2l3.5 4.1L21.6 9zm-1 12.2h1.4L12.9 10.7h-1.5l9.2 10.5z"/>
      </svg>
    </IconBase>
  ),
  linkedin: (
    <IconBase>
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <path fill="#0A66C2" d="M16 3C8.8 3 3 8.8 3 16s5.8 13 13 13 13-5.8 13-13S23.2 3 16 3z"/>
        <path fill="#fff" d="M12.5 12.4H10v9.2h2.5v-9.2zM11.2 8.8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm10.8 7.4c0-2-1.1-3.1-2.7-3.1-1.3 0-1.9.7-2.2 1.2v-1h-2.5v9.2h2.5v-5.1c0-1.3.2-2.6 1.8-2.6 1.6 0 1.6 1.5 1.6 2.7v5h2.5v-6.3z"/>
      </svg>
    </IconBase>
  ),
  reddit: (
    <IconBase>
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="#FF4500"/>
        <circle cx="11.5" cy="16" r="2" fill="#fff"/>
        <circle cx="20.5" cy="16" r="2" fill="#fff"/>
        <path fill="#fff" d="M10.5 19.5c1.5 1.4 3.5 2.1 5.5 2.1s4-.7 5.5-2.1l1 1.1c-1.9 1.8-4.3 2.8-6.5 2.8s-4.6-1-6.5-2.8l1-1.1z"/>
      </svg>
    </IconBase>
  ),
  pinterest: (
    <IconBase>
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="#E60023"/>
        <path fill="#fff" d="M16.2 9.5c-3.6 0-6.5 2.3-6.5 5.7 0 2.2 1.2 4.1 3.1 4.8.3.1.5 0 .6-.3l.3-1.2c.1-.3 0-.5-.2-.6-.6-.7-.9-1.6-.9-2.5 0-2.4 2-4.1 4.7-4.1 2.6 0 4.1 1.6 4.1 3.8 0 2.8-1.4 4.8-3.4 4.8-1.1 0-1.9-.9-1.6-2l.6-2.2c.2-.7.4-1.4.4-1.9 0-1.1-.6-1.9-1.8-1.9-1.4 0-2.5 1.5-2.5 3.4 0 1.2.4 2.1.4 2.1l-1.3 5c-.4 1.6-.1 3.6 0 3.8l.1.1c.1-.2 1-1.5 1.3-3l.7-2.7c.4.7 1.5 1.4 2.7 1.4 3.6 0 6-2.8 6-6.5 0-3.3-2.9-5.7-6.4-5.7z"/>
      </svg>
    </IconBase>
  ),
  email: (
    <IconBase>
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <rect x="4" y="8" width="24" height="16" rx="3" fill="#64748B"/>
        <path fill="#fff" d="M6 10l10 8 10-8H6zm0 12h20V12l-10 8-10-8v10z"/>
      </svg>
    </IconBase>
  ),
} as const;

type SharePlatform = {
  id: string;
  label: string;
  buildUrl: (text: string, url: string) => string;
  supportsText: boolean;
};

const PLATFORMS: SharePlatform[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    buildUrl: (text, url) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    supportsText: true,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    buildUrl: (text, url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    supportsText: true,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    buildUrl: (_text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    supportsText: false,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    buildUrl: (_text, _url) => 'https://www.instagram.com/',
    supportsText: false,
  },
  {
    id: 'x',
    label: 'X',
    buildUrl: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    supportsText: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    buildUrl: (_text, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    supportsText: false,
  },
  {
    id: 'reddit',
    label: 'Reddit',
    buildUrl: (text, url) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    supportsText: true,
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    buildUrl: (_text, url) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}`,
    supportsText: false,
  },
  {
    id: 'email',
    label: 'Email',
    buildUrl: (text, url) => `mailto:?subject=${encodeURIComponent('Check this result')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    supportsText: true,
  },
];

interface SocialShareButtonsProps {
  title: string;
  shareUrl: string;
  shareText: string;
  onShareImage?: () => Promise<void>;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  title,
  shareUrl,
  shareText,
  onShareImage,
}) => {
  const openShare = (platform: SharePlatform, text: string) => {
    const url = platform.buildUrl(text, shareUrl);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareImage = async (platform: SharePlatform) => {
    if (!onShareImage) return;
    await onShareImage();
    if (platform.id === 'instagram') {
      toast.info('Image downloaded. Attach it in Instagram manually.');
    }
    openShare(platform, `${title} (image downloaded)`);
  };

  const handleShareText = (platform: SharePlatform) => {
    if (platform.id === 'instagram') {
      toast.info('Instagram does not support web text sharing. Use the downloaded image instead.');
    }
    openShare(platform, shareText);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-foreground mb-2">Share Image</div>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <Button
              key={`img-${platform.id}`}
              variant="outline"
              size="sm"
              onClick={() => handleShareImage(platform)}
            >
              <span className="mr-2">{Icons[platform.id as keyof typeof Icons]}</span>
              {platform.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold text-foreground mb-2">Share Text</div>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <Button
              key={`text-${platform.id}`}
              variant="outline"
              size="sm"
              onClick={() => handleShareText(platform)}
            >
              <span className="mr-2">{Icons[platform.id as keyof typeof Icons]}</span>
              {platform.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialShareButtons;
