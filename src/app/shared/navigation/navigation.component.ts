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
  isScrolled = signal(false);
  navigationItems = signal<NavigationItem[]>(
    [...NAVIGATION_ITEMS].sort((a, b) => a.order - b.order)
  );

  constructor() {
    this.setupRouteTracking();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  onBackdropKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.closeMobileMenu();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const scrollY = window.scrollY;
    this.isScrolled.set(scrollY > 10);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (window.innerWidth >= 1024 && this.isMobileMenuOpen()) {
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
        if (this.isMobileMenuOpen()) {
          this.closeMobileMenu();
        }
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
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      return;
    }
    this.isMobileMenuOpen.set(true);
    this.updateBodyScroll();
  }

  closeMobileMenu(): void {
    if (!this.isMobileMenuOpen()) {
      return;
    }
    this.isMobileMenuOpen.set(false);
    this.updateBodyScroll();
  }

  private updateBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const body = document.body;
    if (this.isMobileMenuOpen()) {
      const scrollY = window.scrollY;
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.top = `-${scrollY}px`;
      body.setAttribute('data-scroll-y', scrollY.toString());
    } else {
      this.restoreBodyScroll();
    }
  }

  private restoreBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const body = document.body;
    const scrollY = body.getAttribute('data-scroll-y');
    body.style.overflow = '';
    body.style.position = '';
    body.style.width = '';
    body.style.top = '';
    body.removeAttribute('data-scroll-y');
    if (scrollY) {
      const scrollPosition = parseInt(scrollY, 10);
      if (!isNaN(scrollPosition) && scrollPosition >= 0) {
        window.scrollTo(0, scrollPosition);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (isPlatformBrowser(this.platformId) && this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
      this.restoreBodyScroll();
    }
  }

}
