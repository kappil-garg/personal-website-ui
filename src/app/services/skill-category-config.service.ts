import { Injectable } from '@angular/core';

/**
 * Service for managing skill category icon mappings.
 * Provides consistent icon mapping for skill categories.
 */
@Injectable({
  providedIn: 'root',
})
export class SkillCategoryConfigService {

  private readonly categoryIconMap = new Map<string, string>([
    ['Programming Languages', 'fas fa-code'],
    ['Backend Frameworks', 'fas fa-server'],
    ['Frontend Technologies', 'fas fa-laptop-code'],
    ['Databases', 'fas fa-database'],
    ['Messaging & Streaming', 'fas fa-stream'],
    ['DevOps & CI/CD', 'fas fa-rocket'],
    ['Containers & Observability', 'fas fa-cube'],
    ['Testing Frameworks', 'fas fa-vial'],
    ['Version Control & Project Management', 'fas fa-project-diagram'],
    ['Development Tools', 'fas fa-tools'],
    ['AI & Productivity', 'fas fa-brain']
  ]);

  /**
   * Get the FontAwesome icon class for a given skill category name.
   * 
   * @param categoryName The skill category name
   * @returns The FontAwesome icon class, or a default star icon if not found
   */
  getCategoryIcon(categoryName: string): string {
    return this.categoryIconMap.get(categoryName) || 'fas fa-star';
  }

}
