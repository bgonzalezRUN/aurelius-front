import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { recoveryPassword } from "../api/authService";

export default function RecoveryPassword() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [ok, setOk]             = useState(false);

  const validate = () => {
    if (!password || password.length < 8)
      return "La contraseña debe tener al menos 8 caracteres";
    if (password !== confirm)
      return "Las contraseñas no coinciden";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      if (!id) throw new Error("Falta el id de usuario en la URL");
      await recoveryPassword(id, password);
      setOk(true);
      // opcional: redirigir al login después de 1–2 s
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-start sm:items-center justify-center p-4">
      <main className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-800">Nueva contraseña</h2>
          <p className="text-slate-500 text-sm mb-5">Ingresa y confirma tu nueva contraseña.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Contraseña</label>
              <div className="mt-1 relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-2 text-slate-500 text-sm"
                >
                  {show ? "Ocultar" : "Ver"}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Mínimo 8 caracteres.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Confirmar contraseña</label>
              <input
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {ok && <div className="text-green-600 text-sm">¡Contraseña actualizada!</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 disabled:opacity-60"
            >
              {loading ? "Guardando…" : "Guardar contraseña"}
            </button>

            <div className="text-center">
              <Link to="/" className="text-sm text-blue-600 hover:underline">
                Volver al login
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
