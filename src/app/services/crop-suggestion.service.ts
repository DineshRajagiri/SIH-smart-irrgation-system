import { Injectable } from '@angular/core';

export interface CropRule {
  name: string;
  icon: string;
  soilMoisture: [number, number];   // [min, max] %
  soilTemperature: [number, number]; // [min, max] °C
  airTemperature: [number, number];  // [min, max] °C
  humidity: [number, number];        // [min, max] %
  rainfall: [number, number];        // [min, max] mm/year
}

export interface CropResult {
  name: string;
  icon: string;
  score: number;        // 0–100 %
  suitability: 'Highly Suitable' | 'Suitable' | 'Moderate' | 'Not Suitable';
  suitabilityColor: string;
  matchedParams: number;
  totalParams: number;
}

@Injectable({ providedIn: 'root' })
export class CropSuggestionService {

  // Reference table from the Crop Selection Guide image
  private crops: CropRule[] = [
    { name: 'Rice',         icon: '🌾', soilMoisture: [40,70], soilTemperature: [22,32], airTemperature: [20,35], humidity: [70,90], rainfall: [1000,2000] },
    { name: 'Wheat',        icon: '🌿', soilMoisture: [25,45], soilTemperature: [10,25], airTemperature: [15,25], humidity: [40,70], rainfall: [400,800]   },
    { name: 'Maize',        icon: '🌽', soilMoisture: [30,50], soilTemperature: [18,30], airTemperature: [18,32], humidity: [50,75], rainfall: [500,1000]  },
    { name: 'Groundnut',    icon: '🥜', soilMoisture: [25,45], soilTemperature: [20,30], airTemperature: [25,35], humidity: [50,70], rainfall: [500,1000]  },
    { name: 'Chickpea',     icon: '🫘', soilMoisture: [20,40], soilTemperature: [10,25], airTemperature: [15,30], humidity: [40,60], rainfall: [300,600]   },
    { name: 'Pearl Millet', icon: '🌾', soilMoisture: [15,35], soilTemperature: [25,35], airTemperature: [25,40], humidity: [30,60], rainfall: [250,600]   },
    { name: 'Sorghum',      icon: '🌾', soilMoisture: [20,40], soilTemperature: [20,32], airTemperature: [25,35], humidity: [40,65], rainfall: [400,800]   },
    { name: 'Soybean',      icon: '🫛', soilMoisture: [30,50], soilTemperature: [20,30], airTemperature: [20,30], humidity: [60,80], rainfall: [600,1000]  },
    { name: 'Green Gram',   icon: '🌱', soilMoisture: [25,45], soilTemperature: [20,30], airTemperature: [25,35], humidity: [50,75], rainfall: [350,600]   },
    { name: 'Mustard',      icon: '🌼', soilMoisture: [20,40], soilTemperature: [10,25], airTemperature: [10,25], humidity: [40,70], rainfall: [350,800]   },
    { name: 'Barley',       icon: '🌾', soilMoisture: [20,40], soilTemperature: [10,25], airTemperature: [12,25], humidity: [40,70], rainfall: [300,600]   },
    { name: 'Sugarcane',    icon: '🎋', soilMoisture: [40,65], soilTemperature: [20,32], airTemperature: [20,35], humidity: [60,85], rainfall: [1000,1500] },
    { name: 'Cotton',       icon: '🌸', soilMoisture: [25,45], soilTemperature: [20,32], airTemperature: [21,35], humidity: [50,75], rainfall: [500,1000]  },
    { name: 'Potato',       icon: '🥔', soilMoisture: [30,50], soilTemperature: [15,25], airTemperature: [15,25], humidity: [60,80], rainfall: [500,750]   },
    { name: 'Tomato',       icon: '🍅', soilMoisture: [30,50], soilTemperature: [18,28], airTemperature: [18,30], humidity: [50,75], rainfall: [500,800]   },
  ];

  /**
   * Score a single parameter: 100 if within range, 50 if within 20% buffer, 0 if outside.
   */
  private scoreParam(value: number, range: [number, number]): number {
    const [min, max] = range;
    if (value >= min && value <= max) return 100;
    const buffer = (max - min) * 0.20;
    if (value >= min - buffer && value <= max + buffer) return 50;
    return 0;
  }

  /**
   * Rainfall sensor is in mm/day; reference table is mm/year.
   * We convert sensor mm/day → annualised mm/year (× 365) for comparison.
   */
  suggestCrops(sensors: {
    soilMoisture: number;
    soilTemperature: number;
    airTemperature: number;
    humidity: number;
    rainfall: number; // mm (sensor daily reading)
  }): CropResult[] {
    const annualRainfall = sensors.rainfall * 365;

    const results: CropResult[] = this.crops.map(crop => {
      const scores = [
        this.scoreParam(sensors.soilMoisture,    crop.soilMoisture),
        this.scoreParam(sensors.soilTemperature, crop.soilTemperature),
        this.scoreParam(sensors.airTemperature,  crop.airTemperature),
        this.scoreParam(sensors.humidity,        crop.humidity),
        this.scoreParam(annualRainfall,          crop.rainfall),
      ];

      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const matched = scores.filter(s => s === 100).length;

      let suitability: CropResult['suitability'];
      let suitabilityColor: string;

      if (avg >= 80) {
        suitability = 'Highly Suitable'; suitabilityColor = '#27ae60';
      } else if (avg >= 60) {
        suitability = 'Suitable';        suitabilityColor = '#2ecc71';
      } else if (avg >= 40) {
        suitability = 'Moderate';        suitabilityColor = '#f39c12';
      } else {
        suitability = 'Not Suitable';    suitabilityColor = '#e74c3c';
      }

      return {
        name: crop.name,
        icon: crop.icon,
        score: Math.round(avg),
        suitability,
        suitabilityColor,
        matchedParams: matched,
        totalParams: 5,
      };
    });

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }
}
