import { Injectable, signal, effect, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private readonly isBrowser: boolean;
  private readonly storageKey = 'portfolio-theme';

  isInitializing = signal(true);
  currentTheme = signal<ThemeMode>('light');

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeTheme();
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  private initializeTheme(): void {
    if (!this.isBrowser) {
      this.currentTheme.set('light');
      this.isInitializing.set(false);
      return;
    }
    try {
      const stored = localStorage.getItem(this.storageKey) as ThemeMode;
      if (stored === 'light' || stored === 'dark') {
        this.currentTheme.set(stored);
      } else {
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)',
        ).matches;
        this.currentTheme.set(prefersDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.warn('Failed to initialize theme:', error);
      this.currentTheme.set('light');
    } finally {
      this.isInitializing.set(false);
    }
  }

  private applyTheme(theme: ThemeMode): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      document.documentElement.setAttribute('data-color-scheme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.storageKey, theme);
      this.updateMetaThemeColor(theme);
    } catch (error) {
      console.warn('Failed to apply theme:', error);
    }
  }

  private updateMetaThemeColor(theme: ThemeMode): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? '#1a1a1a' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  }

  /**
   * Toggles between light and dark themes
   * Used by the theme toggle button in navigation
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
  }

  /**
   * Programmatically sets a specific theme
   */
  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
  }

  /**
   * Returns the current theme mode
   */
  getTheme(): ThemeMode {
    return this.currentTheme();
  }

  /**
   * Watches for system theme changes and updates accordingly
   */
  watchSystemTheme(): void {
    if (!this.isBrowser) {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        this.currentTheme.set(e.matches ? 'dark' : 'light');
      }
    });
  }

}
