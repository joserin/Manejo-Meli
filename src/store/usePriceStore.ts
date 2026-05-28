import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Supplier } from '../env.d.ts';

interface PriceState {
  suppliers: Supplier[];
  global_ml_commission: number;
  tax_percent: number;
  
  // Acciones
  setSuppliers: (suppliers: Supplier[]) => void;
  setGlobalSettings: (commission: number, tax: number) => void;
  importConfig: (config: any) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
}

export const usePriceStore = create<PriceState>()(
  persist(
    (set) => ({
      // Valores iniciales por defecto
      suppliers: [],
      global_ml_commission: 12,
      tax_percent: 0,

      setSuppliers: (suppliers) => set({ suppliers }),

      updateSupplier: (id, data) => set((state) => ({
        suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...data } : s)
      })),
      
      setGlobalSettings: (global_ml_commission, tax_percent) => 
        set({ global_ml_commission, tax_percent }),

      importConfig: (config) => set({
        suppliers: config.suppliers || [],
        global_ml_commission: config.global_ml_commission || 12,
        tax_percent: config.tax_percent || 16,
      }),
    }),
    {
      name: 'price-settings-storage',
    }
  )
);