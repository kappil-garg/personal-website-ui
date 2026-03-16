import { Component, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {

  private router = inject(Router);
  public portfolioService = inject(PortfolioService);

  error = computed(() => this.portfolioService.error());
  loading = computed(() => this.portfolioService.loading());
  personalInfo = computed(() => this.portfolioService.personalInfo());

  ngOnInit(): void {
    if (!this.portfolioService.hasDataLoaded) {
      this.portfolioService.loadPersonalInfo().subscribe();
    }
  }

  navigateToProjects(): void {
    this.router.navigate(['/projects']);
  }

  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }

  retryLoadPersonalInfo(): void {
    this.portfolioService.loadPersonalInfo({ forceRefresh: true }).subscribe();
  }
  
}
