import { tier1Batch1Overrides } from '@/data/tool-content/tier1Batch1';
import { tier1Batch2Overrides } from '@/data/tool-content/tier1Batch2';

/**
 * Page-level SEO overrides (legacy Vite props + hand-tuned paths).
 * Tier 1 batch modules merge last so deep FAQs / scenarios / examples win.
 */
export type PageOverride = {
  title?: string;
  /** Visible H1 — keep different from meta title to avoid GSC duplicate H1/title */
  h1?: string;
  description?: string;
  shortIntro?: string;
  introText?: string;
  keywords?: string;
  category?: string;
  howToUse?: string[];
  features?: string[];
  faqs?: { question: string; answer: string }[];
  relatedTools?: { name: string; href: string; description?: string }[];
  useCases?: { title: string; description: string }[];
  examples?: { input: string; output: string }[];
  whenToUse?: string[];
  tips?: string[];
  benefits?: string[];
};

const pageOverridesBase: Record<string, PageOverride> = {
  "/add-name-date-photo": {
    "title": "Add Name & Date on Photo - Passport Photo Editor Online",
    "description": "Add name and date on passport photographs for online application forms. Free tool to annotate photos with text for visa, ID, and official applications.",
    "shortIntro": "Add your name and date to passport or ID photos in seconds. Required for many online application forms—works directly in your browser, no software needed.",
    "category": "Image Tools",
    "howToUse": [
      "Upload your passport or ID photo.",
      "Add your name in the text field.",