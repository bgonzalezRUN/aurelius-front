import type { Permission, RoleName } from './roles';

export type CC_FROM_USER = {
  costCenterId: number;
  costCenterName: string;
  permissions: Permission;
  role: RoleName;
};

export type User_Type = 'EMPLOYEE' | 'SUPPLIER' | 'ADMIN';

export interface User {
  userName: string;
  userLastName: string;
  userEmail: string;
  userType: User_Type;
  costCenter: CC_FROM_USER[];
  role: RoleName;
}
