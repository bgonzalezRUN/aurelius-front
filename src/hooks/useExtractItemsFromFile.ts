/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import * as pdfjs from 'pdfjs-dist';

import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';
import type { LineItem } from '../types';
pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker();

type PdfCell = { text: string; x: number; y: number };

const DEBUG_PDF = true;

const HEADER_MAP: Record<string, keyof LineItem> = {
  material: 'material',
  materiales: 'material',
  desc: 'material',
  descripcion: 'material',
  descripción: 'material',
  unidad: 'metricUnit',
  unid: 'metricUnit',
  'unidad metrica': 'metricUnit',
  'unidad métrica': 'metricUnit',
  'u.m.': 'metricUnit',
  um: 'metricUnit',
  cantidad: 'quantity',
  cant: 'quantity',
  qty: 'quantity',
};

const UNIT_TOKENS = new Set([
  'PZAS',
  'PZA',
  'PIEZAS',
  'PIEZA',
  'ROLLOS',
  'ROLLO',
  'TON',
  'TONELADAS',
  'TONELADA',
  'MTRS',
  'MTR',
  'MTS',
  'MT',
  'KG',
  'KGS',
  'TAMBOS',
  'TAMBO',
  'CAJAS',
  'CAJA',
  'LTS',
  'LT',
  'LITROS',
  'LITRO',
  'M2',
  'M3',
  'ML',
  'UNIDAD',
  'UNIDADES',
]);

const normalizeHeader = (h: string) =>
  h
    .toString()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[._-]+/g, ' ')
    .trim();

function isExcelLike(file: File | null) {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    name.endsWith('.csv') ||
    /spreadsheet|excel|csv/i.test(file.type)
  );
}

function pickHeaderIndex(
  row0: any[]
): Record<keyof LineItem, number | undefined> {
  const out: Record<keyof LineItem, number | undefined> = {
    material: undefined,
    metricUnit: undefined,
    quantity: undefined,
  };
  row0.forEach((h, idx) => {
    const k = HEADER_MAP[normalizeHeader(String(h || ''))];
    if (k && out[k] == null) out[k] = idx;
  });
  return out;
}

const lastQuantityMatch = (
  s: string
): { token: string; index: number } | null => {
  const re = /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\b|\b\d+(?:[.,]\d+)?\b/g;
  let m: RegExpExecArray | null,
    last: RegExpExecArray | null = null;
  while ((m = re.exec(s))) last = m;
  return last ? { token: last[0], index: last.index } : null;
};

const normalizeQtyStr = (s: string) => {
  if (!s) return '';

  let t = s.replace(/(?<=\d)[.,](?=\d{3}\b)/g, '');

  const parts = t.split(/[,.]/);
  if (parts.length > 1) {
    const dec = parts.pop()!;
    t = parts.join('') + '.' + dec;
  }
  return t;
};

const textInBand = (
  cells: { x: number; text: string }[],
  band?: [number, number]
) =>
  band
    ? cells
        .filter(c => c.x >= band[0] && c.x < band[1])
        .map(c => c.text)
        .join(' ')
        .trim()
    : '';

async function extractItemsFromExcel(file: File): Promise<LineItem[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];

  const rows: any[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: true,
    defval: '',
  });
  if (!rows.length) return [];

  const headerIdxMap = pickHeaderIndex(rows[0]);

  const fallback = (k: keyof LineItem, def?: number) => headerIdxMap[k] ?? def;

  const idxMaterial = headerIdxMap.material ?? 0;
  const idxUM = fallback('metricUnit', 1) as number;
  const idxQty = fallback('quantity', 2) as number;

  const out: LineItem[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    const compact = (row[idxMaterial] ?? '').toString().trim();
    const qtyRaw = (row[idxQty] ?? '').toString().trim();
    const umRaw = (row[idxUM] ?? '').toString().trim();

    if (!compact && !qtyRaw && !umRaw) continue;

    // Normaliza la cantidad
    const qtyVal = normalizeQtyStr(qtyRaw);

    const item: LineItem = {
      material: String(row[idxMaterial] ?? '')
        .toString()
        .trim(),
      metricUnit: umRaw,
      quantity: qtyVal,
    };

    if (!item.material) continue;
    out.push(item);
  }

  return out;
}

async function extractItemsFromPdf(file: File): Promise<LineItem[]> {
  const clusterByY = (cells: PdfCell[], tol = 4.5) => {
    const lines: { y: number; cells: { x: number; text: string }[] }[] = [];
    for (const it of cells) {
      const t = (it.text ?? '').toString().trim();
      if (!t) continue;
      let line = lines.find(ln => Math.abs(ln.y - it.y) < tol);
      if (!line) {
        line = { y: it.y, cells: [] };
        lines.push(line);
      }
      line.cells.push({ x: it.x, text: t });
    }
    lines.sort((a, b) => b.y - a.y);
    lines.forEach(ln => ln.cells.sort((a, b) => a.x - b.x));
    return lines;
  };

  const calcBoundariesFromHeader = (
    headerCells: { x: number; text: string }[]
  ) => {
    const cells = headerCells.map(c => ({
      x: c.x,
      text: c.text.replace(/\s+/g, ' ').trim(),
    }));

    const labels = [
      { key: 'numero', rx: /^(N[º°. ]|N°|Nº|No\.?)$/i },
      { key: 'material', rx: /^MATERIAL(?:ES)?$/i },
      { key: 'unidad', rx: /^(UNIDAD|M[ÉE]TRICA|UNIDAD\s*M[ÉE]TRICA)$/i },
      { key: 'cantidad', rx: /^CANTIDAD$/i },
      { key: 'partida', rx: /^PARTIDA$/i },
      {
        key: 'subpart',
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
        .replace(/\s+/g, ' ')
        .trim();
      return { unit: prevTok, materialLeft };
    }
    return { materialLeft: left.trim() };
  };

  const findUnitTokenByList = (s: string) => {
    const tok = s.split(/\s+/).find(t => UNIT_TOKENS.has(t.toUpperCase()));
    return tok;
  };

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const out: LineItem[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const cells: PdfCell[] = (content.items as any[]).map(i => {
      const [, , , , e, f] = i.transform;
      return { text: String(i.str || ''), x: e as number, y: f as number };
    });

    const lines = clusterByY(cells, 4.5);
    if (DEBUG_PDF) {
      console.group(`📄 Página ${p}`);
      lines
        .slice(0, 120)
        .forEach((ln, i) =>
          console.log(
            `#${i} y=${ln.y.toFixed(1)} |`,
            ln.cells.map(c => c.text).join(' ')
          )
        );
      console.groupEnd();
    }

    const headerIdx = lines.findIndex(ln =>
      /MATERIAL(?:ES)?/i.test(ln.cells.map(c => c.text).join(' '))
    );
    if (headerIdx < 0) continue;

    const headerLines = [
      lines[headerIdx],
      lines[headerIdx + 1],
      lines[headerIdx + 2],
    ].filter(Boolean);
    const headerCells = headerLines.flatMap(l => l.cells);
    const headerFloorY = Math.min(...headerLines.map(l => l.y));
    const bounds = calcBoundariesFromHeader(headerCells);

    for (let i = headerIdx + headerLines.length; i < lines.length; i++) {
      const ln = lines[i];
      if (ln.y >= headerFloorY) continue;

      let joined = ln.cells
        .map(c => c.text)
        .join(' ')
        .trim();
      if (!joined) continue;
      if (
        /ENVIAR A|OBSERVACIONES?|CROQUIS|DIRECCI[ÓO]N|NOTA:|SOLICITADO POR/i.test(
          joined
        )
      )
        break;

      joined = joined.replace(/^\s*\d+\b\s*/, '');

      const q = lastQuantityMatch(joined);
      if (!q) continue;

      const qty = normalizeQtyStr(q.token);
      const leftSide = joined.slice(0, q.index).trim();

      const { unit: initialUnit, materialLeft } =
        inferUnitBeforeQuantity(leftSide);
      let unit = initialUnit;

      if (!unit)
        unit = findUnitTokenByList(leftSide) || findUnitTokenByList(joined);
      if (!unit) {
        const unitBand = textInBand(ln.cells, bounds.unidad);
        if (unitBand) unit = unitBand.split(/\s+/)[0];
      }

      let materialFrag = materialLeft || textInBand(ln.cells, bounds.material);

      if (unit && /M[ÉE]TRICA/i.test(unit)) unit = '';

      let lookahead = 0;
      while (lookahead < 2 && i + 1 < lines.length) {
        const nxt = lines[i + 1];
        if (nxt.y >= headerFloorY) break;
        const jn = nxt.cells
          .map(c => c.text)
          .join(' ')
          .trim();
        if (!jn) break;
        const hasNum = !!lastQuantityMatch(jn);
        const hasUnitAny = !!findUnitTokenByList(jn);
        const matNext = textInBand(nxt.cells, bounds.material) || jn;
        if (!hasNum && !hasUnitAny && matNext) {
          materialFrag = (materialFrag ? materialFrag + ' ' : '') + matNext;
          i++;
          lookahead++;
        } else {
          break;
        }
      }

      const item: LineItem = {
        material: (materialFrag || '').replace(/\s+/g, ' ').trim(),
        metricUnit: (unit || '').trim(),
        quantity: qty,
      };

      if (!item.material) {
        const leftOfUnit = ln.cells
          .filter(c => c.x < (bounds.unidad?.[0] ?? Number.MAX_SAFE_INTEGER))
          .map(c => c.text)
          .join(' ')
          .trim();
        if (leftOfUnit) item.material = leftOfUnit;
      }

      if (item.material) out.push(item);
    }
  }

  return out;
}

async function extractDataFromFile(file: File): Promise<LineItem[]> {
  if (isExcelLike(file)) {
    return extractItemsFromExcel(file);
  } else if (
    /pdf/i.test(file.type) ||
    file.name.toLowerCase().endsWith('.pdf')
  ) {
    return extractItemsFromPdf(file);
  } else {
    throw new Error('Formato de archivo no soportado (Solo Excel/CSV y PDF).');
  }
}

export default function useExtractItemsFromFile() {
  const [processingFile, setProcessingFile] = useState(false);
  const [extractData, setExtractData] = useState<LineItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseAndFill = useCallback(async (file: File) => {
    setProcessingFile(true);
    setError(null);
    setExtractData(null);

    try {
      const items = await extractDataFromFile(file);
      setExtractData(items);
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : 'Error desconocido al procesar el archivo.';
      console.error('Error durante la extracción:', e);
      setError(errorMessage);
    } finally {
      setProcessingFile(false);
    }
  }, []);

  return { parseAndFill, extractData, processingFile, error };
}
