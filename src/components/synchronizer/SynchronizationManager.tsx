import React, { useState } from 'react';
import { Stepper } from './StepperSincronizador.tsx';
import { CargarArchivosStep } from './steps/CargarArchivosStep.tsx';
import { MapearColumnasStep } from './steps/MapearColumnasStep.tsx';
import { ProcesarDescargaStep } from './steps/ProcesarDescargaStep.tsx';
import { fuzzyMatch } from '../../utils/fuzzyMatch';
import type { DatosArchivoProveedor } from '../../env.d.ts';

export type PasosSincro = 'Cargar' | 'Mapear' | 'Sincronizar';


export interface TargetField {
  key: string;
  label: string;
  required: boolean;
  description: string;
}

// Estructura de campos que necesitamos extraer de la lista del proveedor
const CAMPOS_PROVEEDOR_REQUERIDOS: TargetField[] = [
  { key: 'code_oem', label: 'Código / OEM', required: true, description: 'Identificador de la pieza o repuesto' },
  { key: 'price', label: 'Precio Costo', required: true, description: 'Precio base de compra del proveedor' },
  { key: 'stock', label: 'Stock / Cantidad', required: true, description: 'Existencias físicas disponibles' },
  { key: 'supplier_name', label: 'Nombre Proveedor', required: true, description: 'Nombre del proveedor para buscar sus reglas en el Store' },
  { key: 'brand', label: 'Marca', required: false, description: 'Marca del fabricante del producto' },
  { key: 'description', label: 'Descripción', required: false, description: 'Nombre o detalle del artículo (opcional)' },

];

export default function SynchronizationManager() {
  const [step, setStep] = useState<PasosSincro>('Cargar');
  
  // Archivo 1: Lista consolidada de datos del proveedor
  const [providerFileData, setProviderFileData] = useState<DatosArchivoProveedor | null>(null);
  // Archivo 2: Plantilla binaria original de Mercado Libre (guardada intacta como el Workbook de SheetJS)
  const [mlWorkbook, setMlWorkbook] = useState<any | null>(null);

  // Mapeos de las columnas elegidas
  const [mappings, setMappings] = useState<Record<string, string | null>>({});

  /**
   * Callback ejecutado cuando se cargan exitosamente ambos archivos en el paso 1
   */
  const handleFilesLoaded = (providerData: DatosArchivoProveedor, workbookML: any) => {
    setProviderFileData(providerData);
    setMlWorkbook(workbookML);

    // Ejecutar coincidencia inteligente automática (Fuzzy Match) sobre los encabezados detectados
    const keys = CAMPOS_PROVEEDOR_REQUERIDOS.map(f => f.key);
    const sugerenciasMapeo = fuzzyMatch(providerData.headers, keys);
    
    setMappings(sugerenciasMapeo);
    setStep('Mapear');
  };

  return (
    <div className="w-full bg-[#161e2e] border border-slate-800 rounded-2xl shadow-2xl px-4 py-2 space-y-2">
      
      {/* Barra indicadora del paso actual */}
      <Stepper currentStep={step} />

      <main className="relative mt-4">
        {step === 'Cargar' && (
          <CargarArchivosStep 
            onSuccess={handleFilesLoaded} 
          />
        )}
        {step === 'Mapear' && providerFileData && (
          <MapearColumnasStep 
            fileName={providerFileData.fileName}
            headers={providerFileData.headers}
            mappings={mappings}
            setMappings={setMappings}
            onBack={() => setStep('Cargar')}
            onNext={() => setStep('Sincronizar')}
          />
        )}

        {step === 'Sincronizar' && providerFileData && mlWorkbook && (
          <ProcesarDescargaStep 
            providerRows={providerFileData.rows}
            providerHeaders={providerFileData.headers}
            mappings={mappings}
            mlWorkbook={mlWorkbook}
            mlFileName={mlWorkbook.fileName || 'Archivo Mercado Libre'}
            onBack={() => setStep('Mapear')}
          />
        )}
      </main>
    </div>
  );
}