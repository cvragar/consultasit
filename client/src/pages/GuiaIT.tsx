import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, RotateCcw, Home, CheckCircle2, AlertTriangle, Info, ChevronRight, Stethoscope, FileText, Clock, Shield, HelpCircle } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useT } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

// ─── Tipus ────────────────────────────────────────────────────
interface Step {
  id: string;
  title: string;
  description: string;
  content: string;
  tips?: string[];
  warning?: string;
  links?: { label: string; href: string }[];
}

interface Decision {
  question: string;
  options: { label: string; nextStepId: string; description?: string }[];
}

type FlowNode = { type: "step"; data: Step } | { type: "decision"; data: Decision };

// ─── Dades del flux (CA) ──────────────────────────────────────
const flowCA: Record<string, FlowNode> = {
  start: {
    type: "step",
    data: {
      id: "start",
      title: "Inici: Pacient sol·licita baixa mèdica",
      description: "El pacient acudeix a consulta amb una patologia que pot requerir Incapacitat Temporal.",
      content: "El primer pas és avaluar si el pacient compleix els requisits per a una IT:\n\n**Requisits bàsics:**\n- Estar afiliat i en alta (o situació assimilada) a la Seguretat Social\n- Tenir una patologia que impedeixi temporalment el treball habitual\n- Per contingència comuna: mínim 180 dies cotitzats en els últims 5 anys\n- Per contingència professional: no es requereix període mínim de cotització",
      tips: [
        "Comprova a eCap si el pacient té processos d'IT previs recents (<180 dies) per detectar possibles recaigudes",
        "Verifica el règim de la Seguretat Social del pacient (general, autònoms, etc.)"
      ],
    }
  },
  decision_contingencia: {
    type: "decision",
    data: {
      question: "Quin tipus de contingència és?",
      options: [
        { label: "Contingència comuna (CC)", nextStepId: "cc_baixa", description: "Malaltia comuna o accident no laboral" },
        { label: "Accident de treball (AT)", nextStepId: "at_baixa", description: "Lesió per causa del treball (inclou in itinere)" },
        { label: "Malaltia professional (MP)", nextStepId: "mp_baixa", description: "Malaltia causada per l'activitat laboral (RD 1299/2006)" },
      ]
    }
  },
  cc_baixa: {
    type: "step",
    data: {
      id: "cc_baixa",
      title: "Emissió del comunicat de baixa (CC)",
      description: "Emetem el comunicat de baixa per contingència comuna a eCap.",
      content: "**Procediment a eCap:**\n\n1. Accedeix al mòdul d'IT del pacient\n2. Selecciona \"Nou comunicat de baixa\"\n3. Indica el diagnòstic (CIE-10) i la durada estimada\n4. El sistema genera automàticament el comunicat de baixa\n5. Lliura la còpia al pacient\n\n**Prestació econòmica (CC):**\n- Dies 1-3: sense prestació (a càrrec de l'empresa)\n- Dies 4-20: 60% de la base reguladora\n- Des del dia 21: 75% de la base reguladora",
      tips: [
        "La durada estimada ha de ser coherent amb el Manual de Tiempos Óptimos de l'INSS",
        "Si el pacient és autònom, la prestació comença des del dia 4 (sense els 3 dies d'espera si té cobertura de mútua)"
      ],
      warning: "Si el sistema detecta un procés previ <180 dies per la mateixa patologia, es marcarà com a RECAIGUDA. En aquest cas, els dies anteriors sumen al còmput total.",
      links: [
        { label: "Calculadora de durada d'IT", href: "/calculadora" },
        { label: "Cas especial: Recaigudes", href: "/casos-especials" }
      ]
    }
  },
  at_baixa: {
    type: "step",
    data: {
      id: "at_baixa",
      title: "Emissió del comunicat de baixa (AT)",
      description: "Gestió de la baixa per accident de treball.",
      content: "**Important:** En cas d'accident de treball, la gestió correspon principalment a la **mútua col·laboradora**.\n\n**Procediment:**\n1. Si el pacient acudeix a urgències/CAP, estabilitzar i derivar a la mútua\n2. Si la mútua no és accessible, el metge de família pot emetre un comunicat de baixa provisional a eCap\n3. Indicar clarament que es tracta d'AT al comunicat\n4. La mútua assumirà la gestió posterior\n\n**Prestació econòmica (AT):**\n- Des del dia 2: 75% de la base reguladora (a càrrec de la mútua)\n- El dia de l'accident: salari íntegre a càrrec de l'empresa",
      tips: [
        "L'accident in itinere (anada/tornada del treball) també es considera AT",
        "Si hi ha dubte sobre si és AT o CC, emetre com a CC i el pacient pot sol·licitar determinació de contingència"
      ],
      links: [
        { label: "Casos AT", href: "/casos-especials" },
        { label: "Reclamacions", href: "/reclamacions" }
      ]
    }
  },
  mp_baixa: {
    type: "step",
    data: {
      id: "mp_baixa",
      title: "Emissió del comunicat de baixa (MP)",
      description: "Gestió de la baixa per malaltia professional.",
      content: "**La malaltia professional** està regulada pel RD 1299/2006 (quadre de malalties professionals).\n\n**Procediment:**\n1. Sospita clínica: el metge de família identifica una possible MP\n2. Emetre comunicat de baixa provisional a eCap (indicant sospita de MP)\n3. Derivar a la mútua col·laboradora per a la qualificació\n4. La mútua investiga i confirma o descarta la MP\n5. Si es confirma, la mútua assumeix la gestió\n\n**Prestació econòmica (MP):**\n- Igual que AT: 75% BR des del dia 2\n- Dia de la baixa: salari íntegre a càrrec de l'empresa",
      tips: [
        "Exemples freqüents en sanitaris: punxada accidental amb agulla contaminada (Hepatitis B, Grup 3A)",
        "El metge de família pot emetre la baixa com a CC inicialment i després sol·licitar canvi de contingència"
      ],
      links: [
        { label: "Cas: Malaltia professional en sanitaris", href: "/casos-especials" },
        { label: "Documents normatius", href: "/documents" }
      ]
    }
  },
  decision_seguiment: {
    type: "decision",
    data: {
      question: "Quin és el següent pas en el seguiment?",
      options: [
        { label: "Emetre comunicat de confirmació", nextStepId: "confirmacio", description: "Control periòdic habitual" },
        { label: "Emetre alta mèdica", nextStepId: "alta", description: "El pacient pot tornar a treballar" },
        { label: "Sol·licitar pròrroga (>365 dies)", nextStepId: "prorroga", description: "El procés supera els 365 dies" },
        { label: "Gestionar una recaiguda", nextStepId: "recaiguda", description: "Nova baixa <180 dies post-alta" },
      ]
    }
  },
  confirmacio: {
    type: "step",
    data: {
      id: "confirmacio",
      title: "Comunicat de confirmació",
      description: "Control periòdic del procés d'IT.",
      content: "**Periodicitat dels comunicats de confirmació (RD 625/2014):**\n\n| Durada estimada | Periodicitat |\n|---|---|\n| ≤ 5 dies naturals | No cal confirmació (alta al final) |\n| 5-30 dies naturals | Primer als 7 dies, després cada 14 dies |\n| 31-60 dies naturals | Primer als 7 dies, després cada 28 dies |\n| > 61 dies naturals | Primer als 14 dies, després cada 35 dies |\n\n**A eCap:**\n1. Accedeix al procés d'IT actiu del pacient\n2. Selecciona \"Comunicat de confirmació\"\n3. Actualitza el diagnòstic si cal\n4. Indica la nova durada estimada\n5. El sistema calcula automàticament la propera data de confirmació",
      tips: [
        "Si la durada estimada canvia significativament, actualitza-la al comunicat de confirmació",
        "eCap avisa automàticament quan s'acosta la data del proper comunicat"
      ],
    }
  },
  alta: {
    type: "step",
    data: {
      id: "alta",
      title: "Emissió de l'alta mèdica",
      description: "El pacient es recupera i pot tornar a treballar.",
      content: "**Qui pot emetre l'alta?**\n\n| Qui | Quan |\n|---|---|\n| Metge de família | En qualsevol moment (CC) |\n| Mútua | AT/MP, o CC si gestiona la prestació |\n| ICAM | Per inspecció o proposta d'alta |\n| INSS | En qualsevol moment, per sobre de tots |\n\n**Procediment a eCap:**\n1. Accedeix al procés d'IT actiu\n2. Selecciona \"Comunicat d'alta\"\n3. Indica el motiu d'alta (curació, millora, incompareixença, etc.)\n4. El sistema tanca el procés\n5. Lliura la còpia al pacient\n\n**Important:** L'alta té efectes el dia següent a la seva emissió. El pacient ha d'incorporar-se al treball l'endemà.",
      tips: [
        "Si el pacient no està d'acord amb l'alta, pot reclamar (veure Reclamacions)",
        "Si l'alta la dóna l'ICAM o l'INSS, el metge de família no pot emetre nova baixa per la mateixa patologia sense autorització"
      ],
      warning: "Si el pacient torna amb la mateixa patologia dins dels 180 dies posteriors a l'alta, es considera RECAIGUDA (no procés nou).",
      links: [
        { label: "Reclamacions d'alta", href: "/reclamacions" },
        { label: "Cas: Recaiguda post-alta ICAM", href: "/casos-especials" }
      ]
    }
  },
  prorroga: {
    type: "step",
    data: {
      id: "prorroga",
      title: "Pròrroga de la IT (>365 dies)",
      description: "El procés supera la durada màxima estàndard de 365 dies.",
      content: "**Durada màxima de la IT:**\n- **365 dies naturals** des de la data de la baixa mèdica (durada estàndard)\n- **+180 dies** de primera pròrroga (total: 545 dies / 18 mesos) — decideix l'INSS\n- **+185 dies** de segona pròrroga excepcional (total: 730 dies / 24 mesos) — només en casos excepcionals\n\n**Procediment:**\n1. Abans d'arribar als 365 dies, l'INSS rep l'expedient\n2. L'INSS (via ICAM a Catalunya) avalua si cal prorrogar\n3. Si es proroga: el metge de família continua emetent comunicats de confirmació\n4. Si no es proroga: l'INSS emet alta o inicia valoració d'Incapacitat Permanent\n\n**A eCap:**\n- El sistema avisa quan s'acosta el dia 365\n- Cal preparar un informe clínic actualitzat per a l'INSS",
      tips: [
        "La pròrroga excepcional (+185 dies) és per a casos com neoplàsies, cirurgia major o malalties greus",
        "Si l'INSS denega la pròrroga, el pacient pot reclamar"
      ],
      links: [
        { label: "Calculadora de durada", href: "/calculadora" },
        { label: "Reclamacions", href: "/reclamacions" }
      ]
    }
  },
  recaiguda: {
    type: "step",
    data: {
      id: "recaiguda",
      title: "Gestió de la recaiguda",
      description: "Nova baixa per la mateixa patologia dins dels 180 dies posteriors a l'alta.",
      content: "**Definició:** Es considera recaiguda quan es produeix una nova baixa per la mateixa patologia o similar dins dels **180 dies naturals** posteriors a l'alta mèdica.\n\n**Procediment a eCap:**\n1. Emetre nou comunicat de baixa\n2. El sistema detecta automàticament la recaiguda i demana confirmació\n3. Els dies anteriors sumen al còmput total\n4. La base reguladora es manté la del procés original\n\n**Si l'alta va ser de l'ICAM:**\n- Cal enviar el formulari IS3 a l'ICAM\n- L'ICAM pot acceptar o rebutjar la recaiguda\n- Si rebutja, el pacient pot reclamar\n\n**Si han passat >180 dies:** Es considera procés nou (comença de zero).",
      warning: "Si els dies acumulats (procés anterior + recaiguda) superen 365 dies, cal autorització de l'INSS per prorrogar.",
      tips: [
        "Comprova sempre a eCap si hi ha processos previs recents abans d'emetre una nova baixa",
        "Si l'alta va ser de l'INSS (no ICAM), el metge de família NO pot emetre nova baixa sense autorització de l'INSS"
      ],
      links: [
        { label: "Cas: Recaiguda post-alta ICAM", href: "/casos-especials" },
        { label: "Reclamacions", href: "/reclamacions" }
      ]
    }
  },
};

// ─── Dades del flux (ES) ──────────────────────────────────────
const flowES: Record<string, FlowNode> = {
  start: {
    type: "step",
    data: {
      id: "start",
      title: "Inicio: Paciente solicita baja médica",
      description: "El paciente acude a consulta con una patología que puede requerir Incapacidad Temporal.",
      content: "El primer paso es evaluar si el paciente cumple los requisitos para una IT:\n\n**Requisitos básicos:**\n- Estar afiliado y en alta (o situación asimilada) en la Seguridad Social\n- Tener una patología que impida temporalmente el trabajo habitual\n- Para contingencia común: mínimo 180 días cotizados en los últimos 5 años\n- Para contingencia profesional: no se requiere período mínimo de cotización",
      tips: [
        "Comprueba en eCap si el paciente tiene procesos de IT previos recientes (<180 días) para detectar posibles recaídas",
        "Verifica el régimen de la Seguridad Social del paciente (general, autónomos, etc.)"
      ],
    }
  },
  decision_contingencia: {
    type: "decision",
    data: {
      question: "¿Qué tipo de contingencia es?",
      options: [
        { label: "Contingencia común (CC)", nextStepId: "cc_baixa", description: "Enfermedad común o accidente no laboral" },
        { label: "Accidente de trabajo (AT)", nextStepId: "at_baixa", description: "Lesión por causa del trabajo (incluye in itinere)" },
        { label: "Enfermedad profesional (EP)", nextStepId: "mp_baixa", description: "Enfermedad causada por la actividad laboral (RD 1299/2006)" },
      ]
    }
  },
  cc_baixa: {
    type: "step",
    data: {
      id: "cc_baixa",
      title: "Emisión del parte de baja (CC)",
      description: "Emitimos el parte de baja por contingencia común en eCap.",
      content: "**Procedimiento en eCap:**\n\n1. Accede al módulo de IT del paciente\n2. Selecciona \"Nuevo parte de baja\"\n3. Indica el diagnóstico (CIE-10) y la duración estimada\n4. El sistema genera automáticamente el parte de baja\n5. Entrega la copia al paciente\n\n**Prestación económica (CC):**\n- Días 1-3: sin prestación (a cargo de la empresa)\n- Días 4-20: 60% de la base reguladora\n- Desde el día 21: 75% de la base reguladora",
      tips: [
        "La duración estimada debe ser coherente con el Manual de Tiempos Óptimos del INSS",
        "Si el paciente es autónomo, la prestación comienza desde el día 4"
      ],
      warning: "Si el sistema detecta un proceso previo <180 días por la misma patología, se marcará como RECAÍDA.",
      links: [
        { label: "Calculadora de duración de IT", href: "/calculadora" },
        { label: "Caso especial: Recaídas", href: "/casos-especials" }
      ]
    }
  },
  at_baixa: {
    type: "step",
    data: {
      id: "at_baixa",
      title: "Emisión del parte de baja (AT)",
      description: "Gestión de la baja por accidente de trabajo.",
      content: "**Importante:** En caso de accidente de trabajo, la gestión corresponde principalmente a la **mutua colaboradora**.\n\n**Procedimiento:**\n1. Si el paciente acude a urgencias/CAP, estabilizar y derivar a la mutua\n2. Si la mutua no es accesible, el médico de familia puede emitir un parte de baja provisional en eCap\n3. Indicar claramente que se trata de AT\n4. La mutua asumirá la gestión posterior\n\n**Prestación económica (AT):**\n- Desde el día 2: 75% de la base reguladora (a cargo de la mutua)\n- El día del accidente: salario íntegro a cargo de la empresa",
      tips: [
        "El accidente in itinere (ida/vuelta del trabajo) también se considera AT",
        "Si hay duda sobre si es AT o CC, emitir como CC y el paciente puede solicitar determinación de contingencia"
      ],
      links: [
        { label: "Casos AT", href: "/casos-especials" },
        { label: "Reclamaciones", href: "/reclamacions" }
      ]
    }
  },
  mp_baixa: {
    type: "step",
    data: {
      id: "mp_baixa",
      title: "Emisión del parte de baja (EP)",
      description: "Gestión de la baja por enfermedad profesional.",
      content: "**La enfermedad profesional** está regulada por el RD 1299/2006.\n\n**Procedimiento:**\n1. Sospecha clínica: el médico de familia identifica una posible EP\n2. Emitir parte de baja provisional en eCap (indicando sospecha de EP)\n3. Derivar a la mutua colaboradora para la calificación\n4. La mutua investiga y confirma o descarta la EP\n5. Si se confirma, la mutua asume la gestión\n\n**Prestación económica (EP):**\n- Igual que AT: 75% BR desde el día 2",
      tips: [
        "Ejemplos frecuentes en sanitarios: pinchazo accidental con aguja contaminada (Hepatitis B, Grupo 3A)",
        "El médico de familia puede emitir la baja como CC inicialmente y después solicitar cambio de contingencia"
      ],
      links: [
        { label: "Caso: Enfermedad profesional en sanitarios", href: "/casos-especials" },
        { label: "Documentos normativos", href: "/documents" }
      ]
    }
  },
  decision_seguiment: {
    type: "decision",
    data: {
      question: "¿Cuál es el siguiente paso en el seguimiento?",
      options: [
        { label: "Emitir parte de confirmación", nextStepId: "confirmacio", description: "Control periódico habitual" },
        { label: "Emitir alta médica", nextStepId: "alta", description: "El paciente puede volver a trabajar" },
        { label: "Solicitar prórroga (>365 días)", nextStepId: "prorroga", description: "El proceso supera los 365 días" },
        { label: "Gestionar una recaída", nextStepId: "recaiguda", description: "Nueva baja <180 días post-alta" },
      ]
    }
  },
  confirmacio: {
    type: "step",
    data: {
      id: "confirmacio",
      title: "Parte de confirmación",
      description: "Control periódico del proceso de IT.",
      content: "**Periodicidad de los partes de confirmación (RD 625/2014):**\n\n| Duración estimada | Periodicidad |\n|---|---|\n| ≤ 5 días naturales | No necesita confirmación |\n| 5-30 días naturales | Primero a los 7 días, después cada 14 días |\n| 31-60 días naturales | Primero a los 7 días, después cada 28 días |\n| > 61 días naturales | Primero a los 14 días, después cada 35 días |",
      tips: [
        "Si la duración estimada cambia significativamente, actualízala en el parte de confirmación",
        "eCap avisa automáticamente cuando se acerca la fecha del próximo parte"
      ],
    }
  },
  alta: {
    type: "step",
    data: {
      id: "alta",
      title: "Emisión del alta médica",
      description: "El paciente se recupera y puede volver a trabajar.",
      content: "**¿Quién puede emitir el alta?**\n\n| Quién | Cuándo |\n|---|---|\n| Médico de familia | En cualquier momento (CC) |\n| Mutua | AT/EP, o CC si gestiona la prestación |\n| ICAM | Por inspección o propuesta de alta |\n| INSS | En cualquier momento, por encima de todos |",
      tips: [
        "Si el paciente no está de acuerdo con el alta, puede reclamar",
        "Si el alta la da el ICAM o el INSS, el médico de familia no puede emitir nueva baja por la misma patología sin autorización"
      ],
      warning: "Si el paciente vuelve con la misma patología dentro de los 180 días posteriores al alta, se considera RECAÍDA.",
      links: [
        { label: "Reclamaciones de alta", href: "/reclamacions" },
        { label: "Caso: Recaída post-alta ICAM", href: "/casos-especials" }
      ]
    }
  },
  prorroga: {
    type: "step",
    data: {
      id: "prorroga",
      title: "Prórroga de la IT (>365 días)",
      description: "El proceso supera la duración máxima estándar de 365 días.",
      content: "**Duración máxima de la IT:**\n- **365 días naturales** desde la fecha de la baja (duración estándar)\n- **+180 días** de primera prórroga (total: 545 días / 18 meses) — decide el INSS\n- **+185 días** de segunda prórroga excepcional (total: 730 días / 24 meses)",
      tips: [
        "La prórroga excepcional es para casos como neoplasias, cirugía mayor o enfermedades graves",
        "Si el INSS deniega la prórroga, el paciente puede reclamar"
      ],
      links: [
        { label: "Calculadora de duración", href: "/calculadora" },
        { label: "Reclamaciones", href: "/reclamacions" }
      ]
    }
  },
  recaiguda: {
    type: "step",
    data: {
      id: "recaiguda",
      title: "Gestión de la recaída",
      description: "Nueva baja por la misma patología dentro de los 180 días posteriores al alta.",
      content: "**Definición:** Se considera recaída cuando se produce una nueva baja por la misma patología o similar dentro de los **180 días naturales** posteriores al alta médica.\n\n**Si el alta fue del ICAM:**\n- Hay que enviar el formulario IS3 al ICAM\n- El ICAM puede aceptar o rechazar la recaída",
      warning: "Si los días acumulados superan 365 días, se necesita autorización del INSS.",
      tips: [
        "Comprueba siempre en eCap si hay procesos previos recientes antes de emitir una nueva baja",
        "Si el alta fue del INSS, el médico de familia NO puede emitir nueva baja sin autorización del INSS"
      ],
      links: [
        { label: "Caso: Recaída post-alta ICAM", href: "/casos-especials" },
        { label: "Reclamaciones", href: "/reclamacions" }
      ]
    }
  },
};

// ─── Flux de navegació ────────────────────────────────────────
const flowOrder = [
  "start",
  "decision_contingencia",
  // cc_baixa | at_baixa | mp_baixa (depèn de la decisió)
  "decision_seguiment",
  // confirmacio | alta | prorroga | recaiguda (depèn de la decisió)
];

// ─── Component principal ──────────────────────────────────────
export default function GuiaIT() {
  const { language } = useT();
  const flow = language === "ca" ? flowCA : flowES;

  useSEO({
    title: language === "ca"
      ? "Guia interactiva de gestió d'IT — Consultes IT"
      : "Guía interactiva de gestión de IT — Consultas IT",
    description: language === "ca"
      ? "Assistent visual pas a pas per a la gestió d'Incapacitat Temporal: des del diagnòstic fins a l'alta."
      : "Asistente visual paso a paso para la gestión de Incapacidad Temporal: desde el diagnóstico hasta el alta.",
    canonicalPath: "/guia-it",
    keywords: language === "ca"
      ? "guia IT, gestió incapacitat temporal, pas a pas, baixa mèdica, eCap, comunicat de baixa"
      : "guía IT, gestión incapacidad temporal, paso a paso, baja médica, eCap, parte de baja",
  });

  const [history, setHistory] = useState<string[]>(["start"]);
  const currentId = history[history.length - 1];
  const currentNode = flow[currentId];

  const goTo = (stepId: string) => {
    setHistory(prev => [...prev, stepId]);
  };

  const goBack = () => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const restart = () => {
    setHistory(["start"]);
  };

  // Determinar el "next" natural del flux
  const getNextStepId = (): string | null => {
    const idx = flowOrder.indexOf(currentId);
    if (idx >= 0 && idx < flowOrder.length - 1) {
      return flowOrder[idx + 1];
    }
    // Si estem en un pas de contingència, anar a decision_seguiment
    if (["cc_baixa", "at_baixa", "mp_baixa"].includes(currentId)) {
      return "decision_seguiment";
    }
    return null;
  };

  const nextStepId = getNextStepId();
  const progressSteps = [
    { id: "start", label: language === "ca" ? "Inici" : "Inicio", icon: Stethoscope },
    { id: "contingencia", label: language === "ca" ? "Contingència" : "Contingencia", icon: Shield },
    { id: "baixa", label: language === "ca" ? "Baixa" : "Baja", icon: FileText },
    { id: "seguiment", label: language === "ca" ? "Seguiment" : "Seguimiento", icon: Clock },
  ];

  const getProgressIndex = (): number => {
    if (currentId === "start") return 0;
    if (currentId === "decision_contingencia") return 1;
    if (["cc_baixa", "at_baixa", "mp_baixa"].includes(currentId)) return 2;
    return 3;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Home className="h-4 w-4" />
                {language === "ca" ? "Inici" : "Inicio"}
              </Button>
            </Link>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">
                {language === "ca" ? "Guia interactiva de gestió d'IT" : "Guía interactiva de gestión de IT"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-4xl">
        {/* Barra de progrés */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {progressSteps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i <= getProgressIndex();
              const isCurrent = i === getProgressIndex();
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`flex items-center gap-2 ${isCurrent ? "text-primary font-semibold" : isActive ? "text-primary/70" : "text-muted-foreground"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent ? "bg-primary text-white shadow-lg scale-110" :
                      isActive ? "bg-primary/20 text-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs hidden sm:inline">{step.label}</span>
                  </div>
                  {i < progressSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-all ${isActive ? "bg-primary/40" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contingut del pas actual */}
        {currentNode?.type === "step" && (
          <StepView
            step={currentNode.data}
            language={language}
            onNext={nextStepId ? () => goTo(nextStepId) : undefined}
            onBack={history.length > 1 ? goBack : undefined}
            onRestart={restart}
            isFirst={history.length === 1}
          />
        )}

        {currentNode?.type === "decision" && (
          <DecisionView
            decision={currentNode.data}
            language={language}
            onSelect={goTo}
            onBack={history.length > 1 ? goBack : undefined}
            onRestart={restart}
          />
        )}

        {/* Historial de navegació */}
        {history.length > 1 && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {language === "ca" ? "Recorregut:" : "Recorrido:"}
            </p>
            <div className="flex flex-wrap items-center gap-1">
              {history.map((stepId, i) => {
                const node = flow[stepId];
                const label = node?.type === "step" ? node.data.title.split(":")[0] : 
                              node?.type === "decision" ? (node.data.question.length > 30 ? node.data.question.substring(0, 30) + "..." : node.data.question) : stepId;
                return (
                  <span key={i} className="flex items-center gap-1">
                    <Badge variant={i === history.length - 1 ? "default" : "outline"} className="text-xs">
                      {label}
                    </Badge>
                    {i < history.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Components auxiliars ─────────────────────────────────────
function StepView({ step, language, onNext, onBack, onRestart, isFirst }: {
  step: Step;
  language: string;
  onNext?: () => void;
  onBack?: () => void;
  onRestart: () => void;
  isFirst: boolean;
}) {
  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-primary">{step.title}</CardTitle>
            <CardDescription className="mt-1">{step.description}</CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {language === "ca" ? "Pas" : "Paso"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contingut principal amb Markdown bàsic */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <MarkdownLite text={step.content} />
        </div>

        {/* Avís */}
        {step.warning && (
          <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{step.warning}</p>
          </div>
        )}

        {/* Consells */}
        {step.tips && step.tips.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              {language === "ca" ? "Consells pràctics:" : "Consejos prácticos:"}
            </p>
            <ul className="space-y-1">
              {step.tips.map((tip, i) => (
                <li key={i} className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-1.5">
                  <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Enllaços relacionats */}
        {step.links && step.links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {step.links.map((link, i) => (
              <Link key={i} href={link.href}>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 gap-1">
                  {link.label} <ChevronRight className="h-3 w-3" />
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Botons de navegació */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                {language === "ca" ? "Enrere" : "Atrás"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onRestart} className="gap-1 text-muted-foreground">
              <RotateCcw className="h-4 w-4" />
              {language === "ca" ? "Reiniciar" : "Reiniciar"}
            </Button>
          </div>
          {onNext && (
            <Button size="sm" onClick={onNext} className="gap-1">
              {language === "ca" ? "Següent" : "Siguiente"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DecisionView({ decision, language, onSelect, onBack, onRestart }: {
  decision: Decision;
  language: string;
  onSelect: (stepId: string) => void;
  onBack?: () => void;
  onRestart: () => void;
}) {
  return (
    <Card className="border-2 border-amber-300/50 dark:border-amber-700/50 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl text-amber-700 dark:text-amber-400">{decision.question}</CardTitle>
          <Badge variant="outline" className="shrink-0 border-amber-300 text-amber-700">
            <HelpCircle className="h-3 w-3 mr-1" />
            {language === "ca" ? "Decisió" : "Decisión"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {decision.options.map((option) => (
          <button
            key={option.nextStepId}
            onClick={() => onSelect(option.nextStepId)}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </button>
        ))}

        <div className="flex items-center gap-2 pt-4 border-t">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {language === "ca" ? "Enrere" : "Atrás"}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onRestart} className="gap-1 text-muted-foreground">
            <RotateCcw className="h-4 w-4" />
            {language === "ca" ? "Reiniciar" : "Reiniciar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Renderitzador de Markdown molt bàsic (sense dependències) */
function MarkdownLite({ text }: { text: string }): React.ReactElement {
  const lines = text.split("\n");
  const elements: React.ReactElement[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const renderInline = (line: string): React.ReactElement => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <>
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  const flushTable = () => {
    if (tableRows.length < 2) return;
    const headers = tableRows[0];
    const rows = tableRows.slice(2); // skip separator row
    elements.push(
      <div key={`table-${elements.length}`} className="overflow-x-auto my-3">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50">
              {headers.map((h, i) => (
                <th key={i} className="p-2 text-left font-semibold border border-border">{renderInline(h.trim())}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-muted/30">
                {row.map((cell, ci) => (
                  <td key={ci} className="p-2 border border-border">{renderInline(cell.trim())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Taula
    if (trimmed.startsWith("|")) {
      inTable = true;
      const cells = trimmed.split("|").filter(Boolean);
      tableRows.push(cells);
      return;
    } else if (inTable) {
      inTable = false;
      flushTable();
    }

    // Línies buides
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      elements.push(<h4 key={i} className="font-bold text-base mt-4 mb-1">{trimmed.slice(4)}</h4>);
      return;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(<h3 key={i} className="font-bold text-lg mt-4 mb-1">{trimmed.slice(3)}</h3>);
      return;
    }

    // Llistes
    if (trimmed.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 ml-2">
          <span className="text-primary mt-0.5 shrink-0">•</span>
          <span>{renderInline(trimmed.slice(2))}</span>
        </div>
      );
      return;
    }

    // Llistes numerades
    const numMatch = trimmed.match(/^(\d+)\.\s/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 ml-2">
          <span className="text-primary font-semibold shrink-0">{numMatch[1]}.</span>
          <span>{renderInline(trimmed.slice(numMatch[0].length))}</span>
        </div>
      );
      return;
    }

    // Paràgraf normal
    elements.push(<p key={i}>{renderInline(trimmed)}</p>);
  });

  // Flush taula final
  if (inTable) flushTable();

  return <div className="space-y-1">{elements}</div>;
}
