import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, finalize, map, timeout, TimeoutError } from 'rxjs';
import { Education } from '../models/education.interface';
import { ApiResponse } from '../models/api-response.interface';
import { environment } from '../../environments/environment';
import { EnvironmentService } from '../shared/services/environment.service';

@Injectable({
  providedIn: 'root',
})
export class EducationService {
  
  private readonly API_BASE_URL = `${environment.apiUrl}/educations`;
  
  private readonly CACHE_TTL_MS = 10 * 60 * 1000;
  private readonly REQUEST_TIMEOUT_MS = 15 * 1000;

  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);

  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private educationsSignal = signal<Education[]>([]);

  private hasFetched = false;
  private lastFetchedAt: number | null = null;

  error = this.errorSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  educations = this.educationsSignal.asReadonly();

  get hasDataLoaded(): boolean {
    return this.hasFetched && this.educationsSignal().length > 0;
  }

  private isCacheFresh(): boolean {
    if (!this.lastFetchedAt) return false;
    return Date.now() - this.lastFetchedAt < this.CACHE_TTL_MS;
  }

  fetchEducations(options: { forceRefresh?: boolean } = {}): Observable<Education[]> {
    const shouldUseCache = !options.forceRefresh && this.hasFetched && this.isCacheFresh();
    if (shouldUseCache) {
      return of(this.educationsSignal());
    }
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Education[]>>(`${this.API_BASE_URL}`).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => {
        const educations = response.data || [];
        const sortedEducations = educations.sort((a, b) => {
          const dateA = (a.isCurrent || !a.endDate) ? a.startDate : a.endDate;
          const dateB = (b.isCurrent || !b.endDate) ? b.startDate : b.endDate;
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          const [monthA, yearA] = dateA.split('-').map(Number);
          const [monthB, yearB] = dateB.split('-').map(Number);          
          if (yearA !== yearB) {
            return yearB - yearA;
          }
          return monthB - monthA;
        });
        this.educationsSignal.set(sortedEducations);
        this.errorSignal.set(null);
        this.hasFetched = true;
        this.lastFetchedAt = Date.now();
        return sortedEducations;
      }),
      catchError(error => {
        const hasExistingData = this.educationsSignal().length > 0;
        if (error instanceof TimeoutError) {
          this.environmentService.warn('Education request timed out after', this.REQUEST_TIMEOUT_MS, 'ms');
        } else {
          this.environmentService.warn('Error fetching educations:', error);
        }
        if (!hasExistingData) {
          this.errorSignal.set('Education data is temporarily unavailable. Please try again later.');
        } else {
          this.errorSignal.set(null);
        }
        return of(this.educationsSignal());
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

}
