export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  order: number;
  icon: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'experience',
    label: 'Experience',
    route: '/experience',
    order: 1,
    icon: 'fas fa-briefcase',
  },
  {
    id: 'skills',
    label: 'Skills',
    route: '/skills',
    order: 2,
    icon: 'fas fa-code',
  },
  {
    id: 'projects',
    label: 'Projects',
    route: '/projects',
    order: 3,
    icon: 'fas fa-project-diagram',
  },
  {
    id: 'education',
    label: 'Education',
    route: '/education',
    order: 4,
    icon: 'fas fa-graduation-cap',
  },
  {
    id: 'blogs',
    label: 'Blogs',
    route: '/blogs',
    order: 5,
    icon: 'fas fa-blog',
  },
];

export const FOOTER_LINKS: NavigationItem[] = [
  {
    id: 'contact',
    label: 'Connect with Me',
    route: '/contact',
    order: 1,
    icon: 'fas fa-envelope',
  },
];
