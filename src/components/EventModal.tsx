import React from 'react';
import { GameEvent, GameEventChoice, GameState } from '../domain/types';
import {
  AlertTriangle,
  Radio,
  Zap,
  Coins,
  ShieldAlert,
  Sprout,
  Droplet,
  Wind,
  Sun,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface EventModalProps {
  event: GameEvent;
  state: GameState;
  onResolveChoice: (choice: GameEventChoice) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  state,
  onResolveChoice,
}) => {
  const getSeverityBanner = (sev: GameEvent['severity']) => {
    switch (sev) {
      case 'critica':
        return {
          bg: 'bg-red-950/90 border-red-500/60 text-red-200',
          badge: 'bg-red-900 text-red-100 border-red-500',
          icon: <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />,
          title: 'ALERTA ROJA: EMERGENCIA CRÍTICA DE MISIÓN',
        };
      case 'alta':
        return {
          bg: 'bg-amber-950/90 border-amber-500/60 text-amber-200',
          badge: 'bg-amber-900 text-amber-100 border-amber-500',
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          title: 'ADVERTENCIA AMARILLA: ANOMALÍA GRAVE',
        };
      case 'positiva':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200',
          badge: 'bg-emerald-900 text-emerald-100 border-emerald-500',
          icon: <CheckCircle className="w-6 h-6 text-emerald-400 animate-pulse" />,
          title: 'TRANSMISIÓN FAVORABLE: OPORTUNIDAD CIENTÍFICA',
        };
      default:
        return {
          bg: 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200',
          badge: 'bg-cyan-900 text-cyan-100 border-cyan-500',
          icon: <Radio className="w-6 h-6 text-cyan-400" />,
          title: 'TELEMETRÍA DE RUTINA: EVENTO DE MISIÓN',
        };
    }
  };

  const banner = getSeverityBanner(event.severity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-space-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`w-full max-w-2xl rounded-2xl border ${banner.bg} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Header alert */}
        <div className="p-4 border-b border-inherit flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-space-950/60 border border-inherit shadow-md">
              {banner.icon}
            </div>
            <div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${banner.badge}`}>
                {banner.title}
              </span>
              <h2 className="text-base sm:text-lg font-heading font-black text-white mt-1">
                {event.title}
              </h2>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-300 hidden sm:block">
            SOL {String(state.cycle).padStart(2, '0')}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Situation Description */}
          <div className="p-3.5 rounded-xl bg-space-950/70 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {event.description}
          </div>

          {/* STEM Science Box */}
          <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-violet-300">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Fundamento Científico Aeroespacial (NASA / STEM)</span>
            </div>
            <p className="text-[11px] font-sans text-violet-200 leading-relaxed">
              {event.stemExplanation}
            </p>
          </div>

          {/* Choices Section */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-300">
              Seleccione la directiva de respuesta:
            </h3>

            <div className="space-y-2.5">
              {event.choices.map((choice) => {
                const cost = choice.costCredits || 0;
                const canAfford = state.mainResources.credits >= cost;

                return (
                  <button
                    key={choice.id}
                    onClick={() => {
                      if (canAfford) {
                        soundService.playConfirm();
                        onResolveChoice(choice);
                      }
                    }}
                    disabled={!canAfford}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      canAfford
                        ? 'bg-space-900/90 border-slate-700 hover:border-cyan-400 hover:bg-space-850 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.99]'
                        : 'bg-space-950/50 border-slate-800/80 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-heading font-bold text-xs sm:text-sm text-slate-100">
                          {choice.text}
                        </span>
                        {cost > 0 && (
                          <span
                            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                              canAfford
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                : 'bg-red-950/80 text-red-300 border-red-500/40'
                            }`}
                          >
                            Coste: ${cost}k
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-snug mb-2 font-sans">
                        {choice.description}
                      </p>
                    </div>

                    <div className="p-2 rounded bg-space-950/70 border border-slate-800 text-[10px] font-mono text-cyan-300/90 flex items-start gap-1.5">
                      <strong className="text-cyan-400 uppercase">Lección STEM:</strong>
                      <span>{choice.stemLesson}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

