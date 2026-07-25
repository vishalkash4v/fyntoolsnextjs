declare module "bwip-js" {
  const bwipjs: {
    toCanvas: (
      canvas: HTMLCanvasElement,
      opts: Record<string, unknown>
    ) => void;
  };
  export default bwipjs;
}

declare module "jsqr" {
  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: { inversionAttempts?: string }
  ): { data: string } | null;
}
