import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { paths } from '../paths';

const ProtectedRoute = () => {
  const { getUser } = useAuthStore();

  if (!getUser()) {
    return <Navigate to={paths.LOGIN} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
