import { limpiarCodigo, normalizarTexto } from './excelUtils.ts';
import { calcularPrecioFinal } from './priceUtils.ts';

export interface ProductoProcesado {
  code_oem: string;
  brand: string;
  price: number;
  stock: number;
  supplier_name: string;
}

export interface ProductoMLProcesado {
  sku: string;
  code_oem: string;
  price: number;
  stock: number;
  title: string;
  rawRow: Record<string, any>; // Guardamos la fila original por si luego necesitas exportarla con XLSX
}

/**
 * FASE 1: Toma las filas crudas del archivo del proveedor, limpia sus columnas,
 * aplica las reglas de negocio de Zustand y retorna un mapa optimizado ya calculado.
 */
export function prepararProductosProveedor(
  providerRows: any[],
  mappings: Record<string, string | null>,
  suppliers: any[],
  global_ml_commission: number,
  tax_percent: number
): Map<string, ProductoProcesado> {
  const proveedorMap = new Map<string, ProductoProcesado>();

  const colCodigoProv = mappings['code_oem']!;
  const colPrecioProv = mappings['price']!;
  const colStockProv = mappings['stock']!;
  const colMarcaProv = mappings['brand'];
  const colNombreProv = mappings['supplier_name']!;

  providerRows.forEach((row) => {
    const code = limpiarCodigo(row[colCodigoProv]);
    
    if (!code) return; // Si no hay código de pieza básico, saltar fila
    
    const brand = colMarcaProv ? limpiarCodigo(row[colMarcaProv]) : '';
    const supplier = String(row[colNombreProv] || '').trim();

    // 1. Extraer y formatear valores numéricos crudos del proveedor
    const price = parseFloat(String(row[colPrecioProv]).replace(/[^0-9.]/g, '')) || 0;
    const stock = parseInt(String(row[colStockProv]).replace(/[^0-9]/g, ''), 10) || 0;

    //console.log('Procesando fila -->:', { code, brand, price, stock, supplier });

    // 2. Buscar reglas específicas del proveedor en la tienda
    const infoProveedor = suppliers.find(
      (s) => s.name.toLowerCase().trim() === supplier.toLowerCase()
    );

    // 3. Pre-calcular el precio final que debería tener en Mercado Libre
    const calculo = calcularPrecioFinal(
      price,
      infoProveedor?.rules || [],
      global_ml_commission,
      tax_percent,
      infoProveedor?.customMarkup || 0,
      infoProveedor?.deliveryFee || 0
    );

    const producto: ProductoProcesado = {
      code_oem: code,
      brand: brand,
      price: Math.ceil(calculo.finalPrice),
      stock: stock,
      supplier_name: supplier || 'Sin Reglas',
    };

    // Indexación por código OEM como identificador único principal
    const llaveLimpia = code.trim().toUpperCase();

    proveedorMap.set(llaveLimpia, producto);
  });

  return proveedorMap;
}
