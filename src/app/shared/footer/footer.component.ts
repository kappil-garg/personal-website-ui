import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FOOTER_LINKS, NavigationItem } from '../../data/navigation.data';
import { IconService } from '../../services/icon.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {

  private iconService = inject(IconService);

  footerLinks = signal<NavigationItem[]>(FOOTER_LINKS);

  get currentYear(): number {
    return new Date().getFullYear();
  }

  getIconClass(id: string): string {
    return this.iconService.getIconClass(id);
  }
  
}
