import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject, OnDestroy, DestroyRef, SecurityContext, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil, Observable, map, Subscription, catchError, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { marked } from 'marked';
import { BlogService } from '../../services/blog.service';
import { CategoryConfigService } from '../../services/category-config.service';
import { Blog } from '../../models/blog.interface';
import { DateUtils } from '../../shared/utils/date.utils';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { SeoService } from '../../shared/services/seo.service';
import { PortfolioService } from '../../services/portfolio.service';
import { BlogDetailResult } from '../../models/blog.interface';
import { EnvironmentService } from '../../shared/services/environment.service';

const CHATHEAD_ICON = 'assets/icons/owl-icon.png';

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
  private environmentService = inject(EnvironmentService);

  private apiErrorSignal = signal<boolean>(false);
  private currentBlogSignal = signal<Blog | null>(null);

  private askQuestionInput = signal('');
  private askAnswerSignal = signal<string | null>(null);
  private askLoadingSignal = signal(false);
  private askErrorSignal = signal<string | null>(null);
  private chatheadOpen = signal(false);
  private showChathead = signal(false);

  private destroy$ = new Subject<void>();
  private askSubscription: Subscription | null = null;

  readonly chatheadIconPath = CHATHEAD_ICON;
  blog = computed(() => this.currentBlogSignal());
  askQuestionInputReadonly = this.askQuestionInput.asReadonly();
  askAnswer = this.askAnswerSignal.asReadonly();
  askLoading = this.askLoadingSignal.asReadonly();
  askError = this.askErrorSignal.asReadonly();
  chatheadOpenReadonly = this.chatheadOpen.asReadonly();
  showChatheadReadonly = this.showChathead.asReadonly();
  hasApiError = computed(() => this.apiErrorSignal());
  authorInfo = computed(() => this.portfolioService.personalInfo());

  loading = computed(
    () =>
      !this.currentBlogSignal() &&
      !this.apiErrorSignal() &&
      this.blogService.loading(),
  );
  
  error = computed(() =>
    this.apiErrorSignal()
      ? 'Failed to load blog. Please try again.'
      : this.blogService.error(),
  );

  /**
   * Sanitizes and returns blog content HTML for safe rendering using Angular's SecurityContext.
   */
  getSanitizedContent(): SafeHtml | null {
    const content = this.blog()?.content;
    if (!content) return null;
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, content);
    return sanitized ? this.sanitizer.bypassSecurityTrustHtml(sanitized) : null;
  }

  /**
   * Converts markdown answer text into sanitized HTML for rendering in the chathead.
   */
  getAskAnswerHtml(): SafeHtml | null {
    const answer = this.askAnswerSignal();
    if (!answer) return null;
    const rawHtml = marked.parse(answer);
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, rawHtml);
    return sanitized ? this.sanitizer.bypassSecurityTrustHtml(sanitized) : null;
  }

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const result = data['blog'] as BlogDetailResult | undefined;
      if (!result) {
        this.apiErrorSignal.set(true);
        this.currentBlogSignal.set(null);
        this.environmentService.warn('BlogDetail: Route resolver data missing - routing configuration issue');
        return;
      }
      if (result.blog) {
        this.currentBlogSignal.set(result.blog);
        this.apiErrorSignal.set(false);
        this.showChathead.set(true);
        if (isPlatformBrowser(this.platformId)) {
          this.incrementViewCount(result.blog.id);
        }
        this.scrollToTop();
      } else if (result.error === 'not_found') {
        this.router.navigate(['/blogs']);
      } else if (result.error === 'api_error') {
        this.apiErrorSignal.set(true);
        this.currentBlogSignal.set(null);
        this.scrollToTop();
      } else {
        this.environmentService.warn('BlogDetail: Unexpected resolver state - blog and error both null');
        this.router.navigate(['/blogs']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.askSubscription) {
      this.askSubscription.unsubscribe();
      this.askSubscription = null;
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private incrementViewCount(blogId: string): void {
    this.blogService
      .incrementViewCount(blogId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updatedBlog) => {
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

  retryLoadBlog(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.router.navigate(['/blogs']);
      return;
    }
    this.apiErrorSignal.set(false);
    this.blogService
      .getBlogBySlug(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.blog) {
            this.currentBlogSignal.set(result.blog);
            this.apiErrorSignal.set(false);
            this.showChathead.set(true);
            this.blogService.addBlogToList(result.blog);
            this.seoService.setBlogPostMetaTags(result.blog);
            if (isPlatformBrowser(this.platformId)) {
              this.incrementViewCount(result.blog.id);
            }
          } else if (result.error === 'not_found') {
            this.router.navigate(['/blogs']);
          } else {
            this.seoService.setBlogSlugFallbackMetaTags(slug);
            this.apiErrorSignal.set(true);
          }
        },
        error: () => {
          this.seoService.setBlogSlugFallbackMetaTags(slug);
          this.apiErrorSignal.set(true);
        },
      });
  }

  shareBlog(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const blog = this.blog();
    if (!blog) return;
    if (window.navigator?.share) {
      window.navigator
        .share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        })
        .catch(() => {
          this.copyToClipboard();
        });
    } else {
      this.copyToClipboard();
    }
  }

  private copyToClipboard(): void {
    if (!isPlatformBrowser(this.platformId) || !window.navigator?.clipboard)
      return;
    window.navigator.clipboard.writeText(window.location.href).catch(() => {});
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.chatheadOpen()) {
      this.closeChatheadPanel();
    }
  }

  toggleChatheadPanel(): void {
    this.chatheadOpen.update(v => !v);
    if (!this.chatheadOpen()) {
      if (this.askSubscription) {
        this.askSubscription.unsubscribe();
        this.askSubscription = null;
      }
      this.askLoadingSignal.set(false);
      this.askAnswerSignal.set(null);
      this.askErrorSignal.set(null);
    }
  }

  closeChatheadPanel(): void {
    this.chatheadOpen.set(false);
  }

  submitAskQuestion(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    const question = this.askQuestionInput().trim();
    if (!slug || !question) return;
    if (this.askSubscription) {
      this.askSubscription.unsubscribe();
      this.askSubscription = null;
    }
    this.askErrorSignal.set(null);
    this.askAnswerSignal.set(null);
    this.askLoadingSignal.set(true);
    const supportsSse = typeof window !== 'undefined' && 'EventSource' in window;
    let ask$: Observable<string | null>;
    if (supportsSse) {
      const stream$ = this.blogService.askAboutBlogStream(slug, question);
      ask$ = stream$.pipe(
        catchError(() =>
          this.blogService.askAboutBlog(slug, question).pipe(
            map(response => response?.answer ?? null),
          ),
        ),
      );
    } else {
      ask$ = this.blogService.askAboutBlog(slug, question).pipe(
        map(response => response?.answer ?? null),
      );
    }
    this.askSubscription = ask$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.askLoadingSignal.set(false);
          this.askSubscription = null;
        }),
      )
      .subscribe({
        next: (answer: string | null) => {
          if (answer && answer.length > 0) {
            this.askAnswerSignal.set(answer);
          } else {
            this.askErrorSignal.set('Could not get an answer. Please try again.');
          }
        },
        error: () => {
          this.askErrorSignal.set('Something went wrong. Please try again.');
        },
      });
  }

  setAskQuestionInput(value: string): void {
    this.askQuestionInput.set(value);
  }

}
