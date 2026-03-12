export interface ContactForm {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export interface ContactPolishRequest {
  message: string;
}

export interface ContactPolishResponse {
  suggestedMessage: string;
}
