import React, { useState } from 'react';
import { usePriceStore } from '../../store/usePriceStore';
import type { Supplier } from '../../env.d.ts';

interface AddSupplierModalProps {
  onSupplierAdded: (id: string) => void;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ onSupplierAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const { suppliers, setSuppliers } = usePriceStore();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Crear el nuevo objeto proveedor con la estructura de tu env.d.ts
    const newSupplier: Supplier = {
      id: crypto.randomUUID(), // Genera un ID único e irrepetible
      name: name.trim(),
      deliveryFee: 0,
      customMarkup: 0,
      rules: [] // Inicia sin reglas para que luego se las agregues con `addRange`
    };

    // Guardar en el store de Zustand
    setSuppliers([...suppliers, newSupplier]);
    
    // Auto-seleccionar el nuevo proveedor en el editor principal
    onSupplierAdded(newSupplier.id);

    // Limpiar estado y cerrar modal
    setName('');
    setIsOpen(false);
  };

  return (
    <div>
      {/* Botón para abrir el formulario */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 whitespace-nowrap"
      >
        + Nuevo Proveedor
      </button>

      {/* Backdrop y Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161e2e] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Agregar Nuevo Proveedor</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="supplier-name" className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Nombre del Proveedor
                </label>
                <input
                  id="supplier-name"
                  type="text"
                  autoFocus
                  placeholder="Ej. Distribuidora Tech, Mayorista Centro..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Crear Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};