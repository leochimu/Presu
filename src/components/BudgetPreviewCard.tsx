import React from 'react';
import { Budget, CompanyProfile } from '../types';
import { calculateBudgetTotals, formatMoney, downloadBudgetPDF } from '../utils/pdfGenerator';
import { formatDisplayDate } from '../utils/dateUtils';
import { Download, Share2, Mail, MessageCircle, Eye, Building2 } from 'lucide-react';

interface Props {
  budget: Budget;
  profile: CompanyProfile;
  onOpenShareModal: () => void;
  onOpenProfileModal: () => void;
}

export const BudgetPreviewCard: React.FC<Props> = ({
  budget,
  profile,
  onOpenShareModal,
  onOpenProfileModal,
}) => {
  const totals = calculateBudgetTotals(budget);
  const currency = budget.currency || '$';

  return (
    <div id="budget-preview-container" className="space-y-4">
      {/* Barra de acción rápida superior */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-slate-800">Vista Previa del Informe</span>
          <span className="hidden sm:inline text-xs text-slate-400">|</span>
          <span className="hidden sm:inline text-xs text-slate-500">Documento listo para exportar</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="download-pdf-btn"
            type="button"
            onClick={() => downloadBudgetPDF(budget, profile)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar PDF
          </button>

          <button
            id="open-share-actions-btn"
            type="button"
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Enviar / Compartir
          </button>
        </div>
      </div>

      {/* Hoja de papel A4 simulada */}
      <div
        id="a4-sheet"
        className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6 text-slate-800 relative transition-all"
      >
        {/* Encabezado Superior */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">
              Propuesta Comercial
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              PRESUPUESTO
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Nº {budget.number || '001'}
            </p>
            <div className="text-xs text-slate-500 mt-2 space-y-0.5">
              <p>
                <span className="font-medium text-slate-700">Fecha de emisión:</span>{' '}
                {formatDisplayDate(budget.date) || 'Hoy'}
              </p>
              {budget.validUntil && (
                <p>
                  <span className="font-medium text-slate-700">Vigencia hasta:</span>{' '}
                  {formatDisplayDate(budget.validUntil)}
                </p>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="flex items-center sm:justify-end gap-1.5 mb-1">
              <span className="font-bold text-slate-900 text-base">
                {profile.name || 'Mi Empresa / Profesional'}
              </span>
              <button
                type="button"
                onClick={onOpenProfileModal}
                title="Editar datos del emisor"
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs text-slate-500 space-y-0.5">
              {profile.taxId && <p>ID Fiscal: {profile.taxId}</p>}
              {profile.phone && <p>Tel: {profile.phone}</p>}
              {profile.email && <p>Email: {profile.email}</p>}
              {profile.address && <p>{profile.address}</p>}
              {!profile.phone && !profile.email && (
                <button
                  type="button"
                  onClick={onOpenProfileModal}
                  className="text-xs text-blue-600 hover:underline inline-block mt-1"
                >
                  + Agregar datos de emisor
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Destinatario / Cliente */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Dirigido a:
          </p>
          <p className="text-sm font-bold text-slate-900">
            {budget.client.name?.trim() || 'Nombre del Cliente'}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-1.5">
            {budget.client.phone && <span>📞 {budget.client.phone}</span>}
            {budget.client.email && <span>✉️ {budget.client.email}</span>}
            {budget.client.address && <span>📍 {budget.client.address}</span>}
            {!budget.client.phone && !budget.client.email && (
              <span className="text-slate-400 italic">Sin datos de contacto cargados</span>
            )}
          </div>
        </div>

        {/* Tabla de ítems */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-800">
              <tr>
                <th className="py-2.5 px-2 w-10 text-center">#</th>
                <th className="py-2.5 px-2">Descripción</th>
                <th className="py-2.5 px-2 w-16 text-center">Cant.</th>
                <th className="py-2.5 px-2 w-28 text-right">Precio</th>
                <th className="py-2.5 px-2 w-28 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budget.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 text-xs italic">
                    Aún no hay ítems cargados en el presupuesto
                  </td>
                </tr>
              ) : (
                budget.items.map((item, idx) => {
                  const itemQty = Number(item.quantity) || 0;
                  const itemPrice = Number(item.unitPrice) || 0;
                  const itemTotal = itemQty * itemPrice;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-2 text-center text-xs text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-2 font-medium text-slate-800">
                        {item.description || 'Ítem sin descripción'}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{itemQty}</td>
                      <td className="py-2.5 px-2 text-right text-slate-600">
                        {formatMoney(itemPrice, currency)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-slate-900">
                        {formatMoney(itemTotal, currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totales y notas */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          <div className="md:col-span-7">
            {budget.notes && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Condiciones y notas comerciales
                </p>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {budget.notes}
                </p>
              </div>
            )}
          </div>

          <div className="md:col-span-5">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900">{formatMoney(totals.subtotal, currency)}</span>
              </div>

              {budget.discountRate > 0 && (
                <div className="flex justify-between text-xs text-rose-600">
                  <span>Descuento ({budget.discountRate}%):</span>
                  <span className="font-medium">-{formatMoney(totals.discountAmount, currency)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">TOTAL:</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {formatMoney(totals.total, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie del documento */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>Presupuesto comercial sin validez de factura fiscal oficial.</p>
          <p>Generado con Generador de Presupuestos</p>
        </div>
      </div>
    </div>
  );
};
