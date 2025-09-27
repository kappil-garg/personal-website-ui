import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IconService {

  private readonly iconMap = new Map<string, string>([
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
    return this.iconMap.get(id) || 'fas fa-circle';
  }

  /**
   * Get all available icon mappings
   * 
   * @returns A copy of the icon map for reference
   */
  getAllIcons(): Map<string, string> {
    return new Map(this.iconMap);
  }

}
