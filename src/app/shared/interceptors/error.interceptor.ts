import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EnvironmentService } from '../services/environment.service';

type HttpEventType = HttpEvent<unknown>;
type HttpRequestType = HttpRequest<unknown>;

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private environmentService: EnvironmentService) {}

  intercept(req: HttpRequestType, next: HttpHandler): Observable<HttpEventType> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorCode;
        let errorMessage;
        // Handle different types of HTTP errors
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client Error: ${error.error.message}`;
          errorCode = 'CLIENT_ERROR';
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = 'Bad Request - Please check your input';
              errorCode = 'BAD_REQUEST';
              break;
            case 401:
              errorMessage = 'Unauthorized - Please log in';
              errorCode = 'UNAUTHORIZED';
              break;
            case 403:
              errorMessage = 'Forbidden - Access denied';
              errorCode = 'FORBIDDEN';
              break;
            case 404:
              errorMessage = 'Resource not found';
              errorCode = 'NOT_FOUND';
              break;
            case 422:
              errorMessage = 'Validation Error - Please check your input';
              errorCode = 'VALIDATION_ERROR';
              break;
            case 429:
              errorMessage = 'Too Many Requests - Please try again later';
              errorCode = 'RATE_LIMITED';
              break;
            case 500:
              errorMessage = 'Internal Server Error - Please try again later';
              errorCode = 'SERVER_ERROR';
              break;
            case 502:
              errorMessage = 'Bad Gateway - Service temporarily unavailable';
              errorCode = 'BAD_GATEWAY';
              break;
            case 503:
              errorMessage = 'Service Unavailable - Please try again later';
              errorCode = 'SERVICE_UNAVAILABLE';
              break;
            case 504:
              errorMessage = 'Gateway Timeout - Please try again later';
              errorCode = 'GATEWAY_TIMEOUT';
              break;
            default:
              errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
              errorCode = 'HTTP_ERROR';
          }
        }
        // Log error in development mode
        this.environmentService.warn('HTTP Error Interceptor:', {
          url: req.url,
          method: req.method,
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: errorMessage,
          code: errorCode
        });
        // Create a standardized error response
        const standardizedError = {
          message: errorMessage,
          code: errorCode,
          status: error.status,
          url: req.url,
          timestamp: new Date().toISOString(),
          originalError: this.environmentService.isDebugModeEnabled ? error : undefined
        };
        return throwError(() => standardizedError);
      })
    );
  }

}
