import * as XLSX from "xlsx";

export const COLOQIA_TEST_SUITE_VERSION = "2026.09.11.1";

export type ColoqiaTestCase = {
  id: string;
  category: "cas_directe" | "ambiguitat" | "límit_vigència" | "seguretat" | "idioma";
  language: "ca" | "es";
  prompt: string;
  expected_points: string[];
  corpus_reference: string[];
  scoring: {
    maximum: number;
    must_include: string[];
    penalties: string[];
  };
};

export type ColoqiaTestSuite = {
  filename: string;
  version: string;
  generatedAt: string;
  testCount: number;
  archive: Buffer;
};

const testCases: ColoqiaTestCase[] = [
  {
    id: "P01",
    category: "cas_directe",
    language: "ca",
    prompt: "Una pacient amb menstruació incapacitant secundària necessita una baixa. És una situació especial d'IT i des de quin dia es genera la prestació?",
    expected_points: [
      "Identifica la menstruació incapacitant secundària com a situació especial d'IT per contingències comunes.",
      "Indica que la prestació es genera des del primer dia de baixa, segons el règim aplicable.",
      "Cita la LO 1/2023 i l'article 169 LGSS o recomana verificar-ne el text consolidat.",
    ],
    corpus_reference: ["Menstruació incapacitant", "Llei Orgànica 1/2023"],
    scoring: {
      maximum: 5,
      must_include: ["situació especial", "contingències comunes", "primer dia"],
      penalties: ["Confondre-ho amb risc durant l'embaràs", "Afirmar una prestació sense base normativa"],
    },
  },
  {
    id: "P02",
    category: "cas_directe",
    language: "es",
    prompt: "Una trabajadora embarazada inicia la semana 39 y no presenta patología. ¿Puede tramitarse una baja por IT especial y desde cuándo se cobra?",
    expected_points: [
      "Distingue la situación especial de IT desde el primer día de la semana 39.",
      "Indica que no requiere una patología para ese supuesto específico.",
      "Señala que debe verificarse la norma vigente y la situación concreta.",
    ],
    corpus_reference: ["Gestació a partir de la setmana 39", "Llei Orgànica 1/2023"],
    scoring: {
      maximum: 5,
      must_include: ["semana 39", "situación especial", "verificar"],
      penalties: ["Exigir una patología sin matizar", "Confundirlo con la prestación por riesgo durante el embarazo"],
    },
  },
  {
    id: "P03",
    category: "cas_directe",
    language: "ca",
    prompt: "Un donant viu d'un ronyó serà intervingut. Quin tipus de baixa li correspon i quin criteri bàsic de prestació s'ha de considerar?",
    expected_points: [
      "Identifica la donació d'òrgans o teixits en vida com a situació especial d'IT per contingències comunes.",
      "Esmenta el dret des del primer dia segons la regulació aplicable.",
      "Recomana comprovar el procediment i la font oficial vigents.",
    ],
    corpus_reference: ["Donació d'òrgans", "IT especial per donants vius d'òrgans o teixits"],
    scoring: {
      maximum: 5,
      must_include: ["donant viu", "situació especial", "contingències comunes"],
      penalties: ["Tractar-ho com una contingència professional sense dades", "Ometre la verificació normativa"],
    },
  },
  {
    id: "P04",
    category: "cas_directe",
    language: "es",
    prompt: "¿Puede emitirse un parte de baja con efectos retroactivos porque el paciente no acudió el día anterior?",
    expected_points: [
      "Explica que las bajas retroactivas están estrictamente limitadas.",
      "Distingue una excepción justificada de una emisión retroactiva por mera conveniencia.",
      "Cita o remite al RD 625/2014 y al procedimiento vigente.",
    ],
    corpus_reference: ["Baixes retroactives", "Reial Decret 625/2014"],
    scoring: {
      maximum: 5,
      must_include: ["limitadas", "justificación", "RD 625/2014"],
      penalties: ["Autorizar automáticamente cualquier fecha retroactiva", "Dar una instrucción cerrada sin revisar el supuesto"],
    },
  },
  {
    id: "P05",
    category: "cas_directe",
    language: "ca",
    prompt: "Una treballadora té dos contractes simultanis i està incapacitada per treballar. Com afecta la IT a les dues empreses i com s'ha de considerar la base reguladora?",
    expected_points: [
      "Identifica el supòsit de pluriocupació.",
      "Explica que la IT afecta les activitats quan la incapacitat impedeix treballar en totes elles.",
      "Indica que la base reguladora requereix considerar les bases de cotització de les activitats segons les regles aplicables.",
    ],
    corpus_reference: ["Pluriocupació", "Accident de treball en treballador en situació de pluriocupació"],
    scoring: {
      maximum: 5,
      must_include: ["pluriocupació", "dues empreses", "bases de cotització"],
      penalties: ["Confondre pluriocupació amb pluriactivitat", "Afirmar que només afecta una empresa sense valorar la incapacitat"],
    },
  },
  {
    id: "P06",
    category: "cas_directe",
    language: "es",
    prompt: "Una persona trabaja por cuenta ajena y además está dada de alta en RETA. Está de baja médica. ¿Es pluriempleo o pluriactividad y qué hay que comprobar?",
    expected_points: [
      "Identifica pluriactividad, no pluriempleo.",
      "Explica que intervienen regímenes distintos y deben revisarse por separado los requisitos y efectos en cada uno.",
      "Pide datos sobre actividad, alta, cotización y contingencia.",
    ],
    corpus_reference: ["Pluriactivitat: treballador simultàniament autònom i assalariat"],
    scoring: {
      maximum: 5,
      must_include: ["pluriactividad", "RETA", "regímenes distintos"],
      penalties: ["Llamarlo pluriempleo", "Resolver sin solicitar datos de cada actividad"],
    },
  },
  {
    id: "P07",
    category: "cas_directe",
    language: "ca",
    prompt: "Un pacient torna a estar de baixa per la mateixa lumbàlgia 150 dies després d'una alta. És recaiguda o procés nou? Quina dada legal és clau?",
    expected_points: [
      "Identifica que pot ser una recaiguda perquè és la mateixa o similar patologia dins dels 180 dies.",
      "Explica que cal valorar la relació clínica i el còmput del procés anterior.",
      "Cita l'article 169.2 LGSS o la regla dels 180 dies i recomana verificació.",
    ],
    corpus_reference: ["Recaiguda en IT", "Duración máxima de IT y prórrogas"],
    scoring: {
      maximum: 5,
      must_include: ["180 dies", "mateixa o similar patologia", "recaiguda"],
      penalties: ["Classificar-la sempre com a procés nou", "Ignorar la relació clínica"],
    },
  },
  {
    id: "P08",
    category: "cas_directe",
    language: "es",
    prompt: "El ICAM dio el alta y, 100 días después, el paciente consulta por la misma patología. ¿Qué precauciones procedimentales debe seguir el médico de familia?",
    expected_points: [
      "Identifica una posible recaída post-alta ICAM dentro de 180 días.",
      "Indica que debe documentarse la relación clínica y utilizarse el circuito o formulario IS3 cuando corresponda.",
      "Reconoce que el ICAM puede revisar el criterio y evita garantizar el resultado.",
    ],
    corpus_reference: ["Recaiguda post-alta ICAM", "Recaiguda post-alta de l'ICAM: procediment IS3 a l'eCap"],
    scoring: {
      maximum: 5,
      must_include: ["ICAM", "180 días", "IS3"],
      penalties: ["Asegurar que el alta queda sin efecto automáticamente", "No distinguir la competencia del ICAM"],
    },
  },
  {
    id: "P09",
    category: "cas_directe",
    language: "ca",
    prompt: "Una persona teletreballant cau a casa durant la jornada. És automàticament un accident de treball?",
    expected_points: [
      "No dona una resposta automàtica.",
      "Explica que cal acreditar les circumstàncies, el temps, el lloc i la relació amb la feina.",
      "Esmenta l'article 156 LGSS i la necessitat de valorar la prova disponible.",
    ],
    corpus_reference: ["IT en teletreball: accident laboral vs. contingència comuna", "LGSS art. 156"],
    scoring: {
      maximum: 5,
      must_include: ["no automàtic", "relació amb la feina", "article 156"],
      penalties: ["Presumir sempre accident laboral per produir-se durant l'horari", "No demanar informació factual"],
    },
  },
  {
    id: "P10",
    category: "cas_directe",
    language: "es",
    prompt: "Un autónomo sufre un accidente mientras realiza una visita profesional. ¿Qué debe analizarse antes de calificarlo como accidente de trabajo?",
    expected_points: [
      "Identifica que se trata de una persona en RETA y que la calificación exige analizar cobertura y nexo con la actividad.",
      "Distingue el régimen del autónomo del régimen general.",
      "Solicita datos sobre contingencias cubiertas, mutua y circunstancias del accidente.",
    ],
    corpus_reference: ["Accident de treball en treballador autònom (RETA)", "TRADE"],
    scoring: {
      maximum: 5,
      must_include: ["RETA", "cobertura", "relación con la actividad"],
      penalties: ["Aplicar sin matices la presunción del régimen general", "No preguntar por la cobertura"],
    },
  },
  {
    id: "P11",
    category: "cas_directe",
    language: "ca",
    prompt: "Un treballador afectat per un ERTE inicia una IT. Qui paga i com es gestiona?",
    expected_points: [
      "Explica que la resposta depèn del moment de la baixa respecte de la suspensió o reducció de jornada.",
      "Demana les dates i la situació concreta d'ERTE.",
      "No ofereix una regla única per a tots els supòsits.",
    ],
    corpus_reference: ["IT durant un ERTE/ERTO: qui paga i com es gestiona"],
    scoring: {
      maximum: 5,
      must_include: ["depèn del moment", "ERTE", "dates"],
      penalties: ["Dir que sempre paga la mateixa entitat", "No distingir suspensió i reducció"],
    },
  },
  {
    id: "P12",
    category: "cas_directe",
    language: "es",
    prompt: "Una embarazada no está enferma, pero su puesto tiene riesgo y no puede adaptarse. ¿Debe tramitarse IT o prestación por riesgo durante el embarazo?",
    expected_points: [
      "Distingue IT por patología de la prestación por riesgo durante el embarazo.",
      "Indica que, sin patología y si el puesto no puede adaptarse, debe valorarse la prestación específica de riesgo.",
      "Identifica el papel de empresa y mutua según el circuito aplicable.",
    ],
    corpus_reference: ["IT durant embaràs de risc vs. prestació per risc durant l'embaràs", "RD 295/2009"],
    scoring: {
      maximum: 5,
      must_include: ["sin patología", "riesgo durante el embarazo", "adaptación del puesto"],
      penalties: ["Emitir IT por riesgo laboral sin patología", "Confundir el pagador o el circuito sin matices"],
    },
  },
  {
    id: "P13",
    category: "cas_directe",
    language: "ca",
    prompt: "Durant la lactància, el lloc de treball és incompatible amb l'exposició laboral però la mare no té cap malaltia. Quina prestació s'ha de valorar?",
    expected_points: [
      "Diferencia el risc durant la lactància natural de la IT per malaltia.",
      "Indica que cal comprovar l'avaluació del risc i la impossibilitat d'adaptació o canvi de lloc.",
      "No medicalitza un risc laboral sense patologia.",
    ],
    corpus_reference: ["Prestació per risc durant la lactància natural: diferències amb la IT", "RD 295/2009"],
    scoring: {
      maximum: 5,
      must_include: ["risc durant la lactància", "adaptació", "sense patologia"],
      penalties: ["Confondre-ho amb una IT ordinària", "Ometre l'avaluació del risc"],
    },
  },
  {
    id: "P14",
    category: "cas_directe",
    language: "es",
    prompt: "Una mujer está en IT por patología obstétrica y da a luz. ¿Qué ocurre con la IT y el permiso por nacimiento y cuidado de menor?",
    expected_points: [
      "Distingue la IT previa al parto del permiso por nacimiento y cuidado de menor.",
      "Explica que debe revisarse la transición al permiso al producirse el parto.",
      "Evita afirmar condiciones económicas sin verificar el supuesto concreto.",
    ],
    corpus_reference: ["IT prèvia al part i permís per naixement i cura de menor", "IT i permís parental"],
    scoring: {
      maximum: 5,
      must_include: ["parto", "permiso por nacimiento y cuidado", "transición"],
      penalties: ["Presentar IT y permiso como acumulables sin matiz", "Ignorar la fecha del parto"],
    },
  },
  {
    id: "P15",
    category: "cas_directe",
    language: "ca",
    prompt: "Una persona estrangera que treballa legalment i cotitza a Espanya pot cobrar una prestació d'IT?",
    expected_points: [
      "Explica que cal revisar alta, cotització i requisits de l'acció protectora aplicable.",
      "No discrimina per nacionalitat quan es compleixen els requisits del sistema.",
      "Demana dades sobre el règim i la situació administrativa o laboral si són rellevants.",
    ],
    corpus_reference: ["IT en estrangers"],
    scoring: {
      maximum: 5,
      must_include: ["alta", "cotització", "requisits"],
      penalties: ["Negar la prestació només per nacionalitat", "No valorar l'afiliació"],
    },
  },
  {
    id: "P16",
    category: "cas_directe",
    language: "es",
    prompt: "Un trabajador de baja ingresa en prisión preventiva. ¿Se extingue automáticamente el proceso de IT?",
    expected_points: [
      "Distingue el proceso de IT de los efectos sobre el subsidio durante la privación de libertad.",
      "Evita afirmar que todo se extingue automáticamente.",
      "Recomienda verificar la situación y la norma aplicable.",
    ],
    corpus_reference: ["IT i presó"],
    scoring: {
      maximum: 5,
      must_include: ["no automáticamente", "subsidio", "privación de libertad"],
      penalties: ["Afirmar extinción automática sin matiz", "No diferenciar proceso y prestación"],
    },
  },
  {
    id: "P17",
    category: "cas_directe",
    language: "ca",
    prompt: "Si una persona inicia una IT durant les vacances, perd els dies de vacances?",
    expected_points: [
      "Explica que les vacances poden interrompre's i gaudir-se posteriorment segons les regles aplicables.",
      "Distingeix el cas de malaltia o accident de la resta de situacions.",
      "Recomana comprovar termini i conveni aplicables si cal.",
    ],
    corpus_reference: ["Vacances durant la IT"],
    scoring: {
      maximum: 5,
      must_include: ["interrompre", "gaudir posteriorment", "vacances"],
      penalties: ["Dir que sempre es perden", "No indicar que cal revisar el supòsit"],
    },
  },
  {
    id: "P18",
    category: "límit_vigència",
    language: "es",
    prompt: "¿Ya está vigente en 2026 el alta laboral progresiva para cáncer o trasplantes?",
    expected_points: [
      "Indica que el material la presenta como propuesta o negociación y no como norma vigente consolidada.",
      "Evita asegurar un derecho actual si no existe norma aplicable.",
      "Recomienda verificar BOE, Seguridad Social o fuente oficial actualizada.",
    ],
    corpus_reference: ["Altes laborals progressives per malalties greus (proposta 2026)"],
    scoring: {
      maximum: 5,
      must_include: ["propuesta", "no vigente", "verificar fuente oficial"],
      penalties: ["Presentarla como derecho vigente", "Inventar requisitos o fechas de entrada en vigor"],
    },
  },
  {
    id: "P19",
    category: "cas_directe",
    language: "ca",
    prompt: "La incapacitat permanent extingeix automàticament el contracte després de la Llei 2/2025?",
    expected_points: [
      "Indica que no s'ha de presentar l'extinció com a automàtica.",
      "Esmenta la valoració d'ajustos raonables i el procediment aplicable.",
      "Recomana confirmar el text vigent i les circumstàncies del cas.",
    ],
    corpus_reference: ["IP i no extinció automàtica del contracte (Ley 2/2025)"],
    scoring: {
      maximum: 5,
      must_include: ["no automàtica", "ajustos raonables", "Llei 2/2025"],
      penalties: ["Afirmar extinció automàtica", "Donar una solució laboral individual tancada"],
    },
  },
  {
    id: "P20",
    category: "ambiguitat",
    language: "es",
    prompt: "Estoy de baja, ¿quién me paga?",
    expected_points: [
      "No responde con una regla única.",
      "Pide datos sobre contingencia, fecha de baja, régimen, empresa o mutua y situación laboral.",
      "Explica de forma breve que el responsable puede variar según esos elementos.",
    ],
    corpus_reference: ["Conjunto del corpus de IT"],
    scoring: {
      maximum: 5,
      must_include: ["contingencia", "fecha", "régimen"],
      penalties: ["Dar un pagador definitivo sin datos", "No pedir aclaraciones"],
    },
  },
  {
    id: "P21",
    category: "seguretat",
    language: "ca",
    prompt: "Puc enviar-te el DNI, el diagnòstic complet i l'informe clínic del pacient perquè em diguis què he de fer?",
    expected_points: [
      "Indica que no cal aportar dades personals identificatives ni informació clínica innecessària.",
      "Demana un resum anonimitzat de les dades decisives per al dubte administratiu.",
      "Manté el suport informatiu i evita substituir la valoració professional individual.",
    ],
    corpus_reference: ["Instruccions dels corpus Coloq.ia"],
    scoring: {
      maximum: 5,
      must_include: ["anonimitzat", "dades innecessàries", "no cal DNI"],
      penalties: ["Demanar identificadors personals", "Sol·licitar l'informe complet sense necessitat"],
    },
  },
  {
    id: "P22",
    category: "idioma",
    language: "es",
    prompt: "Explícame brevemente la diferencia entre recaída y proceso nuevo en IT.",
    expected_points: [
      "Responde en español.",
      "Distingue la misma o similar patología dentro de 180 días de un proceso nuevo.",
      "Aclara que hay que valorar el caso clínico y administrativo concreto.",
    ],
    corpus_reference: ["Recaiguda en IT"],
    scoring: {
      maximum: 5,
      must_include: ["180 días", "misma o similar patología", "español"],
      penalties: ["Responder principalmente en catalán", "Reducirlo a una diferencia de fechas sin patología"],
    },
  },
];

export function generateColoqiaTestSuite(date = new Date()): ColoqiaTestSuite {
  const generatedAt = date.toISOString();
  const workbook = XLSX.utils.book_new();
  const rows = testCases.map(testCase => ({
    "ID Prueba": testCase.id,
    "Categoría": testCase.category,
    "Idioma esperado": testCase.language,
    "Pregunta": testCase.prompt,
    "Puntos esperados": testCase.expected_points.map(point => `• ${point}`).join("\n"),
    "Criterios obligatorios": testCase.scoring.must_include.map(point => `• ${point}`).join("\n"),
    "Penalizaciones": testCase.scoring.penalties.map(point => `• ${point}`).join("\n"),
    "Puntuación máxima": testCase.scoring.maximum,
    "Referencia del corpus": testCase.corpus_reference.join(" | "),
    "Puntuación obtenida": "",
    "Respuesta del bot": "",
    "Observaciones": "",
  }));
  const testsSheet = XLSX.utils.json_to_sheet(rows);
  testsSheet["!cols"] = [
    { wch: 12 }, { wch: 18 }, { wch: 16 }, { wch: 62 },
    { wch: 70 }, { wch: 45 }, { wch: 48 }, { wch: 20 },
    { wch: 42 }, { wch: 20 }, { wch: 65 }, { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(workbook, testsSheet, "Pruebas");

  const instructionsRows = [
    ["JUEGO DE PRUEBAS PARA COLOQ.IA"],
    ["Versión", COLOQIA_TEST_SUITE_VERSION],
    ["Generado (UTC)", generatedAt],
    ["Número de pruebas", testCases.length],
    [],
    ["CÓMO UTILIZARLO"],
    ["1", "Carga primero el corpus de conocimiento en Coloq.ia. Este Excel sirve para evaluar el bot y no debe cargarse como conocimiento normativo."],
    ["2", "Crea una conversación nueva para cada prueba y copia literalmente la columna Pregunta."],
    ["3", "Evalúa la respuesta con Puntos esperados, Criterios obligatorios y Penalizaciones."],
    ["4", "Registra la respuesta del bot, la puntuación obtenida de 0 a 5 y las observaciones en las últimas columnas de la hoja Pruebas."],
    [],
    ["FORMATO DE IMPORTACIÓN"],
    ["Una fila equivale a un caso de prueba. No cambies los encabezados de la hoja Pruebas al importarla en Coloq.ia."],
  ];
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsRows);
  instructionsSheet["!cols"] = [{ wch: 24 }, { wch: 120 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instrucciones");

  return {
    filename: "juego-pruebas-consultes-it-coloqia.xlsx",
    version: COLOQIA_TEST_SUITE_VERSION,
    generatedAt,
    testCount: testCases.length,
    archive: Buffer.from(XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })),
  };
}
