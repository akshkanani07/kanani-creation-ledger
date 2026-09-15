/**
 * Settings Types
 * 
 * Type definitions for Settings feature.
 */

// ═══════════════════════════════════════════════════════════
// EMAIL CHANGE
// ═══════════════════════════════════════════════════════════

export interface EmailChangeRequest {
  newEmail: string;
}

export interface EmailChangeResponse {
  newEmail: string;
  verificationSent: boolean;
}

export interface VerifyEmailChangeParams {
  token: string;
}

// ═══════════════════════════════════════════════════════════
// BACKUP
// ═══════════════════════════════════════════════════════════

export interface BackupData {
  metadata: {
    generatedAt: string;
    version: string;
    company: string;
    industry: string;
  };
  owner: {
    email: string;
    name: string;
  };
  karigars: Array<{
    id: string;
    name: string;
    phone: string;
    address: string | null;
    photoUrl: string | null;
    isActive: boolean;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    karigarId: string;
    type: string;
    direction: string;
    amount: number;
    quantity: number | null;
    rate: number | null;
    paymentMode: string | null;
    reference: string | null;
    description: string;
    transactionDate: string;
    createdAt: string;
  }>;
  activityLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    metadata: unknown;
    createdAt: string;
  }>;
  stats: {
    totalKarigars: number;
    totalTransactions: number;
    totalActivityLogs: number;
  };
}

// ═══════════════════════════════════════════════════════════
// ACTIVITY LOG
// ═══════════════════════════════════════════════════════════

export interface ActivityLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: Date;
}