import { Component, OnInit, computed, inject, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectService } from '../../services/project.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { SeoService } from '../../shared/services/seo.service';
import { EnvironmentService } from '../../shared/services/environment.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  private seoService = inject(SeoService);
  public projectService = inject(ProjectService);
  private environmentService = inject(EnvironmentService);

  error = computed(() => this.projectService.error());
  hasError = computed(() => !!this.projectService.error());
  loading = computed(() => this.projectService.loading() && !this.hasError());
  projects = computed(() => this.projectService.projects());

  ngOnInit(): void {
    this.seoService.setProjectsMetaTags();
    if (!this.projectService.hasDataLoaded && !this.projectService.loading()) {
      this.loadProjects();
    } else {
      this.cdr.markForCheck();
    }
  }

  private loadProjects(): void {
    this.projectService.fetchProjects().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.environmentService.warn('Failed to load projects:', error);
        this.cdr.markForCheck();
      }
    });
  }

  retryLoadProjects(): void {
    this.projectService.fetchProjects({ forceRefresh: true }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.environmentService.warn('Failed to load projects:', error);
        this.cdr.markForCheck();
      }
    });
  }

}
