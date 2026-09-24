/** India income-tax calculator — Tax Year / FY 2026-27. Educational estimate; special-rate income, capital gains, MAT/AMT, exemptions and many case-specific rules are outside this calculator. */

export type AgeGroup = 'below-60' | '60-80' | 'above-80';
export type TaxRegime = 'old' | 'new';

export type TaxBreakdown = {
  grossIncome: number;
  standardDeduction: number;
  chapterViaDeductions: number;
  taxableIncome: number;
  incomeTaxBeforeRebate: number;
  rebate87A: number;
  marginalRelief: number;
  incomeTax: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
};

type Slab = { upTo: number; rate: number };

export const TAX_YEAR_LABEL = 'FY 2026-27';
export const ASSESSMENT_YEAR_LABEL = 'AY 2027-28';

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

const OLD_SLABS_BELOW_60: Slab[] = [
  { upTo: 250_000, rate: 0 },
  { upTo: 500_000, rate: 0.05 },
  { upTo: 1_000_000, rate: 0.20 },
  { upTo: Infinity, rate: 0.30 },
];

const OLD_SLABS_60_80: Slab[] = [
  { upTo: 300_000, rate: 0 },
  { upTo: 500_000, rate: 0.05 },
  { upTo: 1_000_000, rate: 0.20 },
  { upTo: Infinity, rate: 0.30 },
];

const OLD_SLABS_ABOVE_80: Slab[] = [
  { upTo: 500_000, rate: 0 },
  { upTo: 1_000_000, rate: 0.20 },
  { upTo: Infinity, rate: 0.30 },
];

const NEW_SLABS_FY2627: Slab[] = [
  { upTo: 400_000, rate: 0 },
  { upTo: 800_000, rate: 0.05 },
  { upTo: 1_200_000, rate: 0.10 },
  { upTo: 1_600_000, rate: 0.15 },
  { upTo: 2_000_000, rate: 0.20 },
  { upTo: 2_400_000, rate: 0.25 },
  { upTo: Infinity, rate: 0.30 },
];

function oldRegimeSlabs(age: AgeGroup): Slab[] {
  if (age === '60-80') return OLD_SLABS_60_80;
  if (age === 'above-80') return OLD_SLABS_ABOVE_80;
  return OLD_SLABS_BELOW_60;
}

function rebateAndRelief(
  taxableIncome: number,
  taxBeforeRebate: number,
  regime: TaxRegime,
): { rebate87A: number; marginalRelief: number } {
  if (taxBeforeRebate <= 0) return { rebate87A: 0, marginalRelief: 0 };

  if (regime === 'old') {
    const rebate87A =
      taxableIncome <= 500_000 ? Math.min(taxBeforeRebate, 12_500) : 0;
    return { rebate87A, marginalRelief: 0 };
  }

  // FY 2026-27 / AY 2027-28: resident individuals with total income
  // up to ₹12 lakh can receive up to ₹60,000 rebate under section 87A.
  if (taxableIncome <= 1_200_000) {
    return { rebate87A: Math.min(taxBeforeRebate, 60_000), marginalRelief: 0 };
  }

  // Marginal relief prevents the tax immediately above ₹12 lakh from
  // exceeding the amount by which taxable income exceeds ₹12 lakh.
  const excessIncome = taxableIncome - 1_200_000;
  const excessTax = Math.max(0, taxBeforeRebate - excessIncome);
  return { rebate87A: 0, marginalRelief: excessTax };
}

function calculateSurcharge(taxableIncome: number, taxAfterRelief: number, regime: TaxRegime): number {
  if (taxAfterRelief <= 0) return 0;
  if (taxableIncome <= 5_000_000) return 0;
  if (taxableIncome <= 10_000_000) return taxAfterRelief * 0.10;
  if (taxableIncome <= 20_000_000) return taxAfterRelief * 0.15;
  // For this calculator, the new regime uses the 25% maximum surcharge.
  // The old regime also has a 25% rate for income up to ₹5 crore; higher
  // old-regime surcharge treatment is outside the simplified calculator.
  return taxAfterRelief * 0.25;
}

function buildBreakdown(
  grossIncome: number,
  standardDeduction: number,
  chapterViaDeductions: number,
  taxableIncome: number,
  incomeTaxBeforeRebate: number,
  rebate87A: number,
  marginalRelief: number,
  regime: TaxRegime,
): TaxBreakdown {
  const incomeTax = Math.max(0, incomeTaxBeforeRebate - rebate87A - marginalRelief);
  const surcharge = calculateSurcharge(taxableIncome, incomeTax, regime);
  const cess = (incomeTax + surcharge) * 0.04;
  const totalTax = incomeTax + surcharge + cess;

  return {
    grossIncome,
    standardDeduction,
    chapterViaDeductions,
    taxableIncome,
    incomeTaxBeforeRebate,
    rebate87A,
    marginalRelief,
    incomeTax,
    surcharge,
    cess,
    totalTax,
    netIncome: Math.max(0, grossIncome - totalTax),
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
  };
}

export function calculateOldRegimeTax(
  grossIncome: number,
  age: AgeGroup,
  chapterViaDeductions: number,
): TaxBreakdown {
  const standardDeduction = 50_000;
  const deductions = Math.max(0, chapterViaDeductions);
  const taxableIncome = Math.max(0, grossIncome - standardDeduction - deductions);
  const incomeTaxBeforeRebate = taxFromSlabs(taxableIncome, oldRegimeSlabs(age));
  const { rebate87A, marginalRelief } = rebateAndRelief(
    taxableIncome,
    incomeTaxBeforeRebate,
    'old',
  );

  return buildBreakdown(
    grossIncome,
    standardDeduction,
    deductions,
    taxableIncome,
    incomeTaxBeforeRebate,
    rebate87A,
    marginalRelief,
    'old',
  );
}

export function calculateNewRegimeTax(grossIncome: number): TaxBreakdown {
  const standardDeduction = 75_000;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);
  const incomeTaxBeforeRebate = taxFromSlabs(taxableIncome, NEW_SLABS_FY2627);
  const { rebate87A, marginalRelief } = rebateAndRelief(
    taxableIncome,
    incomeTaxBeforeRebate,
    'new',
  );

  return buildBreakdown(
    grossIncome,
    standardDeduction,
    0,
    taxableIncome,
    incomeTaxBeforeRebate,
    rebate87A,
    marginalRelief,
    'new',
  );
}
