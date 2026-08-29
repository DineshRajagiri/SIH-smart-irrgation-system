import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Zone {
  id: string;
  name: string;
  location: string;
  soilMoisture: number;
  temperature: number;
  status: 'active' | 'inactive' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ZoneService {
  private zones: Zone[] = [
    {
      id: '1',
      name: 'Zone A',
      location: 'North Field',
      soilMoisture: 65,
      temperature: 28,
      status: 'active',
    },
    {
      id: '2',
      name: 'Zone B',
      location: 'South Field',
      soilMoisture: 45,
      temperature: 32,
      status: 'active',
    },
    {
      id: '3',
      name: 'Zone C',
      location: 'East Garden',
      soilMoisture: 75,
      temperature: 25,
      status: 'inactive',
    },
  ];

  constructor() {}

  /**
   * Get all zones
   */
  getZones(): Observable<Zone[]> {
    return of(this.zones).pipe(delay(500));
  }

  /**
   * Get zone by id
   */
  getZoneById(id: string): Observable<Zone | undefined> {
    return of(this.zones.find((z) => z.id === id)).pipe(delay(300));
  }

  /**
   * Create new zone
   */
  createZone(zone: Omit<Zone, 'id'>): Observable<Zone> {
    const newZone: Zone = {
      ...zone,
      id: Date.now().toString(),
    };
    this.zones.push(newZone);
    return of(newZone).pipe(delay(500));
  }

  /**
   * Update zone
   */
  updateZone(id: string, updates: Partial<Zone>): Observable<Zone | null> {
    const zone = this.zones.find((z) => z.id === id);
    if (zone) {
      Object.assign(zone, updates);
      return of(zone).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  /**
   * Delete zone
   */
  deleteZone(id: string): Observable<boolean> {
    const index = this.zones.findIndex((z) => z.id === id);
    if (index > -1) {
      this.zones.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }
}
