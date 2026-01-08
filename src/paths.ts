import type { RoleName } from './types';

export const paths = {
  BASE: '/',
  ADMIN: '/admin',
  LOGIN: '/iniciar-sesion',
  REGISTER: '/registro',
  RECOVER_PASSWORD: 'recuperar-contrasena',
  NEW_PASSWORD: '/recovery-password/:id',
  REQUISITIONS: '/requisiciones',
  CC: 'centros-de-costos',
  UNAUTHORIZED: '/unauthorized',
  MANAGE: 'administrar',
  SUPPLIER: 'proveedores',
};

export const pathsBase: Record<Extract<RoleName, 'ACC' | 'ACO'>, string> = {
  ACC: `${paths.ADMIN}/${paths.CC}`,
  ACO: `${paths.ADMIN}/${paths.SUPPLIER}`,
};
