import { jwtDecode } from "jwt-decode";
import React, { type ReactNode } from "react";

interface DecodedToken {
  permissions?: Array<string>;
  role?: string;
}

export interface IRestrictedProps {
  permission?: string;
  children: ReactNode;
}

const Restricted: React.FC<IRestrictedProps> = ({ permission, children }) => {
  const token = localStorage.getItem("token");
  let canShow = false;

  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);

      const userPermissions = decoded?.permissions || [];
      const isDev = userPermissions.includes("unlock:all");

      canShow = !permission || isDev || userPermissions.includes(permission);
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
  }

  return canShow ? <>{children}</> : null;
};

export default Restricted;
