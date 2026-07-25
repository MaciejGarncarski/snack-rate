import preview from "$/preview";

import { SnackRating } from "./snack-rating";

const meta = preview.meta({
  title: "Components/SnackRating",
  component: SnackRating,
  args: {
    rating: 4.3,
    withText: true,
    size: "md",
  },
  argTypes: {
    rating: {
      control: "number",
      min: 0,
      max: 5,
      step: 0.1,
    },
    withText: {
      control: "boolean",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
});

export default meta;

export const Default = meta.story({
  args: {
    rating: 4.3,
    withText: true,
    size: "md",
  },
});

export const Empty = meta.story({
  args: {
    rating: 0,
  },
});

export const OneStar = meta.story({
  args: {
    rating: 1,
  },
});

export const HalfRating = meta.story({
  args: {
    rating: 2.5,
  },
});

export const ThreeStars = meta.story({
  args: {
    rating: 3,
  },
});

export const FourStars = meta.story({
  args: {
    rating: 4,
  },
});

export const Full = meta.story({
  args: {
    rating: 5,
  },
});

export const WithoutText = meta.story({
  args: {
    ...Default.composed.args,
    withText: false,
  },
});

export const ExtraSmall = meta.story({
  args: {
    ...Default.composed.args,
    size: "xs",
  },
});

export const Small = meta.story({
  args: {
    ...Default.composed.args,
    size: "sm",
  },
});

export const Medium = meta.story({
  args: {
    ...Default.composed.args,
    size: "md",
  },
});

export const Large = meta.story({
  args: {
    ...Default.composed.args,
    size: "lg",
  },
});

export const ExtraSmallWithoutText = meta.story({
  args: {
    ...Default.composed.args,
    size: "xs",
    withText: false,
  },
});

export const SmallWithoutText = meta.story({
  args: {
    ...Default.composed.args,
    size: "sm",
    withText: false,
  },
});

export const MediumWithoutText = meta.story({
  args: {
    ...Default.composed.args,
    size: "md",
    withText: false,
  },
});

export const LargeWithoutText = meta.story({
  args: {
    ...Default.composed.args,
    size: "lg",
    withText: false,
  },
});
