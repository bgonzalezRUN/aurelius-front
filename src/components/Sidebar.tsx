import { FolderRoot, LogOut, Package } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { capitalizeWords } from '../utils';
import { BaseButton } from './common';
import { useNavigate } from 'react-router-dom';
import { paths } from '../paths';
import { useCostCenter } from '../api/queries/costCenterQuery';
import CCItem from './sidebar/CCItem';
import { useCallback, useState } from 'react';
import { usePermission } from '../hooks/usePermission';
import { ROLEITEMNAME } from '../types';

type Options = 'project';

export default function Sidebar() {
  const { getUser, logout } = useAuthStore();
  const user = getUser();
  const { rol } = usePermission();
  const navigate = useNavigate();
  const { data } = useCostCenter({ limit: 50 });
  const [idProject, setProjectId] = useState<number | null>(null);
  const [optionOpen, setOptionOpen] = useState<Options | ''>('project');

  const handleLogout = () => {    
    logout();
    navigate(paths.LOGIN);
  };

  const optionOpenHandler = (newValue: Options) => {
    setOptionOpen(value => (value === newValue ? '' : newValue));
  };

  const setProjectIDHandler = useCallback(
    (id: number) => {
      if (id === idProject) setProjectId(null);
      else {
        setProjectId(id);
      }
    },
    [idProject]
  );

  const centerCosts = user?.userType === 'ADMIN' ? data?.data : user?.costCenter;

  return (
    <>
      <aside className="flex-shrink-0 w-64 h-full max-h-screen py-5 bg-white flex flex-col border-primary-primary border-r shadow-[8px_0_6px_-1px_rgba(0,166,180,0.25)] mr-2">
        <div className="flex-none">
          <div className="flex justify-center w-28 h-16 mb-5 mx-auto">
            <img
              className="w-full"
              src="/public/Grupo-indi-azul.png"
              alt="logo grupo indi"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 px-6 overflow-hidden pb-2">
          <div className="h-full overflow-y-auto py-2">
            <div className="flex flex-col gap-4">
              <BaseButton
                label={
                  <>
                    <Package />
                    Proveedores
                  </>
                }
                size="md"
                onclick={() => navigate(paths.SUPPLIER)}
              />
              <BaseButton
                label={
                  <>
                    <FolderRoot />
                    Proyectos
                  </>
                }
                size="md"
                onclick={() => optionOpenHandler('project')}
              />
              {optionOpen === 'project' && (
                <>
                  {centerCosts?.map(item => (
                    <CCItem
                      key={item?.costCenterId}
                      costCenterId={item?.costCenterId.toString() || ''}
                      isOpen={idProject === Number(item?.costCenterId)}
                      setIsOpen={setProjectIDHandler}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-none w-full border-t border-grey-50 pt-5 px-6 flex flex-col">
          <div className="flex gap-x-4 items-center mb-4">
            <div className="w-10 h-10 rounded-full flex-none">
              <img className="w-full" src="/public/user.png" alt="" />
            </div>
            <div className="font-semibold text-base leading-none w-full overflow-hidden">
              <p
                className="text-grey-700 truncate"
                title={capitalizeWords(
                  `${user?.userName} ${user?.userLastName}`
                )}
              >
                {capitalizeWords(`${user?.userName} ${user?.userLastName}`)}
              </p>
              <p
                className="text-primary-500 line-clamp-2"
                title={(rol && ROLEITEMNAME[rol]) || 'Sin rol'}
              >
                {(rol && ROLEITEMNAME[rol]) || 'Sin rol'}
              </p>
            </div>
          </div>
          <BaseButton
            label={
              <>
                <LogOut className="transform rotate-180" size={18} />
                Cerrar sesión
              </>
            }
            size="md"
            onclick={handleLogout}
          />
        </div>
      </aside>
    </>
  );
}
