/**
 * Application-wide constants to manage UI configuration, blog configuration, and categories configuration
 */
export const APP_CONSTANTS = {
  
  UI: {
    DEBOUNCE_TIME: 300
  },
  
  BLOG: {
    DEFAULT_READING_TIME: 0,
    SEARCH_MIN_LENGTH: 2,
    SORT_OPTIONS: {
      PUBLISHED_AT: 'publishedAt',
      VIEW_COUNT: 'viewCount',
      READING_TIME: 'readingTime'
    } as const,
    SORT_ORDERS: {
      ASC: 'asc',
      DESC: 'desc'
    } as const
  },
  
  CATEGORIES: {
    ALL: 'ALL'
  }
  
} as const;

export type SortOption = typeof APP_CONSTANTS.BLOG.SORT_OPTIONS[keyof typeof APP_CONSTANTS.BLOG.SORT_OPTIONS];
export type SortOrder = typeof APP_CONSTANTS.BLOG.SORT_ORDERS[keyof typeof APP_CONSTANTS.BLOG.SORT_ORDERS];
