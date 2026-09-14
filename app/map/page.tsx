'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Filter,
  Layers,
  MapPin,
  Radio,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { RoadSegment } from '@/lib/types';
import { VEHICLE_CATALOG } from '@/lib/neData';
import RoadSenseMap from '@/components/RoadSenseMap';

export default function MapPage() {
  const {
    roadSegments,
    selectedVehicle,
    setSelectedVehicle,
    selectedSegmentId,
    setSelectedSegmentId,
    toggleSegmentBlockage,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'passable'>('all');

  const filteredSegments = roadSegments.filter((seg) => {
    const matchesSearch =
      seg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seg.highwayCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seg.state.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'critical') return seg.currentStatus === 'critical' || seg.currentStatus === 'restricted';
    if (activeTab === 'passable') return seg.vehicleAccess[selectedVehicle]?.canPass;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <MapPin className="w-4 h-4" />
            <span>GIS North East Corridor Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Interactive Mountain Road &amp; Hazard Telemetry
          </h1>
        </div>

        {/* Vehicle Selection Badge */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl self-start md:self-auto">
          <Truck className="w-4 h-4 text-emerald-400 ml-2" />
          <span className="text-xs text-slate-400 font-semibold">Active Filter:</span>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value as any)}
            className="bg-slate-800 text-xs font-bold text-white rounded-xl px-3 py-1.5 border border-slate-700 focus:outline-none"
          >
            {VEHICLE_CATALOG.map((v) => (
              <option key={v.type} value={v.type}>
                {v.label} ({v.weightTonnes}T)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Fullscreen GIS Map */}
      <RoadSenseMap heightClass="h-[550px] sm:h-[620px]" />

      {/* Corridor Directory & Live Telemetry Feed */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-white">North East Highway Directory</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              {filteredSegments.length} segments
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter NH-6, Sonapur, Sikkim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2 w-52 sm:w-64 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('critical')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'critical' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Blocked
              </button>
              <button
                onClick={() => setActiveTab('passable')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'passable' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Passable
              </button>
            </div>
          </div>
        </div>

        {/* Corridor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSegments.map((seg) => {
            const vehicleAccess = seg.vehicleAccess[selectedVehicle];
            const isBlockedForVehicle = !vehicleAccess?.canPass || vehicleAccess?.status === 'blocked';

            return (
              <div
                key={seg.id}
                onClick={() => setSelectedSegmentId(seg.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  selectedSegmentId === seg.id
                    ? 'bg-slate-900/90 border-emerald-500/70 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-xs font-bold">
                        {seg.highwayCode}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{seg.state}</span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        seg.currentStatus === 'critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : seg.currentStatus === 'restricted'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                          : seg.currentStatus === 'minor'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {seg.currentStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{seg.name}</h3>

                  {seg.currentHazard && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{seg.currentHazard.toUpperCase()} ({seg.obstructionPercentage}% obstruction)</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 line-clamp-2">{seg.officialNotes}</p>
                </div>

                {/* Passability for Selected Vehicle */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Passability ({selectedVehicle}):</span>
                    <span
                      className={`font-bold ${
                        isBlockedForVehicle
                          ? 'text-red-400'
                          : vehicleAccess?.status === 'caution'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {isBlockedForVehicle ? '❌ Impassable' : vehicleAccess?.status === 'caution' ? '⚠️ Caution / Slow' : '✅ Passable'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Length: {seg.lengthKm} km &bull; Elev: {seg.elevationMeters}m</span>
                    <span className="font-bold text-emerald-400">Click to Inspect</span>
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
