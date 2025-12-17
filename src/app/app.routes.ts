import { Routes } from '@angular/router';
import { blogDetailResolver } from './shared/resolvers/blog-detail.resolver';
import { blogsListResolver } from './shared/resolvers/blogs-list.resolver';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full' 
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Kapil Garg - Java Full Stack Developer & Tech Explorer'
  },
  {
    path: 'about-me',
    loadComponent: () => import('./pages/about-me/about-me.component').then(m => m.AboutMeComponent),
    title: 'About Me - Kapil Garg'
  },
  {
    path: 'experience',
    loadComponent: () => import('./pages/experience/experience.component').then(m => m.ExperienceComponent),
    title: 'Experience - Kapil Garg'
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
    title: 'Projects - Kapil Garg'
  },
  {
    path: 'skills',
    loadComponent: () => import('./pages/skills/skills.component').then(m => m.SkillsComponent),
    title: 'Skills - Kapil Garg'
  },
  {
    path: 'education',
    loadComponent: () => import('./pages/education/education.component').then(m => m.EducationComponent),
    title: 'Education - Kapil Garg'
  },
  {
    path: 'certifications',
    redirectTo: '/education',
    pathMatch: 'full'
  },
  {
    path: 'blogs',
    loadComponent: () => import('./pages/blogs/blogs.component').then(m => m.BlogsComponent),
    title: 'Blogs - Kapil Garg',
    resolve: { blogs: blogsListResolver }
  },
  {
    path: 'blogs/:slug',
    loadComponent: () => import('./pages/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
    title: 'Blog Post - Kapil Garg',
    resolve: { blog: blogDetailResolver }
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact - Kapil Garg'
  },
  { 
    path: '**', 
    redirectTo: '/home' 
  }
];
