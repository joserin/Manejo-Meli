// src/components/sincronizador/hooks/useProviderData.ts
import { usePriceStore } from '../store/usePriceStore';
import { prepararProductosProveedor } from '../utils/syncEngine';

export function useProviderProcessor() {
  const { suppliers, global_ml_commission, tax_percent } = usePriceStore();

  const procesarProveedor = (providerRows: any[], mappings: Record<string, string | null>) => {
    // Reutiliza directamente tu función existente de syncEngine.ts sin duplicar código
    return prepararProductosProveedor(
      providerRows,
      mappings,
      suppliers,
      global_ml_commission,
      tax_percent
    );
  };

  return { procesarProveedor };
}