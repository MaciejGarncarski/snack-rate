import { createFileRoute } from "@tanstack/react-router";
import { googleFonts } from "takumi-js/helpers";
import { ImageResponse } from "takumi-js/response";

import { pluralizeRatingsGenitive } from "#/lib/pluralizer";
import { client } from "#/orpc/client";
import stylesheet from "#/styles/app.css?inline";

// VERY IMPORTANT NOTE:
// In dev mode you HAVE TO add image url host to /etc/hosts, because the image is fetched from the localhost

export const Route = createFileRoute("/_app/produkt/$slug/og.png")({
  server: {
    handlers: {
      async GET({ params }) {
        const snack = await client.snacks.getBySlug({ slug: params.slug });

        if (!snack) {
          return new Response("Snack not found", { status: 404 });
        }

        const primaryImage = snack.images[0]?.url || "";
        const title = snack.name;
        const rating = snack.rating.avg;
        const ratingCount = snack.rating.count;
        const color = ratingColor(rating);

        const fonts = await googleFonts([{ name: "Nunito Sans", weight: "200..1000" }]);

        return new ImageResponse(
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              color: "#F8FAFC",
              backgroundColor: "#0A0E17",
              backgroundImage:
                "radial-gradient(circle at 85% 0%, rgba(59,130,246,0.22), transparent 45%), radial-gradient(circle at -5% 100%, rgba(56,189,248,0.12), transparent 40%)",
              overflow: "hidden",
              fontFamily: "Nunito Sans, system-ui, sans-serif",
            }}
          >
            {/* Main content */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                gap: "3rem",
                padding: "1rem 3rem",
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", flexShrink: 0, display: "flex" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: 300,
                    height: 375,
                    borderRadius: "1.75rem",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src="snack-image"
                    alt=""
                    aria-hidden="true"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "scale(1.25)",
                      filter: "blur(48px) saturate(1.4) brightness(1.3)",
                      opacity: 0.6,
                    }}
                  />
                </div>
                <img
                  src="snack-image"
                  alt=""
                  style={{
                    width: 300,
                    height: 375,
                    objectFit: "cover",
                    borderRadius: "1.75rem",
                    border: "2px solid rgba(148,163,184,0.1)",
                    boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7)",
                  }}
                />
              </div>

              {/* Text column */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {snack.type?.name && (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#93C5FD",
                      background: "rgba(147,197,253,0.1)",
                      border: "1px solid rgba(147,197,253,0.35)",
                      borderRadius: 999,
                      padding: "0.35rem 1.1rem",
                    }}
                  >
                    {snack.type.name}
                  </span>
                )}

                <p
                  style={{
                    margin: 0,
                    fontSize: 48,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: "#F8FAFC",
                  }}
                >
                  {truncate(title, 40)}
                </p>

                <p style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#64748B" }}>
                  {ratingCount === 0
                    ? "Brak ocen - bądź pierwszy"
                    : `na podstawie ${ratingCount} ${pluralizeRatingsGenitive(ratingCount)}`}
                </p>

                <div
                  style={{
                    width: 380,
                    maxWidth: "100%",
                    height: 2,
                    borderRadius: 2,
                    marginTop: "0.25rem",
                    background:
                      "linear-gradient(90deg, rgba(147,197,253,0.4), rgba(147,197,253,0.05))",
                  }}
                />

                <p style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#475569" }}>
                  Sprawdź oceny i podziel się swoją opinią
                </p>
              </div>

              {/* Score badge */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 190,
                  height: 190,
                  borderRadius: "50%",
                  background: "rgba(8,13,23,0.9)",
                  border: `3px solid ${color}`,
                  boxShadow: `0 0 0 8px rgba(8,13,23,0.6), 0 24px 60px -16px ${hexToRgba(color, 0.55)}`,
                }}
              >
                <span
                  style={{
                    fontSize: 54,
                    fontWeight: 800,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                    color,
                  }}
                >
                  {rating.toFixed(1)}
                </span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#64748B",
                    marginTop: "0.35rem",
                    letterSpacing: 1,
                  }}
                >
                  / 10
                </span>
              </div>
            </div>
          </div>,
          {
            stylesheets: [stylesheet],
            fonts,
            images: [
              {
                src: "snack-image",
                data: () => fetch(primaryImage).then((res) => res.arrayBuffer()),
              },
            ],
            width: 1200,
            height: 630,
          },
        );
      },
    },
  },
});

function ratingColor(value: number): string {
  if (value <= 2) return "#ef4444";
  if (value <= 4) return "#f97316";
  if (value <= 6) return "#eab308";
  if (value <= 7) return "#84cc16";
  if (value <= 9) return "#16a34a";
  return "#06b6d4";
}

function hexToRgba(hex: string, alpha: number): string {
  const parsed = hex.replace("#", "");
  const bigint = parseInt(parsed, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}
