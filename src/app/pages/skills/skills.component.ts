import { Component, OnInit, computed, inject, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkillService } from '../../services/skill.service';
import { SkillCategoryConfigService } from '../../services/skill-category-config.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { SeoService } from '../../shared/services/seo.service';
import { EnvironmentService } from '../../shared/services/environment.service';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private seoService = inject(SeoService);
  private environmentService = inject(EnvironmentService);
  private skillCategoryConfigService = inject(SkillCategoryConfigService);
  public skillService = inject(SkillService);

  skills = computed(() => this.skillService.skills());
  error = computed(() => this.skillService.error());
  hasError = computed(() => !!this.skillService.error());
  loading = computed(() => this.skillService.loading() && !this.hasError());

  ngOnInit(): void {
    this.seoService.setSkillsMetaTags();
    if (!this.skillService.hasDataLoaded && !this.skillService.loading()) {
      this.loadSkills();
    } else {
      this.cdr.markForCheck();
    }
  }

  private loadSkills(): void {
    this.skillService.fetchSkills().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.environmentService.warn('Failed to load skills:', error);
        this.cdr.markForCheck();
      }
    });
  }

  retryLoadSkills(): void {
    this.skillService.fetchSkills({ forceRefresh: true }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  getCategoryIcon(categoryName: string): string {
    return this.skillCategoryConfigService.getCategoryIcon(categoryName);
  }

}
