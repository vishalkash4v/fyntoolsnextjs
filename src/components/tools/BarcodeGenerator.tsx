'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles } from 'lucide-react';
import {
  buildBarcodePrintPlan,
  buildPrintLayoutSummary,
  buildPrintPlanSummary,
  chunkForPages,
  computeBarcodePrintLayout,
  fitPrintGridToPaper,
  getLabelSlotOffsets,
  DEFAULT_LABEL_SHEET_PRESET_ID,
  getLabelSheetPreset,
  LABEL_SHEET_PRESETS,
  type ColumnsSetting,
  type LabelSheetPresetId,
} from '@/utils/barcodePrintLayout';
import { normalizeBarcodeText } from '@/utils/barcodeSampleValues';
import {
  DEFAULT_BARCODE_STYLE_ID,
  getBarcodeStyleById,
  type BarcodeStyleDefinition,
} from '@/data/barcodeStyles';
import BarcodeStylePicker from '@/components/tools/BarcodeStylePicker';

type BarcodeResult = {
  value: string;
  dataUrl: string;
};

const PAPER_PRESETS = [
  { value: 'a4', label: 'A4 (210 x 297 mm)', width: 210, height: 297 },
  { value: 'letter', label: 'Letter (216 x 279 mm)', width: 216, height: 279 },
  { value: 'label-4x6', label: 'Label 4x6 in (102 x 152 mm)', width: 102, height: 152 },
  { value: 'a5', label: 'A5 (148 x 210 mm)', width: 148, height: 210 },
  { value: 'custom', label: 'Custom (Manual)', width: 100, height: 150 },
];

const DEFAULT_STYLE = getBarcodeStyleById(DEFAULT_BARCODE_STYLE_ID);

const BarcodeGenerator = () => {
  const router = useRouter();
  const [bulkInput, setBulkInput] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState(DEFAULT_BARCODE_STYLE_ID);
  const [barcodeType, setBarcodeType] = useState(DEFAULT_STYLE.bcid);
  const [moduleWidth, setModuleWidth] = useState(DEFAULT_STYLE.render.moduleWidth);
  const [barcodeColor, setBarcodeColor] = useState('#000000');
  const [hideText, setHideText] = useState(!DEFAULT_STYLE.render.includetext);
  const [autoFitToPaper, setAutoFitToPaper] = useState(true);
  const [labelSheetPreset, setLabelSheetPreset] = useState<LabelSheetPresetId>(DEFAULT_LABEL_SHEET_PRESET_ID);
  const [paperPreset, setPaperPreset] = useState('a4');
  const [manualWidthMm, setManualWidthMm] = useState(100);
  const [manualHeightMm, setManualHeightMm] = useState(150);
  const [barcodeHeight, setBarcodeHeight] = useState(DEFAULT_STYLE.render.height);
  const [columnsPerRow, setColumnsPerRow] = useState<ColumnsSetting>('auto');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [randomCount, setRandomCount] = useState(20);
  const [fixedLength, setFixedLength] = useState(10);
  const [aiFillPending, setAiFillPending] = useState(true);
  const [results, setResults] = useState<BarcodeResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [generateProgress, setGenerateProgress] = useState<{ done: number; total: number } | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [avgMsPerItem, setAvgMsPerItem] = useState(18);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const pauseRef = useRef(false);
  const cancelRef = useRef(false);
  const autoGenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasGeneratedOnceRef = useRef(false);
  const generationEpochRef = useRef(0);

  const selectedPaper = useMemo(() => {
    if (paperPreset === 'custom') {
      return { width: manualWidthMm, height: manualHeightMm };
    }
    return PAPER_PRESETS.find((paper) => paper.value === paperPreset) ?? PAPER_PRESETS[0];
  }, [manualHeightMm, manualWidthMm, paperPreset]);
  const activeStyle = useMemo(() => getBarcodeStyleById(selectedStyleId), [selectedStyleId]);

  const applyBarcodeStyle = (style: BarcodeStyleDefinition) => {
    setSelectedStyleId(style.id);
    setBarcodeType(style.bcid);
    setBarcodeHeight(style.render.height);
    setModuleWidth(style.render.moduleWidth);
    setHideText(!style.render.includetext);
  };

  const sheetPreset = useMemo(() => getLabelSheetPreset(labelSheetPreset), [labelSheetPreset]);

  const printLayout = useMemo(
    () =>
      computeBarcodePrintLayout(
        { width: selectedPaper.width, height: selectedPaper.height },
        false,
        hideText,
        barcodeHeight,
        columnsPerRow,
        labelSheetPreset,
      ),
    [selectedPaper, hideText, barcodeHeight, columnsPerRow, labelSheetPreset],
  );

  const inputLineCount = useMemo(
    () =>
      bulkInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean).length,
    [bulkInput],
  );

  const printPlan = useMemo(
    () => buildBarcodePrintPlan(inputLineCount, printLayout),
    [inputLineCount, printLayout],
  );

  const printPlanSummary = useMemo(() => buildPrintPlanSummary(printPlan), [printPlan]);

  const paperPresetLabel = useMemo(() => {
    return PAPER_PRESETS.find((p) => p.value === paperPreset)?.label ?? 'selected paper';
  }, [paperPreset]);

  const layoutSummary = useMemo(
    () => buildPrintLayoutSummary(printLayout, paperPresetLabel),
    [printLayout, paperPresetLabel],
  );

  const setMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setStatus({ type, text });
  };

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    cancelRef.current = isCancelled;
  }, [isCancelled]);

  useEffect(() => {
    if (labelSheetPreset === 'auto-maximize') return;
    const preset = getLabelSheetPreset(labelSheetPreset);
    if (preset.paper.width === 210) setPaperPreset('a4');
    else if (preset.paper.width === 216) setPaperPreset('letter');
  }, [labelSheetPreset]);

  const getInputs = () => {
    return bulkInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const fillSampleLines = () => {
    const lineCount =
      inputLineCount > 0
        ? inputLineCount
        : Math.min(20, Math.max(5, printPlan.labelsPerPage || 10));
    const lines = Array.from({ length: lineCount }, (_, index) =>
      activeStyle.numericOnly
        ? normalizeBarcodeText(barcodeType, String(100000000000 + index + 1))
        : `SKU-${1001 + index}`,
    );
    setBulkInput(lines.join('\n'));
    setMessage('info', `Added ${lineCount} sample line${lineCount === 1 ? '' : 's'} (one barcode per line).`);
  };

  const clearBulkInput = () => {
    setBulkInput('');
    setResults([]);
    setStatus(null);
    hasGeneratedOnceRef.current = false;
  };

  const generateOne = useCallback(
    async (rawValue: string) => {
      const canvas = document.createElement('canvas');
      const value = normalizeBarcodeText(barcodeType, rawValue);
      const renderScale = autoFitToPaper ? activeStyle.render.scale : activeStyle.render.scale + 1;

      const showText = !hideText;
      const basePadW = activeStyle.render.paddingwidth ?? 6;
      const basePadH = activeStyle.render.paddingheight ?? 6;

      const bwipjs = (await import('bwip-js')).default;
      await bwipjs.toCanvas(canvas, {
        bcid: barcodeType,
        text: value,
        includetext: showText,
        scale: renderScale,
        height: barcodeHeight,
        width: autoFitToPaper ? moduleWidth : Math.max(moduleWidth, moduleWidth + 1),
        paddingwidth: basePadW,
        paddingheight: showText ? basePadH + 4 : basePadH,
        backgroundcolor: 'FFFFFF',
        barcolor: barcodeColor.replace('#', '').toUpperCase(),
        ...(showText && activeStyle.render.textsize ? { textsize: activeStyle.render.textsize } : {}),
      });

      return { dataUrl: canvas.toDataURL('image/png') };
    },
    [activeStyle, autoFitToPaper, barcodeColor, barcodeHeight, barcodeType, hideText, moduleWidth],
  );

  const runGeneration = useCallback(
    async (options?: { silent?: boolean }) => {
      const epoch = ++generationEpochRef.current;
      setStatus(null);
      setIsCancelled(false);
      setIsPaused(false);
      cancelRef.current = false;
      const values = bulkInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      if (values.length === 0) {
        setResults([]);
        if (!options?.silent) {
          setMessage('error', 'Enter one or more values in the bulk input (one per line).');
        }
        return;
      }

      if (values.length > 1200) {
        if (!options?.silent) {
          setMessage('error', 'Keep bulk generation to 1200 values or fewer at once.');
        }
        return;
      }

      setIsGenerating(true);
      setGenerateProgress({ done: 0, total: values.length });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const generated: BarcodeResult[] = [];
      const failed: string[] = [];
      const startedAt = performance.now();
      for (let index = 0; index < values.length; index += 1) {
        if (epoch !== generationEpochRef.current || cancelRef.current) break;
        while (pauseRef.current && !cancelRef.current && epoch === generationEpochRef.current) {
          await new Promise<void>((resolve) => setTimeout(resolve, 120));
        }
        if (epoch !== generationEpochRef.current || cancelRef.current) break;

        const raw = values[index];
        try {
          const { dataUrl } = await generateOne(raw);
          generated.push({ value: raw, dataUrl });
        } catch {
          failed.push(raw);
        }
        if ((index + 1) % 10 === 0 || index === values.length - 1) {
          setGenerateProgress({ done: index + 1, total: values.length });
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }
      }

      if (epoch !== generationEpochRef.current) {
        setIsGenerating(false);
        setGenerateProgress(null);
        return;
      }

      setResults(generated);
      hasGeneratedOnceRef.current = generated.length > 0;
      const totalProcessed = generated.length + failed.length;
      if (totalProcessed > 0) {
        const elapsed = performance.now() - startedAt;
        setAvgMsPerItem(Math.max(6, Math.round(elapsed / totalProcessed)));
      }

      if (!options?.silent) {
        if (cancelRef.current) {
          setMessage('info', `Generation cancelled. Completed ${generated.length} item(s).`);
        } else if (generated.length > 0 && failed.length === 0) {
          const pages = Math.ceil(generated.length / printLayout.labelsPerPage);
          setMessage(
            'success',
            `${generated.length} of ${values.length} line(s) generated — fits ${pages} print page${pages === 1 ? '' : 's'} (${printLayout.labelsPerPage} labels/sheet).`,
          );
        } else if (generated.length > 0) {
          setMessage(
            'info',
            `${generated.length} generated, ${failed.length} failed for this barcode type.`,
          );
        } else {
          setMessage(
            'error',
            'No barcodes generated for selected type. Try Code 128 or check your data matches the format (some types need digits only).',
          );
        }
      }

      setIsGenerating(false);
      setGenerateProgress(null);
      setIsPaused(false);
      setIsCancelled(false);
    },
    [bulkInput, generateOne, printLayout.labelsPerPage],
  );

  const generateBarcodes = () => {
    hasGeneratedOnceRef.current = true;
    void runGeneration();
  };

  useEffect(() => {
    const values = bulkInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (values.length === 0) {
      setResults([]);
      return;
    }

    if (autoGenTimerRef.current) clearTimeout(autoGenTimerRef.current);
    autoGenTimerRef.current = setTimeout(() => {
      void runGeneration({ silent: !hasGeneratedOnceRef.current });
      hasGeneratedOnceRef.current = true;
    }, 450);

    return () => {
      if (autoGenTimerRef.current) clearTimeout(autoGenTimerRef.current);
    };
  }, [
    bulkInput,
    barcodeType,
    selectedStyleId,
    barcodeColor,
    hideText,
    autoFitToPaper,
    barcodeHeight,
    moduleWidth,
    labelSheetPreset,
    paperPreset,
    manualWidthMm,
    manualHeightMm,
    columnsPerRow,
    runGeneration,
  ]);

  const pauseOrResumeGeneration = () => {
    if (!isGenerating) return;
    setIsPaused((prev) => !prev);
  };

  const cancelGeneration = () => {
    if (!isGenerating) return;
    setIsCancelled(true);
    cancelRef.current = true;
    setMessage('info', 'Cancelling generation...');
  };

  const estimatedTimeLabel = useMemo(() => {
    if (!generateProgress) return null;
    const remaining = Math.max(0, generateProgress.total - generateProgress.done);
    const estimatedMs = remaining * avgMsPerItem;
    const seconds = Math.ceil(estimatedMs / 1000);
    if (seconds < 60) return `~${seconds}s remaining`;
    const minutes = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `~${minutes}m ${rem}s remaining`;
  }, [avgMsPerItem, generateProgress]);

  const generateRandomBulk = () => {
    const count = Math.max(1, Math.min(1200, Number.isFinite(randomCount) ? randomCount : 20));
    const length = Math.max(4, Math.min(32, Number.isFinite(fixedLength) ? fixedLength : 10));
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomValues = Array.from({ length: count }, () => {
      let out = '';
      for (let i = 0; i < length; i += 1) {
        out += chars[Math.floor(Math.random() * chars.length)];
      }
      return out;
    });
    setBulkInput(randomValues.join('\n'));
    setAiFillPending(false);
    setMessage('info', `${count} random values added to bulk input.`);
  };

  const downloadAll = async () => {
    if (results.length === 0) {
      setMessage('error', 'Generate barcode(s) first.');
      return;
    }

    setIsDownloading(true);
    try {
      if (results.length === 1) {
        const link = document.createElement('a');
        link.download = `barcode-${results[0].value}.png`;
        link.href = results[0].dataUrl;
        link.click();
        setMessage('success', 'Downloaded 1 barcode PNG.');
        return;
      }

      const [{ default: JSZip }, fileSaver] = await Promise.all([
        import('jszip'),
        import('file-saver'),
      ]);
      const zip = new JSZip();
      await Promise.all(
        results.map(async (item, index) => {
          const response = await fetch(item.dataUrl);
          const blob = await response.blob();
          const safeValue = item.value.replace(/[^\w.-]/g, '_').slice(0, 40);
          zip.file(`barcode-${index + 1}-${safeValue || 'item'}.png`, blob);
        }),
      );
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      fileSaver.saveAs(zipBlob, `barcodes-${barcodeType}.zip`);
      setMessage('success', `Downloaded ZIP with ${results.length} barcodes.`);
    } catch {
      setMessage('error', 'Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const printAll = () => {
    if (results.length === 0) {
      setMessage('error', 'Generate barcode(s) first.');
      return;
    }

    setIsPrinting(true);
    setStatus(null);
    const fitted = fitPrintGridToPaper(printLayout, selectedPaper);
    const {
      columns,
      rows,
      cellWidthMm,
      cellHeightMm,
      pageMarginMm,
      gapMm,
      labelsPerPage,
      printableWidthMm,
      printableHeightMm,
    } = fitted;
    const mediaHeightMm = Math.max(8, cellHeightMm - 2);
    const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const renderLabel = (item: BarcodeResult, slotIndex: number) => {
      const { leftMm, topMm } = getLabelSlotOffsets(
        slotIndex,
        columns,
        cellWidthMm,
        cellHeightMm,
        gapMm,
        pageMarginMm,
      );
      return `<div class="label" style="left:${leftMm}mm;top:${topMm}mm;width:${cellWidthMm}mm;height:${cellHeightMm}mm"><div class="media"><img src="${item.dataUrl}" alt="Barcode ${escapeHtml(item.value)}" /></div></div>`;
    };
    const pages = chunkForPages(results, labelsPerPage);
    const sheetsHtml = pages
      .map((pageItems, pageIndex) => {
        const labels = pageItems.map((item, slotIndex) => renderLabel(item, slotIndex)).join('');
        const breakBefore = pageIndex > 0 ? ' print-page-break' : '';
        return `<div class="print-page${breakBefore}">${labels}</div>`;
      })
      .join('');
    const pageCount = pages.length;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const html = `
      <html>
        <head>
          <title>Print Barcodes</title>
          <style>
            @page { size: ${selectedPaper.width}mm ${selectedPaper.height}mm; margin: 0; }
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #fff; }
            .print-page {
              position: relative;
              width: ${selectedPaper.width}mm;
              height: ${selectedPaper.height}mm;
              margin: 0;
              padding: 0;
              overflow: hidden;
              box-sizing: border-box;
            }
            .print-page-break {
              page-break-before: always;
              break-before: page;
            }
            .label {
              position: absolute;
              box-sizing: border-box;
              border: 0.2mm solid #d1d5db;
              border-radius: 1mm;
              padding: 1mm;
              background: #fff;
              text-align: center;
              display: block;
              overflow: hidden;
            }
            .media {
              width: 100%;
              height: ${mediaHeightMm}mm;
              line-height: 0;
              text-align: center;
              overflow: hidden;
            }
            img { max-width: 100%; max-height: 100%; width: 100%; height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          ${sheetsHtml}
        </body>
      </html>
    `;

    iframe.onload = () => {
      const printWindow = iframe.contentWindow;
      if (!printWindow) {
        setMessage('error', 'Print failed. Please try again.');
        setIsPrinting(false);
        document.body.removeChild(iframe);
        return;
      }
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        setIsPrinting(false);
        const pageCount = pages.length;
        setMessage(
          'success',
          `Print dialog opened — ${results.length} barcode${results.length === 1 ? '' : 's'} on ${pageCount} page${pageCount === 1 ? '' : 's'} (${printLayout.labelsPerPage} labels/sheet).`,
        );
        document.body.removeChild(iframe);
      }, 200);
    };
    iframe.srcdoc = html;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
      <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Barcode Generator</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push('/barcode-scanner-online')}
              className="p-2 px-3 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Barcode Scanner
            </button>
            <button
              type="button"
              onClick={() => router.push('/qr-code-generator')}
              className="p-2 px-3 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              QR Generator
            </button>
            <button
              type="button"
              onClick={() => router.push('/qr-scanner')}
              className="p-2 px-3 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              QR Reader
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Use one bulk box for both single and multiple values. Enter one value per line.
        </p>

        <p className="text-sm bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
          This tool creates <strong>1D linear barcodes</strong> only (lines like on product packaging). Pick a look below —
          For <strong>QR codes</strong> use the{' '}
          <button
            type="button"
            onClick={() => router.push('/qr-code-generator')}
            className="font-semibold text-blue-700 dark:text-blue-300 underline underline-offset-2"
          >
            QR Code Generator
          </button>{' '}
          or{' '}
          <button
            type="button"
            onClick={() => router.push('/qr-scanner')}
            className="font-semibold text-blue-700 dark:text-blue-300 underline underline-offset-2"
          >
            QR Scanner
          </button>
          .
        </p>

        <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-900/40 p-4">
          <BarcodeStylePicker
            selectedStyleId={selectedStyleId}
            onSelect={applyBarcodeStyle}
            barcodeColor={barcodeColor}
          />
        </div>

        <div className="max-w-xs mb-4">
          <label htmlFor="barcode-color" className="block text-sm font-medium mb-2">
            Barcode color
          </label>
          <input
            id="barcode-color"
            type="color"
            value={barcodeColor}
            onChange={(event) => setBarcodeColor(event.target.value)}
            className="w-full h-10 p-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Selected: <strong>{activeStyle.name}</strong> ({barcodeType})
            {activeStyle.numericOnly ? ' — use numbers only in your list' : ''}
          </p>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <label htmlFor="bulk-input" className="block text-sm font-medium">
              Barcode values{' '}
              <span className="text-gray-500 font-normal">
                ({inputLineCount} line{inputLineCount === 1 ? '' : 's'} → {printPlan.pageCount || 0} print page
                {(printPlan.pageCount || 0) === 1 ? '' : 's'})
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fillSampleLines}
                className="p-2 px-3 text-xs border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Insert samples
              </button>
              <button
                type="button"
                onClick={clearBulkInput}
                className="p-2 px-3 text-xs border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowAiPanel((prev) => !prev)}
                className="p-2 px-3 text-xs border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {showAiPanel ? 'Hide AI Options' : 'AI Bulk Fill'}
              </button>
            </div>
          </div>
          <textarea
            id="bulk-input"
            value={bulkInput}
            onChange={(event) => setBulkInput(event.target.value)}
            rows={6}
            placeholder={'SKU-1001\nSKU-1002\nSKU-1003'}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {showAiPanel && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 rounded-md border p-3 bg-gray-50 dark:bg-gray-900/30">
            <div>
              <label htmlFor="random-count" className="block text-sm font-medium mb-2">
                Count (max 1200)
              </label>
              <input
                id="random-count"
                type="number"
                min={1}
                max={1200}
                value={randomCount}
                onChange={(event) => setRandomCount(Number(event.target.value) || 20)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="fixed-length" className="block text-sm font-medium mb-2">
                Exact Length (fixed)
              </label>
              <input
                id="fixed-length"
                type="number"
                min={4}
                max={32}
                value={fixedLength}
                onChange={(event) => setFixedLength(Number(event.target.value) || 10)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generateRandomBulk}
                className="w-full p-2 px-4 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Create Random Bulk Values
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hideText}
              onChange={(event) => setHideText(event.target.checked)}
            />
            Hide original text below barcode
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoFitToPaper}
              onChange={(event) => setAutoFitToPaper(event.target.checked)}
            />
            Auto Resize to Fit Label Paper
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-2">
            <label htmlFor="label-sheet-preset" className="block text-sm font-medium mb-2">
              Label sheet (standard)
            </label>
            <select
              id="label-sheet-preset"
              value={labelSheetPreset}
              onChange={(event) => setLabelSheetPreset(event.target.value as LabelSheetPresetId)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {LABEL_SHEET_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sheetPreset.description}</p>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="paper-preset" className="block text-sm font-medium mb-2">
              Printer paper
            </label>
            <select
              id="paper-preset"
              value={paperPreset}
              onChange={(event) => setPaperPreset(event.target.value)}
              disabled={labelSheetPreset !== 'auto-maximize'}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {PAPER_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          {labelSheetPreset === 'auto-maximize' && (
            <div className="md:col-span-2">
              <label htmlFor="columns-per-row" className="block text-sm font-medium mb-2">
                Barcodes per row (auto mode)
              </label>
              <select
                id="columns-per-row"
                value={columnsPerRow === 'auto' ? 'auto' : String(columnsPerRow)}
                onChange={(event) => {
                  const v = event.target.value;
                  setColumnsPerRow(v === 'auto' ? 'auto' : Number(v));
                }}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="auto">Auto (maximize on paper)</option>
                <option value="1">1 column</option>
                <option value="2">2 columns</option>
                <option value="3">3 columns</option>
                <option value="4">4 columns</option>
                <option value="5">5 columns</option>
                <option value="6">6 columns</option>
                <option value="7">7 columns</option>
                <option value="8">8 columns</option>
              </select>
            </div>
          )}
          <div>
            <label htmlFor="manual-width" className="block text-sm font-medium mb-2">
              Manual Width (mm)
            </label>
            <input
              id="manual-width"
              type="number"
              min={20}
              max={500}
              value={manualWidthMm}
              disabled={paperPreset !== 'custom'}
              onChange={(event) => setManualWidthMm(Number(event.target.value) || 100)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="manual-height" className="block text-sm font-medium mb-2">
              Manual Height (mm)
            </label>
            <input
              id="manual-height"
              type="number"
              min={20}
              max={500}
              value={manualHeightMm}
              disabled={paperPreset !== 'custom'}
              onChange={(event) => setManualHeightMm(Number(event.target.value) || 150)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <p className="mt-3 text-sm rounded-md border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-200 px-3 py-2">
          <strong>Sheet layout:</strong> {layoutSummary}
          <br />
          <strong>Your list:</strong> {printPlanSummary}
        </p>

        <div className="mt-4 max-w-xs">
          <label htmlFor="barcode-height" className="block text-sm font-medium mb-2">
            Barcode Size: Height ({barcodeHeight})
          </label>
          <input
            id="barcode-height"
            type="range"
            min={8}
            max={40}
            value={barcodeHeight}
            onChange={(event) => setBarcodeHeight(Number(event.target.value))}
            className="w-full"
          />
        </div>

        {status && (
          <div
            className={`mt-4 rounded-md border p-3 text-sm ${
              status.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-300'
                : status.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800/40 dark:bg-green-950/20 dark:text-green-300'
                  : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/20 dark:text-blue-300'
            }`}
          >
            {status.text}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={generateBarcodes}
            disabled={isGenerating}
            className="p-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {isGenerating
              ? `Generating... ${generateProgress ? `${generateProgress.done}/${generateProgress.total}` : ''}`
              : 'Generate Barcode(s)'}
          </button>
          {isGenerating && (
            <button
              onClick={pauseOrResumeGeneration}
              className="p-2 px-4 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
          {isGenerating && (
            <button
              onClick={cancelGeneration}
              className="p-2 px-4 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:border-red-800/40 dark:text-red-300 dark:hover:bg-red-950/20"
            >
              Cancel
            </button>
          )}
          <button
            onClick={downloadAll}
            disabled={isDownloading}
            className="p-2 px-4 border rounded-md hover:bg-gray-100 disabled:opacity-60 dark:hover:bg-gray-700"
          >
            {isDownloading ? 'Downloading...' : 'Download (Single/ZIP)'}
          </button>
          <button
            onClick={printAll}
            disabled={isPrinting}
            className="p-2 px-4 border rounded-md hover:bg-gray-100 disabled:opacity-60 dark:hover:bg-gray-700"
          >
            {isPrinting ? 'Opening Print...' : 'Print by Paper Type'}
          </button>
        </div>
        {isGenerating && generateProgress && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Progress: {generateProgress.done}/{generateProgress.total}
            {estimatedTimeLabel ? ` - ${estimatedTimeLabel}` : ''}
            {isPaused ? ' (Paused)' : ''}
          </p>
        )}

        {results.length > 0 && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700/40 border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Generated Output ({results.length})</h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((result, index) => (
                <div
                  key={`${result.value}-${index}`}
                  className="bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-sm"
                >
                  <div
                    className={`flex items-center justify-center overflow-hidden rounded bg-white ${hideText ? 'h-28' : 'h-36'}`}
                  >
                    <img src={result.dataUrl} alt={`Barcode ${result.value}`} className="max-w-full max-h-full w-auto h-auto object-contain" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeGenerator;