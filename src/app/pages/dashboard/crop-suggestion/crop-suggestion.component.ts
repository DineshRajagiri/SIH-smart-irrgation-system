import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-crop-suggestion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crop-suggestion.html',
  styleUrl: './crop-suggestion.scss',
})
export class CropSuggestionComponent {
  crops = [
    {
      name: 'Wheat',
      icon: '🌾',
      description: 'Best for current soil conditions',
      moisture: '65%',
    },
    {
      name: 'Rice',
      icon: '🍚',
      description: 'High water requirement',
      moisture: '45%',
    },
    {
      name: 'Corn',
      icon: '🌽',
      description: 'Moderate irrigation needed',
      moisture: '75%',
    },
  ];

  selectedCrop = this.crops[0];

  constructor(private modalService: ModalService) {}

  selectCrop(crop: any) {
    this.selectedCrop = crop;
    // Open the crop detail form modal
    this.modalService.openCropDetailModal({
      cropName: crop.name,
    });
  }
}
