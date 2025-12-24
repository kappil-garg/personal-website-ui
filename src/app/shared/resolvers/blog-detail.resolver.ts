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
    map((result) => {
      if (result.blog) {
        seoService.setBlogPostMetaTags(result.blog);
        blogService.addBlogToList(result.blog);
        return { blog: result.blog, error: null };
      }
      seoService.setBlogSlugFallbackMetaTags(slug);
      return result;
    }),
    catchError(() => {
      seoService.setBlogSlugFallbackMetaTags(slug);
      return of({ blog: null, error: 'api_error' as const });
    }),
  );

};
