#!/usr/bin/env node
/** Copy FFmpeg.wasm core to public/ so Ad Maker loads same-origin (no CDN hang). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'node_modules/@ffmpeg/core/dist/esm');
const destDir = path.join(root, 'public/ffmpeg');

const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm'];

if (!fs.existsSync(srcDir)) {
  console.warn('copy-ffmpeg-core: @ffmpeg/core not installed — skip');
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
for (const name of files) {
  const src = path.join(srcDir, name);
  if (!fs.existsSync(src)) {
    console.warn(`copy-ffmpeg-core: missing ${name}`);
    continue;
  }
  fs.copyFileSync(src, path.join(destDir, name));
}
console.log('copy-ffmpeg-core: public/ffmpeg/{ffmpeg-core.js,ffmpeg-core.wasm}');
