import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { Blog } from '../../models/blog.interface';
import { BlogService } from '../../services/blog.service';
import { SeoService } from '../services/seo.service';

export const blogsListResolver: ResolveFn<Blog[]> = () => {
  const seoService = inject(SeoService);
  const blogService = inject(BlogService);
  seoService.setBlogsListingMetaTags();
  if (blogService.hasFullListLoaded) {
    return of(blogService.blogs());
  }
  return blogService.fetchBlogs();;
};
