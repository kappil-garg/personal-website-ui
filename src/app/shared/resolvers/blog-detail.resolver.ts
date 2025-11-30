import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BlogDetailResult } from '../../models/blog.interface';
import { BlogService } from '../../services/blog.service';
import { SeoService } from '../services/seo.service';

export const blogDetailResolver: ResolveFn<BlogDetailResult> = (route) => {

  const slug = route.paramMap.get('slug');
  if (!slug) {
    return of({ blog: null, error: 'not_found' as const });
  }

  const seoService = inject(SeoService);
  const blogService = inject(BlogService);

  return blogService.getBlogBySlug(slug).pipe(
    map((blog) => {
      if (blog) {
        seoService.setBlogPostMetaTags(blog);
        blogService.addBlogToList(blog);
        return { blog, error: null };
      }
      return { blog: null, error: 'not_found' as const };
    }),
    catchError(() => {
      return of({ blog: null, error: 'api_error' as const });
    }),
  );

};
