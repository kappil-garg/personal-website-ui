import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, finalize, map, timeout, TimeoutError } from 'rxjs';
import { Certification } from '../models/certification.interface';
import { ApiResponse } from '../models/api-response.interface';
import { environment } from '../../environments/environment';
import { EnvironmentService } from '../shared/services/environment.service';

@Injectable({
  providedIn: 'root',
})
export class CertificationService {
  
  private readonly API_BASE_URL = `${environment.apiUrl}/certifications`;
  
  private readonly CACHE_TTL_MS = 10 * 60 * 1000;
  private readonly REQUEST_TIMEOUT_MS = 15 * 1000;

  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);

  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private certificationsSignal = signal<Certification[]>([]);

  private hasFetched = false;
  private lastFetchedAt: number | null = null;

  error = this.errorSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  certifications = this.certificationsSignal.asReadonly();

  get hasDataLoaded(): boolean {
    return this.hasFetched && this.certificationsSignal().length > 0;
  }

  private isCacheFresh(): boolean {
    if (!this.lastFetchedAt) return false;
    return Date.now() - this.lastFetchedAt < this.CACHE_TTL_MS;
  }

  fetchCertifications(options: { forceRefresh?: boolean } = {}): Observable<Certification[]> {
    const shouldUseCache = !options.forceRefresh && this.hasFetched && this.isCacheFresh();
    if (shouldUseCache) {
      return of(this.certificationsSignal());
    }
    this.errorSignal.set(null);
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Certification[]>>(`${this.API_BASE_URL}`).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => {
        const certifications = response.data || [];
        const sortedCertifications = certifications.sort((a, b) => {
          const dateA = a.issueDate;
          const dateB = b.issueDate;
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
        this.certificationsSignal.set(sortedCertifications);
        this.errorSignal.set(null);
        this.hasFetched = true;
        this.lastFetchedAt = Date.now();
        return sortedCertifications;
      }),
      catchError(error => {
        const hasExistingData = this.certificationsSignal().length > 0;
        if (error instanceof TimeoutError) {
          this.environmentService.warn('Certification request timed out after', this.REQUEST_TIMEOUT_MS, 'ms');
        } else {
          this.environmentService.warn('Error fetching certifications:', error);
        }
        if (!hasExistingData) {
          this.errorSignal.set('Certification data is temporarily unavailable. Please try again later.');
        } else {
          this.errorSignal.set(null);
        }
        return of(this.certificationsSignal());
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

}
