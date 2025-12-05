export interface Experience {
  id: string;
  companyName: string;
  position: string;
  location?: string;
  /** Start date in MM-YYYY format (e.g., "12-2025") */
  startDate: string;
  /** End date in MM-YYYY format (e.g., "12-2025"). Optional if isCurrent is true. */
  endDate?: string;
  isCurrent: boolean;
  description: string[];
  technologies?: string[];
  achievements?: string[];
  companyLogo?: string;
  companyWebsite?: string;
  createdAt?: string;
  updatedAt?: string;
  displayOrder?: number;
}
