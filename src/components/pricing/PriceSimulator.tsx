import type { Supplier } from '../../env.d.ts';

interface PriceSimulatorProps {
  cost: number;
  setCost: (value: number) => void;
  suppliers: Supplier[];
  selectedId: string;
  taxPercent: number;
  setSelectedId: (id: string) => void;
  calculation: any;
}

export const PriceSimulator: React.FC<PriceSimulatorProps> = ({ 
  cost,
  setCost,
  suppliers,
  selectedId,
  taxPercent,
  setSelectedId,
  calculation // Datos viniendo de usePriceCalculator
}) => {
  const { finalPrice, markupValue, commissionValue, netProfit, appliedRule, taxValue, logisticValue } = calculation;

  return (

    <section className="bg-[#161e2e] border border-slate-800 rounded-xl shadow-2xl sticky top-1 overflow-hidden">
      <div className="p-5 border-b border-slate-800 bg-[#0b1120]/50">
        <h3 className="font-bold flex items-center gap-2 text-slate-100">
          Simulador de Precio
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Selección de Proveedor */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
            Proveedor a Simular
          </label>
          <select 
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3b82f6]"
          >
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Input de Costo */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Costo del Producto ($)</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
            className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 py-2 text-lg font-mono text-[#3b82f6] outline-none"
          />
        </div>

        {/* Desglose de Resultados */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          {/* Fila de Delivery */}
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Gastos Delivery:</span>
            <span className="text-blue-400">+${logisticValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">IVA ({taxPercent}%):</span>
            <span className="text-orange-400">-${taxValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Comisión ML:</span>
            <span className="text-red-400">-${commissionValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-slate-800 pt-3 text-white">
            <span>Precio Final:</span>
            <span>${finalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 italic">
            <span>Ganancia Neta:</span>
            <span>${netProfit.toFixed(2)}</span>
          </div>
        </div>

        {/* Info de Regla Aplicada */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex gap-3">
          <p className="text-[11px] text-blue-200/70">
            {appliedRule 
              ? `Aplicando regla de rango: $${appliedRule.sup_cost} - $${appliedRule.sell_cost}`
              : "No se encontró regla específica. Se aplican valores globales."}
          </p>
        </div>
      </div>
      
    </section>
  );
};