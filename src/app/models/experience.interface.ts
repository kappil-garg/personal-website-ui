export interface Experience {
  id: string;
  companyName: string;
  position: string;
  location?: string;
  /** Start date in YYYY-MM format (e.g., "2025-12") */
  startDate: string;
  /** End date in YYYY-MM format (e.g., "2025-12"). Optional if isCurrent is true. */
  endDate?: string;
  isCurrent: boolean;
  summary: string[];
  impact?: string[];
  highlights?: string[];
  companyLogo?: string;
  companyWebsite?: string;
  createdAt?: string;
  updatedAt?: string;
  displayOrder?: number;
}
