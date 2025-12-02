import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { capitalizeWords } from '../utils';
import { paths } from '../paths';

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    navigate(paths.LOGIN);
  };

  return (
    <aside className="flex-shrink-0 w-64 h-full bg-[#00a6b5] text-white flex flex-col p-6 justify-between shadow-[4px_0_10px_rgba(0,0,0,0.25)]">
      {/* ARRIBA */}
      <div className="flex flex-col gap-8">
        {/* LOGO */}
        <div className="flex justify-center">
          <img
            className="w-1/2"
            src="/public/Grupo-indi-azul.png"
            alt="logo grupo indi"
          />
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex flex-col gap-4">
          <button className="text-left font-semibold text-[18px] px-3 py-2 rounded-lg bg-[#5cadff] hover:bg-[#68b2fc] transition">
            Requisiciones
          </button>
        </nav>
      </div>

      {/* ABAJO: PERFIL + CERRAR SESIÓN */}
      <div className="flex flex-col gap-4">
        {/* PERFIL */}
        <div className="flex items-center gap-3 bg-primaryDark p-3 rounded-lg backdrop-blur-sm shadow-inner">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
            {user?.userName?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="flex flex-col">
            <span className="font-semibold leading-5">
              {capitalizeWords(`${user?.userName} ${user?.userLastName}`)}
            </span>
            <span className="text-sm text-white/80">
              {capitalizeWords(user?.role || 'Sin rol')}
            </span>
          </div>
        </div>

        {/* BOTÓN DE CERRAR SESIÓN */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition font-medium shadow-md"
        >
          <LogOut className="transform rotate-180" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
