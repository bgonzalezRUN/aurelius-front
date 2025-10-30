import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { createRequisition, type BackendPayload } from "../api/requisitionService";

type Item = {
  material: string;
  metricUnit: string;
  quantity: string | number;
  part: string;
  subpart: string;
};

const VENDORS = ["proveedor 1", "proveedor 2", "proveedor 3"];

const normalize = (s: any) => (s ?? "").toString().trim();
const toISOZ = (local: string) => (local ? new Date(local).toISOString() : "");

export default function RequisitionModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave?: (data: BackendPayload) => Promise<void> | void;
}) {
  const [form, setForm] = useState({
    priority: "media",
    comments: "",
    project: "",
    sendTo: [] as string[],
    arrivalDate: "",
    items: [
      { material: "", metricUnit: "", quantity: "", part: "", subpart: "" },
    ] as Item[],
  });

  const [loading, setLoading] = useState(false);

  // Errores simples para UX
  const [vendorsError, setVendorsError] = useState(false);
  const [arrivalError, setArrivalError] = useState(false);
  const [itemsErrors, setItemsErrors] = useState<number[]>([]); // índices inválidos

  const isChecked = (n: string) => form.sendTo.includes(n);
  const toggleVendor = (n: string) => {
    setForm((p) => {
      const updated = isChecked(n) ? p.sendTo.filter((x) => x !== n) : [...p.sendTo, n];
      // limpiar error si ya hay alguno seleccionado
      if (updated.length > 0 && vendorsError) setVendorsError(false);
      return { ...p, sendTo: updated };
    });
  };

  const handleItemChange = (i: number, field: keyof Item, val: string) => {
    const items = [...form.items];
    (items[i] as any)[field] = val;
    setForm({ ...form, items });

    // Si el usuario corrige algo en un ítem marcado como inválido, revalida ese ítem
    if (itemsErrors.includes(i)) {
      const idxs = itemsErrors.filter((idx) => idx !== i);
      setItemsErrors(idxs);
    }
  };

  const addItem = () =>
    setForm((p) => ({
      ...p,
      items: [
        ...p.items,
        { material: "", metricUnit: "", quantity: "", part: "", subpart: "" },
      ],
    }));

  const removeItem = (i: number) => {
    setForm((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
    // limpia error asociado a ese índice
    setItemsErrors((prev) => prev.filter((idx) => idx !== i));
  };

  // ---------- Validación ----------
  const validate = () => {
    let ok = true;

    // Proveedores
    if (form.sendTo.length === 0) {
      setVendorsError(true);
      ok = false;
    } else {
      setVendorsError(false);
    }

    // Fecha de llegada
    if (!form.arrivalDate) {
      setArrivalError(true);
      ok = false;
    } else {
      setArrivalError(false);
    }

    // Ítems
    const badIdxs: number[] = [];
    form.items.forEach((it, idx) => {
      const material = normalize(it.material);
      const unit = normalize(it.metricUnit);
      const qtyRaw = String(it.quantity ?? "").trim();
      const part = normalize(it.part);
      const sub = normalize(it.subpart);

      const qty = Number(qtyRaw.replace(",", "."));
      const qtyValid = qtyRaw !== "" && !Number.isNaN(qty) && qty > 0;

      if (!material || !unit || !qtyValid || !part || !sub) {
        badIdxs.push(idx);
      }
    });

    setItemsErrors(badIdxs);
    if (badIdxs.length > 0) ok = false;

    return ok;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación previa
    if (!validate()) {
      alert("Por favor completa: al menos 1 proveedor.");
      return;
    }

    setLoading(true);
    try {
      const payload: BackendPayload = {
        priority: normalize(form.priority),
        project: normalize(form.project),
        comments: normalize(form.comments),
        sendTo: form.sendTo.map((n) => ({ name: n })),
        items: form.items.map((it) => ({
          material: normalize(it.material),
          metricUnit: normalize(it.metricUnit),
          quantity: String(it.quantity ?? "").trim(),
          part: normalize(it.part),
          subpart: normalize(it.subpart),
        })) as any,
        arrivalDate: toISOZ(form.arrivalDate),
      };

      if (onSave) await onSave(payload);
      else await createRequisition(payload);

      onClose();
      location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Error al crear la requisición");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={submit}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 overflow-y-auto max-h-[90vh]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Nueva Requisición</h2>

        {/* Form principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Proyecto */}
          <div>
            <label className="text-sm text-gray-600 font-medium mb-1 block">Proyecto *</label>
            <input
              name="project"
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
              placeholder="remodelacionesSAS"
              className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="text-sm text-gray-600 font-medium mb-1 block">Prioridad *</label>
            <select
              name="priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          {/* Comentarios */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 font-medium mb-1 block">Comentarios *</label>
            <textarea
              name="comments"
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              placeholder="Comentarios acerca de la requisición..."
              className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
              rows={3}
              required
            />
          </div>

          {/* Proveedores (checklist) */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 font-medium mb-2 block">
              Enviar a (proveedores) *
            </label>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg bg-gray-50 border ${
                vendorsError ? "border-red-500" : "border-gray-200"
              }`}
            >
              {VENDORS.map((v) => {
                const id = `VENDORS-${v}`;
                return (
                  <label
                    key={v}
                    htmlFor={id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-white border border-transparent hover:border-gray-200 cursor-pointer"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={isChecked(v)}
                      onChange={() => toggleVendor(v)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-800">{v}</span>
                  </label>
                );
              })}
            </div>
            {vendorsError && (
              <p className="mt-1 text-xs text-red-600">Selecciona al menos un proveedor.</p>
            )}
          </div>

          {/* Fecha de llegada */}
          <div>
            <label className="text-sm text-gray-600 font-medium mb-1 block">
              Fecha de llegada necesaria *
            </label>
            <input
              type="datetime-local"
              name="arrivalDate"
              value={form.arrivalDate}
              onChange={(e) => {
                setForm({ ...form, arrivalDate: e.target.value });
                if (arrivalError && e.target.value) setArrivalError(false);
              }}
              className={`w-full rounded-lg border p-2 focus:ring-2 focus:ring-blue-400 outline-none ${
                arrivalError ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {arrivalError && (
              <p className="mt-1 text-xs text-red-600">La fecha de llegada es obligatoria.</p>
            )}
          </div>
        </div>

        {/* Ítems */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-800">
              Materiales / Ítems {form.items?.length ? `(${form.items.length})` : ""}
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Agregar Ítem
            </button>
          </div>

          {form.items.map((it, i) => {
            const hasError = itemsErrors.includes(i);
            const fieldClass = `border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-400 outline-none ${
              hasError ? "border-red-500" : "border-gray-300"
            }`;

            return (
              <div
                key={i}
                className={`relative grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 p-4 rounded-xl bg-gray-50 border ${
                  hasError ? "border-red-500" : "border-gray-200"
                }`}
              >
                {(["material", "metricUnit", "quantity", "part", "subpart"] as (keyof Item)[]).map(
                  (f) => (
                    <input
                      key={f}
                      placeholder={
                        f === "metricUnit"
                          ? "Unidad Métrica"
                          : f === "quantity"
                          ? "Cantidad"
                          : f === "part"
                          ? "Partida"
                          : f === "subpart"
                          ? "Subpartida"
                          : "Material"
                      }
                      type={f === "quantity" ? "number" : "text"}
                      value={String((it as any)[f] ?? "")}
                      onChange={(e) => handleItemChange(i, f, e.target.value)}
                      className={fieldClass}
                      required
                      min={f === "quantity" ? 0.0000001 : undefined}
                      step={f === "quantity" ? "any" : undefined}
                    />
                  )
                )}

                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {hasError && (
                  <p className="md:col-span-5 text-xs text-red-600">
                    Completa todos los campos del ítem y usa una cantidad mayor a 0.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Guardar */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Crear Requisición"}
          </button>
        </div>
      </form>
    </div>
  );
}