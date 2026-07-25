import preview from "$/preview";

import { SnackBarcode } from "./snack-barcode";

const meta = preview.meta({
  title: "Components/SnackBarcode",
  component: SnackBarcode,
  args: {
    barcode: "5901234123457",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "select",
      options: ["default", "padding"],
    },
  },
});

export default meta;

export const Default = meta.story();

export const Small = meta.story({
  args: {
    size: "sm",
  },
});

export const Medium = meta.story({
  args: {
    size: "md",
  },
});

export const Large = meta.story({
  args: {
    size: "lg",
  },
});

export const WithPadding = meta.story({
  args: {
    variant: "padding",
  },
});

export const SmallWithPadding = meta.story({
  args: {
    size: "sm",
    variant: "padding",
  },
});

export const MediumWithPadding = meta.story({
  args: {
    size: "md",
    variant: "padding",
  },
});

export const LargeWithPadding = meta.story({
  args: {
    size: "lg",
    variant: "padding",
  },
});
