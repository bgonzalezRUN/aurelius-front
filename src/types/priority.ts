export const PRIORITY = {
  alta: "alta",
  media: "media",
  baja: "baja",
} as const;

export type Priority = typeof PRIORITY[keyof typeof PRIORITY];

const priorityLabels: Record<Priority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};
export const getPriorityLabel = (priority: Priority): string => {
  return priorityLabels[priority] || "Prioridad desconocida";
}