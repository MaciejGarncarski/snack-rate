import { renderSvg } from "takumi-js";

// Color palettes
const TEXT_COLORS = ["#1e3a5f", "#4a2545", "#1a4a4a", "#5c3d1e", "#2d2b55", "#3d2b4a"];
const LINE_COLORS = ["#9ab3d5", "#b39cc9", "#8fbcb3", "#c9a48f", "#a8b5c9", "#b8a8c4"];
const BG_BLOBS = ["#e2e8f0", "#f0e6f0", "#e6f0ee", "#f0ebe6", "#e6eaf0", "#f0e8f0"];

// Seeded random number generator (mulberry32)
function createRng(seed: number) {
  // oxlint-disable-next-line unicorn/prefer-math-trunc -- int32 coercion, not truncation
  let s = seed | 0;
  return () => {
    // oxlint-disable-next-line unicorn/prefer-math-trunc -- int32 wrap, not truncation
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (const char of str) {
    // oxlint-disable-next-line unicorn/prefer-math-trunc -- int32 wrap, not truncation
    hash = ((hash << 5) - hash + (char.codePointAt(0) ?? 0)) | 0;
  }
  return hash;
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[randomInt(rng, 0, arr.length - 1)];
}

// Generate a wavy line as a series of small segments
function generateWavySegments(rng: () => number, w: number, h: number) {
  const segments = randomInt(rng, 3, 5);
  const points = [];
  for (let i = 0; i <= segments; i++) {
    points.push({
      x: Math.round((w / segments) * i + randomInt(rng, -10, 10)),
      y: randomInt(rng, 8, h - 8),
    });
  }

  const lines = [];
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    // Offset midpoint for waviness
    const midX = (p1.x + p2.x) / 2 + randomInt(rng, -12, 12);
    const midY = (p1.y + p2.y) / 2 + randomInt(rng, -8, 8);
    lines.push(
      { x1: p1.x, y1: p1.y, x2: midX, y2: midY },
      { x1: midX, y1: midY, x2: p2.x, y2: p2.y },
    );
  }
  return lines;
}

export function renderCaptcha(code: string): Promise<string> {
  const rng = createRng(hashString(code));

  const w = 240;
  const h = 76;
  const spacing = 40;
  const startX = 30;

  const chars = code.split("").map((char, i) => {
    const baselineY = randomInt(rng, 20, 30);
    const scale = randomFloat(rng, 0.95, 1.15);
    const skewX = randomInt(rng, -3, 3);
    return {
      char,
      x: startX + i * spacing + randomInt(rng, -5, 5),
      top: baselineY,
      angle: randomInt(rng, -14, 14),
      scale,
      skewX,
      color: pick(rng, TEXT_COLORS),
    };
  });

  const wavyLines: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    width: number;
    opacity: number;
  }> = [];
  for (let i = 0; i < randomInt(rng, 3, 5); i++) {
    const segments = generateWavySegments(rng, w, h);
    const color = pick(rng, LINE_COLORS);
    const width = randomFloat(rng, 1, 2.5);
    const opacity = randomFloat(rng, 0.25, 0.5);
    segments.forEach((seg) => wavyLines.push({ ...seg, color, width, opacity }));
  }

  const dots = Array.from({ length: randomInt(rng, 30, 50) }, () => ({
    cx: randomInt(rng, 2, w - 2),
    cy: randomInt(rng, 2, h - 2),
    r: randomFloat(rng, 0.6, 1.8),
    opacity: randomFloat(rng, 0.08, 0.28),
  }));

  const blobs = Array.from({ length: randomInt(rng, 2, 4) }, () => ({
    x: randomInt(rng, -10, w - 20),
    y: randomInt(rng, -10, h - 20),
    size: randomInt(rng, 30, 60),
    color: pick(rng, BG_BLOBS),
    opacity: randomFloat(rng, 0.2, 0.4),
  }));

  const scanLines = Array.from({ length: 6 }, (_, i) => ({
    y: Math.round((h / 7) * (i + 1)),
    opacity: randomFloat(rng, 0.02, 0.05),
  }));

  return renderSvg(
    <div
      style={{
        width: w,
        height: h,
        display: "flex",
        position: "relative",
        backgroundColor: "#f7f8fc",
        backgroundImage: `
          linear-gradient(155deg, #f0f2f8 0%, #f8f6f3 35%, #f3f6f8 70%, #f5f3f8 100%)
        `,
        overflow: "hidden",
      }}
    >
      {/* Soft background blobs */}
      {blobs.map((blob, i) => (
        <div
          key={`b${i}`}
          style={{
            position: "absolute",
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            borderRadius: "50%",
            backgroundColor: blob.color,
            opacity: blob.opacity,
          }}
        />
      ))}

      {/* Subtle scan lines */}
      {scanLines.map((line, i) => (
        <div
          key={`sl${i}`}
          style={{
            position: "absolute",
            left: 0,
            top: line.y,
            width: "100%",
            height: 1,
            backgroundColor: "#000",
            opacity: line.opacity,
          }}
        />
      ))}

      {/* Wavy distortion lines */}
      {wavyLines.map((line, i) => {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return (
          <div
            key={`l${i}`}
            style={{
              position: "absolute",
              width: length,
              height: line.width,
              backgroundColor: line.color,
              opacity: line.opacity,
              left: line.x1,
              top: line.y1,
              transform: `rotate(${angle}rad)`,
              transformOrigin: "0 0",
              borderRadius: line.width / 2,
            }}
          />
        );
      })}

      {/* Noise dots */}
      {dots.map((dot, i) => (
        <div
          key={`d${i}`}
          style={{
            position: "absolute",
            width: dot.r * 2,
            height: dot.r * 2,
            borderRadius: "50%",
            backgroundColor: "#64748b",
            opacity: dot.opacity,
            left: dot.cx - dot.r,
            top: dot.cy - dot.r,
          }}
        />
      ))}

      {/* Characters with improved typography and depth */}
      {chars.map((char, i) => (
        <div
          key={`c${i}`}
          style={{
            position: "absolute",
            left: char.x,
            top: char.top,
            fontSize: 32,
            fontWeight: 700,
            color: char.color,
            fontFamily: "monospace, sans-serif",
            transform: `rotate(${char.angle}deg) scale(${char.scale}) skewX(${char.skewX}deg)`,
            transformOrigin: "center center",
            textShadow: "0 1px 2px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.08)",
            letterSpacing: "-0.5px",
            opacity: 0.6,
          }}
        >
          {char.char}
        </div>
      ))}

      {/* Soft vignette for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.035) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>,
    { width: w, height: h },
  );
}
