import type { Category } from './category';
import type { PAYMENT_TERMS_TYPE } from './paymentTerms';

export const STATUS_SUPPLIER = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  BLOCKED: 'BLOCKED',
  SUSPENDED: 'SUSPENDED',
} as const;

export type StatusSupplier =
  (typeof STATUS_SUPPLIER)[keyof typeof STATUS_SUPPLIER];

export const statusLabelsSupplier: Record<StatusSupplier, string> = {
  PENDING: 'Pendiente de activación',
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  BLOCKED: 'Bloqueado',
  SUSPENDED: 'Suspendido',
};

export type ContentFile = {
  fileName: string;
  url: string;
  supplierFileId: string;
};

export type PaymentTerms = {
  paymentTermType: PAYMENT_TERMS_TYPE;
  advancePercentage?: number;
  balancePercentage?: number;
  creditPercentage?: number;
  creditDays?: number;
};

export type SupplierDTO = {
  companyName: string;
  supplierPassword: string;
  rfc: string;
  businessTransaction: string;
  fiscalAddress: string;
  commercialEmail: string;
  billingEmail: string;
  supplierPhone: string;
  bankName: string;
  bankAccount: string;
  registeredName: string;
  categories: Partial<Category>[] | string[];
  supplierFile: File[];
  files: ContentFile[];
  supplierId: string;
  supplierStatus: StatusSupplier;
  paymentTerms: PaymentTerms[];
};

export type KeyofSupplier = keyof SupplierDTO;
