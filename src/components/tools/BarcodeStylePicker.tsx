'use client';
import React, { useEffect, useState } from 'react';
import bwipjs from 'bwip-js';
import { Barcode, Check, Loader2 } from 'lucide-react';
import {
  ALL_BARCODE_STYLES,
  BARCODE_STYLE_GROUPS,
  type BarcodeStyleDefinition,
} from '@/data/barcodeStyles';
import { getPreviewRenderText } from '@/utils/barcodeSampleValues';

type Props = {
  selectedStyleId: string;
  onSelect: (style: BarcodeStyleDefinition) => void;
  barcodeColor: string;
};

type PreviewStatus = 'loading' | 'ok' | 'fail';

async function renderStylePreview(style: BarcodeStyleDefinition, color: string): Promise<string> {
  const canvas = document.createElement('canvas');
  const text = getPreviewRenderText(style.bcid, style.sampleValue);
  await bwipjs.toCanvas(canvas, {
    bcid: style.bcid,
    text,
    includetext: style.render.includetext,
    scale: style.render.scale,
    height: style.render.height,
    width: style.render.moduleWidth,
    paddingwidth: style.render.paddingwidth ?? 4,
    paddingheight: style.render.paddingheight ?? 4,
    backgroundcolor: 'FFFFFF',
    barcolor: color.replace('#', '').toUpperCase(),
    ...(style.render.textsize ? { textsize: style.render.textsize } : {}),
  });
  return canvas.toDataURL('image/png');
}

const BarcodeStylePicker: React.FC<Props> = ({ selectedStyleId, onSelect, barcodeColor }) => {
  const [previewStatus, setPreviewStatus] = useState<Record<string, PreviewStatus>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [loadedCount, setLoadedCount] = useState(0);

  const totalCount = ALL_BARCODE_STYLES.length;
  const isLoading = loadedCount < totalCount;

  useEffect(() => {
    let cancelled = false;
    const initialStatus: Record<string, PreviewStatus> = {};
    ALL_BARCODE_STYLES.forEach((s) => {
      initialStatus[s.id] = 'loading';
    });
    setPreviewStatus(initialStatus);
    setPreviewUrls({});
    setLoadedCount(0);

    const run = async () => {
      const outcomes = await Promise.all(
        ALL_BARCODE_STYLES.map(async (style) => {
          try {
            const url = await renderStylePreview(style, barcodeColor);
            return { id: style.id, status: 'ok' as const, url };
          } catch {
            return { id: style.id, status: 'fail' as const, url: '' };
          }
        }),
      );
      if (cancelled) return;
      const urls: Record<string, string> = {};
      const statuses: Record<string, PreviewStatus> = {};
      outcomes.forEach(({ id, status, url }) => {
        statuses[id] = status;
        if (url) urls[id] = url;
      });
      setPreviewUrls(urls);
      setPreviewStatus(statuses);
      setLoadedCount(totalCount);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [barcodeColor]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Choose barcode look</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
            Tap a preview to set format and label style. For square QR codes use our{' '}
            <a href="/qr-code-generator" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">
              QR Code Generator
            </a>
            {' '}or{' '}
            <a href="/qr-scanner" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">
              QR Scanner
            </a>
            .
          </p>
        </div>
        {isLoading ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Previews {loadedCount}/{totalCount}
          </span>
        ) : (
          <span className="text-xs text-gray-500">{totalCount} styles ready</span>
        )}
      </div>

      {BARCODE_STYLE_GROUPS.map((groupMeta) => {
        const styles = ALL_BARCODE_STYLES.filter((s) => s.group === groupMeta.id);
        return (
          <section key={groupMeta.id} aria-labelledby={`barcode-group-${groupMeta.id}`}>
            <h4 id={`barcode-group-${groupMeta.id}`} className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {groupMeta.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{groupMeta.subtitle}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {styles.map((style) => {
                const selected = style.id === selectedStyleId;
                const status = previewStatus[style.id] ?? 'loading';
                const preview = previewUrls[style.id];
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => onSelect(style)}
                    className={`relative text-left rounded-lg border-2 bg-white dark:bg-gray-900 p-2 transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      selected
                        ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                    <div className="h-20 sm:h-24 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 overflow-hidden mb-2">
                      {status === 'ok' && preview ? (
                        <img
                          src={preview}
                          alt={`${style.name} sample`}
                          className="max-h-full max-w-full object-contain px-1"
                        />
                      ) : status === 'ok' ? (
                        <div className="flex flex-col items-center gap-1 text-gray-400 px-2">
                          <Barcode className="h-6 w-6" />
                          <span className="text-[9px] text-center leading-tight">Preview unavailable</span>
                        </div>
                      ) : status === 'fail' ? (
                        <div className="flex flex-col items-center gap-1 text-gray-400 px-2">
                          <Barcode className="h-6 w-6" />
                          <span className="text-[9px] text-center leading-tight">Preview unavailable</span>
                        </div>
                      ) : (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight pr-5">
                      {style.name}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {style.description}
                    </p>
                    {style.numericOnly && (
                      <span className="mt-1 inline-block text-[9px] uppercase tracking-wide text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1 rounded">
                        digits only
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default BarcodeStylePicker;
