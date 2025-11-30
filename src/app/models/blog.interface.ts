export interface Blog {
  id: string;
  title: string;
  content: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  readingTime?: number;
  viewCount: number;
  status: BlogStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  category: BlogCategory;
}

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum BlogCategory {
  TECHNICAL = 'TECHNICAL',
  LIFE = 'LIFE',
  CAREER = 'CAREER'
}

export interface BlogFilters {
  category?: BlogCategory;
  search?: string;
  sortBy?: 'publishedAt' | 'viewCount' | 'readingTime';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogDetailResult {
  blog: Blog | null;
  error: 'not_found' | 'api_error' | null;
}
