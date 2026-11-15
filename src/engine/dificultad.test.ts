import { describe, it, expect } from 'vitest';
import { advanceSimulationCycle } from './simulationEngine';
import { createInitialGameState } from '../App';
import { PLANET_SCENARIOS } from '../domain/constants';
import { GameState, PlanetScenario } from '../domain/types';

type Sub = GameState['subResources'];

function estado(planeta: PlanetScenario, sub: Partial<Sub> = {}, extra: Partial<GameState> = {}): GameState {
  const base = createInitialGameState(planeta);
  return { ...base, activeEvent: null, ...extra, subResources: { ...base.subResources, ...sub } };
}

function conSalud(state: GameState, salud: number): GameState {
  return { ...state, crew: state.crew.map((c) => ({ ...c, health: salud })) };
}

describe('Dificultad: las decisiones tienen consecuencias', () => {
  it('en apagón el invernadero no produce y el soporte vital rinde menos', () => {
    const conEnergia = advanceSimulationCycle(
      estado(PLANET_SCENARIOS.mars, { batteryStorageCurrent: 500, solarEfficiency: 0 }),
    ).nextState;
    const apagon = advanceSimulationCycle(
      estado(PLANET_SCENARIOS.mars, { batteryStorageCurrent: 0, solarEfficiency: 0 }),
    ).nextState;

    expect(apagon.subResources.batteryStorageCurrent).toBe(0);
    expect(conEnergia.subResources.batteryStorageCurrent).toBeGreaterThan(0);
    expect(apagon.subResources.foodCurrent).toBeLessThan(conEnergia.subResources.foodCurrent);
    expect(apagon.subResources.oxygenCurrent).toBeLessThan(conEnergia.subResources.oxygenCurrent);
    expect(apagon.subResources.waterCurrent).toBeLessThan(conEnergia.subResources.waterCurrent);
  });

  it('el escudo se desgasta cada sol, más rápido en la Luna, y solo el Modo Blindaje lo repone', () => {
    const marte = advanceSimulationCycle(estado(PLANET_SCENARIOS.mars, { shieldIntegrity: 80 }, { policy: 'SURVIVAL' })).nextState;
    const luna = advanceSimulationCycle(estado(PLANET_SCENARIOS.moon, { shieldIntegrity: 80 }, { policy: 'SURVIVAL' })).nextState;
    const blindaje = advanceSimulationCycle(estado(PLANET_SCENARIOS.mars, { shieldIntegrity: 80 }, { policy: 'FULL_SHIELD' })).nextState;

    expect(marte.subResources.shieldIntegrity).toBe(75);
    expect(luna.subResources.shieldIntegrity).toBe(73);
    expect(blindaje.subResources.shieldIntegrity).toBe(84);
  });

  it('con el escudo roto la tripulación pierde salud y recibe más radiación', () => {
    const sano = advanceSimulationCycle(estado(PLANET_SCENARIOS.mars, { shieldIntegrity: 90 }));
    const roto = advanceSimulationCycle(estado(PLANET_SCENARIOS.mars, { shieldIntegrity: 10 }));

    expect(roto.nextState.crew[0].health).toBeLessThan(sano.nextState.crew[0].health);
    expect(roto.nextState.subResources.radiationExposureAccumulated).toBeGreaterThan(
      sano.nextState.subResources.radiationExposureAccumulated * 5,
    );
    expect(roto.warnings.some((w) => w.includes('RADIACIÓN'))).toBe(true);
  });

  it('perder por radiación explica que fue el blindaje', () => {
    const { nextState } = advanceSimulationCycle(conSalud(estado(PLANET_SCENARIOS.mars, { shieldIntegrity: 0 }), 5));
    expect(nextState.status).toBe('defeat');
    expect(nextState.defeatCause?.title).toContain('RADIACIÓN');
  });

  it('perder por hambre explica que fue la comida', () => {
    const { nextState } = advanceSimulationCycle(conSalud(estado(PLANET_SCENARIOS.mars, { foodCurrent: 0 }), 5));
    expect(nextState.status).toBe('defeat');
    expect(nextState.defeatCause?.title).toContain('INANICIÓN');
  });

  it('perder por apagón explica que fue la energía', () => {
    const { nextState } = advanceSimulationCycle(
      conSalud(estado(PLANET_SCENARIOS.mars, { batteryStorageCurrent: 0, solarEfficiency: 0, foodCurrent: 50 }), 5),
    );
    expect(nextState.status).toBe('defeat');
    expect(nextState.defeatCause?.title).toContain('APAGÓN');
  });
});
