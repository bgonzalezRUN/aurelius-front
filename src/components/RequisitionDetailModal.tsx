import { useMemo, useState } from "react";
import { deleteRequisition, signRequisition, type Requisition } from "../api/requisitionService";
import { jwtDecode } from "jwt-decode";

type JwtPayload = { role?: string };

export default function RequisitionDetailModal({
  open,
  onClose,
  requisition,
}: {
  open: boolean;
  onClose: () => void;
  requisition: Requisition | null;
}) {
  const [showSignModal, setShowSignModal] = useState(false);
  const [agree, setAgree] = useState(false);
  const [signature, setSignature] = useState("");

  // Nuevo: modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fmt = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat("es-CO", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(iso))
      : "—";

  const roleFromToken = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded?.role ?? null;
    } catch {
      return null;
    }
  }, []);

  if (!open || !requisition) return null;

  // --- Firma ---
  const openSignConfirm = () => {
    setAgree(false);
    setSignature("");
    setShowSignModal(true);
  };

  const onConfirmSign = async () => {
    if (!roleFromToken) {
      alert("No se encontró un rol válido en el token. Inicia sesión de nuevo.");
      return;
    }
    if (!signature.trim()) return;

    await signRequisition(requisition.id, signature.trim(), roleFromToken);
    setShowSignModal(false);
    onClose();
    location.reload();
  };

  // --- Eliminación ---
  const openDeleteConfirm = () => {
    setShowDeleteModal(true);
  };

  const onConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteRequisition(requisition.id);
      setShowDeleteModal(false);
      onClose();
      location.reload();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[750px] max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Detalle de Requisición</h2>

        {/* Información general */}
        <section className="mb-6">
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <p>
              <span className="font-semibold">Proyecto:</span> {requisition.project}
            </p>
            <p>
              <span className="font-semibold">Prioridad:</span> {requisition.priority}
            </p>
            <p className="col-span-2">
              <span className="font-semibold">Comentarios:</span> {requisition.comments}
            </p>
            <p>
              <span className="font-semibold">Fecha llegada:</span> {fmt(requisition.arrivalDate)}
            </p>
            <div className="col-span-2">
              <span className="font-semibold">Enviar a:</span>{" "}
              {requisition.sendTo?.map((s, i) => (
                <span
                  key={i}
                  className="ml-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Ítems */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Materiales</h3>
          <table className="w-full text-sm border border-gray-300 rounded-md overflow-hidden">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="p-2 text-left">Material</th>
                <th className="p-2 text-left">Unidad</th>
                <th className="p-2 text-left">Cantidad</th>
                <th className="p-2 text-left">Partida</th>
                <th className="p-2 text-left">Subpartida</th>
              </tr>
            </thead>
            <tbody>
              {requisition.items?.map((it, i) => (
                <tr key={i} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="p-2">{it.material}</td>
                  <td className="p-2">{it.metricUnit}</td>
                  <td className="p-2">{it.quantity}</td>
                  <td className="p-2">{it.part}</td>
                  <td className="p-2">{it.subpart}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Firmas */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Firmas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700">
            <div className="p-3 border rounded-md">
              <p className="font-semibold">Solicitante</p>
              <p className="text-sm text-gray-600 mt-1">
                {requisition.requesterSignature || "⛔ No firmada"}
              </p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="font-semibold">Director</p>
              <p className="text-sm text-gray-600 mt-1">
                {requisition.directorSignature || "⛔ No firmada"}
              </p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="font-semibold">Superintendente</p>
              <p className="text-sm text-gray-600 mt-1">
                {requisition.superintendentSignature || "⛔ No firmada"}
              </p>
            </div>
          </div>
        </section>

        {/* Acciones */}
        <div className="flex justify-end gap-3 mt-4 border-t pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cerrar
          </button>
          <button
            onClick={openSignConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Firmar
          </button>
          <button
            onClick={openDeleteConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>

        {showSignModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white w-[520px] rounded-xl shadow-xl p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Confirmar firma y autorización
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Estás a punto de <span className="font-semibold">firmar y autorizar</span> la
                requisición del proyecto <span className="font-semibold">{requisition.project}</span>.
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu firma
              </label>
              <input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Escribe tu firma aquí…"
                className="w-full border rounded-md px-3 py-2 mb-4 outline-none focus:ring focus:ring-blue-200"
              />

              <label className="flex items-start gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  Confirmo que estoy de acuerdo con <b>firmar y autorizar</b> esta requisición y que
                  mi rol <i>({roleFromToken ?? "desconocido"})</i> será enviado junto con mi firma.
                </span>
              </label>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSignModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirmSign}
                  disabled={!agree || !signature.trim()}
                  className={`px-4 py-2 rounded text-white ${
                    !agree || !signature.trim()
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white w-[520px] rounded-xl shadow-xl p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Confirmar eliminación
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Vas a eliminar la requisición con id{" "}
                <span className="font-semibold">{requisition.id}</span> del proyecto{" "}
                <span className="font-semibold">{requisition.project}</span>.
                Esta acción no se puede deshacer.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirmDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded text-white ${
                    isDeleting ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isDeleting ? "Eliminando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
