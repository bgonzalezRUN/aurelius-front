import { useState } from "react";
import { recoveryLink } from "../api/authService";
import { useNavigate } from "react-router-dom";

export const RecoveryLink = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    
    
  
    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const res = await recoveryLink(email);
        navigate(`/recovery-password/${res.data}`);
      } catch (error) {
        setError("Error al enviar el correo");
        console.log(error);
      } finally {
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
          

          <h2 className="text-xl font-semibold text-slate-800">Recuperando tu contraseña</h2>
          <p className="text-slate-500 text-sm mb-5">Ingresa tu correo electrónico para recuperar tu contraseña</p>

          {/* form login */}
          <form onSubmit={onSubmit} className="space-y-4">
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

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 disabled:opacity-60"
            >
              {loading ? "Enviando…" : "Enviar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
