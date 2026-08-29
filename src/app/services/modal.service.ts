import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CropData {
  cropName: string;
  fieldName?: string;
  fieldSize?: string;
  soilMoisture?: number;
  soilTemperature?: number;
  airTemperature?: number;
  humidity?: number;
  rainfall?: number;
}

export interface ModalState {
  isOpen: boolean;
  cropData: CropData | null;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private stateSubject = new BehaviorSubject<ModalState>({
    isOpen: false,
    cropData: null,
  });

  // Keep individual observables for backward compatibility
  public isOpen$ = new BehaviorSubject<boolean>(false);
  public cropData$ = new BehaviorSubject<CropData | null>(null);

  openCropDetailModal(cropData: CropData): void {
    this.cropData$.next(cropData);
    this.isOpen$.next(true);
  }

  closeModal(): void {
    this.isOpen$.next(false);
    this.cropData$.next(null);
  }

  isModalOpen(): boolean {
    return this.isOpen$.value;
  }
}
