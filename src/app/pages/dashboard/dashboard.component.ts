import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AddFieldComponent } from './add-field/add-field.component';
import { FieldListComponent } from './field-list/field-list.component';
import { FieldStatusService, FieldStatus } from '../../services/field-status.service';
import { CropSuggestionService, CropResult } from '../../services/crop-suggestion.service';
import { IrrigationService, IrrigationAnalysis, SensorInput } from '../../services/irrigation.service';
import { AnalysisStorageService, SavedAnalysis } from '../../services/analysis-storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddFieldComponent, FieldListComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {

  activeModal: 'crop' | 'analyse' | 'addField' | 'fieldList' | null = null;

  // ═══════════════════════════════════════════════════
  // CROP SUGGESTION
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
  // FIELD ANALYSIS
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
  an_saved = false; // whether current analysis was already saved

  cropNames: string[] = [];

  // ═══════════════════════════════════════════════════
  // FIELD LIST
  // ═══════════════════════════════════════════════════
  savedAnalyses: SavedAnalysis[] = [];
  private sub = new Subscription();

  constructor(
    private fieldStatusService: FieldStatusService,
    private cropSuggestionService: CropSuggestionService,
    private irrigationService: IrrigationService,
    private storageService: AnalysisStorageService,
  ) {
    this.cropNames = this.irrigationService.getAllCropNames();
    this.an_cropName = this.cropNames[0];
  }

  ngOnInit() {
    this.sub.add(
      this.storageService.getAll().subscribe(list => this.savedAnalyses = list)
    );
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  // ── Modal helpers ──────────────────────────────────
  openModal(modal: typeof this.activeModal) {
    this.activeModal = modal;
    if (modal === 'crop')    this.resetCropSuggestion();
    if (modal === 'analyse') this.resetAnalysis();
  }

  closeModal() { this.activeModal = null; }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.closeModal();
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
    this.an_analysis = null; this.an_showResults = false;
    this.an_error = ''; this.an_saved = false;
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
    this.an_analysis = null; this.an_showResults = false; this.an_saved = false;
  }

  an_analyse() {
    if (!this.an_sensors) { this.an_error = 'Please generate sensor values first.'; return; }
    this.an_error = '';
    const result = this.irrigationService.analyse(this.an_cropName, this.an_cropAge, this.an_sensors);
    if (!result) { this.an_error = `Crop "${this.an_cropName}" not found in database.`; return; }
    this.an_analysis = result;
    this.an_showResults = true;

    // Auto-save to field list (only once per analyse click)
    if (!this.an_saved) {
      this.storageService.save({
        cropName:  this.an_cropName,
        cropAge:   this.an_cropAge,
        fieldName: this.an_fieldName,
        fieldSize: this.an_fieldSize,
        soilType:  this.an_soilType,
        location:  this.an_location,
      });
      this.an_saved = true;
    }
  }

  // ── View a saved analysis (re-generate sensors + analyse) ──
  viewSavedAnalysis(entry: SavedAnalysis) {
    this.an_cropName  = entry.cropName;
    this.an_cropAge   = entry.cropAge;
    this.an_fieldName = entry.fieldName;
    this.an_fieldSize = entry.fieldSize;
    this.an_soilType  = entry.soilType;
    this.an_location  = entry.location;
    this.an_saved     = true; // already in list

    // Generate fresh sensor values
    const r = this.fieldStatusService.generateRandomFieldData();
    this.an_sensors = { soilMoisture: r.soilMoisture, soilTemperature: r.soilTemperature,
      airTemperature: r.airTemperature, humidity: r.humidity, rainfall: r.rainfall };
    this.an_fieldStatuses = this.fieldStatusService.getFieldStatuses(this.an_sensors);

    // Run analysis immediately
    const result = this.irrigationService.analyse(this.an_cropName, this.an_cropAge, this.an_sensors);
    if (result) {
      this.an_analysis    = result;
      this.an_showResults = true;
      this.an_error       = '';
    }
    this.activeModal = 'analyse';
  }

  deleteAnalysis(id: string) {
    this.storageService.delete(id);
  }

  // ── Shared helpers ─────────────────────────────────
  statusColor(s: string) { return s === 'good' ? '#27ae60' : s === 'moderate' ? '#f39c12' : '#e74c3c'; }

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
