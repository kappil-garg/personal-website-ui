import { Component, OnInit, signal,  computed, ChangeDetectionStrategy, inject, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import DOMPurify from 'dompurify';
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
  public blogService = inject(BlogService);
  private categoryConfigService = inject(CategoryConfigService);
  private seoService = inject(SeoService);
  private portfolioService = inject(PortfolioService);
  private sanitizer = inject(DomSanitizer);

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
  loading = computed(() => this.isLoadingBlogSignal() || this.blogService.loading());
  authorInfo = computed(() => this.portfolioService.personalInfo());

  /**
   * Sanitizes and returns blog content HTML for safe rendering.
   * Uses DOMPurify to sanitize HTML before rendering to prevent XSS attacks.
   */
  getSanitizedContent(): SafeHtml | null {
    const content = this.blog()?.content;
    if (!content) return null;
    const sanitized = typeof window !== 'undefined' 
      ? DOMPurify.sanitize(content) 
      : content;
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  constructor() {
    // Update SEO meta tags whenever blog changes
    effect(() => {
      const currentBlog = this.blog();
      if (currentBlog) {
        this.seoService.setBlogPostMetaTags(currentBlog);
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
    // Reset to default meta tags when leaving the page
    this.seoService.setDefaultMetaTags();
  }

  private loadBlog(slug: string): void {
    const existingBlog = this.blog();
    if (existingBlog) {
      this.incrementViewCount(existingBlog.id);
      // Set SEO meta tags for existing blog
      this.seoService.setBlogPostMetaTags(existingBlog);
      return;
    }
    this.isLoadingBlogSignal.set(true);
    this.currentBlogSignal.set(null);
    this.blogService.getBlogBySlug(slug).subscribe({
      next: (blog) => {
        this.isLoadingBlogSignal.set(false);
        if (blog) {
          this.currentBlogSignal.set(blog);
          this.blogService.addBlogToList(blog);
          this.incrementViewCount(blog.id);
          // Set SEO meta tags when blog is loaded
          this.seoService.setBlogPostMetaTags(blog);
        } else {
          this.currentBlogSignal.set(null);
          this.router.navigate(['/blogs']);
        }
      },
      error: () => {
        this.isLoadingBlogSignal.set(false);
        this.currentBlogSignal.set(null);
        this.router.navigate(['/blogs']);
      },
    });
  }

  private incrementViewCount(blogId: string): void {
    this.blogService.incrementViewCount(blogId).subscribe();
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
