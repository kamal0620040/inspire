"use client";

import { useEffect, useRef, useState, useCallback, useEffectEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause, Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";
import { Asset } from "@/lib/types";

interface MediaPreviewProps {
  assets: Asset[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export function MediaPreview({
  assets,
  initialIndex,
  isOpen,
  onClose,
  onIndexChange,
}: MediaPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentAsset = assets[currentIndex];
  const isVideo = currentAsset?.type === "video";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < assets.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  }, [currentIndex, assets.length, onIndexChange]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  }, [currentIndex, onIndexChange]);

  const onCloseEvent = useEffectEvent(onClose);
  const goToNextEvent = useEffectEvent(goToNext);
  const goToPrevEvent = useEffectEvent(goToPrev);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onCloseEvent();
          break;
        case "ArrowRight":
          goToNextEvent();
          break;
        case "ArrowLeft":
          goToPrevEvent();
          break;
        case " ":
          e.preventDefault();
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play();
              setIsPlaying(true);
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
          break;
        case "m":
        case "M":
          setIsMuted((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isMuted, isPlaying, currentIndex]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!isOpen || !currentAsset) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Navigation Arrows */}
        {assets.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              disabled={currentIndex === 0}
              aria-label="Previous asset"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              disabled={currentIndex === assets.length - 1}
              aria-label="Next asset"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Media Content */}
        <motion.div
          key={currentAsset.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        >
          {isVideo ? (
            <div className="relative">
              <video
                ref={videoRef}
                src={currentAsset.url}
                className="max-w-full max-h-[85vh] object-contain"
                autoPlay
                muted={isMuted}
                playsInline
                loop
                controls={false}
              />
              
              {/* Video Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/60 rounded-full backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <Image
              src={currentAsset.url}
              alt={currentAsset.file_name || "Preview"}
              width={currentAsset.width || 800}
              height={currentAsset.height || 600}
              className="max-w-full max-h-[85vh] object-contain"
              unoptimized
              priority
            />
          )}
        </motion.div>

        {/* Bottom Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-black/60 rounded-full backdrop-blur-sm text-white text-sm">
          <span className="font-medium">{currentAsset.file_name}</span>
          {assets.length > 1 && (
            <span className="text-white/60">
              {currentIndex + 1} / {assets.length}
            </span>
          )}
        </div>

        {/* Keyboard Hints */}
        <div className="absolute bottom-4 left-4 text-white/40 text-xs hidden md:flex items-center gap-4">
          <span>ESC to close</span>
          {assets.length > 1 && <span>← → to navigate</span>}
          {isVideo && <span>SPACE to play/pause</span>}
          {isVideo && <span>M to mute</span>}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
