import { useEffect, useState } from "react";
import { getRequisitions, type Requisition } from "../api/requisitionService";

export default function RequisitionList({
  onSelect,
  filteredRequisitions,
}: {
  onSelect: (id: string) => void;
  filteredRequisitions?: Requisition[];
}) {
  const [rows, setRows] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (filteredRequisitions !== undefined) {
          setRows(filteredRequisitions);
        } else {
          const data = await getRequisitions();
          setRows(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filteredRequisitions]);

  const fmt = (iso?: string) =>
    iso ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "—";

  const badge = (p: string) => {
    const base = "px-2 py-0.5 rounded-full text-xs font-medium";
    if (p === "alta") return <span className={`${base} bg-red-100 text-red-700`}>Alta</span>;
    if (p === "media") return <span className={`${base} bg-yellow-100 text-yellow-800`}>Media</span>;
    if (p === "baja") return <span className={`${base} bg-green-100 text-green-700`}>Baja</span>;
    return <span className={`${base} bg-gray-100 text-gray-700`}>{p}</span>;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Requisiciones</h3>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Cargando…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="p-3">Proyecto</th>
                <th className="p-3">Prioridad</th>
                <th className="p-3">Proveedores</th>
                <th className="p-3">Fecha llegada</th>
                <th className="p-3">Ítems</th>
                <th className="p-3">Comentarios</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-blue-50 cursor-pointer"
                    onClick={() => onSelect(r.id)}
                  >
                    <td className="p-3">{r.project}</td>
                    <td className="p-3">{badge(r.priority)}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {r.sendTo?.map((s, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">{fmt(r.arrivalDate)}</td>
                    <td className="p-3">{r.items?.length ?? 0}</td>
                    <td className="p-3">{r.comments}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500 italic bg-gray-50">
                    Sin datos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
