import { Image } from "#/components/image/image";

export function Logo() {
  return (
    <Image
      src="/logo-small.png"
      alt="Logo"
      width={100}
      skeleton={true}
      height={100}
      containerClassName="size-9"
      className="w-full h-full object-contain"
    />
  );
}
