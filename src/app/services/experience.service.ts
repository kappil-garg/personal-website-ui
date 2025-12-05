import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, finalize, map, timeout, TimeoutError } from 'rxjs';
import { Experience } from '../models/experience.interface';
import { ApiResponse } from '../models/api-response.interface';
import { environment } from '../../environments/environment';
import { EnvironmentService } from '../shared/services/environment.service';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  
  private readonly API_BASE_URL = `${environment.apiUrl}/experiences`;
  
  private readonly CACHE_TTL_MS = 10 * 60 * 1000;
  private readonly REQUEST_TIMEOUT_MS = 15 * 1000;

  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);

  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private experiencesSignal = signal<Experience[]>([]);

  private hasFetched = false;
  private lastFetchedAt: number | null = null;

  error = this.errorSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  experiences = this.experiencesSignal.asReadonly();

  get hasDataLoaded(): boolean {
    return this.hasFetched && this.experiencesSignal().length > 0;
  }

  private isCacheFresh(): boolean {
    if (!this.lastFetchedAt) return false;
    return Date.now() - this.lastFetchedAt < this.CACHE_TTL_MS;
  }

  fetchExperiences(options: { forceRefresh?: boolean } = {}): Observable<Experience[]> {
    const shouldUseCache = !options.forceRefresh && this.hasFetched && this.isCacheFresh();
    if (shouldUseCache) {
      return of(this.experiencesSignal());
    }
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Experience[]>>(`${this.API_BASE_URL}`).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => {
        const experiences = response.data || [];
        const sortedExperiences = experiences.sort((a, b) => 
          (b.displayOrder ?? 0) - (a.displayOrder ?? 0)
        );
        this.experiencesSignal.set(sortedExperiences);
        this.errorSignal.set(null);
        this.hasFetched = true;
        this.lastFetchedAt = Date.now();
        return sortedExperiences;
      }),
      catchError(error => {
        const hasExistingData = this.experiencesSignal().length > 0;
        if (error instanceof TimeoutError) {
          this.environmentService.warn('Experience request timed out after', this.REQUEST_TIMEOUT_MS, 'ms');
        } else {
          this.environmentService.warn('Error fetching experiences:', error);
        }
        if (!hasExistingData) {
          this.errorSignal.set('Experience data is temporarily unavailable. Please try again later.');
        } else {
          this.errorSignal.set(null);
        }
        return of(this.experiencesSignal());
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

}
