import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, finalize, map } from 'rxjs';
import { PersonalInfo } from '../models/portfolio.interface';
import { ApiResponse } from '../models/api-response.interface';
import { environment } from '../../environments/environment';
import { EnvironmentService } from '../shared/services/environment.service';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  
  private readonly CACHE_TTL_MS = 10 * 60 * 1000;
  private readonly API_BASE_URL = `${environment.apiUrl}/portfolio`;

  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);
  
  // Centralized data management with signals for reactivity
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private personalInfoSignal = signal<PersonalInfo | null>(null);

  private hasFetched = false;
  private lastFetchedAt: number | null = null;

  constructor() {
    this.loadPersonalInfo();
  }

  loadPersonalInfo(options: { forceRefresh?: boolean } = {}): Observable<PersonalInfo | null> {
    const shouldUseCache = !options.forceRefresh && this.hasFetched && this.isCacheFresh();
    if (shouldUseCache && this.personalInfoSignal()) {
      return of(this.personalInfoSignal()!);
    }
    
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<PersonalInfo>>(this.API_BASE_URL).pipe(
      map(response => {
        const personalInfo = response.data;
        if (personalInfo) {
          this.personalInfoSignal.set(personalInfo);
          this.errorSignal.set(null);
          this.hasFetched = true;
          this.lastFetchedAt = Date.now();
          return personalInfo;
        }
        return null;
      }),
      catchError(error => {
        this.environmentService.warn('Error fetching personal info:', error);
        if (!this.personalInfoSignal()) {
          this.loadFallbackData();
          this.errorSignal.set('Failed to load personal info. Using cached data.');
        } else {
          this.errorSignal.set(null);
        }
        return of(this.personalInfoSignal());
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

  private loadFallbackData(): void {
    const fallbackInfo: PersonalInfo = {
      name: 'Kapil Garg',
      tagline: 'Full Stack Developer',
      description: [
        'Java Full Stack Developer with experience in enterprise applications.',
      ],
      profileImage: 'assets/images/profile-pic.png',
    };
    this.personalInfoSignal.set(fallbackInfo);
  }

  getPersonalInfo(): Observable<PersonalInfo> {
    const info = this.personalInfoSignal();
    if (info) {
      return of(info);
    }
    return this.loadPersonalInfo().pipe(
      map(info => {
        if (!info) {
          this.loadFallbackData();
          return this.personalInfoSignal()!;
        }
        return info;
      })
    );
  }
  
  // Signal-based getter for reactive components
  get personalInfo() {
    return this.personalInfoSignal.asReadonly();
  }

  get loading() {
    return this.loadingSignal.asReadonly();
  }

  get error() {
    return this.errorSignal.asReadonly();
  }

  get hasDataLoaded(): boolean {
    return this.hasFetched;
  }

  private isCacheFresh(): boolean {
    if (!this.lastFetchedAt) {
      return false;
    }
    return Date.now() - this.lastFetchedAt < this.CACHE_TTL_MS;
  }
  
}
