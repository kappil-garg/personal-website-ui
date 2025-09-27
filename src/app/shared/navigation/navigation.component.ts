import { Component, signal, inject, OnDestroy, HostListener, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NAVIGATION_ITEMS, NavigationItem } from '../../data/navigation.data';
import { IconService } from '../../services/icon.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent implements OnDestroy {

  private router = inject(Router);
  private iconService = inject(IconService);
  private platformId = inject(PLATFORM_ID);

  private destroy$ = new Subject<void>();

  themeService = inject(ThemeService);

  currentRoute = signal('');
  isMobileMenuOpen = signal(false);
  navigationItems = signal<NavigationItem[]>(NAVIGATION_ITEMS);

  constructor() {
    this.setupRouteTracking();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  private setupRouteTracking(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.currentRoute.set(this.router.url);
      });
  }

  isCurrentRoute(route: string): boolean {
    return this.currentRoute() === route;
  }

  getIconClass(id: string): string {
    return this.iconService.getIconClass(id);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
    this.updateBodyScroll();
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    this.updateBodyScroll();
  }

  private updateBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const body = document.body;
    if (this.isMobileMenuOpen()) {
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = body.style.top;
      body.style.overflow = '';
      body.style.position = '';
      body.style.width = '';
      body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (isPlatformBrowser(this.platformId) && this.isMobileMenuOpen()) {
      const body = document.body;
      body.style.overflow = '';
      body.style.position = '';
      body.style.width = '';
      body.style.top = '';
    }
  }

}
