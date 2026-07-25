/**
 * Normalize text for bwip-js symbologies (previews + bulk generation).
 */

/** Strip to digits only — symbologies that never use letters or GS1 parentheses. */
const DIGITS_ONLY_STRIP = new Set([
  'ean13',
  'ean8',
  'ean5',
  'ean2',
  'upca',
  'upce',
  'itf14',
  'interleaved2of5',
  'iata2of5',
  'postnet',
  'planet',
  'onecode',
  'msi',
  'code2of5',
  'code11',
  'plessey',
]);

/** Known-good samples for style thumbnails (checksum-valid where required). */
export const BARCODE_PREVIEW_SAMPLES: Record<string, string> = {
  'gs1-128': '(01)09521234543213',
  ean14: '(01) 0 952 8765 43210 8',
  isbn: '978-0-201-37962-4',
  issn: '0311-175X',
  ean13: '5901234123457',
  ean8: '96385074',
  upca: '012345678905',
  upce: '01234565',
  itf14: '12345678901231',
};

export function getPreviewSampleValue(bcid: string, fallback: string): string {
  return BARCODE_PREVIEW_SAMPLES[bcid] ?? fallback;
}

/** Text for style-picker thumbnails — uses validated samples without re-normalizing. */
export function getPreviewRenderText(bcid: string, fallback: string): string {
  if (BARCODE_PREVIEW_SAMPLES[bcid]) return BARCODE_PREVIEW_SAMPLES[bcid];
  return normalizeBarcodeText(bcid, fallback);
}

/** Mod-10 check digit (UPC-A / EAN-13 / ITF-14 weighting from bwip-js). */
export function computeMod10CheckDigit(dataDigits: string, mode: 'upca' | 'ean13'): string {
  let checksum = 0;
  for (let i = 0; i < dataDigits.length; i++) {
    const d = parseInt(dataDigits[i], 10);
    const oddIndex = i % 2 !== 0;
    if (mode === 'upca') {
      checksum += oddIndex ? d : d * 3;
    } else {
      checksum += oddIndex ? d * 3 : d;
    }
  }
  return String((10 - (checksum % 10)) % 10);
}

/** Data digits + valid check digit (recomputes check digit when input length is full code). */
export function withMod10CheckDigit(digits: string, dataLength: number, mode: 'upca' | 'ean13'): string {
  const only = digits.replace(/\D/g, '');
  const data = only.padStart(dataLength, '0').slice(-dataLength);
  return data + computeMod10CheckDigit(data, mode);
}

function formatIsbn13(digits: string): string {
  return `${digits.slice(0, 3)}-${digits.slice(3, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 12)}-${digits.slice(12)}`;
}

function formatIsbn10(digits: string): string {
  const d = digits.toUpperCase();
  return `${d.slice(0, 1)}-${d.slice(1, 4)}-${d.slice(4, 9)}-${d.slice(9)}`;
}

function formatIssn(digits: string): string {
  const d = digits.replace(/\D/g, '').padStart(8, '0').slice(-8);
  return `${d.slice(0, 4)}-${d.slice(4)}`;
}

function formatEan14FromDigits(digits: string): string {
  const gtin14 = withMod10CheckDigit(digits.replace(/\D/g, ''), 13, 'upca');
  return `(01)${gtin14}`;
}

export function normalizeBarcodeText(bcid: string, rawValue: string): string {
  const trimmed = rawValue.trim();
  if (!trimmed) return trimmed;

  if (bcid === 'ean14' || bcid === 'gs1-128') {
    if (trimmed.startsWith('(')) return trimmed;
  }

  if (bcid === 'isbn' || bcid === 'issn') {
    if (trimmed.includes('-')) return trimmed;
  }

  let value = trimmed;
  if (DIGITS_ONLY_STRIP.has(bcid)) {
    value = value.replace(/\D/g, '');
  }

  switch (bcid) {
    case 'ean13':
      return withMod10CheckDigit(value, 12, 'ean13');
    case 'ean8':
      return withMod10CheckDigit(value, 7, 'ean13');
    case 'ean5':
      return value.padStart(5, '0').slice(-5);
    case 'ean2':
      return value.padStart(2, '0').slice(-2);
    case 'ean14': {
      if (trimmed.startsWith('(')) return trimmed;
      const digits = trimmed.replace(/\D/g, '');
      return formatEan14FromDigits(digits);
    }
    case 'gs1-128': {
      if (trimmed.startsWith('(')) return trimmed;
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length >= 1) {
        return formatEan14FromDigits(digits.length >= 13 ? digits : digits.padStart(13, '0'));
      }
      return trimmed;
    }
    case 'upca':
      return withMod10CheckDigit(value, 11, 'upca');
    case 'upce': {
      const d = value.replace(/\D/g, '');
      if (d.length <= 7) return d.padStart(7, '0').slice(-7);
      return withMod10CheckDigit(d, 7, 'upca').slice(-8);
    }
    case 'isbn': {
      const digits = trimmed.replace(/[^0-9Xx]/g, '').toUpperCase();
      if (digits.length === 13) return formatIsbn13(digits);
      if (digits.length === 10) return formatIsbn10(digits);
      return trimmed;
    }
    case 'issn':
      return formatIssn(trimmed);
    case 'itf14':
      return withMod10CheckDigit(value, 13, 'upca');
    default:
      return value || trimmed;
  }
}
