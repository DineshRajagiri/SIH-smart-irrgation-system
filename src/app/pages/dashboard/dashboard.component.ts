import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddFieldComponent } from './add-field/add-field.component';
import { FieldListComponent } from './field-list/field-list.component';
import { FieldStatusService, FieldStatus } from '../../services/field-status.service';
import { CropSuggestionService, CropResult } from '../../services/crop-suggestion.service';

export interface SensorData {
  soilMoisture: number;
  soilTemperature: number;
  airTemperature: number;
  humidity: number;
  rainfall: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddFieldComponent, FieldListComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {

  // ── Which top-level modal is open ─────────────────────
  activeModal: 'crop' | 'addField' | 'fieldList' | null = null;

  // ── Crop suggestion form fields ───────────────────────
  fieldName    = '';
  fieldSize    = '';
  soilType     = 'Loamy';
  location     = '';
  soilTypes    = ['Loamy', 'Sandy', 'Clay', 'Silty', 'Peaty'];

  // ── Sensor values (generated randomly) ───────────────
  sensors: SensorData | null = null;
  fieldStatuses: FieldStatus[] = [];

  // ── Crop suggestion results ───────────────────────────
  cropResults: CropResult[] = [];
  showResults = false;
  formError    = '';

  constructor(
    private fieldStatusService: FieldStatusService,
    private cropSuggestionService: CropSuggestionService,
  ) {}

  // ── Open / close helpers ──────────────────────────────
  openModal(modal: 'crop' | 'addField' | 'fieldList') {
    this.activeModal = modal;
    if (modal === 'crop') { this.resetCropForm(); }
  }

  closeModal() {
    this.activeModal = null;
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) { this.closeModal(); }
  }

  // ── Crop suggestion logic ─────────────────────────────
  resetCropForm() {
    this.fieldName   = '';
    this.fieldSize   = '';
    this.soilType    = 'Loamy';
    this.location    = '';
    this.sensors     = null;
    this.fieldStatuses = [];
    this.cropResults = [];
    this.showResults = false;
    this.formError   = '';
  }

  generateSensors() {
    if (!this.fieldName.trim() || !this.fieldSize.trim() || !this.location.trim()) {
      this.formError = 'Please fill in Field Name, Field Size and Location first.';
      return;
    }
    this.formError = '';
    const r = this.fieldStatusService.generateRandomFieldData();
    this.sensors = {
      soilMoisture:    r.soilMoisture,
      soilTemperature: r.soilTemperature,
      airTemperature:  r.airTemperature,
      humidity:        r.humidity,
      rainfall:        r.rainfall,
    };
    this.fieldStatuses = this.fieldStatusService.getFieldStatuses(this.sensors);
    this.cropResults  = [];
    this.showResults  = false;
  }

  suggestCrop() {
    if (!this.sensors) {
      this.formError = 'Please generate sensor values first.';
      return;
    }
    this.formError  = '';
    this.cropResults = this.cropSuggestionService.suggestCrops(this.sensors);
    this.showResults = true;
  }

  // ── Status helpers ────────────────────────────────────
  statusColor(status: string): string {
    return status === 'good' ? '#27ae60' : status === 'moderate' ? '#f39c12' : '#e74c3c';
  }

  statusBg(status: string): string {
    return status === 'good' ? '#d4edda' : status === 'moderate' ? '#fff3cd' : '#f8d7da';
  }

  suitabilityDotColor(score: number): string {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#2ecc71';
    if (score >= 40) return '#f39c12';
    return '#e74c3c';
  }
}
