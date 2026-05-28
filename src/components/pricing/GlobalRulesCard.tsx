interface GlobalRulesCardProps {
  globalCommission: number;
  setGlobalCommission: (value: number) => void;
  taxPercent: number;
  setTaxPercent: (value: number) => void;
}

export const GlobalRulesCard: React.FC<GlobalRulesCardProps> = ({ 
    globalCommission, 
    setGlobalCommission, 
    taxPercent, 
    setTaxPercent}) => {
        return (
            <section className="bg-[#161e2e] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <header className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                        Reglas Globales
                    </h3>
                </header>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <section className="space-y-2">
                        <label htmlFor="global-commission"
                            className="text-xs font-semibold text-slate-500 uppercase">ML Comision (%)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="global-commission"
                                value={globalCommission}
                                onChange={(e) => setGlobalCommission(Number(e.target.value))}
                                className="w-full bg-[#0b1120] border border-slate-800 rounded-lg 
                                px-4 py-2.5 focus:ring-1 focus:ring-[#3b82f6] outline-none text-sm"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 
                            font-medium">%</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Deduccion Comision</p>
                    </section>
                    <section className="space-y-2">
                        <label 
                            htmlFor="global-markup"
                            className="text-xs font-semibold text-slate-500 uppercase">
                                Impuestos (%)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="global-markup"
                                value={taxPercent}
                                onChange={(e) => setTaxPercent(Number(e.target.value))}
                                className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 
                                py-2.5 focus:ring-1 focus:ring-[#3b82f6] outline-none text-sm"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Margen ganancia</p>
                    </section>
                </div>
            </section>
        )
};