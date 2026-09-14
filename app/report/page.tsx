'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Cpu,
  FileImage,
  Layers,
  MapPin,
  Navigation,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';
import { HazardType, SeverityLevel } from '@/lib/types';
import { SAMPLE_HAZARD_PRESETS, VEHICLE_CATALOG } from '@/lib/neData';
import { useStore } from '@/lib/store';
import { simulateAIImageAnalysis, AIClassificationResult } from '@/lib/aiEngine';
import BoundingBoxCanvas from '@/components/BoundingBoxCanvas';
import VehicleAccessTable from '@/components/VehicleAccessTable';

export default function DriverReportPage() {
  const { submitHazardReport, roadSegments, selectedVehicle } = useStore();

  // Form State
  const [selectedPreset, setSelectedPreset] = useState<string>('preset-landslide-sonapur');
  const [hazardType, setHazardType] = useState<HazardType>('landslide');
  const [segmentId, setSegmentId] = useState<string>('seg-nh6-sonapur');
  const [description, setDescription] = useState<string>(
    'Massive slope collapse after cloudburst near Sonapur tunnel. Boulders and thick mud covering 90% of the highway. Small bikes can edge through on the shoulder, but heavy trucks are completely stuck.'
  );
  const [reportedBy, setReportedBy] = useState<string>('Driver (Freight Logistics Express)');
  const [customImageUrl, setCustomImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800'
  );

  // GPS Simulation
  const [gpsCoords, setGpsCoords] = useState<[number, number]>([25.109, 92.368]);
  const [locationName, setLocationName] = useState<string>('NH-6 near Sonapur Tunnel, East Jaintia Hills, Meghalaya');
  const [elevation, setElevation] = useState<number>(1380);

  // AI Scan State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  // Apply Preset
  const handlePresetSelect = (presetId: string) => {
    const preset = SAMPLE_HAZARD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPreset(presetId);
    setHazardType(preset.hazardType);
    setSegmentId(preset.segmentId);
    setDescription(preset.description);
    setCustomImageUrl(preset.imageUrl);
    setGpsCoords(preset.coords);
    setLocationName(preset.locationDescription + ', ' + preset.state);
    setAiResult(null);
    setSubmittedReportId(null);
  };

  // Trigger Simulated File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImageUrl(url);
      setSelectedPreset('custom');
      setAiResult(null);
      setSubmittedReportId(null);
    }
  };

  // Run AI Scan & Analysis
  const handleRunAIAnalysis = () => {
    setIsScanning(true);
    setAiResult(null);
    setSubmittedReportId(null);

    setTimeout(() => {
      const seg = roadSegments.find((s) => s.id === segmentId) || roadSegments[0];
      const result = simulateAIImageAnalysis(hazardType, description, seg.name);
      setAiResult(result);
      setIsScanning(false);
    }, 1400);
  };

  // Submit to Network
  const handleBroadcastReport = () => {
    if (!aiResult) return;

    const seg = roadSegments.find((s) => s.id === segmentId) || roadSegments[0];
    const report = submitHazardReport({
      segmentId: seg.id,
      segmentName: seg.name,
      highwayCode: seg.highwayCode,
      state: seg.state,
      coords: gpsCoords,
      locationDescription: locationName,
      hazardType,
      description,
      imageUrl: customImageUrl,
      reportedBy,
      customConfidence: aiResult.confidence,
      customObstruction: aiResult.obstructionPercentage,
    });

    setSubmittedReportId(report.id);
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">🔴 Critical Blockage</span>;
      case 'restricted':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">🟠 Restricted</span>;
      case 'minor':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">🟡 Minor Disturbance</span>;
      case 'predicted_high_risk':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">⚠️ High Risk Advisory</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">🟢 Safe</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Camera className="w-4 h-4" />
          <span>Driver & Patrol Hazard Submission Interface</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          AI Road Hazard & Disruption Scanner
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          Capture or upload road conditions. Our multi-factor neural computer vision model classifies the disturbance, calculates road obstruction percentage, and dynamically computes passability for all vehicle categories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form & Camera */}
        <div className="lg:col-span-6 space-y-6">
          {/* Preset Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Quick Test Hazard Presets (North East Scenarios):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_HAZARD_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPreset === preset.id
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>{preset.hazardType.toUpperCase()}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{preset.highwayCode}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{preset.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Camera / Image Upload Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Road Scene Image &amp; Vision Scanner:
              </label>
              <label className="text-xs font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Image</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <BoundingBoxCanvas
              imageUrl={customImageUrl}
              boxes={aiResult?.boundingBoxes || []}
              isScanning={isScanning}
            />
          </div>

          {/* Auto-GPS Telemetry Block */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <MapPin className="w-3.5 h-3.5" />
                Auto-Attached GPS &amp; Mountain Telemetry
              </span>
              <span className="text-[11px] font-mono text-slate-400">STATUS: LOCKED 📍</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Coordinates</span>
                <span className="font-mono font-bold text-slate-200">
                  {gpsCoords[0].toFixed(4)}°N, {gpsCoords[1].toFixed(4)}°E
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Elevation</span>
                <span className="font-mono font-bold text-slate-200">{elevation} Meters (Hill Zone)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 truncate">{locationName}</p>
          </div>

          {/* Disturbance Type & Description */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Disturbance Type (Optional override):
              </label>
              <select
                value={hazardType}
                onChange={(e) => {
                  setHazardType(e.target.value as HazardType);
                  setAiResult(null);
                }}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="landslide">Landslide (Hill Slope Shear)</option>
                <option value="mudslide">Mudslide (Silt & Liquefied Soil)</option>
                <option value="flood">Flood / Brahmaputra Waterlogging</option>
                <option value="rockfall">Rockfall / Boulder Fracture</option>
                <option value="road_collapse">Road Collapse / Embankment Washout</option>
                <option value="fallen_tree">Fallen Tree / Uprooted Timber</option>
                <option value="road_damage">Road Damage / Potholes</option>
                <option value="debris">Construction Debris</option>
                <option value="accident">Accident / Freight Collision</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Road Corridor:
              </label>
              <select
                value={segmentId}
                onChange={(e) => {
                  setSegmentId(e.target.value);
                  setAiResult(null);
                }}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {roadSegments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.highwayCode} - {s.name} ({s.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Short Description / Observations:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                placeholder="Describe current road width, boulder size, water depth..."
              />
            </div>

            {/* Run AI Button */}
            <button
              onClick={handleRunAIAnalysis}
              disabled={isScanning}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Road Geometry &amp; Anomaly...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Execute Neural AI Hazard Classification</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Analysis Result Card & Passability Matrix */}
        <div className="lg:col-span-6 space-y-6">
          {aiResult ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-400">
              {/* Main AI Diagnostic Card */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-lg font-extrabold text-white">AI Vision Diagnostic Result</h3>
                      <p className="text-xs text-slate-400">Real-time Computer Vision Telemetry</p>
                    </div>
                  </div>
                  {getSeverityBadge(aiResult.severity)}
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Detected Hazard</span>
                    <span className="text-sm font-bold text-white capitalize">{aiResult.hazardType.replace('_', ' ')}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">AI Confidence</span>
                    <span className="text-sm font-mono font-extrabold text-emerald-400">{aiResult.confidence}%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Road Obstruction</span>
                    <span className="text-sm font-mono font-extrabold text-red-400">{aiResult.obstructionPercentage}%</span>
                  </div>
                </div>

                {/* Detected Computer Vision Features */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Neural Feature Extractions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiResult.detectedFeatures.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700"
                      >
                        &bull; {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Immediate Action */}
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-1">
                  <div className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Recommended Action:
                  </div>
                  <p className="leading-relaxed">{aiResult.recommendedAction}</p>
                </div>

                {/* Broadcast Action Button */}
                {submittedReportId ? (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-emerald-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <strong>Broadcast Confirmed!</strong> Report #{submittedReportId} broadcast to GIS Map &amp; Admin HQ.
                      </div>
                    </div>
                    <Link
                      href="/map"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs shrink-0"
                    >
                      View on Map
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleBroadcastReport}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white font-extrabold text-sm hover:opacity-95 transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Broadcast Hazard Alert to NE RoadSense Network</span>
                  </button>
                )}
              </div>

              {/* Dynamic Vehicle Accessibility Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white">
                    Vehicle Accessibility Evaluation
                  </h3>
                  <span className="text-xs text-slate-400">Based on {aiResult.obstructionPercentage}% obstruction</span>
                </div>
                <VehicleAccessTable matrix={aiResult.vehicleAccess} />
              </div>
            </div>
          ) : (
            /* Placeholder / Instructions when no analysis yet */
            <div className="h-full min-h-[420px] rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-7 h-7 animate-pulse" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-lg font-bold text-white">AI Vision Scanner Ready</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select a test preset scenario or upload a photo, then click <strong>Execute Neural AI Hazard Classification</strong> to inspect bounding boxes, obstruction meter, and vehicle-specific clearance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
