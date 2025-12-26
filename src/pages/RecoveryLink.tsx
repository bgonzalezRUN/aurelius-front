import { useState } from "react";
import { recoveryLink } from "../api/authService";
import { useNavigate } from "react-router-dom";

const RecoveryLink = () => {
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
          <h2 className="text-xl font-semibold text-slate-800">
            Recuperando tu contraseña
          </h2>
          <p className="text-slate-500 text-sm mb-5">
            Ingresa tu correo electrónico para recuperar tu contraseña
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#01687d] focus:border-[#01687d]"
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 font-medium bg-[#01687d] text-white hover:bg-[#027c94] disabled:opacity-60"
            >
              {loading ? "Enviando…" : "Enviar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RecoveryLink