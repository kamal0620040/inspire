"use client";

import Image from "next/image";
import { motion } from "framer-motion";

function AssetsContainer() {
  return (
    <div>
      <motion.div
        drag
        dragMomentum={false}
        className="absolute left-40 bottom-40 cursor-grab active:cursor-grabbing"
      >
        <Image
          src="/canvas-image-1.png"
          alt=""
          width={200}
          height={100}
          draggable={false}
        />
      </motion.div>

      <motion.div
        drag
        dragMomentum={false}
        className="absolute left-2/3 bottom-20 cursor-grab active:cursor-grabbing"
      >
        <Image
          src="/canvas-video-1.gif"
          alt=""
          width={200}
          height={100}
          draggable={false}
        />
      </motion.div>

      <motion.div
        drag
        dragMomentum={false}
        className="absolute left-1/3 bottom-20 border-2 cursor-grab active:cursor-grabbing"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          src="/canvas-video-2.mp4"
          width={200}
          height={100}
          draggable={false}
        />
      </motion.div>

      <motion.div
        drag
        dragMomentum={false}
        className="absolute right-40 bottom-80 cursor-grab active:cursor-grabbing"
      >
        <Image
          src="/canvas-image-2.png"
          alt=""
          width={200}
          height={100}
          draggable={false}
        />
      </motion.div>
    </div>
  );
}

export default AssetsContainer;
