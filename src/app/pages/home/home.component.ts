import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';
import { PersonalInfo } from '../../models/portfolio.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {

  private router = inject(Router);
  private portfolioService = inject(PortfolioService);

  personalInfo = signal<PersonalInfo | null>(null);

  ngOnInit(): void {
    this.loadPersonalInfo();
  }

  loadPersonalInfo(): void {
    this.portfolioService.getPersonalInfo().subscribe({
      next: (data: PersonalInfo) => {
        this.personalInfo.set(data);
      },
      error: (err) => {
        console.error('Failed to load personal info:', err);
      },
    });
  }

  navigateToProjects(): void {
    this.router.navigate(['/projects']);
  }

  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }
  
}
