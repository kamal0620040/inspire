"use client";

import { motion, AnimatePresence } from "framer-motion";

import CreateFolderCard from "./folder/create-folder-card";
import FolderGlass from "./folder";
import { Folder } from "@/lib/types";

interface FolderSectionProps {
  data: Folder[];
}

export default function FolderSection({
  data,
}: FolderSectionProps) {
  return (
    <div className="flex-1 flex justify-center p-8 pt-24 pb-32">
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-6xl w-full"
      >
        <motion.div
            key="create-folder"
            layout
            transition={{
              layout: {
                type: "spring",
                stiffness: 450,
                damping: 35,
              },
            }}
          >
            <CreateFolderCard />
          </motion.div>
        <AnimatePresence mode="sync">
          {data.map((folder) => (
            <motion.div
              key={folder.id}
              layout
              layoutId={folder.id}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: -12,
              }}
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 450,
                  damping: 35,
                },
                opacity: {
                  duration: 0.18,
                },
                scale: {
                  duration: 0.18,
                },
                y: {
                  duration: 0.18,
                },
              }}
            >
              <FolderGlass folder={folder} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}