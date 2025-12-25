import { Component, OnInit, computed, inject, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { PortfolioService } from '../../services/portfolio.service';
import { ContactService } from '../../services/contact.service';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent implements OnInit {

  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  private seoService = inject(SeoService);
  public contactService = inject(ContactService);
  public portfolioService = inject(PortfolioService);

  contactForm: FormGroup;

  error = computed(() => this.contactService.error());
  success = computed(() => this.contactService.success());
  loading = computed(() => this.contactService.loading());
  personalInfo = computed(() => this.portfolioService.personalInfo());

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      subject: ['', [Validators.maxLength(200)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    });
  }

  ngOnInit(): void {
    this.seoService.setContactMetaTags();
    if (!this.portfolioService.hasDataLoaded && !this.portfolioService.loading()) {
      this.portfolioService.loadPersonalInfo().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => this.cdr.markForCheck(),
        error: () => this.cdr.markForCheck()
      });
    } else {
      this.cdr.markForCheck();
    }
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.contactService.submitContactForm(this.contactForm.value).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.contactForm.reset({
              name: '',
              email: '',
              subject: '',
              message: ''
            });
            Object.keys(this.contactForm.controls).forEach(key => {
              const control = this.contactForm.get(key);
              control?.markAsUntouched();
              control?.markAsPristine();
            });
            timer(3000).pipe(
              takeUntilDestroyed(this.destroyRef)
            ).subscribe(() => {
              this.contactService.resetFormState();
              this.cdr.markForCheck();
            });
            this.cdr.markForCheck();
          } else {
            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.cdr.markForCheck();
        }
      });
    } else {
      this.markFormGroupTouched(this.contactForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.contactForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors?.['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
      }
      if (field.errors?.['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} must not exceed ${maxLength} characters`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

}
