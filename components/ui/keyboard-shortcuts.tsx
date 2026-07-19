"use client";

import { useEffect, useRef, useState } from "react";
import { Keyboard, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "@/hooks/use-click-outside";

interface ShortcutGroup {
  title: string;
  shortcuts: { key: string; description: string }[];
}

const canvasShortcuts: ShortcutGroup[] = [
  {
    title: "Selection",
    shortcuts: [
      { key: "Click", description: "Select asset" },
      { key: "Shift + Click", description: "Multi-select" },
      { key: "Drag on background", description: "Box select" },
      { key: "Esc", description: "Clear selection" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { key: "Delete / Backspace", description: "Delete selected" },
      { key: "Ctrl + D", description: "Duplicate selected" },
      { key: "R", description: "Rotate 90°" },
      { key: "+ / =", description: "Scale up" },
      { key: "-", description: "Scale down" },
      { key: "0", description: "Reset scale & rotation" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { key: "Scroll", description: "Zoom in/out" },
      { key: "Middle click / Shift + drag", description: "Pan canvas" },
      { key: "Double-click", description: "Preview asset" },
    ],
  },
];

const previewShortcuts: ShortcutGroup[] = [
  {
    title: "Preview",
    shortcuts: [
      { key: "Esc", description: "Close preview" },
      { key: "← →", description: "Navigate assets" },
      { key: "Space", description: "Play / Pause video" },
      { key: "M", description: "Mute / Unmute" },
    ],
  },
];

export function KeyboardShortcutsPanel({ variant = "canvas" }: { variant?: "canvas" | "board" }) {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = variant === "canvas" ? canvasShortcuts : previewShortcuts;

  const menuRed = useRef<HTMLDivElement>(null);

  useClickOutside(menuRed, () => {
    setIsOpen(false);
  });

  useEffect(() => {
    const el = menuRed.current;
    if (!el) return;
    const handler = (e: WheelEvent) => e.stopImmediatePropagation();
    el.addEventListener("wheel", handler);
    return () => el.removeEventListener("wheel", handler);
  });

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            ref={menuRed}
            className="absolute bottom-12 right-0 w-72 bg-glass/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close shortcuts panel"
                className="p-1 rounded-md hover:bg-white/10 text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {shortcuts.map((group) => (
                <div key={group.title} className="mb-4 last:mb-0">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    {group.title}
                  </h4>
                  <div className="space-y-1.5">
                    {group.shortcuts.map((shortcut) => (
                      <div
                        key={shortcut.key}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">{shortcut.description}</span>
                        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-black/20 rounded border border-white/10 text-foreground">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-full shadow-lg transition-all cursor-pointer ${
          isOpen
            ? "bg-blue-500 text-white"
            : "bg-glass/80 backdrop-blur-sm border border-white/20 text-muted-foreground hover:text-foreground hover:bg-glass"
        }`}
        title="Keyboard Shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </button>
    </div>
  );
}
