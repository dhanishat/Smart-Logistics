'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Droplets,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  Radio,
  RotateCcw,
  ShieldAlert,
  Thermometer,
  Truck,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { RoadSegment, SeverityLevel } from '@/lib/types';
import { HUB_CITIES, VEHICLE_CATALOG } from '@/lib/neData';
import { useStore } from '@/lib/store';
import VehicleAccessTable from './VehicleAccessTable';

interface RoadSenseMapProps {
  onSegmentClick?: (segment: RoadSegment) => void;
  selectedSegmentId?: string | null;
  heightClass?: string;
  focusSegmentId?: string | null;
}

export default function RoadSenseMap({
  onSegmentClick,
  selectedSegmentId: propSelectedSegmentId,
  heightClass = 'h-[620px]',
  focusSegmentId,
}: RoadSenseMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylinesLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const {
    roadSegments,
    selectedVehicle,
    setSelectedVehicle,
    selectedSegmentId: storeSelectedSegmentId,
    setSelectedSegmentId,
    toggleSegmentBlockage,
  } = useStore();

  const [activeLayer, setActiveLayer] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [selectedSegment, setSelectedSegment] = useState<RoadSegment | null>(null);
  const [filterState, setFilterState] = useState<string>('all');
  const [isSimulatingBlockage, setIsSimulatingBlockage] = useState(false);

  const currentSegmentId = propSelectedSegmentId ?? storeSelectedSegmentId;

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      // Avoid double initialization
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // North East India Center Coordinates
      const map = L.map(mapContainerRef.current, {
        center: [26.0, 92.2],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      const tileLayers: Record<string, any> = {
        dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 18,
        }),
        satellite: L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 18 }
        ),
        street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
        }),
      };

      tileLayers[activeLayer].addTo(map);

      const polylinesGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      polylinesLayerRef.current = polylinesGroup;
      markersLayerRef.current = markersGroup;

      renderLayers(L, map, polylinesGroup, markersGroup);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeLayer]);

  // Update segments and markers when store or vehicle changes
  useEffect(() => {
    if (typeof window === 'undefined' || !mapInstanceRef.current) return;

    async function update() {
      const L = (await import('leaflet')).default;
      if (!polylinesLayerRef.current || !markersLayerRef.current) return;
      renderLayers(L, mapInstanceRef.current, polylinesLayerRef.current, markersLayerRef.current);
    }

    update();
  }, [roadSegments, selectedVehicle, filterState, currentSegmentId]);

  // Render polylines and markers
  const renderLayers = (L: any, map: any, polyGroup: any, markerGroup: any) => {
    polyGroup.clearLayers();
    markerGroup.clearLayers();

    const getStatusColor = (status: SeverityLevel) => {
      switch (status) {
        case 'safe':
          return '#10B981'; // emerald
        case 'minor':
          return '#F59E0B'; // amber
        case 'restricted':
          return '#F97316'; // orange
        case 'critical':
          return '#EF4444'; // crimson
        case 'predicted_high_risk':
          return '#A855F7'; // purple
      }
    };

    // Filter segments
    const filteredSegments = roadSegments.filter(
      (s) => filterState === 'all' || s.state.toLowerCase() === filterState.toLowerCase()
    );

    filteredSegments.forEach((segment) => {
      const color = getStatusColor(segment.currentStatus);
      const isSelected = segment.id === currentSegmentId;
      const vehiclePass = segment.vehicleAccess[selectedVehicle];
      const isVehicleBlocked = !vehiclePass.canPass || vehiclePass.status === 'blocked';

      // Outer glow line
      L.polyline(segment.polyline, {
        color: isVehicleBlocked ? '#EF4444' : color,
        weight: isSelected ? 12 : 8,
        opacity: isSelected ? 0.7 : 0.35,
        lineCap: 'round',
      }).addTo(polyGroup);

      // Core crisp line
      const polyline = L.polyline(segment.polyline, {
        color: isVehicleBlocked ? '#DC2626' : color,
        weight: isSelected ? 6 : 4,
        opacity: 0.95,
        dashArray: segment.currentStatus === 'critical' || isVehicleBlocked ? '8, 8' : undefined,
      }).addTo(polyGroup);

      polyline.on('click', () => {
        setSelectedSegment(segment);
        setSelectedSegmentId(segment.id);
        onSegmentClick?.(segment);
      });

      // Mid-point hazard marker if not safe
      if (segment.currentStatus !== 'safe') {
        const midIdx = Math.floor(segment.polyline.length / 2);
        const midCoord = segment.polyline[midIdx] || segment.startCoords;

        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <span class="absolute w-8 h-8 rounded-full ${
              segment.currentStatus === 'critical'
                ? 'bg-red-500/40 animate-ping'
                : 'bg-amber-500/30 animate-pulse'
            }"></span>
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg border-2 border-white ${
              segment.currentStatus === 'critical'
                ? 'bg-red-600 shadow-red-500/50'
                : 'bg-amber-500 shadow-amber-500/50'
            }">
              ${segment.currentStatus === 'critical' ? '🔴' : '⚠️'}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-hazard-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(midCoord, { icon: customIcon }).addTo(markerGroup);
        marker.on('click', () => {
          setSelectedSegment(segment);
          setSelectedSegmentId(segment.id);
          onSegmentClick?.(segment);
        });
      }
    });

    // Add Hub Cities Markers
    HUB_CITIES.forEach((hub) => {
      const hubHtml = `
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-[11px] font-bold text-slate-200 shadow-md backdrop-blur-sm whitespace-nowrap hover:scale-105 transition-transform cursor-pointer">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>${hub.name}</span>
        </div>
      `;

      const hubIcon = L.divIcon({
        html: hubHtml,
        className: 'hub-city-marker',
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      L.marker(hub.coords, { icon: hubIcon }).addTo(markerGroup);
    });

    // Sync state for inspection drawer if active
    if (currentSegmentId) {
      const current = roadSegments.find((s) => s.id === currentSegmentId);
      if (current) setSelectedSegment(current);
    }
  };

  const handleSimulateToggle = () => {
    if (!selectedSegment) return;
    setIsSimulatingBlockage(true);
    toggleSegmentBlockage(selectedSegment.id);
    setTimeout(() => setIsSimulatingBlockage(false), 300);
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-slate-800 bg-[#090D16] shadow-2xl flex flex-col`}>
      {/* Map Control Header Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[90%]">
        {/* State Filter Dropdown */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All North East Corridors</option>
            <option value="assam" className="bg-slate-900">Assam</option>
            <option value="meghalaya" className="bg-slate-900">Meghalaya</option>
            <option value="arunachal pradesh" className="bg-slate-900">Arunachal Pradesh</option>
            <option value="sikkim" className="bg-slate-900">Sikkim</option>
            <option value="nagaland" className="bg-slate-900">Nagaland</option>
            <option value="manipur" className="bg-slate-900">Manipur</option>
            <option value="mizoram" className="bg-slate-900">Mizoram</option>
            <option value="tripura" className="bg-slate-900">Tripura</option>
          </select>
        </div>

        {/* Layer Selector */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg flex items-center gap-1">
          <button
            onClick={() => setActiveLayer('dark')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeLayer === 'dark' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark Matter
          </button>
          <button
            onClick={() => setActiveLayer('satellite')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeLayer === 'satellite' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Terrain Satellite
          </button>
          <button
            onClick={() => setActiveLayer('street')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeLayer === 'street' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Streets
          </button>
        </div>

        {/* Legend Ribbon */}
        <div className="hidden xl:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-slate-300">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 🟢 Safe</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 🟡 Minor (1-lane)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 🟠 Restricted</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span> 🔴 Blocked</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> ⚠️ High Risk</span>
        </div>
      </div>

      {/* Leaflet Map Target DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Segment Side Inspection Drawer (When a road segment is clicked) */}
      {selectedSegment && (
        <div className="absolute top-4 right-4 bottom-4 w-96 max-w-[92%] z-30 bg-[#0F172A]/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-6 duration-300">
          {/* Header */}
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                  {selectedSegment.highwayCode}
                </span>
                <span className="text-xs text-slate-400 font-medium">{selectedSegment.state}</span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{selectedSegment.name}</h3>
            </div>
            <button
              onClick={() => {
                setSelectedSegment(null);
                setSelectedSegmentId(null);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Status & Obstruction Meter */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Status:</span>
                <span
                  className={`font-bold uppercase px-2 py-0.5 rounded-full text-[11px] ${
                    selectedSegment.currentStatus === 'critical'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : selectedSegment.currentStatus === 'restricted'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : selectedSegment.currentStatus === 'minor'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {selectedSegment.currentStatus}
                </span>
              </div>

              {selectedSegment.currentHazard && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Active Hazard:</span>
                  <span className="font-bold text-white capitalize">{selectedSegment.currentHazard.replace('_', ' ')}</span>
                </div>
              )}

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Road Obstruction:</span>
                  <span className="font-mono font-bold text-white">{selectedSegment.obstructionPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedSegment.obstructionPercentage >= 70
                        ? 'bg-red-500'
                        : selectedSegment.obstructionPercentage >= 40
                        ? 'bg-orange-500'
                        : selectedSegment.obstructionPercentage > 0
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedSegment.obstructionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Live Sensor Telemetry */}
            {selectedSegment.liveSensorData && (
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  Live Mountain Sensor Telemetry
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Rainfall</div>
                      <div className="font-bold text-white">{selectedSegment.liveSensorData.rainfallMmH} mm/hr</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Soil Moisture</div>
                      <div className="font-bold text-white">{selectedSegment.liveSensorData.soilMoisturePct}%</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400">Slope Instability:</span>
                  <span
                    className={`font-bold ${
                      selectedSegment.liveSensorData.slopeInstability === 'Critical'
                        ? 'text-red-400'
                        : selectedSegment.liveSensorData.slopeInstability === 'High'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedSegment.liveSensorData.slopeInstability}
                  </span>
                </div>
              </div>
            )}

            {/* Official Advisory & Notes */}
            {selectedSegment.officialNotes && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 leading-relaxed">
                <strong className="block text-amber-300 text-[11px] mb-1">Official Advisory:</strong>
                {selectedSegment.officialNotes}
              </div>
            )}

            {/* Vehicle Accessibility Matrix for Segment */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center justify-between">
                <span>Vehicle Passability</span>
                <span className="text-[10px] text-slate-400 font-normal">7 vehicle classes</span>
              </h4>
              <VehicleAccessTable matrix={selectedSegment.vehicleAccess} compact />
            </div>

            {/* Recommended Alternate Route */}
            {selectedSegment.alternateRouteDescription && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200/90 space-y-1">
                <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  Recommended Safe Bypass
                </div>
                <p className="text-xs leading-relaxed">{selectedSegment.alternateRouteDescription}</p>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={handleSimulateToggle}
              disabled={isSimulatingBlockage}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                selectedSegment.currentStatus === 'critical'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {selectedSegment.currentStatus === 'critical'
                  ? 'Clear & Reopen Corridor'
                  : 'Simulate 92% Landslide Blockage'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
