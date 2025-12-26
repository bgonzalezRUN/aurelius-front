import { useQuery } from '@tanstack/react-query';
import {
  getCostCenter,
  getCostCenterById,
  getUsersByCostCenter,
} from '../services/costCenterService';
import { useAuthStore } from '../../store/auth';

export function useCostCenter(filters?: Record<string, unknown>) {
  const { getUser } = useAuthStore();
  const user = getUser();    
  return useQuery({
    queryKey: ['cost-center', filters],
    queryFn: () => getCostCenter(filters),
    enabled: !!user && user.isAdminCC,
  });
}

export function useCostCenterById(id: string) {
  return useQuery({
    queryKey: ['cost-center-by-id', id],
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
