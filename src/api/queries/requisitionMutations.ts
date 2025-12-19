import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRequisition,
  updateRequisition,
  updateSubmitRequisition,
  updateStateRequisition,
  deleteRequisition,
  signRequisition,
} from '../services/requisition';
import type { Requisition } from '../../types';
import { toast } from 'sonner';

export function useRequisitionMutations() {
  const queryClient = useQueryClient();
  const createReq = useMutation({
    mutationFn: createRequisition,
    onSuccess: () => {
      toast.success('Requisición creada', {
        description: 'La requisición ha sido creada correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });
  const updateReq = useMutation({
    mutationFn: ({
      requisitionId,
      data,
    }: {
      requisitionId: string;
      data: Partial<Requisition>;
    }) => updateRequisition(requisitionId, data),
    onSuccess: (_, variables) => {
      toast.success('Requisición actualizada', {
        description: 'La requisición ha sido actualizada correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({
        queryKey: ['requisitionById', variables.requisitionId],
      });
    },
  });
  const submitReq = useMutation({
    mutationFn: updateSubmitRequisition,
    onSuccess: (_, requisitionId) => {
      toast.success('Solicitud de validación', {
        description: 'La requisición ha sido enviada para ser validada.',
      });
      queryClient.invalidateQueries({
        queryKey: ['requisition-history', requisitionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['requisitionById', requisitionId],
      });
    },
  });
  const changeReqState = useMutation({
    mutationFn: updateStateRequisition,
    onSuccess: (_, variables) => {
      toast.success('Validar requisición', {
        description:
          'La requisición ha sido validada correctamente. Podrás consultarlo en el historial.',
      });
      queryClient.invalidateQueries({
        queryKey: ['requisition-history', variables.requisitionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['requisitionById', variables.requisitionId],
      });
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });
  const deleteReq = useMutation({
    mutationFn: deleteRequisition,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['requisitions'] }),
  });
  const signReq = useMutation({
    mutationFn: ({
      requisitionId,
      user,
    }: {
      requisitionId: string;
      user: string;
    }) => signRequisition(requisitionId, user),
    onSuccess: (_, variables) => {
      toast.success('Requisición aprobada', {
        description:
          'La requisición ha sido aprobada correctamente. Podrás consultarlo en el historial.',
      });

      queryClient.invalidateQueries({
        queryKey: ['requisition-history', variables.requisitionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['requisitionById', variables.requisitionId],
      });
    },
  });

  return {
    createReq,
    updateReq,
    submitReq,
    changeReqState,
    deleteReq,
    signReq,
  };
}
