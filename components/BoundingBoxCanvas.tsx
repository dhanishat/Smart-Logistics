'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, ImagePlus, Scan, ShieldCheck } from 'lucide-react';

interface BoundingBox {
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [x%, y%, w%, h%]
}

interface BoundingBoxCanvasProps {
  imageUrl: string;
  boxes?: BoundingBox[];
  isScanning?: boolean;
  onScanComplete?: () => void;
}

export default function BoundingBoxCanvas({
  imageUrl,
  boxes = [],
  isScanning = false,
  onScanComplete,
}: BoundingBoxCanvasProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const [revealedBoxes, setRevealedBoxes] = useState<BoundingBox[]>([]);

  useEffect(() => {
    if (isScanning) {
      setScanProgress(0);
      setRevealedBoxes([]);
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setRevealedBoxes(boxes);
            onScanComplete?.();
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      setScanProgress(100);
      setRevealedBoxes(boxes);
    }
  }, [isScanning, boxes]);

  return (
    <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-slate-700 bg-black shadow-2xl group">
      {/* Background Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Road Hazard Scene"
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isScanning ? 'scale-105 filter contrast-125' : 'group-hover:scale-102'
          }`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
          <ImagePlus className="w-12 h-12 text-emerald-400/70" />
          <div className="text-center">
            <p className="text-sm font-bold text-slate-200">Upload a road image</p>
            <p className="text-xs text-slate-500">The scanner will analyze your selected photo.</p>
          </div>
        </div>
      )}

      {/* High-tech Scanning Grid Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090D16]/90 via-transparent to-black/40 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Animated Laser Scanning Line */}
      {isScanning && (
        <>
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-500 shadow-[0_0_15px_#10B981] z-20 transition-all duration-75"
            style={{ top: `${scanProgress}%` }}
          />
          <div className="absolute top-4 left-4 z-30 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md animate-pulse">
            <Scan className="w-4 h-4 animate-spin-slow" />
            <span className="font-mono font-bold">NE NEURAL VISION: SCANNING ({scanProgress}%)</span>
          </div>
        </>
      )}

      {/* Target Crosshairs in Corners */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400 z-10 pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400 z-10 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400 z-10 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400 z-10 pointer-events-none" />

      {/* Bounding Boxes Layer */}
      {revealedBoxes.map((item, idx) => {
        const [x, y, w, h] = item.box;
        return (
          <div
            key={idx}
            className="absolute z-20 border-2 border-red-500 bg-red-500/15 rounded-md transition-all duration-500 animate-pulse-glow"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${w}%`,
              height: `${h}%`,
            }}
          >
            {/* Box Header Tag */}
            <div className="absolute -top-6 left-0 bg-red-600/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1.5 whitespace-nowrap">
              <Cpu className="w-3 h-3 text-red-200" />
              <span>{item.label}</span>
              <span className="text-yellow-300 font-extrabold">{item.confidence}%</span>
            </div>
          </div>
        );
      })}

      {/* Bottom Info HUD Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 border-t border-slate-800/80 px-4 py-2.5 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Model: <strong className="text-white">RoadSense-ResNet-NE50</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-semibold">{revealedBoxes.length} Anomaly Zones Detected</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          GIS LAT/LNG RESOLUTION: &plusmn;0.8m
        </div>
      </div>
    </div>
  );
}
