import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth";
import { getSuppliernById, getSuppliers } from "../services/supplier";

export function useSupplier(filters?: Record<string, unknown>) {
  const { getUser } = useAuthStore();
  const user = getUser();    
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => getSuppliers(filters),
    enabled: !!user && user.role === 'ACO',    
  });
}

export function useSupplierById(id: string) {  
  return useQuery({
    queryKey: ['supplierById', id],
    queryFn: () => getSuppliernById(id),
    enabled: !!id,
  });
}
