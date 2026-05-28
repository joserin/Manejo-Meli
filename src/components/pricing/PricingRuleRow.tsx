import type { PricingRule } from '../../env.d.ts';

// 2. Definimos las props del componente
interface PricingRuleRowProps {
  rule: PricingRule;
  onUpdate: (updates: Partial<PricingRule>) => void;
  onRemove: () => void;
}

export const PricingRuleRow: React.FC<PricingRuleRowProps> = ({ rule, onUpdate, onRemove }) => {

    const isFixed = rule.fixed_markup > 0 || (rule.fixed_markup === 0 && rule.percentage_markup === 0);
    const displayValue = isFixed ? rule.fixed_markup : rule.percentage_markup;

    return (
        <div className="grid grid-cols-12 gap-4 items-center group">
            {/* Inputs de Rango (Min - Max) */}
            <fieldset className="col-span-4 flex items-center gap-2">
                <section className="flex-1 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]">$</span>
                    <input
                        type="number"
                        aria-label="Costo mínimo"
                        value={rule.sup_cost === 0 ? '' : rule.sup_cost}
                        onChange={(e) => {
                            const val = e.target.value;
                            onUpdate({ sup_cost: val === '' ? 0 : Number(val) });
                        }}
                        className="w-full pl-5 pr-2 py-1.5 bg-[#0b1120] border border-slate-800 rounded text-xs outline-none focus:border-[#3b82f6]"
                    />
                </section>
                <span className="text-slate-600">—</span>
                <section className="flex-1 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]">$</span>
                    <input
                        type="number"
                        aria-label="Costo máximo"
                        value={rule.sell_cost === 0 ? '' : rule.sell_cost}
                        onChange={(e) => {
                            const val = e.target.value;
                            onUpdate({ sell_cost: val === '' ? 0 : Number(val) });
                        }}
                        className="w-full pl-5 pr-2 py-1.5 bg-[#0b1120] border border-slate-800 rounded text-xs outline-none focus:border-[#3b82f6]"
                    />
                </section>
            </fieldset>

            {/* Input de Valor de Markup y Selector de Tipo */}
            <fieldset className="col-span-6 flex items-center gap-2">
                <section className="flex-1 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#3b82f6] text-[10px] font-bold">+</span>
                    <input
                        type="number"
                        aria-label="Valor de margen"
                        value={displayValue}
                        onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdate(isFixed ? { fixed_markup: val } : { percentage_markup: val });
                        }}
                        className="w-full pl-5 pr-2 py-1.5 bg-[#0b1120] border border-slate-800 
                        rounded text-xs outline-none font-medium focus:border-[#3b82f6]"
                    />
                </section>
                <select 
                    aria-label="Tipo de margen"
                    value={isFixed ? 'fixed' : 'percent'}
                    onChange={(e) => {
                        const type = e.target.value;
                        if (type === 'fixed') {
                        onUpdate({ fixed_markup: displayValue, percentage_markup: 0 });
                        } else {
                        onUpdate({ percentage_markup: displayValue, fixed_markup: 0 });
                        }
                    }}
                    className="flex-1 py-1.5 bg-[#0b1120] border border-slate-800 rounded text-xs 
                    outline-none cursor-pointer">
                    <option value="fixed">Monto Fijo ($)</option>
                    <option value="percent">Porcentaje (%)</option>
                </select>
            </fieldset>

            {/* Botón de eliminar fila */}
            <fieldset className="col-span-2 text-right">
                <button onClick={onRemove} title="Eliminar regla" className="text-slate-600 hover:text-red-500">
                    Eliminar
                </button>
            </fieldset>
        </div>
    );
};

PricingRuleRow.displayName = 'PricingRuleRow';