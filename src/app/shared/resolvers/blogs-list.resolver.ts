import { inject, PLATFORM_ID } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Blog } from '../../models/blog.interface';
import { BlogService } from '../../services/blog.service';
import { SeoService } from '../services/seo.service';

export const blogsListResolver: ResolveFn<Blog[]> = () => {

  const seoService = inject(SeoService);
  const platformId = inject(PLATFORM_ID);
  const blogService = inject(BlogService);
  const isServer = isPlatformServer(platformId);
  
  // If data is already loaded and cache is fresh, return it immediately
  seoService.setBlogsListingMetaTags();
  if (blogService.hasFullListLoaded && blogService.isCacheFresh()) {
    return of(blogService.blogs());
  }

  // For SSR: Block and wait for data to ensure proper server-side rendering
  if (isServer) {
    return blogService.fetchBlogs().pipe(
      catchError(() => {
        return of([]);
      })
    );
  }
  
  // If data is already loaded, return it immediately
  if (blogService.hasFullListLoaded) {
    return of(blogService.blogs());
  }
  
  // No data at all, return empty array, component will handle loading
  return of([]);

};
