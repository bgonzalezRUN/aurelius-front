export const PRIORITY = {
  alta: "alta",
  media: "media",
  baja: "baja",
} as const;

export type Priority = typeof PRIORITY[keyof typeof PRIORITY];

