import type { RoleName } from "./roles";
import type { User } from "./user";

export type COST_CENTER = {
  costCenterName: string;
  costCenterDescription: string;
  costCenterAddress: string;
  costCenterCalender: File | string;
  costCenterBudget: File | string[];
  costCenterRules: File | string[];
  requisitions: string[];
  costCenterId: string;
  costCenterCode: string;
};

export type KeyofCostCenter = keyof COST_CENTER;


export type USER_BY_CC = {
  roleId: number;
  userEmail: string;
  costCenterId: number
}

export type USER_IN_CC = {
  role: {roleId: number, roleName: RoleName},
  user: Partial<User>
}