export interface CatalogItem {
  id: string;
  name: string;
  unitPrice: number;
  category?: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ClientInfo {
  name: string;
  phone: string;
  email: string;
  address?: string;
}

export interface CompanyProfile {
  name: string;
  phone: string;
  email: string;
  address?: string;
  taxId?: string; // RUT, CUIT, RFC, NIF, etc.
}

export interface TechnicalReport {
  // 1. INFORMACIÓN GENERAL
  reportNumber: string;
  inspectionDate: string;
  technicianName: string;
  technicianLicense: string;
  clientName: string;
  clientPhone: string;
  propertyAddress: string;
  propertyType: {
    residential: boolean;
    commercial: boolean;
    industrial: boolean;
    other: boolean;
    otherText?: string;
  };

  // 2. RESUMEN DEL ESTADO GENERAL DE LA INSTALACIÓN
  generalSummary: string;
  conditionConforme: boolean;
  conditionConformeObservaciones: boolean;
  conditionNoConforme: boolean;

  // 3. LISTA DE VERIFICACIÓN (CHECKLIST)
  // A. Conexión de Entrada y Medidores:
  checkMedidorFisico: boolean;
  checkAusenciaFugas: boolean;
  checkAccesibilidadLlaves: boolean;
  notesMedidores: string;

  // B. Tuberías:
  checkHermeticidad: boolean;
  checkSoportesFijaciones: boolean;
  checkVentilacionesRejillas: boolean;
  checkConexionArtefactos: boolean;
  checkEstadoGriferias: boolean;
  notesTuberias: string;

  // 4. DETALLE DE HALLAZGOS Y ACCIONES RECOMENDADAS
  findingsAndActions: string;

  // 5. CONCLUSIONES Y RECOMENDACIONES FINALES
  conclusionsAndRecommendations: string;
  technicianSignatureName: string;
}

export interface Budget {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  currency: string;
  items: BudgetItem[];
  client: ClientInfo;
  notes: string;
  taxRate: number; // percentage, e.g. 0, 10, 16, 21
  discountRate: number; // percentage
  status?: 'draft' | 'sent' | 'approved';
  createdAt: string;
  technicalReport?: TechnicalReport;
}

export type CurrencyOption = {
  code: string;
  symbol: string;
  name: string;
};
