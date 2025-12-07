import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, map, timeout, TimeoutError, of } from 'rxjs';
import { ContactForm, ContactResponse } from '../models/contact.interface';
import { ApiResponse } from '../models/api-response.interface';
import { environment } from '../../environments/environment';
import { EnvironmentService } from '../shared/services/environment.service';

@Injectable({
  providedIn: 'root',
})
export class ContactService {

  private readonly API_BASE_URL = `${environment.apiUrl}/contact`;

  private readonly REQUEST_TIMEOUT_MS = 15 * 1000;

  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);

  private successSignal = signal<boolean>(false);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  error = this.errorSignal.asReadonly();
  success = this.successSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();

  submitContactForm(formData: ContactForm): Observable<ContactResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.successSignal.set(false);
    return this.http.post<ApiResponse<ContactResponse>>(`${this.API_BASE_URL}`, formData).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => {
        this.successSignal.set(true);
        this.errorSignal.set(null);
        return response.data || { success: true, message: 'Message sent successfully!' };
      }),
      catchError(error => {
        if (error instanceof TimeoutError) {
          this.environmentService.warn('Contact form submission timed out after', this.REQUEST_TIMEOUT_MS, 'ms');
          this.errorSignal.set('Request timed out. Please check your connection and try again.');
        } else {
          this.environmentService.warn('Error submitting contact form:', error);
          const errorMessage = error.error?.message || error.message || 'Failed to send message. Please try again later.';
          this.errorSignal.set(errorMessage);
        }
        this.successSignal.set(false);
        return of({ success: false, message: this.errorSignal() || 'Failed to send message.' });
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

  resetFormState(): void {
    this.errorSignal.set(null);
    this.successSignal.set(false);
  }

}
