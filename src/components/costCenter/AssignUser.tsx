import { BaseButton, Dialog } from '../common';
import { useCostCenterMutations } from '../../api/queries/costCenterMutation';
import type { USER_BY_CC, USER_IN_CC } from '../../types/costCenter';
import { useForm } from 'react-hook-form';
import { Input, Select } from '../form';
import { emailRegex } from '../../types/regex';
import { ROLEITEM, ROLEITEMNAME } from '../../types/roles';
import { useEffect } from 'react';
import ErrorMessage from '../common/ErrorMessage';

export default function AssignUser({
  onClose,
  isOpen,
  id,
  user,
}: {
  onClose: () => void;
  isOpen: boolean;
  id: string;
  user: USER_IN_CC | null;
}) {
  const { inviteAUserToACC, updateUserFromCC } = useCostCenterMutations();

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isValid, dirtyFields },
  } = useForm<USER_BY_CC>({
    mode: 'onChange',
    defaultValues: user
      ? { userEmail: user.user.userEmail, roleId: user.role.roleId }
      : {},
  });

  const { roleId } = watch();

  const onSubmit = (data: USER_BY_CC) => {
    if (user) {
      updateUserFromCC.mutate({
        userId: user.userCostCenterId,
        roleId: Number(data.roleId),
      });
      return;
    }
    inviteAUserToACC.mutate({
      ...data,
      costCenterId: Number(id),
      roleId: Number(data.roleId),
    });
  };

  useEffect(() => {
    if (inviteAUserToACC.isSuccess) onClose();
    if (updateUserFromCC.isSuccess) onClose();
  }, [inviteAUserToACC.isSuccess, updateUserFromCC.isSuccess, onClose]);

  return (
    <Dialog isOpen={isOpen} title="Invitar miembro" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-x-2 [&>div]:w-2/4 ">
          <Input
            label="Correo"
            registration={register('userEmail', {
              required: 'Escribe tu correo electrónico',
              pattern: {
                value: emailRegex,
                message: 'Ingresa un correo válido',
              },
            })}
            errorMessage={errors.userEmail?.message}
            name="userEmail"
            type="email"
            disabled={Boolean(user)}
          />
          <Select
            name="roleId"
            label="Rol"
            registration={register('roleId', {
              required: 'Selecciona la prioridad',
            })}
            errorMessage={errors.roleId?.message}
            options={Object.entries(ROLEITEM)?.map(([key, value]) => ({
              value: key,
              label: ROLEITEMNAME[value],
            }))}
            setValue={setValue}
            currentValue={roleId?.toString()}
          />
        </div>
        <ErrorMessage
          errorMessage={inviteAUserToACC?.error?.userMessage}
          name="assign-user"
        />
        <div className="flex justify-end mt-4 gap-x-4">
          <BaseButton
            label="Cancelar"
            onclick={onClose}
            size="md"
            variant="secondary"
          />
          <BaseButton
            label="Aceptar"
            size="md"
            type="submit"
            disabled={!isValid || !Object.keys(dirtyFields).length}
            isLoading={inviteAUserToACC.isPending}
          />
        </div>
      </form>
    </Dialog>
  );
}
