export const STATUSDOCUMENT = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  VALIDATED: "VALIDATED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;


export type StatusDocument = typeof STATUSDOCUMENT[keyof typeof STATUSDOCUMENT];


export const statusLabelsDocument: Record<StatusDocument, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  VALIDATED: "Validada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export const statusLabelsHistory: Partial<Record<StatusDocument, string>> = {
  PENDING: "Enviada a validación",
  VALIDATED: "Enviada a aprobación",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};