import { UserPen, UserRoundMinus, UserRoundPlus } from 'lucide-react';
import {
  useCostCenterById,
  useUsersByCostCenter,
} from '../../api/queries/costCenterQuery';
import { BaseButton } from '../common';
import { useCallback, useMemo, useState } from 'react';
import AssignUser from './AssignUser';
import ListWrap from '../common/ListWrap';
import { ROLEITEMNAME } from '../../types';
import WithoutData from '../common/WithoutData';
import { Search } from '../common/Search';
import { filterList } from '../../utils/filterList';
import { usePopupStore } from '../../store/popup';
import { useCostCenterMutations } from '../../api/queries/costCenterMutation';
import type { USER_IN_CC } from '../../types/costCenter';

const tableHeaders = ['Rol', 'Nombre', 'Email', 'Acciones'];

export default function Team({ id }: { id: string }) {
  const { data } = useUsersByCostCenter(id);
  const { data: costCenterData } = useCostCenterById(id);
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);
  const { openPopup: openPopupValidate } = usePopupStore();
  const { removeUserFromCC } = useCostCenterMutations();
  const [query, setQuery] = useState<string>('');
  const [user, setUser] = useState<USER_IN_CC | null>(null);

  const usersFiltered = useMemo(() => {
    const formatData = data?.map(user => ({
      ...user,
      role: { ...user.role, roleLabel: ROLEITEMNAME[user.role.roleName] },
    }));

    return filterList(formatData || [], query, ['user', 'role']);
  }, [data, query]);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const popupHandler = useCallback(() => {
    setUser(null);
    setIsOpenPopup(value => !value);
  }, []);

  const deleteHandler = useCallback(
    (userId: number) => {
      openPopupValidate({
        title: 'Eliminar usuario',
        message: `¿Estas seguro que quieres eliminar al usuario del centro de costos?`,
        onConfirm: () => {
          removeUserFromCC.mutate(userId);
        },
      });
    },
    [openPopupValidate, removeUserFromCC]
  );

  const content = useMemo(() => {
    if (!usersFiltered) return [];
    return usersFiltered.map(value => [
      <p className="text-secondary font-bold">{value.role.roleLabel}</p>,
      <p className="text-grey-primary font-bold">{value.user.userName}</p>,
      <p className="text-grey-primary font-bold">{value.user.userEmail}</p>,
      <div className="flex gap-2 flex-wrap max-w-fit">
        <BaseButton
          label={
            <>
              <UserPen size={18} />
              Editar
            </>
          }
          size="md"
          onclick={() => {
            popupHandler();
            setUser(value);
          }}
          disabled={costCenterData?.costCenterStatus !== 'OPEN'}
        />
        <BaseButton
          label={
            <>
              <UserRoundMinus size={18} />
              Eliminar
            </>
          }
          size="md"
          variant="red"
          onclick={() => deleteHandler(value?.userCostCenterId)}
          disabled={costCenterData?.costCenterStatus !== 'OPEN'}
        />
      </div>,
    ]);
  }, [
    costCenterData?.costCenterStatus,
    deleteHandler,
    popupHandler,
    usersFiltered,
  ]);

  if (!data) return null;

  return (
    <>
      <div className="flex flex-col gap-y-7 items-start">
        <div className="flex items-center w-full gap-x-4">
          <Search
            value={query}
            onChange={handleChange}
            disabled={!data.length}
          />

          <BaseButton
            label={
              <>
                <UserRoundPlus size={18} />
                Invitar miembro
              </>
            }
            size="md"
            onclick={popupHandler}
            disabled={costCenterData?.costCenterStatus !== 'OPEN'}
          />
        </div>

        {!data.length ? (
          <WithoutData message="Actualmente este CC no tiene miembros asignados." />
        ) : (
          <ListWrap tableHeaders={tableHeaders} content={content} />
        )}
      </div>
      {isOpenPopup && (
        <AssignUser
          onClose={popupHandler}
          isOpen={isOpenPopup}
          id={id}
          user={user}
        />
      )}
    </>
  );
}
