import React from 'react';
import { Budget } from '../types';
import { calculateBudgetTotals, formatMoney } from '../utils/pdfGenerator';
import { X, FolderOpen, Plus, Trash2, Calendar, User, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  budgets: Budget[];
  currentBudgetId: string;
  onSelectBudget: (id: string) => void;
  onNewBudget: () => void;
  onDeleteBudget: (id: string) => void;
}

export const SavedBudgetsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  budgets,
  currentBudgetId,
  onSelectBudget,
  onNewBudget,
  onDeleteBudget,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="saved-budgets-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        id="saved-budgets-modal"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Mis Presupuestos Guardados</h3>
              <p className="text-xs text-slate-500">Historial local de cotizaciones creadas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="new-budget-from-drawer-btn"
              type="button"
              onClick={() => {
                onNewBudget();
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo
            </button>
            <button
              id="close-drawer-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto divide-y divide-slate-100 space-y-3">
          {budgets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-medium text-slate-600">No tienes presupuestos guardados aún.</p>
              <p className="text-xs text-slate-400 mt-1">Los presupuestos que crees se guardarán automáticamente aquí.</p>
            </div>
          ) : (
            budgets.map((b) => {
              const totals = calculateBudgetTotals(b);
              const isCurrent = b.id === currentBudgetId;

              return (
                <div
                  key={b.id}
                  className={`pt-3 first:pt-0 flex items-center justify-between gap-3 p-3 rounded-xl transition-colors ${
                    isCurrent ? 'bg-indigo-50/70 border border-indigo-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      onSelectBudget(b.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        Nº {b.number || '001'}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold bg-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded">
                          En edición
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {b.date || 'Sin fecha'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium mt-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.client.name || 'Sin nombre de cliente'}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{b.items.length} {b.items.length === 1 ? 'ítem' : 'ítems'}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-900">
                        {formatMoney(totals.total, b.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBudget(b.id);
                        onClose();
                      }}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                      title="Abrir este presupuesto"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    {budgets.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBudget(b.id);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar de la lista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
