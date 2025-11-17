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
    { key: BlogCategory.TECHNICAL, label: 'Technical', iconClass: 'fas fa-code' },
    { key: BlogCategory.LIFE, label: 'Life', iconClass: 'fas fa-heart' },
    { key: BlogCategory.CAREER, label: 'Career', iconClass: 'fas fa-briefcase' }
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
