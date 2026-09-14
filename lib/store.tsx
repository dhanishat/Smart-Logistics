'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  HazardReport,
  HazardType,
  PredictiveAlert,
  RoadSegment,
  SeverityLevel,
  VehicleType,
} from './types';
import {
  INITIAL_HAZARD_REPORTS,
  INITIAL_PREDICTIVE_ALERTS,
  INITIAL_ROAD_SEGMENTS,
} from './neData';
import { evaluateVehicleAccessibility, simulateAIImageAnalysis } from './aiEngine';
import { playAlertSound, playSuccessSound, playEmergencySound } from '@/components/AudioAlerts';

interface StoreContextType {
  roadSegments: RoadSegment[];
  hazardReports: HazardReport[];
  predictiveAlerts: PredictiveAlert[];
  selectedVehicle: VehicleType;
  setSelectedVehicle: (v: VehicleType) => void;
  selectedSegmentId: string | null;
  setSelectedSegmentId: (id: string | null) => void;
  activeDemoStep: number;
  setActiveDemoStep: (step: number) => void;
  isAudioEnabled: boolean;
  setIsAudioEnabled: (enabled: boolean) => void;
  submitHazardReport: (
    report: Omit<HazardReport, 'id' | 'timestamp' | 'aiConfidence' | 'severity' | 'obstructionPercentage' | 'vehicleAccess' | 'recommendedAction' | 'verified'> & {
      customConfidence?: number;
      customObstruction?: number;
    }
  ) => HazardReport;
  verifyHazardReport: (id: string, officialNotes?: string) => void;
  resolveHazardReport: (id: string) => void;
  dispatchClearingTeam: (segmentId: string) => void;
  toggleSegmentBlockage: (segmentId: string) => void;
  runDemoStep: (step: number) => void;
  resetAllData: () => void;
  stats: {
    activeAlerts: number;
    roadsMonitored: number;
    reportsToday: number;
    criticalBlockages: number;
    clearingTeamsActive: number;
  };
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'ne_roadsense_data_v2';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>(INITIAL_ROAD_SEGMENTS);
  const [hazardReports, setHazardReports] = useState<HazardReport[]>(INITIAL_HAZARD_REPORTS);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>(INITIAL_PREDICTIVE_ALERTS);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('heavy_truck');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [activeDemoStep, setActiveDemoStep] = useState<number>(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.roadSegments) setRoadSegments(parsed.roadSegments);
        if (parsed.hazardReports) setHazardReports(parsed.hazardReports);
        if (parsed.predictiveAlerts) setPredictiveAlerts(parsed.predictiveAlerts);
        if (parsed.selectedVehicle) setSelectedVehicle(parsed.selectedVehicle);
      }
    } catch (e) {
      console.warn('Failed to load storage', e);
    }
  }, []);

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          roadSegments,
          hazardReports,
          predictiveAlerts,
          selectedVehicle,
        })
      );
    } catch (e) {
      console.warn('Failed to save storage', e);
    }
  }, [roadSegments, hazardReports, predictiveAlerts, selectedVehicle]);

  const submitHazardReport = (
    reportInput: Omit<
      HazardReport,
      'id' | 'timestamp' | 'aiConfidence' | 'severity' | 'obstructionPercentage' | 'vehicleAccess' | 'recommendedAction' | 'verified'
    > & { customConfidence?: number; customObstruction?: number }
  ): HazardReport => {
    const aiAnalysis = simulateAIImageAnalysis(
      reportInput.hazardType,
      reportInput.description,
      reportInput.segmentName
    );

    const confidence = reportInput.customConfidence ?? aiAnalysis.confidence;
    const obstruction = reportInput.customObstruction ?? aiAnalysis.obstructionPercentage;

    let severity: SeverityLevel = 'minor';
    if (obstruction >= 70) severity = 'critical';
    else if (obstruction >= 40) severity = 'restricted';
    else if (reportInput.hazardType === 'rockfall') severity = 'predicted_high_risk';

    const vehicleAccess = evaluateVehicleAccessibility(reportInput.hazardType, obstruction, severity);

    const newReport: HazardReport = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      segmentId: reportInput.segmentId,
      segmentName: reportInput.segmentName,
      highwayCode: reportInput.highwayCode,
      state: reportInput.state,
      coords: reportInput.coords,
      locationDescription: reportInput.locationDescription,
      hazardType: reportInput.hazardType,
      description: reportInput.description,
      imageUrl: reportInput.imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
      aiConfidence: confidence,
      severity,
      obstructionPercentage: obstruction,
      vehicleAccess,
      recommendedAction: aiAnalysis.recommendedAction,
      verified: false,
      reportedBy: reportInput.reportedBy || 'Commercial Freight Driver',
      clearingTeamDispatched: false,
      boundingBoxes: aiAnalysis.boundingBoxes,
    };

    setHazardReports((prev) => [newReport, ...prev]);

    // Update the corresponding road segment
    setRoadSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === reportInput.segmentId) {
          return {
            ...seg,
            currentStatus: severity,
            currentHazard: reportInput.hazardType,
            obstructionPercentage: obstruction,
            lastReportTime: 'Just now',
            reportCount: seg.reportCount + 1,
            vehicleAccess,
            officialNotes: `Latest driver report: ${reportInput.hazardType.toUpperCase()} (${obstruction}% blocked). Awaiting authority confirmation.`,
          };
        }
        return seg;
      })
    );

    if (isAudioEnabled) {
      if (severity === 'critical') playEmergencySound();
      else playAlertSound();
    }

    return newReport;
  };

  const verifyHazardReport = (id: string, officialNotes?: string) => {
    setHazardReports((prev) =>
      prev.map((rep) => {
        if (rep.id === id) {
          return {
            ...rep,
            verified: true,
            verifiedBy: 'Border Roads Organisation (Control HQ)',
          };
        }
        return rep;
      })
    );

    // Update segment verified flag
    const report = hazardReports.find((r) => r.id === id);
    if (report) {
      setRoadSegments((prev) =>
        prev.map((seg) => {
          if (seg.id === report.segmentId) {
            return {
              ...seg,
              verified: true,
              officialNotes: officialNotes || seg.officialNotes || 'Verified by District Administration / BRO.',
            };
          }
          return seg;
        })
      );
    }

    if (isAudioEnabled) playSuccessSound();
  };

  const resolveHazardReport = (id: string) => {
    const report = hazardReports.find((r) => r.id === id);
    if (!report) return;

    setHazardReports((prev) => prev.filter((r) => r.id !== id));

    // Reset the segment back to safe
    setRoadSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === report.segmentId) {
          return {
            ...seg,
            currentStatus: 'safe',
            currentHazard: undefined,
            obstructionPercentage: 0,
            lastReportTime: 'Cleared just now',
            verified: true,
            officialNotes: 'Road cleared and opened for all regular commercial traffic.',
            vehicleAccess: {
              motorcycle: { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 0 },
              car: { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 0 },
              lcv: { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 0 },
              bus: { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 0 },
              heavy_truck: { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 0 },
              loaded_truck: { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 0 },
              emergency: { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 0 },
            },
          };
        }
        return seg;
      })
    );

    if (isAudioEnabled) playSuccessSound();
  };

  const dispatchClearingTeam = (segmentId: string) => {
    setRoadSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === segmentId) {
          return {
            ...seg,
            officialNotes: 'BRO 765 BRTF Heavy Earthmovers & PWD Rescue Bulldozers on site clearing debris.',
          };
        }
        return seg;
      })
    );

    setHazardReports((prev) =>
      prev.map((rep) => {
        if (rep.segmentId === segmentId) {
          return { ...rep, clearingTeamDispatched: true };
        }
        return rep;
      })
    );

    if (isAudioEnabled) playSuccessSound();
  };

  const toggleSegmentBlockage = (segmentId: string) => {
    setRoadSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === segmentId) {
          const isCurrentlyBlocked = seg.currentStatus === 'critical';
          const newStatus: SeverityLevel = isCurrentlyBlocked ? 'safe' : 'critical';
          const newObs = isCurrentlyBlocked ? 0 : 92;
          const newHazard: HazardType | undefined = isCurrentlyBlocked ? undefined : 'landslide';
          const vehicleAccess = evaluateVehicleAccessibility(newHazard || 'landslide', newObs, newStatus);

          return {
            ...seg,
            currentStatus: newStatus,
            currentHazard: newHazard,
            obstructionPercentage: newObs,
            lastReportTime: 'Just updated',
            vehicleAccess,
            officialNotes: isCurrentlyBlocked
              ? 'Road reopened by administrative order.'
              : 'Emergency simulation: Road blocked by simulated 92% landslide.',
          };
        }
        return seg;
      })
    );
    if (isAudioEnabled) playAlertSound();
  };

  const resetAllData = () => {
    setRoadSegments(INITIAL_ROAD_SEGMENTS);
    setHazardReports(INITIAL_HAZARD_REPORTS);
    setPredictiveAlerts(INITIAL_PREDICTIVE_ALERTS);
    setSelectedVehicle('heavy_truck');
    setActiveDemoStep(0);
    localStorage.removeItem(STORAGE_KEY);
    if (isAudioEnabled) playSuccessSound();
  };

  const runDemoStep = (step: number) => {
    setActiveDemoStep(step);
    if (step === 1) {
      // Step 1: Initial state - Heavy Truck route planned from Guwahati to Silchar
      setSelectedVehicle('heavy_truck');
      if (isAudioEnabled) playAlertSound();
    } else if (step === 2) {
      // Step 2: Driver uploads Landslide photo mid-route
      if (isAudioEnabled) playAlertSound();
    } else if (step === 3) {
      // Step 3: AI classification triggers
      if (isAudioEnabled) playEmergencySound();
    } else if (step === 4) {
      // Step 4: Map segment updates to 🔴 Blocked
      setRoadSegments((prev) =>
        prev.map((seg) => {
          if (seg.id === 'seg-nh6-sonapur') {
            const vehicleAccess = evaluateVehicleAccessibility('landslide', 94, 'critical');
            return {
              ...seg,
              currentStatus: 'critical',
              currentHazard: 'landslide',
              obstructionPercentage: 94,
              lastReportTime: 'Just now (Demo)',
              reportCount: seg.reportCount + 1,
              vehicleAccess,
            };
          }
          return seg;
        })
      );
      if (isAudioEnabled) playEmergencySound();
    } else if (step === 5) {
      // Step 5: Route planner dynamically reroutes
      if (isAudioEnabled) playSuccessSound();
    } else if (step === 6) {
      // Step 6: Admin Dashboard verifies & dispatches
      dispatchClearingTeam('seg-nh6-sonapur');
      verifyHazardReport('rep-101', 'BRO Taskforce 765 on-site. Western bypass officially authorized for freight.');
      if (isAudioEnabled) playSuccessSound();
    }
  };

  const activeAlertsCount = roadSegments.filter((s) => s.currentStatus !== 'safe').length;
  const criticalCount = roadSegments.filter((s) => s.currentStatus === 'critical').length;
  const clearingTeamsCount = hazardReports.filter((r) => r.clearingTeamDispatched).length;

  return (
    <StoreContext.Provider
      value={{
        roadSegments,
        hazardReports,
        predictiveAlerts,
        selectedVehicle,
        setSelectedVehicle,
        selectedSegmentId,
        setSelectedSegmentId,
        activeDemoStep,
        setActiveDemoStep,
        isAudioEnabled,
        setIsAudioEnabled,
        submitHazardReport,
        verifyHazardReport,
        resolveHazardReport,
        dispatchClearingTeam,
        toggleSegmentBlockage,
        runDemoStep,
        resetAllData,
        stats: {
          activeAlerts: activeAlertsCount,
          roadsMonitored: roadSegments.length,
          reportsToday: hazardReports.length,
          criticalBlockages: criticalCount,
          clearingTeamsActive: clearingTeamsCount,
        },
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
