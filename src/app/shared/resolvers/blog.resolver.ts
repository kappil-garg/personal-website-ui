import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Blog } from '../../models/blog.interface';
import { BlogService } from '../../services/blog.service';
import { SeoService } from '../services/seo.service';

export const blogResolver: ResolveFn<Blog | null> = (route) => {

  const slug = route.paramMap.get('slug');
  if (!slug) {
    return of(null);
  }

  const blogService = inject(BlogService);
  const seoService = inject(SeoService);

  return blogService.getBlogBySlug(slug).pipe(
    tap((blog) => {
      if (blog) {
        seoService.setBlogPostMetaTags(blog);
        blogService.addBlogToList(blog);
      }
    }),
    catchError(() => of(null))
  );

};
