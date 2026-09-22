import React, { useState } from 'react';
import { Budget, CompanyProfile } from '../types';
import { calculateBudgetTotals, formatMoney } from '../utils/pdfGenerator';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  Receipt,
  ExternalLink,
  Copy,
  Check,
  Building,
  User,
  Calendar,
  DollarSign,
  FileText,
  ShieldCheck,
  Info
} from 'lucide-react';

interface Props {
  budget: Budget;
  profile: CompanyProfile;
  theme: 'slate' | 'graphite' | 'light';
  onShowToast: (message: string) => void;
}

export const BillingView: React.FC<Props> = ({
  budget,
  profile,
  theme,
  onShowToast
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const totals = calculateBudgetTotals(budget);
  const currency = budget.currency || '$';

  const isGraphite = theme === 'graphite';
  const isSlate = theme === 'slate';

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    onShowToast(`${label} copiado al portapapeles`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const cardBgClass = isGraphite
    ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
    : isSlate
    ? 'bg-slate-200/90 border-slate-300 text-slate-900'
    : 'bg-white border-slate-200 text-slate-900';

  const subCardBgClass = isGraphite
    ? 'bg-zinc-800/80 border-zinc-700/80'
    : isSlate
    ? 'bg-white/80 border-slate-300/80'
    : 'bg-slate-50 border-slate-200';

  const textMutedClass = isGraphite
    ? 'text-zinc-400'
    : isSlate
    ? 'text-slate-600'
    : 'text-slate-500';

  return (
    <div id="billing-view-container" className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Banner Principal con Botón de Acceso al Facturador AFIP */}
      <div
        id="afip-banner-card"
        className={`rounded-2xl p-6 sm:p-8 border shadow-sm transition-all ${
          isGraphite
            ? 'bg-linear-to-br from-zinc-900 via-zinc-850 to-zinc-900 border-emerald-900/60'
            : isSlate
            ? 'bg-linear-to-br from-slate-200 via-slate-100 to-slate-200 border-slate-300'
            : 'bg-linear-to-br from-emerald-50 via-white to-blue-50 border-emerald-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Portal Oficial AFIP / ARCA
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Facturación Electrónica AFIP
            </h2>
            <p className={`text-sm leading-relaxed ${textMutedClass}`}>
              Accede al facturador oficial de AFIP / ARCA para emitir tus comprobantes electrónicos (Factura A, B, C o Ticket) tomando como referencia los datos y totales de este presupuesto.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            {/* Botón principal solicitado por el usuario */}
            <a
              id="go-to-facturador-btn"
              href="https://facturador.afip.gob.ar/#/bienvenida#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
            >
              <Receipt className="w-5 h-5" />
              <span>Ir a facturador</span>
              <ExternalLink className="w-4 h-4 ml-0.5 opacity-90" />
            </a>

            <span className={`text-[11px] text-center ${textMutedClass}`}>
              Abre en una nueva pestaña
            </span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Datos Rápidos para la Factura */}
      <div className={`rounded-2xl p-6 border shadow-xs ${cardBgClass}`}>
        <div className="flex items-center justify-between border-b pb-4 mb-5 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Datos de Referencia para Facturar
              </h3>
              <p className={`text-xs ${textMutedClass}`}>
                Copia los valores del presupuesto actual para cargarlos rápidamente en el facturador
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
            Presupuesto Nº {budget.number || '001'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Monto Total */}
          <div className={`p-4 rounded-xl border ${subCardBgClass} flex flex-col justify-between`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={`font-semibold flex items-center gap-1.5 ${textMutedClass}`}>
                <DollarSign className="w-4 h-4 text-emerald-600" /> Total a Facturar
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(totals.total.toFixed(2), 'Total')}
                className="text-xs p-1 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors"
                title="Copiar total numérico"
              >
                {copiedField === 'Total' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatMoney(totals.total, currency)}
            </div>
            <span className={`text-[11px] mt-1 ${textMutedClass}`}>
              {budget.discountRate > 0 ? `Incluye ${budget.discountRate}% de descuento` : 'Sin descuentos'}
            </span>
          </div>

          {/* Cliente */}
          <div className={`p-4 rounded-xl border ${subCardBgClass} flex flex-col justify-between`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={`font-semibold flex items-center gap-1.5 ${textMutedClass}`}>
                <User className="w-4 h-4 text-blue-600" /> Cliente / Receptor
              </span>
              {budget.client.name && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(budget.client.name, 'Cliente')}
                  className="text-xs p-1 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors"
                  title="Copiar nombre"
                >
                  {copiedField === 'Cliente' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {budget.client.name || 'Sin especificar'}
            </div>
            <span className={`text-[11px] mt-1 ${textMutedClass} truncate`}>
              {budget.client.address ? `📍 ${budget.client.address}` : 'Sin domicilio cargado'}
            </span>
          </div>

          {/* Fecha del Presupuesto */}
          <div className={`p-4 rounded-xl border ${subCardBgClass} flex flex-col justify-between`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={`font-semibold flex items-center gap-1.5 ${textMutedClass}`}>
                <Calendar className="w-4 h-4 text-amber-600" /> Fecha del Servicio
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(formatDisplayDate(budget.date), 'Fecha')}
                className="text-xs p-1 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors"
                title="Copiar fecha"
              >
                {copiedField === 'Fecha' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {formatDisplayDate(budget.date) || 'Fecha de hoy'}
            </div>
            <span className={`text-[11px] mt-1 ${textMutedClass}`}>
              Emisión del comprobante
            </span>
          </div>
        </div>

        {/* Resumen de conceptos / ítems */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
            Conceptos a facturar ({budget.items.length})
          </h4>
          <div className="divide-y divide-slate-200 dark:divide-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden text-xs">
            {budget.items.length === 0 ? (
              <div className={`p-4 text-center ${textMutedClass}`}>
                No hay ítems cargados en el presupuesto actual.
              </div>
            ) : (
              budget.items.map((item, idx) => {
                const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <div
                    key={item.id || idx}
                    className={`flex items-center justify-between p-3 transition-colors ${subCardBgClass}`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.description || 'Ítem sin descripción'}
                      </p>
                      <p className={`text-[11px] ${textMutedClass}`}>
                        {item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'} × {formatMoney(item.unitPrice, currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatMoney(itemTotal, currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.description, `Ítem ${idx + 1}`)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 transition-colors"
                        title="Copiar descripción"
                      >
                        {copiedField === `Ítem ${idx + 1}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Guía Rápida de Pasos para AFIP Facturador */}
      <div className={`rounded-2xl p-5 border text-xs space-y-2.5 ${subCardBgClass}`}>
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-zinc-200">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Pasos sugeridos para facturar en AFIP / ARCA:</span>
        </div>
        <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 dark:text-zinc-400 leading-relaxed">
          <li>
            Haz clic en <strong>"Ir a facturador"</strong> para abrir el portal web de AFIP.
          </li>
          <li>
            Inicia sesión con tu <strong>CUIT</strong> y <strong>Clave Fiscal</strong> (o ingresa directamente si ya tienes la sesión abierta).
          </li>
          <li>
            Selecciona el punto de venta correspondiente y el tipo de comprobante (por ejemplo, Factura C o B según tu condición tributaria).
          </li>
          <li>
            Ingresa los datos del cliente (nombre, DNI/CUIT y dirección) y copia los importes detallados arriba.
          </li>
          <li>
            Genera la factura y descárgala para enviarla a tu cliente junto con el presupuesto.
          </li>
        </ol>
      </div>
    </div>
  );
};
