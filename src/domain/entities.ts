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

// ─── Document Upload ──────────────────────────────────────────────────────────
export type DocumentUploadStatus = 'aprovado' | 'pendente' | 'rejeitado';

export interface UploadedDocument {
  id: string;
  name: string;
  mimeType: string;
  uploadDate: string;
  status: DocumentUploadStatus;
  uri?: string;
  size?: number;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export type AlertType = 'novo_edital' | 'prazo_proximo' | 'resultado' | 'atualizacao';

export interface AppAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  dateTime: string;
  isRead: boolean;
}

// ─── Proposals / Participation history ────────────────────────────────────────
export type ProposalStatus = 'em_andamento' | 'ganhou' | 'perdeu' | 'cancelado';

export interface Proposal {
  id: string;
  name: string;
  organization: string;
  date: string;
  status: ProposalStatus;
}

// ─── Calendar Deadlines ───────────────────────────────────────────────────────
export interface AppDeadline {
  id: string;
  title: string;
  date: string;
  description?: string;
}
