import { cva, type VariantProps } from "class-variance-authority";
import Barcode from "react-barcode";

import { cn } from "#/lib/utils";

type Props = {
  barcode: string;
} & VariantProps<typeof barcodeContainerVariants>;

const sizeMap: Record<"sm" | "md" | "lg", { width: number; height: number }> = {
  sm: { width: 1, height: 40 },
  md: { width: 1.7, height: 80 },
  lg: { width: 2.5, height: 120 },
};

const barcodeContainerVariants = cva("w-fit overflow-hidden", {
  variants: {
    variant: {
      default: "shadow-lg border border-border rounded-xl",
      padding: "flex justify-center bg-secondary rounded-2xl shadow border border-border",
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

export function SnackBarcode({ barcode, size = "md", variant = "default" }: Props) {
  const { width, height } = sizeMap[size ?? "md"];

  return (
    <div className={cn(barcodeContainerVariants({ variant, size }))}>
      <Barcode
        value={barcode}
        format="EAN13"
        displayValue={true}
        width={width}
        height={height}
        className="rounded-lg shadow w-fit"
      />
    </div>
  );
}
