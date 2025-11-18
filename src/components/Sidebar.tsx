import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user: any = token ? jwtDecode(token) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="w-64 h-screen bg-[#00a6b5] text-white flex flex-col p-6 justify-between shadow-[4px_0_10px_rgba(0,0,0,0.25)]">
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
        <div className="flex items-center gap-3 bg-[#01687d] p-3 rounded-lg backdrop-blur-sm shadow-inner">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
            {user?.userName?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="flex flex-col">
            <span className="font-semibold leading-5">
              {user?.userName + " " + user?.userLastName ||
                "usuario@example.com"}
            </span>
            <span className="text-sm text-white/80">
              {user?.role || "Sin rol"}
            </span>
          </div>
        </div>

        {/* BOTÓN DE CERRAR SESIÓN */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition font-medium shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 002 2h3a2 2 0 002-2V7a2 2 0 00-2-2h-3a2 2 0 00-2 2v1"
            />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
