import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useSyncProcessor } from '../../../hooks/useSyncProcessor';
import type { ItemDiferencia } from '../../../env.d.ts';

interface ProcesarDescargaStepProps {
  providerRows: any[];
  providerHeaders: string[];
  mappings: Record<string, string | null>;
  mlWorkbook: any;
  mlFileName: string;
  onBack: () => void;
}

export function ProcesarDescargaStep({
  providerRows,
  mappings,
  mlWorkbook,
  mlFileName,
  onBack,
}: ProcesarDescargaStepProps) {
  
  // Consumir el estado global de proveedores, comisión por defecto e IVA desde Zustand
  const { ejecutarSincronizacion, isProcessing } = useSyncProcessor(providerRows, mappings, mlWorkbook);
  const [resumenCambios, setResumenCambios] = useState<{
    totalFilasMeli: number;
    preciosActualizados: number;
    stockActualizados: number;
    listaCambios: ItemDiferencia[];
    workbookFinal: any;
  } | null>(null);
  
  const handleStartSincronizacion = () => {
    const colCodigoProv = mappings['code_oem'];
    const colPrecioProv = mappings['price'];
    const colStockProv = mappings['stock'];
    const colNombreProv = mappings['supplier_name'];

    if (!colCodigoProv || !colPrecioProv || !colStockProv || !colNombreProv) {
      alert("Faltan mapeos obligatorios del proveedor (Código, Precio, Stock o Nombre del Proveedor).");
      return;
    }
    
    try {
      const resultados = ejecutarSincronizacion();
      setResumenCambios(resultados);
    } catch (error) {
      console.error("Error al sincronizar lista multi-proveedor:", error);
      alert("Ocurrió un error inesperado al cruzar los archivos.");
    }
  };

  const handleDescargarArchivoFinal = () => {
    if (!resumenCambios || !resumenCambios.workbookFinal) return;

    const nombreSalida = 'cambios_plantillas.xlsx';

    try {
      // 1. Crear un libro de trabajo (Workbook) nuevo y vacío
      const wb = XLSX.utils.book_new();
      // 2. Convertir el arreglo plano de objetos actualizados a una hoja de Excel (Worksheet)
      const ws = XLSX.utils.json_to_sheet(resumenCambios.workbookFinal);
      // 3. Añadir la hoja al libro (puedes llamarla 'Sheet1' o mantener el nombre original si lo prefieres)
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      // 4. Ahora sí, escribir el archivo pasándole la estructura válida
      XLSX.writeFile(wb, nombreSalida);

    } catch (error) {
      console.error("Error intentando empaquetar o descargar el Excel:", error);
    }
  };

 return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ESTADO INICIAL: Lanzador de sincronización automatizado */}
      {!resumenCambios && (
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ⚡
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Procesamiento Automatizado Multi-Proveedor</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              El sistema leerá la columna <span className="text-blue-400 font-semibold">Proveedor</span> de tu archivo mapeado y aplicará automáticamente las reglas de incremento, comisiones y logística que correspondan a cada artículo individualmente.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex justify-between items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              ← Modificar Mapeo
            </button>
            <button
              disabled={isProcessing}
              onClick={handleStartSincronizacion}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white disabled:text-slate-500 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xl shadow-blue-500/10 flex-1"
            >
              {isProcessing ? "Procesando Fórmulas..." : "Iniciar Sincronización Inteligente"}
            </button>
          </div>
        </div>
      )}

      {/* ESTADO PROCESADO: Panel de Auditoría de Cambios y Descarga */}
      {resumenCambios && (
        <div className="space-y-4">
          {/* Fichas de Resumen Métrico */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <article className="bg-[#1e293b] border border-slate-800 rounded-xl p-3">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Publicaciones Totales</p>
              <p className="text-2xl font-black text-white mt-1">{resumenCambios.totalFilasMeli}</p>
            </article>
            <article className="bg-[#1e293b] border border-slate-800 rounded-xl p-3 border-l-4 border-l-amber-500">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Precios Cambiados</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{resumenCambios.preciosActualizados}</p>
            </article>
            <article className="bg-[#1e293b] border border-slate-800 rounded-xl p-3 border-l-4 border-l-blue-500">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Stocks Actualizados</p>
              <p className="text-2xl font-black text-blue-400 mt-1">{resumenCambios.stockActualizados}</p>
            </article>
          </section>

          {/* Tabla de Auditoría de Cambios Extraída */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            
            <TablaAuditoria listaCambios={resumenCambios.listaCambios} />

            {/* Footer de Acciones del Panel */}
            <footer className="p-2 bg-[#161e2e] border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => setResumenCambios(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
              >
                Resetear Cambios
              </button>
              <section className="px-4 py-3 bg-[#161e2e] flex justify-between items-center">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                  {resumenCambios.listaCambios.length} actualizaciones
                </span>
              </section>
              <button
                onClick={handleDescargarArchivoFinal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xl shadow-emerald-600/10 flex items-center gap-2"
              >
                📥 Descargar Plantilla Oficial Actualizada
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Subcomponente interno para aislar el marcado HTML de la tabla
 * y evitar sobrecargar visualmente el componente principal.
 */
function TablaAuditoria({ listaCambios }: { listaCambios: ItemDiferencia[] }) {
  return (
    <div className="max-h-80 overflow-y-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-[#0b1120]/40 text-slate-400 sticky top-0 border-b border-slate-800">
          <tr>
            <th className="p-3 font-semibold text-[11px]">SKU / OEM</th>
            <th className="p-3 font-semibold text-[11px]">Título</th>
            <th className="p-3 font-semibold text-[11px] text-center">Historial Precio</th>
            <th className="p-3 font-semibold text-[11px] text-center">Historial Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {listaCambios.map((cambio, index) => (
            <tr key={index} className="hover:bg-slate-800/30 transition-colors">
              <td className="p-3 font-mono text-slate-300 text-[11px]">{cambio.sku}</td>
              <td className="p-3 text-slate-400 truncate max-w-xs">{cambio.descripcion}</td>
              <td className="p-3 text-center whitespace-nowrap">
                <span className="text-slate-500 line-through">${cambio.oldPrice}</span>
                <span className="text-slate-400 mx-1">→</span>
                <span className="font-bold text-amber-400">${cambio.newPrice}</span>
              </td>
              <td className="p-3 text-center whitespace-nowrap">
                <span className="text-slate-500">{cambio.oldStock} u</span>
                <span className="text-slate-400 mx-1">→</span>
                <span className="font-bold text-blue-400">{cambio.newStock} u</span>
              </td>
            </tr>
          ))}
          {listaCambios.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-slate-500 italic text-[11px]">
                Los precios calculados de todos los proveedores y los stocks ya coinciden idénticamente con la plantilla cargada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}