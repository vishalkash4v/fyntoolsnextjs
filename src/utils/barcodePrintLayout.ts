/**
 * Print layout for barcode label sheets (ISO paper + common Avery grids).
 */

export type PaperSize = { width: number; height: number };

export type BarcodePrintLayout = {
  columns: number;
  rows: number;
  labelsPerPage: number;
  cellWidthMm: number;
  cellHeightMm: number;
  pageMarginMm: number;
  gapMm: number;
  printableWidthMm: number;
  printableHeightMm: number;
  presetLabel?: string;
};

export type ColumnsSetting = 'auto' | number;

export type LabelSheetPresetId =
  | 'a4-avery-24'
  | 'a4-avery-14'
  | 'letter-avery-30'
  | 'auto-maximize';

export type LabelSheetPreset = {
  id: LabelSheetPresetId;
  label: string;
  description: string;
  paper: PaperSize;
  columns: number;
  rows: number;
  /** Typical label face size (mm) — used to compute gaps on the sheet. */
  cellWidthMm: number;
  cellHeightMm: number;
};

/** Industry-common label sheets (Avery-compatible dimensions). */
export const LABEL_SHEET_PRESETS: LabelSheetPreset[] = [
  {
    id: 'a4-avery-24',
    label: 'A4 — 24 labels (3×8, 63.5×38 mm)',
    description: 'Avery L7160 / standard EU retail & shipping labels',
    paper: { width: 210, height: 297 },
    columns: 3,
    rows: 8,
    cellWidthMm: 63.5,
    cellHeightMm: 38.1,
  },
  {
    id: 'a4-avery-14',
    label: 'A4 — 14 labels (2×7, 99×38 mm)',
    description: 'Avery L7163 — wide shipping labels',
    paper: { width: 210, height: 297 },
    columns: 2,
    rows: 7,
    cellWidthMm: 99.1,
    cellHeightMm: 38.1,
  },
  {
    id: 'letter-avery-30',
    label: 'US Letter — 30 labels (3×10, 66×25 mm)',
    description: 'Avery 5160 — common US barcode / address labels',
    paper: { width: 216, height: 279 },
    columns: 3,
    rows: 10,
    cellWidthMm: 66.04,
    cellHeightMm: 25.4,
  },
  {
    id: 'auto-maximize',
    label: 'Auto-fit (max labels per page)',
    description: 'Calculates the densest grid for your barcode height',
    paper: { width: 210, height: 297 },
    columns: 0,
    rows: 0,
    cellWidthMm: 40,
    cellHeightMm: 18,
  },
];

export const DEFAULT_LABEL_SHEET_PRESET_ID: LabelSheetPresetId = 'a4-avery-24';

const PAGE_MARGIN_MM = 4;
const CELL_GAP_MM = 2.5;
const MAX_COLUMNS = 8;

export function getLabelSheetPreset(id: LabelSheetPresetId): LabelSheetPreset {
  return LABEL_SHEET_PRESETS.find((p) => p.id === id) ?? LABEL_SHEET_PRESETS[0];
}

export function getMinCellSize(
  isMatrixType: boolean,
  hideText: boolean,
  barcodeHeight: number,
): { widthMm: number; heightMm: number } {
  if (isMatrixType) {
    const side = hideText ? 26 : 32;
    return { widthMm: side, heightMm: side };
  }
  const barStripMm = 9 + (barcodeHeight - 8) * 0.42;
  const captionMm = hideText ? 0 : 4.5;
  const paddingMm = 3.5;
  return {
    widthMm: 40,
    heightMm: barStripMm + captionMm + paddingMm,
  };
}

function layoutFromFixedPreset(
  preset: LabelSheetPreset,
  paper: PaperSize,
): BarcodePrintLayout {
  const pageMarginMm = PAGE_MARGIN_MM;
  const gapMm = CELL_GAP_MM;
  const printableWidthMm = paper.width - pageMarginMm * 2;
  const printableHeightMm = paper.height - pageMarginMm * 2;
  const { columns, rows, cellWidthMm, cellHeightMm } = preset;

  return {
    columns,
    rows,
    labelsPerPage: columns * rows,
    cellWidthMm,
    cellHeightMm,
    pageMarginMm,
    gapMm,
    printableWidthMm,
    printableHeightMm,
    presetLabel: preset.label,
  };
}

export function computeBarcodePrintLayout(
  paper: PaperSize,
  isMatrixType: boolean,
  hideText: boolean,
  barcodeHeight: number,
  columnsSetting: ColumnsSetting,
  sheetPresetId: LabelSheetPresetId = DEFAULT_LABEL_SHEET_PRESET_ID,
): BarcodePrintLayout {
  const preset = getLabelSheetPreset(sheetPresetId);

  if (sheetPresetId !== 'auto-maximize') {
    return layoutFromFixedPreset(preset, paper);
  }

  const printableWidthMm = paper.width - PAGE_MARGIN_MM * 2;
  const printableHeightMm = paper.height - PAGE_MARGIN_MM * 2;
  const minCell = getMinCellSize(isMatrixType, hideText, barcodeHeight);

  let columns: number;
  if (columnsSetting === 'auto') {
    columns = Math.floor((printableWidthMm + CELL_GAP_MM) / (minCell.widthMm + CELL_GAP_MM));
    columns = Math.max(1, Math.min(columns, MAX_COLUMNS));
  } else {
    columns = Math.max(1, Math.min(columnsSetting, MAX_COLUMNS));
  }

  const cellWidthMm = (printableWidthMm - (columns - 1) * CELL_GAP_MM) / columns;

  let rows = Math.floor((printableHeightMm + CELL_GAP_MM) / (minCell.heightMm + CELL_GAP_MM));
  rows = Math.max(1, rows);

  const cellHeightMm = (printableHeightMm - (rows - 1) * CELL_GAP_MM) / rows;

  return {
    columns,
    rows,
    labelsPerPage: columns * rows,
    cellWidthMm,
    cellHeightMm,
    pageMarginMm: PAGE_MARGIN_MM,
    gapMm: CELL_GAP_MM,
    printableWidthMm,
    printableHeightMm,
    presetLabel: 'Auto-fit grid',
  };
}

/**
 * Resize label cells so the full grid fits one physical page (print-safe).
 * Fixed Avery presets use nominal label sizes that can exceed printable height with gaps.
 */
export function fitPrintGridToPaper(
  layout: BarcodePrintLayout,
  paper: PaperSize,
): BarcodePrintLayout & { printableWidthMm: number; printableHeightMm: number } {
  const printableWidthMm = paper.width - layout.pageMarginMm * 2;
  const printableHeightMm = paper.height - layout.pageMarginMm * 2;
  const cellWidthMm =
    (printableWidthMm - (layout.columns - 1) * layout.gapMm) / layout.columns;
  const cellHeightMm =
    (printableHeightMm - (layout.rows - 1) * layout.gapMm) / layout.rows;

  return {
    ...layout,
    cellWidthMm,
    cellHeightMm,
    printableWidthMm,
    printableHeightMm,
  };
}

/** Top-left corner for a label slot on a print page (mm from page edge). */
export function getLabelSlotOffsets(
  slotIndex: number,
  columns: number,
  cellWidthMm: number,
  cellHeightMm: number,
  gapMm: number,
  pageMarginMm: number,
): { leftMm: number; topMm: number } {
  const col = slotIndex % columns;
  const row = Math.floor(slotIndex / columns);
  return {
    leftMm: pageMarginMm + col * (cellWidthMm + gapMm),
    topMm: pageMarginMm + row * (cellHeightMm + gapMm),
  };
}

export function chunkForPages<T>(items: T[], perPage: number): T[][] {
  if (perPage < 1) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  return pages.length ? pages : [[]];
}

export type BarcodePrintPlan = {
  inputCount: number;
  labelsPerPage: number;
  pageCount: number;
  usedOnLastPage: number;
  emptySlotsOnLastPage: number;
};

export function buildBarcodePrintPlan(inputCount: number, layout: BarcodePrintLayout): BarcodePrintPlan {
  if (inputCount <= 0) {
    return {
      inputCount: 0,
      labelsPerPage: layout.labelsPerPage,
      pageCount: 0,
      usedOnLastPage: 0,
      emptySlotsOnLastPage: layout.labelsPerPage,
    };
  }
  const pageCount = Math.ceil(inputCount / layout.labelsPerPage);
  const usedOnLastPage = inputCount % layout.labelsPerPage || layout.labelsPerPage;
  const emptySlotsOnLastPage = layout.labelsPerPage - usedOnLastPage;
  return {
    inputCount,
    labelsPerPage: layout.labelsPerPage,
    pageCount,
    usedOnLastPage,
    emptySlotsOnLastPage,
  };
}

export function buildPrintLayoutSummary(layout: BarcodePrintLayout, paperLabel: string): string {
  const grid = `${layout.columns} × ${layout.rows} = ${layout.labelsPerPage} labels/page`;
  if (layout.presetLabel) {
    return `${grid} (${layout.presetLabel})`;
  }
  return `${grid} on ${paperLabel}`;
}

export function buildPrintPlanSummary(plan: BarcodePrintPlan): string {
  if (plan.inputCount <= 0) {
    return `Enter values above — each line becomes one barcode on ${plan.labelsPerPage}-label sheets.`;
  }
  if (plan.pageCount === 1) {
    const waste =
      plan.emptySlotsOnLastPage > 0
        ? ` (${plan.emptySlotsOnLastPage} empty slot${plan.emptySlotsOnLastPage === 1 ? '' : 's'} on this sheet)`
        : ' (sheet full — no wasted slots)';
    return `${plan.inputCount} barcode${plan.inputCount === 1 ? '' : 's'} → 1 page, ${plan.usedOnLastPage} of ${plan.labelsPerPage} labels used${waste}.`;
  }
  return `${plan.inputCount} barcodes → ${plan.pageCount} pages (${plan.labelsPerPage} per page; last page uses ${plan.usedOnLastPage} of ${plan.labelsPerPage}).`;
}
