'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bike,
  Boxes,
  Bus,
  Car,
  CheckCircle2,
  Container,
  ShieldAlert,
  Truck,
  XCircle,
} from 'lucide-react';
import { PassabilityStatus, VehicleAccessibilityMatrix, VehicleType } from '@/lib/types';
import { VEHICLE_CATALOG } from '@/lib/neData';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

interface VehicleAccessTableProps {
  matrix: VehicleAccessibilityMatrix;
  highlightSelected?: boolean;
  compact?: boolean;
  onSelectVehicle?: (type: VehicleType) => void;
}

const VEHICLE_ICONS: Record<VehicleType, React.ElementType> = {
  motorcycle: Bike,
  car: Car,
  lcv: Truck,
  bus: Bus,
  heavy_truck: Container,
  loaded_truck: Boxes,
  emergency: ShieldAlert,
};

export default function VehicleAccessTable({
  matrix,
  highlightSelected = true,
  compact = false,
  onSelectVehicle,
}: VehicleAccessTableProps) {
  const { selectedVehicle, setSelectedVehicle } = useStore();
  const { t } = useTranslation();

  const getStatusBadge = (status: PassabilityStatus) => {
    switch (status) {
      case 'passable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('status.safe', 'Passable ✅')}
          </span>
        );
      case 'caution':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t('status.restricted', 'Caution / Lmt ⚠️')}
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" />
            {t('status.critical', 'Blocked ❌')}
          </span>
        );
      case 'emergency_only':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            Priority Only 🚨
          </span>
        );
    }
  };

  if (compact) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {VEHICLE_CATALOG.map((v) => {
          const access = matrix[v.type] || { status: 'passable', canPass: true, advice: 'Clear', delayMin: 0 };
          const Icon = VEHICLE_ICONS[v.type];
          const isCurrent = highlightSelected && selectedVehicle === v.type;

          return (
            <div
              key={v.type}
              onClick={() => {
                setSelectedVehicle(v.type);
                onSelectVehicle?.(v.type);
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isCurrent
                  ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    access.status === 'blocked'
                      ? 'bg-red-500/15 text-red-400'
                      : access.status === 'caution'
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    {t(`vehicle.${v.type}`, v.label.split('/')[0])}
                    {isCurrent && <span className="text-[10px] text-emerald-400">(Your Vehicle)</span>}
                  </div>
                  <div className="text-[10px] text-slate-400">{v.weightTonnes} Tonnes</div>
                </div>
              </div>
              <div>{getStatusBadge(access.status)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-md">
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-white">Dynamic Vehicle-Specific Accessibility Matrix</h4>
        </div>
        <span className="text-xs text-slate-400 font-medium">Click vehicle row to simulate route</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/40">
              <th className="py-2.5 px-4">Vehicle Category</th>
              <th className="py-2.5 px-3">Specs (Weight/GC)</th>
              <th className="py-2.5 px-3">Passability Status</th>
              <th className="py-2.5 px-3">Estimated Delay</th>
              <th className="py-2.5 px-4">AI Safety & Reroute Guidance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-xs">
            {VEHICLE_CATALOG.map((v) => {
              const access = matrix[v.type] || {
                status: 'passable',
                canPass: true,
                advice: 'Clear passage.',
                delayMin: 0,
              };
              const Icon = VEHICLE_ICONS[v.type];
              const isSelected = highlightSelected && selectedVehicle === v.type;

              return (
                <tr
                  key={v.type}
                  onClick={() => {
                    setSelectedVehicle(v.type);
                    onSelectVehicle?.(v.type);
                  }}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/15'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Vehicle Label */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          access.status === 'blocked'
                            ? 'bg-red-500/15 text-red-400'
                            : access.status === 'caution'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {t(`vehicle.${v.type}`, v.label)}
                          {isSelected && (
                            <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{v.category}</div>
                      </div>
                    </div>
                  </td>

                  {/* Specs */}
                  <td className="py-3 px-3 text-slate-300 font-medium">
                    <div>{v.weightTonnes} Tonnes</div>
                    <div className="text-[11px] text-slate-400">{v.groundClearanceMm}mm GC</div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">{getStatusBadge(access.status)}</td>

                  {/* Delay */}
                  <td className="py-3 px-3">
                    {access.delayMin > 0 ? (
                      <span
                        className={`font-semibold ${
                          access.delayMin >= 120 ? 'text-red-400' : 'text-amber-400'
                        }`}
                      >
                        +{Math.floor(access.delayMin / 60)}h {access.delayMin % 60}m
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium">0 min</span>
                    )}
                  </td>

                  {/* AI Advice */}
                  <td className="py-3 px-4 text-slate-300">
                    <div className="flex items-start gap-1.5">
                      {access.status === 'blocked' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      ) : access.status === 'caution' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-xs leading-relaxed">{access.advice}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
