import React, { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  PlanetScenario,
  PolicyMode,
  MissionAction,
  GameEventChoice,
  GameEvent,
} from './domain/types';
import {
  INITIAL_FACILITIES,
  INITIAL_CREW,
  PLANET_SCENARIOS,
} from './domain/constants';
import { advanceSimulationCycle } from './engine/simulationEngine';
import { GAME_EVENTS_DECK } from './engine/events';
import { MISSION_ACTIONS } from './engine/actions';
import { storageService } from './services/storageService';
import { soundService } from './services/soundService';

// Icons
import {
  Zap,
  Wind,
  Droplets,
  Shield,
  Coins,
  Sparkles,
  Rocket,
  RotateCcw,
  BookOpen,
  LineChart,
  HelpCircle,
  Volume2,
  VolumeX,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Award,
  Layers,
  Activity,
  Flame,
  CheckCircle2,
  Trophy,
  Skull,
} from 'lucide-react';

import confetti from 'canvas-confetti';

// Optional sub-modals for deep dive
import { ColonyVisualizer } from './components/ColonyVisualizer';
import { HistoryTelemetryModal } from './components/HistoryTelemetryModal';
import { STEMLearningCenter } from './components/STEMLearningCenter';
import { HowToPlayModal } from './components/HowToPlayModal';

export function createInitialGameState(planet: PlanetScenario): GameState {
  return {
    status: 'playing',
    planet,
    cycle: 1,
    maxCycles: 15,
    crew: JSON.parse(JSON.stringify(INITIAL_CREW)),
    facilities: JSON.parse(JSON.stringify(INITIAL_FACILITIES)),
    subResources: {
      oxygenCurrent: planet.initialResources.oxygen,
      oxygenMax: 100,
      oxygenProduction: 3.5,
      oxygenConsumption: 3.36,
      waterCurrent: planet.initialResources.water,
      waterMax: 300,
      waterRecyclingEfficiency: 0.85,
      waterConsumption: 10.0,
      foodCurrent: planet.initialResources.food,
      foodMax: 250,
      foodProduction: 2.2,
      foodConsumption: 2.48,
      batteryStorageCurrent: planet.initialResources.battery,
      batteryStorageMax: 600,
      solarEfficiency: 0.95,
      generatorBackupActive: false,
      shieldIntegrity: 92,
      radiationExposureAccumulated: 0.45,
      currentCycleRadiationFlux: planet.id === 'mars' ? 0.67 : 1.10,
      stormShelterActive: false,
    },
    mainResources: {
      energyPercent: Math.round((planet.initialResources.battery / 600) * 100),
      powerGenerationKw: 104.5,
      powerConsumptionKw: 105.0,
      lifeSupportPercent: 88,
      radiationProtectionPercent: 92,
      credits: planet.initialResources.credits,
    },
    policy: 'SURVIVAL',
    activeEvent: null,
    history: [],
    pendingActions: [],
    decisionsLog: [],
    defeatCause: null,
    victorySummary: null,
    stemDiscoveriesUnlocked: [],
  };
}

export function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = storageService.loadGame();
    if (saved && saved.status !== 'welcome') {
      return saved;
    }
    return {
      status: 'welcome',
      planet: PLANET_SCENARIOS.mars,
      cycle: 1,
      maxCycles: 15,
      crew: JSON.parse(JSON.stringify(INITIAL_CREW)),
      facilities: JSON.parse(JSON.stringify(INITIAL_FACILITIES)),
      subResources: {
        oxygenCurrent: 85,
        oxygenMax: 100,
        oxygenProduction: 3.5,
        oxygenConsumption: 3.36,
        waterCurrent: 240,
        waterMax: 300,
        waterRecyclingEfficiency: 0.85,
        waterConsumption: 10.0,
        foodCurrent: 180,
        foodMax: 250,
        foodProduction: 2.2,
        foodConsumption: 2.48,
        batteryStorageCurrent: 450,
        batteryStorageMax: 600,
        solarEfficiency: 0.95,
        generatorBackupActive: false,
        shieldIntegrity: 92,
        radiationExposureAccumulated: 0.45,
        currentCycleRadiationFlux: 0.67,
        stormShelterActive: false,
      },
      mainResources: {
        energyPercent: 75,
        powerGenerationKw: 104.5,
        powerConsumptionKw: 105.0,
        lifeSupportPercent: 88,
        radiationProtectionPercent: 92,
        credits: 2200,
      },
      policy: 'SURVIVAL',
      activeEvent: null,
      history: [],
      pendingActions: [],
      decisionsLog: [],
      defeatCause: null,
      victorySummary: null,
      stemDiscoveriesUnlocked: [],
    };
  });

  // Active view tab: 'card' (Copero main gameplay), 'colony', 'actions'
  const [activeTab, setActiveTab] = useState<'card' | 'colony' | 'actions'>('card');
  const [isMuted, setIsMuted] = useState(soundService.getMuted());
  const [showSTEM, setShowSTEM] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [expandedFact, setExpandedFact] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ text: string; positive: boolean } | null>(null);

  // Auto-save
  useEffect(() => {
    if (gameState.status === 'playing') {
      storageService.saveGame(gameState);
    }
  }, [gameState]);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundService.setMuted(next);
    if (!next) soundService.playClick();
  };

  const showToast = (text: string, positive = true) => {
    setFeedbackToast({ text, positive });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Start new career
  const handleStartMission = (planet: PlanetScenario) => {
    soundService.playConfirm();
    const newState = createInitialGameState(planet);
    setGameState(newState);
    storageService.saveGame(newState);
  };

  const handleRestart = () => {
    soundService.playClick();
    storageService.clearSave();
    setGameState((prev) => ({ ...prev, status: 'welcome' }));
  };

  // Advance Sol (The core loop of Copero)
  const handleAdvanceSol = useCallback(() => {
    if (gameState.status !== 'playing' || isSimulating) return;

    setIsSimulating(true);
    soundService.playCycleAdvance();

    setTimeout(() => {
      const { nextState, warnings } = advanceSimulationCycle(gameState);

      let chosenEvent: GameEvent | null = null;
      if (nextState.status === 'playing') {
        const potentialEvents = GAME_EVENTS_DECK.filter((ev) => {
          if (ev.applicablePlanets && !ev.applicablePlanets.includes(nextState.planet.id)) return false;
          if (ev.triggerMinCycle && nextState.cycle < ev.triggerMinCycle) return false;
          return true;
        });

        const scheduledSols = [2, 4, 6, 8, 11, 13];
        const shouldTrigger = scheduledSols.includes(nextState.cycle) || Math.random() < 0.45;

        if (shouldTrigger && potentialEvents.length > 0) {
          const randomIndex = Math.floor(Math.random() * potentialEvents.length);
          chosenEvent = potentialEvents[randomIndex];
        }
      }

      setGameState({
        ...nextState,
        activeEvent: chosenEvent,
      });

      if (warnings.length > 0) {
        showToast(warnings[0], false);
      } else {
        showToast(`¡Sol ${nextState.cycle} completado con éxito!`, true);
      }

      setIsSimulating(false);
      setExpandedFact(false);
    }, 350);
  }, [gameState, isSimulating]);

  // Choose tactical option in current card
  const handleEventChoice = (choice: GameEventChoice) => {
    soundService.playConfirm();
    setGameState((prev) => {
      const c = choice.consequences;
      const curCredits = prev.mainResources.credits + (c.creditsDelta || 0);
      const curBattery = Math.max(0, prev.subResources.batteryStorageCurrent + (c.batteryDelta || 0));
      const curO2 = Math.max(0, prev.subResources.oxygenCurrent + (c.oxygenDelta || 0));
      const curWater = Math.max(0, prev.subResources.waterCurrent + (c.waterDelta || 0));
      const curFood = Math.max(0, prev.subResources.foodCurrent + (c.foodDelta || 0));
      const curShield = Math.max(0, Math.min(100, prev.subResources.shieldIntegrity + (c.shieldDelta || 0)));

      const nextFacilities = { ...prev.facilities };
      if (c.facilityWearDelta) {
        for (const [key, wear] of Object.entries(c.facilityWearDelta)) {
          const facilityKey = key as keyof typeof nextFacilities;
          if (nextFacilities[facilityKey]) {
            nextFacilities[facilityKey] = {
              ...nextFacilities[facilityKey],
              health: Math.max(0, Math.min(100, nextFacilities[facilityKey].health + wear)),
            };
          }
        }
      }

      const updatedCrew = prev.crew.map((member) => ({
        ...member,
        health: Math.max(0, Math.min(100, member.health + (c.crewHealthDelta || 0))),
        morale: Math.max(0, Math.min(100, member.morale + (c.crewMoraleDelta || 0))),
      }));

      return {
        ...prev,
        activeEvent: null,
        crew: updatedCrew,
        facilities: nextFacilities,
        subResources: {
          ...prev.subResources,
          batteryStorageCurrent: curBattery,
          oxygenCurrent: curO2,
          waterCurrent: curWater,
          foodCurrent: curFood,
          shieldIntegrity: curShield,
        },
        mainResources: {
          ...prev.mainResources,
          credits: curCredits,
        },
        decisionsLog: [
          ...prev.decisionsLog,
          { cycle: prev.cycle, text: choice.text, category: 'decision' },
        ],
      };
    });

    showToast(choice.consequences.customMessage, true);
  };

  // Quick Action execution
  const handleQuickAction = (action: MissionAction) => {
    soundService.playConfirm();
    setGameState((prev) => {
      const updates = action.apply(prev);
      return {
        ...prev,
        ...updates,
        decisionsLog: [
          ...prev.decisionsLog,
          { cycle: prev.cycle, text: action.name, category: action.category },
        ],
      };
    });
    showToast(`Ejecutado: ${action.name}`, true);
  };

  // Set Policy mode
  const setPolicy = (policy: PolicyMode) => {
    soundService.playClick();
    setGameState((prev) => ({ ...prev, policy }));
    showToast(`Estrategia cambiada a: ${policy}`, true);
  };

  // -------------------------------------------------------------
  // WELCOME SCREEN (Clean & Fast, like Copero Career Launcher)
  // -------------------------------------------------------------
  if (gameState.status === 'welcome') {
    return (
      <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col justify-between items-center p-4 selection:bg-cyan-400 selection:text-black">
        {/* Top minimal brand */}
        <header className="w-full max-w-md flex justify-between items-center pt-2">
          <div className="flex items-center space-x-2">
            <Rocket className="w-5 h-5 text-cyan-400" />
            <span className="font-heading font-black tracking-wider text-sm text-cyan-300">MARS-1</span>
          </div>
          <button
            onClick={() => setShowHowToPlay(true)}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" /> ¿Cómo jugar?
          </button>
        </header>

        {/* Central Hero Card (Copero style) */}
        <main className="w-full max-w-md bg-[#0d1428] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-950/60 text-center flex flex-col items-center my-auto">
          {/* Planet Avatar Icon */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-red-950 via-amber-800 to-red-500 border-2 border-cyan-400/50 shadow-xl shadow-red-500/20 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,transparent_20%,rgba(0,0,0,0.8)_80%)]" />
              <Flame className="w-10 h-10 text-amber-300 relative z-10" />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-400/40 uppercase">
              15 Soles
            </span>
          </div>

          <h1 className="text-2xl font-heading font-black tracking-wider text-white uppercase">
            MARS-1: OUTPOST
          </h1>
          <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mb-1">
            Modo Carrera Espacial
          </p>
          <p className="text-xs text-slate-400 font-sans leading-relaxed mb-6">
            Lidera un puesto de avanzada. 15 turnos de supervivencia con recursos reales de la NASA. Cada decisión altera tus estadísticas.
          </p>

          {/* Quick Planet Selector (Mars vs Moon) */}
          <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
            <button
              onClick={() => handleStartMission(PLANET_SCENARIOS.mars)}
              className="p-3.5 rounded-2xl border border-red-500/40 bg-red-950/20 hover:bg-red-900/40 hover:border-red-400 transition-all flex flex-col items-center text-center group active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mb-1 text-red-400 group-hover:scale-110 transition-transform">
                🪐
              </div>
              <span className="text-xs font-heading font-bold text-white">MARTE</span>
              <span className="text-[10px] font-mono text-slate-400">Tormentas & Polvo</span>
            </button>

            <button
              onClick={() => handleStartMission(PLANET_SCENARIOS.moon)}
              className="p-3.5 rounded-2xl border border-slate-700 bg-slate-900/40 hover:bg-slate-800 hover:border-slate-400 transition-all flex flex-col items-center text-center group active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-slate-400/20 flex items-center justify-center mb-1 text-slate-300 group-hover:scale-110 transition-transform">
                🌕
              </div>
              <span className="text-xs font-heading font-bold text-white">LUNA</span>
              <span className="text-[10px] font-mono text-slate-400">Radiación & Frío</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Hackathon NASA • Basado en el bucle cerrado ECLSS
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-[10px] font-mono text-slate-600 pb-2">
          "Every decision determines survival."
        </footer>

        {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VICTORY CARD (The Copero "Retiro Legendario" Card)
  // -------------------------------------------------------------
  if (gameState.status === 'victory' && gameState.victorySummary) {
    const summary = gameState.victorySummary;
    return (
      <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#0d1428] border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              ¡CARRERA COMPLETADA!
            </div>
            <h2 className="text-2xl font-heading font-black text-white">
              COMANDANTE LEYENDA
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Has sobrevivido 15 Soles en {gameState.planet.name.split('—')[0].trim()}
            </p>
          </div>

          {/* Copero-like Player Stats Card */}
          <div className="bg-[#080d1a] p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-left font-mono text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Puntuación</span>
              <div className="text-xl font-heading font-black text-emerald-400">
                {summary.finalScore} PTS
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Tripulación</span>
              <div className="text-xl font-heading font-black text-cyan-300">
                {summary.survivingCrewCount} / 4 VIVOS
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Reciclaje Agua</span>
              <div className="text-lg font-heading font-bold text-blue-400">
                {summary.waterRecycledPercent}%
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Energía Neta</span>
              <div className="text-lg font-heading font-bold text-amber-400">
                {summary.totalEnergyGenerated} kW
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/20 text-xs text-emerald-200 text-left font-sans space-y-1">
            <strong className="block font-mono text-[11px] text-emerald-300 uppercase">
              Hito Aeroespacial Obtenido:
            </strong>
            <p>Demostraste el bucle cerrado y autosuficiencia en soporte vital bajo estándares de la NASA.</p>
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-space-950 font-heading font-black text-sm tracking-wider uppercase shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
          >
            NUEVA CARRERA (OTRO PLANETA)
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DEFEAT CARD (Copero-like Failure Screen)
  // -------------------------------------------------------------
  if (gameState.status === 'defeat' && gameState.defeatCause) {
    const cause = gameState.defeatCause;
    return (
      <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#0d1428] border-2 border-red-500/60 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-400/40">
            <Skull className="w-10 h-10" />
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold">
              MISIÓN ABORTADA EN EL SOL {gameState.cycle}
            </div>
            <h2 className="text-xl font-heading font-black text-red-300 leading-tight">
              {cause.title}
            </h2>
          </div>

          <div className="p-3 bg-red-950/40 rounded-2xl border border-red-500/30 text-xs text-red-200 text-left font-sans">
            <strong className="block font-mono text-[10px] uppercase text-red-300 mb-1">Causa Técnica:</strong>
            {cause.reason}
          </div>

          <div className="p-3 bg-space-950 rounded-2xl border border-slate-800 text-left text-xs font-sans text-slate-300 space-y-1">
            <strong className="block font-mono text-[10px] uppercase text-cyan-400">Consejo de Ingeniería NASA:</strong>
            <p>{cause.recommendations[0]}</p>
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-heading font-black text-sm tracking-wider uppercase shadow-xl shadow-red-600/30 transition-all active:scale-95"
          >
            VOLVER A INTENTARLO
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN GAME SCREEN: THE "COPERO" SPACE SIMULATOR
  // -------------------------------------------------------------
  const aliveCrew = gameState.crew.filter((c) => c.health > 0).length;
  const currentEvent = gameState.activeEvent;

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col justify-between selection:bg-cyan-400 selection:text-black">
      {/* 1. TOP HEADER & HUD STATS (Clean badges like Copero player stats) */}
      <header className="sticky top-0 z-30 bg-[#0a0f1f]/95 backdrop-blur-md border-b border-cyan-500/20 px-3 py-2">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          {/* Top Line: Brand + Sol + Tools */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-heading font-black text-xs text-cyan-400 tracking-wider">MARS-1</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-semibold uppercase">
                {gameState.planet.id === 'mars' ? 'Marte' : 'Luna'}
              </span>
            </div>

            {/* Turn Sol Pill (Center of attention) */}
            <div className="flex items-center space-x-1.5 bg-space-950 px-3 py-1 rounded-full border border-cyan-400/40 shadow-inner">
              <span className="text-[10px] font-mono uppercase text-slate-400">SOL</span>
              <span className="text-sm font-heading font-black text-cyan-300">
                {String(gameState.cycle).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono text-slate-500">/ 15</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg bg-space-900 border border-slate-700 text-slate-300 hover:text-white"
                title="Sonido"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
              <button
                onClick={() => setShowSTEM(true)}
                className="p-1.5 rounded-lg bg-violet-950 border border-violet-500/40 text-violet-300 hover:text-white"
                title="Centro STEM"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="p-1.5 rounded-lg bg-space-900 border border-slate-700 text-slate-300 hover:text-white"
                title="Historial"
              >
                <LineChart className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-space-900 border border-slate-700 text-slate-400 hover:text-red-400"
                title="Reiniciar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stat Pills Strip (Like Copero FIFA-style player stats: OVR, Energy, Goals, Money) */}
          <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
            {/* Energía */}
            <div className="bg-[#0e162d] p-1.5 rounded-xl border border-cyan-500/30 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 flex items-center gap-0.5 uppercase">
                <Zap className="w-2.5 h-2.5 text-cyan-400" /> ENERG
              </span>
              <span className="text-xs font-black font-heading text-cyan-300">
                {gameState.mainResources.energyPercent}%
              </span>
            </div>

            {/* Oxígeno */}
            <div className="bg-[#0e162d] p-1.5 rounded-xl border border-emerald-500/30 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 flex items-center gap-0.5 uppercase">
                <Wind className="w-2.5 h-2.5 text-emerald-400" /> O2
              </span>
              <span className="text-xs font-black font-heading text-emerald-300">
                {gameState.subResources.oxygenCurrent}k
              </span>
            </div>

            {/* Agua */}
            <div className="bg-[#0e162d] p-1.5 rounded-xl border border-blue-500/30 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 flex items-center gap-0.5 uppercase">
                <Droplets className="w-2.5 h-2.5 text-blue-400" /> H2O
              </span>
              <span className="text-xs font-black font-heading text-blue-300">
                {gameState.subResources.waterCurrent}L
              </span>
            </div>

            {/* Escudo */}
            <div className="bg-[#0e162d] p-1.5 rounded-xl border border-violet-500/30 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 flex items-center gap-0.5 uppercase">
                <Shield className="w-2.5 h-2.5 text-violet-400" /> ESC
              </span>
              <span className="text-xs font-black font-heading text-violet-300">
                {gameState.subResources.shieldIntegrity}%
              </span>
            </div>

            {/* Créditos */}
            <div className="bg-[#0e162d] p-1.5 rounded-xl border border-amber-500/30 flex flex-col items-center">
              <span className="text-[9px] text-slate-400 flex items-center gap-0.5 uppercase">
                <Coins className="w-2.5 h-2.5 text-amber-400" /> PRES
              </span>
              <span className="text-xs font-black font-heading text-amber-300">
                ${gameState.mainResources.credits}k
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Floating toast notification */}
      {feedbackToast && (
        <div
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] px-4 py-2 rounded-2xl shadow-2xl text-xs font-mono text-center border animate-in fade-in slide-in-from-top-2 ${
            feedbackToast.positive
              ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200'
              : 'bg-red-950/95 border-red-500/60 text-red-200'
          }`}
        >
          {feedbackToast.text}
        </div>
      )}

      {/* 2. MAIN COPERO PLAYGROUND (Centered Single Card Flow) */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-3 flex flex-col justify-center">
        {/* Navigation Tabs (Misión, Colonia, Acciones) */}
        <div className="flex bg-[#0b1224] p-1 rounded-2xl border border-slate-800 mb-3 text-xs font-mono">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'card'
                ? 'bg-cyan-500 text-space-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>SOL ACTIVO</span>
          </button>

          <button
            onClick={() => setActiveTab('colony')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'colony'
                ? 'bg-cyan-500 text-space-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>COLONIA ({aliveCrew}/4)</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'actions'
                ? 'bg-cyan-500 text-space-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>MEJORAS</span>
          </button>
        </div>

        {/* TAB 1: THE COPERO DECISION CARD */}
        {activeTab === 'card' && (
          <div className="w-full bg-[#0d1428] border border-cyan-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
            {/* Background subtle planet atmosphere */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Event / Sol Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  {currentEvent ? `🚨 ${currentEvent.severity.toUpperCase()}` : `SOL ${gameState.cycle}: CONDICIONES NOMINALES`}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Estrategia: <strong className="text-cyan-300">{gameState.policy}</strong>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-heading font-black text-white leading-tight">
                {currentEvent ? currentEvent.title : `Ciclo Operativo del Sol ${gameState.cycle}`}
              </h2>

              <p className="text-xs text-slate-300 font-sans leading-relaxed mt-1">
                {currentEvent
                  ? currentEvent.description
                  : `La base opera según los parámetros de ${gameState.planet.name.split('—')[0].trim()}. El balance eléctrico y de soporte vital se recalcularán al avanzar.`}
              </p>
            </div>

            {/* Tactical Decision Choices (Copero Dilemmas) */}
            <div className="space-y-2.5">
              {currentEvent ? (
                // If there's an active emergency event, show the event choices
                currentEvent.choices.map((choice) => {
                  const cost = choice.costCredits || 0;
                  const canAfford = gameState.mainResources.credits >= cost;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleEventChoice(choice)}
                      disabled={!canAfford}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between active:scale-[0.98] ${
                        canAfford
                          ? 'bg-[#121c38] border-cyan-500/40 hover:border-cyan-300 hover:bg-[#162245] shadow-lg shadow-cyan-950/40'
                          : 'bg-space-950/60 border-slate-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-heading font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          {choice.text}
                        </span>
                        {cost > 0 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 shrink-0">
                            -${cost}k
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans pl-5 leading-snug">
                        {choice.description}
                      </p>
                    </button>
                  );
                })
              ) : (
                // If routine sol, show quick tactical directives or direct Sol Advance
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 mb-1">
                    Directiva táctica para este Sol:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPolicy('SURVIVAL')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        gameState.policy === 'SURVIVAL'
                          ? 'bg-amber-950/80 border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                          : 'bg-[#121c38] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-xs font-heading font-bold">Ahorro</div>
                      <div className="text-[9px] font-mono text-slate-400">-30% Energía</div>
                    </button>

                    <button
                      onClick={() => setPolicy('PRODUCTION')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        gameState.policy === 'PRODUCTION'
                          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/30'
                          : 'bg-[#121c38] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-xs font-heading font-bold">Producción</div>
                      <div className="text-[9px] font-mono text-slate-400">+40% Biomasa</div>
                    </button>

                    <button
                      onClick={() => setPolicy('FULL_SHIELD')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        gameState.policy === 'FULL_SHIELD'
                          ? 'bg-violet-950/80 border-violet-400 text-violet-300 ring-2 ring-violet-400/30'
                          : 'bg-[#121c38] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-xs font-heading font-bold">Escudo</div>
                      <div className="text-[9px] font-mono text-slate-400">+35% Blindaje</div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Expandable Bite-Sized STEM Fact (Zero clutter) */}
            <div className="bg-[#080d1a] p-3 rounded-2xl border border-violet-500/30 space-y-1">
              <button
                onClick={() => setExpandedFact(!expandedFact)}
                className="w-full flex items-center justify-between text-left text-[11px] font-mono text-violet-300 font-bold"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <span>¿Sabías que? (Física NASA)</span>
                </span>
                <span className="text-[10px] text-slate-500 underline">
                  {expandedFact ? 'Cerrar' : 'Leer'}
                </span>
              </button>
              {expandedFact && (
                <p className="text-[11px] font-sans text-slate-300 leading-relaxed pt-1 border-t border-slate-800 animate-in fade-in">
                  {currentEvent
                    ? currentEvent.stemExplanation
                    : 'El sistema ECLSS de la Estación Espacial Internacional recicla hasta el 98% de la orina y la condensación ambiental mediante destilación al vacío y convertidores catalíticos Sabatier.'}
                </p>
              )}
            </div>

            {/* Primary Action Button: "AVANZAR SOL" (Like Copero's "Simular Temporada") */}
            <button
              onClick={handleAdvanceSol}
              disabled={isSimulating || !!currentEvent}
              className={`w-full py-3.5 rounded-2xl font-heading font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl ${
                currentEvent
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-space-950 shadow-cyan-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSimulating ? 'SIMULANDO SOL...' : currentEvent ? 'RESUELVE LA ALERTA ARRIBA' : 'AVANZAR SOL'}
              </span>
            </button>
          </div>
        )}

        {/* TAB 2: COLONY VISUALIZER TAB */}
        {activeTab === 'colony' && (
          <div className="space-y-3">
            <ColonyVisualizer
              facilities={gameState.facilities}
              planet={gameState.planet}
              policy={gameState.policy}
            />
          </div>
        )}

        {/* TAB 3: ACTIONS & UPGRADES TAB */}
        {activeTab === 'actions' && (
          <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
            <div className="text-xs font-heading uppercase text-cyan-300 font-bold mb-1">
              Mejoras Disponibles (${gameState.mainResources.credits}k disponibles):
            </div>
            {MISSION_ACTIONS.map((action) => {
              const canAfford = gameState.mainResources.credits >= action.costCredits;
              return (
                <div
                  key={action.id}
                  className="p-3 bg-[#0d1428] border border-slate-800 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <div className="text-xs font-heading font-bold text-slate-200">{action.name}</div>
                    <div className="text-[10px] text-emerald-400 font-sans">{action.expectedBenefit}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Coste: ${action.costCredits}k {action.energyCostKw > 0 && `| -${action.energyCostKw} kWh`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuickAction(action)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-xl font-heading font-bold text-[11px] transition-all shrink-0 ${
                      canAfford
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-space-950 active:scale-95 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    COMPRAR
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 3. BOTTOM FOOTER NAVIGATION */}
      <footer className="p-2.5 border-t border-slate-800/80 bg-[#070b16] text-center text-[10px] font-mono text-slate-500">
        MARS-1 Simulator • Sobrevive 15 Soles • Basado en el bucle cerrado de la NASA
      </footer>

      {/* STEM Learning Center Modal */}
      {showSTEM && <STEMLearningCenter onClose={() => setShowSTEM(false)} />}

      {/* History Telemetry Modal */}
      {showHistory && (
        <HistoryTelemetryModal history={gameState.history} onClose={() => setShowHistory(false)} />
      )}

      {/* How to play guide */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
}
export default App;
