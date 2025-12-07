import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, finalize, map, timeout, TimeoutError } from 'rxjs';
import { Project } from '../models/project.interface';
import { ApiResponse } from '../models/api-response.interface';
import { environment } from '../../environments/environment';
import { EnvironmentService } from '../shared/services/environment.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  
  private readonly API_BASE_URL = `${environment.apiUrl}/projects`;
  
  private readonly CACHE_TTL_MS = 10 * 60 * 1000;
  private readonly REQUEST_TIMEOUT_MS = 15 * 1000;

  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);

  private loadingSignal = signal<boolean>(false);
  private projectsSignal = signal<Project[]>([]);
  private errorSignal = signal<string | null>(null);

  private hasFetched = false;
  private lastFetchedAt: number | null = null;

  error = this.errorSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  projects = this.projectsSignal.asReadonly();

  get hasDataLoaded(): boolean {
    return this.hasFetched && this.projectsSignal().length > 0;
  }

  private isCacheFresh(): boolean {
    if (!this.lastFetchedAt) return false;
    return Date.now() - this.lastFetchedAt < this.CACHE_TTL_MS;
  }

  fetchProjects(options: { forceRefresh?: boolean } = {}): Observable<Project[]> {
    const shouldUseCache = !options.forceRefresh && this.hasFetched && this.isCacheFresh();
    if (shouldUseCache) {
      return of(this.projectsSignal());
    }
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Project[]>>(`${this.API_BASE_URL}`).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => {
        const projects = response.data || [];
        const sortedProjects = projects.sort((a, b) => 
          (b.displayOrder ?? 0) - (a.displayOrder ?? 0)
        );
        this.projectsSignal.set(sortedProjects);
        this.errorSignal.set(null);
        this.hasFetched = true;
        this.lastFetchedAt = Date.now();
        return sortedProjects;
      }),
      catchError(error => {
        const hasExistingData = this.projectsSignal().length > 0;
        if (error instanceof TimeoutError) {
          this.environmentService.warn('Project request timed out after', this.REQUEST_TIMEOUT_MS, 'ms');
        } else {
          this.environmentService.warn('Error fetching projects:', error);
        }
        if (!hasExistingData) {
          this.errorSignal.set('Project data is temporarily unavailable. Please try again later.');
        } else {
          this.errorSignal.set(null);
        }
        return of(this.projectsSignal());
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

}
