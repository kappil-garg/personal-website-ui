export interface Education {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institutionName: string;
  location?: string;
  /** Start date in MM-YYYY format (e.g., "12-2025") */
  startDate: string;
  /** End date in MM-YYYY format (e.g., "12-2025"). Optional if isCurrent is true. */
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  institutionLogo?: string;
  institutionWebsite?: string;
  createdAt?: string;
  updatedAt?: string;
  displayOrder?: number;
}
