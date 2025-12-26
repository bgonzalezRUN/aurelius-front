import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRequisition,
  updateRequisition,
  updateSubmitRequisition,
  updateStateRequisition,
  deleteRequisition,
  signRequisition,
} from '../services/requisition';
import type { BackendPayload, Requisition } from '../../types';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

export function useRequisitionMutations() {
  const queryClient = useQueryClient();
  const { costCenterId } = useParams();

  const createReq = useMutation({
    mutationFn: (data: BackendPayload) =>
      createRequisition(data, costCenterId || ''),
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
    }) => updateRequisition(requisitionId, data, costCenterId || ''),
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
    mutationFn: (requisitionId: string) =>
      updateSubmitRequisition(requisitionId, costCenterId || ''),
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
      const type = {
        reject: { title: 'Rechazar', content: 'rechazada' },
        validate: { title: 'Validar', content: 'validada' },
      };

      toast.success(`${type[variables.type].title} requisición`, {
        description: `La requisición ha sido ${
          type[variables.type].content
        } correctamente. Podrás consultarlo en el historial.`,
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
    mutationFn: (requisitionId: string) =>
      deleteRequisition(requisitionId, costCenterId || ''),
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
