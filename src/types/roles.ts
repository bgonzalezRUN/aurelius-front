export const ROLES = {
  RFR: [
    'create:requisition',
    'read:requisition',
    'update:requisition',
    'delete:requisition',
    'submit:requisition',
  ],
  GO: [
    'create:requisition',
    'read:requisition',
    'update:requisition',
    'delete:requisition',
    'reject:requisition',
    'validate:requisition',
  ],
  DO: ['read:requisition', 'approve:requisition', 'reject:requisition'],
  AC: ['read:requisition', 'send_to_purchase:requisition'],
  ACC: [],
  'QA/GGT': [],
} as const;

export type RoleName = keyof typeof ROLES;
export type Permission = (typeof ROLES)[RoleName][number];

export const ROLEITEM: Record<
  number,
  Extract<RoleName, 'RFR' | 'GO' | 'DO'>
> = {
  1: 'RFR',
  2: 'GO',
  3: 'DO',
};

export type RoleItem = (typeof ROLEITEM)[keyof typeof ROLEITEM];

export const ROLEITEMNAME: Record<RoleName, string> = {
  RFR: 'Solicitante',
  GO: 'Gerente de obra',
  DO: 'Director de obra',
  AC: 'Auxiliar de compras',
  ACC: 'Administrador de CC',
  'QA/GGT': 'QA/GGT',
};

export type RoleItemName = (typeof ROLEITEMNAME)[keyof typeof ROLEITEMNAME];