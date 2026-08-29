import { Injectable } from '@angular/core';

export interface CropProfile {
  name: string;
  icon: string;
  rootZoneDepth: number;     // cm
  fieldCapacity: number;     // % vol
  wiltingPoint: number;      // % vol
  allowableDepletion: number; // fraction (0–1)
  irrigationEfficiency: number; // fraction (0–1)
  growthStages: GrowthStage[];
}

export interface GrowthStage {
  label: string;
  maxDays: number;
  waterNeed: 'low' | 'medium' | 'high' | 'very-high';
  description: string;
}

export interface IrrigationAnalysis {
  crop: CropProfile;
  growthStage: GrowthStage;
  sensors: SensorInput;

  // WHEN
  availableWater: number;       // mm
  allowableLimit: number;       // mm
  whenDecision: 'irrigate' | 'monitor' | 'no-irrigation';
  whenColor: string;
  whenMessage: string;

  // WHERE
  zoneStatus: 'dry' | 'ok';
  zoneMessage: string;

  // HOW MUCH
  waterDeficit: number;         // mm
  grossWaterSupply: number;     // mm (adjusted for efficiency)
  effectiveRainfallMm: number;  // mm (daily rainfall × 7 days estimate)
}

export interface SensorInput {
  soilMoisture: number;      // %
  soilTemperature: number;   // °C
  airTemperature: number;    // °C
  humidity: number;          // %
  rainfall: number;          // mm/day
}

@Injectable({ providedIn: 'root' })
export class IrrigationService {

  private cropProfiles: CropProfile[] = [
    {
      name: 'Rice', icon: '🌾',
      rootZoneDepth: 20, fieldCapacity: 40, wiltingPoint: 20,
      allowableDepletion: 0.20, irrigationEfficiency: 0.75,
      growthStages: [
        { label: 'Seedling',    maxDays: 15,  waterNeed: 'high',      description: 'Flooding / puddled soil required' },
        { label: 'Tillering',   maxDays: 50,  waterNeed: 'very-high', description: 'Keep field flooded (5–10 cm standing water)' },
        { label: 'Booting',     maxDays: 80,  waterNeed: 'very-high', description: 'Critical stage — do not let soil dry' },
        { label: 'Heading',     maxDays: 105, waterNeed: 'high',      description: 'Maintain moisture for grain fill' },
        { label: 'Ripening',    maxDays: 130, waterNeed: 'medium',    description: 'Reduce water; drain field 2 weeks before harvest' },
      ],
    },
    {
      name: 'Wheat', icon: '🌿',
      rootZoneDepth: 60, fieldCapacity: 35, wiltingPoint: 15,
      allowableDepletion: 0.55, irrigationEfficiency: 0.80,
      growthStages: [
        { label: 'Germination', maxDays: 10,  waterNeed: 'medium', description: 'Ensure good soil contact and moisture' },
        { label: 'Tillering',   maxDays: 45,  waterNeed: 'medium', description: 'First irrigation at crown-root initiation stage' },
        { label: 'Jointing',    maxDays: 75,  waterNeed: 'high',   description: 'Critical water stage; irrigate if rain < 25 mm' },
        { label: 'Heading',     maxDays: 95,  waterNeed: 'high',   description: 'Maintain moisture for grain development' },
        { label: 'Grain Fill',  maxDays: 120, waterNeed: 'medium', description: 'Reduce irrigation; stop 2 weeks before harvest' },
      ],
    },
    {
      name: 'Maize', icon: '🌽',
      rootZoneDepth: 60, fieldCapacity: 35, wiltingPoint: 14,
      allowableDepletion: 0.50, irrigationEfficiency: 0.80,
      growthStages: [
        { label: 'Germination', maxDays: 10,  waterNeed: 'medium', description: 'Keep seed zone moist for uniform emergence' },
        { label: 'Vegetative',  maxDays: 45,  waterNeed: 'medium', description: 'Moderate irrigation; drought-tolerant at early stages' },
        { label: 'Silking',     maxDays: 70,  waterNeed: 'very-high', description: 'Most critical stage; water stress reduces yield by 50%' },
        { label: 'Grain Fill',  maxDays: 100, waterNeed: 'high',   description: 'Keep soil moist through dough stage' },
        { label: 'Maturity',    maxDays: 120, waterNeed: 'low',    description: 'Withhold irrigation to allow drying' },
      ],
    },
    {
      name: 'Tomato', icon: '🍅',
      rootZoneDepth: 50, fieldCapacity: 33, wiltingPoint: 13,
      allowableDepletion: 0.40, irrigationEfficiency: 0.85,
      growthStages: [
        { label: 'Transplanting', maxDays: 15,  waterNeed: 'high',   description: 'Daily light irrigation until establishment' },
        { label: 'Vegetative',    maxDays: 40,  waterNeed: 'medium', description: 'Irrigate every 3–4 days' },
        { label: 'Flowering',     maxDays: 65,  waterNeed: 'high',   description: 'Consistent moisture to prevent blossom drop' },
        { label: 'Fruiting',      maxDays: 95,  waterNeed: 'very-high', description: 'Peak demand; irregular watering causes blossom-end rot' },
        { label: 'Ripening',      maxDays: 120, waterNeed: 'medium', description: 'Reduce water to improve taste and shelf life' },
      ],
    },
    {
      name: 'Potato', icon: '🥔',
      rootZoneDepth: 40, fieldCapacity: 33, wiltingPoint: 13,
      allowableDepletion: 0.35, irrigationEfficiency: 0.80,
      growthStages: [
        { label: 'Sprouting',   maxDays: 20,  waterNeed: 'medium',    description: 'Keep soil moist but not waterlogged' },
        { label: 'Vegetative',  maxDays: 50,  waterNeed: 'medium',    description: 'Irrigate every 5–7 days' },
        { label: 'Tuber Init',  maxDays: 70,  waterNeed: 'very-high', description: 'Critical — water stress reduces tuber number' },
        { label: 'Bulking',     maxDays: 100, waterNeed: 'high',      description: 'Maintain even moisture for uniform size' },
        { label: 'Maturation',  maxDays: 120, waterNeed: 'low',       description: 'Withhold water 2–3 weeks before harvest' },
      ],
    },
    {
      name: 'Cotton', icon: '🌸',
      rootZoneDepth: 90, fieldCapacity: 36, wiltingPoint: 14,
      allowableDepletion: 0.65, irrigationEfficiency: 0.75,
      growthStages: [
        { label: 'Germination', maxDays: 10,  waterNeed: 'medium', description: 'Light irrigation for establishment' },
        { label: 'Vegetative',  maxDays: 50,  waterNeed: 'medium', description: 'Drought-tolerant at early stages' },
        { label: 'Flowering',   maxDays: 90,  waterNeed: 'high',   description: 'Critical period; irrigate every 10–14 days' },
        { label: 'Boll Dev.',   maxDays: 130, waterNeed: 'high',   description: 'Maintain moisture for fibre quality' },
        { label: 'Maturity',    maxDays: 160, waterNeed: 'low',    description: 'Stop irrigation to hasten boll opening' },
      ],
    },
    {
      name: 'Sugarcane', icon: '🎋',
      rootZoneDepth: 60, fieldCapacity: 38, wiltingPoint: 16,
      allowableDepletion: 0.65, irrigationEfficiency: 0.70,
      growthStages: [
        { label: 'Germination', maxDays: 30,  waterNeed: 'high',      description: 'Irrigate every 7–10 days' },
        { label: 'Tillering',   maxDays: 90,  waterNeed: 'very-high', description: 'Peak tillering; high water demand' },
        { label: 'Grand Growth',maxDays: 210, waterNeed: 'very-high', description: 'Longest stage; irrigate every 10 days' },
        { label: 'Ripening',    maxDays: 330, waterNeed: 'low',       description: 'Reduce water to increase sucrose content' },
      ],
    },
    {
      name: 'Soybean', icon: '🫛',
      rootZoneDepth: 60, fieldCapacity: 34, wiltingPoint: 14,
      allowableDepletion: 0.50, irrigationEfficiency: 0.80,
      growthStages: [
        { label: 'Germination', maxDays: 10,  waterNeed: 'medium', description: 'Keep seed zone moist' },
        { label: 'Vegetative',  maxDays: 35,  waterNeed: 'medium', description: 'Moderate requirement' },
        { label: 'Flowering',   maxDays: 65,  waterNeed: 'high',   description: 'Most sensitive to water stress' },
        { label: 'Pod Fill',    maxDays: 95,  waterNeed: 'high',   description: 'Maintain soil moisture for seed size' },
        { label: 'Maturity',    maxDays: 120, waterNeed: 'low',    description: 'Reduce irrigation for harvest' },
      ],
    },
    {
      name: 'Groundnut', icon: '🥜',
      rootZoneDepth: 40, fieldCapacity: 32, wiltingPoint: 12,
      allowableDepletion: 0.50, irrigationEfficiency: 0.80,
      growthStages: [
        { label: 'Germination', maxDays: 10,  waterNeed: 'medium', description: 'Ensure even moisture for germination' },
        { label: 'Vegetative',  maxDays: 35,  waterNeed: 'medium', description: 'Moderate water need' },
        { label: 'Flowering',   maxDays: 60,  waterNeed: 'high',   description: 'Critical peg initiation stage' },
        { label: 'Pod Dev.',    maxDays: 90,  waterNeed: 'high',   description: 'Irrigate every 7–10 days' },
        { label: 'Maturity',    maxDays: 115, waterNeed: 'low',    description: 'Reduce water for shell hardening' },
      ],
    },
    {
      name: 'Chickpea', icon: '🫘',
      rootZoneDepth: 60, fieldCapacity: 33, wiltingPoint: 14,
      allowableDepletion: 0.50, irrigationEfficiency: 0.80,
      growthStages: [
        { label: 'Germination', maxDays: 10,  waterNeed: 'low',    description: 'One pre-sowing irrigation sufficient' },
        { label: 'Vegetative',  maxDays: 40,  waterNeed: 'low',    description: 'Drought-tolerant; avoid waterlogging' },
        { label: 'Flowering',   maxDays: 65,  waterNeed: 'medium', description: 'Irrigate if soil moisture drops below 40%' },
        { label: 'Pod Fill',    maxDays: 90,  waterNeed: 'medium', description: 'One irrigation at pod fill stage' },
        { label: 'Maturity',    maxDays: 110, waterNeed: 'low',    description: 'No irrigation needed' },
      ],
    },
    {
      name: 'Pearl Millet', icon: '🌾',
      rootZoneDepth: 50, fieldCapacity: 32, wiltingPoint: 12,
      allowableDepletion: 0.55, irrigationEfficiency: 0.80,
      growthStages: [
        { label: 'Germination', maxDays: 7,   waterNeed: 'medium', description: 'Light irrigation for germination' },
        { label: 'Vegetative',  maxDays: 30,  waterNeed: 'low',    description: 'Very drought-tolerant at early stages' },
        { label: 'Booting',     maxDays: 55,  waterNeed: 'high',   description: 'Critical water requirement period' },
        { label: 'Heading',     maxDays: 70,  waterNeed: 'high',   description: 'Irrigate to protect panicle' },
        { label: 'Grain Fill',  maxDays: 85,  waterNeed: 'medium', description: 'Reduce water toward maturity' },
      ],
    },
    {
      name: 'Sorghum', icon: '🌾',
      rootZoneDepth: 60, fieldCapacity: 34, wiltingPoint: 14,
      allowableDepletion: 0.55, irrigationEfficiency: 0.80,
      growthStages: [
        { label: 'Germination', maxDays: 10,  waterNeed: 'medium', description: 'Moderate moisture for germination' },
        { label: 'Vegetative',  maxDays: 40,  waterNeed: 'low',    description: 'Drought-tolerant; limited irrigation' },
        { label: 'Booting',     maxDays: 65,  waterNeed: 'high',   description: 'Most critical water period' },
        { label: 'Grain Fill',  maxDays: 90,  waterNeed: 'medium', description: 'Maintain moisture through dough stage' },
        { label: 'Maturity',    maxDays: 110, waterNeed: 'low',    description: 'No irrigation; allow natural drying' },
      ],
    },
    {
      name: 'Mustard', icon: '🌼',
      rootZoneDepth: 40, fieldCapacity: 33, wiltingPoint: 13,
      allowableDepletion: 0.60, irrigationEfficiency: 0.80,
      growthStages: [
        { label: 'Germination', maxDays: 7,   waterNeed: 'medium', description: 'Pre-sowing irrigation; one after sowing' },
        { label: 'Vegetative',  maxDays: 30,  waterNeed: 'low',    description: 'Drought-tolerant early stage' },
        { label: 'Flowering',   maxDays: 55,  waterNeed: 'high',   description: 'Critical flowering stage irrigation' },
        { label: 'Pod Dev.',    maxDays: 80,  waterNeed: 'medium', description: 'Irrigate at pod formation' },
        { label: 'Maturity',    maxDays: 100, waterNeed: 'low',    description: 'Stop irrigation at yellowing' },
      ],
    },
    {
      name: 'Barley', icon: '🌾',
      rootZoneDepth: 60, fieldCapacity: 34, wiltingPoint: 14,
      allowableDepletion: 0.55, irrigationEfficiency: 0.80,
      growthStages: [
        { label: 'Germination', maxDays: 10,  waterNeed: 'medium', description: 'One irrigation at sowing' },
        { label: 'Tillering',   maxDays: 40,  waterNeed: 'medium', description: 'Irrigate at tillering initiation' },
        { label: 'Jointing',    maxDays: 65,  waterNeed: 'high',   description: 'Critical stage; do not allow drought' },
        { label: 'Heading',     maxDays: 85,  waterNeed: 'high',   description: 'Maintain moisture for grain set' },
        { label: 'Grain Fill',  maxDays: 110, waterNeed: 'low',    description: 'Stop irrigation to allow ripening' },
      ],
    },
    {
      name: 'Green Gram', icon: '🌱',
      rootZoneDepth: 35, fieldCapacity: 30, wiltingPoint: 12,
      allowableDepletion: 0.45, irrigationEfficiency: 0.80,
      growthStages: [
        { label: 'Germination', maxDays: 7,   waterNeed: 'medium', description: 'One irrigation at sowing' },
        { label: 'Vegetative',  maxDays: 25,  waterNeed: 'medium', description: 'Irrigate every 7–10 days' },
        { label: 'Flowering',   maxDays: 45,  waterNeed: 'high',   description: 'Critical — maintain soil moisture' },
        { label: 'Pod Fill',    maxDays: 65,  waterNeed: 'high',   description: 'Irrigate to support pod development' },
        { label: 'Maturity',    maxDays: 75,  waterNeed: 'low',    description: 'Reduce irrigation' },
      ],
    },
  ];

  getCropProfile(name: string): CropProfile | undefined {
    return this.cropProfiles.find(
      c => c.name.toLowerCase() === name.toLowerCase()
    );
  }

  getAllCropNames(): string[] {
    return this.cropProfiles.map(c => c.name);
  }

  getCropWithIcon(name: string): string {
    const p = this.getCropProfile(name);
    return p ? `${p.icon} ${p.name}` : name;
  }

  getGrowthStage(profile: CropProfile, ageInDays: number): GrowthStage {
    for (const stage of profile.growthStages) {
      if (ageInDays <= stage.maxDays) return stage;
    }
    return profile.growthStages[profile.growthStages.length - 1];
  }

  analyse(
    cropName: string,
    cropAgeDays: number,
    sensors: SensorInput
  ): IrrigationAnalysis | null {
    const crop = this.getCropProfile(cropName);
    if (!crop) return null;

    const stage = this.getGrowthStage(crop, cropAgeDays);

    // Root zone depth in mm
    const Zr = crop.rootZoneDepth * 10; // cm → mm

    // Available Water in root zone (mm)
    // AW = (FC - PWP) / 100 * Zr
    const totalAvailableWater = ((crop.fieldCapacity - crop.wiltingPoint) / 100) * Zr;

    // Current available water based on soil moisture reading
    // Assuming soilMoisture reading is volumetric %
    const currentMoisture = sensors.soilMoisture;
    const currentAvailableWater = ((currentMoisture - crop.wiltingPoint) / 100) * Zr;

    // Allowable depletion level (mm)
    const allowableLimit = crop.allowableDepletion * totalAvailableWater;

    // WHEN decision
    let whenDecision: IrrigationAnalysis['whenDecision'];
    let whenColor: string;
    let whenMessage: string;

    if (currentAvailableWater > allowableLimit * 1.2) {
      whenDecision = 'no-irrigation';
      whenColor = '#27ae60';
      whenMessage = 'Soil moisture is adequate. No irrigation needed right now.';
    } else if (currentAvailableWater >= allowableLimit * 0.8) {
      whenDecision = 'monitor';
      whenColor = '#f39c12';
      whenMessage = 'Approaching depletion limit. Monitor closely and prepare to irrigate.';
    } else {
      whenDecision = 'irrigate';
      whenColor = '#e74c3c';
      whenMessage = 'Available water is below allowable limit. Irrigate now.';
    }

    // WHERE — zone status
    const zoneStatus = whenDecision === 'irrigate' ? 'dry' : 'ok';
    const zoneMessage = zoneStatus === 'dry'
      ? 'This zone is DRY. Schedule irrigation for this field.'
      : 'This zone has adequate moisture. No zone-specific action needed.';

    // HOW MUCH — water deficit
    const targetMoisture = crop.fieldCapacity;
    const waterDeficit = Math.max(0, ((targetMoisture - currentMoisture) / 100) * Zr);

    // Effective rainfall (daily mm × 7-day window)
    const effectiveRainfallMm = Math.min(sensors.rainfall * 7, waterDeficit);

    // Gross water supply adjusted for efficiency
    const netWater = Math.max(0, waterDeficit - effectiveRainfallMm);
    const grossWaterSupply = netWater / crop.irrigationEfficiency;

    return {
      crop,
      growthStage: stage,
      sensors,
      availableWater: Math.max(0, Math.round(currentAvailableWater * 10) / 10),
      allowableLimit: Math.round(allowableLimit * 10) / 10,
      whenDecision,
      whenColor,
      whenMessage,
      zoneStatus,
      zoneMessage,
      waterDeficit:     Math.round(waterDeficit * 10) / 10,
      grossWaterSupply: Math.round(grossWaterSupply * 10) / 10,
      effectiveRainfallMm: Math.round(effectiveRainfallMm * 10) / 10,
    };
  }
}
