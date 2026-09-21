import React, { useState } from 'react';
import { Budget, CompanyProfile, TechnicalReport } from '../types';
import { downloadTechnicalReportPDF } from '../utils/pdfGenerator';
import {
  openTechnicalReportWhatsApp,
  openTechnicalReportEmail,
  buildTechnicalReportTextSummary,
} from '../utils/sharing';
import {
  createDefaultTechnicalReport,
  createEmptyTechnicalReport,
} from '../utils/technicalReportDefaults';
import {
  Download,
  MessageSquare,
  Mail,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  FileCheck2,
  Building2,
  CheckSquare,
  Square,
  Layers,
  Printer,
} from 'lucide-react';

interface Props {
  budget: Budget;
  profile: CompanyProfile;
  onUpdateTechnicalReport: (report: TechnicalReport) => void;
  onOpenProfileModal: () => void;
}

export const TechnicalReportView: React.FC<Props> = ({
  budget,
  profile,
  onUpdateTechnicalReport,
  onOpenProfileModal,
}) => {
  // Ensure we have report state
  const report: TechnicalReport =
    budget.technicalReport || createDefaultTechnicalReport(budget, profile);

  const [copied, setCopied] = useState(false);

  const updateField = <K extends keyof TechnicalReport>(
    field: K,
    value: TechnicalReport[K]
  ) => {
    onUpdateTechnicalReport({
      ...report,
      [field]: value,
    });
  };

  const updatePropertyType = (type: 'residential' | 'commercial' | 'industrial' | 'other', value: boolean) => {
    onUpdateTechnicalReport({
      ...report,
      propertyType: {
        ...report.propertyType,
        [type]: value,
      },
    });
  };

  const updateCondition = (condition: 'conforme' | 'conforme_observaciones' | 'no_conforme') => {
    onUpdateTechnicalReport({
      ...report,
      conditionConforme: condition === 'conforme',
      conditionConformeObservaciones: condition === 'conforme_observaciones',
      conditionNoConforme: condition === 'no_conforme',
    });
  };

  const handleLoadSample = () => {
    onUpdateTechnicalReport(createDefaultTechnicalReport(budget, profile));
  };

  const handleClear = () => {
    onUpdateTechnicalReport(createEmptyTechnicalReport(budget, profile));
  };

  const handleCopySummary = async () => {
    const text = buildTechnicalReportTextSummary(budget, profile);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-sky-50 text-sky-800 rounded-lg text-xs font-semibold mb-1 border border-sky-200">
            <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
            Formulario de Inspección Técnica
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Informe de Revisión Técnica Preventiva
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rellena los espacios con líneas y marca las casillas. El PDF generado reproduce exactamente este formato.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            id="download-tech-pdf-btn"
            type="button"
            onClick={() => downloadTechnicalReportPDF(budget, profile)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>

          <button
            id="whatsapp-tech-btn"
            type="button"
            onClick={() => openTechnicalReportWhatsApp(budget, profile)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all"
            title="Enviar resumen por WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </button>

          <button
            id="email-tech-btn"
            type="button"
            onClick={() => openTechnicalReportEmail(budget, profile)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
            title="Enviar por Correo"
          >
            <Mail className="w-4 h-4" />
            Correo
          </button>

          <button
            id="copy-tech-summary-btn"
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </button>

          <button
            id="sample-tech-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors"
            title="Cargar ejemplo de prueba"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Ejemplo
          </button>

          <button
            id="clear-tech-btn"
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Limpiar todos los campos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar
          </button>
        </div>
      </div>

      {/* Visual Form Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-800 border border-slate-200">
          <FileCheck2 className="w-4 h-4 text-sky-600" />
          <span>Formulario Completo</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Printer className="w-3.5 h-3.5" />
          <span>Formato Oficial A4 (2 Páginas)</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PÁGINA 1: INFORMACIÓN GENERAL Y RESUMEN DEL ESTADO */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-300 p-6 sm:p-10 text-slate-900 relative">
          <div className="absolute top-4 right-6 text-xs font-bold text-slate-400">Pág. 1</div>

          {/* Document Title (Underlined & Centered) */}
          <div className="text-center mb-8 pb-3">
            <h1 className="text-base sm:text-lg font-extrabold tracking-wide uppercase inline-block border-b-2 border-slate-900 pb-1">
              INFORME DE REVISIÓN TÉCNICA PREVENTIVA / ESTADO DE INSTALACIÓN
            </h1>
          </div>

          {/* 1. INFORMACIÓN GENERAL */}
          <div className="mb-8">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 mb-2">
              1. INFORMACIÓN GENERAL
            </h3>
            <hr className="border-t-2 border-slate-800 mb-6" />

            <div className="space-y-4 text-sm">
              {/* Row: Nº de Informe & Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-6 flex items-baseline gap-2">
                  <span className="font-medium whitespace-nowrap text-slate-900">N° de Informe:</span>
                  <input
                    id="tech-report-number"
                    type="text"
                    value={report.reportNumber}
                    onChange={(e) => updateField('reportNumber', e.target.value)}
                    placeholder="INF-001"
                    className="flex-1 min-w-0 border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-transparent px-1 py-0.5 font-semibold text-slate-900 outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-6 flex items-baseline gap-2">
                  <span className="font-medium whitespace-nowrap text-slate-900">Fecha de Inspección:</span>
                  <input
                    id="tech-inspection-date"
                    type="text"
                    value={report.inspectionDate}
                    onChange={(e) => updateField('inspectionDate', e.target.value)}
                    placeholder="DD / MM / 2026"
                    className="flex-1 min-w-0 border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-transparent px-1 py-0.5 font-semibold text-slate-900 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row: Nombre del Técnico / Inspector */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <span className="font-medium whitespace-nowrap text-slate-900">
                  Nombre del Técnico/Inspector:
                </span>
                <input
                  id="tech-technician-name"
                  type="text"
                  value={report.technicianName}
                  onChange={(e) => updateField('technicianName', e.target.value)}
                  placeholder="Nombre y apellido completo"
                  className="flex-1 border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-transparent px-1 py-0.5 font-semibold text-slate-900 outline-none transition-colors"
                />
              </div>

              {/* Row: Registro / Matrícula */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <span className="font-medium whitespace-nowrap text-slate-900">Registro/Matrícula:</span>
                <input
                  id="tech-technician-license"
                  type="text"
                  value={report.technicianLicense}
                  onChange={(e) => updateField('technicianLicense', e.target.value)}
                  placeholder="N° de matrícula o habilitación profesional"
                  className="flex-1 border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-transparent px-1 py-0.5 font-semibold text-slate-900 outline-none transition-colors"
                />
              </div>

              {/* Row: Propietario / Cliente */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <span className="font-medium whitespace-nowrap text-slate-900">Propietario/Cliente:</span>
                <input
                  id="tech-client-name"
                  type="text"
                  value={report.clientName}
                  onChange={(e) => updateField('clientName', e.target.value)}
                  placeholder="Nombre de la empresa o cliente"
                  className="flex-1 border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-transparent px-1 py-0.5 font-semibold text-slate-900 outline-none transition-colors"
                />
              </div>

              {/* Row: Teléfono */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <span className="font-medium whitespace-nowrap text-slate-900">Teléfono:</span>
                <input
                  id="tech-client-phone"
                  type="text"
                  value={report.clientPhone}
                  onChange={(e) => updateField('clientPhone', e.target.value)}
                  placeholder="Teléfono o celular de contacto"
                  className="flex-1 border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-transparent px-1 py-0.5 font-semibold text-slate-900 outline-none transition-colors"
                />
              </div>

              {/* Row: Dirección del Inmueble */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <span className="font-medium whitespace-nowrap text-slate-900">Dirección del Inmueble:</span>
                <input
                  id="tech-property-address"
                  type="text"
                  value={report.propertyAddress}
                  onChange={(e) => updateField('propertyAddress', e.target.value)}
                  placeholder="Calle, número, localidad o piso/depto"
                  className="flex-1 border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-transparent px-1 py-0.5 font-semibold text-slate-900 outline-none transition-colors"
                />
              </div>

              {/* Row: Tipo de Inmueble con corchetes/casillas */}
              <div className="pt-3">
                <span className="font-medium text-slate-900 block mb-2">Tipo de Inmueble:</span>
                <div className="space-y-2 pl-2">
                  <label
                    htmlFor="type-residential"
                    className="flex items-center gap-3 cursor-pointer group select-none"
                  >
                    <button
                      id="type-residential"
                      type="button"
                      onClick={() => updatePropertyType('residential', !report.propertyType?.residential)}
                      className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors ${
                        report.propertyType?.residential
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-400 bg-white hover:border-slate-600'
                      }`}
                    >
                      {report.propertyType?.residential && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <span className="text-slate-800 text-sm font-medium">Residencial</span>
                  </label>

                  <label
                    htmlFor="type-commercial"
                    className="flex items-center gap-3 cursor-pointer group select-none"
                  >
                    <button
                      id="type-commercial"
                      type="button"
                      onClick={() => updatePropertyType('commercial', !report.propertyType?.commercial)}
                      className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors ${
                        report.propertyType?.commercial
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-400 bg-white hover:border-slate-600'
                      }`}
                    >
                      {report.propertyType?.commercial && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <span className="text-slate-800 text-sm font-medium">Comercial</span>
                  </label>

                  <label
                    htmlFor="type-industrial"
                    className="flex items-center gap-3 cursor-pointer group select-none"
                  >
                    <button
                      id="type-industrial"
                      type="button"
                      onClick={() => updatePropertyType('industrial', !report.propertyType?.industrial)}
                      className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors ${
                        report.propertyType?.industrial
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-400 bg-white hover:border-slate-600'
                      }`}
                    >
                      {report.propertyType?.industrial && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <span className="text-slate-800 text-sm font-medium">Industrial</span>
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      id="type-other"
                      type="button"
                      onClick={() => updatePropertyType('other', !report.propertyType?.other)}
                      className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors shrink-0 ${
                        report.propertyType?.other
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-400 bg-white hover:border-slate-600'
                      }`}
                    >
                      {report.propertyType?.other && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <span className="text-slate-800 text-sm font-medium">Otro:</span>
                    <input
                      id="type-other-text"
                      type="text"
                      value={report.propertyType?.otherText || ''}
                      onChange={(e) =>
                        onUpdateTechnicalReport({
                          ...report,
                          propertyType: {
                            ...report.propertyType,
                            other: true,
                            otherText: e.target.value,
                          },
                        })
                      }
                      placeholder="Especificar tipo..."
                      className="flex-1 border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-transparent px-1 py-0.5 text-sm text-slate-900 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. RESUMEN DEL ESTADO GENERAL DE LA INSTALACIÓN */}
          <div className="mb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 mb-2">
              2. RESUMEN DEL ESTADO GENERAL DE LA INSTALACIÓN
            </h3>
            <hr className="border-t-2 border-slate-800 mb-4" />

            {/* Ruled lines input for general summary */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Líneas de resumen del estado de la instalación:
              </label>
              <textarea
                id="tech-general-summary"
                rows={3}
                value={report.generalSummary}
                onChange={(e) => updateField('generalSummary', e.target.value)}
                placeholder="Escriba aquí el resumen del estado general de la instalación..."
                className="w-full border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-slate-50/50 p-2 text-sm text-slate-900 outline-none leading-relaxed resize-y rounded-t-sm"
              />
            </div>

            {/* Checkboxes de condición */}
            <div className="space-y-3 pl-2">
              <div
                onClick={() => updateCondition('conforme')}
                className={`p-2.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  report.conditionConforme
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-semibold shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    report.conditionConforme
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-400 bg-white'
                  }`}
                >
                  {report.conditionConforme && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-sm font-bold">Conforme</span>
                  <p className="text-xs opacity-90">
                    (Instalación segura y operativa, sin novedades críticas)
                  </p>
                </div>
              </div>

              <div
                onClick={() => updateCondition('conforme_observaciones')}
                className={`p-2.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  report.conditionConformeObservaciones
                    ? 'border-amber-500 bg-amber-50/60 text-amber-950 font-semibold shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    report.conditionConformeObservaciones
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-slate-400 bg-white'
                  }`}
                >
                  {report.conditionConformeObservaciones && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-sm font-bold">Conforme con Observaciones</span>
                  <p className="text-xs opacity-90">
                    (Operativa, pero requiere mejoras o mantenimiento menor)
                  </p>
                </div>
              </div>

              <div
                onClick={() => updateCondition('no_conforme')}
                className={`p-2.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  report.conditionNoConforme
                    ? 'border-rose-500 bg-rose-50/60 text-rose-950 font-semibold shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    report.conditionNoConforme
                      ? 'border-rose-600 bg-rose-600 text-white'
                      : 'border-slate-400 bg-white'
                  }`}
                >
                  {report.conditionNoConforme && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-sm font-bold">No Conforme</span>
                  <p className="text-xs opacity-90">
                    (Riesgo potencial o fallas graves. Requiere intervención inmediata)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-right text-xs text-slate-400 font-bold">1</div>
        </div>

        {/* Separador de lectura entre páginas */}
        <div className="flex items-center justify-center gap-3 py-1 text-xs font-semibold text-slate-400">
          <span className="h-px bg-slate-200 w-16 sm:w-28" />
          <span>Continuación de la Inspección • Página 2</span>
          <span className="h-px bg-slate-200 w-16 sm:w-28" />
        </div>

        {/* ========================================================================= */}
        {/* PÁGINA 2: LISTA DE VERIFICACIÓN (CHECKLIST), HALLAZGOS Y CONCLUSIONES */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-300 p-6 sm:p-10 text-slate-900 relative">
          <div className="absolute top-4 right-6 text-xs font-bold text-slate-400">Pág. 2</div>

          {/* 3. LISTA DE VERIFICACIÓN (CHECKLIST) */}
          <div className="mb-8">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 mb-2">
              3. LISTA DE VERIFICACIÓN (CHECKLIST):
            </h3>
            <hr className="border-t-2 border-slate-800 mb-6" />

            {/* A. Conexión de Entrada y Medidores */}
            <div className="mb-6">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-3">
                A. Conexión de Entrada y Medidores:
              </h4>

              <div className="space-y-2 pl-2">
                <label
                  htmlFor="check-medidor"
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <button
                    id="check-medidor"
                    type="button"
                    onClick={() => updateField('checkMedidorFisico', !report.checkMedidorFisico)}
                    className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors ${
                      report.checkMedidorFisico
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-400 bg-white hover:border-slate-600'
                    }`}
                  >
                    {report.checkMedidorFisico && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className="text-sm text-slate-800">
                    - Estado físico del medidor/regulador
                  </span>
                </label>

                <label
                  htmlFor="check-fugas"
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <button
                    id="check-fugas"
                    type="button"
                    onClick={() => updateField('checkAusenciaFugas', !report.checkAusenciaFugas)}
                    className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors ${
                      report.checkAusenciaFugas
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-400 bg-white hover:border-slate-600'
                    }`}
                  >
                    {report.checkAusenciaFugas && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className="text-sm text-slate-800">
                    - Ausencia de fugas o corrosión visible
                  </span>
                </label>

                <label
                  htmlFor="check-llaves"
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <button
                    id="check-llaves"
                    type="button"
                    onClick={() => updateField('checkAccesibilidadLlaves', !report.checkAccesibilidadLlaves)}
                    className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors ${
                      report.checkAccesibilidadLlaves
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-400 bg-white hover:border-slate-600'
                    }`}
                  >
                    {report.checkAccesibilidadLlaves && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className="text-sm text-slate-800">
                    - Accesibilidad y llaves de paso principales
                  </span>
                </label>
              </div>

              {/* Observation Line A */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Observaciones:
                </span>
                <input
                  id="tech-notes-medidores"
                  type="text"
                  value={report.notesMedidores}
                  onChange={(e) => updateField('notesMedidores', e.target.value)}
                  placeholder="Observaciones sobre medidor, regulador y llaves de paso..."
                  className="flex-1 border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-transparent px-1 py-0.5 text-sm text-slate-900 outline-none transition-colors"
                />
              </div>
            </div>

            {/* B. Tuberías */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-3">B. Tuberías:</h4>

              <div className="space-y-2 pl-2">
                <label
                  htmlFor="check-hermeticidad"
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <button
                    id="check-hermeticidad"
                    type="button"
                    onClick={() => updateField('checkHermeticidad', !report.checkHermeticidad)}
                    className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors ${
                      report.checkHermeticidad
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-400 bg-white hover:border-slate-600'
                    }`}
                  >
                    {report.checkHermeticidad && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className="text-sm text-slate-800">- Hermeticidad</span>
                </label>

                <label
                  htmlFor="check-soportes"
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <button
                    id="check-soportes"
                    type="button"
                    onClick={() => updateField('checkSoportesFijaciones', !report.checkSoportesFijaciones)}
                    className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors ${
                      report.checkSoportesFijaciones
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-400 bg-white hover:border-slate-600'
                    }`}
                  >
                    {report.checkSoportesFijaciones && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className="text-sm text-slate-800">
                    - Estado de los soportes y fijaciones
                  </span>
                </label>

                <label
                  htmlFor="check-ventilaciones"
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <button
                    id="check-ventilaciones"
                    type="button"
                    onClick={() => updateField('checkVentilacionesRejillas', !report.checkVentilacionesRejillas)}
                    className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors ${
                      report.checkVentilacionesRejillas
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-400 bg-white hover:border-slate-600'
                    }`}
                  >
                    {report.checkVentilacionesRejillas && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className="text-sm text-slate-800">
                    - Ventilaciones y rejillas de seguridad
                  </span>
                </label>

                <label
                  htmlFor="check-artefactos"
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <button
                    id="check-artefactos"
                    type="button"
                    onClick={() => updateField('checkConexionArtefactos', !report.checkConexionArtefactos)}
                    className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors ${
                      report.checkConexionArtefactos
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-400 bg-white hover:border-slate-600'
                    }`}
                  >
                    {report.checkConexionArtefactos && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className="text-sm text-slate-800">
                    - Conexión de artefactos / equipos:
                  </span>
                </label>

                <label
                  htmlFor="check-griferias"
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <button
                    id="check-griferias"
                    type="button"
                    onClick={() => updateField('checkEstadoGriferias', !report.checkEstadoGriferias)}
                    className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-colors ${
                      report.checkEstadoGriferias
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-400 bg-white hover:border-slate-600'
                    }`}
                  >
                    {report.checkEstadoGriferias && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className="text-sm text-slate-800">- Estado de griferías</span>
                </label>
              </div>

              {/* Observation Line B */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Observaciones:
                </span>
                <input
                  id="tech-notes-tuberias"
                  type="text"
                  value={report.notesTuberias}
                  onChange={(e) => updateField('notesTuberias', e.target.value)}
                  placeholder="Observaciones sobre tuberías, rejillas, uniones..."
                  className="flex-1 border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-transparent px-1 py-0.5 text-sm text-slate-900 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 4. DETALLE DE HALLAZGOS Y ACCIONES RECOMENDADAS */}
          <div className="mb-8">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 mb-2">
              4. DETALLE DE HALLAZGOS Y ACCIONES RECOMENDADAS
            </h3>
            <hr className="border-t-2 border-slate-800 mb-4" />

            <textarea
              id="tech-findings-actions"
              rows={3}
              value={report.findingsAndActions}
              onChange={(e) => updateField('findingsAndActions', e.target.value)}
              placeholder="Describa aquí los hallazgos observados durante la inspección y las acciones correctivas recomendadas..."
              className="w-full border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-slate-50/50 p-2 text-sm text-slate-900 outline-none leading-relaxed resize-y rounded-t-sm"
            />
          </div>

          {/* 5. CONCLUSIONES Y RECOMENDACIONES FINALES */}
          <div className="mb-8">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 mb-2">
              5. CONCLUSIONES Y RECOMENDACIONES FINALES
            </h3>
            <hr className="border-t-2 border-slate-800 mb-4" />

            <textarea
              id="tech-conclusions"
              rows={3}
              value={report.conclusionsAndRecommendations}
              onChange={(e) => updateField('conclusionsAndRecommendations', e.target.value)}
              placeholder="Conclusiones finales del técnico/inspector e instrucciones para el propietario..."
              className="w-full border-b-2 border-slate-400 hover:border-slate-600 focus:border-slate-900 bg-slate-50/50 p-2 text-sm text-slate-900 outline-none leading-relaxed resize-y rounded-t-sm"
            />
          </div>

          {/* Firma */}
          <div className="pt-6 flex flex-col items-center justify-center">
            <div className="w-64 text-center">
              <input
                id="tech-signature-name"
                type="text"
                value={report.technicianSignatureName}
                onChange={(e) => updateField('technicianSignatureName', e.target.value)}
                placeholder="Nombre del firmante"
                className="w-full text-center text-sm font-bold border-b-2 border-slate-800 pb-1 outline-none bg-transparent"
              />
              <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wide">
                Firma
              </p>
              <p className="text-[11px] text-slate-400">Técnico / Inspector Autorizado</p>
            </div>
          </div>

          <div className="mt-8 text-right text-xs text-slate-400 font-bold">2</div>
        </div>

      {/* Floating Bottom Quick Actions */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-xl flex items-center justify-between flex-wrap gap-3 border border-slate-700">
        <div>
          <p className="text-xs text-slate-300 font-medium">Informe Técnico Listo</p>
          <p className="text-sm font-bold text-white">
            Nº {report.reportNumber || budget.number || '001'} • {report.clientName || budget.client.name || 'Cliente'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="bottom-tech-whatsapp-btn"
            type="button"
            onClick={() => openTechnicalReportWhatsApp(budget, profile)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            WhatsApp
          </button>

          <button
            id="bottom-tech-email-btn"
            type="button"
            onClick={() => openTechnicalReportEmail(budget, profile)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Correo
          </button>

          <button
            id="bottom-tech-download-btn"
            type="button"
            onClick={() => downloadTechnicalReportPDF(budget, profile)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar PDF Oficial
          </button>
        </div>
      </div>
    </div>
  );
};
