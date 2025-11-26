export const ROLES = {
  solicitante: [
    "create:requisition",
    "read:requisition",
    "update:requisition",
    "delete:requisition",
    "submit:requisition",
  ],
  "gerente de obra": [
    "create:requisition",
    "read:requisition",
    "update:requisition",
    "delete:requisition",
    "reject:requisition",
    "validate:requisition",
  ],
  "director de obra": [
    "read:requisition",
    "approve:requisition",
    "reject:requisition",
  ],
  "auxiliar de compras": ["read:requisition", "send_to_purchase:requisition"],
  "QA/GGT": [],
} as const;

export type RoleName = keyof typeof ROLES;
export type Permission = (typeof ROLES)[RoleName][number];
