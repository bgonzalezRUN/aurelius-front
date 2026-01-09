import clsx from 'clsx';
import { TruckIcon, UsersIcon } from 'lucide-react';
import { useCallback, useState, type ReactNode } from 'react';
import CollaboratorForm from './CollaboratorForm';
import { BaseButton } from '../common';
import SupplierForm from './SupplierForm';
import { usePopupStore } from '../../store/popup';

type Role = 'user' | 'vendor';

export default function Register() {
  const [role, setRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const { openPopup: openPopupValidate } = usePopupStore();

  const registerType: {
    roleType: Role;
    icon: ReactNode;
    type: string;
    description: string;
  }[] = [
    {
      roleType: 'user',
      icon: <UsersIcon />,
      type: 'Soy colaborador',
      description: 'Gestionar proyectos y materiales internos',
    },
    {
      roleType: 'vendor',
      icon: <TruckIcon />,
      type: 'Soy proveedor',
      description: 'Ofrecer materiales',
    },
  ];

  const goBackHandler = useCallback(() => {
    openPopupValidate({
      title: '¿Estas seguro que quieres volver atras?',
      message: 'Al volver, perderás la información que ingresaste',
      confirmButtonText: 'Volver',
      onConfirm: () => setShowForm(current => !current),
    });
  }, [openPopupValidate]);

  if (showForm) {
    return (
      <>
        {role === 'user' ? (
          <CollaboratorForm goBack={goBackHandler} />
        ) : (
          <SupplierForm goBack={goBackHandler} />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full justify-around flex-wrap [&>*:last-child]:w-80 items-center ">
      <h2 className="text-xl font-semibold text-primaryDark text-center">
        ¿Cómo vas a usar Aurelius?
      </h2>
      <div className="flex justify-around h-3/4 items-center flex-wrap gap-3 w-full">
        {registerType.map(({ roleType, icon, type, description }) => (
          <button
            key={roleType}
            onClick={() => setRole(roleType)}
            className={clsx(
              'flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 text-center max-w-xs w-full h-full',
              'hover:border-primaryHover hover:bg-grey-200',
              role === roleType
                ? 'border-primaryDark bg-teal-50 shadow-md'
                : 'border-slate-200 bg-white shadow-sm'
            )}
          >
            <div
              className={clsx(
                'p-3 rounded-full mb-4',
                role === roleType
                  ? 'bg-primaryDark text-white'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              {icon}
            </div>
            <h3 className="font-bold text-lg text-primaryDark">{type}</h3>
            <p className="text-sm text-grey-700 font-semibold mt-2">
              {description}
            </p>
          </button>
        ))}
      </div>
      <BaseButton
        label="Continuar"
        size="md"
        type="submit"
        variant="primaryDark"
        onclick={() => setShowForm(true)}
      />
    </div>
  );
}
