export interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  featuredImage: string;
  technologies?: string[];
  projectUrl?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  displayOrder?: number;
}
