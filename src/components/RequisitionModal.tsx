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

type TimeWindow = { start: string; end: string }; // "HH:MM"

/** Utils **/
const VENDORS = ["proveedor 1", "proveedor 2", "proveedor 3"];
const normalize = (s: any) => (s ?? "").toString().trim();

// "2025-11-04", "09:00" -> "2025-11-04T09:00:00.000Z" (según TZ local del usuario)
const toISOFromDateAndTime = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0);
  return dt.toISOString();
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const hasOverlaps = (wins: TimeWindow[]) => {
  const arr = wins
    .map((w) => ({ s: toMinutes(w.start), e: toMinutes(w.end) }))
    .sort((a, b) => a.s - b.s);

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].s >= arr[i].e) return true; // inicio >= fin => inválido
    if (i > 0 && arr[i].s < arr[i - 1].e) return true; // solapado con anterior
  }
  return false;
};

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
    arrivalDay: "", // "YYYY-MM-DD"
    arrivalWindows: [{ start: "", end: "" }] as TimeWindow[], // múltiples rangos
    items: [
      { material: "", metricUnit: "", quantity: "", part: "", subpart: "" },
    ] as Item[],
  });

  const [loading, setLoading] = useState(false);

  // Errores UX
  const [vendorsError, setVendorsError] = useState(false);
  const [arrivalDayError, setArrivalDayError] = useState(false);
  const [arrivalWindowsError, setArrivalWindowsError] = useState<string | null>(null);
  const [itemsErrors, setItemsErrors] = useState<number[]>([]); // índices inválidos

  // ---- PDF (solo UI; sin lógica de subida por ahora) ----
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setPdfFile(f);
  };

  const onDropFile = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] || null;
    setPdfFile(f);
  };

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  /** Vendors **/
  const isCheckedVendor = (n: string) => form.sendTo.includes(n);
  const toggleVendor = (n: string) => {
    setForm((p) => {
      const updated = isCheckedVendor(n)
        ? p.sendTo.filter((x) => x !== n)
        : [...p.sendTo, n];
      if (updated.length > 0 && vendorsError) setVendorsError(false);
      return { ...p, sendTo: updated };
    });
  };

  /** Ítems **/
  const handleItemChange = (i: number, field: keyof Item, val: string) => {
    const items = [...form.items];
    (items[i] as any)[field] = val;
    setForm({ ...form, items });

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
    setItemsErrors((prev) => prev.filter((idx) => idx !== i));
  };

  /** Ventanas de tiempo **/
  const addWindow = () =>
    setForm((p) => ({
      ...p,
      arrivalWindows: [...p.arrivalWindows, { start: "", end: "" }],
    }));

  const removeWindow = (i: number) => {
    setForm((p) => ({
      ...p,
      arrivalWindows: p.arrivalWindows.filter((_, idx) => idx !== i),
    }));
    setArrivalWindowsError(null);
  };

  const setWindow = (i: number, field: keyof TimeWindow, value: string) => {
    setForm((p) => {
      const arr = [...p.arrivalWindows];
      arr[i] = { ...arr[i], [field]: value };
      return { ...p, arrivalWindows: arr };
    });
    setArrivalWindowsError(null);
  };

  /** Validación **/
  const validate = () => {
    let ok = true;

    // Proveedores
    if (form.sendTo.length === 0) {
      setVendorsError(true);
      ok = false;
    } else {
      setVendorsError(false);
    }

    // Día de llegada
    if (!form.arrivalDay) {
      setArrivalDayError(true);
      ok = false;
    } else {
      setArrivalDayError(false);
    }

    // Ventanas de tiempo
    const wins = form.arrivalWindows.filter((w) => w.start && w.end);
    if (form.arrivalWindows.length === 0 || wins.length === 0) {
      setArrivalWindowsError("Agrega al menos una franja válida (inicio y fin).");
      ok = false;
    } else if (hasOverlaps(wins)) {
      setArrivalWindowsError("Las franjas no deben solaparse y cada inicio debe ser menor al fin.");
      ok = false;
    } else {
      setArrivalWindowsError(null);
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

  /** Submit **/
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      alert("Por favor completa: proveedores, día y al menos una franja válida; además, revisa los ítems.");
      return;
    }

    setLoading(true);
    try {
      // Ventanas en ISO
      const windowsISO = form.arrivalWindows
        .filter((w) => w.start && w.end)
        .map((w) => ({
          start: toISOFromDateAndTime(form.arrivalDay, w.start),
          end: toISOFromDateAndTime(form.arrivalDay, w.end),
        }));

      // Compatibilidad con back actual (inicio del día)
      const arrivalDateISO = form.arrivalDay
        ? toISOFromDateAndTime(form.arrivalDay, "00:00")
        : "";

      const payload: BackendPayload & {
        arrivalWindows?: { start: string; end: string }[];
      } = {
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
        arrivalDate: arrivalDateISO,
        arrivalWindows: windowsISO,
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
                      checked={isCheckedVendor(v)}
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

          {/* Día de llegada */}
          <div>
            <label className="text-sm text-gray-600 font-medium mb-1 block">
              Día de llegada necesario *
            </label>
            <input
              type="date"
              name="arrivalDay"
              value={form.arrivalDay}
              onChange={(e) => {
                setForm({ ...form, arrivalDay: e.target.value });
                if (arrivalDayError && e.target.value) setArrivalDayError(false);
              }}
              className={`w-full rounded-lg border p-2 focus:ring-2 focus:ring-blue-400 outline-none ${
                arrivalDayError ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {arrivalDayError && (
              <p className="mt-1 text-xs text-red-600">El día de llegada es obligatorio.</p>
            )}
          </div>

          {/* Franjas horarias dinámicas */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 font-medium mb-1 block">
              Horarios de recepción (puedes agregar varias franjas) *
            </label>

            <div className="space-y-3">
              {form.arrivalWindows.map((w, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
                >
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm text-gray-500 w-16">Inicio</span>
                    <input
                      type="time"
                      value={w.start}
                      onChange={(e) => setWindow(i, "start", e.target.value)}
                      className="border rounded-lg p-2 w-full sm:w-40 focus:ring-2 focus:ring-blue-400 outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm text-gray-500 w-16">Fin</span>
                    <input
                      type="time"
                      value={w.end}
                      onChange={(e) => setWindow(i, "end", e.target.value)}
                      className="border rounded-lg p-2 w-full sm:w-40 focus:ring-2 focus:ring-blue-400 outline-none"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeWindow(i)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 self-start"
                    title="Eliminar franja"
                  >
                    <Trash2 className="w-4 h-4" />
                    Quitar
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addWindow}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" /> Agregar franja
              </button>
            </div>

            {arrivalWindowsError && (
              <p className="mt-2 text-xs text-red-600">{arrivalWindowsError}</p>
            )}
          </div>

          {/* ---------- PDF opcional (debajo de horarios) ---------- */}
          <div className="md:col-span-2 mt-4">
            <label className="text-sm text-gray-600 font-medium mb-2 block">
              Cargar PDF de materiales (opcional)
            </label>

            <label
              htmlFor="materialsPdf"
              onDrop={onDropFile}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                dragOver ? "border-blue-400 bg-blue-50/50" : "border-gray-300"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 15a4 4 0 004 4h10a4 4 0 000-8h-.026A8 8 0 104 15h-.001z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 12v9m0 0l-3.5-3.5M12 21l3.5-3.5"
                />
              </svg>

              <p className="mt-2 text-sm text-gray-600">
                Selecciona un PDF con la tabla{" "}
                <span className="italic">(Material | Unidad Métrica | Cantidad | Partida | Subpartida)</span>
              </p>

              <span className="mt-1 text-blue-600 text-sm underline">Examinar…</span>

              {pdfFile && (
                <div className="mt-3 text-xs text-gray-700 bg-gray-50 px-3 py-1 rounded-full">
                  Archivo seleccionado: <b>{pdfFile.name}</b>
                </div>
              )}
            </label>

            <input
              id="materialsPdf"
              type="file"
              accept="application/pdf"
              onChange={onPickFile}
              className="hidden"
            />
          </div>
          {/* ---------- /PDF opcional ---------- */}
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
