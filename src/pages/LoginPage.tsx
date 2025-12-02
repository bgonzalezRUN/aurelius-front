import React, { useState } from 'react';
import { login } from '../api/authService';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { jwtDecode } from 'jwt-decode';
import type { RoleName } from '../types/roles';
import { useNavigate } from 'react-router-dom';
import { paths } from '../paths';

interface DecodedToken {
  userName?: string;
  userLastName?: string;
  role: RoleName;
}

export default function LoginPage() {
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(userEmail, userPassword);
      const decoded = jwtDecode<DecodedToken>(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(decoded);
      setLoading(false);
      navigate(paths.REQUISITIONS);
    } catch (error) {
      setError('Correo o contraseña incorrectos' + error);
      setLoading(false);
    }
  };

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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-sm mb-4">
            <button className="rounded-lg py-2 bg-white shadow-sm font-medium">
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate(paths.REGISTER)}
              className="rounded-lg py-2 text-slate-500 hover:text-[#01687d] font-medium"
            >
              Registrarse
            </button>
          </div>

          <h2 className="text-xl font-semibold text-slate-800">
            Iniciar Sesión
          </h2>
          <p className="text-slate-500 text-sm mb-5">
            Accede a tu cuenta de Aurelius
          </p>

          {/* form login */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                placeholder="example@example.com"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#01687d] focus:border-[#01687d]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={userPassword}
                  onChange={e => setUserPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#01687d] focus:border-[#01687d]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 font-medium bg-[#01687d] text-white hover:bg-[#027c94] disabled:opacity-60"
            >
              {loading ? 'Ingresando…' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        {/* enlaces auxiliares */}
        <div className="mt-4 text-center text-sm text-slate-500">
          <a
            href={paths.RECOVER_PASSWORD}
            className="hover:text-blue-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </main>
    </div>
  );
}
