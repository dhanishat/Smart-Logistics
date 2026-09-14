'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function DemoController() {
  const router = useRouter();
  const {
    activeDemoStep,
    setActiveDemoStep,
    runDemoStep,
    resetAllData,
    selectedVehicle,
  } = useStore();

  if (activeDemoStep === 0) return null;

  const steps = [
    {
      num: 1,
      title: 'Heavy Freight Dispatch',
      badge: 'Step 1: Route Setup',
      desc: 'Simulate 25-T Multi-Axle Truck initiating logistics transit from Guwahati to Silchar (NH-6).',
      action: 'Dispatch Truck',
      route: '/planner',
      narration: 'Logistics operator plans standard NH-6 route. Initial road status shows open/passable.',
    },
    {
      num: 2,
      title: 'Mid-Route Landslide Incident',
      badge: 'Step 2: Incident Trigger',
      desc: 'Heavy monsoon cloudburst triggers massive slope failure near Sonapur Tunnel.',
      action: 'Simulate Driver Capture',
      route: '/report',
      narration: 'Driver on NH-6 encounters road collapse, opens NE RoadSense mobile camera to report.',
    },
    {
      num: 3,
      title: 'AI Computer Vision Scan',
      badge: 'Step 3: Neural Classification',
      desc: 'AI detects Landslide (94% Conf, 92% Blockage). Evaluates vehicle passability matrix.',
      action: 'View AI Diagnostics',
      route: '/report',
      narration: 'AI highlights: Motorcycles pass outer edge; Heavy & Loaded trucks strictly IMPASSABLE.',
    },
    {
      num: 4,
      title: 'Live GIS Segment Blocked',
      badge: 'Step 4: Map Synchronization',
      desc: 'NH-6 Sonapur turns 🔴 Blocked on GIS network. Audio alarm & telemetry broadcast.',
      action: 'Inspect GIS Map',
      route: '/map',
      narration: 'All connected dashboards receive instant telemetry update. Corridor marked Red Critical.',
    },
    {
      num: 5,
      title: 'Dynamic Reroute Recalculation',
      badge: 'Step 5: Dynamic Navigation',
      desc: 'Route planner auto-diverts Heavy Truck via Western Meghalaya Bypass (NH-17 / NH-217).',
      action: 'View Safe Bypass',
      route: '/planner',
      narration: 'System explains why Route A is blocked and presents the 100% safe bypass with revised ETA.',
    },
    {
      num: 6,
      title: 'Authority Command & BRO Dispatch',
      badge: 'Step 6: Disaster Response',
      desc: 'Control center verifies blockage and dispatches BRO 765 BRTF heavy bulldozers.',
      action: 'Open Admin HQ',
      route: '/admin',
      narration: 'Authorities monitor choke point analytics and authorize emergency clearing operations.',
    },
  ];

  const currentStepData = steps[activeDemoStep - 1] || steps[0];

  const handleNextStep = () => {
    if (activeDemoStep < 6) {
      const nextStep = activeDemoStep + 1;
      runDemoStep(nextStep);
      const nextStepData = steps[nextStep - 1];
      if (nextStepData?.route) {
        router.push(nextStepData.route);
      }
    } else {
      setActiveDemoStep(0);
    }
  };

  const handleStepClick = (num: number) => {
    runDemoStep(num);
    const stepObj = steps[num - 1];
    if (stepObj?.route) {
      router.push(stepObj.route);
    }
  };

  return (
    <div className="fixed bottom-4 inset-x-4 max-w-5xl mx-auto z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="rounded-2xl bg-[#0F172A]/95 backdrop-blur-xl border border-amber-500/40 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.2)] overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 px-4 py-2 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Live Presentation Mode &bull; {currentStepData.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetAllData}
              title="Reset Demo to Initial State"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            <button
              onClick={() => setActiveDemoStep(0)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper Navigation Pills */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          {steps.map((s) => {
            const isCompleted = s.num < activeDemoStep;
            const isCurrent = s.num === activeDemoStep;
            return (
              <button
                key={s.num}
                onClick={() => handleStepClick(s.num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-extrabold scale-105'
                    : isCompleted
                    ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span>{s.num}.</span>
                )}
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Content */}
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span>{currentStepData.title}</span>
              </h4>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {currentStepData.desc}
            </p>
            <div className="text-[11px] text-amber-300/90 font-mono italic">
              &ldquo;{currentStepData.narration}&rdquo;
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                if (currentStepData.route) router.push(currentStepData.route);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
            >
              {currentStepData.action}
            </button>
            <button
              onClick={handleNextStep}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-extrabold hover:from-amber-400 hover:to-orange-400 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <span>{activeDemoStep === 6 ? 'Finish Demo' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
