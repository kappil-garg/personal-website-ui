import { Component, OnInit, WritableSignal, inject, PLATFORM_ID, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { NavigationComponent } from './shared/navigation/navigation.component';
import { FooterComponent } from './shared/footer/footer.component';
import { PortfolioChatWidgetComponent } from './shared/components/portfolio-chat-widget/portfolio-chat-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, FooterComponent, PortfolioChatWidgetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  isBlogDetailRoute: WritableSignal<boolean> = signal(false);
  isProjectDetailRoute: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event) => {
          window.scrollTo(0, 0);
          const navEnd = event as NavigationEnd;
          const url = navEnd.urlAfterRedirects || navEnd.url;
          const path = url.split('?')[0];
          this.isBlogDetailRoute.set(path.startsWith('/blogs/'));
          this.isProjectDetailRoute.set(/^\/projects\/[^/]+$/.test(path));
        });
      // Initialize route flag for first load
      const currentUrl = this.router.url.split('?')[0];
      this.isBlogDetailRoute.set(currentUrl.startsWith('/blogs/'));
      this.isProjectDetailRoute.set(/^\/projects\/[^/]+$/.test(currentUrl));
    }
  }
  
}
