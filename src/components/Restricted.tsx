import React, { type ReactNode } from 'react';
import { usePermission } from '../hooks/usePermission';
import type { Permission } from '../types';

export interface IRestrictedProps {
  permission?: string;
  children: ReactNode;
}

const Restricted: React.FC<IRestrictedProps> = ({ permission, children }) => {
  const{ hasPermission} = usePermission();

  const canShow = !permission || hasPermission(permission as Permission);

  return canShow ? <>{children}</> : null;
};

export default Restricted;
