export interface Certification {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  /** Issue date in MM-YYYY format (e.g., "12-2025") */
  issueDate?: string;
  /** Expiration date in MM-YYYY format (e.g., "12-2025"). Optional if doesNotExpire is true. */
  expirationDate?: string;
  doesNotExpire: boolean;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  organizationLogo?: string;
  organizationWebsite?: string;
  createdAt?: string;
  updatedAt?: string;
  displayOrder?: number;
}
