export interface ProjectGithubLink {
  type: string;
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  shortDescription?: string;
  overview?: string[];
  keyFeatures?: string[];
  engineering?: string[];
  decisions?: string[];
  impact?: string[];
  highlights?: string[];
  featuredImage: string;
  projectUrl?: string;
  githubLinks?: ProjectGithubLink[];
  /** Start date in YYYY-MM format (e.g., "2025-01") */
  startDate?: string;
  /** End date in YYYY-MM format (e.g., "2025-12") */
  endDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  displayOrder?: number;
}
