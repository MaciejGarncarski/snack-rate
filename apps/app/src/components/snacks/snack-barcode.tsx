import { ClientOnly } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
import JsBarcode from "jsbarcode";
import { BarcodeIcon, Loader2Icon } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "#/lib/utils";

type Props = {
  barcode: string | null;
} & VariantProps<typeof barcodeContainerVariants>;

const sizeMap: Record<"sm" | "md" | "lg", { width: number; height: number }> = {
  sm: { width: 1.2, height: 40 },
  md: { width: 1.7, height: 80 },
  lg: { width: 2.5, height: 120 },
};

const barcodeContainerVariants = cva("w-fit ", {
  variants: {
    variant: {
      default: "shadow-sm ",
      padding: "flex justify-center bg-secondary  border border-border",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  compoundVariants: [
    {
      variant: "padding",
      size: "sm",
      class: "p-1",
    },
    {
      variant: "padding",
      size: "md",
      class: "p-2",
    },
    {
      variant: "padding",
      size: "lg",
      class: "p-3",
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

function BarcodeContent({ barcode, size, variant }: Props) {
  const { width, height } = sizeMap[size ?? "md"];
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && barcode) {
      JsBarcode(svgRef.current, barcode, {
        format: "EAN13",
        displayValue: true,
        textAlign: "center",
        width,
        height,
      });
    }
  }, [barcode, width, height]);

  return (
    <div className={cn(barcodeContainerVariants({ variant, size }))}>
      {barcode ? (
        <svg ref={svgRef} className="rounded-2xl shadow w-fit" />
      ) : (
        <div
          className={cn(
            "flex h-full gap-2 w-full items-center text-center justify-center rounded-2xl p-2 text-muted-foreground",
            {
              "h-19 w-37.5 text-sm": size === "sm",
              "h-30 w-51": size === "md",
              "h-40.5 w-72": size === "lg",
              "bg-muted": variant === "default",
            },
          )}
        >
          <BarcodeIcon className="size-5 text-muted-foreground" />
          Nie dodano
        </div>
      )}
    </div>
  );
}

function SnackBarcodeSkeleton({ size = "md", variant = "default" }: Omit<Props, "barcode">) {
  return (
    <div className={cn(barcodeContainerVariants({ variant, size }))}>
      <div
        className={cn(
          "flex h-full gap-2 w-full items-center text-center justify-center rounded-2xl p-2 text-muted-foreground",
          {
            "h-19 w-37.5 text-sm": size === "sm",
            "h-30 w-51": size === "md",
            "h-40.5 w-72": size === "lg",
            "bg-muted": variant === "default",
          },
        )}
      >
        <Loader2Icon className="size-4 text-muted-foreground animate-spin animation-duration-[2s]" />
        Sprawdzam
      </div>
    </div>
  );
}

export function SnackBarcode({ barcode, size = "md", variant = "default" }: Props) {
  return (
    <ClientOnly fallback={<SnackBarcodeSkeleton size={size} variant={variant} />}>
      <BarcodeContent barcode={barcode} size={size || "md"} variant={variant} />
    </ClientOnly>
  );
}
