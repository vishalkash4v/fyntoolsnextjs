/**
 * Educational pregnancy nutrition content aligned with commonly cited
 * clinical guidance (ACOG / IOM calorie increments, CDC folic acid, DGA 2020–2025).
 * Not personalized medical advice — always show the on-page disclaimer.
 */

export type TrimesterKey = 'first' | 'second' | 'third';

export type FoodGroup = {
  title: string;
  items: string[];
  why: string;
};

export type TrimesterPlan = {
  label: string;
  weeks: string;
  calorieNote: string;
  /** Extra kcal/day typical for singleton pregnancy (IOM / ACOG summaries) */
  extraKcal: number;
  focus: string[];
  mealsIdeas: string[];
  foodGroups: FoodGroup[];
  nutrients: { name: string; target: string; foodSources: string }[];
};

/** Singleton pregnancy energy increments commonly cited from IOM / ACOG summaries */
export const TRIMESTER_EXTRA_KCAL: Record<TrimesterKey, number> = {
  first: 0,
  second: 340,
  third: 452,
};

export const KEY_NUTRIENTS = [
  {
    name: 'Folic acid / folate',
    target: '600 mcg DFE/day in pregnancy (400 mcg/day when trying to conceive)',
    note: 'Critical before week 6 for neural tube closure. Prenatal vitamins usually supply folic acid.',
  },
  {
    name: 'Iron',
    target: '27 mg/day',
    note: 'Supports expanded blood volume. Pair plant iron with vitamin C foods for better absorption.',
  },
  {
    name: 'Calcium',
    target: '1,000 mg/day (ages 19–50); 1,300 mg/day if 18 or younger',
    note: 'Supports fetal bone and teeth development.',
  },
  {
    name: 'Vitamin D',
    target: '600 IU/day (15 mcg) for most adults',
    note: 'Ask your clinician if you need a higher monitored dose.',
  },
  {
    name: 'Choline',
    target: 'About 450 mg/day in pregnancy',
    note: 'Eggs, lean meats, and some beans help; many prenatals contain little choline.',
  },
  {
    name: 'Omega-3 (DHA/EPA)',
    target: 'Aim for 8–12 oz/week of low-mercury seafood when possible',
    note: 'Discuss fish oil / algae DHA with your clinician if you do not eat fish.',
  },
  {
    name: 'Protein',
    target: 'About 71 g/day for many pregnancies (needs vary)',
    note: 'Spread protein across meals: dairy, eggs, legumes, fish, poultry, tofu.',
  },
  {
    name: 'Fiber & fluids',
    target: 'High-fiber foods + roughly 8–12 cups fluid/day unless restricted',
    note: 'Helps constipation; ask your clinician about fluid limits if you have kidney / heart conditions.',
  },
] as const;

export const FOODS_TO_LIMIT_OR_AVOID = [
  {
    title: 'Alcohol',
    detail: 'No known safe amount in pregnancy. Avoid completely.',
  },
  {
    title: 'High-mercury fish',
    detail: 'Avoid shark, swordfish, king mackerel, tilefish. Prefer low-mercury options (salmon, sardines, shrimp, canned light tuna in moderation).',
  },
  {
    title: 'Raw or undercooked animal foods',
    detail: 'Avoid raw fish/sushi with raw fish, undercooked meat/eggs, raw cookie dough with raw eggs.',
  },
  {
    title: 'Unpasteurized dairy & soft cheeses',
    detail: 'Avoid unpasteurized milk and soft cheeses made from it (risk of Listeria). Choose pasteurized products.',
  },
  {
    title: 'Deli meats & hot dogs',
    detail: 'Heat until steaming hot before eating, or avoid, due to Listeria risk.',
  },
  {
    title: 'Caffeine',
    detail: 'Many clinicians suggest staying under about 200 mg/day (roughly one 12-oz coffee). Confirm with your provider.',
  },
  {
    title: 'Unwashed produce & raw sprouts',
    detail: 'Wash fruits/vegetables well. Avoid raw sprouts.',
  },
  {
    title: 'Herbal supplements & megadoses',
    detail: 'Do not start herbs, weight-loss products, or high-dose vitamins without clinician approval.',
  },
] as const;

export const PRECAUTIONS = [
  'This tool is educational only and does not diagnose, treat, or replace prenatal care.',
  'Calorie estimates are rough averages for many singleton pregnancies — your needs depend on pre-pregnancy BMI, twins/multiples, activity, medical conditions, and labs.',
  'People with diabetes, gestational diabetes, hypertension, kidney disease, food allergies, eating disorders, or anemia need individualized plans from an OB-GYN / midwife / registered dietitian.',
  'Never stop or change prescribed prenatal vitamins, iron, or medications based on this page.',
  'Seek urgent care for severe vomiting, fainting, chest pain, vaginal bleeding, severe headache, reduced fetal movement (later pregnancy), or signs of infection.',
  'Food safety matters: refrigerate leftovers promptly, reheat thoroughly, and avoid cross-contamination.',
] as const;

export const TERMS_HEALTH_EDUCATION = [
  'FYN Tools provides general health education utilities for informational purposes.',
  'Content is synthesized from widely published public-health and obstetric nutrition summaries (for example IOM calorie increments often cited by ACOG materials, CDC folic acid guidance, and Dietary Guidelines for Americans themes). It is not a clinical protocol for your case.',
  'By using this tool you agree it is not medical advice, not a doctor–patient relationship, and not a substitute for professional prenatal care.',
  'You are responsible for discussing diet, supplements, and weight goals with a licensed clinician familiar with your history.',
  'Results may be inaccurate if inputs are wrong (weight, trimester, activity) or if your pregnancy is multiple / high-risk.',
  'We do not store your health inputs on our servers for this calculator beyond normal browser session behavior on your device.',
] as const;

export const TRIMESTER_PLANS: Record<TrimesterKey, TrimesterPlan> = {
  first: {
    label: 'First trimester',
    weeks: 'Weeks 1–12',
    calorieNote:
      'Most people do not need extra calories yet. Focus on quality: folate, hydration, and foods you can keep down if nauseated.',
    extraKcal: 0,
    focus: [
      'Start / continue a prenatal vitamin with folic acid (unless your clinician advises otherwise)',
      'Small, frequent meals if nausea is present',
      'Hydration and electrolyte-containing fluids if vomiting',
      'Avoid alcohol and high-risk foods listed below',
    ],
    mealsIdeas: [
      'Breakfast: fortified cereal + milk (or fortified plant milk) + banana',
      'Snack: yogurt (pasteurized) + berries',
      'Lunch: lentil soup + whole-grain toast + orange (vitamin C helps iron absorption)',
      'Dinner: scrambled eggs + sautéed spinach + rice',
      'If nauseated: dry crackers, ginger tea (food-grade), bland carbs — follow clinician guidance',
    ],
    foodGroups: [
      {
        title: 'Folate-rich foods',
        why: 'Supports early neural tube development',
        items: ['Dark leafy greens', 'Beans and lentils', 'Fortified cereals/grains', 'Citrus', 'Avocado'],
      },
      {
        title: 'Gentle proteins',
        why: 'Steady energy when appetite is low',
        items: ['Eggs (fully cooked)', 'Greek yogurt (pasteurized)', 'Tofu', 'Soft-cooked poultry', 'Nut butters'],
      },
      {
        title: 'Hydration helpers',
        why: 'Reduces dehydration risk with morning sickness',
        items: ['Water', 'Oral rehydration if advised', 'Broths', 'Water-rich fruit (melon, oranges)'],
      },
    ],
    nutrients: [
      { name: 'Folic acid', target: '400–600 mcg (per clinician / prenatal)', foodSources: 'Fortified grains, greens, legumes' },
      { name: 'Vitamin B6 foods', target: 'May help some nausea cases (ask clinician)', foodSources: 'Chickpeas, bananas, potatoes' },
      { name: 'Iron', target: 'Toward 27 mg/day as intake improves', foodSources: 'Lean meat, beans, fortified cereal' },
    ],
  },
  second: {
    label: 'Second trimester',
    weeks: 'Weeks 13–26',
    calorieNote:
      'Many guidelines cite about +340 kcal/day above pre-pregnancy needs for a singleton pregnancy (roughly a glass of milk + half a sandwich).',
    extraKcal: 340,
    focus: [
      'Add nutrient-dense snacks rather than empty calories',
      'Prioritize iron + vitamin C pairings',
      'Include calcium sources 2–3 times daily',
      'Aim for colorful vegetables and whole grains for fiber',
    ],
    mealsIdeas: [
      'Breakfast: oatmeal with ground flax + berries + milk',
      'Snack: cheese (pasteurized) + apple',
      'Lunch: grilled chicken / chickpea salad + quinoa + peppers',
      'Snack: handful of nuts + dried fruit (watch portions)',
      'Dinner: baked salmon (low-mercury) or dal + brown rice + broccoli',
    ],
    foodGroups: [
      {
        title: 'Iron + vitamin C pairs',
        why: 'Supports rising blood volume',
        items: ['Lean beef or turkey + tomatoes', 'Lentils + lemon', 'Fortified cereal + strawberries', 'Spinach + citrus'],
      },
      {
        title: 'Calcium sources',
        why: 'Fetal bone mineralization accelerates',
        items: ['Milk / fortified soy milk', 'Yogurt', 'Cheese (pasteurized)', 'Tofu set with calcium', 'Sesame / tahini'],
      },
      {
        title: 'Healthy fats',
        why: 'Supports fetal brain development',
        items: ['Walnuts', 'Chia/flax', 'Avocado', 'Olive oil', 'Low-mercury fatty fish'],
      },
    ],
    nutrients: [
      { name: 'Extra energy', target: '~+340 kcal/day (typical singleton)', foodSources: 'Nutrient-dense snacks, not sugary drinks' },
      { name: 'Iron', target: '27 mg/day', foodSources: 'Meat, legumes, fortified grains' },
      { name: 'Calcium', target: '1,000–1,300 mg/day', foodSources: 'Dairy or fortified alternatives' },
      { name: 'DHA', target: 'Via low-mercury fish 8–12 oz/week if possible', foodSources: 'Salmon, sardines, trout' },
    ],
  },
  third: {
    label: 'Third trimester',
    weeks: 'Weeks 27–40+',
    calorieNote:
      'Many guidelines cite about +452 kcal/day above pre-pregnancy needs for a singleton pregnancy in the third trimester.',
    extraKcal: 452,
    focus: [
      'Smaller, more frequent meals if heartburn or fullness increases',
      'Fiber + fluids to reduce constipation',
      'Keep protein steady at each meal',
      'Continue prenatal vitamin; discuss iron labs with your clinician',
    ],
    mealsIdeas: [
      'Breakfast: vegetable omelet + whole-grain toast',
      'Snack: smoothie with pasteurized yogurt, spinach, fruit',
      'Lunch: bean chili + side salad + fruit',
      'Snack: roasted chickpeas or hummus + carrots',
      'Dinner: soft-cooked fish or paneer curry + millet/rice + cooked greens',
    ],
    foodGroups: [
      {
        title: 'Fiber-forward plates',
        why: 'Constipation is common as the uterus grows',
        items: ['Oats', 'Pears/prunes', 'Beans', 'Whole grains', 'Cooked vegetables'],
      },
      {
        title: 'Protein at every meal',
        why: 'Supports fetal growth in late pregnancy',
        items: ['Eggs', 'Dairy', 'Legumes', 'Fish', 'Poultry', 'Soy foods'],
      },
      {
        title: 'Heartburn-friendlier choices',
        why: 'Large fatty meals often worsen reflux',
        items: ['Smaller portions', 'Less fried food', 'Upright after eating', 'Limit late-night spicy meals'],
      },
    ],
    nutrients: [
      { name: 'Extra energy', target: '~+452 kcal/day (typical singleton)', foodSources: 'Extra meal or 2–3 dense snacks' },
      { name: 'Protein', target: '~71 g/day for many (individualize)', foodSources: 'Eggs, dairy, legumes, fish, poultry' },
      { name: 'Fiber', target: 'Increase gradually with water', foodSources: 'Whole grains, fruit, legumes' },
      { name: 'Iron', target: 'Continue 27 mg/day pattern via food + prenatal', foodSources: 'As above; follow labs' },
    ],
  },
};

/**
 * Rough educational calorie estimate:
 * Harris-Benedict–style light resting estimate is NOT used clinically here.
 * We use: weight(kg) × activity factor + trimester extra (IOM-style increments).
 * Activity factors are conservative educational multipliers — not personalized TEE.
 */
export function estimatePregnancyCalories(opts: {
  weightKg: number;
  activity: 'low' | 'moderate' | 'high';
  trimester: TrimesterKey;
}): number | null {
  const { weightKg, activity, trimester } = opts;
  if (!weightKg || weightKg < 35 || weightKg > 200) return null;
  const activityFactor = activity === 'low' ? 28 : activity === 'high' ? 33 : 30;
  const base = weightKg * activityFactor;
  return Math.round(base + TRIMESTER_EXTRA_KCAL[trimester]);
}
