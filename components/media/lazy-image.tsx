"use client";

import { useState } from "react";

interface LazyImageProps {
  src: string;
  thumbnailSrc?: string | null;
  alt: string;
}

export default function LazyImage({ src, thumbnailSrc, alt }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const placeholderUrl = thumbnailSrc || src;

  return (
    <div className="relative w-full h-full bg-neutral-100 overflow-hidden flex items-center justify-center">
      {/* Blur placeholder thumbnail */}
      {!isLoaded && placeholderUrl && (
        <img
          src={placeholderUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-contain filter blur-md scale-105 opacity-60 transition-opacity duration-300"
        />
      )}

      {/* Main High-res Image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
