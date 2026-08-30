#!/usr/bin/env node
/** Keep PDF.js worker in public/ for client-side PDF text extraction. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const dest = path.join(root, 'public/pdf.worker.min.mjs');

if (!fs.existsSync(src)) {
  console.warn('copy-pdf-worker: pdfjs-dist not installed — skip');
  process.exit(0);
}

fs.copyFileSync(src, dest);
console.log('copy-pdf-worker: public/pdf.worker.min.mjs');
