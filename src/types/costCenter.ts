import type { RoleName } from './roles';
import type { User } from './user';

export type COST_CENTER_STATUS = 'DRAFT' | 'OPEN' | 'CLOSED' | 'FROZEN';

export const COST_CENTER_STATUS_ITEM: Record<COST_CENTER_STATUS, string> = {
  DRAFT: 'Borrador',
  OPEN: 'Abierto',
  CLOSED: 'Cerrado',
  FROZEN: 'Congelado',
};

export type ContentFile = {
  fileName: string;
  url: string;
  fileType: string;
  costCenterFileId: number;
};

export type COST_CENTER = {
  costCenterName: string;
  costCenterDescription: string;
  costCenterAddress: string;
  costCenterCalender: File | string | ContentFile[];
  costCenterBudget: File[] | string[] | ContentFile[];
  costCenterRules: File[] | string[] | ContentFile[];
  requisitions: string[];
  costCenterId: string;
  costCenterCode: string;
  costCenterStatus: COST_CENTER_STATUS;
  files: ContentFile[] | [];
  formattedFiles?: Record<string, ContentFile[]>;
  filesToDelete?: string[];
};

export type KeyofCostCenter = keyof COST_CENTER;

export type USER_BY_CC = {
  roleId: number;
  userEmail: string;
  costCenterId: number;
};

export type USER_IN_CC = {
  role: { roleId: number; roleName: RoleName };
  user: Partial<User>;
  userCostCenterId: number;
};
