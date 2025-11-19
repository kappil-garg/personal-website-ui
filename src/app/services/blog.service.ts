import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, finalize, map } from 'rxjs';
import { Blog, BlogFilters } from '../models/blog.interface';
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

  private http = inject(HttpClient);
  private environmentService = inject(EnvironmentService);
  
  private blogsSignal = signal<Blog[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  private hasFetched = false;

  fetchBlogs(options: { forceRefresh?: boolean } = {}): Observable<Blog[]> {
    const shouldUseCache = !options.forceRefresh && this.hasFetched;
    if (shouldUseCache) {
      return of(this.blogsSignal());
    }
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Blog[]>>(`${this.API_BASE_URL}/published`).pipe(
      map(response => {
        const blogs = response.data || [];
        const uniqueBlogs = blogs.filter((blog, index, self) => 
          index === self.findIndex(b => b.slug === blog.slug)
        );
        this.blogsSignal.set(uniqueBlogs);
        this.errorSignal.set(null);
        this.hasFetched = true;
        return uniqueBlogs;
      }),
      catchError(error => {
        this.environmentService.warn('Error fetching blogs:', error);
        if (this.blogsSignal().length === 0) {
          this.errorSignal.set('Failed to load blogs. Please try again later.');
        } else {
          this.errorSignal.set(null);
        }
        return of(this.blogsSignal());
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

  getBlogBySlug(slug: string): Observable<Blog | null> {
    return this.http.get<ApiResponse<Blog>>(`${this.API_BASE_URL}/published/${slug}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.environmentService.warn('Error fetching blog:', error);
        return of(null);
      })
    );
  }

  incrementViewCount(blogId: string): Observable<Blog | null> {
    return this.http.post<ApiResponse<Blog>>(`${this.API_BASE_URL}/${blogId}/view`, {}).pipe(
      map(response => response.data),
      catchError(error => {
        this.environmentService.warn('Error incrementing view count:', error);
        return of(null);
      })
    );
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

  addBlogToList(blog: Blog): void {
    const currentBlogs = this.blogsSignal();
    const exists = currentBlogs.some(b => b.id === blog.id || b.slug === blog.slug);
    if (!exists) {
      if (currentBlogs.length < 5) {
        this.blogsSignal.set([...currentBlogs, blog]);
      }
    }
  }

}
