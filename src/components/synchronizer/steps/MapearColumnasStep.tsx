
interface TargetField {
  key: string;
  label: string;
  required: boolean;
  description: string;
}

// Declarado fuera del componente para evitar recreaciones en cada re-renderizado
const TARGET_FIELDS: TargetField[] = [
  { key: 'code_oem', label: 'Código / Referencia', required: true, description: 'Identificador único del repuesto o producto' },
  { key: 'price', label: 'Costo del Proveedor', required: true, description: 'Precio de compra base antes de aplicar fórmulas' },
  { key: 'stock', label: 'Stock / Cantidad', required: true, description: 'Unidades disponibles en el almacén del proveedor' },
  { key: 'supplier_name', label: 'Nombre del Proveedor', required: true, description: 'Identificar a qué proveedor pertenece la fila' }, // 👈 Agregado
  { key: 'description', label: 'Descripción', required: false, description: 'Nombre o detalle del artículo (opcional)' },
  { key: 'brand', label: 'Marca', required: false, description: 'Fabricante del producto (opcional)' },
];

interface MapearColumnasStepProps {
  fileName: string;
  headers: string[];
  mappings: Record<string, string | null>;
  setMappings: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  onBack: () => void;
  onNext: () => void;
}

export function MapearColumnasStep({
  fileName,
  headers,
  mappings,
  setMappings,
  onBack,
  onNext
}: MapearColumnasStepProps) {

  const handleSelectChange = (fieldKey: string, value: string) => {
    setMappings(prev => ({
      ...prev,
      [fieldKey]: value === "__vacio__" ? null : value
    }));
  };

  // Cálculos de estado derivados de los mapeos actuales
  const camposObligatoriosListos = TARGET_FIELDS
    .filter(f => f.required)
    .every(f => !!mappings[f.key]);

  const totalMapeados = Object.values(mappings).filter(Boolean).length;

  return (
    <div className="space-y-2">
      {/* Encabezado del Paso */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0b1120]/40 p-2 rounded-xl border border-slate-800/60">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Asociar Columnas del Proveedor</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Vincula los datos necesarios de <span className="text-blue-400 font-semibold">{fileName}</span> con el sistema.
          </p>
        </div>
      </header>

      {/* Lista de Campos del Formulario */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        {TARGET_FIELDS.map((field) => {
          const valorActual = mappings[field.key] || "__vacio__";
          const estaAsignado = valorActual !== "__vacio__";

          return (
            <div 
              key={field.key} 
              className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2 rounded-xl border transition-all duration-200 gap-4 ${
                estaAsignado 
                  ? "bg-slate-800/20 border-slate-700/60 shadow-sm" 
                  : field.required 
                    ? "bg-amber-500/2 border-amber-500/20" 
                    : "bg-slate-900/40 border-slate-800/80"
              }`}
            >
              {/* Información del Campo Requerido / Opcional */}
              <div className="space-y-1 max-w-sm">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-200 tracking-wide">
                    {field.label}
                  </label>
                  {field.required ? (
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded-sm font-bold uppercase tracking-wider">
                      Obligatorio
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-sm font-medium">
                      Opcional
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {field.description}
                </p>
              </div>

              {/* Selector Desplegable Dinámico */}
              <div className="relative w-full sm:w-64">
                <select
                  value={valorActual}
                  onChange={(e) => handleSelectChange(field.key, e.target.value)}
                  className={`w-full appearance-none bg-[#0b1120] border text-xs rounded-xl px-4 py-2.5 pr-10 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 transition-all font-medium ${
                    estaAsignado 
                      ? "border-blue-500/40 text-blue-300" 
                      : "border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <option value="__vacio__">-- Seleccionar columna --</option>
                  {headers.map((header, idx) => (
                    <option key={`${header}-${idx}`} value={header} className="text-slate-300 bg-[#0b1120]">
                      {header}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[9px]">
                  ▼
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer con Controles de Navegación */}
      <footer className="flex items-center justify-between px-10 py-2 border-t border-slate-800/60">
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <span>←</span> Volver a cargar
        </button>

        <div className="flex items-center gap-4">
          <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">
            {totalMapeados} de {TARGET_FIELDS.length} campos enlazados
          </span>
          <button
            disabled={!camposObligatoriosListos}
            onClick={onNext}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xl flex items-center gap-2 ${
              camposObligatoriosListos
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10 cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            Continuar al Sincronizador <span>→</span>
          </button>
        </div>
      </footer>
    </div>
  );
}