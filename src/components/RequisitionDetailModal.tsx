import { deleteRequisition, signRequisition, type Requisition } from "../api/requisitionService";

export default function RequisitionDetailModal({
  open,
  onClose,
  requisition,
}: {
  open: boolean;
  onClose: () => void;
  requisition: Requisition | null;
}) {
  if (!open || !requisition) return null;

  const fmt = (iso?: string) =>
    iso ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "—";

  const onSign = async () => {
    const signature = prompt("✍️ Ingresa tu firma:");
    if (!signature) return;
    await signRequisition(requisition.id, signature);
    alert("✅ Requisición firmada");
    onClose();
    location.reload();
  };

  const onDelete = async () => {
    if (!confirm("¿Eliminar requisición?")) return;
    await deleteRequisition(requisition.id);
    alert("🗑️ Eliminada");
    onClose();
    location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[750px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Detalle de Requisición</h2>

        {/* Información general */}
        <section className="mb-6">
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <p><span className="font-semibold">Proyecto:</span> {requisition.project}</p>
            <p><span className="font-semibold">Prioridad:</span> {requisition.priority}</p>
            <p className="col-span-2"><span className="font-semibold">Comentarios:</span> {requisition.comments}</p>
            <p><span className="font-semibold">Fecha llegada:</span> {fmt(requisition.arrivalDate)}</p>
            <div className="col-span-2">
              <span className="font-semibold">Enviar a:</span>{" "}
              {requisition.sendTo?.map((s, i) => (
                <span key={i} className="ml-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
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
          <button onClick={onSign} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Firmar
          </button>
          <button onClick={onDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
