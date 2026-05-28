/**
 * Limpia y normaliza códigos de repuestos, SKUs u OEMs para asegurar
 * que el cruce de datos indexado sea exacto y libre de errores por formato.
 * * Acciones que realiza:
 * 1. Convierte a string y elimina espacios al inicio y final.
 * 2. Transforma todo a MAYÚSCULAS.
 * 3. Remueve guiones, slashes, espacios internos y caracteres especiales comunes.
 * * @param codigo Valor crudo proveniente de la celda de Excel
 * @returns Cadena normalizada ideal para usar como llave (Key) en un Map o búsqueda
 */
export function limpiarCodigo(codigo: any): string {
  if (codigo === null || codigo === undefined) return '';
  
  return String(codigo)
    .trim()
    .toUpperCase()
    // Remueve espacios, guiones, slashes y puntos que suelen variar entre catálogos
    //.replace(/[\s\-_./\\]/g, '');
}

/**
 * Convierte de forma segura cualquier celda de precio a un número flotante válido.
 * Maneja formatos con símbolos de moneda ($), comas de miles o textos accidentales.
 * * @param valor Valor crudo de la celda (ej: "$ 1.500,50" o 1500.5)
 * @returns Número flotante. Si no es válido, retorna 0.
 */
export function parsearPrecio(valor: any): number {
  if (valor === null || valor === undefined) return 0;
  if (typeof valor === 'number') return valor;

  const texto = String(valor).trim();
  if (!texto) return 0;

  // Si el string contiene comas y puntos, intentamos normalizar el formato hispano (1.200,50 -> 1200.50)
  // o simplemente remover caracteres que no sean números o el punto decimal.
  let limpio = texto.replace(/[^0-9.,]/g, '');

  // Detectar si se usa la coma como decimal (ej: 1250,50)
  if (limpio.includes(',') && !limpio.includes('.')) {
    limpio = limpio.replace(',', '.');
  } else if (limpio.includes('.') && limpio.includes(',')) {
    // Si tiene ambos, asumimos formato estándar de miles con punto y decimal con coma: 1.250,30
    limpio = limpio.replace(/\./g, '').replace(',', '.');
  }

  const resultado = parseFloat(limpio);
  return isNaN(resultado) ? 0 : resultado;
}

/**
 * Quita acentos/tildes y convierte el texto a minúsculas para comparaciones seguras.
 * Ejemplo: "Título" -> "titulo"
 */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD") // Descompone los caracteres con acento (ej: 'ú' se vuelve 'u' + '´')
    .replace(/[\u0300-\u036f]/g, ""); // Remueve el componente del acento
};

/**
 * Convierte de forma segura cualquier celda de stock a un número entero.
 * * @param valor Valor crudo de la celda (ej: "12 u" o 12.0)
 * @returns Número entero. Si no es válido, retorna 0.
 */
export function parsearStock(valor: any): number {
  if (valor === null || valor === undefined) return 0;
  if (typeof valor === 'number') return Math.floor(valor);

  const texto = String(valor).trim();
  if (!texto) return 0;

  const limpio = texto.replace(/[^0-9]/g, '');
  const resultado = parseInt(limpio, 10);
  
  return isNaN(resultado) ? 0 : resultado;
}

/**
 * Formatea un número como moneda local de forma consistente para la UI de auditoría.
 * * @param valor Número a formatear
 * @returns String formateado (ej: "$ 1.250,00")
 */
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-AR', { // Puedes cambiar 'es-AR' o 'es-MX' según tu región
    style: 'currency',
    currency: 'ARS', // O 'MXN', 'USD', etc.
    minimumFractionDigits: 2
  }).format(valor);
}