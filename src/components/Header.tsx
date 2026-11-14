import React, { useState } from 'react';
import {
  Rocket,
  Volume2,
  VolumeX,
  BookOpen,
  LineChart,
  HelpCircle,
  RotateCcw,
  Users,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { GameState } from '../domain/types';
import { soundService } from '../services/soundService';

interface HeaderProps {
  state: GameState;
  onOpenSTEM: () => void;
  onOpenHistory: () => void;
  onOpenHowToPlay: () => void;
  onRestart: () => void;
  onAdvanceCycle: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onOpenSTEM,
  onOpenHistory,
  onOpenHowToPlay,
  onRestart,
  onAdvanceCycle,
  isSimulating,
}) => {
  const [isMuted, setIsMuted] = useState(soundService.getMuted());
  const [showCrewPopover, setShowCrewPopover] = useState(false);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundService.setMuted(next);
    if (!next) soundService.playClick();
  };

  const aliveCrew = state.crew.filter((c) => c.health > 0);
  const avgMorale = Math.round(state.crew.reduce((acc, c) => acc + c.morale, 0) / state.crew.length);

  return (
    <header className="sticky top-0 z-30 w-full bg-space-950/90 backdrop-blur-md border-b border-cyan-500/20 px-3 py-2.5 shadow-lg shadow-cyan-950/30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Mission identity */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600/30 to-blue-900/40 border border-cyan-400/40 shadow-inner shadow-cyan-500/20">
            <Rocket className="w-5 h-5 text-cyan-300" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-heading font-black tracking-wider text-base sm:text-lg text-slate-100 flex items-center gap-1.5">
                <span className="text-cyan-400">MARS-1</span>
                <span className="hidden sm:inline text-xs font-mono font-normal text-slate-400">| OUTPOST SIMULATOR</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {state.planet.name.split('—')[0].trim()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 italic hidden md:block">
              "Every decision determines survival."
            </p>
          </div>
        </div>

        {/* Central Telemetry: Sol Cycle & Crew Status */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Sol Cycle Gauge */}
          <div className="flex items-center space-x-2 bg-space-900/90 px-3 py-1.5 rounded-lg border border-cyan-500/30">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Ciclo Misión</div>
              <div className="text-base sm:text-lg font-heading font-bold text-cyan-300 leading-none">
                SOL {String(state.cycle).padStart(2, '0')}{' '}
                <span className="text-xs font-mono text-slate-500 font-normal">/ {state.maxCycles}</span>
              </div>
            </div>
            {/* Circular or bar progress indicator */}
            <div className="w-9 h-9 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400 transition-all duration-700 ease-out"
                  strokeDasharray={`${(state.cycle / state.maxCycles) * 100}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-mono font-bold text-cyan-200">
                {Math.round((state.cycle / state.maxCycles) * 100)}%
              </span>
            </div>
          </div>

          {/* Crew Quick Status Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                soundService.playClick();
                setShowCrewPopover(!showCrewPopover);
              }}
              title="Ver estado médico de la tripulación"
              className="flex items-center space-x-2 bg-space-900/90 hover:bg-space-850 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-cyan-500/40 transition-colors text-left"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <div className="hidden xs:block">
                <div className="text-[10px] font-mono uppercase text-slate-400 leading-none">Tripulación</div>
                <div className="text-xs font-mono font-semibold text-emerald-300">
                  {aliveCrew.length}/4 <span className="text-[10px] text-slate-400">({avgMorale}% moral)</span>
                </div>
              </div>
            </button>

            {/* Crew Popover Modal */}
            {showCrewPopover && (
              <div className="absolute right-0 mt-2 w-72 p-3 bg-space-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-heading font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Estado Biométrico de Tripulación
                  </span>
                  <button
                    onClick={() => setShowCrewPopover(false)}
                    className="text-slate-400 hover:text-white text-xs font-mono px-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  {state.crew.map((c) => (
                    <div
                      key={c.id}
                      className="p-2 rounded bg-space-950/60 border border-slate-800/80 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{c.name}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                            c.status === 'healthy'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                              : c.status === 'stressed'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                              : 'bg-red-950/80 text-red-300 border border-red-500/30 animate-pulse'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{c.role}</div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Salud</span>
                            <span className="text-emerald-400 font-bold">{c.health}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${c.health}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Moral</span>
                            <span className="text-cyan-400 font-bold">{c.morale}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                            <div
                              className="bg-cyan-500 h-full rounded-full transition-all"
                              style={{ width: `${c.morale}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Action Tools & Next Sol Button */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Activar audio de telemetría' : 'Silenciar audio'}
            className="p-2 rounded-lg bg-space-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* STEM Educational Hub button */}
          <button
            onClick={() => {
              soundService.playClick();
              onOpenSTEM();
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-violet-950/50 hover:bg-violet-900/60 border border-violet-500/40 text-violet-300 text-xs font-mono font-medium transition-all shadow-sm shadow-violet-900/30"
            title="Abrir Centro de Aprendizaje STEM"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">STEM Hub</span>
            {state.stemDiscoveriesUnlocked.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center">
                {state.stemDiscoveriesUnlocked.length}
              </span>
            )}
          </button>

          {/* History & Telemetry button */}
          <button
            onClick={() => {
              soundService.playClick();
              onOpenHistory();
            }}
            className="p-2 rounded-lg bg-space-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Ver Telemetría e Historial de Misión"
          >
            <LineChart className="w-4 h-4 text-cyan-400" />
          </button>

          {/* How to play */}
          <button
            onClick={() => {
              soundService.playClick();
              onOpenHowToPlay();
            }}
            className="p-2 rounded-lg bg-space-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Instrucciones y Manual de Misión"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              soundService.playClick();
              onRestart();
            }}
            className="p-2 rounded-lg bg-space-900 border border-slate-700 hover:border-red-500 text-slate-400 hover:text-red-400 transition-colors"
            title="Reiniciar Misión"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Primary Action: Advance Sol / Cycle */}
          <button
            onClick={() => {
              soundService.playCycleAdvance();
              onAdvanceCycle();
            }}
            disabled={isSimulating || state.status !== 'playing'}
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-space-950 font-heading font-black text-xs sm:text-sm tracking-wider shadow-lg shadow-cyan-500/30 transition-all border border-cyan-300/40"
          >
            <Sparkles className="w-4 h-4 text-space-950" />
            <span>{isSimulating ? 'SIMULANDO...' : 'AVANZAR SOL'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

