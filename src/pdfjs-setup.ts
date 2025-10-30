// src/pdfjs-setup.ts
import { GlobalWorkerOptions } from "pdfjs-dist";

// Vite-friendly: resuelve a URL absoluta del worker
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
