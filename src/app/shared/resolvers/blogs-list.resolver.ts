import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Blog } from '../../models/blog.interface';
import { BlogService } from '../../services/blog.service';
import { SeoService } from '../services/seo.service';

export const blogsListResolver: ResolveFn<Blog[]> = () => {

  const seoService = inject(SeoService);
  const blogService = inject(BlogService);
  seoService.setBlogsListingMetaTags();
  
  // If data is already loaded, return it immediately
  if (blogService.hasFullListLoaded) {
    return of(blogService.blogs());
  }
  
  // Return Observable to ensure data is available for SSR and provides better UX
  return blogService.fetchBlogs().pipe(
    catchError(() => {
      return of([]);
    })
  );

};
