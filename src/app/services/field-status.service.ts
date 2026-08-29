import { Injectable } from '@angular/core';

export interface FieldThreshold {
  good: string;
  moderate: string;
  critical: string;
}

export interface FieldStatus {
  parameter: string;
  icon: string;
  value: number;
  unit: string;
  status: 'good' | 'moderate' | 'critical';
  threshold: FieldThreshold;
}

@Injectable({
  providedIn: 'root',
})
export class FieldStatusService {
  private thresholds = {
    soilMoisture: {
      good: '50 - 80%',
      moderate: '30 - 50% / 80 - 90%',
      critical: '< 30% / > 90%',
      ranges: { good: [50, 80], moderate: [30, 50, 80, 90], critical: [0, 30, 90, 100] },
    },
    soilTemperature: {
      good: '18 - 30°C',
      moderate: '30 - 35°C',
      critical: '< 10°C / > 35°C',
      ranges: { good: [18, 30], moderate: [30, 35], critical: [10, 35] },
    },
    airTemperature: {
      good: '18 - 32°C',
      moderate: '32 - 38°C',
      critical: '< 10°C / > 38°C',
      ranges: { good: [18, 32], moderate: [32, 38], critical: [10, 38] },
    },
    humidity: {
      good: '40 - 80%',
      moderate: '30 - 40% / 80 - 90%',
      critical: '< 30% / > 90%',
      ranges: { good: [40, 80], moderate: [30, 40, 80, 90], critical: [0, 30, 90, 100] },
    },
    rainfall: {
      good: '0 - 2 mm',
      moderate: '2 - 15 mm',
      critical: '> 15 mm',
      ranges: { good: [0, 2], moderate: [2, 15], critical: [15, 100] },
    },
  };

  constructor() {}

  /**
   * Generate random field data for demo purposes
   */
  generateRandomFieldData() {
    return {
      fieldName: `Field ${Math.floor(Math.random() * 100)}`,
      fieldSize: `${(Math.random() * 50 + 1).toFixed(1)} hectares`,
      soilMoisture: Math.floor(Math.random() * 100),
      soilTemperature: Math.floor(Math.random() * 40),
      airTemperature: Math.floor(Math.random() * 40),
      humidity: Math.floor(Math.random() * 100),
      rainfall: parseFloat((Math.random() * 20).toFixed(1)),
    };
  }

  /**
   * Get status based on value and parameter
   */
  getStatus(parameter: string, value: number): 'good' | 'moderate' | 'critical' {
    const threshold = this.thresholds[parameter as keyof typeof this.thresholds];
    if (!threshold) return 'moderate';

    const ranges = threshold.ranges;

    switch (parameter) {
      case 'soilMoisture':
      case 'humidity':
        if (value >= ranges.good[0] && value <= ranges.good[1]) return 'good';
        if (
          (value >= ranges.moderate[0] && value <= ranges.moderate[1]) ||
          (value >= ranges.moderate[2] && value <= ranges.moderate[3])
        )
          return 'moderate';
        return 'critical';

      case 'soilTemperature':
      case 'airTemperature':
        if (value >= ranges.good[0] && value <= ranges.good[1]) return 'good';
        if (value >= ranges.moderate[0] && value <= ranges.moderate[1]) return 'moderate';
        return 'critical';

      case 'rainfall':
        if (value >= ranges.good[0] && value <= ranges.good[1]) return 'good';
        if (value >= ranges.moderate[0] && value <= ranges.moderate[1]) return 'moderate';
        return 'critical';

      default:
        return 'moderate';
    }
  }

  /**
   * Get all field statuses
   */
  getFieldStatuses(data: any): FieldStatus[] {
    return [
      {
        parameter: 'Soil Moisture (%)',
        icon: '💧',
        value: data.soilMoisture,
        unit: '%',
        status: this.getStatus('soilMoisture', data.soilMoisture),
        threshold: this.thresholds.soilMoisture,
      },
      {
        parameter: 'Soil Temperature (°C)',
        icon: '🌡️',
        value: data.soilTemperature,
        unit: '°C',
        status: this.getStatus('soilTemperature', data.soilTemperature),
        threshold: this.thresholds.soilTemperature,
      },
      {
        parameter: 'Air Temperature (°C)',
        icon: '🌡️',
        value: data.airTemperature,
        unit: '°C',
        status: this.getStatus('airTemperature', data.airTemperature),
        threshold: this.thresholds.airTemperature,
      },
      {
        parameter: 'Humidity (%)',
        icon: '💨',
        value: data.humidity,
        unit: '%',
        status: this.getStatus('humidity', data.humidity),
        threshold: this.thresholds.humidity,
      },
      {
        parameter: 'Rainfall (mm)',
        icon: '🌧️',
        value: parseFloat(data.rainfall),
        unit: 'mm',
        status: this.getStatus('rainfall', parseFloat(data.rainfall)),
        threshold: this.thresholds.rainfall,
      },
    ];
  }
}
