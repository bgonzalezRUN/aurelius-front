import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { paths } from '../paths';
import type { RoleName } from '../types/roles';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: RoleName[] }) => {
  const { getUser } = useAuthStore();
  const user = getUser();

  if (!user) {
    return <Navigate to={paths.LOGIN} replace />;
  }
  if (!allowedRoles) return null;

  if (!allowedRoles?.includes(user.role)) {
    return <Navigate to={paths.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
