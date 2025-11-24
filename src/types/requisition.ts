export const STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  VALIDATED: 'VALIDATED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;


export type Status = (typeof STATUS)[keyof typeof STATUS];

export const statusLabels: Record<Status, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  VALIDATED: "Validada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export type HistoryRequisition = {
  historyId: string;
  historyObservation: string | null;
  historyAction: Status;
  historyUser: string;
  createdAt: string;
};
