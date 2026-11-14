import React, { useState } from 'react';
import {
  ColonyFacilities,
  BaseModule,
  PlanetScenario,
  PolicyMode,
} from '../domain/types';
import {
  Home,
  Sun,
  Sprout,
  HeartPulse,
  FlaskConical,
  Shield,
  AlertTriangle,
  CheckCircle,
  Zap,
  Wrench,
  Info,
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface ColonyVisualizerProps {
  facilities: ColonyFacilities;
  planet: PlanetScenario;
  policy: PolicyMode;
  onOpenSTEMConcept?: (conceptId: string) => void;
}

export const ColonyVisualizer: React.FC<ColonyVisualizerProps> = ({
  facilities,
  planet,
  policy,
  onOpenSTEMConcept,
}) => {
  const [selectedModuleKey, setSelectedModuleKey] = useState<keyof ColonyFacilities>('habitat');

  const selectedModule: BaseModule = facilities[selectedModuleKey];

  const getModuleStatusBadge = (status: BaseModule['status'], health: number) => {
    if (health <= 25 || status === 'critical') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40 animate-pulse">
          <AlertTriangle className="w-3 h-3" /> CRÍTICO ({health}%)
        </span>
      );
    }
    if (health <= 60 || status === 'damaged') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
          <Wrench className="w-3 h-3" /> DAÑADO ({health}%)
        </span>
      );
    }
    if (status === 'upgraded') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-violet-300 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-500/40">
          <Zap className="w-3 h-3" /> MEJORADO NVL {selectedModule.level}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
        <CheckCircle className="w-3 h-3" /> OPERATIVO ({health}%)
      </span>
    );
  };

  const getModuleBorderColor = (m: BaseModule, isSelected: boolean) => {
    if (isSelected) return 'border-cyan-400 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/40';
    if (m.health <= 25) return 'border-red-500 bg-red-950/20 animate-pulse';
    if (m.health <= 60) return 'border-amber-500/60 bg-amber-950/20';
    if (m.level > 1) return 'border-violet-500/60 bg-violet-950/20';
    return 'border-cyan-500/30 hover:border-cyan-400/60 bg-space-900/60';
  };

  const modulesList: { key: keyof ColonyFacilities; icon: React.ReactNode; label: string }[] = [
    { key: 'habitat', icon: <Home className="w-5 h-5" />, label: 'E-HAB Hábitat' },
    { key: 'solarArray', icon: <Sun className="w-5 h-5" />, label: 'Granja Solar' },
    { key: 'greenhouse', icon: <Sprout className="w-5 h-5" />, label: 'Invernadero' },
    { key: 'lifeSupport', icon: <HeartPulse className="w-5 h-5" />, label: 'ECLSS Sabatier' },
    { key: 'researchLab', icon: <FlaskConical className="w-5 h-5" />, label: 'Lab Geológico' },
    { key: 'radiationShield', icon: <Shield className="w-5 h-5" />, label: 'Domo Antirradiación' },
  ];

  return (
    <div className="hud-panel rounded-2xl p-4 relative overflow-hidden border-cyan-500/30 shadow-xl">
      {/* Background Planet Texture or Grid Ambient */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              planet.id === 'mars'
                ? 'radial-gradient(circle at 70% 30%, rgba(239, 68, 68, 0.25) 0%, transparent 60%)'
                : 'radial-gradient(circle at 70% 30%, rgba(148, 163, 184, 0.25) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Header bar of visualizer */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-cyan-500/20 relative z-10 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h2 className="text-sm font-heading font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <span>Telemetría de la Base: Outpost Alpha</span>
            <span className="text-[11px] font-mono font-normal text-slate-400">
              [{planet.name.split('—')[0].trim()} - 0.00°N 77.45°E]
            </span>
          </h2>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Estrategia Activa:</span>
          <span
            className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              policy === 'SURVIVAL'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                : policy === 'PRODUCTION'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'bg-violet-950 text-violet-300 border border-violet-500/40'
            }`}
          >
            {policy === 'SURVIVAL'
              ? 'Supervivencia'
              : policy === 'PRODUCTION'
              ? 'Producción'
              : 'Escudo Total'}
          </span>
        </div>
      </div>

      {/* Interactive Outpost Schematic Map */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3">
        {modulesList.map((item) => {
          const mod = facilities[item.key];
          const isSelected = selectedModuleKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                soundService.playClick();
                setSelectedModuleKey(item.key);
              }}
              className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-28 relative overflow-hidden backdrop-blur-sm ${getModuleBorderColor(
                mod,
                isSelected
              )}`}
            >
              {/* Module Level Pip */}
              <div className="flex items-center justify-between w-full">
                <div
                  className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-space-950/60 text-slate-300'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                  <span>Nvl.{mod.level}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-heading font-bold text-slate-200 truncate">{item.label}</div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>Salud</span>
                  <span
                    className={
                      mod.health <= 25
                        ? 'text-red-400 font-bold'
                        : mod.health <= 60
                        ? 'text-amber-400'
                        : 'text-emerald-400 font-bold'
                    }
                  >
                    {mod.health}%
                  </span>
                </div>
                <div className="w-full bg-space-950 h-1 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${
                      mod.health <= 25 ? 'bg-red-500' : mod.health <= 60 ? 'bg-amber-500' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${mod.health}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Module Deep Telemetry Inspector */}
      <div className="relative z-10 p-3.5 rounded-xl bg-space-950/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-heading font-black text-cyan-300">{selectedModule.name}</span>
            {getModuleStatusBadge(selectedModule.status, selectedModule.health)}
            <span className="text-xs font-mono text-slate-400">
              Demanda: <strong className="text-cyan-400">{selectedModule.energyDemand} kW</strong>
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{selectedModule.description}</p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onOpenSTEMConcept && onOpenSTEMConcept('aerospace_redundancy_principles')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Principio de Redundancia STEM</span>
          </button>
        </div>
      </div>
    </div>
  );
};

