import { useQuery } from '@tanstack/react-query';
import {
  getRequisitions,
  getRequisitionById,
  searchRequisitionsByProject,
  historyRequisition,
  getCategories,
} from '../services/requisition';
import type { RequisitionFilter } from '../../types';
import { useParams } from 'react-router-dom';

export function useRequisitions(filters?: RequisitionFilter) {  
  return useQuery({
    queryKey: ['requisitions', filters],  
    queryFn: () => getRequisitions(filters),
  });
}

export function useRequisitionById(id: string) {
  const { costCenterId } = useParams();
  return useQuery({
    queryKey: ['requisitionById', id],
    queryFn: () => getRequisitionById(id!, costCenterId||''),
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