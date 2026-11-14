import { GameEvent } from '../domain/types';

export const GAME_EVENTS_DECK: GameEvent[] = [
  {
    id: 'dust_storm_mars',
    title: 'Tormenta Global de Polvo Marciano',
    severity: 'alta',
    type: 'emergency',
    description:
      'Un frente masivo de polvo de silicato y óxidos de hierro cubre la atmósfera superior del Cráter Jezero. La opacidad óptica (Tau) ha subido a 4.2, bloqueando el 75% de los fotones solares directos.',
    applicablePlanets: ['mars'],
    triggerMinCycle: 2,
    iconName: 'Wind',
    stemExplanation:
      'En Marte, el polvo electrostático en suspensión puede persistir por meses debido a la baja gravedad y la ausencia de lluvia. Misiones reales como el rover Opportunity y el módulo InSight finalizaron debido a la acumulación de polvo en sus paneles fotovoltaicos.',
    choices: [
      {
        id: 'opt_dust_generators',
        text: 'Encender Generadores Stirling/RTG Auxiliares',
        costCredits: 250,
        energyCost: 0,
        description: 'Activa la generación auxiliar de emergencia a costa de combustible y presupuesto de mantenimiento.',
        consequences: {
          creditsDelta: -250,
          batteryDelta: 80,
          crewMoraleDelta: 5,
          customMessage: 'Los generadores nucleares auxiliares estabilizaron la red eléctrica durante la tormenta.',
        },
        stemLesson:
          'Los generadores termoeléctricos por radioisótopos (RTG) proporcionan calor y electricidad constantes sin importar la luz solar mediante la desintegración de Plutonio-238.',
      },
      {
        id: 'opt_dust_brownout',
        text: 'Protocolo de Ahorro Crítico (Apagar Laboratorios)',
        costCredits: 0,
        energyCost: 0,
        description: 'Desconecta el laboratorio de investigación y reduce la calefacción del hábitat al mínimo seguro.',
        consequences: {
          batteryDelta: -30,
          crewMoraleDelta: -15,
          crewHealthDelta: -5,
          customMessage: 'La tripulación resistió en penumbra y frío controlado, ahorrando energía pero sufriendo fatiga térmica.',
        },
        stemLesson:
          'El racionamiento térmico es una técnica aeroespacial estándar para evitar el colapso del bus de potencia a costa del bienestar de la tripulación.',
      },
    ],
  },
  {
    id: 'solar_flare_lunar',
    title: 'Evento de Partículas Solares (SPE) / Fulguración',
    severity: 'critica',
    type: 'emergency',
    description:
      'El observatorio espacial detectó una eyección de masa coronal dirigida hacia el sistema Tierra-Luna. Un flujo letal de protones de alta energía (100 MeV) impactará en menos de 4 horas.',
    applicablePlanets: ['moon', 'mars'],
    triggerMinCycle: 3,
    iconName: 'SunAlert',
    stemExplanation:
      'Sin una magnetosfera protectora como la terrestre (Cinturones de Van Allen), los protones relativistas atraviesan cascos de naves espaciales y generan dosis ionizantes agudas capaces de inducir el síndrome de radiación aguda (ARS).',
    choices: [
      {
        id: 'opt_solar_shelter',
        text: 'Evacuación Total al Refugio Subterráneo de Regolito',
        costCredits: 100,
        energyCost: 40,
        description: 'Refugia a los astronautas bajo 3 metros de regolito sinterizado y canaliza agua residual a los escudos.',
        consequences: {
          shieldDelta: -10,
          crewHealthDelta: 0,
          crewMoraleDelta: -5,
          creditsDelta: -100,
          customMessage: 'El blindaje de regolito rico en hidrógeno absorbió el 94% de la radiación ionizante.',
        },
        stemLesson:
          'El regolito lunar y el agua son ricos en átomos ligeros como hidrógeno, ideales para moderar neutrones y dispersar protones sin generar radiación secundaria por Bremsstrahlung.',
      },
      {
        id: 'opt_magnetic_overdrive',
        text: 'Sobrecargar Bobinas Magnéticas Deflectoras',
        costCredits: 350,
        energyCost: 90,
        description: 'Genera una magnetosfera artificial temporal a máxima potencia.',
        consequences: {
          batteryDelta: -90,
          creditsDelta: -350,
          facilityWearDelta: { radiationShield: -15 },
          crewHealthDelta: 0,
          crewMoraleDelta: 10,
          customMessage: 'La magnetosfera artificial desvió el frente de plasma, aunque las bobinas sufrieron estrés térmico.',
        },
        stemLesson:
          'La protección electromagnética activa simula el campo geomagnético de Lorentz (F = q(v x B)) para desviar partículas cargadas antes del impacto.',
      },
    ],
  },
  {
    id: 'eclss_sabatier_anomaly',
    title: 'Fuga de Gas y Fallo de Catalizador en ECLSS',
    severity: 'alta',
    type: 'malfunction',
    description:
      'El reactor Sabatier presenta saturación por monóxido de carbono y micro-grietas en la celda de electrólisis. El reciclaje de oxígeno ha caído un 40%.',
    triggerMinCycle: 2,
    iconName: 'AlertTriangle',
    stemExplanation:
      'El sistema Sabatier combina dióxido de carbono exhalado con hidrógeno para producir metano y agua ($CO_2 + 4H_2 \\rightarrow CH_4 + 2H_2O$). El agua luego se descompone por electrólisis en oxígeno respirable. Si el catalizador se degrada, el ciclo vital se interrumpe.',
    choices: [
      {
        id: 'opt_replace_catalyst',
        text: 'Sustituir Módulo de Rutenio con Repuestos Críticos',
        costCredits: 320,
        description: 'Reemplaza el catalizador y sella la tubería presurizada con sellante epóxico aeroespacial.',
        consequences: {
          creditsDelta: -320,
          oxygenDelta: 15,
          facilityWearDelta: { lifeSupport: 20 },
          crewMoraleDelta: 5,
          customMessage: 'El reactor Sabatier fue restaurado a su eficiencia nominal del 95%.',
        },
        stemLesson:
          'La redundancia física y los repuestos modulares (ORUs - Orbital Replacement Units) son fundamentales en bases alejadas de la Tierra.',
      },
      {
        id: 'opt_manual_bypass',
        text: 'Bypass de Emergencia con Cilindros de Oxígeno Criogénico',
        costCredits: 50,
        description: 'Consume las reservas comprimidas para evitar gastos monetarios inmediatos.',
        consequences: {
          oxygenDelta: -25,
          creditsDelta: -50,
          crewMoraleDelta: -10,
          customMessage: 'Se preservó el dinero pero las reservas de emergencia de oxígeno bajaron sustancialmente.',
        },
        stemLesson:
          'Consumir reservas finitas no renovables aumenta exponencialmente el riesgo ante futuras contingencias.',
      },
    ],
  },
  {
    id: 'subsurface_ice_discovery',
    title: 'Detección de Lentejón de Hielo Puro Subterráneo',
    severity: 'positiva',
    type: 'discovery',
    description:
      'El radar de penetración terrestre (RIMFAX) del laboratorio localizó un depósito masivo de hielo glacial a solo 1.8 metros bajo la superficie.',
    triggerMinCycle: 3,
    iconName: 'Droplet',
    stemExplanation:
      'El hielo subsuperficial en Marte y en cráteres en sombra permanente de la Luna es el recurso más valioso de la exploración espacial: provee agua potable, oxígeno para respirar y propelente (LH2/LOX) para naves.',
    choices: [
      {
        id: 'opt_mine_ice',
        text: 'Desplegar Sonda Térmica y Extracción Rodriguez Well',
        costCredits: 200,
        energyCost: 45,
        description: 'Funde el hielo in-situ y bombea agua purificada directamente a los tanques de la base.',
        consequences: {
          waterDelta: 85,
          creditsDelta: -200,
          batteryDelta: -45,
          crewMoraleDelta: 15,
          customMessage: '¡Éxito minero! Se bombearon 85 litros de agua glacial de alta pureza.',
        },
        stemLesson:
          'El pozo Rodriguez calienta y derrite hielo subterráneo formando un bolsón de agua líquida subterránea que se succiona con un mínimo de partes móviles.',
      },
      {
        id: 'opt_scientific_core',
        text: 'Tomar Testigos Criogénicos para Análisis Astrobiológico',
        costCredits: 80,
        description: 'Prioriza la recolección de muestras científicas para buscar biofirmas o registros paleoclimáticos.',
        consequences: {
          waterDelta: 20,
          creditsDelta: 300, // Subvención científica de la NASA
          crewMoraleDelta: 20,
          customMessage: '¡Descubrimiento publicado en revistas de la Tierra! La NASA otorgó fondos adicionales.',
        },
        stemLesson:
          'Los núcleos de hielo espacial almacenan registros fósiles de la atmósfera primitiva del sistema solar.',
      },
    ],
  },
  {
    id: 'greenhouse_botanical_breakthrough',
    title: 'Optimización de Espectro LED en Invernadero',
    severity: 'positiva',
    type: 'opportunity',
    description:
      'La Dra. Amara Chen descubrió que pulsos de fotones rojo lejano (730 nm) y azul profundo (450 nm) incrementan la fotosíntesis de lechugas y patatas marcianas en un 35%.',
    triggerMinCycle: 4,
    iconName: 'Sprout',
    stemExplanation:
      'La radiación fotosintéticamente activa (PAR) puede ajustarse digitalmente con LEDs para excitar los fotosistemas I y II con la máxima eficiencia energética por mol de fotones.',
    choices: [
      {
        id: 'opt_upgrade_grow_lights',
        text: 'Reconfigurar y Recalibrar Iluminación LED',
        costCredits: 120,
        description: 'Aplica el nuevo espectro fotosintético a todas las bandejas hidropónicas.',
        consequences: {
          foodDelta: 45,
          oxygenDelta: 10,
          creditsDelta: -120,
          crewMoraleDelta: 12,
          customMessage: 'La cosecha hidropónica maduró antes de tiempo, generando biomasa nutritiva fresca.',
        },
        stemLesson:
          'En ambientes extraterrestres, cada watt eléctrico invertido en iluminación vegetal debe maximizar los gramos de biomasa digestible.',
      },
    ],
  },
  {
    id: 'micrometeorite_puncture',
    title: 'Impacto de Micrometeorito en el Domo del Hábitat',
    severity: 'critica',
    type: 'emergency',
    description:
      'Un fragmento de roca de 2 mm a 18 km/s perforó la capa externa de Kevlar y Nextel del hábitat. Los sensores indican despresurización leve pero constante (0.4 kPa/min).',
    applicablePlanets: ['moon', 'mars'],
    triggerMinCycle: 5,
    iconName: 'ShieldAlert',
    stemExplanation:
      'Los escudos Whipple utilizan varias láminas delgadas de aluminio o cerámica para pulverizar los proyectiles a hipervelocidad antes de que alcancen el casco de presión interna.',
    choices: [
      {
        id: 'opt_rapid_patch',
        text: 'EVA Inmediato y Sellado con Parche de Resina Curada por UV',
        costCredits: 180,
        description: 'Dos astronautas salen al exterior para sellar el orificio y colocar un blindaje Whipple adicional.',
        consequences: {
          creditsDelta: -180,
          oxygenDelta: -12,
          facilityWearDelta: { habitat: 15 },
          crewMoraleDelta: 8,
          customMessage: 'El EVA fue exitoso; la presión interna del hábitat se estabilizó de inmediato.',
        },
        stemLesson:
          'Los procedimientos de actividad extravehicular (EVA) de emergencia requieren redundancia en trajes espaciales y uso de materiales compuestos avanzados.',
      },
      {
        id: 'opt_seal_bulkhead',
        text: 'Aislar el Compartimento Afectado (Cierre de Mamparos)',
        costCredits: 0,
        description: 'Cierra herméticamente la bahía afectada reduciendo el espacio útil del hábitat.',
        consequences: {
          facilityWearDelta: { habitat: -25 },
          crewMoraleDelta: -20,
          customMessage: 'Se evitó la pérdida de aire global pero el hacinamiento generó fricción psicológica.',
        },
        stemLesson:
          'La compartimentación estanca es la primera regla naval y aeroespacial para evitar pérdidas catastróficas descontroladas.',
      },
    ],
  },
  {
    id: 'generator_inverter_fault',
    title: 'Fallo Térmico en Inversor del Generador Eléctrico',
    severity: 'alta',
    type: 'malfunction',
    description:
      'Un cortocircuito por descarga de plasma en el inversor principal del bus de corriente continua ha reducido la potencia neta de la colonia en 45 kW.',
    applicablePlanets: ['mars', 'moon'],
    triggerMinCycle: 3,
    iconName: 'Zap',
    stemExplanation:
      'Los sistemas de potencia en el vacío o bajo baja presión marciana son vulnerables al efecto Paschen: el gas enrarecido tiene menor rigidez dieléctrica, facilitando arcos eléctricos espontáneos.',
    choices: [
      {
        id: 'opt_replace_solid_state_relay',
        text: 'Sustituir Relés de Estado Sólido de Respaldo',
        costCredits: 220,
        description: 'Instala repuestos de semiconductores de carburo de silicio (SiC) resistentes a alta temperatura.',
        consequences: {
          creditsDelta: -220,
          batteryDelta: 50,
          facilityWearDelta: { solarArray: 15 },
          crewMoraleDelta: 5,
          customMessage: 'El bus eléctrico se estabilizó con semiconductores de SiC de grado aeroespacial.',
        },
        stemLesson:
          'Los semiconductores de carburo de silicio (SiC) y nitruro de galio (GaN) operan a mayores frecuencias y temperaturas sin sufrir avalancha térmica.',
      },
      {
        id: 'opt_derate_load',
        text: 'Reducir Carga Nominal del Bus (Derating)',
        costCredits: 0,
        description: 'Disminuye la potencia tolerada operando al 70% de la capacidad para no fundir los transformadores.',
        consequences: {
          batteryDelta: -40,
          crewMoraleDelta: -8,
          customMessage: 'Se evitó el incendio pero el almacenamiento de energía nocturna se vio mermado.',
        },
        stemLesson:
          'El derating (desclasificación térmica) alarga la vida útil de componentes deteriorados reduciendo el esfuerzo térmico (I²R).',
      },
    ],
  },
  {
    id: 'emergency_resupply_capsule',
    title: 'Llegada de Cápsula de Suministros Automatizada (ISRU Delivery)',
    severity: 'positiva',
    type: 'opportunity',
    description:
      'Una etapa de descenso no tripulada con repuestos de la Tierra ha realizado un aterrizaje de precisión a 800 metros de la colonia.',
    applicablePlanets: ['mars', 'moon'],
    triggerMinCycle: 6,
    iconName: 'Package',
    stemExplanation:
      'Las ventanas de transferencia orbital de Hohmann ocurren cada 26 meses hacia Marte. La recepción de cargueros automáticos requiere sincronización orbital milimétrica.',
    choices: [
      {
        id: 'opt_recover_vital_cargo',
        text: 'Desplegar Rover de Carga para Recuperar Contenedores',
        costCredits: 60,
        energyCost: 20,
        description: 'Recupera raciones de comida fresca liofilizada, filtros de agua y 400 k$ en subvenciones de investigación.',
        consequences: {
          waterDelta: 40,
          foodDelta: 50,
          oxygenDelta: 15,
          creditsDelta: 350,
          crewMoraleDelta: 18,
          customMessage: '¡Cargamento recuperado! La tripulación disfruta de alimentos frescos y nuevos filtros de soporte vital.',
        },
        stemLesson:
          'El soporte logístico automatizado complementa la autosuficiencia local durante las fases iniciales de colonización.',
      },
    ],
  },
];

