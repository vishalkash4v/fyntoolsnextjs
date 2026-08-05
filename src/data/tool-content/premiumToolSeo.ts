/**
 * Premium long-form SEO blocks.
 * Hand-tuned entries below override generated content for the same path.
 * Fleet content: `premium/generated.ts` (from `npm run generate-premium`).
 * Batch content: `batch1.ts` (Phase 1, Batch 1), `batch2.ts` (Phase 1, Batch 2).
 */
import type { PremiumPartial } from '@/data/seo-pages/types';
import { generatedPremiumToolSeo } from '@/data/tool-content/premium/generated';
import { batch1ToolSeo } from '@/data/tool-content/batch1';
import { batch2ToolSeo } from '@/data/tool-content/batch2';

const handTunedPremium: Record<string, PremiumPartial> = {
  '/pregnancy-diet-planner': {
    title: 'Pregnancy Diet Planner (Educational)',
    h1: 'Pregnancy Diet Planner — Trimester Foods, Nutrients & Safety',
    metaDescription:
      'Educational pregnancy diet planner with trimester meal ideas, key nutrients (folate, iron, calcium), foods to avoid, and medical disclaimers. Not a substitute for prenatal care.',
    datePublished: '2025-06-01',
    dateModified: '2026-08-05',
    tldr:
      'Pick a trimester for educational meal ideas, nutrient themes, and foods-to-avoid lists — then confirm everything with your prenatal clinician. Not medical advice.',
    processingNote:
      'Planner logic runs in your browser. Outputs are educational only — not a diagnosis, prescription, or substitute for prenatal care. Do not enter sensitive medical records you would not share publicly.',
    ioContract: {
      inputs: 'Trimester selection; optional weight and activity for a rough calorie estimate',
      outputs: 'Educational meal ideas, nutrient cards, foods to avoid, optional PDF notes',
      formats: 'On-screen guidance; PDF export when offered',
      limits: 'Not personalized clinical nutrition; medical conditions require a clinician',
      processing: 'Client-side (browser)',
    },
    keywords: [
      'pregnancy diet planner',
      'pregnancy nutrition',
      'trimester meal plan',
      'foods to avoid in pregnancy',
      'folic acid pregnancy',
      'pregnancy calories second trimester',
      'prenatal diet education',
    ],
    introParagraphs: [
      'A pregnancy diet planner helps you see trimester-focused food ideas, nutrient targets clinicians often discuss (folate, iron, calcium, protein, DHA), and clear food-safety “avoid” lists. FYN Tools’ planner is educational: it sits above evidence-themed guidance and a medical disclaimer so you can explore ideas, then confirm everything with your OB-GYN, midwife, or registered dietitian.',
      'Search intent for pregnancy nutrition is practical and cautious. People want what to eat in the first, second, and third trimesters, how many extra calories are typical, and which foods raise Listeria or mercury risk — without mistaking a web tool for personalized medical advice.',
    ],
    overview:
      'Widely cited obstetric nutrition summaries often note little extra energy need in the first trimester, about +340 kcal/day in the second, and about +452 kcal/day in the third for many singleton pregnancies (IOM increments commonly referenced in ACOG patient materials). Micronutrient focus includes folic acid (~600 mcg DFE/day in pregnancy), iron (~27 mg/day), calcium (1,000–1,300 mg/day by age), and a healthy Dietary Guidelines–style pattern. This tool explains those themes with meal ideas and precautions — it does not prescribe a clinical diet.',
    howItWorks:
      'Choose your trimester, optionally enter weight and activity for a rough calorie estimate, then review priorities, sample meals, nutrient cards, foods to avoid, cautions, and terms. Export an educational PDF if you want notes for a clinic visit. Always treat outputs as discussion starters, not orders.',
    howToUse: [
      'Select first, second, or third trimester.',
      'Optionally enter your weight (kg) and activity level for a rough calorie estimate.',
      'Read meal ideas, food groups, and key nutrient targets for that trimester.',
      'Review foods to avoid, cautions, and the medical disclaimer before changing your diet.',
      'Discuss the plan with your prenatal clinician — especially if you have diabetes, anemia, multiples, or food restrictions.',
    ],
    whenToUse: [
      'When you want a structured trimester checklist before a nutrition appointment',
      'To review foods to avoid (alcohol, high-mercury fish, unpasteurized dairy, etc.)',
      'To understand commonly cited calorie increments for singleton pregnancies',
      'Never as a replacement for prescribed prenatal vitamins or medical treatment',
    ],
    useCases: [
      {
        title: 'First-trimester nausea planning',
        description:
          'See gentle meal ideas and folate focus while remembering calories often do not need to jump yet.',
      },
      {
        title: 'Second-trimester iron and calcium',
        description:
          'Use iron + vitamin C pairings and calcium sources as educational examples to discuss with your clinician.',
      },
      {
        title: 'Third-trimester comfort eating',
        description:
          'Smaller meals, fiber, and protein ideas when heartburn and fullness increase late in pregnancy.',
      },
    ],
    examples: [
      {
        input: 'Second trimester · 65 kg · moderate activity',
        output: 'Rough total kcal estimate using educational formula + ~340 extra kcal note; iron/calcium meal ideas listed',
      },
      {
        input: 'Checking foods to avoid',
        output: 'Alcohol, high-mercury fish, raw/undercooked animal foods, unpasteurized soft cheeses, and more',
      },
    ],
    tips: [
      'Take prenatal vitamins as prescribed — food alone often under-delivers folic acid and iron.',
      'Wash produce; reheat deli meats until steaming if you eat them.',
      'Prefer low-mercury fish 8–12 oz/week when your clinician agrees.',
      'Bring questions from this page to your next prenatal visit instead of self-prescribing supplements.',
    ],
    commonMistakes: [
      'Treating a web calorie number as a strict medical prescription',
      'Eating high-mercury fish or unpasteurized soft cheeses',
      'Skipping prenatal care because an online planner “looks complete”',
      'Starting herbal weight-loss products in pregnancy',
    ],
    advantages: [
      'Trimester-specific educational meal ideas',
      'Nutrient targets with plain-language context',
      'Prominent medical disclaimer, cautions, and terms',
      'Foods-to-avoid list for common safety risks',
      'PDF export for clinic discussions',
    ],
    benefits: [
      'Reduce confusion about what “eat for two” actually means.',
      'Spot high-risk foods before they become habits.',
      'Prepare better questions for your prenatal nutrition visit.',
    ],
    features: [
      'Trimester selector with evidence-themed calorie notes',
      'Sample meals and food-group badges',
      'Key nutrient cards (folate, iron, calcium, DHA, etc.)',
      'Avoid list, precautions, and terms of use',
      'Educational PDF export',
    ],
    faqs: [
      {
        question: 'Is this pregnancy diet planner medical advice?',
        answer:
          'No. It is educational only and not a substitute for prenatal care, labs, or advice from a licensed clinician.',
      },
      {
        question: 'How many extra calories do I need when pregnant?',
        answer:
          'Many summaries cite about +0 kcal in the first trimester, +340 in the second, and +452 in the third for singleton pregnancies. Your clinician may adjust for BMI, twins, or medical conditions.',
      },
      {
        question: 'Which nutrients matter most early in pregnancy?',
        answer:
          'Folic acid/folate is critical before and early in pregnancy for neural tube development. Iron, calcium, vitamin D, choline, protein, and DHA are also commonly discussed across pregnancy.',
      },
      {
        question: 'What foods should I avoid?',
        answer:
          'Avoid alcohol; limit caffeine as advised (often ~200 mg/day); avoid high-mercury fish, raw/undercooked animal foods, unpasteurized dairy, and raw sprouts. Heat deli meats until steaming.',
      },
      {
        question: 'Can I use this if I have gestational diabetes?',
        answer:
          'Only as background reading. Gestational diabetes requires an individualized medical nutrition plan from your care team — do not rely on this general tool.',
      },
    ],
    relatedTools: [
      {
        name: 'Pregnancy Weight Gain Calculator',
        href: '/pregnancy-weight-gain-calculator',
        description: 'IOM-style educational weight-gain ranges by BMI',
      },
      {
        name: 'Pregnancy Week Calculator',
        href: '/pregnancy-week-calculator',
        description: 'Estimate current pregnancy week from LMP',
      },
      {
        name: 'Pregnancy Due Date Calculator',
        href: '/pregnancy-due-date-calculator',
        description: 'Educational due-date estimate from LMP or conception',
      },
      {
        name: 'BMI Calculator',
        href: '/bmi-calculator',
        description: 'General BMI reference (not pregnancy-specific alone)',
      },
      {
        name: 'Ovulation Calculator',
        href: '/ovulation-calculator',
        description: 'Educational fertile-window estimates',
      },
      {
        name: 'Conception Date Calculator',
        href: '/conception-date-calculator',
        description: 'Explore conception timing themes',
      },
      {
        name: 'Baby Kick Counter',
        href: '/baby-kick-counter',
        description: 'Track movement sessions (educational)',
      },
      {
        name: 'Contraction Timer',
        href: '/contraction-timer',
        description: 'Time contraction intervals',
      },
      {
        name: 'Period Tracker',
        href: '/period-tracker',
        description: 'Cycle logging for planning discussions',
      },
      {
        name: 'Safe Days Calculator',
        href: '/safe-days-calculator',
        description: 'Educational cycle-day estimates',
      },
    ],
    conclusion:
      'Use the planner above to explore trimester foods, nutrients, and safety lists — then confirm every change with your prenatal clinician. Healthy pregnancy nutrition is personalized; this page is a starting map, not a prescription.',
    deepParagraphs: [
      'For SEO and user trust on health pages, FYN Tools pairs interactive controls with visible disclaimers, cautions, terms, and citations to public guidance themes (IOM energy increments, CDC folic acid, DGA patterns). That structure helps search engines understand intent while reducing the risk that users mistake education for treatment.',
      'If you arrived searching for a pregnancy diet chart, start with the trimester panel, read foods to avoid, then book or attend prenatal care. Internal links to week, due-date, and weight-gain tools keep related pregnancy questions on-site without overstating medical authority.',
    ],
  },
};

/** Batch content wins over generated; hand-tuned singles win over batch. */
export const premiumToolSeo: Record<string, PremiumPartial> = {
  ...generatedPremiumToolSeo,
  ...batch1ToolSeo,
  ...batch2ToolSeo,
  ...handTunedPremium,
};

export function getPremiumToolSeo(path: string): PremiumPartial | null {
  return premiumToolSeo[path] ?? null;
}
