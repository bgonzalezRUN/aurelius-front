import { FolderDot, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { capitalizeWords } from '../utils';
import { BaseButton } from './common';
import { useNavigate } from 'react-router-dom';
import { paths } from '../paths';

export default function Sidebar() {
  const { getUser, logout } = useAuthStore();
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    navigate(paths.LOGIN);
  };

  return (
    <>
      <aside className="flex-shrink-0 w-64 h-full bg-white flex flex-col items-center pt-8 border-primary-primary border-r shadow-[8px_0_6px_-1px_rgba(0,166,180,0.25)] mr-2">
        <div className="flex justify-center w-28 h-16 mb-10">
          <img
            className="w-full"
            src="/public/Grupo-indi-azul.png"
            alt="logo grupo indi"
          />
        </div>

        <nav className="flex flex-col gap-4 w-full px-6">
          <button className="h-11 w-full flex items-center gap-3 px-4 text-white font-semibold text-lg rounded-lg bg-primary-primary hover:bg-primaryHover transition">
            <FolderDot />
            Proyectos
          </button>
        </nav>

        <div className="w-full border-t border-grey-50 pt-8 mt-auto px-6 min-h-24 flex flex-col gap-y-8 pb-7">
          <div className="flex gap-x-4 items-center">
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
                className="text-primary-500 truncate"
                title={capitalizeWords(user?.role || 'Sin rol')}
              >
                {capitalizeWords(user?.role || 'Sin rol')}
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
