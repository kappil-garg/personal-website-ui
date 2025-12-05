import { Component, OnInit, computed, inject, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExperienceService } from '../../services/experience.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { SeoService } from '../../shared/services/seo.service';
import { EnvironmentService } from '../../shared/services/environment.service';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private seoService = inject(SeoService);
  private environmentService = inject(EnvironmentService);
  public experienceService = inject(ExperienceService);

  experiences = computed(() => this.experienceService.experiences());
  loading = computed(() => this.experienceService.loading());
  error = computed(() => this.experienceService.error());

  ngOnInit(): void {
    this.seoService.setExperienceMetaTags();
    if (!this.experienceService.hasDataLoaded && !this.experienceService.loading()) {
      this.loadExperiences();
    } else {
      this.cdr.markForCheck();
    }
  }

  private loadExperiences(): void {
    this.experienceService.fetchExperiences().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.environmentService.warn('Failed to load experiences:', error);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Formats and returns the duration string for an experience entry.
   * Expects dates in MM-YYYY format (e.g., "12-2025" for December 2025).
   * 
   * @param startDate - Start date in MM-YYYY format
   * @param endDate - Optional end date in MM-YYYY format
   * @param isCurrent - Whether this is the current position
   * @returns Formatted duration string (e.g., "Dec 2025 - Present" or "Dec 2024 - Dec 2025")
   */
  getDuration(startDate: string, endDate?: string, isCurrent?: boolean): string {
    const [startMonth, startYear] = startDate.split('-');
    const startDateObj = new Date(parseInt(startYear, 10), parseInt(startMonth, 10) - 1, 1);
    const startMonthFormatted = startDateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (isCurrent) {
      return `${startMonthFormatted} - Present`;
    }
    if (endDate) {
      const [endMonth, endYear] = endDate.split('-');
      const endDateObj = new Date(parseInt(endYear, 10), parseInt(endMonth, 10) - 1, 1);
      const endMonthFormatted = endDateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return `${startMonthFormatted} - ${endMonthFormatted}`;
    }
    return startMonthFormatted;
  }

  retryLoadExperiences(): void {
    this.experienceService.fetchExperiences({ forceRefresh: true }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  getCompanyInitial(companyName: string): string {
    if (!companyName) return '?';
    return companyName.trim().charAt(0).toUpperCase();
  }

}
