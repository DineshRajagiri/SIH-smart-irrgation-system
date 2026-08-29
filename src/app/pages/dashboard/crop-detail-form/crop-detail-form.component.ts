import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalService, CropData } from '../../../services/modal.service';
import { FieldStatusService, FieldStatus } from '../../../services/field-status.service';

@Component({
  selector: 'app-crop-detail-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crop-detail-form.html',
  styleUrl: './crop-detail-form.scss',
})
export class CropDetailFormComponent implements OnInit, OnDestroy {
  cropData: CropData | null = null;
  fieldStatuses: FieldStatus[] = [];
  isOpen = false;

  private subs = new Subscription();

  constructor(
    private modalService: ModalService,
    private fieldStatusService: FieldStatusService
  ) {}

  ngOnInit(): void {
    // Single subscription: whenever isOpen$ changes to true, grab the latest cropData
    this.subs.add(
      this.modalService.isOpen$.subscribe((isOpen) => {
        this.isOpen = isOpen;
        if (isOpen) {
          const cropData = this.modalService.cropData$.getValue();
          if (cropData) {
            this.loadCropData(cropData);
          }
        }
      })
    );

    // Also react when cropData changes while modal is already open
    this.subs.add(
      this.modalService.cropData$.subscribe((cropData) => {
        if (cropData && this.isOpen) {
          this.loadCropData(cropData);
        }
      })
    );
  }

  private loadCropData(cropData: CropData): void {
    let data = { ...cropData };

    // Generate random sensor data if not provided
    if (
      data.soilMoisture == null ||
      data.soilTemperature == null ||
      data.airTemperature == null ||
      data.humidity == null ||
      data.rainfall == null
    ) {
      const randomData = this.fieldStatusService.generateRandomFieldData();
      data = { ...data, ...randomData };
    }

    this.cropData = data;
    this.fieldStatuses = this.fieldStatusService.getFieldStatuses(this.cropData);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  closeModal(): void {
    this.modalService.closeModal();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'good':     return '#27ae60';
      case 'moderate': return '#f39c12';
      case 'critical': return '#e74c3c';
      default:         return '#95a5a6';
    }
  }

  getStatusBgColor(status: string): string {
    switch (status) {
      case 'good':     return '#d4edda';
      case 'moderate': return '#fff3cd';
      case 'critical': return '#f8d7da';
      default:         return '#e2e3e5';
    }
  }

  onClickBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
