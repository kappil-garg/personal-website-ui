import { Component, OnInit, computed, inject, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CertificationService } from '../../services/certification.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { SeoService } from '../../shared/services/seo.service';
import { EnvironmentService } from '../../shared/services/environment.service';
import { Certification } from '../../models/certification.interface';

@Component({
  selector: 'app-certifications',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './certifications.component.html',
  styleUrl: './certifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificationsComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private seoService = inject(SeoService);
  private environmentService = inject(EnvironmentService);
  public certificationService = inject(CertificationService);

  certifications = computed(() => this.certificationService.certifications());
  loading = computed(() => this.certificationService.loading());
  error = computed(() => this.certificationService.error());
  hasError = computed(() => !!this.certificationService.error());
  isLoading = computed(() => this.certificationService.loading() && !this.hasError());

  // Track failed image loads
  private failedCertificationLogos = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.seoService.setCertificationsMetaTags();
    if (!this.certificationService.hasDataLoaded && !this.certificationService.loading()) {
      this.loadCertifications();
    } else {
      this.cdr.markForCheck();
    }
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

  retryLoadCertifications(): void {
    this.certificationService.fetchCertifications({ forceRefresh: true }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  getOrganizationInitial(organizationName: string): string {
    if (!organizationName) return '?';
    return organizationName.trim().charAt(0).toUpperCase();
  }

  getCertificationKey(certification: Partial<Certification>): string {
    if (certification.id) return certification.id;
    const org = certification.issuingOrganization?.trim() || 'organization';
    const name = certification.certificationName?.trim() || 'certification';
    return `${org}-${name}`.toLowerCase().replace(/\s+/g, '-');
  }

  onCertificationLogoError(certification: Partial<Certification>, event: Event): void {
    const key = this.getCertificationKey(certification);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    this.failedCertificationLogos.update(failed => new Set(failed).add(key));
    this.cdr.markForCheck();
  }

  hasCertificationLogoFailed(certification: Partial<Certification>): boolean {
    const key = this.getCertificationKey(certification);
    return this.failedCertificationLogos().has(key);
  }

}
