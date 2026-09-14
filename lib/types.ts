export type VehicleType =
  | 'motorcycle'
  | 'car'
  | 'lcv'
  | 'bus'
  | 'heavy_truck'
  | 'loaded_truck'
  | 'emergency';

export interface VehicleInfo {
  type: VehicleType;
  label: string;
  shortLabel?: string;
  category: string;
  iconName: string;
  weightTonnes: number;
  groundClearanceMm: number;
  description: string;
}

export type HazardType =
  | 'landslide'
  | 'flood'
  | 'rockfall'
  | 'mudslide'
  | 'fallen_tree'
  | 'road_collapse'
  | 'road_damage'
  | 'debris'
  | 'accident';

export type SeverityLevel = 'safe' | 'minor' | 'restricted' | 'critical' | 'predicted_high_risk';

export type PassabilityStatus = 'passable' | 'caution' | 'blocked' | 'emergency_only';

export interface VehicleAccessDetail {
  status: PassabilityStatus;
  canPass: boolean;
  advice: string;
  delayMin: number;
  weightLimitTonnes?: number;
}

export type VehicleAccessibilityMatrix = Record<VehicleType, VehicleAccessDetail>;

export interface RoadSegment {
  id: string;
  name: string;
  highwayCode: string; // e.g. "NH-6", "NH-27", "NH-10"
  state: 'Assam' | 'Meghalaya' | 'Arunachal Pradesh' | 'Sikkim' | 'Nagaland' | 'Manipur' | 'Mizoram' | 'Tripura';
  startCity: string;
  endCity: string;
  startCoords: [number, number];
  endCoords: [number, number];
  polyline: [number, number][]; // Lat, Lng coordinates for path
  elevationMeters: number;
  lengthKm: number;
  currentStatus: SeverityLevel;
  currentHazard?: HazardType;
  obstructionPercentage: number;
  lastReportTime: string;
  reportCount: number;
  verified: boolean;
  officialNotes?: string;
  weatherWarning?: string;
  vehicleAccess: VehicleAccessibilityMatrix;
  alternateSegmentId?: string;
  alternateRouteDescription?: string;
  historicalIncidentRate: number; // 0-100 score
  liveSensorData?: {
    rainfallMmH: number;
    soilMoisturePct: number;
    slopeInstability: 'Stable' | 'Moderate' | 'High' | 'Critical';
    ambientTempC: number;
  };
}

export interface HazardReport {
  id: string;
  timestamp: string;
  segmentId: string;
  segmentName: string;
  highwayCode: string;
  state: string;
  coords: [number, number];
  locationDescription: string;
  hazardType: HazardType;
  description: string;
  imageUrl?: string;
  aiConfidence: number; // 0-100
  severity: SeverityLevel;
  obstructionPercentage: number;
  vehicleAccess: VehicleAccessibilityMatrix;
  recommendedAction: string;
  verified: boolean;
  verifiedBy?: string;
  reportedBy: string; // e.g. "Driver (Freight Express)", "Border Patrol", "Local Commuter"
  clearingTeamDispatched?: boolean;
  boundingBoxes?: {
    label: string;
    confidence: number;
    box: [number, number, number, number]; // x%, y%, width%, height%
  }[];
}

export interface RouteOption {
  id: string;
  title: string;
  via: string;
  distanceKm: number;
  durationMinutes: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  statusForVehicle: PassabilityStatus;
  segmentIds: string[];
  coordinates: [number, number][];
  elevationGainM: number;
  maxInclinePct: number;
  reasoning: string;
  activeHazardsCount: number;
  isRecommended: boolean;
  warnings: string[];
  clearanceNote: string;
}

export interface PredictiveAlert {
  id: string;
  timestamp: string;
  state: string;
  corridor: string;
  segmentId: string;
  coords: [number, number];
  hazardType: HazardType;
  severity: SeverityLevel;
  probabilityPct: number;
  timeframe: string; // e.g. "Next 2-4 hours"
  triggerReason: string; // e.g. "Heavy 65mm/hr IMD rainfall + 92% soil saturation"
  recommendedAction: string;
  affectedVehicles: VehicleType[];
}

export interface DemoStep {
  stepNumber: number;
  title: string;
  description: string;
  actionLabel: string;
  narrative: string;
  highlightPage?: 'home' | 'report' | 'map' | 'planner' | 'risk' | 'admin';
}
