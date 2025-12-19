import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  assigneAUserToACC,
  changeStatusCC as changeStatus,
  createCostCenter as create,
  deleteCC,
  type StatusChange,
} from '../services/costCenterService';
import type { USER_BY_CC } from '../../types/costCenter';
import type { ApiError } from '../http';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../paths';

export function useCostCenterMutations() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createCostCenter = useMutation({
    mutationFn: create,
    onSuccess: () => {
      toast.success('Centro de costos creado', {
        description: 'El centro de costos se ha creado correctamente.',
      });
      queryClient.invalidateQueries({
        queryKey: ['cost-center'],
      });
    },
  });

  const inviteAUserToACC = useMutation<void, ApiError, USER_BY_CC>({
    mutationFn: assigneAUserToACC,
    onSuccess: () => {
      toast.success('Asignación creada', {
        description: 'Se ha invitado al usuario correctamente',
      });
      queryClient.invalidateQueries({
        queryKey: ['cost-center-users'],
      });
    },
  });

  const deleteCostCenter = useMutation({
    mutationFn: deleteCC,
    onSuccess: () => {
      navigate(`${paths.ADMIN}/${paths.CC}`);
      toast.success('Centro de costo eliminado', {
        description: 'El centro de costos se ha eliminado correctamente.',
      });
      queryClient.invalidateQueries({
        queryKey: ['cost-center'],
      });
    },
  });

  const changeStatusCC = useMutation({
    mutationFn: ({
      ccId,
      status,
    }: {
      ccId: string;
      status: StatusChange;
    }) => changeStatus(ccId, status),
    onSuccess: (_, { ccId, status }) => {  
      const statusMessage: Record<StatusChange, string> = {
        close: 'cerrado',
        frozen: 'congelado',
        open: 'abierto',
      }    
      toast.success(`Centro de costo ${statusMessage[status]}`, {
        description: `El centro de costos se ha ${statusMessage[status]} correctamente.`,
      });
      queryClient.invalidateQueries({
        queryKey: ['cost-center-by-id', ccId],
      });
    },
  });

  return {
    createCostCenter,
    inviteAUserToACC,
    deleteCostCenter,
    changeStatusCC,
  };
}
