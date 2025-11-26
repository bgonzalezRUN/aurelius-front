  export const fmtTime = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(iso))
      : "";