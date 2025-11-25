import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject, OnDestroy, DestroyRef, SecurityContext, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BlogService } from '../../services/blog.service';
import { CategoryConfigService } from '../../services/category-config.service';
import { Blog } from '../../models/blog.interface';
import { DateUtils } from '../../shared/utils/date.utils';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { SeoService } from '../../shared/services/seo.service';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetailComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  
  private seoService = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);
  private blogService = inject(BlogService);
  private portfolioService = inject(PortfolioService);
  private categoryConfigService = inject(CategoryConfigService);

  private currentBlogSignal = signal<Blog | null>(null);

  private destroy$ = new Subject<void>();

  blog = computed(() => this.currentBlogSignal());

  error = computed(() => this.blogService.error());
  authorInfo = computed(() => this.portfolioService.personalInfo());
  loading = computed(() => !this.currentBlogSignal() && this.blogService.loading());

  /**
   * Sanitizes and returns blog content HTML for safe rendering using Angular's SecurityContext.
   */
  getSanitizedContent(): SafeHtml | null {
    const content = this.blog()?.content;
    if (!content) return null;
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, content);
    return sanitized ? this.sanitizer.bypassSecurityTrustHtml(sanitized) : null;
  }

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const blog = data['blog'] as Blog | null;
      if (blog) {
        this.currentBlogSignal.set(blog);
        // Only increment view count on client-side to avoid double counting during SSR
        if (isPlatformBrowser(this.platformId)) {
          this.incrementViewCount(blog.id);
        }
        this.scrollToTop();
      } else {
        // Blog not found, redirect to blogs list
        this.router.navigate(['/blogs']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.seoService.setDefaultMetaTags();
  }

  private incrementViewCount(blogId: string): void {
    this.blogService.incrementViewCount(blogId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((updatedBlog) => {
      if (updatedBlog) {
        this.currentBlogSignal.set(updatedBlog);
      }
    });
  }

  private scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  formatDate(dateString: string): string {
    return DateUtils.formatDate(dateString);
  }

  getCategoryIcon(category: string): string {
    return this.categoryConfigService.getCategoryIcon(category);
  }

  getCategoryLabel(category: string): string {
    return this.categoryConfigService.getCategoryLabel(category);
  }

  goBack(): void {
    this.router.navigate(['/blogs']);
  }

  shareBlog(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const blog = this.blog();
    if (!blog) return;
    if (window.navigator?.share) {
      window.navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      }).catch(() => {
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }

  private copyToClipboard(): void {
    if (!isPlatformBrowser(this.platformId) || !window.navigator?.clipboard) return;
    window.navigator.clipboard.writeText(window.location.href).catch(() => {});
  }

}
