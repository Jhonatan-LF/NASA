import React from 'react';
import { PolicyMode } from '../domain/types';
import { ShieldCheck, Factory, HeartPulse, Check, Info } from 'lucide-react';
import { soundService } from '../services/soundService';

interface PolicySelectorProps {
  currentPolicy: PolicyMode;
  onSelectPolicy: (policy: PolicyMode) => void;
}

export const PolicySelector: React.FC<PolicySelectorProps> = ({
  currentPolicy,
  onSelectPolicy,
}) => {
  const policies: {
    id: PolicyMode;
    title: string;
    icon: React.ReactNode;
    badge: string;
    colorClasses: {
      activeBorder: string;
      activeBg: string;
      activeText: string;
      tagColor: string;
    };
    description: string;
    perks: string[];
    drawbacks: string[];
  }[] = [
    {
      id: 'SURVIVAL',
      title: 'Modo Supervivencia',
      icon: <HeartPulse className="w-4 h-4" />,
      badge: 'Defensivo / Ahorro',
      colorClasses: {
        activeBorder: 'border-amber-400 ring-2 ring-amber-400/30',
        activeBg: 'bg-amber-950/40',
        activeText: 'text-amber-300',
        tagColor: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      },
      description: 'Prioriza el soporte vital. Corta potencia a laboratorios y calefacción no crítica.',
      perks: [
        '-30% en consumo eléctrico general',
        '-20% desgaste en maquinaria',
        'Prioridad máxima al reciclaje de O2 y agua',
      ],
      drawbacks: ['-50% producción de biomasa e investigación detenida'],
    },
    {
      id: 'PRODUCTION',
      title: 'Modo Producción',
      icon: <Factory className="w-4 h-4" />,
      badge: 'Expansivo / Rendimiento',
      colorClasses: {
        activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/30',
        activeBg: 'bg-emerald-950/40',
        activeText: 'text-emerald-300',
        tagColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
      },
      description: 'Sobrealimenta lámparas de cultivo hidropónico y reactores de conversión química.',
      perks: ['+40% rendimiento en alimentos y biomasa vegetal', '+40% generación de O2 fotosintético'],
      drawbacks: ['+25% consumo energético total', '+35% aceleración de desgaste en instalaciones'],
    },
    {
      id: 'FULL_SHIELD',
      title: 'Modo Escudo Total',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: 'Blindaje Máximo',
      colorClasses: {
        activeBorder: 'border-violet-400 ring-2 ring-violet-400/30',
        activeBg: 'bg-violet-950/40',
        activeText: 'text-violet-300',
        tagColor: 'bg-violet-950/80 text-violet-300 border-violet-500/40',
      },
      description: 'Energiza a fondo las bobinas magnéticas y concentra agua residual en el domo.',
      perks: ['+35% mitigación de radiación ionizante', 'Protección reforzada contra tormentas solares'],
      drawbacks: ['+80% consumo en deflectores', 'Riesgo de agotamiento de baterías en la noche'],
    },
  ];

  return (
    <div className="hud-panel rounded-2xl p-4 border-cyan-500/20">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-cyan-500/10">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-heading font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
            <span>Directiva Operacional de la Misión</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">(Modifica en tiempo real los algoritmos de simulación)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {policies.map((p) => {
          const isActive = currentPolicy === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                soundService.playConfirm();
                onSelectPolicy(p.id);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between ${
                isActive
                  ? `${p.colorClasses.activeBorder} ${p.colorClasses.activeBg} shadow-lg shadow-black/40`
                  : 'border-slate-800 bg-space-900/60 hover:border-slate-700 hover:bg-space-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-heading font-bold flex items-center gap-1.5 ${isActive ? p.colorClasses.activeText : 'text-slate-200'}`}>
                    {p.icon}
                    {p.title}
                  </span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${p.colorClasses.tagColor}`}>
                    {p.badge}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug mb-2">{p.description}</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                {p.perks.map((perk, idx) => (
                  <div key={idx} className="text-emerald-400 flex items-start gap-1">
                    <span>+</span>
                    <span>{perk}</span>
                  </div>
                ))}
                {p.drawbacks.map((drawback, idx) => (
                  <div key={idx} className="text-amber-400 flex items-start gap-1">
                    <span>-</span>
                    <span>{drawback}</span>
                  </div>
                ))}
              </div>

              {isActive && (
                <div className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

