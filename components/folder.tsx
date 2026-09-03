"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FolderWithPreview } from "@/lib/types";

const imageVariants: Variants = {
  closed: (i: number) => ({
    y: [0, -18, 0][i],
    x: [-80, 0, 80][i],
    rotate: [-12, 0, 12][i],
    scale: 0.9,
  }),
  open: (i: number) => ({
    y: [-25, -50, -25][i],
    x: [-60, 0, 60][i],
    rotate: [-15, 0, 15][i],
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
    },
  }),
};

const coverVariants: Variants = {
  closed: {
    rotateX: 0,
  },
  open: {
    rotateX: -25,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
    },
  },
};

interface FolderGlassProps {
  folder: FolderWithPreview;
}

export default function FolderGlass({ folder }: FolderGlassProps) {
  const displayAssets = folder.preview_assets ?? [];

  return (
    <div className="relative h-72 w-80 group">
      <Link href={`/folder/${folder.id}`} className="block">
        <motion.div
          initial="closed"
          whileHover="open"
          className="relative h-72 w-80 cursor-pointer flex items-end justify-center pb-6"
          style={{ perspective: 1400 }}
        >
          {/* Folder Back */}
          <div className="absolute bottom-6 left-1/2 h-60 w-72 rounded-4xl -translate-x-1/2 bg-folder dark:bg-folder">
            <div className="absolute inset-0 rounded-4xl border border-folder-stroke/40 shadow-xl" />
          </div>

          {/* Dynamic preview assets fanning out */}
          {displayAssets.slice(0, 3).map((asset, i) => (
            <motion.div
              key={asset.id}
              custom={i}
              variants={imageVariants}
              className="absolute left-1/2 top-12 -translate-x-1/2 h-32 w-28 overflow-hidden rounded-2xl bg-muted shadow-2xl ring-1 ring-black/10 select-none pointer-events-none"
            >
              {asset.thumbnail_url && (
                <Image
                  src={asset?.thumbnail_url}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                  unoptimized={asset.id.startsWith("fallback")}
                />
              )}
            </motion.div>
          ))}

          {/* Folder Front */}
          <div className="absolute z-50 bottom-6 left-1/2 h-40 w-72 -translate-x-1/2">
            <motion.div
              variants={coverVariants}
              style={{
                transformOrigin: "bottom",
                transformStyle: "preserve-3d",
              }}
              className="
                z-30
                absolute
                inset-0
                rounded-[28px]
                bg-folder-top
                border
                border-folder-stroke
                dark:bg-folder-top
                backdrop-blur-3xl
                flex
                flex-col
                justify-between
                p-6
              "
            >
              <div className="absolute inset-x-0 top-0 h-12 rounded-t-[28px] bg-folder-top dark:folder-top backdrop-blur-2xl" />

              {/* Folder Name & View Mode indicator */}
              <div className="z-10 mt-auto">
                <h3 title={folder.name} className="text-md font-medium text-muted-foreground dark:text-muted-foreground truncate pr-2">
                  {folder.name}
                </h3>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}