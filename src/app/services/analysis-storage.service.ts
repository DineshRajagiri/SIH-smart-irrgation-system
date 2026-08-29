import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SavedAnalysis {
  id: string;
  cropName: string;
  cropAge: number;
  fieldName: string;
  fieldSize: string;
  soilType: string;
  location: string;
  savedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class AnalysisStorageService {
  private entries$ = new BehaviorSubject<SavedAnalysis[]>([]);

  getAll() {
    return this.entries$.asObservable();
  }

  getSnapshot(): SavedAnalysis[] {
    return this.entries$.getValue();
  }

  save(entry: Omit<SavedAnalysis, 'id' | 'savedAt'>): SavedAnalysis {
    const newEntry: SavedAnalysis = {
      ...entry,
      id: Date.now().toString(),
      savedAt: new Date(),
    };
    this.entries$.next([...this.entries$.getValue(), newEntry]);
    return newEntry;
  }

  delete(id: string) {
    this.entries$.next(this.entries$.getValue().filter(e => e.id !== id));
  }
}
