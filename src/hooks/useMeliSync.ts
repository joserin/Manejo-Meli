import * as XLSX from 'xlsx';
import type { ItemDiferencia } from '../env.d.ts';
import { limpiarCodigo } from '../utils/excelUtils.ts';

// Utilidad local para asegurar que encontramos las columnas mutables correctas
const normalizarTexto = (texto: string): string => 
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function useMeliSync() {
  
  const sincronizarConPlantillaMeli = (mlWorkbook: any, proveedorMap: Map<string, any>) => {
    const sheetName = mlWorkbook.SheetNames[0];
    const worksheet = mlWorkbook.Sheets[sheetName];
    
    // 1. Obtener las filas como objetos nativos (mantiene el orden del Excel perfectamente)
    const meliRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });
    if (meliRows.length === 0) throw new Error("La plantilla de Mercado Libre está vacía.");

    // Detectamos las llaves reales de las columnas para saber exactamente qué propiedades sobreescribir
    const llavesMeli = Object.keys(meliRows[0] || {});
    const colSku = llavesMeli.find(k => normalizarTexto(k).includes('sku')) || llavesMeli[1];
    const colOem = llavesMeli.find(k => normalizarTexto(k).includes('codigo')) || llavesMeli[2];
    const colPrecio = llavesMeli.find(k => normalizarTexto(k).includes('precio')) || '';
    const colStock = llavesMeli.find(k => normalizarTexto(k).includes('stock')) || '';
    const colTitulo = llavesMeli.find(k => normalizarTexto(k).includes('titulo')) || '';

    // Convertimos los valores del proveedor a un array una sola vez para las búsquedas por código OEM alternativo
    const listaProductosProveedor = Array.from(proveedorMap.values());

    const listaCambios: ItemDiferencia[] = [];
    const filasActualizadasXlsx: Record<string, any>[] = [];

    // Variables para las Card
    let preciosActualizados = 0;
    let stockActualizados = 0;
    console.log("=== SKUS DISPONIBLES EN EL PROVEEDOR ===", Array.from(proveedorMap.keys()));

    // FASE 3: Comparación secuencial (Orden de plantilla preservado)
    meliRows.forEach((row) => {
      // Clonamos la fila original para no mutar el estado inicial destructivamente
      const filaClonada = { ...row };
      
      const skuMeli = limpiarCodigo(row[colSku]);
      //const oemMeli = limpiarCodigo(row[colOem]);

      if (!skuMeli) {
        filasActualizadasXlsx.push(filaClonada);
        return;
      }

      let prodProveedor = proveedorMap.get(skuMeli);

      // Si encontramos el producto en el proveedor, comparamos y actualizamos
      if (prodProveedor) {
        const oldPrice = Math.ceil(parseFloat(String(row[colPrecio]).replace(/[^0-9.]/g, '')) || 0);
        const oldStock = parseInt(String(row[colStock]).replace(/[^0-9]/g, ''), 10) || 0;

        const newPrice = prodProveedor.price;
        const newStock = prodProveedor.stock;

        // Validamos si de verdad hay cambios numéricos
        const cambioPrecio = oldPrice !== newPrice;
        const cambioStock = oldStock !== newStock;

        
        if (cambioPrecio || cambioStock) {
          // Incrementamos contadores independientes para las Cards
          if (cambioPrecio) preciosActualizados++;
          if (cambioStock) stockActualizados++;

          listaCambios.push({
            sku: row[colSku],
            oem: row[colOem] || '',
            descripcion: colTitulo ? String(row[colTitulo]).trim() : '',
            oldPrice,
            newPrice,
            oldStock,
            newStock: newStock,
            //supplier_name: prodProveedor.supplier_name
          } as ItemDiferencia);

          // Inyectamos los nuevos valores preservando las cabeceras originales exactas
          if (colPrecio && cambioPrecio) filaClonada[colPrecio] = newPrice;
          if (colStock && cambioStock) filaClonada[colStock] = newStock;
        }
      }

      // Añadimos la fila (modificada o intacta) manteniendo la estructura e índice original
      filasActualizadasXlsx.push(filaClonada);
    });

    // FASE 4: Retorno estructurado para la UI
    return {
      totalFilasMeli: meliRows.length,
      preciosActualizados,
      stockActualizados,
      filasActualizadasXlsx,
      listaCambios,
    };
  };

  return { sincronizarConPlantillaMeli };
}