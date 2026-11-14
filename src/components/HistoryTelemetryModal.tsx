import React, { useState } from 'react';
import { CycleTelemetryRecord } from '../domain/types';
import { LineChart, X, Activity, Zap, Droplets, Shield, Clock } from 'lucide-react';
import { soundService } from '../services/soundService';

interface HistoryTelemetryModalProps {
  history: CycleTelemetryRecord[];
  onClose: () => void;
}

export const HistoryTelemetryModal: React.FC<HistoryTelemetryModalProps> = ({
  history,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'energy' | 'lifesupport' | 'radiation' | 'log'>('energy');

  // Simple SVG Line Chart generator
  const renderLineChart = (
    series1: { label: string; color: string; values: number[] },
    series2?: { label: string; color: string; values: number[] }
  ) => {
    if (history.length === 0) {
      return (
        <div className="h-56 flex items-center justify-center text-slate-500 font-mono text-xs">
          Aún no hay ciclos registrados. Avanza el primer Sol para recopilar telemetría.
        </div>
      );
    }

    const allValues = [...series1.values, ...(series2 ? series2.values : [])];
    const maxVal = Math.max(...allValues, 10);
    const minVal = 0;
    const width = 600;
    const height = 200;
    const padding = 30;

    const getX = (idx: number) => {
      if (history.length <= 1) return padding + (width - 2 * padding) / 2;
      return padding + (idx / (history.length - 1)) * (width - 2 * padding);
    };

    const getY = (val: number) => {
      const clamped = Math.max(minVal, Math.min(maxVal, val));
      return height - padding - ((clamped - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);
    };

    const makePath = (values: number[]) => {
      return values
        .map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`)
        .join(' ');
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-4 text-xs font-mono justify-end">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: series1.color }} />
            <span className="text-slate-300">{series1.label}</span>
          </div>
          {series2 && (
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: series2.color }} />
              <span className="text-slate-300">{series2.label}</span>
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto bg-space-950 p-2 rounded-xl border border-slate-800">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = padding + pct * (height - 2 * padding);
              return (
                <line
                  key={idx}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Path 1 */}
            <path
              d={makePath(series1.values)}
              fill="none"
              stroke={series1.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Path 2 if present */}
            {series2 && (
              <path
                d={makePath(series2.values)}
                fill="none"
                stroke={series2.color}
                strokeWidth="2.5"
                strokeDasharray="5 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points */}
            {series1.values.map((v, i) => (
              <circle
                key={`p1-${i}`}
                cx={getX(i)}
                cy={getY(v)}
                r="4"
                fill={series1.color}
                className="hover:r-6 transition-all cursor-pointer"
              >
                <title>{`Sol ${history[i].cycle}: ${v}`}</title>
              </circle>
            ))}

            {series2 &&
              series2.values.map((v, i) => (
                <circle
                  key={`p2-${i}`}
                  cx={getX(i)}
                  cy={getY(v)}
                  r="4"
                  fill={series2.color}
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>{`Sol ${history[i].cycle}: ${v}`}</title>
                </circle>
              ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-space-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-space-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-heading font-black uppercase tracking-wider text-slate-100">
              Telemetría Histórica de la Misión (Caja Negra)
            </h2>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('energy')}
            className={`pb-2 px-3 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'energy'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Balance Energético</span>
          </button>
          <button
            onClick={() => setActiveTab('lifesupport')}
            className={`pb-2 px-3 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'lifesupport'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Soporte Vital (O2 / H2O)</span>
          </button>
          <button
            onClick={() => setActiveTab('radiation')}
            className={`pb-2 px-3 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'radiation'
                ? 'border-violet-400 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Dosis y Escudo</span>
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`pb-2 px-3 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'log'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Bitácora de Soles</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'energy' && (
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-300 mb-2">
                Generación Fotovoltaica (kW) vs Demanda Eléctrica de la Base (kW)
              </h3>
              {renderLineChart(
                {
                  label: 'Generación Solar (kW)',
                  color: '#06b6d4',
                  values: history.map((h) => h.energyProducedKw),
                },
                {
                  label: 'Demanda Eléctrica (kW)',
                  color: '#f59e0b',
                  values: history.map((h) => h.energyConsumedKw),
                }
              )}
            </div>
          )}

          {activeTab === 'lifesupport' && (
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-300 mb-2">
                Reservas de Oxígeno (kg) y Agua Purificada (L)
              </h3>
              {renderLineChart(
                {
                  label: 'Oxígeno (kg)',
                  color: '#34d399',
                  values: history.map((h) => h.oxygen),
                },
                {
                  label: 'Agua (Litros)',
                  color: '#38bdf8',
                  values: history.map((h) => h.water),
                }
              )}
            </div>
          )}

          {activeTab === 'radiation' && (
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-300 mb-2">
                Integridad de Blindaje (%) vs Flujo Ionizante (mSv/sol)
              </h3>
              {renderLineChart(
                {
                  label: 'Blindaje (%)',
                  color: '#a78bfa',
                  values: history.map((h) => h.shieldIntegrity),
                },
                {
                  label: 'Dosis por Sol (mSv x 10)',
                  color: '#ef4444',
                  values: history.map((h) => h.radiationFlux * 10),
                }
              )}
            </div>
          )}

          {activeTab === 'log' && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-slate-300 mb-2">
                Registros de Auditoría de Ciclos
              </h3>
              {history.length === 0 ? (
                <div className="text-slate-500 font-mono text-xs py-8 text-center">
                  Sin registros todavía.
                </div>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  {history.map((record) => (
                    <div
                      key={record.cycle}
                      className="p-3 rounded-lg bg-space-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-heading font-black text-cyan-400">
                          SOL {String(record.cycle).padStart(2, '0')}
                        </span>
                        <span className="text-slate-400">| Política: {record.activePolicy}</span>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-300">
                        <span>⚡ {record.batteryStored} kWh</span>
                        <span>💨 {record.oxygen} kg O2</span>
                        <span>💧 {record.water} L H2O</span>
                        <span>🛡️ {record.shieldIntegrity}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

