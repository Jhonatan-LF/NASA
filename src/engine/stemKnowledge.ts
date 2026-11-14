export interface STEMCard {
  id: string;
  title: string;
  category: 'ECLSS y Soporte Vital' | 'Energía y Fotónica' | 'Radiación y Física Espacial' | 'Ingeniería y Materiales';
  summary: string;
  keyQuestion: string;
  detailedExplanation: string;
  realWorldMissionExample: string;
  diagramConcept?: string;
  tags: string[];
}

export interface STEMGlossaryTerm {
  term: string;
  definition: string;
  realContext: string;
}

export const STEM_KNOWLEDGE_CARDS: STEMCard[] = [
  {
    id: 'eclss_water_recovery',
    title: 'Reciclaje de Agua y Ciclo Cerrado (ECLSS)',
    category: 'ECLSS y Soporte Vital',
    keyQuestion: '¿Por qué es indispensable reciclar más del 90% del agua en una colonia espacial?',
    summary:
      'Lanzar agua desde la Tierra cuesta miles de dólares por kilogramo. Un sistema de ciclo cerrado convierte orina, condensación del sudor y agua gris en agua ultrapura.',
    detailedExplanation:
      'Cada ser humano requiere aproximadamente 2.5 litros de agua al día para beber, más agua para higiene y preparación de alimentos deshidratados. En una misión de 4 tripulantes durante un año, esto requeriría transportar más de 3,650 kg de agua solo para consumo directo. Transportar esa masa a Marte mediante cohetes convencionales exigiría cientos de toneladas de combustible extra en la Tierra debido a la Ecuación del Cohete de Tsiolkovski. Por tanto, el sistema ECLSS (Environmental Control and Life Support System) procesa orina mediante destilación rotativa al vacío (VPA), filtración por lecho catalítico y ósmosis inversa para alcanzar una pureza superior a la de la mayoría de las aguas embotelladas terrestres.',
    realWorldMissionExample:
      'En la Estación Espacial Internacional (ISS), el sistema Water Recovery System (WRS) procesa el sudor, la humedad ambiental y la orina de los astronautas, alcanzando una tasa de recuperación superior al 93-98%. Como bromean los astronautas: "¡El café de hoy es el café de mañana!".',
    tags: ['ECLSS', 'Ósmosis Inversa', 'Tsiolkovski', 'Ciclo Cerrado'],
  },
  {
    id: 'space_radiation_hazards',
    title: 'Peligros de la Radiación Cósmica y Blindaje Activo',
    category: 'Radiación y Física Espacial',
    keyQuestion: '¿Por qué la radiación ionizante es letal y cómo nos protegen el regolito y el hidrógeno?',
    summary:
      'En el espacio interplanetario y en la superficie lunar o marciana no hay campo magnético protector global ni atmósfera densa contra rayos cósmicos.',
    detailedExplanation:
      'Existen dos fuentes principales de radiación ionizante: los Rayos Cósmicos Galácticos (GCR) —partículas HZE de alta energía provenientes de supernovas lejanas— y los Eventos de Partículas Solares (SPE) —protones eyectados durante tormentas solares—. Cuando estas partículas cargadas atraviesan el tejido humano, rompen las hélices dobles de ADN celular e ionizan átomos, provocando desde fatiga y náuseas hasta cáncer o síndrome agudo de radiación. Paradójicamente, blindar naves con plomo o metales pesados es peligroso: cuando un protón relativista choca contra un núcleo pesado de plomo, genera una cascada de rayos gamma y neutrones secundarios llamada "Bremsstrahlung" (radiación de frenado). Por eso, los mejores escudos son materiales ricos en núcleos ligeros de hidrógeno (como agua, polietileno o regolito rico en basaltos).',
    realWorldMissionExample:
      'El Curiosity Rover de la NASA midió durante su viaje a Marte (instrumento RAD) una dosis acumulada de aproximadamente 1.84 mSv por día. El blindaje de futuras bases en Marte contempla sepultar los hábitats bajo 2 a 3 metros de regolito compactado para reducir la radiación a niveles terrestres seguros.',
    tags: ['Radiación', 'GCR', 'SPE', 'Bremsstrahlung', 'Regolito'],
  },
  {
    id: 'solar_efficiency_degradation',
    title: 'Energía Fotovoltaica en Ambientes Extraterrestres',
    category: 'Energía y Fotónica',
    keyQuestion: '¿Por qué los paneles solares pierden rendimiento y cómo se mitiga el polvo marciano?',
    summary:
      'La irradiancia solar decrece con la distancia al Sol (Ley del Cuadrado Inverso) y el polvo electrostático bloquea los fotones.',
    detailedExplanation:
      'La radiación solar en la órbita terrestre es de ~1361 W/m² (Constante Solar). En Marte, al estar 1.52 veces más lejos del Sol, la irradiancia se reduce según la ley de la inversa del cuadrado: I = I_0 / (r^2), resultando en solo unos 590 W/m² en el cenit. Además, las partículas de polvo de óxido de hierro en Marte tienen un tamaño de apenas 2 a 5 micrómetros y están cargadas electrostáticamente por el viento y la radiación ultravioleta. Al adherirse a las superficies vítreas de los paneles, incrementan la profundidad óptica (tau), reduciendo la captación fotónica a menos del 20%. Para contrarrestarlo se investigan películas piezoeléctricas autolimpiantes (EDS) y generación nuclear complementaria (reactores Kilopower / RTGs).',
    realWorldMissionExample:
      'El módulo InSight de la NASA en Marte cesó sus operaciones en 2022 tras 4 años debido a que el polvo redujo su generación diaria de 5,000 Wh a apenas 500 Wh, impidiendo alimentar sus sismógrafos.',
    tags: ['Fotovoltaica', 'Inversa del Cuadrado', 'Polvo Electrostático', 'Kilopower'],
  },
  {
    id: 'aerospace_redundancy_principles',
    title: 'Ingeniería de Confiabilidad y Redundancia Crítica',
    category: 'Ingeniería y Materiales',
    keyQuestion: '¿Por qué un sistema aeroespacial nunca debe tener un punto único de fallo (Single Point of Failure)?',
    summary:
      'La arquitectura aeroespacial aplica el criterio "Fail-Safe": si una bomba o computadora colapsa, otra toma el relevo automáticamente.',
    detailedExplanation:
      'En misiones donde la ayuda está a millones de kilómetros y meses de distancia, un único componente defectuoso puede condenar a toda la expedición. La ingeniería de sistemas espaciales sigue la filosofía TMR (Triple Modular Redundancy): tres canales idénticos procesan la misma telemetría y un circuito de votación mayoritaria descarta lecturas anómalas causadas por impactos de iones pesados (Single Event Upsets - SEU). De igual manera, el soporte vital no confía únicamente en plantas biológicas; mantiene tanques de oxígeno líquido criogénico de reserva y generadores de oxígeno químico de estado sólido (velas de perclorato).',
    realWorldMissionExample:
      'El transbordador espacial de la NASA operaba con cinco ordenadores IBM idénticos: cuatro ejecutaban código primario sincronizado y un quinto ejecutaba software independiente de respaldo.',
    tags: ['Redundancia TMR', 'Fail-Safe', 'SEU', 'Punto Único de Fallo'],
  },
  {
    id: 'bioregenerative_photosynthesis',
    title: 'Invernaderos Hidropónicos y Fotosíntesis en el Espacio',
    category: 'ECLSS y Soporte Vital',
    keyQuestion: '¿Cómo las plantas convierten CO2 y agua en comida y oxígeno fresco?',
    summary:
      'La fotosíntesis vegetal actúa como una máquina biológica de regeneración: 6CO2 + 6H2O + luz -> C6H12O6 + 6O2.',
    detailedExplanation:
      'Los sistemas biorregenerativos integran la biología en el control ambiental. Los astronautas exhalan aproximadamente 1 kg de CO2 por día. En lugar de atraparlo en zeolitas desechables, las plantas lo absorben a través de sus estomas durante el ciclo de Calvin para sintetizar carbohidratos, liberando moléculas de O2 puro procedentes de la fotólisis del agua. El uso de hidroponía y aeroponía sin tierra mineral evita la toxicidad de las sales de perclorato presentes en el regolito crudo marciano, mientras que luces LED ajustadas a longitudes de onda específicas optimizan el rendimiento fotosintético por kilovatio consumido.',
    realWorldMissionExample:
      'En el experimento "Veggie" y el Advanced Plant Habitat (APH) de la NASA en la ISS, los astronautas han cosechado con éxito lechugas Mizuna, rábanos y chiles, demostrando que la dieta fresca es vital tanto para la nutrición con polifenoles como para la salud psicológica de la tripulación.',
    tags: ['Fotosíntesis', 'Aeroponía', 'Percloratos', 'Ciclo de Calvin'],
  },
];

export const STEM_GLOSSARY: STEMGlossaryTerm[] = [
  {
    term: 'ECLSS',
    definition: 'Environmental Control and Life Support System (Sistema de Control Ambiental y Soporte Vital). Conjunto de equipos que proveen aire respirable, agua purificada, control térmico y gestión de desechos.',
    realContext: 'Utilizado en la Estación Espacial Internacional, cápsula Orión y futuras bases del programa Artemisa.',
  },
  {
    term: 'ISRU',
    definition: 'In-Situ Resource Utilization (Utilización de Recursos In-Situ). Aprovechamiento de materiales del lugar (como hielo, CO2 o rocas locales) para fabricar agua, oxígeno, combustible y materiales de construcción sin traerlos de la Tierra.',
    realContext: 'El instrumento MOXIE en el rover Perseverance extrajo con éxito oxígeno respirable directamente de la atmósfera de CO2 de Marte.',
  },
  {
    term: 'Reacción Sabatier',
    definition: 'Reacción termocatalítica donde CO2 reacciona con gas H2 a 400°C sobre un catalizador de rutenio o níquel para producir gas metano (CH4) y agua líquida (H2O): CO2 + 4H2 -> CH4 + 2H2O.',
    realContext: 'Pieza angular del módulo ECLSS de la ISS para cerrar el ciclo de oxígeno y agua.',
  },
  {
    term: 'MiliSievert (mSv)',
    definition: 'Unidad de dosis de radiación ionizante absorbida por el tejido biológico ponderada por el daño relativo. Una radiografía de tórax equivale a ~0.1 mSv.',
    realContext: 'Los astronautas en espacio profundo reciben entre 1.5 y 2.0 mSv/día sin blindaje. El límite de carrera de la NASA está en torno a 600 mSv.',
  },
  {
    term: 'Regolito',
    definition: 'Capa superficial de polvo fino, fragmentos de roca y minerales fragmentados que cubre la roca madre en la Luna y Marte. Formado por miles de millones de años de bombardeo de meteoritos.',
    realContext: 'Excelente material de construcción para sinterizar ladrillos y blindaje contra la radiación.',
  },
  {
    term: 'Sol',
    definition: 'Un día solar en Marte, equivalente a 24 horas, 39 minutos y 35 segundos terrestres.',
    realContext: 'Los ingenieros de la NASA y los rovers sincronizan sus horarios de trabajo en la Tierra con los soles marcianos.',
  },
  {
    term: 'Escudo Whipple',
    definition: 'Dispositivo de blindaje contra micrometeoritos y basura espacial compuesto por láminas delgadas de sacrificio separadas por espacio vacío para desintegrar proyectiles a hipervelocidad.',
    realContext: 'Protege todos los módulos presurizados de la Estación Espacial Internacional y la nave Orión.',
  },
  {
    term: 'Efecto Paschen',
    definition: 'Ley física que describe el voltaje de ruptura dieléctrica de un gas en función de la presión y la distancia. A la presión marciana (~6 mbar), el aire se ioniza con mucha mayor facilidad generando arcos eléctricos destructivos.',
    realContext: 'Obliga a aislar y encapsular herméticamente todo el cableado eléctrico de alto voltaje en rovers y hábitats marcianos.',
  },
  {
    term: 'Bremsstrahlung (Radiación de Frenado)',
    definition: 'Radiación electromagnética (rayos X y gamma) producida por la deceleración súbita de partículas cargadas (como electrones o protones cósmicos) al atravesar el campo electromagnético de núcleos atómicos pesados como el plomo.',
    realContext: 'Explica por qué los metales pesados no se usan como blindaje primario en naves tripuladas y se prefieren materiales ricos en hidrógeno como el agua y el plástico polietileno.',
  },
];

