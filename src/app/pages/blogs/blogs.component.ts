import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { BlogService } from '../../services/blog.service';
import { CategoryConfigService } from '../../services/category-config.service';
import { BlogCategory, BlogFilters } from '../../models/blog.interface';
import { APP_CONSTANTS, SortOption, SortOrder } from '../../shared/constants/app.constants';
import { DateUtils } from '../../shared/utils/date.utils';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EnvironmentService } from '../../shared/services/environment.service';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogsComponent implements OnInit, OnDestroy {
  
  private cdr = inject(ChangeDetectorRef);
  public blogService = inject(BlogService);
  private environmentService = inject(EnvironmentService);
  private categoryConfigService = inject(CategoryConfigService);
  private seoService = inject(SeoService);

  private searchTermSignal = signal<string>('');

  private sortOrderSignal = signal<SortOrder>(
    APP_CONSTANTS.BLOG.SORT_ORDERS.DESC,
  );
  
  private sortBySignal = signal<SortOption>(
    APP_CONSTANTS.BLOG.SORT_OPTIONS.PUBLISHED_AT,
  );
  
  private selectedCategorySignal = signal<BlogCategory | 'ALL'>(
    APP_CONSTANTS.CATEGORIES.ALL,
  );

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  filteredBlogs = computed(() => {
    const blogs = this.blogService.blogs();
    const filters: BlogFilters = {
      category:
        this.selectedCategorySignal() !== APP_CONSTANTS.CATEGORIES.ALL
          ? (this.selectedCategorySignal() as BlogCategory)
          : undefined,
      search: this.searchTermSignal(),
      sortBy: this.sortBySignal(),
      sortOrder: this.sortOrderSignal(),
    };
    const filtered = this.blogService.filterBlogs(blogs, filters);
    return filtered;
  });

  categories = computed(() => {
    const blogs = this.blogService.blogs();
    const categoryCounts = blogs.reduce(
      (acc, blog) => {
        const category = blog.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return this.categoryConfigService.getAllCategoryConfigs().map((config) => ({
      ...config,
      count:
        config.key === APP_CONSTANTS.CATEGORIES.ALL
          ? blogs.length
          : categoryCounts[config.key] || 0,
    }));
  });

  sortBy = computed(() => this.sortBySignal());
  error = computed(() => this.blogService.error());
  sortOrder = computed(() => this.sortOrderSignal());
  searchTerm = computed(() => this.searchTermSignal());
  loading = computed(() => this.blogService.loading());
  selectedCategory = computed(() => this.selectedCategorySignal());

  ngOnInit(): void {
    this.seoService.setBlogsListingMetaTags();
    this.loadBlogs();
    this.searchSubject
      .pipe(
        debounceTime(APP_CONSTANTS.UI.DEBOUNCE_TIME),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((searchTerm) => {
        this.searchTermSignal.set(searchTerm);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBlogs(): void {
    // Always fetch all blogs to maintain accurate category counts
    this.blogService.fetchBlogs().subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.environmentService.warn('Failed to load blogs:', error);
        this.cdr.markForCheck();
      }
    });
  }

  onCategoryClick(categoryKey: string): void {
    this.selectedCategorySignal.set(
      categoryKey as BlogCategory | typeof APP_CONSTANTS.CATEGORIES.ALL,
    );
    this.loadBlogs();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onSortByChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateSortBy(target.value as SortOption);
  }

  updateSortBy(sortBy: SortOption): void {
    this.sortBySignal.set(sortBy);
  }

  updateSortOrder(order: SortOrder): void {
    this.sortOrderSignal.set(order);
  }

  clearFilters(): void {
    this.selectedCategorySignal.set(APP_CONSTANTS.CATEGORIES.ALL);
    this.searchTermSignal.set('');
    this.sortBySignal.set(APP_CONSTANTS.BLOG.SORT_OPTIONS.PUBLISHED_AT);
    this.sortOrderSignal.set(APP_CONSTANTS.BLOG.SORT_ORDERS.DESC);
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

  retryFetchBlogs(): void {
    this.blogService.fetchBlogs().subscribe();
  }

  onKeyDown(event: KeyboardEvent, action: () => void): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }
  
}
