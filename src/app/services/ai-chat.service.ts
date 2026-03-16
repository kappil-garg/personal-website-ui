import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, timeout, TimeoutError, throwError } from 'rxjs';
import { EnvironmentService } from '../shared/services/environment.service';
import { ApiResponse } from '../models/api-response.interface';

export interface PortfolioChatRequest {
  message: string;
}

export interface PortfolioChatResponse {
  reply: string;
}

/** Thrown when the API returns 429 Too Many Requests. */
export class PortfolioChatRateLimitError extends Error {
  override name = 'PortfolioChatRateLimitError';
}

@Injectable({
  providedIn: 'root',
})
export class AiChatService {

  private readonly REQUEST_TIMEOUT_MS = 45_000;

  private readonly http = inject(HttpClient);
  private readonly environmentService = inject(EnvironmentService);

  private getChatUrl(): string {
    return this.environmentService.getApiUrl('/ai/chat');
  }

  sendMessage(message: string): Observable<PortfolioChatResponse | null> {
    const payload: PortfolioChatRequest = { message };
    return this.http
      .post<ApiResponse<PortfolioChatResponse>>(this.getChatUrl(), payload)
      .pipe(
        timeout(this.REQUEST_TIMEOUT_MS),
        map(response => response.data ?? null),
        catchError(err => {
          if (err instanceof HttpErrorResponse && err.status === 429) {
            this.environmentService.logWarn('Portfolio chat rate limited (429)');
            return throwError(() => new PortfolioChatRateLimitError('Too many requests. Please try again later.'));
          }
          if (err instanceof TimeoutError) {
            this.environmentService.logWarn('Portfolio chat request timed out after', this.REQUEST_TIMEOUT_MS, 'ms');
          } else {
            this.environmentService.logWarn('Error calling portfolio chat API:', err);
          }
          return of(null);
        }),
      );
  }

}
