import React, { useState } from 'react';
import { CompanyProfile } from '../types';
import { Building2, X, Check, Phone, Mail, MapPin, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: CompanyProfile;
  onSave: (updated: CompanyProfile) => void;
}

export const CompanyProfileModal: React.FC<Props> = ({ isOpen, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState<CompanyProfile>(profile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div id="company-profile-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div id="company-profile-modal" className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Datos de tu Empresa o Negocio</h3>
              <p className="text-xs text-slate-500">Aparecerán en el encabezado de tus presupuestos y PDF</p>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Nombre Comercial o Profesional *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="profile-name-input"
                type="text"
                required
                placeholder="Ej: Estudio Creativo / Juan Pérez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Teléfono / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="profile-phone-input"
                  type="text"
                  placeholder="+54 9 11 1234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="profile-email-input"
                  type="email"
                  placeholder="contacto@negocio.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Identificación Fiscal (CUIT, RUT, RFC, NIF)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="profile-taxid-input"
                  type="text"
                  placeholder="Ej: 20-34567890-9"
                  value={formData.taxId || ''}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Ciudad o Dirección
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="profile-address-input"
                  type="text"
                  placeholder="Ciudad, País"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              id="cancel-profile-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              id="save-profile-btn"
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              Guardar Datos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
