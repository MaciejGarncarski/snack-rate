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
      max: 5,
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
    currentRating: 3,
  },
});

export const OneStar = meta.story({
  args: {
    currentRating: 1,
  },
});

export const FullRating = meta.story({
  args: {
    currentRating: 5,
  },
});

export const Disabled = meta.story({
  args: {
    currentRating: 4,
    disabled: true,
  },
});

export const DisabledNoRating = meta.story({
  args: {
    currentRating: null,
    disabled: true,
  },
});
