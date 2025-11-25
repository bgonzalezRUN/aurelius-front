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
