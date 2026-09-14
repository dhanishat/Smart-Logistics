'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Camera,
  CheckCircle2,
  ChevronRight,
  Compass,
  Cpu,
  Layers,
  MapPin,
  Mountain,
  Navigation,
  Radio,
  Route,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { VEHICLE_CATALOG } from '@/lib/neData';
import VehicleAccessTable from '@/components/VehicleAccessTable';
import { useTranslation } from '@/lib/i18n';

export default function HomePage() {
  const { stats, roadSegments, hazardReports, selectedVehicle, setSelectedVehicle, setActiveDemoStep } = useStore();
  const { t } = useTranslation();

  const activeReports = hazardReports.slice(0, 3);
  const criticalSegments = roadSegments.filter((s) => s.currentStatus === 'critical' || s.currentStatus === 'restricted');

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-800 bg-gradient-to-br from-[#0F172A]/90 via-[#0B1120]/80 to-[#060912]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
            <Mountain className="w-3.5 h-3.5" />
            <span>{t('hero.badge', 'NORTH EAST INDIA SMART LOGISTICS & HAZARD INTELLIGENCE')}</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            {t('hero.title1', 'Beyond "Open or Closed".')} <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              {t('hero.title2', 'Dynamic Road Accessibility')}
            </span>{' '}
            {t('hero.title3', 'for Your Exact Vehicle.')}
          </h1>

          {/* Mission Description */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {t(
              'hero.desc',
              'Helping logistics drivers, transport fleets, emergency relief units, and disaster authorities navigate landslides, flash floods, and fragile mountain passes across North Eastern India.'
            )}
            <strong className="block text-white font-semibold mt-2">
              {t('hero.question', '"Can my specific vehicle safely travel from A to B right now, and what\'s the safest route?"')}
            </strong>
          </p>

          {/* CTA Group */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/report"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" />
              <span>{t('hero.btnReport', 'Report a Hazard (AI Scan)')}</span>
            </Link>

            <Link
              href="/map"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{t('hero.btnMap', 'View Live GIS Map')}</span>
            </Link>

            <Link
              href="/planner"
              className="px-6 py-3.5 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 font-bold text-sm transition-all flex items-center gap-2"
            >
              <Route className="w-4 h-4" />
              <span>{t('hero.btnPlanner', 'Route Planner')}</span>
            </Link>

            <button
              onClick={() => setActiveDemoStep(1)}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-bold text-sm transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{t('hero.btnDemo', 'Interactive Demo Flow')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('stats.activeAlerts', 'Active Alerts')}</span>
            <AlertTriangle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">{stats.activeAlerts}</span>
            <span className="text-xs text-red-400 font-semibold">{stats.criticalBlockages} {t('stats.critical', 'Critical')}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Real-time mountain corridor disruptions</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('stats.roadsMonitored', 'Monitored Corridors')}</span>
            <Navigation className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">{stats.roadsMonitored}</span>
            <span className="text-xs text-emerald-400 font-semibold">8 States</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Covering NH-6, NH-27, NH-10, NH-13, NH-2</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('stats.reportsToday', 'Reports Today')}</span>
            <Camera className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">{stats.reportsToday}</span>
            <span className="text-xs text-blue-400 font-semibold">AI Classified</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified crowd & driver reports</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('stats.clearingTeams', 'BRO / PWD Response')}</span>
            <ShieldCheck className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">{stats.clearingTeamsActive}</span>
            <span className="text-xs text-purple-400 font-semibold">Teams Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Heavy earthmovers deployed</p>
        </div>
      </section>

      {/* Interactive Vehicle Accessibility Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4" />
              <span>The Platform&rsquo;s Core Differentiator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why Generic Maps Fail in the North East
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              A landslide with 90% obstruction might leave an 0.8-meter shoulder passable for a local motorcycle or winch-assisted NDRF ambulance, while completely stranding a 25-tonne logistics freight rig.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-start md:self-auto">
            <span className="text-xs text-slate-400 font-medium pl-2">{t('nav.vehicleProfile', 'Select Vehicle')}:</span>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value as any)}
              className="bg-slate-800 text-xs font-bold text-emerald-400 rounded-lg px-2.5 py-1.5 border border-slate-700"
            >
              {VEHICLE_CATALOG.map((v) => (
                <option key={v.type} value={v.type}>
                  {t(`vehicle.${v.type}`, v.label)} ({v.weightTonnes}T)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Sonapur Segment Sample Table */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-mono font-bold">
                NH-6 CRITICAL ALERT
              </span>
              <span className="text-sm font-bold text-white">Sonapur Tunnel Landslide &amp; Lubha River Silt Flow</span>
            </div>
            <span className="text-xs text-slate-400">92% Road Obstruction</span>
          </div>

          <VehicleAccessTable matrix={roadSegments[0].vehicleAccess} highlightSelected />
        </div>
      </section>

      {/* 4 Pillar Feature Matrix */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 hover:border-emerald-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">AI Vision Scanner</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instant on-device computer vision classifies landslides, mudflows, rockfalls, and road sinkholes with 94%+ confidence and estimates obstruction percentage.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 hover:border-blue-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Route className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Dynamic Rerouting</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatically computes safe valley bypasses (e.g. Western Meghalaya or Lava ridge) when mountain spines become impassable for heavy cargo.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 hover:border-amber-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Predictive Risk Radar</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fuses IMD cloudburst telemetry, soil saturation gauges, and slope gradient models to warn drivers 2-6 hours before catastrophic landslides occur.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 hover:border-purple-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Disaster Authority HQ</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct coordination portal for BRO taskforces, NDRF units, and State Disaster Management Authorities to verify reports and dispatch earthmovers.
          </p>
        </div>
      </section>

      {/* Active High-Risk Mountain Corridors Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Active Mountain Disruptions</h3>
            <p className="text-xs text-slate-400">Live intelligence across primary North East logistics lifelines</p>
          </div>
          <Link href="/map" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            <span>Explore Full GIS Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {criticalSegments.slice(0, 3).map((seg) => (
            <div
              key={seg.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-xs font-bold">
                    {seg.highwayCode}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      seg.currentStatus === 'critical'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    }`}
                  >
                    {t(`status.${seg.currentStatus}`, seg.currentStatus)}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">{seg.name}</h4>
                <p className="text-xs text-slate-300 line-clamp-2">{seg.officialNotes}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Obstruction: <strong className="text-white">{seg.obstructionPercentage}%</strong></span>
                <Link
                  href={`/map?segment=${seg.id}`}
                  className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
