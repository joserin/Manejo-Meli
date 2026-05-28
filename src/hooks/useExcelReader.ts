import { useState } from 'react';
import type { DatosArchivoProveedor } from '../env.d.ts';

export function useExcelReader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readFiles = async (providerFile: File, mlFile: File): Promise<[DatosArchivoProveedor, any]> => {
    setIsProcessing(true);
    setError(null);

    try {
      const XLSX = await import('xlsx');

      // 1. Procesar Proveedor
      const datosProveedorPromise = new Promise<DatosArchivoProveedor>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            if (jsonData.length === 0) return reject(new Error("La lista del proveedor está vacía."));

            const headers = (jsonData[0] as string[]).map(h => String(h || '').trim());
            const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });

            resolve({ fileName: providerFile.name, headers, rows });
          } catch {
            reject(new Error("Error leyendo el formato de la lista del proveedor."));
          }
        };
        reader.readAsArrayBuffer(providerFile);
      });

      // 2. Procesar Mercado Libre
      const datosMlPromise = new Promise<any>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array', cellStyles: true, bookVBA: true });
            if (!workbook.Sheets["Publicaciones"]) {
              return reject(new Error("La plantilla no contiene la hoja 'Publicaciones'."));
            }
            resolve(workbook);
          } catch {
            reject(new Error("Error cargando la estructura binaria de Mercado Libre."));
          }
        };
        reader.readAsArrayBuffer(mlFile);
      });

      return await Promise.all([datosProveedorPromise, datosMlPromise]);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al procesar.");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return { readFiles, isProcessing, error, setError };
}