import { useState, useEffect } from 'react';
import { Budget, CompanyProfile, BudgetItem } from './types';
import { ItemsTable } from './components/ItemsTable';
import { BudgetDetailsForm } from './components/BudgetDetailsForm';
import { BudgetPreviewCard } from './components/BudgetPreviewCard';
import { CompanyProfileModal } from './components/CompanyProfileModal';
import { ShareModal } from './components/ShareModal';
import { SavedBudgetsDrawer } from './components/SavedBudgetsDrawer';
import { calculateBudgetTotals, formatMoney, downloadBudgetPDF } from './utils/pdfGenerator';
import { openWhatsApp, openEmail } from './utils/sharing';
import {
  FileSpreadsheet,
  Download,
  Share2,
  Building2,
  FolderOpen,
  Plus,
  Eye,
  Edit3,
  MessageSquare,
  Mail,
  CheckCircle2,
} from 'lucide-react';

const DEFAULT_PROFILE: CompanyProfile = {
  name: 'Mi Empresa de Servicios',
  phone: '+54 9 11 5555-4321',
  email: 'contacto@empresa.com',
  address: 'Buenos Aires, Argentina',
  taxId: '20-33445566-7',
};

const createInitialBudget = (): Budget => {
  const today = new Date().toISOString().split('T')[0];
  const inFifteenDays = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  return {
    id: 'budget-' + Date.now(),
    number: '001',
    date: today,
    validUntil: inFifteenDays,
    currency: '$',
    items: [
      {
        id: '1',
        description: 'Servicio de consultoría y planificación técnica',
        quantity: 1,
        unitPrice: 15000,
      },
      {
        id: '2',
        description: 'Desarrollo y puesta en marcha del proyecto',
        quantity: 1,
        unitPrice: 38000,
      },
      {
        id: '3',
        description: 'Capacitación y soporte técnico inicial (horas)',
        quantity: 4,
        unitPrice: 4500,
      },
    ],
    client: {
      name: 'Cliente Ejemplo S.A.',
      phone: '+54 9 11 9876-5432',
      email: 'cliente@ejemplo.com',
      address: 'Av. Corrientes 1234, CABA',
    },
    notes: 'Presupuesto con validez por 15 días.\nForma de pago: 50% de anticipo y 50% contra entrega conforme.\nTransferencia bancaria a CBU / Alias especificado en factura.',
    taxRate: 21,
    discountRate: 0,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
};

export default function App() {
  // Local storage initialization
  const [profile, setProfile] = useState<CompanyProfile>(() => {
    try {
      const saved = localStorage.getItem('presupuesto_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem('presupuesto_budgets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [createInitialBudget()];
  });

  const [activeBudgetId, setActiveBudgetId] = useState<string>(() => {
    return budgets[0]?.id || '';
  });

  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Get active budget
  const currentBudget = budgets.find((b) => b.id === activeBudgetId) || budgets[0] || createInitialBudget();

  // Persist profile
  useEffect(() => {
    try {
      localStorage.setItem('presupuesto_profile', JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  // Persist budgets
  useEffect(() => {
    try {
      localStorage.setItem('presupuesto_budgets', JSON.stringify(budgets));
    } catch {
      // ignore
    }
  }, [budgets]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Update budget properties
  const handleUpdateCurrentBudget = (updates: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === currentBudget.id ? { ...b, ...updates } : b))
    );
  };

  // Update items
  const handleUpdateItems = (newItems: BudgetItem[]) => {
    handleUpdateCurrentBudget({ items: newItems });
  };

  // Update client info
  const handleClientChange = (field: string, value: string) => {
    handleUpdateCurrentBudget({
      client: {
        ...currentBudget.client,
        [field]: value,
      },
    });
  };

  // Create new budget
  const handleCreateNewBudget = () => {
    const nextNumberInt = budgets.length + 1;
    const formattedNum = String(nextNumberInt).padStart(3, '0');
    const today = new Date().toISOString().split('T')[0];
    const inFifteenDays = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

    const newBudget: Budget = {
      id: 'budget-' + Date.now(),
      number: formattedNum,
      date: today,
      validUntil: inFifteenDays,
      currency: currentBudget.currency || '$',
      items: [],
      client: {
        name: '',
        phone: '',
        email: '',
      },
      notes: 'Presupuesto válido por 15 días corridos.\nForma de pago a coordinar.',
      taxRate: currentBudget.taxRate ?? 0,
      discountRate: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    setBudgets((prev) => [newBudget, ...prev]);
    setActiveBudgetId(newBudget.id);
    setViewMode('editor');
    showToast(`Nuevo presupuesto Nº ${formattedNum} creado`);
  };

  // Delete budget
  const handleDeleteBudget = (id: string) => {
    if (budgets.length <= 1) return;
    const filtered = budgets.filter((b) => b.id !== id);
    setBudgets(filtered);
    if (activeBudgetId === id) {
      setActiveBudgetId(filtered[0]?.id || '');
    }
    showToast('Presupuesto eliminado');
  };

  const totals = calculateBudgetTotals(currentBudget);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-16 antialiased flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Principal */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Generador de Presupuestos
                </h1>
                <span className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  Nº {currentBudget.number}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Carga ítems, genera informes en PDF y envía por WhatsApp o Correo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="saved-budgets-btn"
              type="button"
              onClick={() => setIsSavedDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Ver presupuestos guardados"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Presupuestos</span>
              <span className="text-[10px] bg-slate-300 px-1.5 py-0.2 rounded-full font-bold">
                {budgets.length}
              </span>
            </button>

            <button
              id="edit-profile-header-btn"
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Configurar datos de mi negocio"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mis Datos</span>
            </button>

            <button
              id="new-budget-header-btn"
              type="button"
              onClick={handleCreateNewBudget}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
              title="Crear un presupuesto nuevo"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Selector de modo en pantallas pequeñas/medianas */}
      <div className="xl:hidden bg-white border-b border-slate-200 sticky top-16 z-30 px-4 py-2 flex items-center justify-center">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            id="tab-editor-btn"
            type="button"
            onClick={() => setViewMode('editor')}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'editor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            1. Cargar Datos e Ítems
          </button>
          <button
            id="tab-preview-btn"
            type="button"
            onClick={() => setViewMode('preview')}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            2. Ver Informe PDF
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Formulario e Items */}
          <div
            className={`xl:col-span-6 space-y-6 ${
              viewMode === 'editor' ? 'block' : 'hidden xl:block'
            }`}
          >
            {/* Items y precios */}
            <ItemsTable
              items={currentBudget.items}
              currency={currentBudget.currency}
              onUpdateItems={handleUpdateItems}
            />

            {/* Datos del Cliente y Condiciones */}
            <BudgetDetailsForm
              budget={currentBudget}
              onChange={handleUpdateCurrentBudget}
              onClientChange={handleClientChange}
            />

            {/* Resumen flotante inferior en modo editor */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-slate-400">Total a Presupuestar</p>
                <p className="text-2xl font-extrabold text-white">
                  {formatMoney(totals.total, currentBudget.currency)}
                </p>
                <p className="text-[11px] text-slate-400">
                  {currentBudget.items.length} {currentBudget.items.length === 1 ? 'ítem' : 'ítems'} cargados
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="editor-preview-btn"
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className="xl:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver Informe
                </button>

                <button
                  id="editor-send-whatsapp-btn"
                  type="button"
                  onClick={() => openWhatsApp(currentBudget, profile)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </button>

                <button
                  id="editor-download-pdf-btn"
                  type="button"
                  onClick={() => downloadBudgetPDF(currentBudget, profile)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Vista Previa y Acciones de Envío */}
          <div
            className={`xl:col-span-6 space-y-4 ${
              viewMode === 'preview' ? 'block' : 'hidden xl:block'
            }`}
          >
            {/* Barra de acceso directo para enviar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                id="quick-whatsapp-send-btn"
                type="button"
                onClick={() => openWhatsApp(currentBudget, profile)}
                className="flex flex-col items-center justify-center p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors text-center"
              >
                <MessageSquare className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Enviar WhatsApp</span>
                <span className="text-[10px] text-emerald-100 opacity-90">Resumen y total</span>
              </button>

              <button
                id="quick-email-send-btn"
                type="button"
                onClick={() => openEmail(currentBudget, profile)}
                className="flex flex-col items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors text-center"
              >
                <Mail className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Enviar Correo</span>
                <span className="text-[10px] text-blue-100 opacity-90">Cuerpo detallado</span>
              </button>

              <button
                id="quick-download-pdf-btn"
                type="button"
                onClick={() => downloadBudgetPDF(currentBudget, profile)}
                className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors text-center"
              >
                <Download className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Descargar PDF</span>
                <span className="text-[10px] text-slate-300 opacity-90">Vectorial A4</span>
              </button>

              <button
                id="quick-open-share-modal-btn"
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="flex flex-col items-center justify-center p-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl transition-colors text-center"
              >
                <Share2 className="w-5 h-5 mb-1 text-slate-600" />
                <span className="text-xs font-bold">Más Opciones</span>
                <span className="text-[10px] text-slate-400">Copiar, adjuntos</span>
              </button>
            </div>

            {/* Vista Previa del Documento */}
            <BudgetPreviewCard
              budget={currentBudget}
              profile={profile}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Modales */}
      <CompanyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={(updated) => {
          setProfile(updated);
          showToast('Datos de empresa guardados correctamente');
        }}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        budget={currentBudget}
        profile={profile}
      />

      <SavedBudgetsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        budgets={budgets}
        currentBudgetId={currentBudget.id}
        onSelectBudget={(id) => {
          setActiveBudgetId(id);
          showToast('Presupuesto cargado');
        }}
        onNewBudget={handleCreateNewBudget}
        onDeleteBudget={handleDeleteBudget}
      />
    </div>
  );
}
