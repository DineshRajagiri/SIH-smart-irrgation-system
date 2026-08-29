import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddFieldComponent } from './add-field/add-field.component';
import { FieldListComponent } from './field-list/field-list.component';
import { FieldStatusService, FieldStatus } from '../../services/field-status.service';
import { CropSuggestionService, CropResult } from '../../services/crop-suggestion.service';
import { IrrigationService, IrrigationAnalysis, SensorInput } from '../../services/irrigation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddFieldComponent, FieldListComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {

  // ── Active modal ──────────────────────────────────────
  activeModal: 'crop' | 'analyse' | 'addField' | 'fieldList' | null = null;

  // ═══════════════════════════════════════════════════
  // CROP SUGGESTION state
  // ═══════════════════════════════════════════════════
  cs_fieldName = '';
  cs_fieldSize = '';
  cs_soilType  = 'Loamy';
  cs_location  = '';
  soilTypes    = ['Loamy', 'Sandy', 'Clay', 'Silty', 'Peaty'];

  cs_sensors: SensorInput | null = null;
  cs_fieldStatuses: FieldStatus[] = [];
  cs_cropResults: CropResult[] = [];
  cs_showResults = false;
  cs_error = '';

  // ═══════════════════════════════════════════════════
  // FIELD ANALYSIS state
  // ═══════════════════════════════════════════════════
  an_cropName  = '';
  an_cropAge   = 0;
  an_fieldName = '';
  an_fieldSize = '';
  an_soilType  = 'Loamy';
  an_location  = '';

  an_sensors: SensorInput | null = null;
  an_fieldStatuses: FieldStatus[] = [];
  an_analysis: IrrigationAnalysis | null = null;
  an_showResults = false;
  an_error = '';

  cropNames: string[] = [];

  constructor(
    private fieldStatusService: FieldStatusService,
    private cropSuggestionService: CropSuggestionService,
    private irrigationService: IrrigationService,
  ) {
    this.cropNames = this.irrigationService.getAllCropNames();
    this.an_cropName = this.cropNames[0];
  }

  // ── Modal helpers ─────────────────────────────────────
  openModal(modal: typeof this.activeModal) {
    this.activeModal = modal;
    if (modal === 'crop')    { this.resetCropSuggestion(); }
    if (modal === 'analyse') { this.resetAnalysis(); }
  }

  closeModal() { this.activeModal = null; }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) { this.closeModal(); }
  }

  // ═══════════════════════════════════════════════════
  // CROP SUGGESTION methods
  // ═══════════════════════════════════════════════════
  resetCropSuggestion() {
    this.cs_fieldName = ''; this.cs_fieldSize = '';
    this.cs_soilType = 'Loamy'; this.cs_location = '';
    this.cs_sensors = null; this.cs_fieldStatuses = [];
    this.cs_cropResults = []; this.cs_showResults = false; this.cs_error = '';
  }

  cs_generateSensors() {
    if (!this.cs_fieldName.trim() || !this.cs_fieldSize.trim() || !this.cs_location.trim()) {
      this.cs_error = 'Please fill in Field Name, Field Size and Location first.'; return;
    }
    this.cs_error = '';
    const r = this.fieldStatusService.generateRandomFieldData();
    this.cs_sensors = { soilMoisture: r.soilMoisture, soilTemperature: r.soilTemperature,
      airTemperature: r.airTemperature, humidity: r.humidity, rainfall: r.rainfall };
    this.cs_fieldStatuses = this.fieldStatusService.getFieldStatuses(this.cs_sensors);
    this.cs_cropResults = []; this.cs_showResults = false;
  }

  cs_suggestCrop() {
    if (!this.cs_sensors) { this.cs_error = 'Please generate sensor values first.'; return; }
    this.cs_error = '';
    this.cs_cropResults = this.cropSuggestionService.suggestCrops(this.cs_sensors);
    this.cs_showResults = true;
  }

  // ═══════════════════════════════════════════════════
  // FIELD ANALYSIS methods
  // ═══════════════════════════════════════════════════
  resetAnalysis() {
    this.an_cropName = this.cropNames[0]; this.an_cropAge = 0;
    this.an_fieldName = ''; this.an_fieldSize = '';
    this.an_soilType = 'Loamy'; this.an_location = '';
    this.an_sensors = null; this.an_fieldStatuses = [];
    this.an_analysis = null; this.an_showResults = false; this.an_error = '';
  }

  an_generateSensors() {
    if (!this.an_fieldName.trim() || !this.an_location.trim() || !this.an_cropName) {
      this.an_error = 'Please fill Crop, Field Name and Location first.'; return;
    }
    if (this.an_cropAge < 0) { this.an_error = 'Crop age must be 0 or more days.'; return; }
    this.an_error = '';
    const r = this.fieldStatusService.generateRandomFieldData();
    this.an_sensors = { soilMoisture: r.soilMoisture, soilTemperature: r.soilTemperature,
      airTemperature: r.airTemperature, humidity: r.humidity, rainfall: r.rainfall };
    this.an_fieldStatuses = this.fieldStatusService.getFieldStatuses(this.an_sensors);
    this.an_analysis = null; this.an_showResults = false;
  }

  an_analyse() {
    if (!this.an_sensors) { this.an_error = 'Please generate sensor values first.'; return; }
    this.an_error = '';
    const result = this.irrigationService.analyse(this.an_cropName, this.an_cropAge, this.an_sensors);
    if (!result) { this.an_error = `Crop "${this.an_cropName}" not found in database.`; return; }
    this.an_analysis = result;
    this.an_showResults = true;
  }

  // ── Shared helpers ────────────────────────────────────
  statusColor(s: string) { return s === 'good' ? '#27ae60' : s === 'moderate' ? '#f39c12' : '#e74c3c'; }
  statusBg(s: string)    { return s === 'good' ? '#d4edda' : s === 'moderate' ? '#fff3cd' : '#f8d7da'; }

  suitabilityColor(score: number) {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#2ecc71';
    if (score >= 40) return '#f39c12';
    return '#e74c3c';
  }

  waterNeedColor(need: string) {
    return need === 'very-high' ? '#e74c3c' : need === 'high' ? '#e67e22'
         : need === 'medium'    ? '#f39c12' : '#27ae60';
  }

  waterNeedLabel(need: string) {
    return need === 'very-high' ? 'Very High' : need === 'high' ? 'High'
         : need === 'medium'    ? 'Medium'    : 'Low';
  }
}
