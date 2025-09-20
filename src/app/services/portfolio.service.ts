import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PersonalInfo } from '../models/portfolio.interface';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {

  getPersonalInfo(): Observable<PersonalInfo> {
    const mockData: PersonalInfo = {
      name: 'Kapil Garg',
      title: 'Full Stack Developer',
      description: [
        'I am a passionate Full Stack Developer with expertise in modern web technologies.',
        'I love building scalable applications and solving complex problems.',
      ],
      profileImage: 'assets/images/profile-pic.png',
      email: 'kappilgarg519@gmail.com',
      location: 'Noida, IN',
    };
    return of(mockData).pipe(delay(500));
  }

}
