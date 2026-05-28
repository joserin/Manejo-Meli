// src/components/sincronizador/hooks/useSyncProcessor.ts
import { useState } from 'react';
import { useProviderProcessor } from './useProviderProcessor';
import { useMeliSync } from './useMeliSync';

export function useSyncProcessor(providerRows: any[], mappings: Record<string, string | null>, mlWorkbook: any) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Invocamos los sub-hooks especializados
  const { procesarProveedor } = useProviderProcessor();
  const { sincronizarConPlantillaMeli } = useMeliSync();

  const ejecutarSincronizacion = () => {
    setIsProcessing(true);
    
    try {
      // 1. Fase Proveedor: indexa y calcula precios consumiendo syncEngine.ts
      const proveedorMap = procesarProveedor(providerRows, mappings);

      // 2. Fase Mercado Libre: extrae datos de la plantilla ML, comparacion y ajuste
      const resultadoMeli = sincronizarConPlantillaMeli(mlWorkbook, proveedorMap);

      const resultados = {
        totalFilasMeli: resultadoMeli.totalFilasMeli,
        preciosActualizados: resultadoMeli.preciosActualizados,
        stockActualizados: resultadoMeli.stockActualizados,
        listaCambios: resultadoMeli.listaCambios,
        workbookFinal: resultadoMeli.filasActualizadasXlsx, 
      };

      setIsProcessing(false);
      return resultados;
    } catch (error) {
      setIsProcessing(false);
      throw error;
    }
  };

  return { ejecutarSincronizacion, isProcessing };
}