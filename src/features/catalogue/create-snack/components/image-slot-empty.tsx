import { ImagePlusIcon } from "lucide-react";

type Props = {
  onClick: () => void;
};

export function ImageSlotEmpty({ onClick }: Props) {
  return (
    <div className="relative">
      <button
        className="flex size-30 items-center justify-center rounded-lg border border-dashed border-accent bg-secondary outline-0 focus:border-solid focus:ring focus:ring-accent"
        onClick={onClick}
      >
        <ImagePlusIcon className="text-muted-foreground" />
      </button>
    </div>
  );
}
