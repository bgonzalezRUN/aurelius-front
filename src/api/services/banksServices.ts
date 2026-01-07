import type { Bank } from "../../types/banks";
import api from "../http";

export const getBanks = async (): Promise<Bank[]> => {
  const res = await api.get(`/institutions`);
  return res.data;
};