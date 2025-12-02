import { useQuery } from '@tanstack/react-query';
import {
  getRequisitions,
  getRequisitionById,
  searchRequisitionsByProject,
  historyRequisition,
  getCategories,
} from '../services/requisition';

export function useRequisitions(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['requisitions', filters],  
    queryFn: () => getRequisitions(filters),
  });
}

export function useRequisitionById(id: string) {
  return useQuery({
    queryKey: ['requisitionById', id],
    queryFn: () => getRequisitionById(id!),
    enabled: !!id,
  });
}

export function useSearchRequisitions(projectName: string) {
  return useQuery({
    queryKey: ['requisitionsSearch', projectName],
    queryFn: () => searchRequisitionsByProject(projectName),
    enabled: projectName.trim().length > 0,
  });
}

export function useRequisitionHistory(id: string) {
  return useQuery({
    queryKey: ['requisition-history', id],
    queryFn: () => historyRequisition(id!),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
}