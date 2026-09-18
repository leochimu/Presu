import React, { useState } from 'react';
import { Budget, CompanyProfile } from '../types';
import {
  openWhatsApp,
  openEmail,
  sharePDFFile,
  buildBudgetTextSummary,
} from '../utils/sharing';
import { downloadBudgetPDF } from '../utils/pdfGenerator';
import {
  X,
  MessageSquare,
  Mail,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
  profile: CompanyProfile;
}

export const ShareModal: React.FC<Props> = ({ isOpen, onClose, budget, profile }) => {
  const [phone, setPhone] = useState(budget.client.phone || '');
  const [email, setEmail] = useState(budget.client.email || '');
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = async () => {
    const text = buildBudgetTextSummary(budget, profile);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleWhatsAppSend = () => {
    openWhatsApp(budget, profile, phone);
  };

  const handleEmailSend = () => {
    openEmail(budget, profile, email);
  };

  const handleDirectSharePDF = async () => {
    setShareStatus('Abriendo menú de compartir...');
    const res = await sharePDFFile(budget, profile);
    if (!res.supported) {
      setShareStatus('Tu navegador no admite compartir archivos directamente; descargando PDF...');
      downloadBudgetPDF(budget, profile);
      setTimeout(() => setShareStatus(null), 3000);
    } else {
      setShareStatus(null);
    }
  };

  const textSummary = buildBudgetTextSummary(budget, profile);

  return (
    <div
      id="share-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="share-modal"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Enviar y Compartir Presupuesto
              </h3>
              <p className="text-xs text-slate-500">
                Presupuesto Nº {budget.number || '001'} para {budget.client.name || 'el cliente'}
              </p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Opción 1: WhatsApp */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-emerald-900">Enviar por WhatsApp</h4>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                Automático
              </span>
            </div>

            <p className="text-xs text-emerald-800/90 leading-relaxed">
              Abre una conversación de WhatsApp con el desglose completo del presupuesto y mensaje de cortesía pre-cargado.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  id="share-whatsapp-phone"
                  type="text"
                  placeholder="Número con código de país (ej: +54 9 11 1234-5678)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <button
                id="send-whatsapp-now-btn"
                type="button"
                onClick={handleWhatsAppSend}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir WhatsApp
              </button>
            </div>
          </div>

          {/* Opción 2: Correo Electrónico */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-blue-900">Enviar por Correo Electrónico</h4>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                Automático
              </span>
            </div>

            <p className="text-xs text-blue-800/90 leading-relaxed">
              Abre tu cliente de correo (Gmail, Outlook, etc.) con asunto y cuerpo formateados profesionalmente.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  id="share-email-address"
                  type="email"
                  placeholder="correo@cliente.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                id="send-email-now-btn"
                type="button"
                onClick={handleEmailSend}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Redactar Correo
              </button>
            </div>
          </div>

          {/* Opción 3: Descargar PDF y Compartir Archivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              id="download-pdf-modal-btn"
              type="button"
              onClick={() => downloadBudgetPDF(budget, profile)}
              className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar Informe en PDF
            </button>

            <button
              id="native-share-pdf-btn"
              type="button"
              onClick={handleDirectSharePDF}
              className="flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
            >
              <Share2 className="w-4 h-4" />
              Compartir archivo PDF
            </button>
          </div>

          {shareStatus && (
            <p className="text-xs text-center text-slate-500 italic">{shareStatus}</p>
          )}

          {/* Vista previa del texto que se envía */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Texto del resumen para mensajes
              </span>
              <button
                id="copy-summary-text-btn"
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-[11px] text-slate-600 max-h-32 overflow-y-auto whitespace-pre-wrap font-mono p-2 bg-white rounded-lg border border-slate-200">
              {textSummary}
            </pre>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            PDF vectorial de alta resolución listo para imprimir
          </span>
          <button
            id="close-modal-footer-btn"
            type="button"
            onClick={onClose}
            className="font-medium text-slate-700 hover:text-slate-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
