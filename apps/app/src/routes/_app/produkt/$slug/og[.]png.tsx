import { createFileRoute } from "@tanstack/react-router";
import ImageResponse from "takumi-js/response";

import { getSnackBySlugFn } from "#/features/catalogue/api/snacks.api";
import stylesheet from "#/styles/app.css?inline";

// VERY IMPORTANT NOTE:
// In dev mode you HAVE TO add image url host to /etc/hosts, because the image is fetched from the localhost

export const Route = createFileRoute("/_app/produkt/$slug/og.png")({
  server: {
    handlers: {
      async GET({ params }) {
        const snack = await getSnackBySlugFn({ data: { slug: params.slug } });

        if (!snack) {
          return new Response("Snack not found", { status: 404 });
        }

        const primaryImage = snack.images[0]?.url || "";
        const title = snack.name;

        return new ImageResponse(
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "start",
              alignItems: "center",
              gap: "6rem",
              padding: "64px",
              backgroundImage: "linear-gradient(to bottom right, #eff6ff, #dbeafe)",
            }}
          >
            <div>
              <img
                src="snack-image"
                style={{
                  borderRadius: "1.5rem",
                  border: "2px solid gray",
                  width: "20rem",
                  aspectRatio: "4/5",
                }}
                alt=""
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                height: "24rem",
                justifyContent: "start",
              }}
            >
              <p style={{ fontSize: 72, fontWeight: 700, color: "#111827" }}>{title}</p>
              <SnackRating rating={snack.avgRating} />
            </div>
          </div>,
          {
            stylesheets: [stylesheet],
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

const STAR_PATH =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

function Star({ fill, size = 24, color }: { fill: number; size?: number; color: string }) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
        }}
      >
        <path d={STAR_PATH} fill="#d4d4d8" stroke="#d4d4d8" strokeWidth="2" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${fill * 100}%`,
          height: size,
          overflow: "hidden",
        }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d={STAR_PATH} fill={color} stroke={color} strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

export function SnackRating({ rating, withText }: { rating: number; withText?: boolean }) {
  const value = Math.max(0, Math.min(5, rating));

  const color =
    value <= 1
      ? "#ef4444"
      : value <= 2
        ? "#f97316"
        : value <= 3
          ? "#eab308"
          : value <= 3.5
            ? "#84cc16"
            : value <= 4.5
              ? "#16a34a"
              : "#06b6d4";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {withText && (
        <span
          style={{
            fontSize: 52,
            fontWeight: 700,
          }}
        >
          {value.toFixed(1)}
        </span>
      )}

      <div
        style={{
          display: "flex",
          gap: 6,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} fill={Math.max(0, Math.min(1, value - i))} color={color} size={48} />
        ))}
      </div>
    </div>
  );
}
