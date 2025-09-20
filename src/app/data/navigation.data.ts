export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  order: number;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'experience',
    label: 'Experience',
    route: '/experience',
    order: 1,
  },
  {
    id: 'projects',
    label: 'Projects',
    route: '/projects',
    order: 2,
  },
  {
    id: 'skills',
    label: 'Skills',
    route: '/skills',
    order: 3,
  },
  {
    id: 'education',
    label: 'Education',
    route: '/education',
    order: 4,
  },
  {
    id: 'certifications',
    label: 'Certifications',
    route: '/certifications',
    order: 5,
  },
  {
    id: 'blogs',
    label: 'Blogs',
    route: '/blogs',
    order: 6,
  },
];

export const FOOTER_LINKS: NavigationItem[] = [
  {
    id: 'about-me',
    label: 'About Me',
    route: '/about-me',
    order: 1,
  },
  {
    id: 'contact',
    label: 'Contact',
    route: '/contact',
    order: 2,
  },
];
