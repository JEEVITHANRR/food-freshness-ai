"use client";

import { motion } from "framer-motion";

export default function ScanningEffect() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-[2rem] border border-[#4edea3]/20 bg-[#0e1511]/40 backdrop-blur-sm group">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#4edea3]/40 rounded-tl-3xl z-30" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#4edea3]/40 rounded-tr-3xl z-30" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#4edea3]/40 rounded-bl-3xl z-30" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#4edea3]/40 rounded-br-3xl z-30" />

      {/* Scan Line */}
      <motion.div 
        animate={{ 
          top: ["-5%", "105%"],
          opacity: [0, 1, 1, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4edea3] to-transparent shadow-[0_0_20px_#4edea3] z-20"
      />
      
      {/* Dynamic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4edea30a_1px,transparent_1px),linear-gradient(to_bottom,#4edea30a_1px,transparent_1px)] bg-[size:32px_32px] z-10" />
      
      {/* Pulse Overlays */}
      <motion.div 
        animate={{ 
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 bg-[#4edea3]/10 blur-3xl"
      />

      {/* Status Indicators */}
      <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
         <div className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
         <span className="text-[10px] font-bold text-[#4edea3] uppercase tracking-[0.2em] font-mono">Vision Nodes: Active</span>
      </div>

      <div className="absolute bottom-6 right-6 z-30">
         <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] font-mono">Freq: 2.4GHz // Latency: 12ms</span>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-16 h-16 rounded-full border border-[#4edea3]/20 flex items-center justify-center bg-[#0e1511]/60">
           <div className="w-10 h-10 rounded-full border border-[#4edea3]/40 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-[#4edea3] font-mono text-xs font-bold tracking-widest uppercase mb-1">Scanning Scene...</p>
          <div className="flex gap-1 justify-center">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i}
                animate={{ scaleY: [1, 2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-[2px] h-3 bg-[#4edea3]/40"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
