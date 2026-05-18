/**
 * domain/entities.ts
 * Entidades de domínio do LicitAcesso — idênticas à versão web.
 */

export interface Bid {
  id: string;
  title: string;
  description: string;
  organization: string;
  estimatedValue: number;
  deadline: string;
  deadlineTime?: string;
  location: string;
  category: string;
  matchPercentage?: number;
  isUrgent?: boolean;
  requirements?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  businessInfo?: {
    sector: string;
    cnae: string;
    city: string;
    uf: string;
  };
}

export enum DocumentStatus {
  OK = 'ok',
  PENDING = 'pending',
  PROCESSING = 'processing',
}

export interface BidDocument {
  id: string;
  title: string;
  status: DocumentStatus;
  lastUpdated?: string;
  description: string;
  actionUrl?: string;
}
