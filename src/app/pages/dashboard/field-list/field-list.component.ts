import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZoneService, Zone } from '../../../services/zone.service';

@Component({
  selector: 'app-field-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-list.html',
  styleUrl: './field-list.scss',
})
export class FieldListComponent implements OnInit {
  fields: Zone[] = [];
  isLoading = false;

  constructor(private zoneService: ZoneService) {}

  ngOnInit(): void {
    this.loadFields();
  }

  loadFields(): void {
    this.isLoading = true;
    this.zoneService.getZones().subscribe({
      next: (zones) => {
        this.fields = zones;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading fields:', error);
        this.isLoading = false;
      },
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'active':
        return 'active';
      case 'inactive':
        return 'inactive';
      case 'error':
        return 'error';
      default:
        return 'inactive';
    }
  }

  getMoistureColor(moisture: number): string {
    if (moisture >= 60) return 'high';
    if (moisture >= 40) return 'medium';
    return 'low';
  }

  deleteField(id: string): void {
    if (confirm('Are you sure you want to delete this field?')) {
      this.zoneService.deleteZone(id).subscribe({
        next: () => {
          this.loadFields();
        },
      });
    }
  }
}
