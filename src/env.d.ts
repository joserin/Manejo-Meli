export interface PricingRule {
    id: string;
    sup_cost?: number;  // Opcional para soportar rangos abiertos
    sell_cost?: number; // Opcional para soportar el último rango (hasta el infinito)
    fixed_markup: number;
    percentage_markup: number;
    ml_commission_percent: number;
  }

export interface Supplier {
    id: string;
    name: string;
    deliveryFee: number;
    customMarkup: number;
    rules: PricingRule[];
}

export interface DatosArchivoProveedor {
  fileName: string;
  headers: string[];
  rows: any[];
}

export interface ItemDiferencia {
  sku: string;
  oem: string;
  descripcion: string;
  oldPrice: number;
  newPrice: number;
  oldStock: number;
  newStock: number;
}

// Esto es necesario para que TypeScript trate este archivo como un módulo global
export {};