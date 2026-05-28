import React, { useState, useMemo } from 'react';
import { usePricingManager } from '../../hooks/usePricingManager';
import { calcularPrecioFinal } from '../../utils/priceUtils';
import { GlobalRulesCard } from './GlobalRulesCard';
import { SupplierCard } from './SupplierCard';
import { PriceSimulator } from './PriceSimulator';
import { AddSupplierModal } from './AddSupplierModal';

const PricingFormulaEditor = () => {
  // --- State ---
  const [simulatorCost, setSimulatorCost] = useState(0);
  const [selectedSupplierId, setSelectedSupplierId] = useState('1');
  const [searchTerm, setSearchTerm] = useState("");

  const { 
    suppliers,
    globalCommission,
    taxPercent,
    setGlobalCommission,
    setTaxPercent,
    addRange, 
    updateRule,
    removeRange,
    updateSupplierSettings,
    importConfig
  } = usePricingManager();

  const activeSupplier = useMemo(() => 
    suppliers.find(s => s.id === selectedSupplierId) || suppliers[0]
  , [suppliers, selectedSupplierId]);

  const filteredSuppliers = useMemo(() => 
    suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  , [suppliers, searchTerm]);

  const calculation = calcularPrecioFinal(
    simulatorCost,
    activeSupplier?.rules || [],
    globalCommission,
    taxPercent,
    activeSupplier?.customMarkup || 0,
    activeSupplier?.deliveryFee || 0
  );

  // --- Acciones de Archivos (JSON) ---
  const handleExportJSON = () => {
    const dataToExport = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      global_ml_commission: globalCommission,
      tax_percent: taxPercent,
      suppliers
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config_precios_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importConfig(json);
        alert("Configuración cargada correctamente en el navegador");
      } catch (err) {
        alert("Error: El archivo no tiene un formato válido.");
      }
    };
    reader.readAsText(file);
  };

  return (
      <div className=" space-y-4 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Columna Izquierda: Configuración */}
        <div className="lg:col-span-2 space-y-4">

          {/* BOTÓN DE Respaldo */}
          <section className="bg-[#161e2e] border border-slate-800 rounded-xl p-3 flex justify-between items-center gap-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase">Respaldo de Configuración</h4>
            
            <div className="flex gap-2">
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-slate-700 transition-all">
                Importar Respaldo
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>

              <button
                onClick={handleExportJSON}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
              >
                Exportar Respaldo
              </button>
            </div>
          </section>

          <GlobalRulesCard 
            globalCommission={globalCommission} 
            setGlobalCommission={setGlobalCommission} 
            taxPercent={taxPercent} 
            setTaxPercent={setTaxPercent}
          />

          <section className='flex flex-col space-y-3'>
            <header className='flex justify-between'>
              <h4 className="text-xs font-bold text-slate-400 uppercase">Proveedores</h4>
              <AddSupplierModal onSupplierAdded={(newId) => setSelectedSupplierId(newId)} />
            </header>
            
            <div className="flex flex-row gap-3 items-center justify-between">
              <input type="text" placeholder="Buscar..."
                className="bg-[#0b1120] border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none
                focus:border-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                id="supplier-select"
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full bg-[#161e2e] border border-slate-800 rounded-xl px-2 py-1 text-slate-100 cursor-pointer"
              >
                {/* filteredSuppliers.map para llenar las opciones del select */}
                {filteredSuppliers.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#161e2e]">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Reglas de {activeSupplier?.name}</h4>
            {activeSupplier && (
              <SupplierCard 
                key={activeSupplier.id}
                supplier={activeSupplier as any}
                onAddRange={() => addRange(activeSupplier.id)}
                onUpdateRule={(rId, updates) => updateRule(activeSupplier.id, rId, updates)}
                onRemoveRule={(rId) => removeRange(activeSupplier.id, rId)}
                onUpdateSupplier={(updates) => updateSupplierSettings(activeSupplier.id, updates as any)}
              />
            )}
          </section>

        </div>

        {/* Columna Derecha: Simulador */}
        <div className="space-y-6">
          <PriceSimulator 
            cost={simulatorCost}
            setCost={setSimulatorCost}
            suppliers={suppliers}
            selectedId={selectedSupplierId}
            taxPercent={taxPercent}
            setSelectedId={setSelectedSupplierId}
            calculation={calculation}
          />
        </div>
      </div>
  );
};

export default PricingFormulaEditor;
