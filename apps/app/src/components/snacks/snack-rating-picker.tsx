import { useState } from "react";

import { Field } from "#/components/ui/field";
import { Slider } from "#/components/ui/slider";

type SnackRatingPickerProps = {
  currentRating: number | null;
  onRate: (rating: number) => void;
  disabled?: boolean;
};

const MIN_VALUE = 1;
const MAX_VALUE = 10;

export function SnackRatingPicker({ currentRating, onRate, disabled }: SnackRatingPickerProps) {
  const [draftValue, setDraftValue] = useState<number | null>(null);
  const sliderValue = draftValue ?? (currentRating || 1);

  return (
    <Field className="bg-input/50 w-full rounded-3xl py-4 md:py-12 px-4">
      <div className="flex max-w-sm flex-col gap-2 self-center w-full">
        <div className="flex flex-col gap-2 items-center justify-center pb-4">
          <h3 className="text-lg font-semibold">Jak oceniasz?</h3>
          <p className="text-5xl">
            <span className="text-6xl text-primary tabular-nums font-bold">{sliderValue}</span> /10
          </p>
        </div>

        <div className="flex flex-row items-center gap-4">
          <p className="hidden md:block">{MIN_VALUE}</p>
          <Slider
            minValue={MIN_VALUE}
            maxValue={MAX_VALUE}
            step={1}
            value={sliderValue}
            onChange={(value) => setDraftValue(value)}
            onChangeEnd={(value) => {
              if (value !== currentRating) onRate(value);
              setDraftValue(null);
            }}
            isDisabled={disabled}
            aria-label="Ocena"
          />
          <p className="hidden md:block">{MAX_VALUE}</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-row gap-1 relative -top-1 justify-between w-full px-2 md:px-7">
            {Array.from({ length: MAX_VALUE }).map((_, index) => {
              return <span key={index} className={`inline-block w-px h-2 rounded bg-primary/70`} />;
            })}
          </div>
          <div className="grid grid-cols-[6rem_1fr_6rem] md:px-4 w-full text-xs text-muted-foreground">
            <p className="text-center w-fit flex flex-col gap-1 justify-center items-left">
              <span>{MIN_VALUE}</span>
              <span>Słabe</span>
            </p>
            <p className="text-center flex flex-col gap-1 justify-center items-center">
              <span>{Math.floor((MIN_VALUE + MAX_VALUE) / 2)}</span>
              <span>Średnie</span>
            </p>
            <p className="text-center ml-auto flex w-fit flex-col gap-1 justify-center items-right">
              <span>{MAX_VALUE}</span>
              <span>Rewelacyjne</span>
            </p>
          </div>
        </div>
      </div>
    </Field>
  );
}
