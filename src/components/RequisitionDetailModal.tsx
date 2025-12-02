import { useState } from "react";
import {
  deleteRequisition,
  signRequisition,
  
} from "../api/requisitionService";
import { jwtDecode } from "jwt-decode";
import { Check, CircleX, Eye, Layers, Trash2 } from "lucide-react";
import { useRequisitionById } from "../api/queries/requisitionQueries";
import { Loading } from "./common";

export interface DecodedSignature {
  requisition_id: number;
  action: string;
  user: string;
  timestamp: string;
  ip: string;
}

interface DecodedToken {
  userName?: string;
  userLastName?: string;
}

export default function RequisitionDetailModal({
  open,
  onClose,
  requisitionId,
}: {
  open: boolean;
  onClose: () => void;
  requisitionId: string;
}) {
  const { data, isLoading } = useRequisitionById(requisitionId);
  const [showSignModal, setShowSignModal] = useState(false);

  // Modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Formateadores ----
  const fmtDate = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
          new Date(iso)
        )
      : "—";

  const fmtTime = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(iso))
      : "";

  if (!open || !data) return null;

  const token = localStorage.getItem("token");
  let user = "";

  if (token) {
    const decoded = jwtDecode<DecodedToken>(token);
    user =
      decoded.userName + " " + decoded.userLastName || "Usuario desconocido";
  }

  const decodeSignature = (
    signatureBase64?: string
  ): DecodedSignature | null => {
    if (!signatureBase64) return null;

    try {
      const decodedJson = atob(signatureBase64);
      return JSON.parse(decodedJson);
    } catch (err) {
      console.error("Error decoding signature:", err);
      return null;
    }
  };

  const onConfirmSign = async () => {
    if (!user) {
      alert("No se encontró un usuario válido. Inicia sesión nuevamente.");
      return;
    }

    try {
      await signRequisition(data.requisitionId, user);
      alert("✅ Requisición firmada exitosamente");
      setShowSignModal(false);
      onClose();
      location.reload();
    } catch (error) {
      console.error(error);
      alert("❌ Ocurrió un error al firmar la requisición");
    }
  };

  // --- Eliminación ---
  const openDeleteConfirm = () => setShowDeleteModal(true);

  const onConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteRequisition(data.requisitionId);
      setShowDeleteModal(false);
      onClose();
      location.reload();
    } finally {
      setIsDeleting(false);
    }
  };

  // Badge de prioridad
   if (isLoading) {
      return <Loading/>
    }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[800px] max-h-[90vh] border border-[#e0e0e0]">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b bg-white text-[#01687d] rounded-t-lg">
          <div className="flex items-center gap-2">
            <Eye />
            <h2 className="text-2xl text-black font-bold">
              Detalle de Requisición
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openDeleteConfirm}
              className="px-2 py-2 rounded-lg  hover:bg-red-300 text-gray-800 transition"
            >
              <Trash2 />
            </button>
            <button
              onClick={onClose}
              className="px-2 py-2 rounded-lg  hover:bg-gray-300 text-gray-800 transition"
            >
              <CircleX />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {/* Información general */}
          <section className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col justify-between items-start mb-1">
                  <span className="font-semibold text-base text-black">
                    Proyecto:
                  </span>{" "}
                  <h2 className="text-lg font-bold text-[#01687d] leading-tight">
                    {data.project}
                  </h2>
                </div>

                <div className="col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-semibold text-base text-black">
                      Fecha de llegada:
                    </span>
                    <span>{fmtDate(data.arrivalDate)}</span>
                  </div>

                  <div className="flex flex-col justify-end sm:flex-row sm:items-center sm:gap-2">
                    {Array.isArray((data as any).arrivalWindows) &&
                      (data as any).arrivalWindows.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(data as any).arrivalWindows.map(
                            (w: any, i: number) => (
                              <span
                                key={i}
                                className="text-xs text-black px-2 py-0.5 rounded-md border border-[#01687d]"
                              >
                                {fmtTime(w.start)} – {fmtTime(w.end)}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <span className="font-semibold text-base text-black">
                  Enviar a:
                </span>{" "}
                {data.sendTo?.map((s, i) => (
                  <span
                    key={i}
                    className="ml-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Materiales */}
          <section className="mb-6">
            <div className="flex items-center text-[#01687d] gap-2">
              <Layers />
              <h3 className="text-lg font-bold text-[#01687d] mb-2">
                Materiales
              </h3>
            </div>

            <div className="border rounded-lg shadow-sm overflow-hidden">
              {/* Scroll SOLO en la tabla */}
              <div className="max-h-[calc(100vh-518px)] overflow-y-auto">
                <table className="w-full text-sm">
                  {/* Encabezado fijo */}
                  <thead className="bg-[#b3b3b3] text-black border-b sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-left">Material</th>
                      <th className="p-2 text-left">Unidad</th>
                      <th className="p-2 text-left">Cantidad</th>
                      <th className="p-2 text-left">Partida</th>
                      <th className="p-2 text-left">Subpartida</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.items?.map((it, i) => (
                      <tr
                        key={i}
                        className="border-t hover:bg-[#f7fcfd] transition"
                      >
                        <td className="p-2">{it.material}</td>
                        <td className="p-2">{it.metricUnit}</td>
                        <td className="p-2">{it.quantity}</td>
                        <td className="p-2">{it.part}</td>
                        <td className="p-2">{it.subpart}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Firmas */}
          <h3 className="text-md font-semibold text-[#058cb5] mb-2">
            Aprobaciones
          </h3>
          <section className="flex flex-row gap-2 justify-around mb-8">
            {/* BLOQUE 1 */}
            <div className="p-5 h-[100px] border rounded-xl bg-[#f8fafa] shadow-sm mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#01687d] text-sm">
                  Solicitante
                </p>

                {!data.requester ? (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    ⛔ <span>No solicitada</span>
                  </p>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-green-700 flex items-center gap-1">
                      <Check />
                      <strong>{data.requester.name}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(
                        data.requester.timestamp
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* BLOQUE 2 */}
            <div className="p-5 h-[100px] border rounded-xl bg-[#f8fafa] shadow-sm mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#01687d] text-sm">
                  Gerente de obra
                </p>

                {!data.validator ? (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    ⛔ <span>No validada</span>
                  </p>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-green-700 flex items-center gap-1">
                      <Check />
                      <strong>{data.validator.name}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(
                        data.validator.timestamp
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* BLOQUE 3 */}
            <div className="p-5 h-[100px] border rounded-xl bg-[#f8fafa] shadow-sm mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#01687d] text-sm">
                  Director de obra
                </p>

                {(() => {
                  const signature = decodeSignature(
                    data.approver
                  );

                  if (!signature) {
                    return (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        ⛔ <span>No firmada</span>
                      </p>
                    );
                  }

                  return (
                    <div className="mt-2">
                      <p className="text-sm text-green-700 mt-1 flex items-center gap-1">
                        <Check />
                        <strong>{signature.user}</strong>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(signature.timestamp).toLocaleString()}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </section>
        </div>
        {/* MODAL CONFIRMAR FIRMA */}
        {showSignModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white w-[400px] p-6 rounded-2xl shadow-xl border">
              <h2 className="text-xl font-semibold text-[#058cb5] mb-2">
                Confirmar firma
              </h2>
              <p className="text-gray-700 mb-6">
                ¿Deseas firmar como <strong>{user}</strong>?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSignModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>

                <button
                  onClick={onConfirmSign}
                  className="px-4 py-2 rounded-lg bg-[#058cb5] hover:bg-[#037997] text-white"
                >
                  Confirmar firma
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white w-[420px] p-6 rounded-2xl shadow-xl border">
              <h4 className="text-lg font-semibold text-red-600 mb-2">
                Confirmar eliminación
              </h4>

              <p className="text-gray-700 mb-6 text-sm">
                Estás por eliminar la requisición{" "}
                <strong>#{data.requisitionId}</strong> del proyecto{" "}
                <strong>{data.project}</strong>.
                <br />
                Esta acción es permanente.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>

                <button
                  onClick={onConfirmDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded-lg text-white ${
                    isDeleting
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
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
