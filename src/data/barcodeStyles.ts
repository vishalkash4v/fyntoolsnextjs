/** 1D linear barcode styles only (no QR / Data Matrix — use QR Code Generator for 2D). */

export type BarcodeRenderOptions = {
  height: number;
  /** Module width (bwip-js `width` for linear symbologies). */
  moduleWidth: number;
  scale: number;
  includetext: boolean;
  textsize?: number;
  paddingwidth?: number;
  paddingheight?: number;
};

export type BarcodeStyleGroup = 'label-look' | 'retail' | 'industrial' | 'logistics';

export type BarcodeStyleDefinition = {
  id: string;
  name: string;
  description: string;
  group: BarcodeStyleGroup;
  bcid: string;
  /** Fixed sample for thumbnails (valid for numeric-only symbologies). */
  sampleValue: string;
  render: BarcodeRenderOptions;
  numericOnly?: boolean;
};

export const BARCODE_STYLE_GROUPS: { id: BarcodeStyleGroup; title: string; subtitle: string }[] = [
  {
    id: 'label-look',
    title: 'Label looks',
    subtitle: 'Same Code 128 data, different size and density — like common printed labels.',
  },
  {
    id: 'retail',
    title: 'Retail barcodes',
    subtitle: 'EAN / UPC standards for products on store shelves.',
  },
  {
    id: 'industrial',
    title: 'Industrial & warehouse',
    subtitle: 'Alphanumeric or numeric codes for assets, bins, and cartons.',
  },
  {
    id: 'logistics',
    title: 'Shipping & logistics',
    subtitle: 'Cartons, pallets, and supply-chain labeling.',
  },
];

/** Visual layouts (reference sheet: standard, tall, compact, mini, wide, dense). */
const LABEL_LOOKS: BarcodeStyleDefinition[] = [
  {
    id: 'look-standard',
    name: 'Standard retail',
    description: 'Medium height, numbers under bars (most common).',
    group: 'label-look',
    bcid: 'code128',
    sampleValue: '01234567',
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true, textsize: 10 },
  },
  {
    id: 'look-tall',
    name: 'Tall label',
    description: 'Taller bars for shipping labels or distant scanning.',
    group: 'label-look',
    bcid: 'code128',
    sampleValue: 'ABC-01234567',
    render: { height: 22, moduleWidth: 2, scale: 2, includetext: true, textsize: 11 },
  },
  {
    id: 'look-compact',
    name: 'Compact',
    description: 'Shorter footprint — more labels per sheet.',
    group: 'label-look',
    bcid: 'code128',
    sampleValue: '0123-4567',
    render: { height: 8, moduleWidth: 2, scale: 2, includetext: true, textsize: 9 },
  },
  {
    id: 'look-mini',
    name: 'Mini tag',
    description: 'Small jewelry / tiny product stickers.',
    group: 'label-look',
    bcid: 'code128',
    sampleValue: '123456',
    render: { height: 6, moduleWidth: 1, scale: 2, includetext: true, textsize: 8 },
  },
  {
    id: 'look-wide',
    name: 'Wide logistics',
    description: 'Wider modules for long codes on cartons.',
    group: 'label-look',
    bcid: 'code128',
    sampleValue: '0123456789012',
    render: { height: 10, moduleWidth: 3, scale: 2, includetext: true, textsize: 9 },
  },
  {
    id: 'look-dense',
    name: 'High density',
    description: 'Thin modules — maximum data in less width.',
    group: 'label-look',
    bcid: 'code128',
    sampleValue: '0123456789012345',
    render: { height: 10, moduleWidth: 1, scale: 2, includetext: true, textsize: 8 },
  },
  {
    id: 'look-bars-only',
    name: 'Bars only',
    description: 'No human-readable text under the bars.',
    group: 'label-look',
    bcid: 'code128',
    sampleValue: '01234567',
    render: { height: 14, moduleWidth: 2, scale: 2, includetext: false },
  },
];

const RETAIL: BarcodeStyleDefinition[] = [
  {
    id: 'sym-code128',
    name: 'Code 128',
    description: 'Universal alphanumeric — recommended default.',
    group: 'retail',
    bcid: 'code128',
    sampleValue: 'SKU-1001',
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-ean13',
    name: 'EAN-13',
    description: '13-digit retail (Europe & global).',
    group: 'retail',
    bcid: 'ean13',
    sampleValue: '5901234123457',
    numericOnly: true,
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-ean8',
    name: 'EAN-8',
    description: '8-digit compact retail code.',
    group: 'retail',
    bcid: 'ean8',
    sampleValue: '96385074',
    numericOnly: true,
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-upca',
    name: 'UPC-A',
    description: '12-digit US / Canada retail.',
    group: 'retail',
    bcid: 'upca',
    sampleValue: '012345678905',
    numericOnly: true,
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-upce',
    name: 'UPC-E',
    description: 'Compressed UPC for small packages.',
    group: 'retail',
    bcid: 'upce',
    sampleValue: '01234565',
    numericOnly: true,
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-isbn',
    name: 'ISBN / ISSN',
    description: 'Books and periodicals.',
    group: 'retail',
    bcid: 'isbn',
    sampleValue: '978-0-201-37962-4',
    numericOnly: true,
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
];

const INDUSTRIAL: BarcodeStyleDefinition[] = [
  {
    id: 'sym-code39',
    name: 'Code 39',
    description: 'Letters, numbers, and some symbols.',
    group: 'industrial',
    bcid: 'code39',
    sampleValue: 'CODE39',
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-code39ext',
    name: 'Code 39 Extended',
    description: 'Full ASCII in Code 39 family.',
    group: 'industrial',
    bcid: 'code39ext',
    sampleValue: 'Code39+',
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-code93',
    name: 'Code 93',
    description: 'Dense alternative to Code 39.',
    group: 'industrial',
    bcid: 'code93',
    sampleValue: 'CODE93',
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-code25',
    name: 'Code 25',
    description: 'Industrial numeric (Code 25).',
    group: 'industrial',
    bcid: 'code2of5',
    sampleValue: '123456',
    numericOnly: true,
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-codabar',
    name: 'Codabar',
    description: 'Libraries, blood banks, logistics forms.',
    group: 'industrial',
    bcid: 'rationalizedCodabar',
    sampleValue: 'A40156B',
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-msi',
    name: 'MSI',
    description: 'Inventory / warehouse shelving.',
    group: 'industrial',
    bcid: 'msi',
    sampleValue: '123456',
    numericOnly: true,
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-code11',
    name: 'Code 11',
    description: 'Telecom equipment labeling.',
    group: 'industrial',
    bcid: 'code11',
    sampleValue: '12345',
    numericOnly: true,
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-plessey',
    name: 'Plessey',
    description: 'Retail shelf and asset tags.',
    group: 'industrial',
    bcid: 'plessey',
    sampleValue: '12345',
    numericOnly: true,
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
];

const LOGISTICS: BarcodeStyleDefinition[] = [
  {
    id: 'sym-i2of5',
    name: 'Interleaved 2 of 5',
    description: 'Cartons and warehouse — numeric pairs.',
    group: 'logistics',
    bcid: 'interleaved2of5',
    sampleValue: '1234567890',
    numericOnly: true,
    render: { height: 14, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-itf14',
    name: 'ITF-14 / SCC-14',
    description: 'Shipping cartons (14 digits).',
    group: 'logistics',
    bcid: 'itf14',
    sampleValue: '12345678901231',
    numericOnly: true,
    render: { height: 14, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-gs128',
    name: 'GS1-128',
    description: 'Supply chain with application identifiers.',
    group: 'logistics',
    bcid: 'gs1-128',
    sampleValue: '(01)09501101530003',
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
  {
    id: 'sym-ean14',
    name: 'EAN-14',
    description: 'Trade item / carton identification.',
    group: 'logistics',
    bcid: 'ean14',
    sampleValue: '(01)09528765432108',
    numericOnly: true,
    render: { height: 12, moduleWidth: 2, scale: 2, includetext: true },
  },
];

export const ALL_BARCODE_STYLES: BarcodeStyleDefinition[] = [
  ...LABEL_LOOKS,
  ...RETAIL,
  ...INDUSTRIAL,
  ...LOGISTICS,
];

export const DEFAULT_BARCODE_STYLE_ID = 'look-standard';

export function getBarcodeStyleById(id: string): BarcodeStyleDefinition {
  return ALL_BARCODE_STYLES.find((s) => s.id === id) ?? LABEL_LOOKS[0];
}

export function getStylesByGroup(group: BarcodeStyleGroup): BarcodeStyleDefinition[] {
  return ALL_BARCODE_STYLES.filter((s) => s.group === group);
}
