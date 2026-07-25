import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { renderSvg } from "takumi-js";

import { generateCode, signCode } from "#/features/captcha/captcha";
import { serverEnv } from "#/lib/server.env";

const COOKIE_NAME = "captcha_token";
const COOKIE_MAX_AGE = 600;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getCaptcha = createServerFn({ method: "GET" }).handler(async () => {
  const code = generateCode();
  const signature = signCode(code + ":", serverEnv.CAPTCHA_SECRET);

  setCookie(COOKIE_NAME, `${code}:${signature}`, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  const w = 200;
  const h = 64;
  const spacing = 32;
  const startX = 20;

  const chars = code.split("").map((char, i) => {
    const baselineY = randomInt(38, 44);
    return {
      char,
      x: startX + i * spacing,
      top: baselineY - 27,
      angle: randomInt(-25, 25),
      hue: randomInt(200, 260),
    };
  });

  const lines = Array.from({ length: randomInt(3, 6) }, () => ({
    x1: randomInt(0, w),
    y1: randomInt(0, h),
    x2: randomInt(0, w),
    y2: randomInt(0, h),
    hue: randomInt(0, 360),
  }));

  const dots = Array.from({ length: randomInt(20, 50) }, () => ({
    cx: randomInt(0, w),
    cy: randomInt(0, h),
    r: randomInt(1, 2),
  }));

  const svg = await renderSvg(
    <div
      style={{
        width: w,
        height: h,
        display: "flex",
        position: "relative",
        backgroundColor: "#f4f4f4",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {lines.map((line, i) => {
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
              height: 1.5,
              backgroundColor: `hsl(${line.hue}, 50%, 60%)`,
              opacity: 0.6,
              left: line.x1,
              top: line.y1,
              transform: `rotate(${angle}rad)`,
              transformOrigin: "0 0",
            }}
          />
        );
      })}
      {chars.map((char, i) => (
        <div
          key={`c${i}`}
          style={{
            position: "absolute",
            left: char.x,
            top: char.top,
            fontSize: 30,
            fontWeight: 700,
            color: `hsl(${char.hue}, 60%, 30%)`,
            fontFamily: "monospace, sans-serif",
            transform: `rotate(${char.angle}deg)`,
            transformOrigin: "0 27px",
          }}
        >
          {char.char}
        </div>
      ))}
      {dots.map((dot, i) => (
        <div
          key={`d${i}`}
          style={{
            position: "absolute",
            width: dot.r * 2,
            height: dot.r * 2,
            borderRadius: "50%",
            backgroundColor: "#999",
            opacity: 0.4,
            left: dot.cx - dot.r,
            top: dot.cy - dot.r,
          }}
        />
      ))}
    </div>,
    { width: w, height: h },
  );

  const displaySvg = svg
    .replace(/ width="[^"]*"/u, ' width="100%"')
    .replace(/ height="[^"]*"/u, ' height="100%"');

  return displaySvg;
});
