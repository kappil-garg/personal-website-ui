import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FOOTER_LINKS, NavigationItem } from '../../data/navigation.data';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  footerLinks = signal<NavigationItem[]>(FOOTER_LINKS);

  // Get current year for footer
  get currentYear(): number {
    return new Date().getFullYear();
  }
  
}
