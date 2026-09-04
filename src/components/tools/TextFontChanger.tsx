'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, RefreshCw, Heart, Star, Instagram, MessageCircle, Music2, Gamepad2, Search, Image, Sun, Moon, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CopyButton from "@/components/common/CopyButton";

import { API_BASE_URL } from '@/lib/seo/site';

interface FontStyle {
  name: string;
  description: string;
  transform: (text: string) => string;
  category: string;
  id: string;
  platforms?: string[];
  popular?: boolean;
}

const FAVORITES_KEY = 'fyntools-font-changer-favorites';

const PLATFORM_LIMITS: Record<string, number> = {
  Instagram: 150,
  Discord: 32,
  TikTok: 80,
  Roblox: 20,
};

const KAOMOJIS = [
  '(╯°□°)╯︵ ┻━┻', '( ͡° ͜ʖ ͡°)', 'ヾ(≧▽≦*)o', '（´・ω・`)', '¯\\_(ツ)_/¯',
  'ಠ_ಠ', '(•_•)', '( ˘ ³˘)♥', '☆*:.｡.o(≧▽≦)o.｡.:*☆', '(ノ°∀°)ノ⌒・*:.',
];

const POPULAR_IDS = new Set(['bold', 'italic', 'script', 'bubble', 'fullwidth', 'aesthetic-spaced', 'tiny-text']);
const API_BASE = API_BASE_URL;

interface WebFont {
  _id: string;
  name: string;
  family: string;
  type: string;
  category: string;
  usageCount?: number;
  isPopular?: boolean;
}

const TextFontChanger = () => {
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);
  const [inputText, setInputText] = useState('The quick brown fox jumps over the lazy dog');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [platformPreset, setPlatformPreset] = useState<string | null>(null);
  const [fontSearch, setFontSearch] = useState('');
  const [darkPreview, setDarkPreview] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [webFonts, setWebFonts] = useState<WebFont[]>([]);
  const [webFontsLoading, setWebFontsLoading] = useState(false);
  const [webFontsHasMore, setWebFontsHasMore] = useState(true);
  const [pngExportKey, setPngExportKey] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWebFonts = useCallback(async (page = 1, append = false) => {
    setWebFontsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '24', sort: 'popular' });
      if (fontSearch.trim()) params.set('search', fontSearch.trim());
      const res = await fetch(`${API_BASE}/fonts?${params}`);
      const data = await res.json();
      if (data.success) {
        setWebFonts(prev => append ? [...prev, ...data.fonts] : data.fonts);
        setWebFontsHasMore(data.pagination?.hasMore ?? false);
      }
    } catch {
      setWebFonts([]);
      setWebFontsHasMore(false);
    } finally {
      setWebFontsLoading(false);
    }
  }, [fontSearch]);

  useEffect(() => {
    if (inputText) fetchWebFonts(1, false);
  }, [inputText, fontSearch, fetchWebFonts]);

  const loadMoreWebFonts = () => {
    const nextPage = Math.floor(webFonts.length / 24) + 1;
    fetchWebFonts(nextPage, true);
  };

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch { /* ignore */ }
  }, [favorites]);

  useEffect(() => {
    if (webFonts.length === 0) return;
    const families = webFonts.slice(0, 20).map(f => `family=${encodeURIComponent(f.family).replace(/%20/g, '+')}`).join('&');
    const id = 'gf-fonts';
    let el = document.getElementById(id) as HTMLLinkElement;
    if (!el) {
      el = document.createElement('link');
      el.id = id;
      el.rel = 'stylesheet';
      document.head.appendChild(el);
    }
    el.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  }, [webFonts]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && inputText) {
        const first = fontStyles[0];
        if (first) {
          const text = first.transform(inputText);
          navigator.clipboard.writeText(text);
          setCopiedStyle(first.name);
          toast({ title: "Copied!", description: `${first.name} text copied (Ctrl+Enter)` });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inputText, toast]);



  const fontStyles: FontStyle[] = [
    // Unicode Styles
    {
      id: 'bold',
      name: 'Bold',
      description: 'Mathematical Bold',
      category: 'Unicode',
      platforms: ['Instagram', 'Discord', 'TikTok', 'WhatsApp'],
      transform: (text) => text.replace(/[A-Za-z0-9]/g, (char) => {
        const boldMap: { [key: string]: string } = {
          'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉',
          'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓',
          'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
          'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣',
          'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭',
          'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
          '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
        };
        return boldMap[char] || char;
      })
    },
    {
      id: 'italic',
      name: 'Italic',
      description: 'Mathematical Italic',
      category: 'Unicode',
      platforms: ['Instagram', 'Discord', 'TikTok'],
      transform: (text) => text.replace(/[A-Za-z]/g, (char) => {
        const italicMap: { [key: string]: string } = {
          'A': '𝐴', 'B': '𝐵', 'C': '𝐶', 'D': '𝐷', 'E': '𝐸', 'F': '𝐹', 'G': '𝐺', 'H': '𝐻', 'I': '𝐼', 'J': '𝐽',
          'K': '𝐾', 'L': '𝐿', 'M': '𝑀', 'N': '𝑁', 'O': '𝑂', 'P': '𝑃', 'Q': '𝑄', 'R': '𝑅', 'S': '𝑆', 'T': '𝑇',
          'U': '𝑈', 'V': '𝑉', 'W': '𝑊', 'X': '𝑋', 'Y': '𝑌', 'Z': '𝑍',
          'a': '𝑎', 'b': '𝑏', 'c': '𝑐', 'd': '𝑑', 'e': '𝑒', 'f': '𝑓', 'g': '𝑔', 'h': 'ℎ', 'i': '𝑖', 'j': '𝑗',
          'k': '𝑘', 'l': '𝑙', 'm': '𝑚', 'n': '𝑛', 'o': '𝑜', 'p': '𝑝', 'q': '𝑞', 'r': '𝑟', 's': '𝑠', 't': '𝑡',
          'u': '𝑢', 'v': '𝑣', 'w': '𝑤', 'x': '𝑥', 'y': '𝑦', 'z': '𝑧'
        };
        return italicMap[char] || char;
      })
    },
    {
      id: 'bold-italic',
      name: 'Bold Italic',
      description: 'Mathematical Bold Italic',
      category: 'Unicode',
      transform: (text) => text.replace(/[A-Za-z]/g, (char) => {
        const boldItalicMap: { [key: string]: string } = {
          'A': '𝑨', 'B': '𝑩', 'C': '𝑪', 'D': '𝑫', 'E': '𝑬', 'F': '𝑭', 'G': '𝑮', 'H': '𝑯', 'I': '𝑰', 'J': '𝑱',
          'K': '𝑲', 'L': '𝑳', 'M': '𝑴', 'N': '𝑵', 'O': '𝑶', 'P': '𝑷', 'Q': '𝑸', 'R': '𝑹', 'S': '𝑺', 'T': '𝑻',
          'U': '𝑼', 'V': '𝑽', 'W': '𝑾', 'X': '𝑿', 'Y': '𝒀', 'Z': '𝒁',
          'a': '𝒂', 'b': '𝒃', 'c': '𝒄', 'd': '𝒅', 'e': '𝒆', 'f': '𝒇', 'g': '𝒈', 'h': '𝒉', 'i': '𝒊', 'j': '𝒋',
          'k': '𝒌', 'l': '𝒍', 'm': '𝒎', 'n': '𝒏', 'o': '𝒐', 'p': '𝒑', 'q': '𝒒', 'r': '𝒓', 's': '𝒔', 't': '𝒕',
          'u': '𝒖', 'v': '𝒗', 'w': '𝒘', 'x': '𝒙', 'y': '𝒚', 'z': '𝒛'
        };
        return boldItalicMap[char] || char;
      })
    },
    {
      id: 'script',
      name: 'Script',
      description: 'Mathematical Script (Cursive)',
      category: 'Unicode',
      platforms: ['Instagram', 'Discord', 'TikTok'],
      transform: (text) => text.replace(/[A-Za-z]/g, (char) => {
        const scriptMap: { [key: string]: string } = {
          'A': '𝒜', 'B': 'ℬ', 'C': '𝒞', 'D': '𝒟', 'E': 'ℰ', 'F': 'ℱ', 'G': '𝒢', 'H': 'ℋ', 'I': 'ℐ', 'J': '𝒥',
          'K': '𝒦', 'L': 'ℒ', 'M': 'ℳ', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': 'ℛ', 'S': '𝒮', 'T': '𝒯',
          'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵',
          'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': 'ℯ', 'f': '𝒻', 'g': 'ℊ', 'h': '𝒽', 'i': '𝒾', 'j': '𝒿',
          'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃', 'o': 'ℴ', 'p': '𝓅', 'q': '𝓆', 'r': '𝓇', 's': '𝓈', 't': '𝓉',
          'u': '𝓊', 'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏'
        };
        return scriptMap[char] || char;
      })
    },
    {
      id: 'bold-script',
      name: 'Bold Script',
      description: 'Mathematical Bold Script',
      category: 'Unicode',
      platforms: ['Instagram', 'Discord'],
      transform: (text) => text.replace(/[A-Za-z]/g, (char) => {
        const boldScriptMap: { [key: string]: string } = {
          'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕', 'G': '𝓖', 'H': '𝓗', 'I': '𝓘', 'J': '𝓙',
          'K': '𝓚', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝', 'O': '𝓞', 'P': '𝓟', 'Q': '𝓠', 'R': '𝓡', 'S': '𝓢', 'T': '𝓣',
          'U': '𝓤', 'V': '𝓥', 'W': '𝓦', 'X': '𝓧', 'Y': '𝓨', 'Z': '𝓩',
          'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰', 'h': '𝓱', 'i': '𝓲', 'j': '𝓳',
          'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹', 'q': '𝓺', 'r': '𝓻', 's': '𝓼', 't': '𝓽',
          'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝔁', 'y': '𝔂', 'z': '𝔃'
        };
        return boldScriptMap[char] || char;
      })
    },
    {
      id: 'fraktur',
      name: 'Fraktur',
      description: 'Gothic / Old English Style',
      category: 'Unicode',
      platforms: ['Discord', 'Roblox'],
      transform: (text) => text.replace(/[A-Za-z]/g, (char) => {
        const frakturMap: { [key: string]: string } = {
          'A': '𝔄', 'B': '𝔅', 'C': 'ℭ', 'D': '𝔇', 'E': '𝔈', 'F': '𝔉', 'G': '𝔊', 'H': 'ℌ', 'I': 'ℑ', 'J': '𝔍',
          'K': '𝔎', 'L': '𝔏', 'M': '𝔐', 'N': '𝔑', 'O': '𝔒', 'P': '𝔓', 'Q': '𝔔', 'R': 'ℜ', 'S': '𝔖', 'T': '𝔗',
          'U': '𝔘', 'V': '𝔙', 'W': '𝔚', 'X': '𝔛', 'Y': '𝔜', 'Z': 'ℨ',
          'a': '𝔞', 'b': '𝔟', 'c': '𝔠', 'd': '𝔡', 'e': '𝔢', 'f': '𝔣', 'g': '𝔤', 'h': '𝔥', 'i': '𝔦', 'j': '𝔧',
          'k': '𝔨', 'l': '𝔩', 'm': '𝔪', 'n': '𝔫', 'o': '𝔬', 'p': '𝔭', 'q': '𝔮', 'r': '𝔯', 's': '𝔰', 't': '𝔱',
          'u': '𝔲', 'v': '𝔳', 'w': '𝔴', 'x': '𝔵', 'y': '𝔶', 'z': '𝔷'
        };
        return frakturMap[char] || char;
      })
    },
    {
      id: 'double-struck',
      name: 'Double Struck',
      description: 'Mathematical Double-Struck',
      category: 'Unicode',
      platforms: ['Discord', 'Instagram'],
      transform: (text) => text.replace(/[A-Za-z0-9]/g, (char) => {
        const doubleMap: { [key: string]: string } = {
          'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 'D': '𝔻', 'E': '𝔼', 'F': '𝔽', 'G': '𝔾', 'H': 'ℍ', 'I': '𝕀', 'J': '𝕁',
          'K': '𝕂', 'L': '𝕃', 'M': '𝕄', 'N': 'ℕ', 'O': '𝕆', 'P': 'ℙ', 'Q': 'ℚ', 'R': 'ℝ', 'S': '𝕊', 'T': '𝕋',
          'U': '𝕌', 'V': '𝕍', 'W': '𝕎', 'X': '𝕏', 'Y': '𝕐', 'Z': 'ℤ',
          'a': '𝕒', 'b': '𝕓', 'c': '𝕔', 'd': '𝕕', 'e': '𝕖', 'f': '𝕗', 'g': '𝕘', 'h': '𝕙', 'i': '𝕚', 'j': '𝕛',
          'k': '𝕜', 'l': '𝕝', 'm': '𝕞', 'n': '𝕟', 'o': '𝕠', 'p': '𝕡', 'q': '𝕢', 'r': '𝕣', 's': '𝕤', 't': '𝕥',
          'u': '𝕦', 'v': '𝕧', 'w': '𝕨', 'x': '𝕩', 'y': '𝕪', 'z': '𝕫',
          '0': '𝟘', '1': '𝟙', '2': '𝟚', '3': '𝟛', '4': '𝟜', '5': '𝟝', '6': '𝟞', '7': '𝟟', '8': '𝟠', '9': '𝟡'
        };
        return doubleMap[char] || char;
      })
    },
    {
      id: 'sans-serif',
      name: 'Sans-Serif',
      description: 'Mathematical Sans-Serif',
      category: 'Unicode',
      transform: (text) => text.replace(/[A-Za-z0-9]/g, (char) => {
        const sansMap: { [key: string]: string } = {
          'A': '𝖠', 'B': '𝖡', 'C': '𝖢', 'D': '𝖣', 'E': '𝖤', 'F': '𝖥', 'G': '𝖦', 'H': '𝖧', 'I': '𝖨', 'J': '𝖩',
          'K': '𝖪', 'L': '𝖫', 'M': '𝖬', 'N': '𝖭', 'O': '𝖮', 'P': '𝖯', 'Q': '𝖰', 'R': '𝖱', 'S': '𝖲', 'T': '𝖳',
          'U': '𝖴', 'V': '𝖵', 'W': '𝖶', 'X': '𝖷', 'Y': '𝖸', 'Z': '𝖹',
          'a': '𝖺', 'b': '𝖻', 'c': '𝖼', 'd': '𝖽', 'e': '𝖾', 'f': '𝖿', 'g': '𝗀', 'h': '𝗁', 'i': '𝗂', 'j': '𝗃',
          'k': '𝗄', 'l': '𝗅', 'm': '𝗆', 'n': '𝗇', 'o': '𝗈', 'p': '𝗉', 'q': '𝗊', 'r': '𝗋', 's': '𝗌', 't': '𝗍',
          'u': '𝗎', 'v': '𝗏', 'w': '𝗐', 'x': '𝗑', 'y': '𝗒', 'z': '𝗓',
          '0': '𝟢', '1': '𝟣', '2': '𝟤', '3': '𝟥', '4': '𝟦', '5': '𝟧', '6': '𝟨', '7': '𝟩', '8': '𝟪', '9': '𝟫'
        };
        return sansMap[char] || char;
      })
    },
    {
      id: 'bold-sans-serif',
      name: 'Bold Sans-Serif',
      description: 'Mathematical Bold Sans-Serif',
      category: 'Unicode',
      transform: (text) => text.replace(/[A-Za-z0-9]/g, (char) => {
        const boldSansMap: { [key: string]: string } = {
          'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝',
          'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧',
          'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
          'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷',
          'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁',
          'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
          '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
        };
        return boldSansMap[char] || char;
      })
    },
    {
      id: 'monospace',
      name: 'Monospace',
      description: 'Fixed-width Font',
      category: 'Unicode',
      platforms: ['Discord'],
      transform: (text) => text.replace(/[A-Za-z0-9]/g, (char) => {
        const monoMap: { [key: string]: string } = {
          'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶', 'H': '𝙷', 'I': '𝙸', 'J': '𝙹',
          'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃',
          'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
          'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑', 'i': '𝚒', 'j': '𝚓',
          'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝',
          'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣',
          '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
        };
        return monoMap[char] || char;
      })
    },
    
    // Special Styles
    {
      id: 'upside-down',
      name: 'Upside Down',
      description: 'Flipped Text',
      category: 'Special',
      platforms: ['Discord', 'Twitter'],
      transform: (text) => {
        const flipMap: { [key: string]: string } = {
          'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ',
          'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ',
          'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
          'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'ᖴ', 'G': 'פ', 'H': 'H', 'I': 'I', 'J': 'ſ',
          'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ᴿ', 'S': 'S', 'T': '┴',
          'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
          '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
          '.': '˙', ',': "'", '?': '¿', '!': '¡', "'": ',', '"': '„', '(': ')', ')': '(', '[': ']', ']': '[',
          '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋'
        };
        return text.toLowerCase().split('').map(char => flipMap[char] || char).reverse().join('');
      }
    },
    {
      id: 'mirror',
      name: 'Mirror Text',
      description: 'Reversed Character Order',
      category: 'Special',
      transform: (text) => text.split('').reverse().join('')
    },
    {
      id: 'bubble',
      name: 'Bubble Text',
      description: 'Circled Characters',
      category: 'Special',
      platforms: ['Instagram', 'TikTok', 'Discord'],
      transform: (text) => text.replace(/[A-Za-z0-9]/g, (char) => {
        const bubbleMap: { [key: string]: string } = {
          'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ', 'I': 'Ⓘ', 'J': 'Ⓙ',
          'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ',
          'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ',
          'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ',
          'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ',
          'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ',
          '0': '⓪', '1': '①', '2': '②', '3': '③', '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨'
        };
        return bubbleMap[char] || char;
      })
    },
    {
      id: 'square',
      name: 'Square Text',
      description: 'Squared Characters',
      category: 'Special',
      platforms: ['Instagram', 'Discord'],
      transform: (text) => text.replace(/[A-Za-z]/g, (char) => {
        const squareMap: { [key: string]: string } = {
          'A': '🅰', 'B': '🅱', 'C': '🅲', 'D': '🅳', 'E': '🅴', 'F': '🅵', 'G': '🅶', 'H': '🅷', 'I': '🅸', 'J': '🅹',
          'K': '🅺', 'L': '🅻', 'M': '🅼', 'N': '🅽', 'O': '🅾', 'P': '🅿', 'Q': '🆀', 'R': '🆁', 'S': '🆂', 'T': '🆃',
          'U': '🆄', 'V': '🆅', 'W': '🆆', 'X': '🆇', 'Y': '🆈', 'Z': '🆉'
        };
        return squareMap[char.toUpperCase()] || char;
      })
    },
    {
      id: 'fullwidth',
      name: 'Fullwidth',
      description: 'Aesthetic / Vaporwave Wide Characters',
      category: 'Special',
      platforms: ['Instagram', 'TikTok', 'Discord'],
      transform: (text) => text.replace(/[A-Za-z0-9!@#$%^&*()_+=\[\]{}|;:'"<>,.?\/~` -]/g, (char) => {
        const fullwidthMap: { [key: string]: string } = {
          'A': 'Ａ', 'B': 'Ｂ', 'C': 'Ｃ', 'D': 'Ｄ', 'E': 'Ｅ', 'F': 'Ｆ', 'G': 'Ｇ', 'H': 'Ｈ', 'I': 'Ｉ', 'J': 'Ｊ',
          'K': 'Ｋ', 'L': 'Ｌ', 'M': 'Ｍ', 'N': 'Ｎ', 'O': 'Ｏ', 'P': 'Ｐ', 'Q': 'Ｑ', 'R': 'Ｒ', 'S': 'Ｓ', 'T': 'Ｔ',
          'U': 'Ｕ', 'V': 'Ｖ', 'W': 'Ｗ', 'X': 'Ｘ', 'Y': 'Ｙ', 'Z': 'Ｚ',
          'a': 'ａ', 'b': 'ｂ', 'c': 'ｃ', 'd': 'ｄ', 'e': 'ｅ', 'f': 'ｆ', 'g': 'ｇ', 'h': 'ｈ', 'i': 'ｉ', 'j': 'ｊ',
          'k': 'ｋ', 'l': 'ｌ', 'm': 'ｍ', 'n': 'ｎ', 'o': 'ｏ', 'p': 'ｐ', 'q': 'ｑ', 'r': 'ｒ', 's': 'ｓ', 't': 'ｔ',
          'u': 'ｕ', 'v': 'ｖ', 'w': 'ｗ', 'x': 'ｘ', 'y': 'ｙ', 'z': 'ｚ',
          '0': '０', '1': '１', '2': '２', '3': '３', '4': '４', '5': '５', '6': '６', '7': '７', '8': '８', '9': '９',
          ' ': '　', '!': '！', '@': '＠', '#': '＃', '$': '＄', '%': '％', '^': '＾', '&': '＆', '*': '＊', '(': '（', ')': '）'
        };
        return fullwidthMap[char] || char;
      })
    },
    {
      id: 'small-caps',
      name: 'Small Caps',
      description: 'Small Capital Letters',
      category: 'Special',
      platforms: ['Instagram', 'Discord'],
      transform: (text) => text.replace(/[a-z]/g, (char) => {
        const smallCapsMap: { [key: string]: string } = {
          'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ',
          'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 'ѕ', 't': 'ᴛ',
          'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
        };
        return smallCapsMap[char] || char;
      })
    },
    // Decorative Styles
    {
      id: 'zalgo',
      name: 'Zalgo Text',
      description: 'Glitchy Combining Characters',
      category: 'Decorative',
      platforms: ['Discord'],
      transform: (text) => {
        const zalgoChars = [
          '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u0309',
          '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F', '\u0310', '\u0311', '\u0312', '\u0313',
          '\u0314', '\u0315', '\u0316', '\u0317', '\u0318', '\u0319', '\u031A', '\u031B', '\u031C', '\u031D'
        ];
        return text.split('').map(char => {
          if (char.match(/[a-zA-Z]/)) {
            const numZalgo = Math.floor(Math.random() * 3) + 1;
            let zalgoText = char;
            for (let i = 0; i < numZalgo; i++) {
              zalgoText += zalgoChars[Math.floor(Math.random() * zalgoChars.length)];
            }
            return zalgoText;
          }
          return char;
        }).join('');
      }
    },
    {
      id: 'strikethrough',
      name: 'Strikethrough',
      description: 'Text with Line Through',
      category: 'Decorative',
      transform: (text) => text.split('').map(char => char + '\u0336').join('')
    },
    {
      id: 'underline',
      name: 'Underline',
      description: 'Text with Underline',
      category: 'Decorative',
      transform: (text) => text.split('').map(char => char + '\u0332').join('')
    },
    {
      id: 'double-underline',
      name: 'Double Underline',
      description: 'Text with Double Underline',
      category: 'Decorative',
      transform: (text) => text.split('').map(char => char + '\u0333').join('')
    },
    {
      id: 'overline',
      name: 'Overline',
      description: 'Text with Line Above',
      category: 'Decorative',
      transform: (text) => text.split('').map(char => char + '\u0305').join('')
    },
    {
      id: 'crossed-out',
      name: 'Crossed Out',
      description: 'Text with X Through',
      category: 'Decorative',
      transform: (text) => text.split('').map(char => char + '\u0336\u0338').join('')
    },
    // Text Case Styles
    {
      id: 'alternating-case',
      name: 'aLtErNaTiNg CaSe',
      description: 'Alternating Upper and Lower Case',
      category: 'Case',
      transform: (text) => text.split('').map((char, index) =>
        index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
      ).join('')
    },
    {
      id: 'inverse-case',
      name: 'InVeRsE cAsE',
      description: 'Inverse Alternating Case',
      category: 'Case',
      transform: (text) => text.split('').map((char, index) =>
        index % 2 === 1 ? char.toLowerCase() : char.toUpperCase()
      ).join('')
    },
    {
      id: 'random-case',
      name: 'RaNdOm CaSe',
      description: 'Random Upper and Lower Case',
      category: 'Case',
      transform: (text) => text.split('').map(char =>
        Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
      ).join('')
    },
    {
      id: 'uppercase',
      name: 'UPPERCASE',
      description: 'All Characters Uppercase',
      category: 'Case',
      transform: (text) => text.toUpperCase()
    },
    {
      id: 'lowercase',
      name: 'lowercase',
      description: 'All Characters Lowercase',
      category: 'Case',
      transform: (text) => text.toLowerCase()
    },
    {
      id: 'title-case',
      name: 'Title Case',
      description: 'First Letter of Each Word Capitalized',
      category: 'Case',
      transform: (text) => text.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    },
    {
      id: 'sentence-case',
      name: 'Sentence case',
      description: 'First Letter Capitalized',
      category: 'Case',
      transform: (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    },
    // Emoji Styles
    {
      id: 'letter-emojis',
      name: 'Letter Emojis',
      description: 'Regional Indicator Symbols',
      category: 'Emoji',
      platforms: ['Instagram', 'TikTok'],
      transform: (text) => text.replace(/[A-Za-z]/g, (char) => {
        const emojiMap: { [key: string]: string } = {
          'A': '🇦', 'B': '🇧', 'C': '🇨', 'D': '🇩', 'E': '🇪', 'F': '🇫', 'G': '🇬', 'H': '🇭', 'I': '🇮', 'J': '🇯',
          'K': '🇰', 'L': '🇱', 'M': '🇲', 'N': '🇳', 'O': '🇴', 'P': '🇵', 'Q': '🇶', 'R': '🇷', 'S': '🇸', 'T': '🇹',
          'U': '🇺', 'V': '🇻', 'W': '🇼', 'X': '🇽', 'Y': '🇾', 'Z': '🇿'
        };
        return emojiMap[char.toUpperCase()] || char;
      })
    },
    // High-demand additional styles
    {
      id: 'tiny-text',
      name: 'Tiny Text',
      description: 'Superscript Small Letters',
      category: 'Special',
      platforms: ['Instagram', 'Discord', 'Twitter'],
      transform: (text) => text.replace(/[A-Za-z0-9]/g, (char) => {
        const tinyMap: { [key: string]: string } = {
          'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'q': 'ᵠ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
          'A': 'ᴬ', 'B': 'ᴮ', 'C': 'ᶜ', 'D': 'ᴰ', 'E': 'ᴱ', 'F': 'ᶠ', 'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ', 'K': 'ᴷ', 'L': 'ᴸ', 'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'Q': 'Q', 'R': 'ᴿ', 'S': 'ˢ', 'T': 'ᵀ', 'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ', 'X': 'ˣ', 'Y': 'ʸ', 'Z': 'ᶻ',
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
        };
        return tinyMap[char] || tinyMap[char.toLowerCase()] || char;
      })
    },
    {
      id: 'subscript',
      name: 'Subscript',
      description: 'Small Letters Below Baseline',
      category: 'Special',
      transform: (text) => text.replace(/[A-Za-z0-9]/g, (char) => {
        const subMap: { [key: string]: string } = {
          'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ',
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        return subMap[char.toLowerCase()] || char;
      })
    },
    {
      id: 'parenthesized',
      name: 'Parenthesized',
      description: 'Letters in Parentheses',
      category: 'Special',
      platforms: ['Instagram', 'Discord'],
      transform: (text) => text.replace(/[A-Za-z0-9]/g, (char) => {
        const parenMap: { [key: string]: string } = {
          'a': '⒜', 'b': '⒝', 'c': '⒞', 'd': '⒟', 'e': '⒠', 'f': '⒡', 'g': '⒢', 'h': '⒣', 'i': '⒤', 'j': '⒥', 'k': '⒦', 'l': '⒧', 'm': '⒨', 'n': '⒩', 'o': '⒪', 'p': '⒫', 'q': '⒬', 'r': '⒭', 's': '⒮', 't': '⒯', 'u': '⒰', 'v': '⒱', 'w': '⒲', 'x': '⒳', 'y': '⒴', 'z': '⒵',
          'A': '⒜', 'B': '⒝', 'C': '⒞', 'D': '⒟', 'E': '⒠', 'F': '⒡', 'G': '⒢', 'H': '⒣', 'I': '⒤', 'J': '⒥', 'K': '⒦', 'L': '⒧', 'M': '⒨', 'N': '⒩', 'O': '⒪', 'P': '⒫', 'Q': '⒬', 'R': '⒭', 'S': '⒮', 'T': '⒯', 'U': '⒰', 'V': '⒱', 'W': '⒲', 'X': '⒳', 'Y': '⒴', 'Z': '⒵',
          '0': '⓪', '1': '①', '2': '②', '3': '③', '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨'
        };
        return parenMap[char] || parenMap[char.toLowerCase()] || char;
      })
    },
    {
      id: 'aesthetic-spaced',
      name: 'Aesthetic Spaced',
      description: 'Wide Characters with Spaces',
      category: 'Special',
      platforms: ['Instagram', 'TikTok', 'Discord'],
      transform: (text) => {
        const fullwidthMap: { [key: string]: string } = {
          'A': 'Ａ', 'B': 'Ｂ', 'C': 'Ｃ', 'D': 'Ｄ', 'E': 'Ｅ', 'F': 'Ｆ', 'G': 'Ｇ', 'H': 'Ｈ', 'I': 'Ｉ', 'J': 'Ｊ',
          'K': 'Ｋ', 'L': 'Ｌ', 'M': 'Ｍ', 'N': 'Ｎ', 'O': 'Ｏ', 'P': 'Ｐ', 'Q': 'Ｑ', 'R': 'Ｒ', 'S': 'Ｓ', 'T': 'Ｔ',
          'U': 'Ｕ', 'V': 'Ｖ', 'W': 'Ｗ', 'X': 'Ｘ', 'Y': 'Ｙ', 'Z': 'Ｚ',
          'a': 'ａ', 'b': 'ｂ', 'c': 'ｃ', 'd': 'ｄ', 'e': 'ｅ', 'f': 'ｆ', 'g': 'ｇ', 'h': 'ｈ', 'i': 'ｉ', 'j': 'ｊ',
          'k': 'ｋ', 'l': 'ｌ', 'm': 'ｍ', 'n': 'ｎ', 'o': 'ｏ', 'p': 'ｐ', 'q': 'ｑ', 'r': 'ｒ', 's': 'ｓ', 't': 'ｔ',
          'u': 'ｕ', 'v': 'ｖ', 'w': 'ｗ', 'x': 'ｘ', 'y': 'ｙ', 'z': 'ｚ', ' ': ' '
        };
        return text.split('').map(c => fullwidthMap[c] || fullwidthMap[c.toLowerCase()] || c).join(' ');
      }
    }
  ];

  const categories = ['All', ...Array.from(new Set(fontStyles.map(style => style.category)))];

  const platformPresets = [
    { id: null, label: 'All Platforms', icon: Star },
    { id: 'favorites', label: `Favorites (${favorites.size})`, icon: Heart },
    { id: 'Instagram', label: 'Instagram', icon: Instagram },
    { id: 'Discord', label: 'Discord', icon: MessageCircle },
    { id: 'TikTok', label: 'TikTok', icon: Music2 },
    { id: 'Roblox', label: 'Roblox', icon: Gamepad2 },
  ];

  const filteredStyles = fontStyles.filter(style => {
    const matchCategory = selectedCategory === 'All' || style.category === selectedCategory;
    const matchSearch = !fontSearch.trim() || style.name.toLowerCase().includes(fontSearch.toLowerCase()) || style.description.toLowerCase().includes(fontSearch.toLowerCase());
    if (platformPreset === 'favorites') return matchCategory && matchSearch && favorites.has(style.id);
    if (platformPreset) return matchCategory && matchSearch && (style.platforms?.includes(platformPreset) ?? false);
    return matchCategory && matchSearch;
  });


  const exportAsPng = useCallback(async (
    text: string,
    styleName: string,
    options?: { fontFamily?: string; downloadBase?: string; trackingKey?: string; afterSuccess?: () => void }
  ) => {
    const { fontFamily, downloadBase, trackingKey, afterSuccess } = options ?? {};
    if (trackingKey) setPngExportKey(trackingKey);
    const safeFamily = fontFamily?.replace(/["\\]/g, '') ?? '';
    const fontStack = safeFamily
      ? `"${safeFamily}", sans-serif`
      : 'system-ui, sans-serif';
    const div = document.createElement('div');
    div.style.cssText = `padding:24px 32px;font-size:32px;font-family:${fontStack};background:${darkPreview ? '#1a1a1a' : '#f4f4f5'};color:${darkPreview ? '#fff' : '#18181b'};border-radius:8px;white-space:pre-wrap;word-break:break-all;max-width:400px;`;
    div.textContent = text;
    document.body.appendChild(div);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(div, { scale: 2, backgroundColor: darkPreview ? '#1a1a1a' : '#f4f4f5' });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      const base =
        downloadBase ??
        `fancy-text-${styleName.toLowerCase().replace(/\s+/g, '-')}`;
      link.download = `${base}.png`;
      link.click();
      toast({ title: "Exported!", description: `${styleName} saved as PNG image` });
      afterSuccess?.();
    } catch {
      toast({ title: "Export failed", variant: "destructive", description: "Could not create image" });
    } finally {
      document.body.removeChild(div);
      if (trackingKey) setPngExportKey(null);
    }
  }, [darkPreview, toast]);

  const downloadText = useCallback((text: string, styleName: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${styleName.toLowerCase().replace(/\s+/g, '_')}_text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: `${styleName} text downloaded as file`,
    });
  }, [toast]);

  const clearText = useCallback(() => {
    setInputText('');
    setCopiedStyle(null); // Reset copied style
    toast({
      title: "Cleared!",
      description: "Input text has been cleared",
    });
  }, [toast]);
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Text Font Changer
            <RefreshCw className="h-5 w-5" />
          </CardTitle>
          <CardDescription>
            Free fancy text generator with 35+ Unicode fonts. Copy & paste styled text for Instagram bio, Discord, TikTok, Roblox—no sign-up, works instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single input area */}
          <div className="space-y-2">
            <Textarea
              id="input-text"
              placeholder="Enter your text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[100px] resize-y"
              aria-label="Enter your text"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button onClick={clearText} variant="ghost" size="sm" disabled={!inputText}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <span className="text-sm text-muted-foreground">{inputText.length} characters</span>
                {platformPreset && PLATFORM_LIMITS[platformPreset] && inputText.length > 0 && (
                  <span className={`text-xs ${inputText.length > PLATFORM_LIMITS[platformPreset] ? 'text-destructive' : 'text-muted-foreground'}`}>
                    ({platformPreset} limit: {PLATFORM_LIMITS[platformPreset]})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDarkPreview(!darkPreview)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                title={darkPreview ? "Switch to light preview" : "Switch to dark preview"}
              >
                {darkPreview ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                {darkPreview ? "Dark" : "Light"}
              </button>
            </div>
          </div>

          {/* Professional search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search fonts"
              value={fontSearch}
              onChange={(e) => setFontSearch(e.target.value)}
              className="pl-10 h-10 bg-muted/30 border-muted-foreground/20"
              aria-label="Search fonts"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-2">
            {platformPresets.map((preset) => {
              const Icon = preset.icon;
              return (
                <Badge
                  key={preset.id ?? 'all'}
                  variant={platformPreset === preset.id ? "default" : "outline"}
                  className="cursor-pointer gap-1 py-1"
                  onClick={() => setPlatformPreset(preset.id)}
                >
                  <Icon className="h-3 w-3" />
                  {preset.label}
                </Badge>
              );
            })}
            {categories.filter(c => c !== 'All').map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "secondary" : "outline"}
                className="cursor-pointer py-1"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Kaomojis - compact */}
          <details className="group">
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">Symbols & emoticons</summary>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {KAOMOJIS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className="px-2 py-1 rounded text-sm border bg-background hover:bg-muted transition-colors"
                  onClick={async () => {
                    await navigator.clipboard.writeText(k);
                    toast({ title: "Copied" });
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </details>
        </CardContent>
      </Card>

      {inputText && filteredStyles.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {platformPreset === 'favorites'
                ? "No favorites yet. Click the heart on any style to add it."
                : "No styles match this filter. Try a different category or platform."}
            </p>
          </CardContent>
        </Card>
      )}

      {inputText && filteredStyles.length > 0 && (
            <div className="grid gap-4">
              {filteredStyles.map((style, index) => {
            const transformedText = style.transform(inputText);
            const styleId = style.id ?? `style-${index}`;
            const isFav = favorites.has(styleId);
            return (
              <Card key={styleId} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{style.name}</CardTitle>
                      <CardDescription>{style.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {POPULAR_IDS.has(styleId) && (
                        <Badge variant="default" className="text-xs gap-0.5">
                          <Zap className="h-3 w-3" /> Popular
                        </Badge>
                      )}
                      {style.platforms && style.platforms.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {style.platforms.join(', ')}
                        </Badge>
                      )}
                      <Badge variant="outline">{style.category}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleFavorite(styleId)}
                      >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className={`p-4 rounded-lg font-mono text-lg leading-relaxed break-all cursor-pointer transition-colors select-all ${darkPreview ? 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800' : 'bg-muted hover:bg-muted/80'}`}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(transformedText);
                        setCopiedStyle(style.name);
                        toast({ title: "Copied!", description: `${style.name} text copied` });
                      } catch { /* fallback to button */ }
                    }}
                    title="Click to copy"
                  >
                    {transformedText}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CopyButton
                      textToCopy={transformedText}
                      successMessage={`${style.name} text copied to clipboard`}
                      copied={copiedStyle === style.name}
                      onCopiedChange={(copied) => {
                        if (copied) setCopiedStyle(style.name);
                        else setCopiedStyle(null);
                      }}
                      disableAutoReset={true}
                      size="sm"
                    />
                    <Button
                      onClick={() => downloadText(transformedText, style.name)}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Download className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">TXT</span>
                    </Button>
                    <Button
                      onClick={() => exportAsPng(transformedText, style.name, { trackingKey: `unicode:${styleId}` })}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 min-w-[4.5rem]"
                      title="Export as PNG image"
                      disabled={!!pngExportKey}
                    >
                      {pngExportKey === `unicode:${styleId}` ? (
                        <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" aria-hidden />
                      ) : (
                        <Image className="h-4 w-4 sm:mr-2" />
                      )}
                      <span className="hidden sm:inline">{pngExportKey === `unicode:${styleId}` ? 'Saving…' : 'PNG'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Design fonts from API - popular first, load more */}
      {inputText && webFonts.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-8 mb-4">Design fonts (preview & export)</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {webFonts.map((font) => (
              <Card key={font._id} className="overflow-hidden">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">{font.name}</CardTitle>
                  <CardDescription className="text-xs">{font.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div
                    className={`p-3 rounded text-lg break-words cursor-pointer transition-colors select-all hover:opacity-95 ${darkPreview ? 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800' : 'bg-muted hover:bg-muted/80'}`}
                    style={{ fontFamily: `"${font.family}", sans-serif` }}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(inputText);
                        toast({ title: "Copied!", description: `${font.name} — text copied` });
                      } catch {
                        toast({ title: "Copy failed", variant: "destructive" });
                      }
                    }}
                    title="Click to copy text"
                  >
                    {inputText}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CopyButton
                      textToCopy={inputText}
                      successMessage={`${font.name} text copied to clipboard`}
                      size="sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0"
                      onClick={() => downloadText(inputText, font.name)}
                    >
                      <Download className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">TXT</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 min-w-[4.5rem]"
                      disabled={!!pngExportKey}
                      title="Export preview as PNG"
                      onClick={() =>
                        exportAsPng(inputText, font.name, {
                          fontFamily: font.family,
                          downloadBase: `font-${font.name.replace(/\s+/g, '-')}`,
                          trackingKey: `webfont:${font._id}`,
                          afterSuccess: () => {
                            fetch(`${API_BASE}/fonts/${font._id}/use`, { method: 'POST' }).catch(() => {});
                          },
                        })
                      }
                    >
                      {pngExportKey === `webfont:${font._id}` ? (
                        <Loader2 className="h-4 w-4 sm:mr-1 animate-spin" aria-hidden />
                      ) : (
                        <Image className="h-4 w-4 sm:mr-1" />
                      )}
                      <span className="hidden sm:inline">{pngExportKey === `webfont:${font._id}` ? 'Saving…' : 'PNG'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {webFontsHasMore && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={loadMoreWebFonts} disabled={webFontsLoading}>
                {webFontsLoading ? 'Loading...' : 'Load more fonts'}
              </Button>
            </div>
          )}
        </>
      )}

      {!inputText && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Type or paste your text above to instantly see 35+ fancy fonts. Click any style to copy—works for Instagram, Discord, TikTok & more.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TextFontChanger;
