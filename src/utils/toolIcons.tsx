import {
  FileText, Calculator, QrCode, TextCursor, Key, Code, Eraser, CopyCheck,
  ArrowLeftRight, Search, Palette, ListChecks, Clock, Timer, User, CalendarDays,
  Weight, Percent, DollarSign, Eye, FileCode, Table, Globe,
  Barcode, PenTool, StickyNote, Share2, Link2, Hash,
  Calendar as CalendarSchedule, Type, Keyboard, Trophy, Gamepad2,
  Image as ImageIcon, Zap, Crop, RotateCcw, Camera, FileImage,
  Download, Video, Paintbrush, Sparkles, Dices, MessageSquare,
  FileCode2, Edit, UserPlus, Link, CloudSun, Receipt, Layers,
  ImagePlus, Maximize2, Scissors, Mic, Grid3x3, Shuffle,
  Thermometer, ScanLine, MousePointerClick, Lightbulb, Circle,
  HelpCircle, ArrowRight, Calendar, Database
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import React from 'react';

/**
 * Centralized icon mapping for all tools
 * Maps tool names/IDs to Lucide React icons
 */
const toolIconMap: Record<string, LucideIcon> = {
  // Text & Writing Tools
  'word-counter': FileText,
  'text-case-converter': TextCursor,
  'text-font-changer': Type,
  'ai-text-rewriter': Sparkles,
  'lorem-ipsum-generator': FileText,
  'whitespace-remover': Eraser,
  'duplicate-line-remover': CopyCheck,
  'text-reverser': RotateCcw,
  'regex-tester': Search,
  'text-to-handwriting': PenTool,
  'url-slug-generator': Link2,
  'notes': StickyNote,
  'html-formatter': FileCode,
  'json-validator': FileCode2,
  'markdown-editor': FileText,
  'text-to-speech': Mic,

  // Image Tools
  'image-compressor': FileImage,
  'logo-to-favicon': ImageIcon,
  'image-upscaler': Maximize2,
  'image-cropper': Crop,
  'image-format-converter': FileImage,
  'svg-optimizer': FileCode,
  'image-metadata-viewer': Eye,
  'pdf-text-extractor': FileText,
  'pdf-compressor': FileText,
  'placeholder-image-generator': ImageIcon,
  'pixelate-tool': Grid3x3,
  'photo-annotation-tool': Edit,
  'background-remover': Scissors,
  'image-resizer': Maximize2,
  'auto-image-resizer': Maximize2,
  'add-name-date-photo': ImagePlus,
  'qr-scanner': ScanLine,

  // Typing Tools
  'typing-tutor': Keyboard,
  'typing-test': Keyboard,
  'typing-games': Gamepad2,
  'typing-competition': Trophy,

  // Utility Tools
  'qr-code-generator': QrCode,
  'qr-generator': QrCode,
  'password-generator': Key,
  'json-formatter': FileCode2,
  'color-picker-tool': Palette,
  'color-picker': Palette,
  'todo-list': ListChecks,
  'list-randomizer': Shuffle,
  'barcode-generator': Barcode,
  'url-shortener': Link2,
  'username-generator': User,
  'name-generator': UserPlus,
  'business-idea-generator': Lightbulb,
  'coin-flip': Circle,
  'dice-roller': Dices,
  'random-number-generator': Hash,
  'yes-no-generator': HelpCircle,
  'redirect': ArrowRight,
  'weather-forecast': CloudSun,

  // Calculator Tools
  'simple-calculator': Calculator,
  'age-calculator': CalendarDays,
  'date-difference-calculator': Calendar,
  'future-date-calculator': CalendarSchedule,
  'bmi-calculator': Weight,
  'percentage-calculator': Percent,
  'currency-converter': DollarSign,
  'gst-calculator': Calculator,
  'emi-calculator': Calculator,
  'sip-calculator': Calculator,
  'ppf-calculator': Calculator,
  'fd-calculator': Calculator,
  'income-tax-calculator': Calculator,

  // Converter Tools
  'temperature-converter': Thermometer,
  'unit-converter': ArrowLeftRight,
  'enhanced-unit-converter': ArrowLeftRight,
  'color-converter': Palette,
  'color-palette-generator': Palette,

  // Design & CSS Tools
  'box-shadow-generator': Layers,
  'border-radius-generator': Circle,
  'button-generator': MousePointerClick,
  'gradient-generator': Paintbrush,
  'css-minifier': FileCode,

  // Developer Tools
  'hash-generator': Hash,
  'jwt-decoder': Key,
  'meta-tag-previewer': Eye,
  'live-preview': Eye,
  'javascript-minifier': FileCode,
  'table-to-json-converter': Table,
  'discord-formatter': MessageSquare,

  // Timer Tools
  'stopwatch': Timer,
  'countdown-timer': Clock,

  // Network Tools
  'ip-lookup': Globe,

  // Social Media Tools
  'social-media-db-viewer': Database,
  'social-media-downloader': Download,
  'social-media-link-generator': Share2,
  'social-media-planner': Calendar,
  'hashtag-generator': Hash,

  // Business Tools
  'invoice-generator': Receipt,
};

/**
 * Get icon for a tool by name or ID
 * @param toolName - Tool name or ID
 * @returns Lucide React icon component
 */
export const getToolIcon = (toolName: string): LucideIcon => {
  // Normalize tool name (lowercase, replace spaces/special chars)
  const normalized = toolName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // Try exact match first
  if (toolIconMap[normalized]) {
    return toolIconMap[normalized];
  }

  // Try partial match
  for (const [key, icon] of Object.entries(toolIconMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return icon;
    }
  }

  // Default fallback icon
  return Zap;
};

/**
 * Get icon component with consistent styling
 * @param toolName - Tool name or ID
 * @param className - Additional CSS classes
 * @returns Icon component with default styling
 */
export const ToolIcon: React.FC<{ toolName: string; className?: string }> = ({ 
  toolName, 
  className = "h-5 w-5 text-primary" 
}) => {
  const Icon = getToolIcon(toolName);
  return <Icon className={className} />;
};

export default getToolIcon;
