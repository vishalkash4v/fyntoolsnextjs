export type BmiUnit = 'metric' | 'imperial';
export type BmiProfile = 'adult' | 'child' | 'infant';
export type BmiSex = 'male' | 'female';

export type BmiResult = {
  bmi: number;
  category: string;
  categoryColor: 'default' | 'warning' | 'destructive' | 'success';
  healthyWeightMin: number | null;
  healthyWeightMax: number | null;
  note: string;
};

export function toMetricHeight(height: number, unit: BmiUnit): number {
  return unit === 'metric' ? height / 100 : height * 0.0254;
}

export function toMetricWeight(weight: number, unit: BmiUnit): number {
  return unit === 'metric' ? weight : weight * 0.453592;
}

export function computeBmi(weightKg: number, heightM: number): number | null {
  if (weightKg <= 0 || heightM <= 0) return null;
  return weightKg / (heightM * heightM);
}

export function adultCategory(bmi: number): { label: string; color: BmiResult['categoryColor'] } {
  if (bmi < 16) return { label: 'Severely underweight', color: 'destructive' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'warning' };
  if (bmi < 25) return { label: 'Normal weight', color: 'success' };
  if (bmi < 30) return { label: 'Overweight', color: 'warning' };
  if (bmi < 35) return { label: 'Obesity Class I', color: 'destructive' };
  if (bmi < 40) return { label: 'Obesity Class II', color: 'destructive' };
  return { label: 'Obesity Class III', color: 'destructive' };
}

/** Approximate healthy weight band (kg) for height — BMI 18.5–24.9. */
export function healthyWeightRangeKg(heightM: number): { min: number; max: number } | null {
  if (heightM <= 0) return null;
  const min = 18.5 * heightM * heightM;
  const max = 24.9 * heightM * heightM;
  return { min: Math.round(min * 10) / 10, max: Math.round(max * 10) / 10 };
}

export function evaluateBmi(opts: {
  bmi: number;
  profile: BmiProfile;
  sex: BmiSex;
  ageYears?: number;
  heightM: number;
}): BmiResult {
  const { bmi, profile, sex, ageYears, heightM } = opts;
  const range = healthyWeightRangeKg(heightM);

  if (profile === 'infant') {
    let category = 'Consult pediatric growth chart';
    if (bmi < 13) category = 'Low weight-for-length (screen with pediatrician)';
    else if (bmi <= 18) category = 'Typical infant range (varies by age)';
    else category = 'High weight-for-length (screen with pediatrician)';
    return {
      bmi,
      category,
      categoryColor: 'default',
      healthyWeightMin: range?.min ?? null,
      healthyWeightMax: range?.max ?? null,
      note: 'Infants use WHO weight-for-length percentiles — BMI alone is not diagnostic. Always confirm with a pediatrician.',
    };
  }

  if (profile === 'child') {
    const age = ageYears ?? 10;
    let category = 'Healthy weight range for age (estimate)';
    if (bmi < 14) category = 'Underweight for age — pediatric review advised';
    else if (bmi < 18) category = 'Healthy range for many children/teens';
    else if (bmi < 22) category = 'Overweight for age — lifestyle review';
    else category = 'Obesity risk for age — pediatric review advised';
    return {
      bmi,
      category,
      categoryColor: bmi >= 18 && bmi < 22 ? 'warning' : bmi >= 22 ? 'destructive' : 'default',
      healthyWeightMin: range?.min ?? null,
      healthyWeightMax: range?.max ?? null,
      note: `Child/teen BMI must be plotted on CDC/WHO age-and-sex growth charts (age ${age}y). This number is a screening aid only.`,
    };
  }

  const { label, color } = adultCategory(bmi);
  const sexNote =
    sex === 'female'
      ? 'At the same BMI, women often carry slightly higher body fat than men — consider waist circumference and activity level.'
      : 'At the same BMI, men typically carry more lean mass — athletes may read “overweight” despite low body fat.';

  return {
    bmi,
    category: label,
    categoryColor: color,
    healthyWeightMin: range?.min ?? null,
    healthyWeightMax: range?.max ?? null,
    note: `${sexNote} BMI is a screening tool, not a diagnosis.`,
  };
}
