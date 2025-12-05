export interface Experience {
  id: string;
  companyName: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string[];
  technologies?: string[];
  achievements?: string[];
  companyLogo?: string;
  companyWebsite?: string;
  createdAt?: string;
  updatedAt?: string;
  displayOrder: number;
}
