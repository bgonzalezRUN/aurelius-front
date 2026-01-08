import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  assigneAUserToACC,
  changeStatusCC as changeStatus,
  createCostCenter as create,
  deleteCC,
  removeUserFromCC as removeUserService,
  updateCostCenter as updateCostCenterService,
  updateUserCostCenter,
  type StatusChange,
} from '../services/costCenterService';
import type { USER_BY_CC, COST_CENTER } from '../../types/costCenter';
import type { ApiError } from '../http';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { pathsBase } from '../../paths';

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

   const updateCostCenter = useMutation<void, ApiError, { costCenterId: string; data: COST_CENTER }>({
    mutationFn: ({ costCenterId, data }) => updateCostCenterService(costCenterId, data),
    onSuccess: () => {
      toast.success('Centro de costos actualizado', {
        description: 'El centro de costos se ha actualizado correctamente.',
      });
      queryClient.invalidateQueries({
        queryKey: ['cost-center-by-id'],
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

  const updateUserFromCC = useMutation<void, ApiError, { userId: number; roleId: number }>({
    mutationFn: ({ userId, roleId }) => updateUserCostCenter(userId, roleId),
    onSuccess: () => {
      toast.success('Usuario actualizado', {
        description: 'Se ha actualizado el rol en el centro de costos.',
      });
      queryClient.invalidateQueries({
        queryKey: ['cost-center-users'],
      });
    },
  });

  const removeUserFromCC = useMutation({
    mutationFn: removeUserService,
    onSuccess: () => {
      toast.success('Usuario eliminado', {
        description: 'Se ha eliminado al usuario del centro de costos.',
      });
      queryClient.invalidateQueries({
        queryKey: ['cost-center-users'],
      });
    },
  });

  const deleteCostCenter = useMutation({
    mutationFn: deleteCC,
    onSuccess: () => {
      navigate(pathsBase.ACC);
      toast.success('Centro de costo eliminado', {
        description: 'El centro de costos se ha eliminado correctamente.',
      });
      queryClient.invalidateQueries({
        queryKey: ['cost-center'],
      });
    },
  });

  const changeStatusCC = useMutation({
    mutationFn: ({ ccId, status }: { ccId: string; status: StatusChange }) =>
      changeStatus(ccId, status),
    onSuccess: (_, { ccId, status }) => {
      const statusMessage: Record<StatusChange, string> = {
        close: 'cerrado',
        frozen: 'congelado',
        open: 'abierto',
      };
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
    updateCostCenter,
    inviteAUserToACC,
    deleteCostCenter,
    changeStatusCC,
    removeUserFromCC,
    updateUserFromCC,
  };
}
