import { useCallback, useEffect } from 'react';
import { BaseButton, Dialog } from '../common';
import { useForm } from 'react-hook-form';
import { FileInput, Input, Textarea, type FileSelection } from '../form';
import type { COST_CENTER, KeyofCostCenter } from '../../types/costCenter';
import { useCostCenterMutations } from '../../api/queries/costCenterMutation';
import { validateFileSize } from '../../utils/validateFileSize';
import { trimValue } from '../../utils/string';

const MAX_FILE_SIZE = 10485760;

export default function CreationForm({
  onClose,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
}) {
  const {
    handleSubmit,
    register,
    setValue,     
    formState: { errors, isValid },
  } = useForm<COST_CENTER>({ mode: 'onChange' });
  const { createCostCenter } = useCostCenterMutations();
  useEffect(() => {
    if (createCostCenter.isPending) {
      onClose();
    }
  }, [createCostCenter.isPending, onClose]);

  const onSubmit = (data: COST_CENTER) => {
    const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value )
  );    
    createCostCenter.mutate(cleanData as COST_CENTER);
  };

  const handleFilesSelected = useCallback(
  (data: FileSelection) => {
    const { inputName, files } = data;
    if (!inputName) return;    
    let valueToSet: File | File[] | string = '';

    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      valueToSet = filesArray.length === 1 ? filesArray[0] : filesArray;
    }    
    setValue(inputName as KeyofCostCenter, valueToSet, {
      shouldValidate: true,
      shouldDirty: true,
    });
  },
  [setValue]
);
  return (
    <Dialog isOpen={isOpen} title="Nuevo Centro de Costo" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="hidden"
          {...register('costCenterCalender', {
            validate: value => validateFileSize(value as File, MAX_FILE_SIZE),
          })}
        />
        <input
          type="hidden"
          {...register('costCenterBudget', {
            validate: value => validateFileSize(value as File[], MAX_FILE_SIZE),
          })}
        />
        <input
          type="hidden"
          {...register('costCenterRules', {
            validate: value => validateFileSize(value as File[], MAX_FILE_SIZE),
          })}
        />
        <div className="flex gap-x-2 [&>div]:w-2/4">
          <Input
            label="Nombre"
            registration={register('costCenterName', {
              setValueAs: trimValue,
              required: 'Escribe el nombre del centro de costos.',
            })}
            errorMessage={errors.costCenterName?.message}
            name="costCenterName"
          />
          <Input
            label="Dirección"
            registration={register('costCenterAddress', {
              required: 'Escribe la dirección del centro de costos.',
              setValueAs: trimValue,
            })}
            errorMessage={errors.costCenterAddress?.message}
            name="costCenterAddress"
          />
        </div>
        <Textarea
          label="Descripción"
          name="costCenterDescription"
          registration={register('costCenterDescription',{
            setValueAs: trimValue,
          })}
          errorMessage={errors.costCenterDescription?.message}
        />
        <FileInput
          label="Calendario"
          name="costCenterCalender"
          accept="application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,.xls,.xlsx,.csv"
          onFilesSelected={handleFilesSelected}
          errorMessage={errors.costCenterCalender?.message}
        />
        <FileInput
          label="Presupuesto"
          name="costCenterBudget"
          accept="application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,.xls,.xlsx,.csv"
          onFilesSelected={handleFilesSelected}
          errorMessage={errors.costCenterBudget?.message}
          multiple
        />
        <FileInput
          label="Reglas"
          name="costCenterRules"
          accept="application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,.xls,.xlsx,.csv"
          onFilesSelected={handleFilesSelected}
          errorMessage={errors.costCenterRules?.message}
          multiple
        />
        <div className="flex justify-end mt-4">
          <BaseButton
            label="Crear centro de costos"
            size="md"
            type="submit"
            disabled={!isValid}
          />
        </div>
      </form>
    </Dialog>
  );
}
