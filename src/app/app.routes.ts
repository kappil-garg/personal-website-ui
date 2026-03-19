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
    title: 'Kapil Garg - Senior Java Backend Engineer & Tech Explorer'
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
    path: 'projects/:id',
    loadComponent: () => import('./pages/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    title: 'Project Details - Kapil Garg'
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
