import { Injectable } from '@angular/core';
import { BlogCategory } from '../models/blog.interface';

export interface CategoryConfig {
  key: BlogCategory | 'ALL';
  label: string;
  iconClass: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryConfigService {

  private readonly categoryConfigs: CategoryConfig[] = [
    { key: 'ALL' as const, label: 'All Posts', iconClass: 'fas fa-file-alt' },
    { key: BlogCategory.BACKEND_AND_SYSTEMS, label: 'Backend & Systems', iconClass: 'fas fa-server' },
    { key: BlogCategory.AI_AND_ENGINEERING, label: 'AI & Engineering', iconClass: 'fas fa-brain' },
    { key: BlogCategory.CAREER_AND_GROWTH, label: 'Career & Growth', iconClass: 'fas fa-chart-line' },
    { key: BlogCategory.LEARNING_AND_FUNDAMENTALS, label: 'Learning & Fundamentals', iconClass: 'fas fa-book-open' },
    { key: BlogCategory.PERSONAL, label: 'Personal', iconClass: 'fas fa-user' }
  ];

  getCategoryConfig(category: string): CategoryConfig | undefined {
    return this.categoryConfigs.find(config => config.key === category);
  }

  getAllCategoryConfigs(): CategoryConfig[] {
    return [...this.categoryConfigs];
  }

  getCategoryIcon(category: string): string {
    const config = this.getCategoryConfig(category);
    return config?.iconClass || 'fas fa-file-alt';
  }

  getCategoryLabel(category: string): string {
    const config = this.getCategoryConfig(category);
    return config?.label || category;
  }
  
}
