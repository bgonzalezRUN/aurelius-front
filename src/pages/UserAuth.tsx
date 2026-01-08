import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { paths, pathsBase } from '../paths';
import Login from '../components/auth/Login';
// import FormCollaborator from '../components/auth/FormCollaborator';
import clsx from 'clsx';
import { useAuthStore } from '../store/auth';
import Register from '../components/auth/Register';

export default function UserAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === paths.LOGIN;
  const { getUser } = useAuthStore();
  const user = getUser();

  if (user && isLoginPage) {
    let to;
    if (user.userType === 'ADMIN' && user.role in pathsBase) {
      const path = pathsBase[user.role as keyof typeof pathsBase];
      to = path;
    } else {
      to = paths.BASE;
    }
    return <Navigate to={to} replace />;
  }

  return (
    <div className="h-screen bg-linear-to-br from-white to-blue-50 flex items-start sm:items-center justify-center p-4 overflow-hidden">
      <main className="w-full max-w-3xl h-full flex flex-col justify-center">
        <div className="flex flex-col justify-center items-center mb-4 select-none flex-shrink-0">
          <div className="bg-primaryDark rounded-full p-2">
            <img
              src="/public/logoGI.png"
              alt="Aurelius Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-semibold text-primaryDark">
              Aurelius
            </h1>
            <p className="text-slate-500 text-sm">
              Sistema de Compras Inteligente
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-5 flex flex-col flex-1 min-h-0 items-center max-h-[41rem]">
          <div className="flex-shrink-0 grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-sm mb-2 font-bold max-w-[70%] w-full">
            <button
              onClick={() => navigate(paths.LOGIN)}
              className={clsx(
                'rounded-lg py-2 shadow-sm font-medium transition-colors',
                isLoginPage
                  ? 'bg-white text-black'
                  : 'text-slate-500 hover:text-primaryDark'
              )}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate(paths.REGISTER)}
              className={clsx(
                'rounded-lg py-2 shadow-sm font-medium transition-colors',
                !isLoginPage
                  ? 'bg-white text-black'
                  : 'text-slate-500 hover:text-primaryDark'
              )}
            >
              Registrarse
            </button>
          </div>

          <div className="flex flex-col h-full overflow-hidden w-full">
            {isLoginPage ? <Login /> : <Register />}
          </div>
        </div>
      </main>
    </div>
  );
}
