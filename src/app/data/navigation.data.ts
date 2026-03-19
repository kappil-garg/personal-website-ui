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
    id: 'projects',
    label: 'Projects',
    route: '/projects',
    order: 2,
    icon: 'fas fa-project-diagram',
  },
  {
    id: 'blogs',
    label: 'Blogs',
    route: '/blogs',
    order: 3,
    icon: 'fas fa-blog',
  },
  {
    id: 'contact',
    label: 'Contact',
    route: '/contact',
    order: 4,
    icon: 'fas fa-envelope',
  },
];

export const FOOTER_LINKS: NavigationItem[] = [
  {
    id: 'contact',
    label: "Let's Connect",
    route: '/contact',
    order: 1,
    icon: 'fas fa-envelope',
  },
];
