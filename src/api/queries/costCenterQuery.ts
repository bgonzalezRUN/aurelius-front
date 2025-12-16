import { useQuery } from '@tanstack/react-query';
import { getCostCenter, getCostCenterById, getUsersByCostCenter } from '../services/costCenterService';


export function useCostCenter(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['cost-center'],
    queryFn: () => getCostCenter(filters),
  });
}


export function useCostCenterById(id: string) {
  return useQuery({
    queryKey: ['cost-center', id],
    queryFn: () => getCostCenterById(id!),
    enabled: !!id,
  });
}

export function useUsersByCostCenter(id: string) {
  return useQuery({
    queryKey: ['cost-center-users', id],
    queryFn: () => getUsersByCostCenter(id!),
    enabled: !!id,
  });
}