import preview from "$/preview";

import { SnackRatingPicker } from "./snack-rating-picker";

const meta = preview.meta({
  title: "Components/SnackRatingPicker",
  component: SnackRatingPicker,
  args: {
    currentRating: null,
    onRate: () => {},
    disabled: false,
  },
  argTypes: {
    currentRating: {
      control: "number",
      min: 0,
      max: 10,
      step: 1,
    },
    disabled: {
      control: "boolean",
    },
  },
});

export default meta;

export const Default = meta.story({});

export const WithRating = meta.story({
  args: {
    currentRating: 6,
  },
});

export const OneStar = meta.story({
  args: {
    currentRating: 2,
  },
});

export const FullRating = meta.story({
  args: {
    currentRating: 10,
  },
});

export const Disabled = meta.story({
  args: {
    currentRating: 8,
    disabled: true,
  },
});

export const DisabledNoRating = meta.story({
  args: {
    currentRating: null,
    disabled: true,
  },
});
