import type { Permission, RoleName } from './roles';

export interface User {
  userName?: string;
  userLastName?: string;
  role: RoleName;
  permissions: Permission;
  userEmail: string;
  isAdminCC: boolean;
}
