import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

interface LoginResponse {
  success: boolean;
  token: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  // Demo credentials
  private readonly DEMO_CREDENTIALS = {
    email: 'admin@irrigation.com',
    password: 'password123',
  };

  constructor() {}

  login(email: string, password: string): Observable<LoginResponse> {
    // Simulate API call with delay
    if (email === this.DEMO_CREDENTIALS.email && password === this.DEMO_CREDENTIALS.password) {
      return of({
        success: true,
        token: 'demo-token-' + Date.now(),
      }).pipe(delay(1000));
    } else {
      return throwError(() => ({
        message: 'Invalid email or password',
      })).pipe(delay(1000));
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
