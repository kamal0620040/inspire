"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, VolumeX, Loader2 } from "lucide-react";

interface LazyVideoProps {
  src: string;
  thumbnailSrc?: string | null;
}

export default function LazyVideo({ src, thumbnailSrc }: LazyVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isInViewport, setIsInViewport] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Setup intersection observer to mount/unmount video tag based on viewport visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        threshold: 0.1, // trigger when 10% visible
        rootMargin: "100px", // pre-mount when approaching
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle play/pause on hover state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isInViewport) return;

    if (isHovered) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsBuffering(true);
      video.play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsBuffering(false);
        });
    } else {
      video.pause();
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, [isHovered, isInViewport]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full bg-neutral-900 overflow-hidden flex items-center justify-center select-none pointer-events-auto"
    >
      {/* Thumbnail / Placeholder */}
      {(!isPlaying || !isInViewport) && (
        <div className="absolute inset-0 z-10 w-full h-full transition-opacity duration-300">
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt="Video thumbnail"
              fill
              sizes="(max-width: 768px) 300px, 600px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
              <FilmIconPlaceholder />
            </div>
          )}

          {/* Hover hint/overlay */}
          <div className="absolute inset-0 bg-black/25 hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="p-3.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md active:scale-95 transition-all">
              <Play className="h-6 w-6 fill-current" />
            </div>
          </div>
        </div>
      )}

      {/* Lazy mounted HTML5 video element */}
      {isInViewport && (
        <video
          ref={videoRef}
          src={src}
          loop
          muted
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isPlaying ? "opacity-100" : "opacity-0"
          }`}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
        />
      )}

      {/* Buffering Loader Overlay */}
      {isBuffering && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      )}

      {/* Mute Indicator overlay */}
      {isPlaying && (
        <div className="absolute top-2 left-2 p-1.5 rounded-md bg-black/40 text-white text-[10px] flex items-center gap-1 z-15 backdrop-blur-md pointer-events-none select-none">
          <VolumeX className="h-3 w-3" />
          Muted
        </div>
      )}
    </div>
  );
}

function FilmIconPlaceholder() {
  return (
    <svg
      className="w-12 h-12 text-neutral-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}
