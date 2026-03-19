import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Project } from '../../models/project.interface';
import { ProjectService } from '../../services/project.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { SeoService } from '../../shared/services/seo.service';
import { EnvironmentService } from '../../shared/services/environment.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly projectService = inject(ProjectService);
  private readonly seoService = inject(SeoService);
  private readonly environmentService = inject(EnvironmentService);

  private readonly currentProjectSignal = signal<Project | null>(null);
  private readonly projectLoadErrorSignal = signal<string | null>(null);

  project = computed(() => this.currentProjectSignal());
  loading = computed(() => this.projectService.loading() && !this.currentProjectSignal() && !this.projectLoadErrorSignal());
  error = computed(() => this.projectLoadErrorSignal());

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const projectId = params.get('id');
      if (!projectId) {
        this.projectLoadErrorSignal.set('Project not found.');
        return;
      }
      this.loadProject(projectId);
    });
  }

  private loadProject(projectId: string): void {
    this.projectLoadErrorSignal.set(null);
    this.currentProjectSignal.set(null);
    this.projectService.fetchProjectById(projectId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: project => {
        if (!project) {
          this.projectLoadErrorSignal.set('Project details are unavailable right now. Please try again.');
          return;
        }
        this.currentProjectSignal.set(project);
        this.seoService.setProjectDetailMetaTags(project);
      },
      error: error => {
        this.environmentService.warn('Failed to load project details:', error);
        this.projectLoadErrorSignal.set('Project details are unavailable right now. Please try again.');
      },
    });
  }

  retryLoadProject(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) {
      return;
    }
    this.loadProject(projectId);
  }

  goBackToProjects(): void {
    this.router.navigate(['/projects']);
  }

  formatMonthYear(dateStr?: string): string | null {
    if (!dateStr) {
      return null;
    }
    const [year, month] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

}
