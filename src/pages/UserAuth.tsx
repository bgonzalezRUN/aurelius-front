import { useNavigate, useLocation } from 'react-router-dom';
import { paths } from '../paths';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import clsx from 'clsx';

export default function UserAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === paths.LOGIN;

  return (
    <div className="h-screen bg-linear-to-br from-white to-blue-50 flex items-start sm:items-center justify-center p-4">
      <main className="w-full max-w-md">
        <div className="flex flex-col justify-center items-center mb-4 select-none gap-6">
          <div className="bg-[#01687d] rounded-full p-2">
            <img
              src="/public/logoGI.png"
              alt="Aurelius Logo"
              className="w-12 h-12 object-contain drop-shadow-sm"
            />
          </div>

          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-semibold text-[#01687d]">Aurelius</h1>
            <p className="text-slate-500 text-sm">
              Sistema de Compras Inteligente
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-sm mb-4 font-bold">
            <button
              onClick={() => navigate(paths.LOGIN)}
              className={clsx(
                'rounded-lg py-2 shadow-sm font-medium hover:text-primaryDark text-black',
                isLoginPage && 'bg-white ',
                !isLoginPage && 'text-slate-500'
              )}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate(paths.REGISTER)}
              className={clsx(
                'rounded-lg py-2 shadow-sm font-medium hover:text-primaryDark text-black',
                !isLoginPage && 'bg-white text-black',
                isLoginPage && 'text-slate-500'
              )}
            >
              Registrarse
            </button>
          </div>

          {isLoginPage ? <Login /> : <Register />}
        </div>
      </main>
    </div>
  );
}
