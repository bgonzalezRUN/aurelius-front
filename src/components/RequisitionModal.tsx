import { useEffect, useState } from "react";
import { ChevronDown, CircleX, Plus, Trash2 } from "lucide-react";
import {
  createRequisition,
  updateRequisition,
  type BackendPayload,
} from "../api/requisitionService";

import * as pdfjs from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker();

import * as XLSX from "xlsx";

type Item = {
  material: string;
  metricUnit: string;
  quantity: string | number;
  part: string;
  subpart: string;
};

type TimeWindow = { start: string; end: string };

/** Utils **/
const VENDORS = ["proveedor 1", "proveedor 2", "proveedor 3"];
const normalize = (s: any) => (s ?? "").toString().trim();

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
    if (arr[i].s >= arr[i].e) return true;
    if (i > 0 && arr[i].s < arr[i - 1].e) return true;
  }
  return false;
};

/* ====== Extractor PDF ====== */
type PdfCell = { text: string; x: number; y: number };
const DEBUG_PDF = true;

const UNIT_TOKENS = new Set([
  "PZAS",
  "PZA",
  "PIEZAS",
  "PIEZA",
  "ROLLOS",
  "ROLLO",
  "TON",
  "TONELADAS",
  "TONELADA",
  "MTRS",
  "MTR",
  "MTS",
  "MT",
  "KG",
  "KGS",
  "TAMBOS",
  "TAMBO",
  "CAJAS",
  "CAJA",
  "LTS",
  "LT",
  "LITROS",
  "LITRO",
  "M2",
  "M3",
  "ML",
  "UNIDAD",
  "UNIDADES",
]);

const normalizeQtyStr = (s: string) => {
  if (!s) return "";
  let t = s.replace(/(?<=\d)[.,](?=\d{3}\b)/g, "");
  const parts = t.split(".");
  if (parts.length > 2) {
    const dec = parts.pop()!;
    t = parts.join("") + "." + dec;
  }
  return t;
};

const clusterByY = (cells: PdfCell[], tol = 4.5) => {
  const lines: { y: number; cells: { x: number; text: string }[] }[] = [];
  for (const it of cells) {
    const t = (it.text ?? "").toString().trim();
    if (!t) continue;
    let line = lines.find((ln) => Math.abs(ln.y - it.y) < tol);
    if (!line) {
      line = { y: it.y, cells: [] };
      lines.push(line);
    }
    line.cells.push({ x: it.x, text: t });
  }
  lines.sort((a, b) => b.y - a.y);
  lines.forEach((ln) => ln.cells.sort((a, b) => a.x - b.x));
  return lines;
};

const calcBoundariesFromHeader = (
  headerCells: { x: number; text: string }[]
) => {
  const cells = headerCells.map((c) => ({
    x: c.x,
    text: c.text.replace(/\s+/g, " ").trim(),
  }));

  const labels = [
    { key: "numero", rx: /^(N[º°. ]|N°|Nº|No\.?)$/i },
    { key: "material", rx: /^MATERIAL(?:ES)?$/i },
    { key: "unidad", rx: /^(UNIDAD|M[ÉE]TRICA|UNIDAD\s*M[ÉE]TRICA)$/i },
    { key: "cantidad", rx: /^CANTIDAD$/i },
    { key: "partida", rx: /^PARTIDA$/i },
    {
      key: "subpart",
      rx: /^(SUBPARTIDA|CONCEPTO|SUBPARTIDA\s*O\s*CONCEPTO)$/i,
    },
  ];

  const found: Record<string, number> = {};
  for (const c of cells) {
    for (const lb of labels) {
      if (!found[lb.key] && lb.rx.test(c.text)) found[lb.key] = c.x;
    }
  }
  if (
    found.material != null &&
    found.cantidad != null &&
    found.unidad == null
  ) {
    found.unidad = (found.material + found.cantidad) / 2;
  }
  if (found.partida != null && found.subpart == null) {
    found.subpart = found.partida + 60;
  }

  const cols = Object.entries(found)
    .map(([key, x]) => ({ key, x }))
    .sort((a, b) => a.x - b.x);

  if (cols.length < 3) {
    return {
      numero: [65, 110],
      material: [120, 460],
      unidad: [470, 560],
      cantidad: [570, 650],
      partida: [660, 740],
      subpart: [750, 1200],
    } as Record<string, [number, number]>;
  }

  const bounds: Record<string, [number, number]> = {} as any;
  for (let i = 0; i < cols.length; i++) {
    const left = cols[i];
    const right = cols[i + 1];
    const min = left.x - 2;
    const max = right ? right.x - 2 : left.x + 2000;
    bounds[left.key] = [min, max];
  }

  if (!bounds.unidad && bounds.material && bounds.cantidad) {
    bounds.unidad = [bounds.material[1], bounds.cantidad[0]];
  }
  if (!bounds.subpart && bounds.partida) {
    bounds.subpart = [bounds.partida[1], bounds.partida[1] + 2000];
  }

  return bounds;
};

const textInBand = (
  cells: { x: number; text: string }[],
  band?: [number, number]
) =>
  band
    ? cells
        .filter((c) => c.x >= band[0] && c.x < band[1])
        .map((c) => c.text)
        .join(" ")
        .trim()
    : "";

const lastQuantityMatch = (
  s: string
): { token: string; index: number } | null => {
  const re = /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\b|\b\d+(?:[.,]\d+)?\b/g;
  let m: RegExpExecArray | null,
    last: RegExpExecArray | null = null;
  while ((m = re.exec(s))) last = m;
  return last ? { token: last[0], index: last.index } : null;
};

const inferUnitBeforeQuantity = (
  left: string
): { unit?: string; materialLeft: string } => {
  const tokens = [...left.matchAll(/\S+/g)];
  if (tokens.length === 0) return { materialLeft: left.trim() };
  const prevTok = tokens[tokens.length - 1][0];
  const isWord = /^[A-Za-zÁÉÍÓÚÜÑ]{1,12}s?$/i.test(prevTok);
  const hasDigits = /\d/.test(prevTok);
  if (isWord && !hasDigits) {
    const start = tokens[tokens.length - 1].index!;
    const end = start + prevTok.length;
    const materialLeft = (left.slice(0, start) + left.slice(end))
      .replace(/\s+/g, " ")
      .trim();
    return { unit: prevTok, materialLeft };
  }
  return { materialLeft: left.trim() };
};

const findUnitTokenByList = (s: string) => {
  const tok = s.split(/\s+/).find((t) => UNIT_TOKENS.has(t.toUpperCase()));
  return tok;
};

async function extractItemsFromPdf(file: File): Promise<Item[]> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const out: Item[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const cells: PdfCell[] = (content.items as any[]).map((i) => {
      const [, , , , e, f] = i.transform;
      return { text: String(i.str || ""), x: e as number, y: f as number };
    });

    const lines = clusterByY(cells, 4.5);
    if (DEBUG_PDF) {
      console.group(`📄 Página ${p}`);
      lines
        .slice(0, 120)
        .forEach((ln, i) =>
          console.log(
            `#${i} y=${ln.y.toFixed(1)} |`,
            ln.cells.map((c) => c.text).join(" ")
          )
        );
      console.groupEnd();
    }

    const headerIdx = lines.findIndex((ln) =>
      /MATERIAL(?:ES)?/i.test(ln.cells.map((c) => c.text).join(" "))
    );
    if (headerIdx < 0) continue;

    const headerLines = [
      lines[headerIdx],
      lines[headerIdx + 1],
      lines[headerIdx + 2],
    ].filter(Boolean);
    const headerCells = headerLines.flatMap((l) => l.cells);
    const headerFloorY = Math.min(...headerLines.map((l) => l.y));
    const bounds = calcBoundariesFromHeader(headerCells);

    for (let i = headerIdx + headerLines.length; i < lines.length; i++) {
      const ln = lines[i];
      if (ln.y >= headerFloorY) continue;

      let joined = ln.cells
        .map((c) => c.text)
        .join(" ")
        .trim();
      if (!joined) continue;
      if (
        /ENVIAR A|OBSERVACIONES?|CROQUIS|DIRECCI[ÓO]N|NOTA:|SOLICITADO POR/i.test(
          joined
        )
      )
        break;

      joined = joined.replace(/^\s*\d+\b\s*/, "");

      const q = lastQuantityMatch(joined);
      if (!q) continue;

      const qty = normalizeQtyStr(q.token);
      const leftSide = joined.slice(0, q.index).trim();

      let { unit, materialLeft } = inferUnitBeforeQuantity(leftSide);

      if (!unit)
        unit = findUnitTokenByList(leftSide) || findUnitTokenByList(joined);
      if (!unit) {
        const unitBand = textInBand(ln.cells, bounds.unidad);
        if (unitBand) unit = unitBand.split(/\s+/)[0];
      }

      let materialFrag = materialLeft || textInBand(ln.cells, bounds.material);

      if (unit && /M[ÉE]TRICA/i.test(unit)) unit = "";

      let lookahead = 0;
      while (lookahead < 2 && i + 1 < lines.length) {
        const nxt = lines[i + 1];
        if (nxt.y >= headerFloorY) break;
        const jn = nxt.cells
          .map((c) => c.text)
          .join(" ")
          .trim();
        if (!jn) break;
        const hasNum = !!lastQuantityMatch(jn);
        const hasUnitAny = !!findUnitTokenByList(jn);
        const matNext = textInBand(nxt.cells, bounds.material) || jn;
        if (!hasNum && !hasUnitAny && matNext) {
          materialFrag = (materialFrag ? materialFrag + " " : "") + matNext;
          i++;
          lookahead++;
        } else {
          break;
        }
      }

      const item: Item = {
        material: (materialFrag || "").replace(/\s+/g, " ").trim(),
        metricUnit: (unit || "").trim(),
        quantity: qty,
        part: textInBand(ln.cells, bounds.partida),
        subpart: textInBand(ln.cells, bounds.subpart),
      };

      if (!item.material) {
        const leftOfUnit = ln.cells
          .filter((c) => c.x < (bounds.unidad?.[0] ?? Number.MAX_SAFE_INTEGER))
          .map((c) => c.text)
          .join(" ")
          .trim();
        if (leftOfUnit) item.material = leftOfUnit;
      }

      if (item.material) out.push(item);
    }
  }

  if (DEBUG_PDF) console.log("RESULTADOS FINALES:", out.length, out);
  return out;
}

const HEADER_MAP: Record<string, keyof Item> = {
  material: "material",
  materiales: "material",
  desc: "material",
  descripcion: "material",
  descripción: "material",
  unidad: "metricUnit",
  unid: "metricUnit",
  "unidad metrica": "metricUnit",
  "unidad métrica": "metricUnit",
  "u.m.": "metricUnit",
  um: "metricUnit",
  cantidad: "quantity",
  cant: "quantity",
  qty: "quantity",
  partida: "part",
  pda: "part",
  subpartida: "subpart",
  concepto: "subpart",
  "sub-partida": "subpart",
};

const normalizeHeader = (h: string) =>
  h
    .toString()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[._-]+/g, " ")
    .trim();

function pickHeaderIndex(row0: any[]): Record<keyof Item, number | undefined> {
  const out: Record<keyof Item, number | undefined> = {
    material: undefined,
    metricUnit: undefined,
    quantity: undefined,
    part: undefined,
    subpart: undefined,
  };
  row0.forEach((h, idx) => {
    const k = HEADER_MAP[normalizeHeader(String(h || ""))];
    if (k && out[k] == null) out[k] = idx;
  });
  return out;
}

async function extractItemsFromExcel(file: File): Promise<Item[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];

  const rows: any[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: true,
    defval: "",
  });
  if (!rows.length) return [];

  const headerIdxMap = pickHeaderIndex(rows[0]);

  const fallback = (i: number, def?: number) =>
    headerIdxMap[i as unknown as keyof Item] ?? def;

  const idxMaterial = headerIdxMap.material ?? 0;
  const idxUM = fallback("metricUnit" as any, 1) as number;
  const idxQty = fallback("quantity" as any, 2) as number;
  const idxPart = fallback("part" as any, 3) as number;
  const idxSub = fallback("subpart" as any, 4) as number;

  const out: Item[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    const compact = (row[idxMaterial] ?? "").toString().trim();
    const qtyRaw = (row[idxQty] ?? "").toString().trim();
    const umRaw = (row[idxUM] ?? "").toString().trim();

    if (!compact && !qtyRaw && !umRaw) continue;

    const qtyVal = (() => {
      const raw = String(qtyRaw ?? "")
        .replace(/,/g, ".")
        .trim();
      return raw === "" ? "" : raw;
    })();

    const item: Item = {
      material: String(row[idxMaterial] ?? "")
        .toString()
        .trim(),
      metricUnit: umRaw,
      quantity: qtyVal,
      part: String(row[idxPart] ?? "")
        .toString()
        .trim(),
      subpart: String(row[idxSub] ?? "")
        .toString()
        .trim(),
    };

    if (!item.material) continue;
    out.push(item);
  }

  return out;
}

function isExcelLike(file: File | null) {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    name.endsWith(".csv") ||
    /spreadsheet|excel|csv/i.test(file.type)
  );
}

export default function RequisitionModal({
  open,
  onClose,
  onSave,
  editingRequisition, // NUEVO: recibe la requisición a editar
}: {
  open: boolean;
  onClose: () => void;
  onSave?: (data: BackendPayload) => Promise<void> | void;
  editingRequisition?: Requisition | null; // NUEVO
}) {
  const isEditing = !!editingRequisition; // NUEVO: determina si está editando

  const [form, setForm] = useState({
    requisitionPriority: "media",
    requisitionComments: "",
    project: "",
    sendTo: [] as string[],
    arrivalDay: "",
    arrivalWindows: [{ start: "", end: "" }] as TimeWindow[],
    items: [
      { material: "", metricUnit: "", quantity: "", part: "", subpart: "" },
    ] as Item[],
  });

  // NUEVO: useEffect para cargar datos cuando se está editando
  useEffect(() => {
    if (editingRequisition) {
      // Convertir la fecha ISO a formato date input (YYYY-MM-DD)
      const arrivalDay = editingRequisition.arrivalDate
        ? editingRequisition.arrivalDate.split("T")[0]
        : "";

      // Convertir las ventanas de tiempo
      const arrivalWindows = (editingRequisition as any).arrivalWindows?.map(
        (w: any) => ({
          start: w.start ? new Date(w.start).toTimeString().slice(0, 5) : "",
          end: w.end ? new Date(w.end).toTimeString().slice(0, 5) : "",
        })
      ) || [{ start: "", end: "" }];

      setForm({
        requisitionPriority: editingRequisition.requisitionPriority || "media",
        requisitionComments: editingRequisition.requisitionComments || "",
        project: editingRequisition.project || "",
        sendTo: editingRequisition.sendTo?.map((v) => v.name) || [],
        arrivalDay,
        arrivalWindows,
        items: editingRequisition.items?.map((it) => ({
          material: it.material || "",
          metricUnit: it.metricUnit || "",
          quantity: String(it.quantity || ""),
          part: it.part || "",
          subpart: it.subpart || "",
        })) || [
          { material: "", metricUnit: "", quantity: "", part: "", subpart: "" },
        ],
      });
    } else {
      // Resetear el formulario cuando no hay edición
      setForm({
        requisitionPriority: "media",
        requisitionComments: "",
        project: "",
        sendTo: [],
        arrivalDay: "",
        arrivalWindows: [{ start: "", end: "" }],
        items: [
          { material: "", metricUnit: "", quantity: "", part: "", subpart: "" },
        ],
      });
    }
  }, [editingRequisition]);

  const [loading, setLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState(false);
  const [arrivalDayError, setArrivalDayError] = useState(false);
  const [arrivalWindowsError, setArrivalWindowsError] = useState<string | null>(
    null
  );
  const [itemsErrors, setItemsErrors] = useState<number[]>([]);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseMsg, setParseMsg] = useState<string | null>(null);
  const [vendorsOpen, setVendorsOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setPickedFile(f);
    if (f) await parseAndFill(f);
  };

  const onDropFile = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] || null;
    setPickedFile(f);
    if (f) await parseAndFill(f);
  };

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const parseAndFill = async (file: File) => {
    try {
      setParsing(true);
      let items: Item[] = [];
      if (isExcelLike(file)) {
        items = await extractItemsFromExcel(file);
      } else if (
        /pdf/i.test(file.type) ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        items = await extractItemsFromPdf(file);
      } else {
        throw new Error("Formato no soportado");
      }

      setForm((p) => ({
        ...p,
        items: items.length
          ? items.map((it) => ({
              material: normalize(it.material),
              metricUnit: normalize(it.metricUnit),
              quantity: String(it.quantity ?? "").trim(),
              part: normalize(it.part),
              subpart: normalize(it.subpart),
            }))
          : p.items,
      }));
      setParseMsg(
        `Cargados ${items.length} ítems desde ${
          isExcelLike(file) ? "Excel" : "PDF"
        }`
      );
    } catch (e) {
      console.error(e);
      setParseMsg("Error al leer archivo");
    } finally {
      setParsing(false);
      setTimeout(() => setParseMsg(null), 4000);
    }
  };

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
      arr[i] = { ...arr[i], [field]: value } as TimeWindow;
      return { ...p, arrivalWindows: arr };
    });
    setArrivalWindowsError(null);
  };

  const validate = () => {
    let ok = true;

    if (form.sendTo.length === 0) {
      setVendorsError(true);
      ok = false;
    } else {
      setVendorsError(false);
    }

    if (!form.arrivalDay) {
      setArrivalDayError(true);
      ok = false;
    } else {
      setArrivalDayError(false);
    }

    const wins = form.arrivalWindows.filter((w) => w.start && w.end);
    if (form.arrivalWindows.length === 0 || wins.length === 0) {
      setArrivalWindowsError(
        "Agrega al menos una franja válida (inicio y fin)."
      );
      ok = false;
    } else if (hasOverlaps(wins)) {
      setArrivalWindowsError(
        "Las franjas no deben solaparse y cada inicio debe ser menor al fin."
      );
      ok = false;
    } else {
      setArrivalWindowsError(null);
    }

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

    if (!validate()) {
      alert(
        "Por favor completa: proveedores, día y al menos una franja válida; además, revisa los ítems."
      );
      return;
    }

    setLoading(true);
    try {
      const windowsISO = form.arrivalWindows
        .filter((w) => w.start && w.end)
        .map((w) => ({
          start: toISOFromDateAndTime(form.arrivalDay, w.start),
          end: toISOFromDateAndTime(form.arrivalDay, w.end),
        }));

      const arrivalDateISO = form.arrivalDay
        ? toISOFromDateAndTime(form.arrivalDay, "00:00")
        : "";

      const payload: BackendPayload & {
        arrivalWindows?: { start: string; end: string }[];
      } = {
        requisitionPriority: normalize(form.requisitionPriority),
        project: normalize(form.project),
        requisitionComments: normalize(form.requisitionComments),
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
      else if (isEditing) {
        // NUEVO: lógica para actualizar
        await updateRequisition(editingRequisition.requisitionId, payload);
      } else {
        await createRequisition(payload);
      }

      onClose();
      location.reload();
    } catch (err) {
      console.error(err);
      alert(`❌ Error al ${isEditing ? "actualizar" : "crear"} la requisición`);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <form
        onSubmit={submit}
        className="relative bg-white rounded-lg shadow-sm w-full max-w-4xl p-5 overflow-y-auto custom-scroll max-h-[95vh] border border-gray-200"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isEditing ? "Editar Requisición" : "Nueva Requisición"}
          </h2>

          <button
            onClick={onClose}
            className="px-2 py-2 rounded-lg hover:bg-gray-300 text-gray-800 transition"
          >
            <CircleX />
          </button>
        </div>

        {/* Form principal */}
        <div className="space-y-4">
          {/* Fila 1: Proyecto y Prioridad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Proyecto *
              </label>
              <input
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                placeholder="remodelacionesSAS"
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#05a7c2] focus:border-[#05a7c2] outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Prioridad *
              </label>
              <div
                className="relative"
                tabIndex={0}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setPriorityOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => setPriorityOpen(!priorityOpen)}
                  className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-left flex items-center justify-between focus:ring-1 focus:ring-[#05a7c2] focus:border-[#05a7c2] outline-none"
                >
                  <span
                    className={
                      form.requisitionPriority
                        ? "text-gray-900"
                        : "text-gray-400"
                    }
                  >
                    {form.requisitionPriority || "Selecciona"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {priorityOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg overflow-hidden">
                    {["alta", "media", "baja"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, requisitionPriority: p });
                          setPriorityOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 capitalize"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Comentarios *
            </label>
            <textarea
              value={form.requisitionComments}
              onChange={(e) =>
                setForm({ ...form, requisitionComments: e.target.value })
              }
              placeholder="Comentarios acerca de la requisición..."
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#05a7c2] focus:border-[#05a7c2] outline-none resize-none"
              rows={2}
              required
            />
          </div>

          {/* Fila 2: Día llegada y Proveedores */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Día de llegada *
              </label>
              <input
                type="date"
                value={form.arrivalDay}
                onChange={(e) => {
                  setForm({ ...form, arrivalDay: e.target.value });
                  if (arrivalDayError && e.target.value)
                    setArrivalDayError(false);
                }}
                className={`w-full rounded border px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#05a7c2] focus:border-[#05a7c2] outline-none ${
                  arrivalDayError ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {arrivalDayError && (
                <p className="mt-1 text-xs text-red-600">
                  El día de llegada es obligatorio.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Proveedores *
              </label>
              <div
                className="relative"
                tabIndex={0}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setVendorsOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => setVendorsOpen(!vendorsOpen)}
                  className={`w-full rounded border px-3 py-1.5 text-sm text-left flex items-center justify-between focus:ring-1 focus:ring-[#05a7c2] focus:border-[#05a7c2] outline-none ${
                    vendorsError ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span
                    className={
                      form.sendTo.length ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {form.sendTo.length > 0
                      ? `${form.sendTo.length} seleccionados`
                      : "Selecciona"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {vendorsOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-auto">
                    {VENDORS.map((v) => {
                      const id = `VENDORS-${v}`;
                      return (
                        <label
                          key={v}
                          htmlFor={id}
                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            id={id}
                            type="checkbox"
                            checked={isCheckedVendor(v)}
                            onChange={() => toggleVendor(v)}
                            className="h-3.5 w-3.5 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{v}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              {vendorsError && (
                <p className="mt-1 text-xs text-red-600">
                  Selecciona al menos un proveedor.
                </p>
              )}
            </div>
          </div>

          {/* Horarios */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Horarios de recepción *
            </label>
            <div className="space-y-2">
              {form.arrivalWindows.map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={w.start}
                    onChange={(e) => setWindow(i, "start", e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[#05a7c2] focus:border-[#05a7c2] outline-none"
                    required
                  />
                  <span className="text-gray-400 text-xs">-</span>
                  <input
                    type="time"
                    value={w.end}
                    onChange={(e) => setWindow(i, "end", e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[#05a7c2] focus:border-[#05a7c2] outline-none"
                    required
                  />
                  {form.arrivalWindows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWindow(i)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addWindow}
                className="text-xs text-[#009cb8] hover:text-[#0586a0] flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar horario
              </button>
            </div>
            {arrivalWindowsError && (
              <p className="mt-1 text-xs text-red-600">{arrivalWindowsError}</p>
            )}
          </div>

          {/* Carga archivo */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Cargar materiales (opcional)
            </label>
            <label
              htmlFor="materialsFile"
              onDrop={onDropFile}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`w-full border border-dashed rounded p-3 flex flex-col items-center justify-center cursor-pointer hover:border-[#009cb8] hover:bg-[#009cb805] transition ${
                dragOver ? "border-[#009cb8] bg-[#009cb80f]" : "border-gray-300"
              }`}
            >
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 15a4 4 0 004 4h10a4 4 0 000-8h-.026A8 8 0 104 15z" />
                <path d="M12 12v9m0 0l-3.5-3.5M12 21l3.5-3.5" />
              </svg>
              <p className="mt-1 text-xs text-gray-500">
                Arrastra o <span className="text-[#009cb8]">examina</span>
              </p>
              {pickedFile && (
                <span className="mt-1 text-xs text-gray-700 font-medium">
                  {pickedFile.name}
                </span>
              )}
              {parsing && (
                <p className="mt-1 text-xs text-gray-500">Leyendo archivo…</p>
              )}
              {parseMsg && (
                <p className="mt-1 text-xs text-gray-700">{parseMsg}</p>
              )}
            </label>
            <input
              id="materialsFile"
              type="file"
              accept="application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,.xls,.xlsx,.csv"
              onChange={onPickFile}
              className="hidden"
            />
          </div>
        </div>

        {/* Ítems */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm text-gray-900">
              Materiales {form.items.length > 0 && `(${form.items.length})`}
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="text-xs text-[#009cb8] hover:text-[#0586a0] flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar ítem
            </button>
          </div>

          <div className="space-y-2">
            {form.items.map((it, i) => {
              const hasError = itemsErrors.includes(i);
              return (
                <div
                  key={i}
                  className={`relative grid grid-cols-5 gap-2 p-2 rounded bg-gray-50 border ${
                    hasError ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  {(
                    [
                      "material",
                      "metricUnit",
                      "quantity",
                      "part",
                      "subpart",
                    ] as (keyof Item)[]
                  ).map((f) => (
                    <input
                      key={f}
                      placeholder={
                        f === "metricUnit"
                          ? "Unidad"
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
                      className={`border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#05a7c2] focus:border-[#05a7c2] outline-none ${
                        hasError ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                      min={f === "quantity" ? 0.0000001 : undefined}
                      step={f === "quantity" ? "any" : undefined}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {hasError && (
                    <p className="col-span-5 text-xs text-red-600 mt-1">
                      Completa todos los campos del ítem y usa una cantidad
                      mayor a 0.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Guardar */}
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 rounded bg-[#01687d] text-white text-sm font-medium hover:bg-[#038aa5] disabled:opacity-50 transition"
          >
            {loading
              ? isEditing
                ? "Actualizando..."
                : "Guardando..."
              : isEditing
              ? "Actualizar Requisición"
              : "Crear Requisición"}
          </button>
        </div>
      </form>
    </div>
  );
}
