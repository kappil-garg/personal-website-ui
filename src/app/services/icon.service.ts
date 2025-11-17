import { Injectable } from '@angular/core';

/**
 * Service for managing icons throughout the application.
 * Provides consistent icon mapping for navigation items.
 */
@Injectable({
  providedIn: 'root',
})
export class IconService {

  private readonly navigationIconMap = new Map<string, string>([
    ['home', 'fas fa-home'],
    ['about-me', 'fas fa-heart'],
    ['experience', 'fas fa-briefcase'],
    ['education', 'fas fa-graduation-cap'],
    ['skills', 'fas fa-code'],
    ['projects', 'fas fa-project-diagram'],
    ['blogs', 'fas fa-blog'],
    ['certifications', 'fas fa-certificate'],
    ['contact', 'fas fa-envelope'],
  ]);

  /**
   * Get the FontAwesome icon class for a given navigation item ID
   * 
   * @param id The navigation item ID
   * @returns The FontAwesome icon class, or a default circle icon if not found
   */
  getIconClass(id: string): string {
    return this.navigationIconMap.get(id) || 'fas fa-circle';
  }

}
