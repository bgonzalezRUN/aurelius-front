import React, { useState } from "react";
import { login } from "../api/authService";

export default function LoginPage() {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(userEmail, userPassword);
      localStorage.setItem("token", res.data.token);

      setLoading(false);
      window.location.href = "/reqs";
    } catch (error) {
      setError("Correo o contraseña incorrectos");
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
            <h1 className="mt-3 text-2xl text-center font-semibold text-cyan-800">
              Aurelius
            </h1>
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
              onClick={() => (window.location.href = "/register")}
              className="rounded-lg py-2 text-slate-500 hover:text-blue-600 font-medium"
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
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                required
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 disabled:opacity-60"
            >
              {loading ? "Ingresando…" : "Iniciar Sesión"}
            </button>
          </form>
        </div>

        {/* enlaces auxiliares */}
        <div className="mt-4 text-center text-sm text-slate-500">
          <a
            href="/recovery-link"
            className="hover:text-blue-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </main>
    </div>
  );
}
