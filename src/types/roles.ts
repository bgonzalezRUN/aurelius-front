export type RoleName = 'RFR' | 'GO' | 'DO' | 'ACO' | 'ACC' | 'QA/GGT';

export type Permission =
  | 'unlock:all'
  | 'create:requisition'
  | 'read:requisition'
  | 'update:requisition'
  | 'delete:requisition'
  | 'submit:requisition'
  | 'validate:requisition'
  | 'approve:requisition'
  | 'reject:requisition'
  | 'send:to:purchase:requisition'
  | 'create:cost:center'
  | 'read:cost:center'
  | 'update:cost:center'
  | 'delete:cost:center'
  | 'open:cost:center'
  | 'close:cost:center'
  | 'freeze:cost:center'
  | 'create:user:cost:center'
  | 'read:user:cost:center'
  | 'update:user:cost:center'
  | 'delete:user:cost:center'
  | 'create:supplier'
  | 'read:supplier'
  | 'update:supplier'
  | 'delete:supplier'
  | 'create:user'
  | 'read:user'
  | 'update:user'
  | 'delete:user'
  | 'assign:role';

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
  ACO: 'Administrador de compras',
  ACC: 'Administrador de CC',
  'QA/GGT': 'QA/GGT',
};

export type RoleItemName = (typeof ROLEITEMNAME)[keyof typeof ROLEITEMNAME];
