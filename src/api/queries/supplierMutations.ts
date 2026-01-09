import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSupplier as create,
  deleteSupplier as deleteSupplierFn,
  type StatusChange,
  changeStatusSupplier as changeStatus,
  updateSupplier as updateSupplierFn,
} from '../services/supplier';
import type { ApiError } from '../http';
import type { SupplierDTO } from '../../types/supplier';
import { usePopupStore } from '../../store/popup';
import { useNavigate } from 'react-router-dom';
import { pathsBase } from '../../paths';
import { toast } from 'sonner';

export function useSupplierMutations() {
  const queryClient = useQueryClient();
  const { openPopup: openPopupValidate } = usePopupStore();
  const navigate = useNavigate();

  const createSupplier = useMutation<void, ApiError, SupplierDTO>({
    mutationFn: create,
    onSuccess: () => {
      openPopupValidate({
        title: 'Proveedor creado',
        message:
          'El proveedor se ha creado correctamente, podrás iniciar sesión con el email de comercial que proporcionaste',
        confirmButtonText: 'Entendido',
      });
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: deleteSupplierFn,
    onSuccess: () => {
      navigate(pathsBase.ACO);
      toast.success('Proveedor eliminado', {
        description: 'El proveedor se ha eliminado correctamente.',
      });
      queryClient.invalidateQueries({
        queryKey: ['suppliers'],
      });
    },
  });

  const changeStatusSupplier = useMutation({
    mutationFn: ({
      supplierId,
      status,
    }: {
      supplierId: string;
      status: StatusChange;
    }) => changeStatus(supplierId, status),
    onSuccess: (_, { supplierId, status }) => {
      const statusMessage: Record<StatusChange, string> = {
        suspend: 'suspendido',
        block: 'bloqueado',
        active: 'activado',
      };
      toast.success(`Centro de costo ${statusMessage[status]}`, {
        description: `El centro de costos se ha ${statusMessage[status]} correctamente.`,
      });
      queryClient.invalidateQueries({
        queryKey: ['supplierById', supplierId],
      });
    },
  });

  const updateSupplier = useMutation<
    void,
    ApiError,
    { supplierId: string; data: SupplierDTO }
  >({
    mutationFn: ({ supplierId, data }) => updateSupplierFn(supplierId, data),
    onSuccess: () => {
      toast.success('Proveedor actualizado', {
        description: 'El proveedor se ha actualizado correctamente.',
      });
      queryClient.invalidateQueries({
        queryKey: ['supplierById'],
      });
    },
  });

  return {
    createSupplier,
    deleteSupplier,
    changeStatusSupplier,
    updateSupplier,
  };
}
