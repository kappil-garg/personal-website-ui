import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, catchError, finalize, map, timeout, TimeoutError } from 'rxjs';
import { Blog, BlogFilters, BlogDetailResult } from '../models/blog.interface';
import { ApiResponse } from '../models/api-response.interface';
import { APP_CONSTANTS, SortOption, SortOrder } from '../shared/constants/app.constants';
import { StringUtils } from '../shared/utils/string.utils';
import { environment } from '../../environments/environment';
import { EnvironmentService } from '../shared/services/environment.service';

@Injectable({
  providedIn: 'root',
})
export class BlogService {

  private readonly API_BASE_URL = `${environment.apiUrl}/blogs`;

  private readonly CACHE_TTL_MS = 5 * 60 * 1000;
  private readonly REQUEST_TIMEOUT_MS = 15 * 1000;

  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);
  
  private blogsSignal = signal<Blog[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  private hasFetched = false;
  private lastFetchedAt: number | null = null;

  fetchBlogs(options: { forceRefresh?: boolean } = {}): Observable<Blog[]> {
    const shouldUseCache = !options.forceRefresh && this.hasFetched && this.isCacheFresh();
    if (shouldUseCache) {
      return of(this.blogsSignal());
    }
    this.errorSignal.set(null);
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Blog[]>>(`${this.API_BASE_URL}/published`).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => {
        const blogs = response.data || [];
        const uniqueBlogs = blogs.filter((blog, index, self) => 
          index === self.findIndex(b => b.slug === blog.slug)
        );
        this.blogsSignal.set(uniqueBlogs);
        this.errorSignal.set(null);
        this.hasFetched = true;
        this.lastFetchedAt = Date.now();
        return uniqueBlogs;
      }),
      catchError(error => {
        if (error instanceof TimeoutError) {
          this.environmentService.warn('Blogs request timed out after', this.REQUEST_TIMEOUT_MS, 'ms');
          if (this.blogsSignal().length === 0) {
            this.errorSignal.set('Request timed out. Please check your connection and try again.');
          } else {
            this.errorSignal.set(null);
          }
        } else {
          this.environmentService.warn('Error fetching blogs:', error);
          if (this.blogsSignal().length === 0) {
            this.errorSignal.set('Failed to load blogs. Please try again later.');
          } else {
            this.errorSignal.set(null);
          }
        }
        return of(this.blogsSignal());
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

  getBlogBySlug(slug: string): Observable<BlogDetailResult> {
    return this.http.get<ApiResponse<Blog>>(`${this.API_BASE_URL}/published/${slug}`).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => ({ blog: response.data, error: null }) as BlogDetailResult),
      catchError((error: HttpErrorResponse | TimeoutError) => {
        if (error instanceof TimeoutError) {
          this.environmentService.warn('Blog detail request timed out after', this.REQUEST_TIMEOUT_MS, 'ms');
          return of({ blog: null, error: 'api_error' } as BlogDetailResult);
        }
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.environmentService.warn('Blog not found:', slug);
          return of({ blog: null, error: 'not_found' } as BlogDetailResult);
        }
        this.environmentService.warn('Error fetching blog:', error);
        return of({ blog: null, error: 'api_error' } as BlogDetailResult);
      })
    );
  }

  incrementViewCount(blogId: string): Observable<Blog | null> {
    return this.http.post<ApiResponse<Blog>>(`${this.API_BASE_URL}/${blogId}/view`, {}).pipe(
      map(response => {
        const updatedBlog = response.data;
        if (updatedBlog) {
          this.updateBlogInList(updatedBlog);
        }
        return updatedBlog;
      }),
      catchError(error => {
        this.environmentService.warn('Error incrementing view count:', error);
        return of(null);
      })
    );
  }

  private updateBlogInList(updatedBlog: Blog): void {
    const currentBlogs = this.blogsSignal();
    const index = currentBlogs.findIndex(b => b.id === updatedBlog.id || b.slug === updatedBlog.slug);
    if (index >= 0) {
      const updatedBlogs = [...currentBlogs];
      updatedBlogs[index] = { ...updatedBlogs[index], ...updatedBlog };
      this.blogsSignal.set(updatedBlogs);
    }
  }

  filterBlogs(blogs: Blog[], filters: BlogFilters): Blog[] {
    let filteredBlogs = [...blogs];
    if (filters.category) {
      filteredBlogs = filteredBlogs.filter(blog => blog.category === filters.category);
    }
    if (filters.search && filters.search.length >= APP_CONSTANTS.BLOG.SEARCH_MIN_LENGTH) {
      filteredBlogs = filteredBlogs.filter(blog => 
        StringUtils.contains(blog.title, filters.search!) ||
        (blog.excerpt && StringUtils.contains(blog.excerpt, filters.search!)) ||
        StringUtils.contains(blog.content, filters.search!)
      );
    }
    if (filters.sortBy) {
      const sortOrder = filters.sortOrder || APP_CONSTANTS.BLOG.SORT_ORDERS.DESC;
      filteredBlogs.sort((a, b) => this.compareBlogs(a, b, filters.sortBy as SortOption, sortOrder));
    }
    return filteredBlogs;
  }

  private compareBlogs(a: Blog, b: Blog, sortBy: SortOption, sortOrder: SortOrder): number {
    let aValue: number, bValue: number;
    switch (sortBy) {
      case APP_CONSTANTS.BLOG.SORT_OPTIONS.PUBLISHED_AT:
        aValue = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        bValue = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        break;
      case APP_CONSTANTS.BLOG.SORT_OPTIONS.VIEW_COUNT:
        aValue = a.viewCount;
        bValue = b.viewCount;
        break;
      case APP_CONSTANTS.BLOG.SORT_OPTIONS.READING_TIME:
        aValue = a.readingTime || APP_CONSTANTS.BLOG.DEFAULT_READING_TIME;
        bValue = b.readingTime || APP_CONSTANTS.BLOG.DEFAULT_READING_TIME;
        break;
      default:
        return 0;
    }
    return sortOrder === APP_CONSTANTS.BLOG.SORT_ORDERS.ASC 
      ? aValue - bValue 
      : bValue - aValue;
  }

  get blogs() {
    return this.blogsSignal.asReadonly();
  }

  get loading() {
    return this.loadingSignal.asReadonly();
  }

  get error() {
    return this.errorSignal.asReadonly();
  }

  get hasFullListLoaded(): boolean {
    return this.hasFetched;
  }

  addBlogToList(blog: Blog): void {
    const currentBlogs = this.blogsSignal();
    const index = currentBlogs.findIndex(b => b.id === blog.id || b.slug === blog.slug);
    if (index >= 0) {
      const updatedBlogs = [...currentBlogs];
      updatedBlogs[index] = { ...updatedBlogs[index], ...blog };
      this.blogsSignal.set(updatedBlogs);
      return;
    }
    const updatedBlogs = [...currentBlogs, blog].sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    });
    this.blogsSignal.set(updatedBlogs);
  }

  isCacheFresh(): boolean {
    if (!this.lastFetchedAt) {
      return false;
    }
    return Date.now() - this.lastFetchedAt < this.CACHE_TTL_MS;
  }

}
