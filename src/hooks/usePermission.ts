import { useAuthStore } from '../store/auth';
import { ROLES, type Permission } from '../types/roles';

export function usePermission() {
  const { user } = useAuthStore();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    const role = user.role as keyof typeof ROLES;
    const rolePermissions = ROLES[role];

    return (rolePermissions as readonly string[]).includes(permission);
  };

  return hasPermission;
}
