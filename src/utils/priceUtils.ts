// src/utils/priceUtils.ts (o el nombre de tu archivo de utilidades)

import type { PricingRule } from "../env.d.ts";

/**
 * Calcula el precio final de un producto aplicando las reglas de negocio de la aplicación.
 * Utiliza los tipos globales de env.d.ts automáticamente.
 */
export function calcularPrecioFinal(
  costoProveedor: number,
  rules: PricingRule[], // Usamos tu interfaz global
  globalMlCommission: number,
  taxPercent: number,
  customMarkup: number = 0,
  deliveryFee: number = 0
) {
  // 1. Encontrar la regla aplicable evaluando los rangos opcionales (abiertos)
  const reglaAplicable = rules.find((r) => {
    // Si sup_cost no existe, asumimos que el rango empieza en 0
    const min = r.sup_cost !== undefined ? r.sup_cost : 0;
    // Si sell_cost no existe, asumimos que el rango va hasta el infinito
    const max = r.sell_cost !== undefined ? r.sell_cost : Infinity;

    return costoProveedor >= min && costoProveedor <= max;
  });

  // 2. Calcular el margen del RANGO
  const porcentajeRango = reglaAplicable !== undefined 
    ? reglaAplicable.percentage_markup 
    : 0;
    
  const markupFijoRango = reglaAplicable !== undefined 
    ? (reglaAplicable.fixed_markup || 0) 
    : 0;

  const valorMargenRango = (costoProveedor * (porcentajeRango / 100)) + markupFijoRango;

  // 3. SE SUMAN: Costo Base + Margen Rango + Gasto Delivery

  const precioBaseConLogistica = costoProveedor + valorMargenRango + deliveryFee;

  // 4. APLICAR EL MARGEN SUGERIDO DEL PROVEEDOR (%)
  const gananciaProveedorValue = precioBaseConLogistica * (customMarkup / 100);
  const precioConGananciaOndividual = precioBaseConLogistica + gananciaProveedorValue;

  // 5. Aplicar Impuestos (ej: IVA) sobre el costo con ganancia
  const taxValue = precioConGananciaOndividual * (taxPercent / 100);
  const precioConImpuestos = precioConGananciaOndividual + taxValue;
  
  // 6. Aplicar la Comisión de Mercado Libre
  const commissionValue = precioConImpuestos * (globalMlCommission / 100);
  const precioConComision = precioConImpuestos + commissionValue;

  // 7. Redondeo estratégico hacia arriba
  const finalPrice = Math.ceil(precioConComision);

  // 8. Calcular la ganancia neta real que te queda en el bolsillo
  const netProfit = finalPrice - costoProveedor - taxValue - commissionValue - deliveryFee;

  return {
    baseCost: costoProveedor,
    appliedMarkupPercent: porcentajeRango,
    appliedFixedMarkup: markupFijoRango,
    finalPrice: finalPrice || 0,
    markupValue:valorMargenRango,
    supplierMarkupValue: gananciaProveedorValue,
    taxValue,
    commissionValue,
    logisticValue: deliveryFee,
    netProfit: netProfit || 0,
    appliedRule: reglaAplicable
  };
}