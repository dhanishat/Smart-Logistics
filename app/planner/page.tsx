'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CornerDownRight,
  HelpCircle,
  Layers,
  MapPin,
  Mountain,
  Navigation,
  Play,
  RotateCcw,
  Route as RouteIcon,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Truck,
  XCircle,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { HUB_CITIES, VEHICLE_CATALOG } from '@/lib/neData';
import { computeDynamicRoutes } from '@/lib/aiEngine';
import { RouteOption, VehicleType } from '@/lib/types';
import VehicleAccessTable from '@/components/VehicleAccessTable';

export default function RoutePlannerPage() {
  const {
    roadSegments,
    selectedVehicle,
    setSelectedVehicle,
    activeDemoStep,
    runDemoStep,
  } = useStore();

  const [sourceCity, setSourceCity] = useState<string>('guwahati');
  const [destCity, setDestCity] = useState<string>('silchar');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const hasLiveRoadData = roadSegments.some(
    (segment) => segment.currentStatus !== 'safe' || segment.reportCount > 0 || segment.officialNotes
  );

  // Compute dynamic routes
  const routes = hasLiveRoadData ? computeDynamicRoutes(sourceCity, destCity, selectedVehicle, roadSegments) : [];
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes.find((r) => r.isRecommended) || routes[0];

  const currentVehicle = VEHICLE_CATALOG.find((v) => v.type === selectedVehicle) || VEHICLE_CATALOG[4];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <RouteIcon className="w-4 h-4" />
          <span>Vehicle-Specific Dynamic Route Optimization</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Intelligent North East Route Planner
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          Generic routing sends trucks directly into active mudslides and bridge weight caps. NE RoadSense computes multi-factor terrain and obstruction feasibility for your specific vehicle class.
        </p>
      </div>

      {/* Query Selector Panel */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Source Hub */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Origin / Departure Hub:
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              <select
                value={sourceCity}
                onChange={(e) => {
                  setSourceCity(e.target.value);
                  setSelectedRouteId(null);
                }}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {HUB_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.state}) - {c.hubType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destination Hub */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Destination Terminal:
            </label>
            <div className="relative">
              <Navigation className="w-4 h-4 text-blue-400 absolute left-3 top-3" />
              <select
                value={destCity}
                onChange={(e) => {
                  setDestCity(e.target.value);
                  setSelectedRouteId(null);
                }}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {HUB_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.state}) - {c.hubType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Type Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Vehicle Class &amp; Weight Specification:
            </label>
            <div className="relative">
              <Truck className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {VEHICLE_CATALOG.map((v) => (
                  <option key={v.type} value={v.type}>
                    {v.label} ({v.weightTonnes} Tonnes)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!hasLiveRoadData && (
          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            Route alternatives will appear after a real hazard report or authority update is submitted.
          </div>
        )}
      </div>

      {/* Dynamic Recommendation Banner */}
      {hasLiveRoadData && activeRoute ? (
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-900/80 border border-emerald-500/40 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-extrabold text-white">
              AI Route Recommendation for {currentVehicle.label}
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
            Vehicle Specific Evaluation
          </span>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {routes.find((r) => r.isRecommended)?.reasoning || activeRoute.reasoning}
        </p>
      </div>
      ) : (
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 text-center space-y-2">
          <h3 className="text-lg font-extrabold text-white">No live route advisories yet</h3>
          <p className="text-sm text-slate-400">
            Submit a real road hazard report to calculate route alternatives for the selected vehicle.
          </p>
          <Link
            href="/report"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Road Condition</span>
          </Link>
        </div>
      )}

      {/* Multi-Route Comparison Cards */}
      {hasLiveRoadData && activeRoute && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Calculated Route Alternatives</h3>
          <span className="text-xs text-slate-400 font-mono">{routes.length} options evaluated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {routes.map((route, idx) => {
            const isSelected = route.id === activeRoute.id;
            const isBlocked = route.statusForVehicle === 'blocked';
            const isCaution = route.statusForVehicle === 'caution';

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  route.isRecommended
                    ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900/90 border-emerald-500/60 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                    : isBlocked
                    ? 'bg-slate-900/60 border-red-500/30 opacity-90'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Recommended Badge */}
                {route.isRecommended && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Recommended Safest
                  </div>
                )}

                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-slate-400">
                      Option #{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        route.riskLevel === 'Critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : route.riskLevel === 'High'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                          : route.riskLevel === 'Moderate'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {route.riskLevel} Risk
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white leading-snug">{route.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">{route.via}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Distance</span>
                    <span className="font-extrabold text-white text-sm">{route.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Est. Duration</span>
                    <span className="font-extrabold text-white text-sm">
                      {Math.floor(route.durationMinutes / 60)}h {route.durationMinutes % 60}m
                    </span>
                  </div>
                </div>

                {/* Vehicle Feasibility Status */}
                <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-400">Passability ({selectedVehicle}):</span>
                    <span
                      className={
                        isBlocked
                          ? 'text-red-400 flex items-center gap-1'
                          : isCaution
                          ? 'text-amber-400 flex items-center gap-1'
                          : 'text-emerald-400 flex items-center gap-1'
                      }
                    >
                      {isBlocked ? <XCircle className="w-3.5 h-3.5" /> : isCaution ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isBlocked ? 'Blocked ❌' : isCaution ? 'Caution ⚠️' : 'Passable ✅'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{route.clearanceNote}</p>
                </div>

                {/* Action Indicator */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {route.activeHazardsCount > 0 ? `${route.activeHazardsCount} active hazard(s)` : 'Zero active hazards'}
                  </span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      isSelected ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    <span>{isSelected ? 'Selected' : 'Select'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Selected Route Detailed Diagnostics & Elevation Profile */}
      {hasLiveRoadData && activeRoute && (
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
              Waypoint &amp; Terrain Diagnostics
            </span>
            <h3 className="text-lg font-bold text-white">{activeRoute.title}</h3>
          </div>
          <Link
            href="/map"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>View Corridors on GIS Map</span>
          </Link>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Total Elevation Gain</span>
            <span className="text-lg font-extrabold text-white flex items-center gap-1">
              <Mountain className="w-4 h-4 text-emerald-400" />
              {activeRoute.elevationGainM}m
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Max Road Gradient</span>
            <span className="text-lg font-extrabold text-white">{activeRoute.maxInclinePct}% Incline</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Safety Score</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">
              {activeRoute.riskLevel === 'Low' ? '96/100' : activeRoute.riskLevel === 'Moderate' ? '74/100' : '28/100'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Advisory Warnings</span>
            <span className="text-lg font-extrabold text-amber-400 font-mono">
              {activeRoute.warnings.length} Active
            </span>
          </div>
        </div>

        {/* Warnings List */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Corridor Conditions &amp; Restraints:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {activeRoute.warnings.map((warn, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{warn}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      )}
    </div>
  );
}
