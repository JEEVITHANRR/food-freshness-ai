"use client";

import { motion } from "framer-motion";

export default function ScanningEffect() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl border border-primary/20 bg-black/5">
      {/* Scan Line */}
      <div className="scan-line" />
      
      {/* Animated Overlay Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Pulse Dots */}
      <motion.div 
        animate={{ 
          opacity: [0.2, 0.5, 0.2],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 bg-primary/5 blur-3xl"
      />

      <div className="relative z-20 flex items-center justify-center h-full text-primary/40 font-mono text-xs tracking-tighter">
        [ SYSTEM SCANNING IN PROGRESS... ]
      </div>
    </div>
  );
}
