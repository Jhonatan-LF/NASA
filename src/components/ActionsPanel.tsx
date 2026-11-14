import React, { useState } from 'react';
import { GameState, MissionAction } from '../domain/types';
import { MISSION_ACTIONS } from '../engine/actions';
import {
  Wrench,
  Zap,
  Coins,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface ActionsPanelProps {
  state: GameState;
  onExecuteAction: (action: MissionAction) => void;
  onOpenSTEMConcept?: (conceptId: string) => void;
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
  state,
  onExecuteAction,
  onOpenSTEMConcept,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'maintenance' | 'upgrade' | 'emergency'>('all');
  const [expandedSTEMId, setExpandedSTEMId] = useState<string | null>(null);

  const filteredActions = MISSION_ACTIONS.filter((action) => {
    if (selectedFilter === 'all') return true;
    return action.category === selectedFilter;
  });

  const toggleSTEMExpand = (actionId: string) => {
    soundService.playClick();
    setExpandedSTEMId(expandedSTEMId === actionId ? null : actionId);
  };

  return (
    <div className="hud-panel rounded-2xl p-4 border-cyan-500/20">
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-cyan-500/10 gap-2">
        <div className="flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-heading font-black uppercase tracking-wider text-slate-100">
            Centro de Ingeniería y Decisiones Estratégicas
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          {(['all', 'maintenance', 'upgrade', 'emergency'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundService.playClick();
                setSelectedFilter(cat);
              }}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                selectedFilter === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-space-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat === 'all'
                ? 'Todos'
                : cat === 'maintenance'
                ? 'Mantenimiento'
                : cat === 'upgrade'
                ? 'Mejoras'
                : 'Emergencia'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredActions.map((action) => {
          const hasCredits = state.mainResources.credits >= action.costCredits;
          const hasBattery =
            action.energyCostKw === 0 || state.subResources.batteryStorageCurrent >= action.energyCostKw;
          const canExecute = hasCredits && hasBattery;

          let disabledReason = '';
          if (!hasCredits) disabledReason = `Fondos insuficientes (requiere $${action.costCredits}k)`;
          else if (!hasBattery) disabledReason = `Batería insuficiente (requiere ${action.energyCostKw} kWh)`;

          const isExpanded = expandedSTEMId === action.id;

          return (
            <div
              key={action.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                canExecute
                  ? 'bg-space-900/70 border-slate-700 hover:border-cyan-500/50 hover:bg-space-900'
                  : 'bg-space-950/40 border-slate-800/80 opacity-75'
              }`}
            >
              <div>
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-xs font-heading font-bold text-slate-200 leading-snug">
                    {action.name}
                  </h3>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                      action.category === 'upgrade'
                        ? 'bg-violet-950/80 text-violet-300 border-violet-500/30'
                        : action.category === 'emergency'
                        ? 'bg-red-950/80 text-red-300 border-red-500/30'
                        : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {action.category}
                  </span>
                </div>

                {/* Costs & Metrics */}
                <div className="flex items-center space-x-3 text-xs font-mono mb-2">
                  <span
                    className={`flex items-center gap-1 font-semibold ${
                      hasCredits ? 'text-amber-400' : 'text-red-400 line-through'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" /> ${action.costCredits}k
                  </span>
                  {action.energyCostKw > 0 && (
                    <span
                      className={`flex items-center gap-1 ${
                        hasBattery ? 'text-cyan-400' : 'text-red-400 line-through'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" /> -{action.energyCostKw} kWh
                    </span>
                  )}
                  <span className="text-slate-400 text-[10px]">Ejecución: Inmediata</span>
                </div>

                {/* Expected Benefit */}
                <div className="text-[11px] font-sans text-emerald-300 flex items-start gap-1.5 mb-1 bg-emerald-950/30 p-1.5 rounded border border-emerald-500/20">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{action.expectedBenefit}</span>
                </div>

                {/* Risks / Tradeoffs */}
                <div className="text-[10px] text-slate-400 flex items-start gap-1.5 mb-2 px-1">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5 text-amber-500/70" />
                  <span>{action.risksAndConsequences}</span>
                </div>

                {/* Collapsible STEM Fact */}
                {isExpanded && (
                  <div className="p-2 mb-2 rounded bg-violet-950/40 border border-violet-500/30 text-[10px] font-mono text-violet-200 animate-in fade-in">
                    <strong className="text-violet-300 block mb-0.5 font-bold">Principio de Ingeniería STEM:</strong>
                    {action.stemExplanation}
                  </div>
                )}
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
                <button
                  onClick={() => toggleSTEMExpand(action.id)}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{isExpanded ? 'Ocultar STEM' : '¿Por qué funciona?'}</span>
                </button>

                <button
                  onClick={() => {
                    soundService.playConfirm();
                    onExecuteAction(action);
                  }}
                  disabled={!canExecute}
                  className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
                    canExecute
                      ? 'bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-space-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                  title={disabledReason}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{canExecute ? 'EJECUTAR ACCIÓN' : disabledReason}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

