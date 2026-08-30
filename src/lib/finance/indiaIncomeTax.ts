/** India income tax slabs — FY 2024-25 (AY 2025-26), educational estimates. */

export type AgeGroup = 'below-60' | '60-80' | 'above-80';

export type TaxBreakdown = {
  grossIncome: number;
  standardDeduction: number;
  chapterViaDeductions: number;
  taxableIncome: number;
  incomeTax: number;
  rebate87A: number;
  cess: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
};

type Slab = { upTo: number; rate: number };

/** Progressive tax on positive income using cumulative slabs. */
export function taxFromSlabs(taxableIncome: number, slabs: Slab[]): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  let prev = 0;
  for (const slab of slabs) {
    if (taxableIncome <= prev) break;
    const chunk = Math.min(taxableIncome, slab.upTo) - prev;
    if (chunk > 0) tax += chunk * slab.rate;
    prev = slab.upTo;
  }
  return tax;
}

/** Old regime slabs (below 60) — exemption embedded in 0% first slab. */
const OLD_SLABS_BELOW_60: Slab[] = [
  { upTo: 250_000, rate: 0 },
  { upTo: 500_000, rate: 0.05 },
  { upTo: 1_000_000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

const OLD_SLABS_60_80: Slab[] = [
  { upTo: 300_000, rate: 0 },
  { upTo: 500_000, rate: 0.05 },
  { upTo: 1_000_000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

const OLD_SLABS_ABOVE_80: Slab[] = [
  { upTo: 500_000, rate: 0 },
  { upTo: 1_000_000, rate: 0.05 },
  { upTo: Infinity, rate: 0.2 },
];

/** New regime FY 2024-25 (post Budget 2024). */
const NEW_SLABS_FY2425: Slab[] = [
  { upTo: 300_000, rate: 0 },
  { upTo: 700_000, rate: 0.05 },
  { upTo: 1_000_000, rate: 0.1 },
  { upTo: 1_200_000, rate: 0.15 },
  { upTo: 1_500_000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

function oldRegimeSlabs(age: AgeGroup): Slab[] {
  if (age === '60-80') return OLD_SLABS_60_80;
  if (age === 'above-80') return OLD_SLABS_ABOVE_80;
  return OLD_SLABS_BELOW_60;
}

/** Section 87A rebate — FY 2024-25 (old & new regime). */
function rebateUnder87A(taxableIncome: number, taxBeforeRebate: number, regime: 'old' | 'new'): number {
  if (taxBeforeRebate <= 0) return 0;
  if (regime === 'new') {
    if (taxableIncome <= 700_000) return Math.min(taxBeforeRebate, 25_000);
    return 0;
  }
  // Old regime: rebate if taxable income ≤ 5L
  if (taxableIncome <= 500_000) return Math.min(taxBeforeRebate, 12_500);
  return 0;
}

export function calculateOldRegimeTax(
  grossIncome: number,
  age: AgeGroup,
  chapterViaDeductions: number
): TaxBreakdown {
  const standardDeduction = 50_000;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction - Math.max(0, chapterViaDeductions));
  const incomeTaxBeforeRebate = taxFromSlabs(taxableIncome, oldRegimeSlabs(age));
  const rebate87A = rebateUnder87A(taxableIncome, incomeTaxBeforeRebate, 'old');
  const incomeTax = Math.max(0, incomeTaxBeforeRebate - rebate87A);
  const cess = incomeTax * 0.04;
  const totalTax = incomeTax + cess;

  return {
    grossIncome,
    standardDeduction,
    chapterViaDeductions: Math.max(0, chapterViaDeductions),
    taxableIncome,
    incomeTax,
    rebate87A,
    cess,
    totalTax,
    netIncome: grossIncome - totalTax,
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
  };
}

export function calculateNewRegimeTax(grossIncome: number): TaxBreakdown {
  const standardDeduction = 75_000; // FY 2024-25 salaried standard deduction in new regime
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);
  const incomeTaxBeforeRebate = taxFromSlabs(taxableIncome, NEW_SLABS_FY2425);
  const rebate87A = rebateUnder87A(taxableIncome, incomeTaxBeforeRebate, 'new');
  const incomeTax = Math.max(0, incomeTaxBeforeRebate - rebate87A);
  const cess = incomeTax * 0.04;
  const totalTax = incomeTax + cess;

  return {
    grossIncome,
    standardDeduction,
    chapterViaDeductions: 0,
    taxableIncome,
    incomeTax,
    rebate87A,
    cess,
    totalTax,
    netIncome: grossIncome - totalTax,
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
  };
}
