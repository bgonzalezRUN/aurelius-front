import { useCallback, useMemo } from 'react';
import { useAuthStore } from '../store/auth';
import { type Permission } from '../types/roles';
import { useParams } from 'react-router-dom';

export function usePermission() {
  const { getUser } = useAuthStore();
  const user = getUser();
  const { costCenterId : costCenterIdParam } = useParams();

  const getCC = useMemo(() => {
    return user?.costCenter?.find(cc => cc.costCenterId === Number(costCenterIdParam));
  }, [costCenterIdParam, user?.costCenter]);

  console.log(user);
  
  
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;

      const rolePermissions = getCC?.permissions;

      return rolePermissions?.length
        ? rolePermissions?.includes(permission)
        : false;
    },
    [getCC?.permissions, user]
  );

  const rol = user?.isAdminCC ? 'ACC' : getCC?.role;

  return { hasPermission, rol };
}
