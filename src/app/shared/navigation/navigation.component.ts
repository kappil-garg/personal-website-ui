import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NAVIGATION_ITEMS, NavigationItem } from '../../data/navigation.data';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {

  private router = inject(Router);
  private themeService = inject(ThemeService);

  currentRoute = signal('');
  isMobileMenuOpen = signal(false);
  navigationItems = signal<NavigationItem[]>(NAVIGATION_ITEMS);

  currentTheme = computed(() => this.themeService.currentTheme());

  constructor() {
    this.setupRouteTracking();
  }

  private setupRouteTracking(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentRoute.set(this.router.url);
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(open => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

}
