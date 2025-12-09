export const VIEW = {
  LIST: "LIST",
  CARD: "CARD",
} as const;

export type ViewKey = keyof typeof VIEW;     
export type ViewValue = (typeof VIEW)[ViewKey];
