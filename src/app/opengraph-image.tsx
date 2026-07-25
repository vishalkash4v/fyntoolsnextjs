import { ImageResponse } from 'next/og';

export const alt = 'FYN Tools Worldwide — Free Online Tools';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0ea5e9 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.85, marginBottom: 16, letterSpacing: 2 }}>
          FYN TOOLS WORLDWIDE
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15, maxWidth: 900 }}>
          90+ Free Professional Online Tools
        </div>
        <div style={{ fontSize: 28, opacity: 0.9, marginTop: 28, maxWidth: 800 }}>
          Calculators · Text · Image · Developer · Converters — no signup
        </div>
        <div style={{ fontSize: 22, marginTop: 48, opacity: 0.75 }}>
          fyntools.com
        </div>
      </div>
    ),
    { ...size }
  );
}
