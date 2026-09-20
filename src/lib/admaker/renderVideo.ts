'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { CROSSFADE_SEC, orientationSize, type OrientationId } from '@/lib/admaker/constants';
import type { AdMediaItem, AdScene } from '@/lib/admaker/store';

let ffmpegSingleton: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

const CORE_BASES = [
  // Same-origin first (copied by scripts/copy-ffmpeg-core.mjs) — most reliable
  '/ffmpeg',
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm',
];

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms);
    promise.then(
      (v) => {
        window.clearTimeout(t);
        resolve(v);
      },
      (err) => {
        window.clearTimeout(t);
        reject(err);
      }
    );
  });
}

async function loadFromBase(
  ffmpeg: FFmpeg,
  baseURL: string,
  onProgress?: (pct: number, message: string) => void
) {
  onProgress?.(6, `Fetching FFmpeg core (${baseURL.includes('http') ? 'CDN' : 'local'})…`);
  const coreURL = await withTimeout(
    toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    60_000,
    'FFmpeg core.js download'
  );
  onProgress?.(12, 'Downloading FFmpeg WASM (~25MB, first time only)…');
  const wasmURL = await withTimeout(
    toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    180_000,
    'FFmpeg WASM download'
  );
  onProgress?.(18, 'Initializing FFmpeg engine…');
  await withTimeout(ffmpeg.load({ coreURL, wasmURL }), 90_000, 'FFmpeg initialize');
}

async function getFFmpeg(onProgress?: (pct: number, message: string) => void): Promise<FFmpeg> {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton;
  if (ffmpegLoadPromise) return ffmpegLoadPromise;

  ffmpegLoadPromise = (async () => {
    let lastErr: Error | null = null;
    for (const base of CORE_BASES) {
      const ffmpeg = new FFmpeg();
      try {
        await loadFromBase(ffmpeg, base, onProgress);
        ffmpegSingleton = ffmpeg;
        onProgress?.(22, 'FFmpeg ready');
        return ffmpeg;
      } catch (err) {
        lastErr = err as Error;
        console.warn(`FFmpeg load failed from ${base}:`, err);
      }
    }
    ffmpegLoadPromise = null;
    throw new Error(
      lastErr?.message ||
        'Could not load FFmpeg in this browser. Check network / ad-blockers, then retry.'
    );
  })();

  try {
    return await ffmpegLoadPromise;
  } catch (err) {
    ffmpegLoadPromise = null;
    throw err;
  }
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };
    img.src = url;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else current = test;
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

/**
 * Scale + cover-crop image, burn text overlay + logo watermark.
 * (Browser canvas — more reliable than drawtext inside ffmpeg.wasm.)
 */
export async function composeSceneStill(opts: {
  image: Blob;
  logo?: Blob | null;
  textOverlay: string;
  projectName: string;
  orientation: OrientationId;
}): Promise<Blob> {
  const { width, height } = orientationSize(opts.orientation);
  const img = await loadImage(opts.image);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);

  const scale = Math.max(width / img.width, height / img.height) * 1.08;
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);

  const grad = ctx.createLinearGradient(0, height * 0.55, 0, height);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.4, 'rgba(0,0,0,0.4)');
  grad.addColorStop(1, 'rgba(0,0,0,0.78)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  if (opts.logo) {
    try {
      const logoImg = await loadImage(opts.logo);
      const logoW = Math.round(width * 0.14);
      const logoH = Math.round((logoImg.height / logoImg.width) * logoW);
      ctx.globalAlpha = 0.85;
      ctx.drawImage(logoImg, width - logoW - Math.round(width * 0.04), Math.round(height * 0.035), logoW, logoH);
      ctx.globalAlpha = 1;
    } catch {
      // ignore bad logo
    }
  }

  if (opts.projectName.trim()) {
    ctx.font = `600 ${Math.round(width * 0.018)}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(opts.projectName.trim().slice(0, 36), Math.round(width * 0.04), Math.round(height * 0.055));
  }

  if (opts.textOverlay.trim()) {
    const fontSize = Math.round(width * 0.042);
    ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
    const lines = wrapText(ctx, opts.textOverlay.trim(), width * 0.86);
    const boxPadX = Math.round(width * 0.035);
    const boxPadY = Math.round(height * 0.02);
    const lineH = Math.round(fontSize * 1.25);
    const boxH = lines.length * lineH + boxPadY * 2;
    const boxY = height - boxH - Math.round(height * 0.045);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(Math.round(width * 0.03), boxY, Math.round(width * 0.94), boxH);
    ctx.fillStyle = '#fff';
    lines.forEach((line, i) => {
      ctx.fillText(line, boxPadX + Math.round(width * 0.03), boxY + boxPadY + (i + 0.8) * lineH);
    });
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Frame export failed'))),
      'image/jpeg',
      0.92
    );
  });
}

async function wipeVfs(ffmpeg: FFmpeg, names: string[]) {
  for (const name of names) {
    try {
      await ffmpeg.deleteFile(name);
    } catch {
      // ignore missing
    }
  }
}

export type RenderAdOptions = {
  scenes: AdScene[];
  images: AdMediaItem[];
  logo: AdMediaItem | null;
  bgm: AdMediaItem | null;
  bgmVolume: number;
  voiceVolume: number;
  projectName: string;
  orientation: OrientationId;
  onProgress?: (pct: number, message: string) => void;
};

/**
 * Compose captioned stills → Ken Burns zoompan + xfade → mix BGM + TTS voiceovers.
 * VFS files are always deleted in finally.
 */
export async function renderAdVideo(opts: RenderAdOptions): Promise<Blob> {
  const {
    scenes,
    images,
    logo,
    bgm,
    bgmVolume,
    voiceVolume,
    projectName,
    orientation,
    onProgress,
  } = opts;

  if (!scenes.length) throw new Error('No scenes to render');
  if (!images.length) throw new Error('Add images before rendering');

  const { width, height } = orientationSize(orientation);
  const vfsFiles: string[] = [];
  onProgress?.(2, 'Loading FFmpeg…');
  const ffmpeg = await getFFmpeg(onProgress);

  try {
    onProgress?.(24, 'Composing branded frames…');
    const stills: Blob[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const sc = scenes[i];
      const img = images[sc.imageIndex % images.length] || images[0];
      const still = await composeSceneStill({
        image: img.blob,
        logo: logo?.blob || null,
        textOverlay: sc.textOverlay,
        projectName,
        orientation,
      });
      stills.push(still);
      onProgress?.(24 + Math.round(((i + 1) / scenes.length) * 20), `Scene ${i + 1}/${scenes.length}`);
    }

    onProgress?.(46, 'Writing frames to VFS…');
    for (let i = 0; i < stills.length; i++) {
      const name = `still${i}.jpg`;
      await ffmpeg.writeFile(name, await fetchFile(stills[i]));
      vfsFiles.push(name);
    }

    const voNames: string[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const vo = scenes[i].voiceBlob;
      if (!vo) continue;
      const name = `vo${i}.mp3`;
      await ffmpeg.writeFile(name, await fetchFile(vo));
      vfsFiles.push(name);
      voNames.push(name);
    }

    let bgmName: string | null = null;
    if (bgm?.blob) {
      bgmName = 'bgm.mp3';
      await ffmpeg.writeFile(bgmName, await fetchFile(bgm.blob));
      vfsFiles.push(bgmName);
    }

    const fade = Math.min(CROSSFADE_SEC, Math.max(0.3, Math.min(...scenes.map((s) => s.duration)) / 3));
    const fps = 30;

    onProgress?.(55, 'Building video filter graph…');
    const args: string[] = [];
    for (let i = 0; i < scenes.length; i++) {
      args.push('-loop', '1', '-t', String(scenes[i].duration), '-i', `still${i}.jpg`);
    }
    if (bgmName) args.push('-stream_loop', '-1', '-i', bgmName);
    for (const vo of voNames) args.push('-i', vo);

    const filters: string[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const frames = Math.max(fps, Math.round(scenes[i].duration * fps));
      filters.push(
        `[${i}:v]scale=${width * 2}:${height * 2}:force_original_aspect_ratio=increase,` +
          `crop=${width * 2}:${height * 2},` +
          `zoompan=z='min(zoom+0.0012,1.18)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=${fps},` +
          `setsar=1,format=yuv420p[v${i}]`
      );
    }

    let videoOut = '[v0]';
    if (scenes.length > 1) {
      let prev = 'v0';
      let offset = scenes[0].duration - fade;
      for (let i = 1; i < scenes.length; i++) {
        const out = i === scenes.length - 1 ? 'vout' : `vx${i}`;
        filters.push(
          `[${prev}][v${i}]xfade=transition=fade:duration=${fade}:offset=${Math.max(0.1, offset).toFixed(3)}[${out}]`
        );
        prev = out;
        offset += scenes[i].duration - fade;
      }
      videoOut = '[vout]';
    }

    const bgmInputIndex = scenes.length;
    const voStartIndex = scenes.length + (bgmName ? 1 : 0);
    const bgmVol = Math.max(0, Math.min(1, bgmVolume / 100)) * 0.45;
    const voVol = Math.max(0, Math.min(1, voiceVolume / 100));

    const audioLabels: string[] = [];
    if (bgmName) {
      filters.push(`[${bgmInputIndex}:a]volume=${bgmVol.toFixed(3)}[bgm]`);
      audioLabels.push('[bgm]');
    }

    if (voNames.length) {
      let cursor = 0;
      const delayed: string[] = [];
      let voFileIdx = 0;
      for (let i = 0; i < scenes.length; i++) {
        if (!scenes[i].voiceBlob) {
          cursor += scenes[i].duration;
          continue;
        }
        const delayMs = Math.round(cursor * 1000);
        const inIdx = voStartIndex + voFileIdx;
        filters.push(
          `[${inIdx}:a]adelay=${delayMs}|${delayMs},volume=${voVol.toFixed(3)},apad=whole_dur=100[vo${i}]`
        );
        delayed.push(`[vo${i}]`);
        voFileIdx++;
        cursor += scenes[i].duration;
      }
      if (delayed.length === 1) {
        audioLabels.push(delayed[0]);
      } else if (delayed.length > 1) {
        filters.push(`${delayed.join('')}amix=inputs=${delayed.length}:dropout_transition=0:normalize=0[voall]`);
        audioLabels.push('[voall]');
      }
    }

    let mapAudio: string[] = [];
    if (audioLabels.length === 1) {
      if (audioLabels[0] !== '[aout]') {
        filters.push(`${audioLabels[0]}anull[aout]`);
      }
      mapAudio = ['-map', '[aout]'];
    } else if (audioLabels.length > 1) {
      filters.push(
        `${audioLabels.join('')}amix=inputs=${audioLabels.length}:duration=first:dropout_transition=2:normalize=0[aout]`
      );
      mapAudio = ['-map', '[aout]'];
    }

    const totalDur = scenes.reduce((s, sc) => s + sc.duration, 0) - fade * Math.max(0, scenes.length - 1);

    args.push(
      '-filter_complex',
      filters.join(';'),
      '-map',
      videoOut === '[v0]' ? '[v0]' : '[vout]',
      ...mapAudio,
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-preset',
      'ultrafast',
      '-t',
      totalDur.toFixed(2),
      '-movflags',
      '+faststart',
      'out.mp4'
    );

    if (mapAudio.length) args.splice(args.indexOf('-c:v'), 0, '-c:a', 'aac', '-b:a', '128k');

    onProgress?.(70, 'Encoding MP4 (Ken Burns + transitions)…');
    ffmpeg.on('progress', ({ progress }) => {
      onProgress?.(70 + Math.min(25, Math.round((progress || 0) * 25)), 'Encoding…');
    });

    try {
      await ffmpeg.exec(args);
    } catch (err) {
      console.warn('Advanced filter failed, using simple concat fallback', err);
      onProgress?.(72, 'Fallback encode…');
      await simpleConcatFallback(ffmpeg, scenes, vfsFiles, stills.length, bgmName, onProgress);
    }

    onProgress?.(97, 'Packaging download…');
    const data = await ffmpeg.readFile('out.mp4');
    vfsFiles.push('out.mp4');
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    onProgress?.(100, 'Done');
    return new Blob([copy], { type: 'video/mp4' });
  } finally {
    await wipeVfs(ffmpeg, vfsFiles);
    try {
      const listing = await ffmpeg.listDir('/');
      for (const f of listing) {
        if (!f.isDir && /\.(jpg|mp3|mp4|txt)$/i.test(f.name)) {
          try {
            await ffmpeg.deleteFile(f.name);
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
  }
}

async function simpleConcatFallback(
  ffmpeg: FFmpeg,
  scenes: AdScene[],
  vfsFiles: string[],
  stillCount: number,
  bgmName: string | null,
  onProgress?: (pct: number, message: string) => void
) {
  const clipNames: string[] = [];
  for (let i = 0; i < stillCount; i++) {
    const clip = `clip${i}.mp4`;
    await ffmpeg.exec([
      '-loop',
      '1',
      '-t',
      String(scenes[i].duration),
      '-i',
      `still${i}.jpg`,
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-preset',
      'ultrafast',
      '-r',
      '30',
      clip,
    ]);
    clipNames.push(clip);
    vfsFiles.push(clip);
    onProgress?.(75 + Math.round(((i + 1) / stillCount) * 10), `Clip ${i + 1}`);
  }

  const listBody = clipNames.map((n) => `file '${n}'`).join('\n');
  await ffmpeg.writeFile('list.txt', listBody);
  vfsFiles.push('list.txt');

  const outArgs = ['-f', 'concat', '-safe', '0', '-i', 'list.txt'];
  if (bgmName) {
    outArgs.push('-stream_loop', '-1', '-i', bgmName, '-c:v', 'copy', '-c:a', 'aac', '-shortest');
  } else {
    outArgs.push('-c', 'copy');
  }
  outArgs.push('out.mp4');
  await ffmpeg.exec(outArgs);
}
