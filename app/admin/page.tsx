'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Hammer,
  Layers,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Truck,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { HazardReport, SeverityLevel } from '@/lib/types';

export default function AdminDashboardPage() {
  const {
    hazardReports,
    roadSegments,
    verifyHazardReport,
    resolveHazardReport,
    dispatchClearingTeam,
    stats,
    resetAllData,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unverified' | 'dispatched'>('all');
  const [officialNoteInput, setOfficialNoteInput] = useState<{ [id: string]: string }>({});
  const [selectedReportForNotes, setSelectedReportForNotes] = useState<string | null>(null);

  const filteredReports = hazardReports.filter((rep) => {
    if (activeTab === 'unverified') return !rep.verified;
    if (activeTab === 'dispatched') return rep.clearingTeamDispatched;
    return true;
  });

  const handleVerify = (id: string) => {
    const note = officialNoteInput[id] || 'Verified by District Administration / BRO Control Room.';
    verifyHazardReport(id, note);
    setSelectedReportForNotes(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Disaster Management, BRO &amp; Transport Authority Command HQ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            North East Corridor Control Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Live incident queue, AI confidence validation, clearing taskforce dispatching, and official road clearance authority.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetAllData}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-bold uppercase">Critical Blockages</span>
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.criticalBlockages}</div>
          <p className="text-[11px] text-slate-400">Heavy multi-axle freight halted</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-bold uppercase">BRO / PWD Teams</span>
            <Hammer className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.clearingTeamsActive}</div>
          <p className="text-[11px] text-slate-400">Excavators &amp; bulldozers on site</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase">Total Incident Reports</span>
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-white">{hazardReports.length}</div>
          <p className="text-[11px] text-slate-400">
            {hazardReports.filter((r) => r.verified).length} Verified by Authorities
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase">Corridors Monitored</span>
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.roadsMonitored}</div>
          <p className="text-[11px] text-slate-400">Telemetry updated in real-time</p>
        </div>
      </div>

      {/* Choke Point Frequency & Historical Analytics Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Most Frequently Affected Mountain Corridors (Monsoon Historical Index)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Risk Vulnerability Score (0-100)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roadSegments.slice(0, 4).map((seg) => (
            <div key={seg.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[140px]">{seg.name.split(':')[0]}</span>
                <span className="text-xs font-mono font-extrabold text-emerald-400">
                  {seg.historicalIncidentRate}/100
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    seg.historicalIncidentRate >= 80
                      ? 'bg-red-500'
                      : seg.historicalIncidentRate >= 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${seg.historicalIncidentRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{seg.state}</span>
                <span>{seg.reportCount} reports logged</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Incidents & Verification Queue */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Active Road Disruption Queue</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              {filteredReports.length} items
            </span>
          </div>

          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeTab === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Reports ({hazardReports.length})
            </button>
            <button
              onClick={() => setActiveTab('unverified')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeTab === 'unverified' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending Verification ({hazardReports.filter((r) => !r.verified).length})
            </button>
            <button
              onClick={() => setActiveTab('dispatched')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeTab === 'dispatched' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Clearing Active ({hazardReports.filter((r) => r.clearingTeamDispatched).length})
            </button>
          </div>
        </div>

        {/* Reports Table / Card Stack */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl"
            >
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs font-bold">
                    {report.highwayCode}
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-white">{report.segmentName}</h3>
                    <p className="text-xs text-slate-400">{report.locationDescription}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      report.severity === 'critical'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : report.severity === 'restricted'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {report.severity} &bull; {report.obstructionPercentage}% Obstruction
                  </span>

                  {report.verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                {/* Photo Thumbnail + Description */}
                <div className="lg:col-span-8 flex flex-col sm:flex-row gap-4">
                  {report.imageUrl && (
                    <img
                      src={report.imageUrl}
                      alt={report.hazardType}
                      className="w-full sm:w-36 h-28 object-cover rounded-2xl border border-slate-700 shrink-0"
                    />
                  )}
                  <div className="space-y-2 flex-1">
                    <p className="text-xs text-slate-200 leading-relaxed">{report.description}</p>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300">
                      <strong className="text-emerald-400 text-[11px] block">AI Action Recommendation:</strong>
                      {report.recommendedAction}
                    </div>
                  </div>
                </div>

                {/* Telemetry & Metadata */}
                <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Reported By:</span>
                      <strong className="text-slate-200">{report.reportedBy}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>AI Model Confidence:</span>
                      <strong className="text-emerald-400 font-mono">{report.aiConfidence}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Timestamp:</span>
                      <strong className="text-slate-200">{report.timestamp}</strong>
                    </div>
                  </div>

                  {report.clearingTeamDispatched && (
                    <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-300 text-[11px] flex items-center gap-1.5 font-semibold">
                      <Hammer className="w-3.5 h-3.5 text-purple-400" />
                      <span>BRO 765 BRTF Clearance Team on Site</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/map?segment=${report.segmentId}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View on GIS Map</span>
                  </Link>

                  {!report.clearingTeamDispatched && (
                    <button
                      onClick={() => dispatchClearingTeam(report.segmentId)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      <span>Dispatch BRO Bulldozers</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!report.verified && (
                    <button
                      onClick={() => handleVerify(report.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify &amp; Issue Advisory</span>
                    </button>
                  )}

                  <button
                    onClick={() => resolveHazardReport(report.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-900/40 border border-slate-700 text-slate-300 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark Road Reopened</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
