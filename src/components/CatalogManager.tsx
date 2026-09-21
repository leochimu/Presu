import React, { useState, useRef } from 'react';
import { CatalogItem } from '../types';
import { Plus, Trash2, Search, Tag, Check, ArrowRight, Sparkles } from 'lucide-react';
import { formatMoney } from '../utils/pdfGenerator';

interface Props {
  catalog: CatalogItem[];
  currency: string;
  onAddCatalogItem: (item: Omit<CatalogItem, 'id'>) => void;
  onDeleteCatalogItem: (id: string) => void;
  onQuickAddToBudget?: (name: string, price: number) => void;
}

export const CatalogManager: React.FC<Props> = ({
  catalog,
  currency,
  onAddCatalogItem,
  onDeleteCatalogItem,
  onQuickAddToBudget,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string | number>('');
  const [search, setSearch] = useState('');
  const [addedItemSuccess, setAddedItemSuccess] = useState<string | null>(null);
  const [error, setError] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa el nombre o descripción del ítem');
      nameInputRef.current?.focus();
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setError('Por favor ingresa un precio válido');
      return;
    }

    onAddCatalogItem({
      name: name.trim(),
      unitPrice: numericPrice,
    });

    setName('');
    setPrice('');
    setError('');
    nameInputRef.current?.focus();
  };

  const filteredCatalog = catalog.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleQuickAdd = (item: CatalogItem) => {
    if (onQuickAddToBudget) {
      onQuickAddToBudget(item.name, item.unitPrice);
      setAddedItemSuccess(item.id);
      setTimeout(() => setAddedItemSuccess(null), 2000);
    }
  };

  return (
    <div id="catalog-manager" className="space-y-4">
      {/* Tarjeta de Carga de Ítem */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
              <Tag className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Catálogo de Ítems y Precios</h2>
              <p className="text-xs text-slate-500">
                Guarda tus materiales y servicios frecuentes. Se autoreconocerán al escribir en el presupuesto.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
            {catalog.length} {catalog.length === 1 ? 'ítem guardado' : 'ítems guardados'}
          </span>
        </div>

        {/* Formulario de Alta */}
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-7">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción / Material / Servicio *
              </label>
              <input
                id="catalog-item-name-input"
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ej: Caño 1/2, Mano de obra, Caño 3/4..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Precio Unit. ({currency}) *
              </label>
              <input
                id="catalog-item-price-input"
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (error) setError('');
                }}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-right font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                id="save-catalog-item-btn"
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          )}
        </form>

        {/* Buscador de Ítems */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="catalog-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ítem en tu catálogo (ej: caño, mano, cable)..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Lista / Tabla de Ítems */}
        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <th className="py-2.5 px-3">Descripción / Concepto</th>
                <th className="py-2.5 px-3 text-right">Precio Unitario</th>
                <th className="py-2.5 px-3 text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    {search ? (
                      <p>No se encontraron ítems que coincidan con &quot;{search}&quot;</p>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-medium text-slate-600">No hay ítems en el catálogo todavía</p>
                        <p className="text-xs text-slate-400">
                          Escribe arriba un material o servicio (ej: Caño 1/2) y su precio para guardarlo.
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCatalog.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                      {formatMoney(item.unitPrice, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        {onQuickAddToBudget && (
                          <button
                            id={`add-to-budget-btn-${item.id}`}
                            type="button"
                            onClick={() => handleQuickAdd(item)}
                            title="Agregar al presupuesto actual"
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                              addedItemSuccess === item.id
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {addedItemSuccess === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Añadido</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Usar</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          id={`delete-catalog-item-btn-${item.id}`}
                          type="button"
                          onClick={() => onDeleteCatalogItem(item.id)}
                          title="Eliminar del catálogo"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
