import type { Permission, RoleName } from './roles';

export type CC_FROM_USER ={
  costCenterId: number,
  costCenterName: string,
  permissions: Permission
   role: RoleName;
}

export interface User {
  userName?: string;
  userLastName?: string; 
  userEmail: string;
  isAdminCC: boolean;
  costCenter: CC_FROM_USER[]
}
