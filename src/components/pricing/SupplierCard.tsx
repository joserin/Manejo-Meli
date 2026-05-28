import React from 'react';
import { PricingRuleRow } from './PricingRuleRow.tsx';
import type { Supplier } from '../../env.d.ts';

// Definición de tipos basada en tu esquema de base de datos 
interface Rule {
  id: string;
  sup_cost: number;
  sell_cost: number;
  fixed_markup: number;
  percentage_markup: number;
}


interface SupplierCardProps {
  supplier: Supplier;
  onAddRange: () => void;
  onRemoveRule: (ruleId: string) => void;
  onUpdateRule: (ruleId: string, updates: Partial<Rule>) => void;
  onUpdateSupplier: (updates: Partial<Supplier>) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  onAddRange,
  onRemoveRule,
  onUpdateRule,
  onUpdateSupplier
}) => {
  return (
        <div className="bg-[#161e2e] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            {/* Header del Proveedor */}
            <header className="p-2 bg-[#0b1120]/50 border-b border-slate-800 flex items-center justify-between">
                <section className="flex flex-col">
                    <h3 className="font-bold text-slate-200 text-base">{supplier.name}</h3>
                    <p className="text-xs text-slate-500">Configuración personalizada de logística y márgenes base.</p>
                </section>
            </header>

            <div className="grid grid-cols-2 gap-4 p-4 border-b border-slate-800 bg-[#0b1120]/30">
                <section className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Margen Sugerido (%)</label>
                    <input 
                        type="number"
                        value={supplier.customMarkup === 0 ? '' : supplier.customMarkup}
                        onChange={(e) => {
                            const val = e.target.value;
                            // Si está vacío guarda 0, si no, el número parseado
                            onUpdateSupplier({ customMarkup: val === '' ? 0 : Number(val) });
                        }}
                        className="w-full bg-[#0b1120] border border-slate-800 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                    />
                </section>
                <section className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Gasto Delivery ($)</label>
                    <input 
                        type="number"
                        value={supplier.deliveryFee === 0 ? '' : supplier.deliveryFee}
                        onChange={(e) => {
                            const val = e.target.value;
                            onUpdateSupplier({ deliveryFee: val === '' ? 0 : Number(val) });
                        }}
                        className="w-full bg-[#0b1120] border border-slate-800 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                    />
                </section>
            </div>

            {/* Listado de Reglas */}
            <div className="p-4 space-y-3">
                <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 text-xs font-bold text-slate-500 uppercase">Rango Costo</div>
                <div className="col-span-6 text-xs font-bold text-slate-500 uppercase">Calculo Margen</div>
                <div className="col-span-2"></div>
                </div>

                <div className="space-y-3">
                    {supplier.rules && supplier.rules.map((rule) => (
                        <PricingRuleRow
                            key={rule.id}
                            rule={rule}
                            onUpdate={(updates) => onUpdateRule(rule.id, updates)}
                            onRemove={() => onRemoveRule(rule.id)}
                        />
                    ))}
                </div>

                <button onClick={onAddRange}
                    className="w-full py-2 border border-dashed border-slate-800 rounded-lg 
                    text-xs font-semibold text-slate-500 hover:text-[#3b82f6]
                     hover:border-[#3b82f6]/50 transition-all flex items-center justify-center gap-2"
                >
                        Agregar Rango costes
                </button>
            </div>
        </div>
    );
};