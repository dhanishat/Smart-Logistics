'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CloudLightning,
  CloudRain,
  Compass,
  Droplets,
  Flame,
  Globe,
  Layers,
  MapPin,
  Mountain,
  Radio,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Thermometer,
  Truck,
  Wind,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { PredictiveAlert, SeverityLevel } from '@/lib/types';
import { VEHICLE_CATALOG } from '@/lib/neData';

export default function RiskPredictionPage() {
  const { predictiveAlerts, selectedVehicle, setSelectedVehicle } = useStore();
  const [selectedState, setSelectedState] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const states = ['all', 'Meghalaya', 'Sikkim', 'Arunachal Pradesh', 'Assam', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura'];

  const filteredAlerts = predictiveAlerts.filter(
    (a) => selectedState === 'all' || a.state.toLowerCase() === selectedState.toLowerCase()
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
            🔴 Critical Geohazard
          </span>
        );
      case 'predicted_high_risk':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            ⚠️ Predicted High Risk
          </span>
        );
      case 'restricted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">
            🟠 Restricted Corridor
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            🟡 Moderate Advisory
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>AI Predictive Geohazard &amp; Weather Fusion Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Pre-Disaster Risk &amp; Early Warning Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Combining real-time IMD Doppler precipitation data, soil moisture telemetry, steep slope gradient calculations, and historical breach records to anticipate roadblocks 2 to 12 hours ahead.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white hover:border-slate-700 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing Radar...' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Environmental Telemetry Radar Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900/80 border border-blue-500/30 space-y-2">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase">Precipitation Surge</span>
            <CloudRain className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-white">74 mm/hr</div>
          <p className="text-[11px] text-slate-300">East Jaintia Hills &bull; Active Cloudburst</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900/80 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase">Soil Saturation</span>
            <Droplets className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-white">96% Saturation</div>
          <p className="text-[11px] text-slate-300">Liquefaction threshold reached</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900/80 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-bold uppercase">High Altitude Freeze</span>
            <Thermometer className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-white">-4°C Black Ice</div>
          <p className="text-[11px] text-slate-300">Sela Tunnel &bull; 13,700 ft Altitude</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/40 to-slate-900/80 border border-red-500/30 space-y-2">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-bold uppercase">Slope Shear Probability</span>
            <Mountain className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">94% Critical</div>
          <p className="text-[11px] text-slate-300">NH-6 Sonapur to Ratacherra Zone</p>
        </div>
      </div>

      {/* State Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        {states.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedState(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 capitalize ${
              selectedState.toLowerCase() === st.toLowerCase()
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {st === 'all' ? 'All NE States' : st}
          </button>
        ))}
      </div>

      {/* Predictive Alerts Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Active Geohazard Warnings</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              {filteredAlerts.length} feeds
            </span>
          </h2>
          <span className="text-xs text-slate-400">Updated continuously by AI Neural Telemetry</span>
        </div>

        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const isVehicleAffected = alert.affectedVehicles.includes(selectedVehicle);

            return (
              <div
                key={alert.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs font-bold">
                      {alert.state}
                    </span>
                    <h3 className="font-bold text-base text-white">{alert.corridor}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(alert.severity)}
                    <span className="text-xs font-mono text-slate-400 font-semibold">{alert.timeframe}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                  {/* Left: Trigger Analysis */}
                  <div className="lg:col-span-8 space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Trigger Mechanism &amp; Sensor Telemetry:
                      </span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed mt-0.5">
                        {alert.triggerReason}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200">
                      <span className="font-bold text-amber-300 uppercase tracking-wider block text-[11px] mb-0.5">
                        Recommended Operational Guidance:
                      </span>
                      <p className="leading-relaxed">{alert.recommendedAction}</p>
                    </div>
                  </div>

                  {/* Right: Affected Vehicles & Probability */}
                  <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Incident Probability</span>
                        <span className="text-base font-mono font-extrabold text-red-400">{alert.probabilityPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                          style={{ width: `${alert.probabilityPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        High-Risk Vehicle Classes:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {alert.affectedVehicles.map((vType) => {
                          const vInfo = VEHICLE_CATALOG.find((v) => v.type === vType);
                          const isCurrent = vType === selectedVehicle;
                          return (
                            <span
                              key={vType}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isCurrent
                                  ? 'bg-red-500 text-white shadow-sm'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {vInfo?.label.split('/')[0]} {isCurrent && '🚨'}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <Link
                      href={`/planner`}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-center text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reroute Your Vehicle</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
