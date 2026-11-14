import {
  GameState,
  CycleTelemetryRecord,
  DefeatCause,
  VictorySummary,
  PolicyMode,
  ColonyFacilities,
} from '../domain/types';
import { NASA_ECLSS_METRICS } from '../domain/constants';

export interface SimulationStepResult {
  nextState: GameState;
  telemetry: CycleTelemetryRecord;
  warnings: string[];
}

/**
 * Pure simulation function that advances the outpost mission by 1 cycle (Sol).
 * Adheres strictly to conservation laws and aerospace constraints.
 */
export function advanceSimulationCycle(currentState: GameState): SimulationStepResult {
  const warnings: string[] = [];
  const current = currentState;
  const crewCount = current.crew.filter((c) => c.health > 0).length;

  // 1. Policy Multipliers
  let powerDemandMultiplier = 1.0;
  let lifeSupportPriorityMultiplier = 1.0;
  let productionBonus = 1.0;
  let shieldPowerDemandMultiplier = 1.0;
  let radiationShieldBonus = 0.0;
  let wearMultiplier = 1.0;

  switch (current.policy) {
    case 'SURVIVAL':
      // Cut non-essential power, reduce research & greenhouse lamps, prioritize ECLSS
      powerDemandMultiplier = 0.70;
      productionBonus = 0.50;
      lifeSupportPriorityMultiplier = 1.15; // Extra scrutiny on recycling
      wearMultiplier = 0.80; // Less strain on machinery
      break;

    case 'PRODUCTION':
      // Overclock greenhouse, ECLSS and mining, higher energy draw and mechanical wear
      powerDemandMultiplier = 1.25;
      productionBonus = 1.40;
      wearMultiplier = 1.35;
      break;

    case 'FULL_SHIELD':
      // Maximize electromagnetic deflectors and auxiliary coils
      shieldPowerDemandMultiplier = 1.80;
      radiationShieldBonus = 0.35;
      powerDemandMultiplier = 1.15;
      break;
  }

  // 2. Power Generation Calculations
  // Base generation depends on Solar Array level, health, and current solar efficiency
  const solarBaseKw = 110 * current.facilities.solarArray.level * (current.facilities.solarArray.health / 100);
  const solarGenKw = solarBaseKw * current.subResources.solarEfficiency;
  const backupGenKw = current.subResources.generatorBackupActive ? 35 : 0;
  const totalPowerGenKw = Math.round((solarGenKw + backupGenKw) * 10) / 10;

  // 3. Power Consumption Calculations
  const habitatDemand = current.facilities.habitat.energyDemand * (current.facilities.habitat.health > 20 ? 1 : 0.5);
  const eclssDemand = current.facilities.lifeSupport.energyDemand;
  const greenhouseDemand = current.facilities.greenhouse.energyDemand * (current.policy === 'SURVIVAL' ? 0.4 : 1.0);
  const labDemand = current.facilities.researchLab.energyDemand * (current.policy === 'SURVIVAL' ? 0.2 : 1.0);
  const shieldDemand = current.facilities.radiationShield.energyDemand * shieldPowerDemandMultiplier;

  const rawPowerConsumption = (habitatDemand + eclssDemand + greenhouseDemand + labDemand + shieldDemand) * powerDemandMultiplier;
  const totalPowerConsumptionKw = Math.round(rawPowerConsumption * 10) / 10;

  // Battery Storage delta
  const netPowerKw = totalPowerGenKw - totalPowerConsumptionKw;
  let newBattery = current.subResources.batteryStorageCurrent + netPowerKw;
  newBattery = Math.max(0, Math.min(newBattery, current.subResources.batteryStorageMax));

  if (newBattery <= 0) {
    warnings.push('¡ALERTA CRÍTICA: Baterías agotadas! Los sistemas auxiliares operan en fallo por apagón.');
  }

  // 4. Life Support (ECLSS) Calculations
  // Oxygen:
  const o2CrewConsumption = crewCount * NASA_ECLSS_METRICS.OXYGEN_KG_PER_CREW_DAY;
  // Greenhouse produces O2 via photosynthesis (level * health * productionBonus)
  const o2GreenhouseGen = 1.2 * current.facilities.greenhouse.level * (current.facilities.greenhouse.health / 100) * productionBonus;
  // Sabatier / Electrolysis efficiency
  const o2EclssRecycled = o2CrewConsumption * 0.70 * (current.facilities.lifeSupport.health / 100) * lifeSupportPriorityMultiplier;
  const netO2Change = (o2GreenhouseGen + o2EclssRecycled) - o2CrewConsumption;
  let newOxygen = Math.max(0, Math.min(current.subResources.oxygenMax, current.subResources.oxygenCurrent + netO2Change));

  // Water:
  const waterCrewConsumption = crewCount * NASA_ECLSS_METRICS.WATER_L_PER_CREW_DAY;
  const waterRecycled = waterCrewConsumption * current.subResources.waterRecyclingEfficiency * (current.facilities.lifeSupport.health / 100);
  const waterGreenhouseUse = (current.facilities.greenhouse.health > 20 ? 4.0 : 1.0) * (current.policy === 'PRODUCTION' ? 1.4 : 1.0);
  const netWaterChange = waterRecycled - (waterCrewConsumption + waterGreenhouseUse);
  let newWater = Math.max(0, Math.min(current.subResources.waterMax, current.subResources.waterCurrent + netWaterChange));

  // Food:
  const foodCrewConsumption = crewCount * NASA_ECLSS_METRICS.FOOD_KG_PER_CREW_DAY;
  const foodGreenhouseProduction = 1.8 * current.facilities.greenhouse.level * (current.facilities.greenhouse.health / 100) * productionBonus;
  const netFoodChange = foodGreenhouseProduction - foodCrewConsumption;
  let newFood = Math.max(0, Math.min(current.subResources.foodMax, current.subResources.foodCurrent + netFoodChange));

  // 5. Radiation Calculations
  const backgroundMsv = current.planet.id === 'mars' 
    ? NASA_ECLSS_METRICS.BACKGROUND_MARS_MSV_PER_CYCLE 
    : NASA_ECLSS_METRICS.BACKGROUND_MOON_MSV_PER_CYCLE;

  const effectiveShield = Math.min(1.0, (current.subResources.shieldIntegrity / 100) + radiationShieldBonus);
  const attenuatedMsv = Math.max(0.05, backgroundMsv * (1.0 - (effectiveShield * 0.88)));
  const accumulatedRadiation = current.subResources.radiationExposureAccumulated + attenuatedMsv;

  // 6. Facility Wear & Tear
  const nextFacilities: ColonyFacilities = { ...current.facilities };
  const baseWear = 1.8 * wearMultiplier;

  for (const key of Object.keys(nextFacilities) as (keyof ColonyFacilities)[]) {
    const mod = { ...nextFacilities[key] };
    // Solar panels degrade slightly more on Mars due to abrasive dust
    const extraDustWear = (current.planet.id === 'mars' && key === 'solarArray') ? 1.0 : 0.0;
    mod.health = Math.max(0, Math.round((mod.health - (baseWear + extraDustWear)) * 10) / 10);
    
    // Status update based on health
    if (mod.health <= 25) {
      mod.status = 'critical';
      warnings.push(`¡Avería inminente en ${mod.name}! Salud al ${mod.health}%`);
    } else if (mod.health <= 60) {
      mod.status = 'damaged';
    } else if (mod.level > 1) {
      mod.status = 'upgraded';
    } else {
      mod.status = 'operational';
    }
    nextFacilities[key] = mod;
  }

  // 7. Crew Health & Morale Update
  const updatedCrew = current.crew.map((member) => {
    // If already deceased, health remains 0
    if (member.health <= 0) {
      return {
        ...member,
        health: 0,
        morale: 0,
        status: 'critical' as const,
      };
    }

    let healthDelta = 0;
    let moraleDelta = 0;

    // Lack of O2 causes immediate suffocation / severe injury
    if (newOxygen <= 5) healthDelta -= 40;
    else if (newOxygen <= 15) healthDelta -= 15;

    // Lack of water causes rapid dehydration
    if (newWater <= 10) healthDelta -= 25;

    // Lack of food causes starvation & morale drop
    if (newFood <= 10) {
      healthDelta -= 8;
      moraleDelta -= 20;
    }

    // High radiation penalties
    if (accumulatedRadiation > 25) healthDelta -= 5;
    if (accumulatedRadiation > 50) healthDelta -= 15;

    // Blackout penalty
    if (newBattery <= 0) {
      moraleDelta -= 15;
      healthDelta -= 5;
    }

    // Positive recovery if resources are abundant and health < 100
    if (newOxygen > 40 && newWater > 80 && newFood > 60 && newBattery > 100 && member.health < 100) {
      healthDelta += 4;
      moraleDelta += 3;
    }

    const nextHealth = Math.max(0, Math.min(100, Math.round(member.health + healthDelta)));
    const nextMorale = Math.max(0, Math.min(100, Math.round(member.morale + moraleDelta)));

    let status: 'healthy' | 'stressed' | 'injured' | 'critical' = 'healthy';
    if (nextHealth <= 25) status = 'critical';
    else if (nextHealth <= 60) status = 'injured';
    else if (nextMorale <= 40) status = 'stressed';

    return {
      ...member,
      health: nextHealth,
      morale: nextMorale,
      status,
    };
  });

  // 8. Shield Integrity slight regeneration or decay
  let newShieldIntegrity = current.subResources.shieldIntegrity;
  if (current.facilities.radiationShield.health > 70) {
    newShieldIntegrity = Math.min(100, newShieldIntegrity + 1);
  } else if (current.facilities.radiationShield.health < 40) {
    newShieldIntegrity = Math.max(10, newShieldIntegrity - 3);
  }

  // 9. Aggregate Indexes
  const energyPercent = Math.round((newBattery / current.subResources.batteryStorageMax) * 100);
  const o2Ratio = newOxygen / current.subResources.oxygenMax;
  const waterRatio = newWater / current.subResources.waterMax;
  const foodRatio = newFood / current.subResources.foodMax;
  const lifeSupportPercent = Math.round(((o2Ratio + waterRatio + foodRatio) / 3) * 100);
  const radiationProtectionPercent = Math.round(newShieldIntegrity);

  // 10. Check Defeat or Victory Conditions
  let nextStatus = current.status;
  let defeatCause: DefeatCause | null = null;
  let victorySummary: VictorySummary | null = null;

  const aliveCrew = updatedCrew.filter((c) => c.health > 0);

  if (aliveCrew.length === 0) {
    nextStatus = 'defeat';
    defeatCause = {
      title: 'FALLO CATASTRÓFICO: PÉRDIDA TOTAL DE LA TRIPULACIÓN',
      reason: 'Todos los astronautas han sucumbido debido al colapso sostenido de los sistemas vitales.',
      criticalMetric: 'Salud de la Tripulación: 0%',
      sequenceOfEvents: [
        'Los niveles de soporte vital o protección ambiental decayeron por debajo de umbrales tolerables.',
        'La exposición prolongada a hipoxia, deshidratación o estrés severo provocó el cese de signos vitales.',
        'La base ha quedado desierta y en modo de conservación automatizada.',
      ],
      stemExplanation:
        'En medicina aeroespacial, el cuerpo humano requiere una presión parcial de oxígeno mínima de 19.5 kPa y al menos 2.5 L diarios de hidratación. La privación de O2 genera daño cerebral irreversible en minutos, mientras que la falta de agua es letal en 3 a 5 días.',
      recommendations: [
        'Mantén siempre reservas de O2 por encima de 25 kg y repara de inmediato el módulo ECLSS.',
        'Utiliza el MODO SUPERVIVENCIA ante cortes de energía para desviar cada watt al soporte vital.',
        'No permitas que las baterías lleguen a 0; apaga laboratorios secundarios si es necesario.',
      ],
    };
  } else if (newOxygen <= 0) {
    nextStatus = 'defeat';
    defeatCause = {
      title: 'ASFIXIA COLECTIVA: RESERVA DE OXÍGENO AGOTADA',
      reason: 'La presión parcial de oxígeno cayó por debajo del límite de hipoxia letal en todos los hábitats.',
      criticalMetric: 'Oxígeno: 0.00 kg',
      sequenceOfEvents: [
        'El consumo metabólico de la tripulación superó la tasa de reciclaje y reposición.',
        'Los tanques criogénicos de O2 se vaciaron por completo.',
        'Los sistemas de emergencia no pudieron compensar la demanda respiratoria.',
      ],
      stemExplanation:
        'El sistema ECLSS de la NASA recicla CO2 exhalado utilizando la reacción Sabatier y electrólisis de agua. Si falla el suministro eléctrico o se descalibra el catalizador de rutenio, la acumulación de dióxido de carbono y la caída de O2 provocan narcosis y asfixia en cuestión de horas.',
      recommendations: [
        'Mejora el módulo ECLSS para aumentar la tasa de recuperación de oxígeno al 95%.',
        'Amplía el invernadero para contar con fotosíntesis biológica redundante.',
      ],
    };
  } else if (newWater <= 0) {
    nextStatus = 'defeat';
    defeatCause = {
      title: 'COLAPSO POR DESHIDRATACIÓN: RESERVAS DE AGUA NULAS',
      reason: 'El puesto de avanzada se ha quedado sin agua potable y el circuito de refrigeración colapsó.',
      criticalMetric: 'Agua: 0.00 Litros',
      sequenceOfEvents: [
        'El procesador de orina y agua gris sufrió una avería o no recibió suficiente energía.',
        'Las reservas estratégicas se consumieron sin alcanzar el punto de reabastecimiento.',
      ],
      stemExplanation:
        'El agua en el espacio no solo hidrata a la tripulación: es el fluido caloportador del control térmico y el precursor del oxígeno mediante electrólisis ($2H_2O \\rightarrow 2H_2 + O_2$). Su agotamiento precipita el colapso de toda la arquitectura vital.',
      recommendations: [
        'Ejecuta misiones de perforación de hielo subterráneo o aumenta la eficiencia de reciclaje por encima del 90%.',
      ],
    };
  } else if (current.cycle + 1 > current.maxCycles) {
    // VICTORY ACHIEVED!
    nextStatus = 'victory';
    const totalGenEst = (current.history.reduce((acc, h) => acc + h.energyProducedKw, 0) + totalPowerGenKw);
    const avgHealth = Math.round(aliveCrew.reduce((acc, c) => acc + c.health, 0) / aliveCrew.length);
    const finalScore = Math.round(
      (aliveCrew.length * 1500) + 
      (newBattery * 2) + 
      (newOxygen * 10) + 
      (newWater * 8) + 
      (newFood * 6) + 
      (current.mainResources.credits * 1.5) +
      (avgHealth * 20)
    );

    victorySummary = {
      finalScore,
      survivingCrewCount: aliveCrew.length,
      cyclesCompleted: 15,
      totalEnergyGenerated: Math.round(totalGenEst),
      waterRecycledPercent: Math.round(current.subResources.waterRecyclingEfficiency * 100),
      scientificBreakthroughs: current.stemDiscoveriesUnlocked.length,
      stemKeyTakeaways: [
        'Demostraste el principio de redundancia aeroespacial en soporte vital (ECLSS).',
        'Equilibraste la generación solar variable con la capacidad de almacenamiento en baterías.',
        'La mitigación de radiación mediante regolito protegió la salud genómica de tu tripulación.',
        'Optimizaste el ciclo cerrado de reciclaje biológico y químico sostenible.',
      ],
    };
  }

  const nextCycle = current.cycle + 1;

  const telemetry: CycleTelemetryRecord = {
    cycle: current.cycle,
    energyProducedKw: totalPowerGenKw,
    energyConsumedKw: totalPowerConsumptionKw,
    batteryStored: Math.round(newBattery),
    oxygen: Math.round(newOxygen * 10) / 10,
    water: Math.round(newWater * 10) / 10,
    food: Math.round(newFood * 10) / 10,
    radiationFlux: Math.round(attenuatedMsv * 100) / 100,
    shieldIntegrity: Math.round(newShieldIntegrity),
    credits: current.mainResources.credits,
    crewAverageHealth: Math.round(updatedCrew.reduce((a, b) => a + b.health, 0) / updatedCrew.length),
    activePolicy: current.policy,
  };

  const nextState: GameState = {
    ...current,
    status: nextStatus,
    cycle: nextStatus === 'playing' ? nextCycle : current.cycle,
    crew: updatedCrew,
    facilities: nextFacilities,
    subResources: {
      ...current.subResources,
      oxygenCurrent: Math.round(newOxygen * 10) / 10,
      waterCurrent: Math.round(newWater * 10) / 10,
      foodCurrent: Math.round(newFood * 10) / 10,
      batteryStorageCurrent: Math.round(newBattery * 10) / 10,
      radiationExposureAccumulated: Math.round(accumulatedRadiation * 100) / 100,
      currentCycleRadiationFlux: Math.round(attenuatedMsv * 100) / 100,
      shieldIntegrity: Math.round(newShieldIntegrity),
    },
    mainResources: {
      energyPercent,
      powerGenerationKw: totalPowerGenKw,
      powerConsumptionKw: totalPowerConsumptionKw,
      lifeSupportPercent,
      radiationProtectionPercent,
      credits: current.mainResources.credits,
    },
    history: [...current.history, telemetry],
    defeatCause,
    victorySummary,
  };

  return {
    nextState,
    telemetry,
    warnings,
  };
}
