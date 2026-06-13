import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Home, Search, ChevronDown, ChevronRight, ChevronUp,
  FileText, Clock, Shield, AlertTriangle, Stethoscope,
  HelpCircle, Scale, Briefcase, Heart, Baby, Pill
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useT } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

// ─── Tipus ────────────────────────────────────────────────────
interface FAQItem {
  question: string;
  answer: string;
  links?: { label: string; href: string }[];
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  items: FAQItem[];
}

// ─── Dades FAQ (CA) ───────────────────────────────────────────
const faqCA: FAQCategory[] = [
  {
    id: "basics",
    title: "Conceptes bàsics d'IT",
    icon: Stethoscope,
    color: "text-blue-600 dark:text-blue-400",
    items: [
      {
        question: "Què és la Incapacitat Temporal (IT)?",
        answer: "La Incapacitat Temporal (IT) és la situació en què un treballador no pot realitzar la seva feina habitual a causa d'una malaltia o accident, i rep assistència sanitària de la Seguretat Social. Té una durada màxima de 365 dies, prorrogable fins a 545 dies (18 mesos) o excepcionalment 730 dies (24 mesos).",
        links: [{ label: "Calculadora de durada d'IT", href: "/calculadora" }]
      },
      {
        question: "Quins tipus de contingència existeixen?",
        answer: "Hi ha dos tipus principals:\n\n**Contingència comuna (CC):** Malaltia comuna o accident no laboral. Prestació del 60% BR (dies 4-20) i 75% BR (des del dia 21). Gestió per INSS o mútua.\n\n**Contingència professional:** Inclou Accident de Treball (AT) i Malaltia Professional (MP). Prestació del 75% BR des del dia 2. Gestió per la mútua col·laboradora.",
        links: [{ label: "Veure comparativa completa", href: "/" }]
      },
      {
        question: "Quin és el període mínim de cotització per accedir a la IT?",
        answer: "Per contingència comuna: cal haver cotitzat mínim **180 dies en els últims 5 anys**. Per contingència professional (AT/MP): **no es requereix període mínim** de cotització.",
      },
      {
        question: "Qui paga la prestació econòmica durant la IT?",
        answer: "**Contingència comuna:** Dies 1-3 no hi ha prestació (a càrrec de l'empresa si el conveni ho preveu). Dies 4-15 a càrrec de l'empresa. Des del dia 16 a càrrec de la mútua/INSS (tot i que l'empresa avança el pagament).\n\n**Contingència professional:** Des del dia 2, a càrrec de la mútua col·laboradora. El dia de l'accident, salari íntegre a càrrec de l'empresa.",
      },
    ]
  },
  {
    id: "comunicats",
    title: "Comunicats i parts",
    icon: FileText,
    color: "text-green-600 dark:text-green-400",
    items: [
      {
        question: "Cada quant he d'emetre comunicats de confirmació?",
        answer: "Depèn de la durada estimada del procés:\n\n- **≤ 5 dies:** No cal confirmació\n- **5-30 dies:** Primer als 7 dies, després cada 14 dies\n- **31-60 dies:** Primer als 7 dies, després cada 28 dies\n- **> 61 dies:** Primer als 14 dies, després cada 35 dies\n\neCap avisa automàticament quan s'acosta la data del proper comunicat.",
        links: [{ label: "Guia interactiva", href: "/guia-it" }]
      },
      {
        question: "Puc emetre una baixa retroactiva?",
        answer: "Sí, però amb limitacions. El metge de família pot emetre una baixa amb efectes retroactius de fins a **3 dies naturals** anteriors a la data de la visita, si considera que el pacient ja estava incapacitat en aquell moment. Per a retroactivitats superiors, cal justificació especial.",
        links: [{ label: "Cas: Baixes retroactives", href: "/casos-especials" }]
      },
      {
        question: "Qui pot emetre l'alta mèdica?",
        answer: "L'alta mèdica la pot emetre:\n\n- **Metge de família:** En qualsevol moment (CC)\n- **Mútua col·laboradora:** AT/MP, o CC si gestiona la prestació\n- **ICAM:** Per inspecció o proposta d'alta\n- **INSS:** En qualsevol moment, per sobre de tots els altres\n\nL'alta té efectes el dia següent a la seva emissió.",
      },
    ]
  },
  {
    id: "durada",
    title: "Durada i pròrrogues",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    items: [
      {
        question: "Quina és la durada màxima d'una IT?",
        answer: "La durada màxima estàndard és de **365 dies naturals**. Pot prorrogar-se:\n\n- **Primera pròrroga:** +180 dies (total 545 dies / 18 mesos) — decideix l'INSS\n- **Segona pròrroga excepcional:** +185 dies (total 730 dies / 24 mesos) — només en casos excepcionals (neoplàsies, cirurgia major, malalties greus)",
        links: [{ label: "Calculadora de durada", href: "/calculadora" }]
      },
      {
        question: "Què passa quan s'arriba als 365 dies?",
        answer: "Abans d'arribar als 365 dies, l'INSS (via ICAM a Catalunya) avalua el cas. Pot decidir:\n\n1. **Prorrogar** la IT fins a 180 dies més\n2. **Emetre alta mèdica** si considera que el pacient pot treballar\n3. **Iniciar valoració d'Incapacitat Permanent** si no hi ha expectativa de recuperació",
      },
      {
        question: "Què és una recaiguda i com afecta la durada?",
        answer: "Es considera **recaiguda** quan es produeix una nova baixa per la mateixa patologia o similar dins dels **180 dies naturals** posteriors a l'alta. En cas de recaiguda, els dies anteriors sumen al còmput total i la base reguladora es manté la del procés original.",
        links: [{ label: "Cas: Recaiguda post-alta ICAM", href: "/casos-especials" }]
      },
    ]
  },
  {
    id: "contingencies",
    title: "Contingències professionals",
    icon: Shield,
    color: "text-red-600 dark:text-red-400",
    items: [
      {
        question: "Què és un accident de treball (AT)?",
        answer: "L'accident de treball és tota lesió corporal que el treballador pateix amb ocasió o per conseqüència del treball (art. 156 LGSS). Inclou:\n\n- Accidents durant la jornada laboral\n- **Accident in itinere:** anada/tornada del treball\n- Accidents en missions o desplaçaments laborals\n- Actes de salvament relacionats amb el treball",
        links: [{ label: "Casos AT", href: "/casos-especials" }]
      },
      {
        question: "Com es determina si una baixa és per contingència comuna o professional?",
        answer: "Si hi ha dubte, el metge de família pot emetre la baixa com a **contingència comuna** inicialment. Després, el pacient o l'empresa poden sol·licitar una **determinació de contingència** a l'INSS, que decidirà si es tracta de CC o contingència professional.",
        links: [{ label: "Reclamacions", href: "/reclamacions" }]
      },
      {
        question: "Què faig si un pacient ve amb un accident de treball però la mútua no és accessible?",
        answer: "El metge de família pot emetre un **comunicat de baixa provisional** a eCap, indicant clarament que es tracta d'AT. La mútua col·laboradora assumirà la gestió posterior. Si el pacient necessita atenció urgent, s'ha d'estabilitzar primer i derivar a la mútua quan sigui possible.",
      },
    ]
  },
  {
    id: "especials",
    title: "Situacions especials",
    icon: Heart,
    color: "text-pink-600 dark:text-pink-400",
    items: [
      {
        question: "Com funciona la IT per menstruació incapacitant?",
        answer: "Des de la Llei Orgànica 1/2023, la menstruació incapacitant es reconeix com a contingència comuna especial. La prestació és del **60% BR des del dia 1** (sense els 3 dies d'espera habituals). El metge de família emet la baixa a eCap amb el diagnòstic corresponent.",
        links: [{ label: "Cas: Menstruació incapacitant", href: "/casos-especials" }]
      },
      {
        question: "Pot un treballador en pluriempleo tenir IT en una feina i no en l'altra?",
        answer: "Sí, és possible. Si la patologia només impedeix una de les feines, el metge pot emetre la baixa només per a aquella activitat. Cal indicar-ho clarament al comunicat de baixa. La prestació es calcula sobre la base reguladora de la feina afectada.",
        links: [{ label: "Cas: Pluriempleo", href: "/casos-especials" }]
      },
      {
        question: "Què passa amb la IT durant l'embaràs?",
        answer: "L'embaràs per si sol no és causa d'IT, però les complicacions derivades sí. L'**embaràs de risc** es gestiona com a contingència professional (prestació del 75% BR des del dia 1). Si és una complicació no relacionada amb el risc laboral, es gestiona com a CC.",
        links: [{ label: "Cas: Embaràs i IT", href: "/casos-especials" }]
      },
    ]
  },
  {
    id: "reclamacions",
    title: "Reclamacions i recursos",
    icon: Scale,
    color: "text-purple-600 dark:text-purple-400",
    items: [
      {
        question: "Què pot fer un pacient si no està d'acord amb l'alta mèdica?",
        answer: "El pacient pot presentar una **reclamació prèvia** davant l'INSS en un termini de 30 dies hàbils des de l'alta. Si l'alta la va donar l'ICAM, pot sol·licitar revisió. Durant el procés de reclamació, el pacient pot continuar de baixa si el metge de família ho considera necessari.",
        links: [{ label: "Reclamacions", href: "/reclamacions" }]
      },
      {
        question: "Què és el formulari IS3 i quan s'utilitza?",
        answer: "El formulari IS3 és la sol·licitud de baixa mèdica dirigida a l'ICAM. S'utilitza principalment quan:\n\n- Hi ha una recaiguda després d'una alta emesa per l'ICAM\n- El metge de família necessita comunicar una nova baixa a l'ICAM\n- Cal adjuntar justificació clínica per a la valoració de l'ICAM",
        links: [{ label: "Cas: Recaiguda post-alta ICAM", href: "/casos-especials" }]
      },
      {
        question: "Pot la mútua emetre alta en una contingència comuna?",
        answer: "Sí, si la mútua gestiona la prestació de CC (cosa que passa quan l'empresa ha optat per cobrir la IT amb la mútua). En aquest cas, la mútua pot proposar alta mèdica, que ha de ser ratificada per l'INSS en un termini de 5 dies.",
      },
    ]
  },
];

// ─── Dades FAQ (ES) ───────────────────────────────────────────
const faqES: FAQCategory[] = [
  {
    id: "basics",
    title: "Conceptos básicos de IT",
    icon: Stethoscope,
    color: "text-blue-600 dark:text-blue-400",
    items: [
      {
        question: "¿Qué es la Incapacidad Temporal (IT)?",
        answer: "La Incapacidad Temporal (IT) es la situación en la que un trabajador no puede realizar su trabajo habitual debido a una enfermedad o accidente, y recibe asistencia sanitaria de la Seguridad Social. Tiene una duración máxima de 365 días, prorrogable hasta 545 días (18 meses) o excepcionalmente 730 días (24 meses).",
        links: [{ label: "Calculadora de duración de IT", href: "/calculadora" }]
      },
      {
        question: "¿Qué tipos de contingencia existen?",
        answer: "Hay dos tipos principales:\n\n**Contingencia común (CC):** Enfermedad común o accidente no laboral. Prestación del 60% BR (días 4-20) y 75% BR (desde el día 21). Gestión por INSS o mutua.\n\n**Contingencia profesional:** Incluye Accidente de Trabajo (AT) y Enfermedad Profesional (EP). Prestación del 75% BR desde el día 2. Gestión por la mutua colaboradora.",
        links: [{ label: "Ver comparativa completa", href: "/" }]
      },
      {
        question: "¿Cuál es el período mínimo de cotización para acceder a la IT?",
        answer: "Para contingencia común: hay que haber cotizado mínimo **180 días en los últimos 5 años**. Para contingencia profesional (AT/EP): **no se requiere período mínimo** de cotización.",
      },
      {
        question: "¿Quién paga la prestación económica durante la IT?",
        answer: "**Contingencia común:** Días 1-3 no hay prestación. Días 4-15 a cargo de la empresa. Desde el día 16 a cargo de la mutua/INSS.\n\n**Contingencia profesional:** Desde el día 2, a cargo de la mutua colaboradora. El día del accidente, salario íntegro a cargo de la empresa.",
      },
    ]
  },
  {
    id: "comunicats",
    title: "Partes y comunicados",
    icon: FileText,
    color: "text-green-600 dark:text-green-400",
    items: [
      {
        question: "¿Cada cuánto debo emitir partes de confirmación?",
        answer: "Depende de la duración estimada del proceso:\n\n- **≤ 5 días:** No necesita confirmación\n- **5-30 días:** Primero a los 7 días, después cada 14 días\n- **31-60 días:** Primero a los 7 días, después cada 28 días\n- **> 61 días:** Primero a los 14 días, después cada 35 días",
        links: [{ label: "Guía interactiva", href: "/guia-it" }]
      },
      {
        question: "¿Puedo emitir una baja retroactiva?",
        answer: "Sí, pero con limitaciones. El médico de familia puede emitir una baja con efectos retroactivos de hasta **3 días naturales** anteriores a la fecha de la visita.",
        links: [{ label: "Caso: Bajas retroactivas", href: "/casos-especials" }]
      },
      {
        question: "¿Quién puede emitir el alta médica?",
        answer: "El alta médica la puede emitir:\n\n- **Médico de familia:** En cualquier momento (CC)\n- **Mutua colaboradora:** AT/EP, o CC si gestiona la prestación\n- **ICAM:** Por inspección o propuesta de alta\n- **INSS:** En cualquier momento, por encima de todos",
      },
    ]
  },
  {
    id: "durada",
    title: "Duración y prórrogas",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    items: [
      {
        question: "¿Cuál es la duración máxima de una IT?",
        answer: "La duración máxima estándar es de **365 días naturales**. Puede prorrogarse:\n\n- **Primera prórroga:** +180 días (total 545 días / 18 meses)\n- **Segunda prórroga excepcional:** +185 días (total 730 días / 24 meses)",
        links: [{ label: "Calculadora de duración", href: "/calculadora" }]
      },
      {
        question: "¿Qué pasa cuando se llega a los 365 días?",
        answer: "Antes de llegar a los 365 días, el INSS (vía ICAM en Cataluña) evalúa el caso. Puede decidir prorrogar, emitir alta médica o iniciar valoración de Incapacidad Permanente.",
      },
      {
        question: "¿Qué es una recaída y cómo afecta a la duración?",
        answer: "Se considera **recaída** cuando se produce una nueva baja por la misma patología o similar dentro de los **180 días naturales** posteriores al alta. Los días anteriores suman al cómputo total.",
        links: [{ label: "Caso: Recaída post-alta ICAM", href: "/casos-especials" }]
      },
    ]
  },
  {
    id: "contingencies",
    title: "Contingencias profesionales",
    icon: Shield,
    color: "text-red-600 dark:text-red-400",
    items: [
      {
        question: "¿Qué es un accidente de trabajo (AT)?",
        answer: "El accidente de trabajo es toda lesión corporal que el trabajador sufre con ocasión o por consecuencia del trabajo (art. 156 LGSS). Incluye accidentes durante la jornada, accidente in itinere y actos de salvamento.",
        links: [{ label: "Casos AT", href: "/casos-especials" }]
      },
      {
        question: "¿Cómo se determina si una baja es por contingencia común o profesional?",
        answer: "Si hay duda, el médico de familia puede emitir la baja como contingencia común inicialmente. Después, el paciente o la empresa pueden solicitar una determinación de contingencia al INSS.",
        links: [{ label: "Reclamaciones", href: "/reclamacions" }]
      },
      {
        question: "¿Qué hago si un paciente viene con un accidente de trabajo pero la mutua no es accesible?",
        answer: "El médico de familia puede emitir un parte de baja provisional en eCap, indicando claramente que se trata de AT. La mutua asumirá la gestión posterior.",
      },
    ]
  },
  {
    id: "especials",
    title: "Situaciones especiales",
    icon: Heart,
    color: "text-pink-600 dark:text-pink-400",
    items: [
      {
        question: "¿Cómo funciona la IT por menstruación incapacitante?",
        answer: "Desde la Ley Orgánica 1/2023, la menstruación incapacitante se reconoce como contingencia común especial. La prestación es del **60% BR desde el día 1** (sin los 3 días de espera habituales).",
        links: [{ label: "Caso: Menstruación incapacitante", href: "/casos-especials" }]
      },
      {
        question: "¿Puede un trabajador en pluriempleo tener IT en un trabajo y no en otro?",
        answer: "Sí, es posible. Si la patología solo impide una de las actividades, el médico puede emitir la baja solo para esa actividad.",
        links: [{ label: "Caso: Pluriempleo", href: "/casos-especials" }]
      },
      {
        question: "¿Qué pasa con la IT durante el embarazo?",
        answer: "El embarazo por sí solo no es causa de IT, pero las complicaciones derivadas sí. El embarazo de riesgo se gestiona como contingencia profesional (75% BR desde el día 1).",
        links: [{ label: "Caso: Embarazo e IT", href: "/casos-especials" }]
      },
    ]
  },
  {
    id: "reclamacions",
    title: "Reclamaciones y recursos",
    icon: Scale,
    color: "text-purple-600 dark:text-purple-400",
    items: [
      {
        question: "¿Qué puede hacer un paciente si no está de acuerdo con el alta médica?",
        answer: "El paciente puede presentar una reclamación previa ante el INSS en un plazo de 30 días hábiles desde el alta.",
        links: [{ label: "Reclamaciones", href: "/reclamacions" }]
      },
      {
        question: "¿Qué es el formulario IS3 y cuándo se utiliza?",
        answer: "El formulario IS3 es la solicitud de baja médica dirigida al ICAM. Se utiliza cuando hay una recaída después de un alta emitida por el ICAM.",
        links: [{ label: "Caso: Recaída post-alta ICAM", href: "/casos-especials" }]
      },
      {
        question: "¿Puede la mutua emitir alta en una contingencia común?",
        answer: "Sí, si la mutua gestiona la prestación de CC. En ese caso, la mutua puede proponer alta médica, que debe ser ratificada por el INSS en un plazo de 5 días.",
      },
    ]
  },
];

// ─── Component principal ──────────────────────────────────────
export default function FAQ() {
  const { language } = useT();
  const categories = language === "ca" ? faqCA : faqES;

  useSEO({
    title: language === "ca"
      ? "Preguntes freqüents sobre IT — Consultes IT"
      : "Preguntas frecuentes sobre IT — Consultas IT",
    description: language === "ca"
      ? "Respostes a les preguntes més habituals sobre Incapacitat Temporal: durada, prestacions, comunicats, reclamacions i casos especials."
      : "Respuestas a las preguntas más habituales sobre Incapacidad Temporal: duración, prestaciones, partes, reclamaciones y casos especiales.",
    canonicalPath: "/faq",
    keywords: language === "ca"
      ? "FAQ IT, preguntes freqüents, incapacitat temporal, baixa mèdica, dubtes IT"
      : "FAQ IT, preguntas frecuentes, incapacidad temporal, baja médica, dudas IT",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Filtrar per cerca
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      items: cat.items.filter(
        item => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
      )
    })).filter(cat => cat.items.length > 0);
  }, [categories, searchQuery]);

  const displayCategories = activeCategory
    ? filteredCategories.filter(c => c.id === activeCategory)
    : filteredCategories;

  const totalQuestions = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky-safe">
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
              <span className="font-semibold text-sm">FAQ</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-4xl">
        {/* Títol i cerca */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {language === "ca" ? "Preguntes freqüents" : "Preguntas frecuentes"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === "ca"
              ? `${totalQuestions} respostes sobre Incapacitat Temporal organitzades per temàtica`
              : `${totalQuestions} respuestas sobre Incapacidad Temporal organizadas por temática`}
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === "ca" ? "Cerca una pregunta..." : "Busca una pregunta..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtre per categories */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            {language === "ca" ? "Totes" : "Todas"}
          </Button>
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className="gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.title}
              </Button>
            );
          })}
        </div>

        {/* Llista de FAQ */}
        {displayCategories.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {language === "ca"
                ? "No s'han trobat resultats. Prova amb altres paraules."
                : "No se encontraron resultados. Prueba con otras palabras."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {displayCategories.map(cat => {
              const Icon = cat.icon;
              return (
                <div key={cat.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-5 w-5 ${cat.color}`} />
                    <h2 className="text-lg font-bold">{cat.title}</h2>
                    <Badge variant="outline" className="text-xs">{cat.items.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {cat.items.map((item, idx) => {
                      const key = `${cat.id}-${idx}`;
                      const isOpen = expandedItems.has(key);
                      return (
                        <Card key={key} className={`transition-all ${isOpen ? "border-primary/30 shadow-md" : "hover:border-primary/20"}`}>
                          <button
                            onClick={() => toggleItem(key)}
                            className="w-full text-left p-4 flex items-start justify-between gap-3"
                          >
                            <span className="font-medium text-sm">{item.question}</span>
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            )}
                          </button>
                          {isOpen && (
                            <CardContent className="pt-0 pb-4 px-4">
                              <div className="border-t pt-3 space-y-3">
                                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                                  <FAQAnswer text={item.answer} />
                                </div>
                                {item.links && item.links.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {item.links.map((link, li) => (
                                      <Link key={li} href={link.href}>
                                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 gap-1 text-xs">
                                          {link.label} <ChevronRight className="h-3 w-3" />
                                        </Badge>
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA final */}
        <div className="mt-12 text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-sm text-muted-foreground mb-3">
            {language === "ca"
              ? "No trobes la resposta que busques?"
              : "¿No encuentras la respuesta que buscas?"}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/chat">
              <Button size="sm" className="gap-1.5">
                <Stethoscope className="h-4 w-4" />
                {language === "ca" ? "Pregunta a la IA" : "Pregunta a la IA"}
              </Button>
            </Link>
            <Link href="/guia-it">
              <Button variant="outline" size="sm" className="gap-1.5">
                <HelpCircle className="h-4 w-4" />
                {language === "ca" ? "Guia interactiva" : "Guía interactiva"}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Renderitzador bàsic de text amb negreta */
function FAQAnswer({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;

        // Llistes
        if (trimmed.startsWith("- ")) {
          return (
            <div key={i} className="flex items-start gap-1.5 ml-2">
              <span className="text-primary mt-0.5 shrink-0">•</span>
              <span><InlineBold text={trimmed.slice(2)} /></span>
            </div>
          );
        }

        // Numbered lists
        const numMatch = trimmed.match(/^(\d+)\.\s/);
        if (numMatch) {
          return (
            <div key={i} className="flex items-start gap-1.5 ml-2">
              <span className="text-primary font-semibold shrink-0">{numMatch[1]}.</span>
              <span><InlineBold text={trimmed.slice(numMatch[0].length)} /></span>
            </div>
          );
        }

        return <p key={i}><InlineBold text={trimmed} /></p>;
      })}
    </div>
  );
}

function InlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
