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
  BACKEND_AND_SYSTEMS = 'BACKEND_AND_SYSTEMS',
  AI_AND_ENGINEERING = 'AI_AND_ENGINEERING',
  CAREER_AND_GROWTH = 'CAREER_AND_GROWTH',
  LEARNING_AND_FUNDAMENTALS = 'LEARNING_AND_FUNDAMENTALS',
  PERSONAL = 'PERSONAL'
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

export interface BlogAskRequest {
  question: string;
}

export interface BlogAskResponse {
  answer: string;
}
