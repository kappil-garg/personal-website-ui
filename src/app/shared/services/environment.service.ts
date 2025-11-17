import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface Environment {
  production: boolean;
  apiUrl: string;
  appName: string;
  version: string;
  features: {
    enableAnalytics: boolean;
    enableDebugMode: boolean;
    enableServiceWorker: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  private readonly environment: Environment = environment;

  constructor() {
    // Environment values are hardcoded, no validation needed
  }

  get isProduction(): boolean {
    return this.environment.production;
  }

  get isDevelopment(): boolean {
    return !this.environment.production;
  }

  get apiUrl(): string {
    return this.environment.apiUrl;
  }

  get appName(): string {
    return this.environment.appName;
  }

  get version(): string {
    return this.environment.version;
  }

  get features(): Environment['features'] {
    return this.environment.features;
  }

  get isAnalyticsEnabled(): boolean {
    return this.environment.features.enableAnalytics;
  }

  get isDebugModeEnabled(): boolean {
    return this.environment.features.enableDebugMode;
  }

  get isServiceWorkerEnabled(): boolean {
    return this.environment.features.enableServiceWorker;
  }

  /**
   * Get the full API URL for a specific endpoint
   */
  getApiUrl(endpoint: string): string {
    const baseUrl = this.apiUrl.endsWith('/') ? this.apiUrl.slice(0, -1) : this.apiUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }

  /**
   * Log debug information only in development mode
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.isDebugModeEnabled) {
      console.log(`[${this.appName}] ${message}`, ...args);
    }
  }

  /**
   * Log warnings in development mode
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.isDebugModeEnabled) {
      console.warn(`[${this.appName}] ${message}`, ...args);
    }
  }
  
}
