import {
  HazardReport,
  HazardType,
  PassabilityStatus,
  RoadSegment,
  RouteOption,
  SeverityLevel,
  VehicleAccessibilityMatrix,
  VehicleType,
} from './types';
import { INITIAL_ROAD_SEGMENTS, VEHICLE_CATALOG } from './neData';

export interface AIClassificationResult {
  hazardType: HazardType;
  confidence: number;
  severity: SeverityLevel;
  obstructionPercentage: number;
  detectedFeatures: string[];
  boundingBoxes: {
    label: string;
    confidence: number;
    box: [number, number, number, number]; // [x%, y%, w%, h%]
  }[];
  vehicleAccess: VehicleAccessibilityMatrix;
  recommendedAction: string;
}

export function evaluateVehicleAccessibility(
  hazardType: HazardType,
  obstructionPct: number,
  severity: SeverityLevel,
  elevationM: number = 1000
): VehicleAccessibilityMatrix {
  const isSevere = severity === 'critical' || obstructionPct >= 70;
  const isModerate = severity === 'restricted' || (obstructionPct >= 40 && obstructionPct < 70);
  const isMinor = severity === 'minor' || obstructionPct < 40;
  const isHighAltitude = elevationM > 2500;

  const matrix: VehicleAccessibilityMatrix = {
    motorcycle: {
      status: 'passable',
      canPass: true,
      advice: 'Road shoulder passable with care.',
      delayMin: 5,
    },
    car: {
      status: 'passable',
      canPass: true,
      advice: 'Passable under standard caution.',
      delayMin: 10,
    },
    lcv: {
      status: 'passable',
      canPass: true,
      advice: 'Passable with minor speed reduction.',
      delayMin: 15,
    },
    bus: {
      status: 'passable',
      canPass: true,
      advice: 'Passable with caution.',
      delayMin: 20,
    },
    heavy_truck: {
      status: 'passable',
      canPass: true,
      advice: 'Standard transit clear.',
      delayMin: 25,
    },
    loaded_truck: {
      status: 'passable',
      canPass: true,
      advice: 'Standard transit clear.',
      delayMin: 30,
    },
    emergency: {
      status: 'passable',
      canPass: true,
      advice: 'Priority emergency corridor active.',
      delayMin: 0,
    },
  };

  if (hazardType === 'landslide' || hazardType === 'mudslide' || hazardType === 'road_collapse') {
    if (isSevere) {
      matrix.motorcycle = {
        status: 'caution',
        canPass: true,
        advice: 'Passable on outer 0.8m shoulder with manual walk assist.',
        delayMin: 30,
      };
      matrix.car = {
        status: 'blocked',
        canPass: false,
        advice: 'Debris depth & boulder height exceed underbody chassis clearance.',
        delayMin: 240,
      };
      matrix.lcv = {
        status: 'blocked',
        canPass: false,
        advice: 'Mud slurry depth causes wheel stall; turnaround advised.',
        delayMin: 240,
      };
      matrix.bus = {
        status: 'blocked',
        canPass: false,
        advice: 'Narrow path (< 2.2m) cannot accommodate passenger coach.',
        delayMin: 360,
      };
      matrix.heavy_truck = {
        status: 'blocked',
        canPass: false,
        advice: 'Axle load > 10T risks collapsing sheared road bank. Strict stop.',
        delayMin: 480,
      };
      matrix.loaded_truck = {
        status: 'blocked',
        canPass: false,
        advice: '42T freight cannot cross. Compulsory rerouting via designated bypass.',
        delayMin: 600,
      };
      matrix.emergency = {
        status: 'caution',
        canPass: true,
        advice: 'Winch-assisted high clearance 4WD pilot vehicle active under BRO control.',
        delayMin: 20,
      };
    } else if (isModerate) {
      matrix.motorcycle = { status: 'passable', canPass: true, advice: 'Clear on left lane.', delayMin: 10 };
      matrix.car = { status: 'caution', canPass: true, advice: 'Proceed slowly in 2nd gear over graded gravel.', delayMin: 25 };
      matrix.lcv = { status: 'caution', canPass: true, advice: 'Drive on high track; watch for loose shale.', delayMin: 35 };
      matrix.bus = { status: 'caution', canPass: true, advice: 'One-way shuttle controlled by traffic marshals.', delayMin: 50 };
      matrix.heavy_truck = { status: 'blocked', canPass: false, advice: 'Single lane weight restriction capped at 15T.', delayMin: 180 };
      matrix.loaded_truck = { status: 'blocked', canPass: false, advice: 'Heavy freight paused until full dual-lane clearance.', delayMin: 240 };
      matrix.emergency = { status: 'passable', canPass: true, advice: 'Escorted priority lane open.', delayMin: 5 };
    } else {
      matrix.motorcycle = { status: 'passable', canPass: true, advice: 'Clear. Avoid wet road edges.', delayMin: 5 };
      matrix.car = { status: 'passable', canPass: true, advice: 'Clear. Slow down at flagged points.', delayMin: 10 };
      matrix.lcv = { status: 'passable', canPass: true, advice: 'Clear corridor.', delayMin: 10 };
      matrix.bus = { status: 'passable', canPass: true, advice: 'Clear corridor.', delayMin: 15 };
      matrix.heavy_truck = { status: 'caution', canPass: true, advice: 'Watch for soft shoulders.', delayMin: 25 };
      matrix.loaded_truck = { status: 'caution', canPass: true, advice: 'Maintain safe stopping distance.', delayMin: 30 };
      matrix.emergency = { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 0 };
    }
  } else if (hazardType === 'flood') {
    if (isSevere || obstructionPct >= 60) {
      matrix.motorcycle = { status: 'blocked', canPass: false, advice: 'Water level > 300mm will submerge exhaust/carburetor.', delayMin: 180 };
      matrix.car = { status: 'blocked', canPass: false, advice: 'Hydroplaning & engine water ingestion risk.', delayMin: 180 };
      matrix.lcv = { status: 'caution', canPass: true, advice: 'High intake clearance permits crossing in low gear.', delayMin: 40 };
      matrix.bus = { status: 'caution', canPass: true, advice: 'Pilot convoy crossing only. Max water depth 450mm.', delayMin: 45 };
      matrix.heavy_truck = { status: 'passable', canPass: true, advice: 'High ground clearance allows safe wading.', delayMin: 20 };
      matrix.loaded_truck = { status: 'passable', canPass: true, advice: 'High chassis safe; adhere to 20 km/h speed limit.', delayMin: 25 };
      matrix.emergency = { status: 'passable', canPass: true, advice: '4WD snorkel ambulances cleared.', delayMin: 0 };
    } else {
      matrix.motorcycle = { status: 'caution', canPass: true, advice: 'Shallow water (100mm). Ride in center crown.', delayMin: 15 };
      matrix.car = { status: 'passable', canPass: true, advice: 'Slow steady speed to avoid bow wave.', delayMin: 15 };
      matrix.lcv = { status: 'passable', canPass: true, advice: 'Passable.', delayMin: 10 };
      matrix.bus = { status: 'passable', canPass: true, advice: 'Passable.', delayMin: 15 };
      matrix.heavy_truck = { status: 'passable', canPass: true, advice: 'Passable.', delayMin: 10 };
      matrix.loaded_truck = { status: 'passable', canPass: true, advice: 'Passable.', delayMin: 10 };
      matrix.emergency = { status: 'passable', canPass: true, advice: 'Passable.', delayMin: 0 };
    }
  } else if (hazardType === 'rockfall' || hazardType === 'road_damage' || hazardType === 'debris') {
    if (isHighAltitude) {
      matrix.motorcycle = { status: 'blocked', canPass: false, advice: 'Black ice and loose stone shards. Severe slip hazard.', delayMin: 120 };
      matrix.car = { status: 'caution', canPass: true, advice: '4WD required with M+S winter tires or chains.', delayMin: 40 };
      matrix.lcv = { status: 'caution', canPass: true, advice: 'Drive carefully; high-traction mode enabled.', delayMin: 45 };
      matrix.bus = { status: 'caution', canPass: true, advice: 'Escorted convoy only.', delayMin: 60 };
      matrix.heavy_truck = { status: 'caution', canPass: true, advice: 'Chain drives on drive wheels mandatory.', delayMin: 90 };
      matrix.loaded_truck = { status: 'blocked', canPass: false, advice: 'High gradient + black ice causes jackknife risk.', delayMin: 240 };
      matrix.emergency = { status: 'passable', canPass: true, advice: 'Studded tire medical convoy clear.', delayMin: 10 };
    } else {
      matrix.motorcycle = { status: 'passable', canPass: true, advice: 'Zig-zag around debris with caution.', delayMin: 10 };
      matrix.car = { status: 'caution', canPass: true, advice: 'Straddle rocks; avoid sharp flint edges.', delayMin: 15 };
      matrix.lcv = { status: 'passable', canPass: true, advice: 'Slow transit.', delayMin: 15 };
      matrix.bus = { status: 'passable', canPass: true, advice: 'Clear outer wheel track.', delayMin: 20 };
      matrix.heavy_truck = { status: 'passable', canPass: true, advice: 'Heavy tires can roll over light debris.', delayMin: 15 };
      matrix.loaded_truck = { status: 'passable', canPass: true, advice: 'Passable.', delayMin: 15 };
      matrix.emergency = { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 0 };
    }
  } else if (hazardType === 'fallen_tree' || hazardType === 'accident') {
    if (obstructionPct >= 70) {
      matrix.motorcycle = { status: 'caution', canPass: true, advice: 'Passable beneath overhang / on sidewalk edge.', delayMin: 15 };
      matrix.car = { status: 'blocked', canPass: false, advice: 'Tree branches block lane width. PWD chainsaw team en route.', delayMin: 90 };
      matrix.lcv = { status: 'blocked', canPass: false, advice: 'Awaiting branch clearance.', delayMin: 90 };
      matrix.bus = { status: 'blocked', canPass: false, advice: 'Total obstruction for wide vehicles.', delayMin: 120 };
      matrix.heavy_truck = { status: 'blocked', canPass: false, advice: 'Overhead clearance < 2.5m.', delayMin: 120 };
      matrix.loaded_truck = { status: 'blocked', canPass: false, advice: 'Overhead clearance < 2.5m.', delayMin: 120 };
      matrix.emergency = { status: 'caution', canPass: true, advice: 'Quick winch branch pull active.', delayMin: 15 };
    } else {
      matrix.motorcycle = { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 5 };
      matrix.car = { status: 'passable', canPass: true, advice: 'Slow down around recovery vehicles.', delayMin: 15 };
      matrix.lcv = { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 15 };
      matrix.bus = { status: 'caution', canPass: true, advice: 'Careful maneuvering around single open lane.', delayMin: 25 };
      matrix.heavy_truck = { status: 'caution', canPass: true, advice: 'Slow passage through narrowed pinch-point.', delayMin: 30 };
      matrix.loaded_truck = { status: 'caution', canPass: true, advice: 'Slow passage.', delayMin: 35 };
      matrix.emergency = { status: 'passable', canPass: true, advice: 'Clear.', delayMin: 0 };
    }
  }

  return matrix;
}

export function simulateAIImageAnalysis(
  hazardType: HazardType,
  description: string = '',
  segmentName: string = ''
): AIClassificationResult {
  // Confidence 88-98%
  const confidenceMap: Record<HazardType, number> = {
    landslide: 95,
    mudslide: 96,
    flood: 92,
    rockfall: 89,
    road_collapse: 93,
    fallen_tree: 97,
    road_damage: 87,
    debris: 90,
    accident: 94,
  };

  const obstructionMap: Record<HazardType, number> = {
    landslide: 92,
    mudslide: 85,
    flood: 45,
    rockfall: 40,
    road_collapse: 85,
    fallen_tree: 65,
    road_damage: 25,
    debris: 35,
    accident: 60,
  };

  const confidence = confidenceMap[hazardType] || 91;
  const obstructionPercentage = obstructionMap[hazardType] || 50;

  let severity: SeverityLevel = 'minor';
  if (obstructionPercentage >= 70) severity = 'critical';
  else if (obstructionPercentage >= 40) severity = 'restricted';
  else if (hazardType === 'rockfall' && segmentName.includes('Sela')) severity = 'predicted_high_risk';

  const boundingBoxesMap: Record<HazardType, { label: string; confidence: number; box: [number, number, number, number] }[]> = {
    landslide: [
      { label: 'Mud & Silt Inundation', confidence: 96, box: [12, 35, 76, 52] },
      { label: 'Unstable Boulder (450mm)', confidence: 93, box: [40, 58, 25, 30] },
      { label: 'Fractured Hill Crest', confidence: 91, box: [20, 10, 60, 28] },
    ],
    mudslide: [
      { label: 'Viscous Mud Slurry Depth (400mm)', confidence: 97, box: [15, 40, 70, 48] },
      { label: 'Soil Slippage Boundary', confidence: 94, box: [30, 20, 45, 25] },
    ],
    flood: [
      { label: 'Submerged Highway Surface (180mm depth)', confidence: 94, box: [8, 45, 84, 45] },
      { label: 'Flood Surge Flow Velocity (1.8 m/s)', confidence: 90, box: [35, 52, 32, 28] },
    ],
    rockfall: [
      { label: 'Fallen Granite Boulders', confidence: 92, box: [38, 55, 30, 32] },
      { label: 'Black Ice Pavement Slick', confidence: 89, box: [10, 42, 80, 48] },
    ],
    road_collapse: [
      { label: 'Sheared Embankment Toe (40m breach)', confidence: 95, box: [20, 45, 60, 50] },
      { label: 'Cracked Subgrade Void', confidence: 92, box: [45, 35, 35, 25] },
    ],
    fallen_tree: [
      { label: 'Uprooted Pine Trunk (35ft)', confidence: 98, box: [18, 42, 65, 35] },
      { label: 'Overhanging Foliage Canopy', confidence: 94, box: [25, 20, 50, 26] },
    ],
    road_damage: [
      { label: 'Pothole Void Cluster (>150mm)', confidence: 89, box: [30, 50, 40, 30] },
    ],
    debris: [
      { label: 'Construction Gravel Spill', confidence: 91, box: [25, 45, 50, 35] },
    ],
    accident: [
      { label: 'Commercial Vehicle Collision Zone', confidence: 96, box: [28, 38, 46, 42] },
    ],
  };

  const detectedFeaturesMap: Record<HazardType, string[]> = {
    landslide: ['Slope Shear Surface Detected', 'Boulder Obstacles > 400mm', 'Asphalt Subgrade Covered', 'Continuous Silt Inflow'],
    mudslide: ['High Liquidity Mud Mass', 'Loss of Tire Adhesion', 'Drainage Culvert Overflow'],
    flood: ['Standing Water Depth > 180mm', 'Inundated Lane Edges', 'Turbid Brahmaputra Floodwater'],
    rockfall: ['Scattered Sharp Fractures', 'Pavement Gouges', 'Active Scree Slope Above'],
    road_collapse: ['Structural Asphalt Subsidence', 'Complete Loss of Embankment Support', 'River Scour Cavitation'],
    fallen_tree: ['Trunk Span 10.5m', 'Power Line Proximity Caution', 'Single Lane Usable Under Shoulder'],
    road_damage: ['Severe Rutting & Potholes', 'Roughness Index High', 'Reduced Safe Speed (20 km/h)'],
    debris: ['Loose Quarry Stones', 'Slick Silt Layer', 'Passable in Center Track'],
    accident: ['Stationary Obstruction', 'Debris Field', 'Emergency Responders on Scene'],
  };

  const actionRecommendations: Record<HazardType, string> = {
    landslide: 'Trigger immediate multi-axle freight diversion. Dispatch BRO heavy excavators to clear bypass track.',
    mudslide: 'Deploy road grader and sand dispersal. Caution drivers regarding slippery mud film.',
    flood: 'Enforce speed cap (40 km/h) on wildlife corridors. High-clearance vehicles clear to proceed.',
    rockfall: 'Deploy anti-skid salt and rock netting inspection teams. Heavy trucks hold until daylight clearance.',
    road_collapse: 'Total shutdown for commercial heavy vehicles (>10T). Route traffic through reinforced alternate bypass.',
    fallen_tree: 'PWD chainsaw rapid unit clearing branches. Light vehicles proceed on monitored single lane.',
    road_damage: 'Patching team scheduled. Drivers maintain low speed to prevent tire sidewall damage.',
    debris: 'Street sweeping and gravel recovery crew active. Passable with care.',
    accident: 'Clearance crane en route. Traffic routed through single lane.',
  };

  const vehicleAccess = evaluateVehicleAccessibility(hazardType, obstructionPercentage, severity);

  return {
    hazardType,
    confidence,
    severity,
    obstructionPercentage,
    detectedFeatures: detectedFeaturesMap[hazardType] || ['Anomalous road condition detected'],
    boundingBoxes: boundingBoxesMap[hazardType] || [],
    vehicleAccess,
    recommendedAction: actionRecommendations[hazardType] || 'Proceed with heightened awareness.',
  };
}

export function computeDynamicRoutes(
  sourceCityId: string,
  destCityId: string,
  vehicleType: VehicleType,
  activeSegments: RoadSegment[]
): RouteOption[] {
  // Let's build realistic North East India multi-route comparisons:
  const segmentMap = new Map(activeSegments.map((s) => [s.id, s]));

  // Default / primary calculation for Guwahati -> Silchar / Tripura
  if (
    (sourceCityId === 'guwahati' && destCityId === 'silchar') ||
    (sourceCityId === 'silchar' && destCityId === 'guwahati') ||
    (sourceCityId === 'guwahati' && destCityId === 'agartala') ||
    (sourceCityId === 'guwahati' && destCityId === 'aizawl')
  ) {
    const sonapurSeg = segmentMap.get('seg-nh6-sonapur') || INITIAL_ROAD_SEGMENTS[0];
    const jorabatSeg = segmentMap.get('seg-nh6-jorabat-shillong') || INITIAL_ROAD_SEGMENTS[1];
    const dudhnoiSeg = segmentMap.get('seg-nh6-alternate-dudhnoi') || INITIAL_ROAD_SEGMENTS[7];

    const sonapurAccess = sonapurSeg.vehicleAccess[vehicleType];
    const isSonapurBlocked = !sonapurAccess.canPass || sonapurAccess.status === 'blocked';

    const routeA: RouteOption = {
      id: 'route-nh6-direct',
      title: 'Route A: Direct NH-6 Mountain Corridor',
      via: 'via Jorabat - Shillong - Jowai - Sonapur Tunnel',
      distanceKm: 310,
      durationMinutes: isSonapurBlocked ? 780 : 380, // Massive delay if blocked
      riskLevel: sonapurSeg.currentStatus === 'critical' ? 'Critical' : 'High',
      statusForVehicle: sonapurAccess.status,
      segmentIds: ['seg-nh6-jorabat-shillong', 'seg-nh6-sonapur'],
      coordinates: [
        [26.144, 91.736],
        [26.115, 91.874],
        [25.578, 91.893],
        [25.452, 92.203],
        [25.109, 92.368],
        [24.833, 92.778],
      ],
      elevationGainM: 1450,
      maxInclinePct: 12,
      reasoning: isSonapurBlocked
        ? `BLOCKED for ${VEHICLE_CATALOG.find((v) => v.type === vehicleType)?.label}: Major landslide active at Sonapur Tunnel (${sonapurSeg.obstructionPercentage}% obstruction). Road bank unstable for your vehicle weight/chassis.`
        : `Primary 2-lane highway. Watch for rain and slow climbing vehicles on Shillong plateau.`,
      activeHazardsCount: (sonapurSeg.currentStatus !== 'safe' ? 1 : 0) + (jorabatSeg.currentStatus !== 'safe' ? 1 : 0),
      isRecommended: !isSonapurBlocked,
      warnings: [
        `Sonapur Tunnel Status: ${sonapurSeg.currentStatus.toUpperCase()}`,
        `Obstruction: ${sonapurSeg.obstructionPercentage}%`,
        sonapurAccess.advice,
      ],
      clearanceNote: sonapurAccess.advice,
    };

    const dudhnoiAccess = dudhnoiSeg.vehicleAccess[vehicleType];
    const routeB: RouteOption = {
      id: 'route-nh17-bypass',
      title: 'Route B: Western Meghalaya & Plains Bypass (NH-17 / NH-217)',
      via: 'via Guwahati - Dudhnoi - Tura - Dalu - Baghmara - Silchar',
      distanceKm: 365,
      durationMinutes: 440,
      riskLevel: 'Low',
      statusForVehicle: dudhnoiAccess.status,
      segmentIds: ['seg-nh6-alternate-dudhnoi'],
      coordinates: [
        [26.144, 91.736],
        [26.012, 90.985],
        [25.824, 90.652],
        [25.512, 90.221],
        [25.215, 90.218],
        [24.833, 92.778],
      ],
      elevationGainM: 420,
      maxInclinePct: 5,
      reasoning: isSonapurBlocked
        ? `RECOMMENDED SAFEST ALTERNATIVE: 100% stable low-elevation plains corridor. Reinforced bridges support 42T freight. Avoids Sonapur bottleneck completely.`
        : `Alternate bypass. Longer by 55 km, but offers flatter terrain and zero mountain landslide exposure.`,
      activeHazardsCount: 0,
      isRecommended: isSonapurBlocked, // Dynamically becomes recommended if Route A is blocked!
      warnings: ['Longer route by +55 km', 'All bridges cleared for heavy freight'],
      clearanceNote: 'Unrestricted transit for all vehicle classes.',
    };

    const routeC: RouteOption = {
      id: 'route-dima-hasao',
      title: 'Route C: Dima Hasao Express Highway (NH-27 to NH-54)',
      via: 'via Nagaon - Daboka - Lumding - Haflong - Silchar',
      distanceKm: 335,
      durationMinutes: 410,
      riskLevel: 'Moderate',
      statusForVehicle: 'caution',
      segmentIds: ['seg-nh27-kaziranga'],
      coordinates: [
        [26.144, 91.736],
        [26.345, 92.684],
        [25.753, 93.184],
        [25.176, 93.018],
        [24.833, 92.778],
      ],
      elevationGainM: 820,
      maxInclinePct: 8,
      reasoning: 'Haflong ghat section undergoing routine road surfacing. Single-lane slow moving convoy active.',
      activeHazardsCount: 1,
      isRecommended: false,
      warnings: ['Haflong ghat single lane operation', 'Expected delay +30 mins'],
      clearanceNote: 'Passable with caution for all vehicle classes.',
    };

    return [routeA, routeB, routeC];
  }

  // Siliguri -> Gangtok (Sikkim)
  if (
    (sourceCityId === 'siliguri' && destCityId === 'gangtok') ||
    (sourceCityId === 'gangtok' && destCityId === 'siliguri')
  ) {
    const teestaSeg = segmentMap.get('seg-nh10-teesta') || INITIAL_ROAD_SEGMENTS[3];
    const teestaAccess = teestaSeg.vehicleAccess[vehicleType];
    const isTeestaBlocked = !teestaAccess.canPass || teestaAccess.status === 'blocked';

    const routeA: RouteOption = {
      id: 'route-nh10-direct',
      title: 'Route A: Direct NH-10 Teesta River Corridor',
      via: 'via Sevoke - Teesta Bazaar - Rangpo - Singtam',
      distanceKm: 114,
      durationMinutes: isTeestaBlocked ? 480 : 210,
      riskLevel: teestaSeg.currentStatus === 'critical' ? 'Critical' : 'Moderate',
      statusForVehicle: teestaAccess.status,
      segmentIds: ['seg-nh10-teesta'],
      coordinates: [
        [26.727, 88.395],
        [26.883, 88.472],
        [27.045, 88.478],
        [27.176, 88.528],
        [27.338, 88.606],
      ],
      elevationGainM: 1650,
      maxInclinePct: 11,
      reasoning: isTeestaBlocked
        ? `BLOCKED for ${VEHICLE_CATALOG.find((v) => v.type === vehicleType)?.label}: Teesta riverbank collapsed at 29th Mile. Road width insufficient & unsafe for this vehicle class.`
        : `Fastest direct route along the Teesta gorge. Watch for sudden rockfalls during rain.`,
      activeHazardsCount: teestaSeg.currentStatus !== 'safe' ? 1 : 0,
      isRecommended: !isTeestaBlocked,
      warnings: [teestaAccess.advice, `Obstruction: ${teestaSeg.obstructionPercentage}%`],
      clearanceNote: teestaAccess.advice,
    };

    const routeB: RouteOption = {
      id: 'route-lava-bypass',
      title: 'Route B: Gorubathan - Lava - Reshi - Rorathang Bypass',
      via: 'via Damdim - Gorubathan - Lava - Pedong - Reshi - Gangtok',
      distanceKm: 152,
      durationMinutes: 280,
      riskLevel: 'Low',
      statusForVehicle: 'passable',
      segmentIds: [],
      coordinates: [
        [26.727, 88.395],
        [26.885, 88.705],
        [27.086, 88.665],
        [27.152, 88.615],
        [27.338, 88.606],
      ],
      elevationGainM: 2100,
      maxInclinePct: 9,
      reasoning: isTeestaBlocked
        ? `RECOMMENDED SAFEST ALTERNATIVE: Bypasses the collapsed Teesta gorge completely. Higher altitude via Lava ridge, fully open and paved.`
        : `Scenic ridge alternative with zero river flood risk. Adds 38 km.`,
      activeHazardsCount: 0,
      isRecommended: isTeestaBlocked,
      warnings: ['Steep climb through pine forests near Lava (2,100m)', 'Clear for all registered traffic'],
      clearanceNote: 'Fully passable for all vehicle classes.',
    };

    return [routeA, routeB];
  }

  // Guwahati -> Tawang (Arunachal)
  if (
    (sourceCityId === 'guwahati' && destCityId === 'tawang') ||
    (sourceCityId === 'tawang' && destCityId === 'guwahati')
  ) {
    const selaSeg = segmentMap.get('seg-nh13-sela') || INITIAL_ROAD_SEGMENTS[4];
    const selaAccess = selaSeg.vehicleAccess[vehicleType];

    const routeA: RouteOption = {
      id: 'route-sela-direct',
      title: 'Route A: Trans-Arunachal Highway via Sela Tunnel (NH-13)',
      via: 'via Tezpur - Bhalukpong - Bomdila - Sela Tunnel - Tawang',
      distanceKm: 440,
      durationMinutes: 620,
      riskLevel: selaSeg.currentStatus === 'critical' ? 'Critical' : 'High',
      statusForVehicle: selaAccess.status,
      segmentIds: ['seg-nh13-sela'],
      coordinates: [
        [26.144, 91.736],
        [26.652, 92.795],
        [27.012, 92.635],
        [27.264, 92.423],
        [27.505, 92.015],
        [27.586, 91.868],
      ],
      elevationGainM: 4170,
      maxInclinePct: 14,
      reasoning:
        selaAccess.status === 'blocked'
          ? `RESTRICTED / BLOCKED: Extreme black ice and rockfall near 13,700 ft. Prohibited for ${vehicleType}.`
          : `High altitude border highway. Sela Tunnel provides all-weather crossing; anti-skid chains required for icy approaches.`,
      activeHazardsCount: 1,
      isRecommended: selaAccess.canPass,
      warnings: [
        'Sub-zero icing conditions above 10,000 ft',
        'Inner Line Permit (ILP) verification at Bhalukpong checkpost',
        selaAccess.advice,
      ],
      clearanceNote: selaAccess.advice,
    };

    const routeB: RouteOption = {
      id: 'route-bhutan-kalaktang',
      title: 'Route B: Orang - Kalaktang - Rupa - Dirang Bypass',
      via: 'via Orang - Shergaon - Rupa - Dirang - Tawang',
      distanceKm: 410,
      durationMinutes: 590,
      riskLevel: 'Moderate',
      statusForVehicle: selaAccess.status,
      segmentIds: ['seg-nh13-sela'],
      coordinates: [
        [26.144, 91.736],
        [26.712, 92.355],
        [27.112, 92.215],
        [27.358, 92.241],
        [27.586, 91.868],
      ],
      elevationGainM: 3800,
      maxInclinePct: 11,
      reasoning: 'Alternative western approach via Kalaktang. Avoids Bhalukpong landslides, but still merges before Sela Pass.',
      activeHazardsCount: 1,
      isRecommended: !selaAccess.canPass ? false : true,
      warnings: ['Shorter distance by 30 km', 'Steep climb near Shergaon'],
      clearanceNote: 'Requires 4WD or chains above Dirang.',
    };

    return [routeA, routeB];
  }

  // Generic Dynamic Route Generator for other pairs
  const sHub = INITIAL_ROAD_SEGMENTS.find((s) => s.startCity.toLowerCase().includes(sourceCityId.toLowerCase())) || INITIAL_ROAD_SEGMENTS[1];
  const dHub = INITIAL_ROAD_SEGMENTS.find((s) => s.endCity.toLowerCase().includes(destCityId.toLowerCase())) || INITIAL_ROAD_SEGMENTS[0];

  const genericRouteA: RouteOption = {
    id: `route-gen-direct-${sourceCityId}-${destCityId}`,
    title: `Route A: Primary Corridor (${sHub.highwayCode})`,
    via: `Direct via National Highway ${sHub.highwayCode}`,
    distanceKm: 240,
    durationMinutes: 320,
    riskLevel: sHub.currentStatus === 'critical' ? 'Critical' : sHub.currentStatus === 'restricted' ? 'High' : 'Low',
    statusForVehicle: sHub.vehicleAccess[vehicleType]?.status || 'passable',
    segmentIds: [sHub.id],
    coordinates: [
      sHub.startCoords,
      [(sHub.startCoords[0] + sHub.endCoords[0]) / 2, (sHub.startCoords[1] + sHub.endCoords[1]) / 2],
      sHub.endCoords,
    ],
    elevationGainM: 650,
    maxInclinePct: 7,
    reasoning: `Standard primary route. Current road status: ${sHub.currentStatus}.`,
    activeHazardsCount: sHub.currentStatus !== 'safe' ? 1 : 0,
    isRecommended: sHub.vehicleAccess[vehicleType]?.canPass ?? true,
    warnings: [`Monitored by State Highway Patrol`],
    clearanceNote: sHub.vehicleAccess[vehicleType]?.advice || 'Proceed normally.',
  };

  const genericRouteB: RouteOption = {
    id: `route-gen-alt-${sourceCityId}-${destCityId}`,
    title: `Route B: Valley Bypass Corridor`,
    via: `Alternate State Highway bypass`,
    distanceKm: 285,
    durationMinutes: 370,
    riskLevel: 'Low',
    statusForVehicle: 'passable',
    segmentIds: [],
    coordinates: [
      sHub.startCoords,
      [sHub.startCoords[0] + 0.15, sHub.startCoords[1] - 0.2],
      sHub.endCoords,
    ],
    elevationGainM: 320,
    maxInclinePct: 4,
    reasoning: `Secondary bypass route with flatter terrain and zero high-risk mountain passes.`,
    activeHazardsCount: 0,
    isRecommended: !(sHub.vehicleAccess[vehicleType]?.canPass ?? true),
    warnings: [`Adds 45 km to journey`],
    clearanceNote: 'Clear for all vehicle categories.',
  };

  return [genericRouteA, genericRouteB];
}
