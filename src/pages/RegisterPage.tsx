import { useState } from "react";
import { register } from "../api/authService";
import { Eye, EyeOff } from "lucide-react";
import { paths } from "../paths";
import { useNavigate } from "react-router-dom";

export const RegisterPage = () => {
  const [userName, setUserName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (userPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    try {
      await register(userName, userLastName, userEmail, userPassword);
      setLoading(false);
      navigate(paths.LOGIN)
    } catch (error) {
      setError("Error al registrar" + error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-linear-to-br from-white to-blue-50 flex items-start sm:items-center justify-center p-4">
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
            <button
              onClick={() => navigate(paths.LOGIN)}
              className="rounded-lg py-2 text-slate-500 hover:text-[#01687d] font-medium"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate(paths.REGISTER)}
              className="rounded-lg py-2 bg-white shadow-sm font-medium "
            >
              Registrarse
            </button>
          </div>

          <h2 className="text-xl font-semibold text-slate-800">Crear cuenta</h2>
          <p className="text-slate-500 text-sm mb-5">
            Crea una cuenta de Aurelius
          </p>

          {/* form login */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                Nombre
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Tu nombre"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#01687d] focus:border-[#01687d]"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-slate-700"
              >
                Apellido
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="lastName"
                required
                value={userLastName}
                onChange={(e) => setUserLastName(e.target.value)}
                placeholder="Tu apellido"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#01687d] focus:border-[#01687d]"
              />
            </div>
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
                onChange={(e) => setUserEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  minLength={8}
                  required
                  placeholder="••••••••"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
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
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Confirmar Contraseña
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#01687d] focus:border-[#01687d]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
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
              {loading ? "Creando Cuenta..." : "Crear Cuenta"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
