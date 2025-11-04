import { useState } from "react";
import { register } from "../api/authService";

export const RegisterPage = () => {

    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }
      try {
        await register(name, lastName, email, password, role);
        setLoading(false);
        window.location.href = "/";
      } catch (error) {
        setError("Error al registrar");
        setLoading(false);
      }
    };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-start sm:items-center justify-center p-4">
      <main className="w-full max-w-md">
        <div className="flex items-center mb-4 select-none gap-10 pl-15">
          <div className="bg-blue-500 rounded-full">
            <img
              src="/public/logoGI.png"
              alt="Aurelius Logo"
              className="relative w-12 h-12 object-contain drop-shadow-sm z-10"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="mt-3 text-2xl text-center font-semibold text-cyan-800">Aurelius</h1>
            <p className="text-slate-500 text-sm">Sistema de Compras Inteligente</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-sm mb-4">
            <button onClick={() => window.location.href = '/'} className="rounded-lg py-2 text-slate-500 hover:text-blue-600 font-medium">Iniciar Sesión</button>
            <button onClick={() => window.location.href = '/register'} className="rounded-lg py-2 bg-white shadow-sm font-medium "
            >
              Registrarse
            </button>
          </div>

          <h2 className="text-xl font-semibold text-slate-800">Crear cuenta</h2>
          <p className="text-slate-500 text-sm mb-5">Crea una cuenta de Aurelius</p>

          {/* form login */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
             <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Apellido</label>
              <input
                id="lastName"
                type="text"
                autoComplete="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Tu apellido"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700">Rol</label>
              <select
                id="role"
                autoComplete="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un rol</option>
                <option value="requester">Solicitante</option>
                <option value="director">Director</option>
                <option value="superintendent">Superintendente</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Confirmar Contraseña</label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {showConfirmPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <input
                id="password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 disabled:opacity-60"
            >
              {loading ? "Creando Cuenta..." : "Crear Cuenta"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
