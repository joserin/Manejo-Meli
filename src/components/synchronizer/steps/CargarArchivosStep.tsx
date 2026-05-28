import React, { useState, useRef } from 'react';
import type { DatosArchivoProveedor } from '../../../env.d.ts';
import { useExcelReader } from '../../../hooks/useExcelReader';

interface CargarArchivosStepProps {
  onSuccess: (providerData: DatosArchivoProveedor, mlWorkbook: any) => void;
}

export function CargarArchivosStep({ onSuccess }: CargarArchivosStepProps) {
  // Estados locales exclusivos de la UI (Selección de archivos en memoria)
  const [providerFile, setProviderFile] = useState<File | null>(null);
  const [mlFile, setMlFile] = useState<File | null>(null);

  // Estados visuales de arrastre (Drag & Drop)
  const [dragActiveProv, setDragActiveProv] = useState(false);
  const [dragActiveMl, setDragActiveMl] = useState(false);

  const fileInputProvRef = useRef<HTMLInputElement>(null);
  const fileInputMlRef = useRef<HTMLInputElement>(null);

  // Consumimos el hook extractor de lógica de negocio y parsing binario
  const { readFiles, isProcessing, error, setError } = useExcelReader();

  // Manejadores de arrastre para Proveedor
  const handleDragProv = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActiveProv(true);
    else if (e.type === "dragleave") setDragActiveProv(false);
  };

  const handleDropProv = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveProv(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setProviderFile(e.dataTransfer.files[0]);
    }
  };

  // Manejadores de arrastre para Mercado Libre
  const handleDragMl = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActiveMl(true);
    else if (e.type === "dragleave") setDragActiveMl(false);
  };

  const handleDropMl = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveMl(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setMlFile(e.dataTransfer.files[0]);
    }
  };

  // Orquestador del evento de procesamiento utilizando el Hook abstracto
  const handleProcesarArchivos = async () => {
    if (!providerFile || !mlFile) {
      setError("Debes cargar ambos archivos para poder continuar.");
      return;
    }

    try {
      const [providerData, mlWorkbook] = await readFiles(providerFile, mlFile);    
      // Si todo sale bien, enviamos los datos arriba para cambiar de paso
      onSuccess(providerData, mlWorkbook);
    } catch (err) {
      // El error ya es manejado e inyectado internamente por el hook
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ZONA CAJA 1: EXCEL PROVEEDOR */}
        <div
          onDragEnter={handleDragProv}
          onDragOver={handleDragProv}
          onDragLeave={handleDragProv}
          onDrop={handleDropProv}
          onClick={() => fileInputProvRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-52 ${
            dragActiveProv 
              ? "border-blue-500 bg-blue-600/5 shadow-inner" 
              : providerFile 
                ? "border-emerald-500/50 bg-emerald-600/5" 
                : "border-slate-800 bg-[#0b1120]/40 hover:border-slate-700"
          }`}
        >
          <input
            ref={fileInputProvRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setProviderFile(e.target.files[0])}
          />
          <span className={`text-3xl mb-3 ${providerFile ? "text-emerald-400" : "text-slate-500"}`}>
            {providerFile ? "📊" : "📥"}
          </span>
          <h4 className="text-sm font-bold text-slate-200">Lista del Proveedor</h4>
          <p className="text-[11px] text-slate-500 mt-1 max-w-60">
            {providerFile ? providerFile.name : "Arrastra o selecciona el archivo con los costos y stock origen"}
          </p>
          {providerFile && (
            <span className="text-[10px] mt-3 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md font-medium">Listo en memoria</span>
          )}
        </div>

        {/* ZONA CAJA 2: PLANTILLA MERCADO LIBRE */}
        <div
          onDragEnter={handleDragMl}
          onDragOver={handleDragMl}
          onDragLeave={handleDragMl}
          onDrop={handleDropMl}
          onClick={() => fileInputMlRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-52 ${
            dragActiveMl 
              ? "border-blue-500 bg-blue-600/5 shadow-inner" 
              : mlFile 
                ? "border-emerald-500/50 bg-emerald-600/5" 
                : "border-slate-800 bg-[#0b1120]/40 hover:border-slate-700"
          }`}
        >
          <input
            ref={fileInputMlRef}
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setMlFile(e.target.files[0])}
          />
          <span className={`text-3xl mb-3 ${mlFile ? "text-emerald-400" : "text-slate-500"}`}>
            {mlFile ? "📦" : "📥"}
          </span>
          <h4 className="text-sm font-bold text-slate-200">Plantilla Mercado Libre</h4>
          <p className="text-[11px] text-slate-500 mt-1 max-w-60">
            {mlFile ? mlFile.name : "Arrastra o selecciona la plantilla oficial descargada directamente desde ML"}
          </p>
          {mlFile && (
            <span className="text-[10px] mt-3 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md font-medium">Hoja 'Publicaciones' vinculada</span>
          )}
        </div>

      </div>

      {/* BOTÓN DE PROCESAMIENTO */}
      <div className="flex justify-end pt-4 border-t border-slate-800/60">
        <button
          disabled={!providerFile || !mlFile || isProcessing}
          onClick={handleProcesarArchivos}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xl flex items-center gap-2 ${
            providerFile && mlFile && !isProcessing
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Analizando Estructuras...</span>
            </>
          ) : (
            <>
              <span>Procesar Archivos</span>
              <span className="opacity-70">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}