import { useQuery } from "@tanstack/react-query";
import { getBanks } from "../services/banksServices";

export function useGetBanks() {
  return useQuery({
    queryKey: ['banks'],
    queryFn: () => getBanks(),
  
  });
}
