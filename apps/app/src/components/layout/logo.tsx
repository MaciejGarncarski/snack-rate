import { ImageWithPlaceholder } from "#/components/image/image-with-placeholder";

export function Logo() {
  return (
    <ImageWithPlaceholder
      src="/logo.png"
      alt="Logo"
      width={100}
      height={100}
      containerClassName="size-9"
      className="w-full h-full object-contain"
    />
  );
}
