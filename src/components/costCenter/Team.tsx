import { UserRoundMinus, UserRoundPlus } from 'lucide-react';
import { useUsersByCostCenter } from '../../api/queries/costCenterQuery';
import { BaseButton } from '../common';
import { useCallback, useMemo, useState } from 'react';
import AssignUser from './AssignUser';
import ListWrap from '../common/ListWrap';
import { ROLEITEMNAME } from '../../types';
import WithoutData from '../common/WithoutData';
import { Search } from '../common/Search';
import { filterList } from '../../utils/filterList';

const tableHeaders = ['Rol', 'Nombre', 'Email', 'Acciones'];

export default function Team({ id }: { id: string }) {
  const { data } = useUsersByCostCenter(id);
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');

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
    setIsOpenPopup(value => !value);
  }, []);

  const content = useMemo(() => {
    if (!usersFiltered) return [];
    return usersFiltered.map(value => [
      <p className="text-secondary font-bold">{value.role.roleLabel}</p>,
      <p className="text-grey-primary font-bold">{value.user.userName}</p>,
      <p className="text-grey-primary font-bold">{value.user.userEmail}</p>,
      <div className="max-w-fit">
        <BaseButton
          label={
            <>
              <UserRoundMinus size={18} />
              Eliminar
            </>
          }
          size="md"
          onclick={popupHandler}
          disabled
        />
      </div>,
    ]);
  }, [popupHandler, usersFiltered]);

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
          />
        </div>

        {!data.length ? (
          <WithoutData message="Actualmente este CC no tiene miembros asignados." />
        ) : (
          <ListWrap tableHeaders={tableHeaders} content={content} />
        )}
      </div>
      {isOpenPopup && (
        <AssignUser onClose={popupHandler} isOpen={isOpenPopup} id={id} />
      )}
    </>
  );
}
