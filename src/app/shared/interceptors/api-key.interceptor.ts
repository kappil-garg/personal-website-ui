import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';

/**
 * Interceptor to add API key header for server-side requests (SSR).
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    const apiKey = typeof process !== 'undefined' 
      ? process.env?.['API_SERVER_KEY'] 
      : undefined;    
    if (apiKey) {
      req = req.clone({
        setHeaders: {
          'X-API-Key': apiKey
        }
      });
    }
  }
  return next(req);
};
