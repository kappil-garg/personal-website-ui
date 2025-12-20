import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, finalize, map, timeout, TimeoutError } from 'rxjs';
import { Skill } from '../models/skill.interface';
import { ApiResponse } from '../models/api-response.interface';
import { environment } from '../../environments/environment';
import { EnvironmentService } from '../shared/services/environment.service';

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  
  private readonly API_BASE_URL = `${environment.apiUrl}/skills`;
  
  private readonly CACHE_TTL_MS = 10 * 60 * 1000;
  private readonly REQUEST_TIMEOUT_MS = 15 * 1000;

  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);

  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private skillsSignal = signal<Skill[]>([]);

  private hasFetched = false;
  private lastFetchedAt: number | null = null;

  error = this.errorSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  skills = this.skillsSignal.asReadonly();

  get hasDataLoaded(): boolean {
    return this.hasFetched && this.skillsSignal().length > 0;
  }

  private isCacheFresh(): boolean {
    if (!this.lastFetchedAt) return false;
    return Date.now() - this.lastFetchedAt < this.CACHE_TTL_MS;
  }

  fetchSkills(options: { forceRefresh?: boolean } = {}): Observable<Skill[]> {
    const shouldUseCache = !options.forceRefresh && this.hasFetched && this.isCacheFresh();
    if (shouldUseCache) {
      this.errorSignal.set(null);
      return of(this.skillsSignal());
    }
    
    this.errorSignal.set(null);
    this.loadingSignal.set(true);
    
    return this.http.get<ApiResponse<Skill[]>>(`${this.API_BASE_URL}`).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => {
        const skills = response.data || [];
        const sortedSkills = skills.sort((a, b) => 
          (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
        );
        this.skillsSignal.set(sortedSkills);
        this.errorSignal.set(null);
        this.hasFetched = true;
        this.lastFetchedAt = Date.now();
        return sortedSkills;
      }),
      catchError(error => {
        const hasExistingData = this.skillsSignal().length > 0;
        if (error instanceof TimeoutError) {
          this.environmentService.warn('Skills request timed out after', this.REQUEST_TIMEOUT_MS, 'ms');
        } else {
          this.environmentService.warn('Error fetching skills:', error);
        }
        if (!hasExistingData) {
          this.errorSignal.set('Skills data is temporarily unavailable. Please try again later.');
        } else {
          this.errorSignal.set(null);
        }
        return of(this.skillsSignal());
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

}
