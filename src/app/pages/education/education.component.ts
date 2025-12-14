import { Component, OnInit, computed, inject, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EducationService } from '../../services/education.service';
import { CertificationService } from '../../services/certification.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { SeoService } from '../../shared/services/seo.service';
import { EnvironmentService } from '../../shared/services/environment.service';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private seoService = inject(SeoService);
  private environmentService = inject(EnvironmentService);
  public educationService = inject(EducationService);
  public certificationService = inject(CertificationService);

  // Tab state - default to 'degrees'
  activeTab = signal<'degrees' | 'certifications'>('degrees');

  educations = computed(() => this.educationService.educations());
  educationsLoading = computed(() => this.educationService.loading());
  educationsError = computed(() => this.educationService.error());

  certifications = computed(() => this.certificationService.certifications());
  certificationsLoading = computed(() => this.certificationService.loading());
  certificationsError = computed(() => this.certificationService.error());

  hasError = computed(() => this.educationsError() || this.certificationsError());
  isLoading = computed(
    () => (this.educationsLoading() || this.certificationsLoading()) && !this.hasError()
  );

  // Track failed image loads
  private failedEducationLogos = signal<Set<string>>(new Set());
  private failedCertificationLogos = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.seoService.setEducationMetaTags();
    if (!this.educationService.hasDataLoaded && !this.educationService.loading()) {
      this.loadEducations();
    } else {
      this.cdr.markForCheck();
    }
    if (!this.certificationService.hasDataLoaded && !this.certificationService.loading()) {
      this.loadCertifications();
    } else {
      this.cdr.markForCheck();
    }
  }

  private loadEducations(): void {
    this.educationService.fetchEducations().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.environmentService.warn('Failed to load educations:', error);
        this.cdr.markForCheck();
      }
    });
  }

  private loadCertifications(): void {
    this.certificationService.fetchCertifications().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.environmentService.warn('Failed to load certifications:', error);
        this.cdr.markForCheck();
      }
    });
  }

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

  retryLoadEducations(): void {
    this.educationService.fetchEducations({ forceRefresh: true }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  retryLoadCertifications(): void {
    this.certificationService.fetchCertifications({ forceRefresh: true }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  retryLoadAll(): void {
    this.educationService.fetchEducations({ forceRefresh: true }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
    this.certificationService.fetchCertifications({ forceRefresh: true }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  switchTab(tab: 'degrees' | 'certifications'): void {
    this.activeTab.set(tab);
  }

  getCertificationDate(issueDate?: string, expirationDate?: string, doesNotExpire?: boolean): string {
    if (!issueDate) return '';
    const [issueMonth, issueYear] = issueDate.split('-');
    const issueDateObj = new Date(parseInt(issueYear, 10), parseInt(issueMonth, 10) - 1, 1);
    const issueMonthFormatted = issueDateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (doesNotExpire) {
      return `Issued ${issueMonthFormatted} - No Expiration`;
    }
    if (expirationDate) {
      const [expMonth, expYear] = expirationDate.split('-');
      const expDateObj = new Date(parseInt(expYear, 10), parseInt(expMonth, 10) - 1, 1);
      const expMonthFormatted = expDateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return `${issueMonthFormatted} - ${expMonthFormatted}`;
    }
    return `Issued ${issueMonthFormatted}`;
  }

  getInstitutionInitial(institutionName: string): string {
    if (!institutionName) return '?';
    return institutionName.trim().charAt(0).toUpperCase();
  }

  getOrganizationInitial(organizationName: string): string {
    if (!organizationName) return '?';
    return organizationName.trim().charAt(0).toUpperCase();
  }

  onEducationLogoError(educationId: string, event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    this.failedEducationLogos.update(failed => new Set(failed).add(educationId));
    this.cdr.markForCheck();
  }

  onCertificationLogoError(certificationId: string, event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    this.failedCertificationLogos.update(failed => new Set(failed).add(certificationId));
    this.cdr.markForCheck();
  }

  hasEducationLogoFailed(educationId: string): boolean {
    return this.failedEducationLogos().has(educationId);
  }

  hasCertificationLogoFailed(certificationId: string): boolean {
    return this.failedCertificationLogos().has(certificationId);
  }

}
