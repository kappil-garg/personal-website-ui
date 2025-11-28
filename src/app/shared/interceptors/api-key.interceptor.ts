import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { environment } from '../../../environments/environment';

/**
 * Interceptor to add API key header for server-side requests (SSR).
 * Only adds the header for requests to the configured API endpoints.
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {

  const platformId = inject(PLATFORM_ID);

  if (!isPlatformServer(platformId)) {
    return next(req);
  }

  const requestUrl = req.url;
  const apiBaseUrl = environment.apiUrl;

  const normalizedApiUrl = apiBaseUrl.endsWith('/')
    ? apiBaseUrl.slice(0, -1)
    : apiBaseUrl;
  const normalizedRequestUrl = requestUrl.endsWith('/')
    ? requestUrl.slice(0, -1)
    : requestUrl;

  const isApiRequest = normalizedRequestUrl.startsWith(normalizedApiUrl);

  if (!isApiRequest) {
    return next(req);
  }

  const apiKey =
    typeof process !== 'undefined'
      ? process.env?.['API_SERVER_KEY']
      : undefined;

  if (apiKey) {
    req = req.clone({
      setHeaders: {
        'X-API-Key': apiKey,
      },
    });
  }

  return next(req);

};
