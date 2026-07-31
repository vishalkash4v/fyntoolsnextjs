'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

type Props = {
  /** Short tool name for the opening sentence */
  toolName: string;
  className?: string;
};

/**
 * Required banner for pregnancy / reproductive health utilities.
 */
export default function PregnancyHealthDisclaimer({ toolName, className = '' }: Props) {
  return (
    <aside
      className={`rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-50 p-4 sm:p-5 ${className}`}
      role="note"
      aria-label="Important medical disclaimer"
    >
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" aria-hidden />
        <div className="space-y-2 text-sm leading-relaxed">
          <p className="font-semibold">
            Medical disclaimer — {toolName} is educational only
          </p>
          <p>
            This tool does <strong>not</strong> provide medical advice, diagnosis, or treatment and is{' '}
            <strong>not a substitute</strong> for care from a licensed obstetrician, midwife, registered
            dietitian, or other qualified clinician. Pregnancy nutrition and weight needs vary with BMI,
            multiples, labs, medications, and medical history.
          </p>
          <p>
            Always follow your prenatal care team’s instructions. If you have emergency symptoms (severe
            pain, bleeding, fainting, trouble breathing, severe vomiting, or reduced fetal movement), seek
            urgent medical care. See also our{' '}
            <Link href="/contact" className="underline font-medium hover:text-primary">
              Contact
            </Link>{' '}
            page for general site questions (not clinical care).
          </p>
        </div>
      </div>
    </aside>
  );
}
