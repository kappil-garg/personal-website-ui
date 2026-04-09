import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, timeout, TimeoutError, throwError } from 'rxjs';
import { EnvironmentService } from '../shared/services/environment.service';
import { ApiResponse } from '../models/api-response.interface';

export interface PortfolioChatSource {
  type: string;
  sourceId: string;
  title: string;
  slug?: string | null;
  snippet?: string | null;
}

export interface PortfolioChatRequest {
  message: string;
  projectId?: string | null;
}

export interface PortfolioChatResponse {
  reply: string;
  sources?: PortfolioChatSource[];
}

/** Thrown when the API returns 429 Too Many Requests. */
export class PortfolioChatRateLimitError extends Error {
  override name = 'PortfolioChatRateLimitError';
  constructor(message: string, public readonly retryAfterSeconds?: number) {
    super(message);
  }
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

  private rateLimitFromError(err: unknown): { retryAfterSeconds?: number } | null {
    if (err instanceof HttpErrorResponse && err.status === 429) {
      const retryAfterHeader = err.headers?.get('Retry-After');
      const parsed = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;
      const retryAfterSeconds = isNaN(parsed) ? undefined : parsed;
      return { retryAfterSeconds };
    }
    if (typeof err === 'object' && err !== null) {
      const o = err as { code?: string; status?: number; retryAfterSeconds?: number };
      if (o.code === 'RATE_LIMITED' || o.status === 429) {
        return { retryAfterSeconds: o.retryAfterSeconds };
      }
    }
    return null;
  }

  sendMessage(message: string, projectId?: string | null): Observable<PortfolioChatResponse | null> {
    const payload: PortfolioChatRequest = { message, projectId };
    return this.http
      .post<ApiResponse<PortfolioChatResponse>>(this.getChatUrl(), payload)
      .pipe(
        timeout(this.REQUEST_TIMEOUT_MS),
        map(response => response.data ?? null),
        catchError(err => {
          const rateLimit = this.rateLimitFromError(err);
          if (rateLimit) {
            this.environmentService.logWarn('Portfolio chat rate limited (429)');
            return throwError(
              () => new PortfolioChatRateLimitError('Too many requests. Please try again later.', rateLimit.retryAfterSeconds),
            );
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
