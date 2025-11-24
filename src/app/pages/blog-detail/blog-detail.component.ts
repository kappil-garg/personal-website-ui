import { Component, OnInit, signal,  computed, ChangeDetectionStrategy, inject, OnDestroy, effect, DestroyRef, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, finalize, takeUntil } from 'rxjs';
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
  private sanitizer = inject(DomSanitizer);
  private blogService = inject(BlogService);
  private portfolioService = inject(PortfolioService);
  private categoryConfigService = inject(CategoryConfigService);

  private blogSlug = signal<string>('');
  private isLoadingBlogSignal = signal<boolean>(false);
  private currentBlogSignal = signal<Blog | null>(null);

  private destroy$ = new Subject<void>();

  blog = computed(() => {
    const directBlog = this.currentBlogSignal();
    if (directBlog) return directBlog;
    const slug = this.blogSlug();
    if (!slug) return null;
    const blogs = this.blogService.blogs();
    return blogs.find((blog) => blog.slug === slug) || null;
  });

  error = computed(() => this.blogService.error());
  authorInfo = computed(() => this.portfolioService.personalInfo());
  loading = computed(() => this.isLoadingBlogSignal() || this.blogService.loading());

  /**
   * Sanitizes and returns blog content HTML for safe rendering using Angular's SecurityContext.
   */
  getSanitizedContent(): SafeHtml | null {
    const content = this.blog()?.content;
    if (!content) return null;
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, content);
    return sanitized ? this.sanitizer.bypassSecurityTrustHtml(sanitized) : null;
  }

  constructor() {
    effect(() => {
      const currentBlog = this.blog();
      if (currentBlog) {
        this.seoService.setBlogPostMetaTags(currentBlog);
        this.scrollToTop();
      }
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.blogSlug.set(slug);
        this.loadBlog(slug);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.seoService.setDefaultMetaTags();
  }

  private loadBlog(slug: string): void {
    const existingBlog = this.blog();
    if (existingBlog) {
      this.incrementViewCount(existingBlog.id);
      return;
    }
    this.isLoadingBlogSignal.set(true);
    this.currentBlogSignal.set(null);
    this.blogService.getBlogBySlug(slug).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoadingBlogSignal.set(false))
    ).subscribe({
      next: (blog) => {
        if (blog) {
          this.currentBlogSignal.set(blog);
          this.blogService.addBlogToList(blog);
          this.incrementViewCount(blog.id);
        } else {
          this.currentBlogSignal.set(null);
          this.router.navigate(['/blogs']);
        }
      },
      error: () => {
        this.currentBlogSignal.set(null);
        this.router.navigate(['/blogs']);
      },
    });
  }

  private incrementViewCount(blogId: string): void {
    this.blogService.incrementViewCount(blogId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private scrollToTop(): void {
    if (typeof window === 'undefined') {
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
    if (typeof window === 'undefined') return;
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
    if (typeof window === 'undefined' || !window.navigator?.clipboard) return;
    window.navigator.clipboard.writeText(window.location.href).catch(() => {});
  }

}
