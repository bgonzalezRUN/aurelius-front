import { useCallback, useEffect, useState } from 'react';
import { BaseButton, Dialog } from '../common';
import { useForm } from 'react-hook-form';
import { FileInput, Input, Textarea, type FileSelection } from '../form';
import type { COST_CENTER, KeyofCostCenter } from '../../types/costCenter';
import { useCostCenterMutations } from '../../api/queries/costCenterMutation';
import { validateFileSize } from '../../utils/validateFileSize';
import { trimValue } from '../../utils/string';
import { useCostCenterById } from '../../api/queries/costCenterQuery';
import { CircleAlert } from 'lucide-react';

const MAX_FILE_SIZE = 10485760;

export default function CreationForm({
  onClose,
  isOpen,
  ccId,
}: {
  onClose: () => void;
  isOpen: boolean;
  ccId?: string;
}) {
  const { data: costCenterData } = useCostCenterById(ccId || '');
  const { createCostCenter, updateCostCenter } = useCostCenterMutations();
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (createCostCenter.isSuccess) {
      onClose();
    }
    if (updateCostCenter.isSuccess) {
      onClose();
    }
  }, [createCostCenter.isSuccess, updateCostCenter.isSuccess, onClose]);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isValid, dirtyFields },
  } = useForm<COST_CENTER>({
    mode: 'onChange',
    defaultValues: costCenterData
      ? {
          costCenterName: costCenterData.costCenterName,
          costCenterAddress: costCenterData.costCenterAddress,
          costCenterDescription: costCenterData.costCenterDescription,
        }
      : {},
  });

  const onSubmit = (data: COST_CENTER) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value)
    );
    if (costCenterData) {
      updateCostCenter.mutate({
        costCenterId: ccId!,
        data: { ...cleanData, filesToDelete } as COST_CENTER,
      });
      return;
    }
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

  const deleteFileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    if (checked) {
      setFilesToDelete(prev => [...prev, value]);
    } else {
      setFilesToDelete(prev => prev.filter(id => id !== value));
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title={
        costCenterData ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo'
      }
      onClose={onClose}
    >
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
          registration={register('costCenterDescription', {
            setValueAs: trimValue,
          })}
          errorMessage={errors.costCenterDescription?.message}
        />
        {costCenterData &&
          costCenterData.files &&
          costCenterData.files.length > 0 && (
            <>
              <p className="inline-flex items-center gap-x-2 text-primaryDark font-bold mb-2">
                <CircleAlert />
                Seleccione los archivos que desea eliminar
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                {costCenterData.files.map(file => {
                  const isChecked = filesToDelete.includes(
                    file.costCenterFileId.toString()
                  );
                  return (
                    <div
                      key={file.costCenterFileId}
                      className="flex items-center px-1 text-gray-700 "
                      role="option"
                      aria-selected={isChecked}
                    >
                      <input
                        type="checkbox"
                        value={file.costCenterFileId}
                        name={file.costCenterFileId.toString()}
                        checked={isChecked}
                        onChange={deleteFileHandler}
                        className="h-4 w-4 flex-shrink-0 text-primaryDark rounded focus:ring-primary-primary border-gray-300 cursor-pointer"
                      />

                      <label className="ml-3 text-sm font-medium">
                        {file.fileName}
                      </label>
                    </div>
                  );
                })}
              </div>
            </>
          )}
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
            label={
              costCenterData
                ? 'Editar Centro de Costo'
                : 'Crear Centro de Costo'
            }
            size="md"
            type="submit"
            disabled={!isValid || !Object.keys(dirtyFields).length}
          />
        </div>
      </form>
    </Dialog>
  );
}
