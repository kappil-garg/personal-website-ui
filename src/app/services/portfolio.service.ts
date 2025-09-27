import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PersonalInfo } from '../models/portfolio.interface';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  
  // Centralized data management with signals for reactivity
  private personalInfoSignal = signal<PersonalInfo | null>(null);
  
  constructor() {
    this.loadPersonalInfo();
  }

  private loadPersonalInfo(): void {
    const personalInfo: PersonalInfo = {
      name: 'Kapil Garg',
      tagline: 'Obsessed with details. Driven by clean design.',
      description: [
        "I'm a Java Full Stack Developer with 8+ years of experience crafting robust and scalable enterprise-grade applications across diverse domains like Finance, Insurance, and Healthcare.",
        "My expertise spans the entire development lifecycle, from designing microservices architectures to building responsive Angular frontends. I'm passionate about clean code, performance optimization, and creating solutions that stand the test of time.",
        "When I'm not coding, I enjoy sharing knowledge through technical writing, exploring new technologies, binge-watching TV shows, or cheering for my favorite football team.",
      ],
      profileImage: 'assets/images/profile-pic.png',
      email: 'kappilgarg519@gmail.com',
      location: 'Noida, IN',
    };
    
    this.personalInfoSignal.set(personalInfo);
  }

  getPersonalInfo(): Observable<PersonalInfo> {
    const info = this.personalInfoSignal();
    return info ? of(info) : of({} as PersonalInfo);
  }
  
  // Signal-based getter for reactive components
  get personalInfo() {
    return this.personalInfoSignal.asReadonly();
  }
  
}
