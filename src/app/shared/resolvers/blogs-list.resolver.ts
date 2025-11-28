import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Blog } from '../../models/blog.interface';
import { BlogService } from '../../services/blog.service';
import { SeoService } from '../services/seo.service';

export const blogsListResolver: ResolveFn<Blog[]> = () => {
  const blogService = inject(BlogService);
  const seoService = inject(SeoService);
  seoService.setBlogsListingMetaTags();
  return blogService.fetchBlogs();
};
