import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user?: User;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly DEMO_CREDENTIALS = {
    email: 'admin@irrigation.com',
    password: 'password123',
  };

  private readonly DEMO_USER: User = {
    id: '1',
    email: 'admin@irrigation.com',
    name: 'Admin User',
    role: 'administrator',
  };

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.checkAuthStatus();
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<LoginResponse> {
    // Simulate API call with delay
    if (
      email === this.DEMO_CREDENTIALS.email &&
      password === this.DEMO_CREDENTIALS.password
    ) {
      return of({
        success: true,
        token: 'demo-token-' + Date.now(),
        user: this.DEMO_USER,
      }).pipe(delay(1000));
    } else {
      return throwError(() => ({
        success: false,
        message: 'Invalid email or password',
      })).pipe(delay(1000));
    }
  }

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Store authentication data
   */
  setAuthData(token: string, user: User): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check authentication status on app init
   */
  private checkAuthStatus(): void {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }
}
