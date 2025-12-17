import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Blog } from '../../models/blog.interface';

@Injectable({
  providedIn: 'root',
})
export class SeoService {

  private meta = inject(Meta);
  private title = inject(Title);
  private document = inject(DOCUMENT);

  private readonly author = 'Kapil Garg';
  private readonly baseUrl = 'https://www.kappilgarg.dev';
  private readonly defaultImage = 'https://www.kappilgarg.dev/assets/images/profile-pic.png';
  private readonly defaultTitle = 'Kapil Garg - Java Full Stack Developer & Tech Explorer';
  private readonly defaultDescription = 'Full Stack Java Developer with 8+ years of experience in enterprise-grade software solutions. Specialized in Spring Boot, Angular, and modern web technologies.';

  setBlogPostMetaTags(blog: Blog): void {

    const title = `${blog.title} - Kapil Garg`;
    const url = `${this.baseUrl}/blogs/${blog.slug}`;
    const description = blog.excerpt || this.defaultDescription;

    let image = blog.featuredImage || this.defaultImage;
    if (image && !image.startsWith('http://') && !image.startsWith('https://')) {
      image = image.startsWith('/') 
        ? `${this.baseUrl}${image}` 
        : `${this.baseUrl}/${image}`;
    }
    
    const modifiedTime = blog.updatedAt;
    const publishedTime = blog.publishedAt || blog.createdAt;
    
    this.title.setTitle(title);

    this.updateOrCreateMetaTag('name', 'description', description);
    this.updateOrCreateMetaTag('name', 'author', this.author);
    this.updateOrCreateMetaTag('name', 'keywords', this.generateKeywords(blog));

    this.updateOrCreateMetaTag('property', 'og:type', 'article');
    this.updateOrCreateMetaTag('property', 'og:title', title);
    this.updateOrCreateMetaTag('property', 'og:description', description);
    this.updateOrCreateMetaTag('property', 'og:image', image);
    this.updateOrCreateMetaTag('property', 'og:image:width', '1200');
    this.updateOrCreateMetaTag('property', 'og:image:height', '630');
    this.updateOrCreateMetaTag('property', 'og:image:alt', title);
    this.updateOrCreateMetaTag('property', 'og:image:type', this.getImageType(image));
    this.updateOrCreateMetaTag('property', 'og:url', url);
    this.updateOrCreateMetaTag('property', 'og:site_name', 'Kapil Garg');
    this.updateOrCreateMetaTag('property', 'og:locale', 'en_US');

    if (publishedTime) {
      this.updateOrCreateMetaTag(
        'property',
        'article:published_time',
        publishedTime,
      );
    }

    if (modifiedTime) {
      this.updateOrCreateMetaTag(
        'property',
        'article:modified_time',
        modifiedTime,
      );
    }

    if (blog.category) {
      this.updateOrCreateMetaTag('property', 'article:section', blog.category);
    }

    this.updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    this.updateOrCreateMetaTag('name', 'twitter:title', title);
    this.updateOrCreateMetaTag('name', 'twitter:description', description);
    this.updateOrCreateMetaTag('name', 'twitter:image', image);
    this.updateOrCreateMetaTag('name', 'twitter:site', '@KappilGarg');
    this.updateOrCreateMetaTag('name', 'twitter:creator', '@KappilGarg');

    this.updateOrCreateLinkTag('canonical', url);
    this.updateOrCreateMetaTag('property', 'article:author', this.author);

  }

  setBlogsListingMetaTags(): void {
    const title = 'Blogs - Kapil Garg';
    const url = `${this.baseUrl}/blogs`;
    const description = 'Read my thoughts, insights, and experiences from my journey in technology, life, and career. Technical tutorials, career advice, and personal stories.';
    this.title.setTitle(title);
    this.updateOrCreateMetaTag('name', 'description', description);
    this.updateOrCreateMetaTag('property', 'og:type', 'website');
    this.updateOrCreateMetaTag('property', 'og:title', title);
    this.updateOrCreateMetaTag('property', 'og:description', description);
    this.updateOrCreateMetaTag('property', 'og:url', url);
    this.updateOrCreateMetaTag('property', 'og:image', this.defaultImage);
    this.updateOrCreateMetaTag('property', 'og:image:width', '1200');
    this.updateOrCreateMetaTag('property', 'og:image:height', '630');
    this.updateOrCreateMetaTag('property', 'og:image:alt', title);
    this.updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    this.updateOrCreateMetaTag('name', 'twitter:title', title);
    this.updateOrCreateMetaTag('name', 'twitter:description', description);
    this.updateOrCreateMetaTag('name', 'twitter:image', this.defaultImage);
    this.updateOrCreateLinkTag('canonical', url);
  }

  setExperienceMetaTags(): void {
    const title = 'Experience - Kapil Garg';
    const url = `${this.baseUrl}/experience`;
    const description = 'My professional journey and the organizations I\'ve had the privilege to work with. Explore my work experience, achievements, and the technologies I\'ve worked with.';
    this.title.setTitle(title);
    this.updateOrCreateMetaTag('name', 'description', description);
    this.updateOrCreateMetaTag('property', 'og:type', 'website');
    this.updateOrCreateMetaTag('property', 'og:title', title);
    this.updateOrCreateMetaTag('property', 'og:description', description);
    this.updateOrCreateMetaTag('property', 'og:url', url);
    this.updateOrCreateMetaTag('property', 'og:image', this.defaultImage);
    this.updateOrCreateMetaTag('property', 'og:image:width', '1200');
    this.updateOrCreateMetaTag('property', 'og:image:height', '630');
    this.updateOrCreateMetaTag('property', 'og:image:alt', title);
    this.updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    this.updateOrCreateMetaTag('name', 'twitter:title', title);
    this.updateOrCreateMetaTag('name', 'twitter:description', description);
    this.updateOrCreateMetaTag('name', 'twitter:image', this.defaultImage);
    this.updateOrCreateLinkTag('canonical', url);
  }

  setProjectsMetaTags(): void {
    const title = 'Projects - Kapil Garg';
    const url = `${this.baseUrl}/projects`;
    const description = 'A collection of projects I\'ve worked on, showcasing my skills and experience in software development. Explore my portfolio of applications and solutions.';
    this.title.setTitle(title);
    this.updateOrCreateMetaTag('name', 'description', description);
    this.updateOrCreateMetaTag('property', 'og:type', 'website');
    this.updateOrCreateMetaTag('property', 'og:title', title);
    this.updateOrCreateMetaTag('property', 'og:description', description);
    this.updateOrCreateMetaTag('property', 'og:url', url);
    this.updateOrCreateMetaTag('property', 'og:image', this.defaultImage);
    this.updateOrCreateMetaTag('property', 'og:image:width', '1200');
    this.updateOrCreateMetaTag('property', 'og:image:height', '630');
    this.updateOrCreateMetaTag('property', 'og:image:alt', title);
    this.updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    this.updateOrCreateMetaTag('name', 'twitter:title', title);
    this.updateOrCreateMetaTag('name', 'twitter:description', description);
    this.updateOrCreateMetaTag('name', 'twitter:image', this.defaultImage);
    this.updateOrCreateLinkTag('canonical', url);
  }

  setEducationMetaTags(): void {
    const title = 'Education - Kapil Garg';
    const url = `${this.baseUrl}/education`;
    const description = 'My academic journey and professional degrees. Explore my educational background and qualifications.';
    this.title.setTitle(title);
    this.updateOrCreateMetaTag('name', 'description', description);
    this.updateOrCreateMetaTag('property', 'og:type', 'website');
    this.updateOrCreateMetaTag('property', 'og:title', title);
    this.updateOrCreateMetaTag('property', 'og:description', description);
    this.updateOrCreateMetaTag('property', 'og:url', url);
    this.updateOrCreateMetaTag('property', 'og:image', this.defaultImage);
    this.updateOrCreateMetaTag('property', 'og:image:width', '1200');
    this.updateOrCreateMetaTag('property', 'og:image:height', '630');
    this.updateOrCreateMetaTag('property', 'og:image:alt', title);
    this.updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    this.updateOrCreateMetaTag('name', 'twitter:title', title);
    this.updateOrCreateMetaTag('name', 'twitter:description', description);
    this.updateOrCreateMetaTag('name', 'twitter:image', this.defaultImage);
    this.updateOrCreateLinkTag('canonical', url);
  }

  setCertificationsMetaTags(): void {
    const title = 'Certifications - Kapil Garg';
    const url = `${this.baseUrl}/certifications`;
    const description = 'Professional certifications and courses I\'ve completed. Explore my continuous learning journey and professional development achievements.';
    this.title.setTitle(title);
    this.updateOrCreateMetaTag('name', 'description', description);
    this.updateOrCreateMetaTag('property', 'og:type', 'website');
    this.updateOrCreateMetaTag('property', 'og:title', title);
    this.updateOrCreateMetaTag('property', 'og:description', description);
    this.updateOrCreateMetaTag('property', 'og:url', url);
    this.updateOrCreateMetaTag('property', 'og:image', this.defaultImage);
    this.updateOrCreateMetaTag('property', 'og:image:width', '1200');
    this.updateOrCreateMetaTag('property', 'og:image:height', '630');
    this.updateOrCreateMetaTag('property', 'og:image:alt', title);
    this.updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    this.updateOrCreateMetaTag('name', 'twitter:title', title);
    this.updateOrCreateMetaTag('name', 'twitter:description', description);
    this.updateOrCreateMetaTag('name', 'twitter:image', this.defaultImage);
    this.updateOrCreateLinkTag('canonical', url);
  }

  setContactMetaTags(): void {
    const title = 'Contact - Kapil Garg';
    const url = `${this.baseUrl}/contact`;
    const description = 'Get in touch with me for collaborations, opportunities, or just to say hello. Send me a message and I\'ll respond as soon as possible.';
    this.title.setTitle(title);
    this.updateOrCreateMetaTag('name', 'description', description);
    this.updateOrCreateMetaTag('property', 'og:type', 'website');
    this.updateOrCreateMetaTag('property', 'og:title', title);
    this.updateOrCreateMetaTag('property', 'og:description', description);
    this.updateOrCreateMetaTag('property', 'og:url', url);
    this.updateOrCreateMetaTag('property', 'og:image', this.defaultImage);
    this.updateOrCreateMetaTag('property', 'og:image:width', '1200');
    this.updateOrCreateMetaTag('property', 'og:image:height', '630');
    this.updateOrCreateMetaTag('property', 'og:image:alt', title);
    this.updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    this.updateOrCreateMetaTag('name', 'twitter:title', title);
    this.updateOrCreateMetaTag('name', 'twitter:description', description);
    this.updateOrCreateMetaTag('name', 'twitter:image', this.defaultImage);
    this.updateOrCreateLinkTag('canonical', url);
  }

  setDefaultMetaTags(): void {
    this.title.setTitle(this.defaultTitle);
    this.updateOrCreateMetaTag('name', 'description', this.defaultDescription);
    this.updateOrCreateMetaTag('property', 'og:type', 'website');
    this.updateOrCreateMetaTag('property', 'og:title', this.defaultTitle);
    this.updateOrCreateMetaTag('property', 'og:description', this.defaultDescription);
    this.updateOrCreateMetaTag('property', 'og:url', this.baseUrl);
    this.updateOrCreateMetaTag('property', 'og:image', this.defaultImage);
    this.updateOrCreateMetaTag('property', 'og:image:width', '1200');
    this.updateOrCreateMetaTag('property', 'og:image:height', '630');
    this.updateOrCreateMetaTag('property', 'og:image:alt', this.defaultTitle);
    this.updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    this.updateOrCreateMetaTag('name', 'twitter:title', this.defaultTitle);
    this.updateOrCreateMetaTag('name', 'twitter:description', this.defaultDescription);
    this.updateOrCreateMetaTag('name', 'twitter:image', this.defaultImage);
  }

  private updateOrCreateMetaTag(
    attribute: 'name' | 'property',
    selector: string,
    content: string,
  ): void {
    const existingTag = this.meta.getTag(`${attribute}="${selector}"`);
    if (existingTag) {
      this.meta.updateTag({ [attribute]: selector, content });
    } else {
      this.meta.addTag({ [attribute]: selector, content });
    }
  }

  private updateOrCreateLinkTag(rel: string, href: string): void {
    const linkTag = this.document.querySelector(
      `link[rel="${rel}"]`,
    ) as HTMLLinkElement | null;
    if (linkTag) {
      linkTag.setAttribute('href', href);
    } else {
      const newLinkTag = this.document.createElement('link');
      newLinkTag.setAttribute('rel', rel);
      newLinkTag.setAttribute('href', href);
      this.document.head.appendChild(newLinkTag);
    }
  }

  private generateKeywords(blog: Blog): string {
    const baseKeywords = 'Kapil Garg, Java Developer, Full Stack Developer, Spring Boot, Angular, Blog';
    const categoryKeywords = blog.category
      ? `${blog.category.toLowerCase()}, `
      : '';
    return `${categoryKeywords}${baseKeywords}`;
  }

  private getImageType(imageUrl: string): string {
    const sanitizedUrl = imageUrl.split('?')[0];
    const extension = sanitizedUrl.split('.').pop()?.toLowerCase() || 'png';
    const typeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    };
    return typeMap[extension] || 'image/png';
  }

}
