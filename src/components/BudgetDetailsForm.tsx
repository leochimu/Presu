import React from 'react';
import { Budget } from '../types';
import { User, Phone, Mail, MapPin, Calendar, Hash, Percent, FileText } from 'lucide-react';
import { formatDateForInput } from '../utils/dateUtils';

interface Props {
  budget: Budget;
  onChange: (updated: Partial<Budget>) => void;
  onClientChange: (field: string, value: string) => void;
}

export const BudgetDetailsForm: React.FC<Props> = ({ budget, onChange, onClientChange }) => {
  return (
    <div id="budget-details-form" className="space-y-4">
      {/* Datos del Cliente */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
            1
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Datos del Cliente</h2>
            <p className="text-xs text-slate-500">A quién va dirigido el presupuesto (para envío automático)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nombre / Empresa del Cliente *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="client-name-input"
                type="text"
                placeholder="Ej: Acero & Asociados / María García"
                value={budget.client.name}
                onChange={(e) => onClientChange('name', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              WhatsApp / Teléfono
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="client-phone-input"
                type="text"
                placeholder="Ej: +54 9 11 9876-5432"
                value={budget.client.phone}
                onChange={(e) => onClientChange('phone', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Incluye código de país para abrir WhatsApp directo</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="client-email-input"
                type="email"
                placeholder="cliente@empresa.com"
                value={budget.client.email}
                onChange={(e) => onClientChange('email', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Dirección / Domicilio del Cliente
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="client-address-input"
                type="text"
                placeholder="Ej: Av. Corrientes 1234, CABA"
                value={budget.client.address || ''}
                onChange={(e) => onClientChange('address', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Visible en la propuesta PDF y en el informe técnico</p>
          </div>
        </div>
      </div>

      {/* Parámetros del Presupuesto */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
            2
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Opciones y Condiciones</h2>
            <p className="text-xs text-slate-500">Validez, descuentos y notas comerciales</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nº Presupuesto
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="budget-number-input"
                type="text"
                value={budget.number}
                onChange={(e) => onChange({ number: e.target.value })}
                placeholder="001"
                className="w-full pl-9 pr-2 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Fecha de Emisión
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="budget-date-input"
                type="date"
                value={formatDateForInput(budget.date)}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full pl-9 pr-2 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Fecha de Validez / Vigencia
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="budget-validity-input"
                type="date"
                value={formatDateForInput(budget.validUntil)}
                onChange={(e) => onChange({ validUntil: e.target.value })}
                className="w-full pl-9 pr-2 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Descuento (%)
            </label>
            <div className="relative">
              <Percent className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="budget-discount-input"
                type="number"
                min="0"
                max="100"
                value={budget.discountRate || ''}
                onChange={(e) => onChange({ discountRate: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Condiciones de Pago y Notas
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <textarea
                id="budget-notes-input"
                rows={2}
                value={budget.notes}
                onChange={(e) => onChange({ notes: e.target.value })}
                placeholder="Ej: Forma de pago 50% anticipo. Transferencia CBU/Alias..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
