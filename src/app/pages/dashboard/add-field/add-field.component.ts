import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-field.html',
  styleUrl: './add-field.scss',
})
export class AddFieldComponent {
  fieldName = '';
  fieldLocation = '';
  fieldArea = '';
  soilType = 'loamy';
  isSubmitting = false;

  soilTypes = ['loamy', 'sandy', 'clay', 'silty', 'peaty'];

  onAddField() {
    if (!this.fieldName || !this.fieldLocation || !this.fieldArea) {
      alert('Please fill all fields');
      return;
    }

    this.isSubmitting = true;
    // Simulate API call
    setTimeout(() => {
      console.log('Field added:', {
        name: this.fieldName,
        location: this.fieldLocation,
        area: this.fieldArea,
        soilType: this.soilType,
      });
      this.resetForm();
      this.isSubmitting = false;
      alert('Field added successfully!');
    }, 1000);
  }

  resetForm() {
    this.fieldName = '';
    this.fieldLocation = '';
    this.fieldArea = '';
    this.soilType = 'loamy';
  }
}
