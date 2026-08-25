export interface UnidadConfig {
  id: string;
  nombre: string;
  codigo: string;
  color: string;
  sheetsId?: string;
  driveId?: string;
  carpetas?: {
    indicadores?: string;
    evidencias?: string;
    reportes?: string;
    planesMejora?: string;
  };
  periodicidad: "mensual" | "trimestral";
  activo: boolean;
}

export const UNIDADES: UnidadConfig[] = [
  {
    id: "vraf",
    nombre: "Vicerrectoría Administrativa y Financiera",
    codigo: "VRAF",
    color: "#2563EB",
    sheetsId: "1ywkuf_nXlspFzQQPspOiG5RO6fexHVFTPCO5-V2dlhQ",
    driveId: "1jHYsKPP1xlOr_MD3gC8Tc6WDClD7L_72",
    carpetas: {
      evidencias: "18Tke24fux0q9sjDk-PJ5W9S-dQbbaMtW",
      reportes: "1d3T16aL46UZvAMzxQehEdXW9cFus-cAn",
    },
    periodicidad: "mensual",
    activo: true,
  },
  {
    id: "rrhh",
    nombre: "Unidad de Recursos Humanos",
    codigo: "RRHH",
    color: "#7C3AED",
    sheetsId: "1ZaqnD2_c-2ODjx3818MRhi4G9RS3TsXa1EnuxO_bUiQ",
    driveId: "1SBBW4DMj9iFy2JJzXJYmRAbian4Mw_dK",
    carpetas: {
      evidencias: "1HEVnQB285slJlAZMVlOdhdU0U3O3ACh8",
      reportes: "1M-i6MKFLoeGVmOBCTxRvAHXi3j5HVawv",
    },
    periodicidad: "mensual",
    activo: true,
  },
  {
    id: "conta",
    nombre: "Unidad de Contabilidad",
    codigo: "CONTA",
    color: "#059669",
    sheetsId: "1NBSDIgUtCAt4xOLVX8BCmpKo9B3lwJFwLlWb3i7BHdg",
    driveId: "1yLWvGkIqR5vb4HR_tQIeZ-VidpZf56Zb",
    carpetas: {
      evidencias: "1I4B02RBbNE-EDNacpkQ8UC13Ba8c93g8",
      reportes: "1MY11V419c2Ev8eQbGf6CLUs5zZBMGhMm",
    },
    periodicidad: "mensual",
    activo: true,
  },
  {
    id: "compras",
    nombre: "Unidad de Compras y Almacén",
    codigo: "COMPRAS",
    color: "#D97706",
    sheetsId: "1nfnLaPaVCcTbjneckEX4umxOY3A23ozra1q8jqZ3dn8",
    driveId: "1tHoCVSXW7eE-9U5nM5qHZpyl9q1II9Ye",
    carpetas: {
      evidencias: "1dKf3plUaV3dbsVy7hGOBCUPaR5bKRcmx",
      reportes: "1tWawHUr5hJZ4voUtt_oDe33MB80fa1OV",
    },
    periodicidad: "mensual",
    activo: true,
  },
  {
    id: "mant",
    nombre: "Unidad de Mantenimiento",
    codigo: "MANT",
    color: "#DC2626",
    sheetsId: "1PsVaBhiqn5Jwf8B7Cn_r2IlwN0upduKG3oPvxFBi4Hs",
    driveId: "1tVj6JsJsRKUHSrIzzrTpfo4AnO6RkI4N",
    carpetas: {
      evidencias: "1fMKb9WzCS1wS5juRjZzbr8OogzTvvm92",
      reportes: "1-myB8uewMiwtVb-PaPD-M6gTBr1InKAT",
    },
    periodicidad: "mensual",
    activo: true,
  },
  {
    id: "salud",
    nombre: "Comité de Salud y Seguridad Ocupacional",
    codigo: "SALUD",
    color: "#0891B2",
    sheetsId: "18Hd7RzcOgQDdLJa8fQGH_ECn6R6dcmt4D6knK6pWZ9g",
    driveId: "1qmZ6nmICrkGqn0hcTP5nxQ31Qy_G_xFS",
    carpetas: {
      evidencias: "1rp0_E-6EwGDfS7w4Um3jOBC9x-Mpqr1H",
      reportes: "1B-Fdq-Jty2u1nHY3d4l6Y5EzovkDBxDR",
    },
    periodicidad: "mensual",
    activo: true,
  },
];

export function getUnidad(id: string): UnidadConfig | undefined {
  return UNIDADES.find((u) => u.id === id);
}

export function getUnidadColor(id: string): string {
  return getUnidad(id)?.color ?? "#2563EB";
}
