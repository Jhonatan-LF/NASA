import React, { useState } from 'react';
import {
  Zap,
  HeartPulse,
  Shield,
  Coins,
  Wind,
  Droplets,
  Apple,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { MainResources, SubResources } from '../domain/types';
import { soundService } from '../services/soundService';

interface ResourceGaugesProps {
  main: MainResources;
  sub: SubResources;
  onOpenSTEMConcept?: (conceptId: string) => void;
}

export const ResourceGauges: React.FC<ResourceGaugesProps> = ({
  main,
  sub,
  onOpenSTEMConcept,
}) => {
  const [expandedSubmeters, setExpandedSubmeters] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const toggleSubmeters = () => {
    soundService.playClick();
    setExpandedSubmeters(!expandedSubmeters);
  };

  const getHealthColorClass = (val: number) => {
    if (val > 60) return 'text-emerald-400';
    if (val > 25) return 'text-amber-400';
    return 'text-red-400 animate-pulse';
  };

  const getProgressColor = (val: number, type: 'energy' | 'vital' | 'shield') => {
    if (val <= 20) return 'bg-red-500 shadow-red-500/50';
    if (val <= 50) return 'bg-amber-500 shadow-amber-500/50';
    if (type === 'energy') return 'bg-cyan-400 shadow-cyan-400/50';
    if (type === 'vital') return 'bg-emerald-400 shadow-emerald-400/50';
    return 'bg-violet-400 shadow-violet-400/50';
  };

  return (
    <div className="w-full space-y-3">
      {/* 4 Primary Strategic Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. ENERGÍA (Cyan) */}
        <div className="hud-panel rounded-xl p-3.5 relative overflow-hidden group border-cyan-500/30 hover:border-cyan-400/60 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-sm shadow-cyan-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-200">
                  Energía Eléctrica
                </span>
                <div className="text-[10px] font-mono text-cyan-400/90">
                  Red: {main.powerGenerationKw} kW / Demanda: {main.powerConsumptionKw} kW
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenSTEMConcept && onOpenSTEMConcept('solar_efficiency_degradation')}
              title="Aprender principio STEM de energía"
              className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800/60 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Value and Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-2xl font-black font-heading text-cyan-300 tracking-tight">
                {main.energyPercent}%
              </span>
              <span className="text-xs text-slate-400">
                {sub.batteryStorageCurrent} / {sub.batteryStorageMax} kWh
              </span>
            </div>

            <div className="w-full bg-space-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 shadow-sm ${getProgressColor(
                  main.energyPercent,
                  'energy'
                )}`}
                style={{ width: `${Math.min(100, Math.max(0, main.energyPercent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
              <span>Eficiencia Solar: {Math.round(sub.solarEfficiency * 100)}%</span>
              <span className={sub.generatorBackupActive ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>
                {sub.generatorBackupActive ? '● RTG Activo (+35kW)' : '○ RTG Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. SOPORTE VITAL (Verde) */}
        <div className="hud-panel rounded-xl p-3.5 relative overflow-hidden group border-emerald-500/30 hover:border-emerald-400/60 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/20">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-200">
                  Soporte Vital (ECLSS)
                </span>
                <div className="text-[10px] font-mono text-emerald-400/90">
                  O2: {sub.oxygenCurrent}kg | H2O: {sub.waterCurrent}L
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenSTEMConcept && onOpenSTEMConcept('eclss_water_recovery')}
              title="Aprender principio STEM de soporte vital"
              className="text-slate-400 hover:text-emerald-300 p-1 rounded hover:bg-slate-800/60 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between font-mono">
              <span className={`text-2xl font-black font-heading tracking-tight ${getHealthColorClass(main.lifeSupportPercent)}`}>
                {main.lifeSupportPercent}%
              </span>
              <span className="text-xs text-slate-400">
                Reciclaje: {Math.round(sub.waterRecyclingEfficiency * 100)}%
              </span>
            </div>

            <div className="w-full bg-space-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 shadow-sm ${getProgressColor(
                  main.lifeSupportPercent,
                  'vital'
                )}`}
                style={{ width: `${Math.min(100, Math.max(0, main.lifeSupportPercent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
              <span>Biomasa: {sub.foodCurrent} kg</span>
              <button
                onClick={toggleSubmeters}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-0.5"
              >
                <span>{expandedSubmeters ? 'Ocultar' : 'Detalles'}</span>
                {expandedSubmeters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. PROTECCIÓN CONTRA RADIACIÓN (Violeta / Ámbar) */}
        <div className="hud-panel rounded-xl p-3.5 relative overflow-hidden group border-violet-500/30 hover:border-violet-400/60 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-violet-950/70 border border-violet-500/40 text-violet-400 shadow-sm shadow-violet-500/20">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-200">
                  Blindaje Radiación
                </span>
                <div className="text-[10px] font-mono text-violet-400/90">
                  Dosis: {sub.radiationExposureAccumulated} mSv
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenSTEMConcept && onOpenSTEMConcept('space_radiation_hazards')}
              title="Aprender principio STEM sobre radiación cósmica"
              className="text-slate-400 hover:text-violet-300 p-1 rounded hover:bg-slate-800/60 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between font-mono">
              <span className={`text-2xl font-black font-heading tracking-tight ${getHealthColorClass(main.radiationProtectionPercent)}`}>
                {main.radiationProtectionPercent}%
              </span>
              <span className="text-xs text-slate-400">
                Flujo: {sub.currentCycleRadiationFlux} mSv/sol
              </span>
            </div>

            <div className="w-full bg-space-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 shadow-sm ${getProgressColor(
                  main.radiationProtectionPercent,
                  'shield'
                )}`}
                style={{ width: `${Math.min(100, Math.max(0, main.radiationProtectionPercent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
              <span>Bóveda de Regolito: Activa</span>
              <span className={sub.radiationExposureAccumulated > 20 ? 'text-amber-400' : 'text-emerald-400'}>
                {sub.radiationExposureAccumulated > 20 ? 'Riesgo Moderado' : 'Riesgo Controlado'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. CRÉDITOS DE MISIÓN (Dorado / Azul) */}
        <div className="hud-panel rounded-xl p-3.5 relative overflow-hidden group border-amber-500/30 hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/20">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-200">
                  Presupuesto Misión
                </span>
                <div className="text-[10px] font-mono text-amber-400/90">
                  Fondos para repuestos y mejoras
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono uppercase bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
              Presupuesto
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-2xl font-black font-heading text-amber-300 tracking-tight">
                ${main.credits.toLocaleString()}{' '}
                <span className="text-xs font-normal text-amber-500">k$</span>
              </span>
              <span className="text-[11px] text-slate-400">Créditos de Misión</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              Los créditos financian operaciones técnicas y adquisiciones. No son recursos físicos consumibles.
            </p>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
              <span>Inversión en mejoras: Activa</span>
              <span className="text-amber-400">Solvencia Nominal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Sub-Gauges for Life Support (Oxygen, Water, Food) and Batteries */}
      {expandedSubmeters && (
        <div className="hud-panel p-3.5 rounded-xl border-cyan-500/20 bg-space-950/80 animate-in fade-in slide-in-from-top-2">
          <div className="text-xs font-heading uppercase text-cyan-400 tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Subindicadores Desglosados de Soporte Vital y Almacenamiento
            </span>
            <span className="text-[10px] font-mono text-slate-400">Fórmulas Biomecánicas NASA</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Oxígeno */}
            <div className="p-2.5 rounded-lg bg-space-900/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1 font-semibold">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" /> Oxígeno (O2)
                </span>
                <span className="text-cyan-300 font-bold">{sub.oxygenCurrent} / {sub.oxygenMax} kg</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden my-1.5">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all"
                  style={{ width: `${(sub.oxygenCurrent / sub.oxygenMax) * 100}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                <span>Consumo: 3.36 kg/sol (4 crew)</span>
                <span className="text-cyan-400">Sabatier + Plantas</span>
              </div>
            </div>

            {/* Agua */}
            <div className="p-2.5 rounded-lg bg-space-900/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1 font-semibold">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Agua Potable (H2O)
                </span>
                <span className="text-blue-300 font-bold">{sub.waterCurrent} / {sub.waterMax} L</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden my-1.5">
                <div
                  className="bg-blue-400 h-full rounded-full transition-all"
                  style={{ width: `${(sub.waterCurrent / sub.waterMax) * 100}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                <span>Reciclaje: {Math.round(sub.waterRecyclingEfficiency * 100)}%</span>
                <span className="text-blue-400">Bucle Cerrado</span>
              </div>
            </div>

            {/* Alimentos */}
            <div className="p-2.5 rounded-lg bg-space-900/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1 font-semibold">
                  <Apple className="w-3.5 h-3.5 text-emerald-400" /> Raciones / Biomasa
                </span>
                <span className="text-emerald-300 font-bold">{sub.foodCurrent} / {sub.foodMax} kg</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden my-1.5">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all"
                  style={{ width: `${(sub.foodCurrent / sub.foodMax) * 100}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                <span>Consumo: 2.48 kg/sol</span>
                <span className="text-emerald-400">Invernadero Activo</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

