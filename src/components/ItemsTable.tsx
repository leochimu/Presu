import React, { useState, useRef } from 'react';
import { BudgetItem, CatalogItem } from '../types';
import { Plus, Trash2, Copy, Sparkles, AlertCircle, Tag, Check } from 'lucide-react';
import { formatMoney } from '../utils/pdfGenerator';

interface Props {
  items: BudgetItem[];
  currency: string;
  catalogItems?: CatalogItem[];
  onUpdateItems: (items: BudgetItem[]) => void;
}

export const ItemsTable: React.FC<Props> = ({
  items,
  currency,
  catalogItems = [],
  onUpdateItems,
}) => {
  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState<number | string>(1);
  const [price, setPrice] = useState<number | string>('');
  const [inputError, setInputError] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [autoFilledNotice, setAutoFilledNotice] = useState<string | null>(null);

  const descInputRef = useRef<HTMLInputElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);

  const matchingSuggestions = desc.trim()
    ? catalogItems.filter((cat) =>
        cat.name.toLowerCase().includes(desc.trim().toLowerCase())
      )
    : [];

  const handleSelectSuggestion = (item: CatalogItem) => {
    setDesc(item.name);
    setPrice(item.unitPrice);
    setIsSuggestionsOpen(false);
    setHighlightedIndex(-1);
    setAutoFilledNotice(`Reconocido: ${item.name} (${formatMoney(item.unitPrice, currency)})`);
    setTimeout(() => setAutoFilledNotice(null), 3000);

    setTimeout(() => {
      qtyInputRef.current?.focus();
      qtyInputRef.current?.select();
    }, 40);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionsOpen || matchingSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < matchingSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : matchingSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < matchingSuggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(matchingSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsSuggestionsOpen(false);
    }
  };

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!desc.trim()) {
      setInputError('Por favor escribe una descripción del ítem o servicio.');
      descInputRef.current?.focus();
      return;
    }

    const numericQty = Number(qty) > 0 ? Number(qty) : 1;
    const numericPrice = Number(price) >= 0 ? Number(price) : 0;

    const newItem: BudgetItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      description: desc.trim(),
      quantity: numericQty,
      unitPrice: numericPrice,
    };

    onUpdateItems([...items, newItem]);
    setDesc('');
    setQty(1);
    setPrice('');
    setInputError('');
    setIsSuggestionsOpen(false);
    setHighlightedIndex(-1);
    descInputRef.current?.focus();
  };

  const handleUpdateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    onUpdateItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(items.filter((item) => item.id !== id));
  };

  const handleDuplicateItem = (item: BudgetItem) => {
    const duplicated: BudgetItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      description: `${item.description} (copia)`,
    };
    onUpdateItems([...items, duplicated]);
  };

  const handleLoadSampleItems = () => {
    const samples: BudgetItem[] = [
      { id: '1', description: 'Servicio de diseño y desarrollo web', quantity: 1, unitPrice: 450 },
      { id: '2', description: 'Mantenimiento mensual y soporte técnico', quantity: 3, unitPrice: 60 },
      { id: '3', description: 'Configuración de dominio y correo corporativo', quantity: 1, unitPrice: 85 },
    ];
    onUpdateItems(samples);
  };

  return (
    <div id="items-section" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
            1
          </span>
          <h2 className="text-base font-semibold text-slate-800">Cargar Ítems y Precios</h2>
        </div>
        <div className="flex items-center gap-2">
          {items.length === 0 && (
            <button
              id="load-sample-items-btn"
              type="button"
              onClick={handleLoadSampleItems}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Cargar ejemplo
            </button>
          )}
          <span className="text-xs text-slate-500 font-medium">
            {items.length} {items.length === 1 ? 'ítem cargado' : 'ítems cargados'}
          </span>
        </div>
      </div>

      {/* Formulario rápido para añadir nuevo ítem */}
      <form
        onSubmit={handleAddItem}
        className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-6 relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600">
                Descripción / Concepto *
              </label>
              {catalogItems.length > 0 && (
                <span className="text-[10px] text-slate-400">
                  Autocompleta desde Catálogo
                </span>
              )}
            </div>
            <input
              id="new-item-desc"
              ref={descInputRef}
              type="text"
              placeholder="Ej: Mano de obra, Caño 1/2, Instalación..."
              value={desc}
              autoComplete="off"
              onFocus={() => {
                if (desc.trim()) setIsSuggestionsOpen(true);
              }}
              onBlur={() => {
                setTimeout(() => setIsSuggestionsOpen(false), 200);
              }}
              onChange={(e) => {
                setDesc(e.target.value);
                setIsSuggestionsOpen(true);
                setHighlightedIndex(-1);
                if (inputError) setInputError('');
              }}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-medium"
            />

            {/* Dropdown de autocompletado */}
            {isSuggestionsOpen && matchingSuggestions.length > 0 && (
              <div
                ref={suggestionsContainerRef}
                className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto py-1 text-sm divide-y divide-slate-100 animate-in fade-in duration-100"
              >
                <div className="px-3 py-1 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    Catálogo de Ítems
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Click o Flechas + Enter
                  </span>
                </div>
                {matchingSuggestions.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(item);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                      highlightedIndex === idx
                        ? 'bg-emerald-50 text-emerald-950 font-semibold'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{item.name}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200">
                      {formatMoney(item.unitPrice, currency)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:col-span-4 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Cantidad
              </label>
              <input
                id="new-item-qty"
                ref={qtyInputRef}
                type="number"
                min="0.01"
                step="any"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-center font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Precio Unit. ({currency})
              </label>
              <input
                id="new-item-price"
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-right font-semibold"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              id="add-item-btn"
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
        </div>

        {inputError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{inputError}</span>
          </div>
        )}

        {autoFilledNotice && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium animate-in fade-in duration-150">
            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{autoFilledNotice} — Solo ajusta la cantidad si hace falta y haz clic en &quot;Agregar&quot;.</span>
          </div>
        )}
      </form>

      {/* Tabla de ítems cargados */}
      {items.length === 0 ? (
        <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-sm font-medium text-slate-600">No hay ítems cargados en el presupuesto</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Usa el formulario superior para añadir los productos, servicios, cantidad y precios que deseas cotizar.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">Descripción</th>
                <th className="py-2.5 px-3 w-24 text-center">Cant.</th>
                <th className="py-2.5 px-3 w-32 text-right">Precio Unit.</th>
                <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
                <th className="py-2.5 px-3 w-20 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((item, index) => {
                const itemQty = Number(item.quantity) || 0;
                const itemPrice = Number(item.unitPrice) || 0;
                const itemSubtotal = itemQty * itemPrice;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-xs font-medium text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        className="w-full text-sm font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-none transition-colors py-0.5"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20 text-center text-sm bg-slate-50 border border-slate-200 rounded px-1.5 py-1 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-slate-400">{currency}</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 text-right text-sm bg-slate-50 border border-slate-200 rounded px-1.5 py-1 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                      {formatMoney(itemSubtotal, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateItem(item)}
                          title="Duplicar ítem"
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Eliminar ítem"
                          className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
