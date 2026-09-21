import { TechnicalReport, Budget, CompanyProfile } from '../types';

export function createDefaultTechnicalReport(
  budget?: Partial<Budget>,
  profile?: Partial<CompanyProfile>
): TechnicalReport {
  const currentYear = new Date().getFullYear();
  const today = budget?.date || new Date().toISOString().split('T')[0];

  return {
    reportNumber: budget?.number || '001',
    inspectionDate: today || `/ / ${currentYear}`,
    technicianName: profile?.name || 'Téc. Matías Fernández',
    technicianLicense: profile?.taxId || 'MP-4821',
    clientName: budget?.client?.name || 'Cliente Ejemplo S.A.',
    clientPhone: budget?.client?.phone || '+54 9 11 9876-5432',
    propertyAddress: budget?.client?.address || 'Av. Corrientes 1234, CABA',
    propertyType: {
      residential: false,
      commercial: true,
      industrial: false,
      other: false,
      otherText: '',
    },
    generalSummary:
      'Se realizó la revisión técnica preventiva ocular y funcional de la instalación completa. Se verificaron conexiones de entrada, estado del regulador, estanqueidad de llaves y ventilaciones reglamentarias.',
    conditionConforme: false,
    conditionConformeObservaciones: true,
    conditionNoConforme: false,
    checkMedidorFisico: true,
    checkAusenciaFugas: true,
    checkAccesibilidadLlaves: true,
    notesMedidores: 'Medidor y regulador en nicho reglamentario; llave de paso general operativa.',
    checkHermeticidad: true,
    checkSoportesFijaciones: true,
    checkVentilacionesRejillas: true,
    checkConexionArtefactos: true,
    checkEstadoGriferias: true,
    notesTuberias: 'Trazas de tuberías con soportes adecuados; rejilla de ventilación despejada sin obstrucciones.',
    findingsAndActions:
      'Se detecta leve sequedad en sello de unión flexible del artefacto principal. Se ejecutó reapriete preventivo y prueba con solución espumógena sin registrar fuga. Se sugiere sustitución en próximo service.',
    conclusionsAndRecommendations:
      'Instalación apta y operativa en condición conforme con observaciones. Se recomienda mantener libre el acceso a llaves de paso y realizar control anual preventivo.',
    technicianSignatureName: profile?.name || 'Téc. Matías Fernández',
  };
}

export function createEmptyTechnicalReport(
  budget?: Partial<Budget>,
  profile?: Partial<CompanyProfile>
): TechnicalReport {
  const today = budget?.date || new Date().toISOString().split('T')[0];

  return {
    reportNumber: budget?.number || '',
    inspectionDate: today,
    technicianName: profile?.name || '',
    technicianLicense: profile?.taxId || '',
    clientName: budget?.client?.name || '',
    clientPhone: budget?.client?.phone || '',
    propertyAddress: budget?.client?.address || '',
    propertyType: {
      residential: false,
      commercial: false,
      industrial: false,
      other: false,
      otherText: '',
    },
    generalSummary: '',
    conditionConforme: false,
    conditionConformeObservaciones: false,
    conditionNoConforme: false,
    checkMedidorFisico: false,
    checkAusenciaFugas: false,
    checkAccesibilidadLlaves: false,
    notesMedidores: '',
    checkHermeticidad: false,
    checkSoportesFijaciones: false,
    checkVentilacionesRejillas: false,
    checkConexionArtefactos: false,
    checkEstadoGriferias: false,
    notesTuberias: '',
    findingsAndActions: '',
    conclusionsAndRecommendations: '',
    technicianSignatureName: profile?.name || '',
  };
}
