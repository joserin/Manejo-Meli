import React from 'react';
import { clsx } from 'clsx';

type PasosSincro = 'Cargar' | 'Mapear' | 'Sincronizar';

interface StepperProps {
  currentStep: PasosSincro;
}

const PASOS_CONFIG = [
  { id: 'Cargar', label: 'Archivos', desc: 'Subir Excel Proveedor & ML' },
  { id: 'Mapear', label: 'Columnas', desc: 'Asociar propiedades' },
  { id: 'Sincronizar', label: 'Sincronizar', desc: 'Calcular y Descargar' },
];

export function Stepper({ currentStep }: StepperProps) {
  const currentIndex = PASOS_CONFIG.findIndex(s => s.id === currentStep);

  return (
    <nav aria-label="Progreso de Sincronización" className="border-b border-slate-800/60 pb-2">
      <ol className="flex items-center justify-between w-full max-w-4xl mx-auto gap-2">
        {PASOS_CONFIG.map((step, index) => {
          const isDone = index < currentIndex;
          const isActive = step.id === currentStep;

          return (
            <li key={step.id} className="flex-1 list-none">
              <div className="flex items-center w-full">
                {/* Círculo del número/estado */}
                <div className="relative flex flex-col items-start">
                  <div
                    className={clsx(
                      "size-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-300 border",
                      isActive && "border-blue-500 bg-blue-600/10 text-blue-400 shadow-md shadow-blue-500/5",
                      isDone && "border-emerald-500 bg-emerald-600 text-white",
                      !isActive && !isDone && "border-slate-800 bg-[#0b1120] text-slate-500"
                    )}
                  >
                    {isDone ? '✓' : index + 1}
                  </div>
                  
                  {/* Textos descriptivos flotantes */}
                  <div className="absolute left-10 top-0 whitespace-nowrap hidden md:block">
                    <p className={clsx("text-xs font-bold tracking-tight", isActive ? "text-blue-400" : isDone ? "text-slate-300" : "text-slate-500")}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-600 font-medium">{step.desc}</p>
                  </div>
                </div>

                {/* Línea conectora */}
                {index !== PASOS_CONFIG.length - 1 && (
                  <div className="flex-1 mx-4 h-0.5 bg-slate-800 relative rounded-full overflow-hidden min-w-7.5">
                    <div
                      className="absolute inset-0 bg-linear-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-in-out"
                      style={{ width: isDone ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}