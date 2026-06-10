import { useState } from "react";

export function ProductListItemImage({ url, alt }: { url: string; alt: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  if (isError) {
    return (
      <div className="my-2 flex h-48 w-full items-center justify-center rounded bg-gray-300">
        <span className="text-sm text-gray-500">Image failed to load</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      width={400}
      height={300}
      alt={alt}
      className={`my-2 h-48 w-full object-cover ${isLoading ? "blur-xs" : ""}`}
      onLoad={() => {
        setIsLoading(false);
        setIsError(false);
      }}
      onError={() => {
        console.log(`Failed to load image: ${url}`);
        setIsLoading(false);
        setIsError(true);
      }}
    />
  );
}
