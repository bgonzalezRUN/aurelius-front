import React, { type ReactNode } from 'react';
import { useAuthStore } from '../store/auth';

export interface IRestrictedProps {
  permission?: string;
  children: ReactNode;
}

const Restricted: React.FC<IRestrictedProps> = ({ permission, children }) => {
  const { user } = useAuthStore();
  let canShow = false;

  if (user) {
    const userPermissions = user?.permissions || [];
    const isDev = userPermissions.includes('unlock:all');

    canShow = !permission || isDev || userPermissions.includes(permission);
  }

  return canShow ? <>{children}</> : null;
};

export default Restricted;
