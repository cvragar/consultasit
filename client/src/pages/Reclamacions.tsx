import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Shield,
  Home,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
  Scale,
  Building2,
  Stethoscope,
  HardHat,
  ArrowRight,
  Info,
  Phone,
  ExternalLink,
  ClipboardList,
  Gavel,
} from "lucide-react";
import { Link } from "wouter";

// ─── Dades de les vies de reclamació ────────────────────────────────────────

const VIES = [
  {
    id: "metge-familia",
    icon: Stethoscope,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-l-blue-500",
    badgeColor: "bg-blue-100 text-blue-800",
    title: "Alta del metge de família (AP)",
    subtitle: "Reclamació administrativa prèvia — ICAM (Catalunya)",
    termini: "11 dies hàbils",
    organisme: "ICAM / Inspecció Mèdica",
    urgencia: "Alta",
    resum:
      "Quan el metge de família o un especialista del servei públic de salut emet una alta mèdica i el pacient no hi està d'acord, pot presentar una reclamació administrativa prèvia davant la Direcció General d'Ordenació i Regulació Sanitària (ICAM a Catalunya).",
    passos: [
      {
        num: 1,
        titol: "Presentar la reclamació",
        desc: "Escrit de reclamació administrativa prèvia adreçat a la Direcció General d'Ordenació i Regulació Sanitària del Departament de Salut. Es pot fer per internet (ciutadans obligats a relacionar-se electrònicament) o presencialment.",
      },
      {
        num: 2,
        titol: "Termini de presentació",
        desc: "11 dies hàbils des de la data de l'alta mèdica (no compten dissabtes, diumenges ni festius). En altres supòsits de disconformitat (no alta), el termini és de 30 dies hàbils.",
      },
      {
        num: 3,
        titol: "Revisió per l'ICAM",
        desc: "L'ICAM (Inspecció Mèdica) revisa el cas i pot confirmar l'alta o emetre un nou part de baixa. La resolució es notifica a la persona interessada.",
      },
      {
        num: 4,
        titol: "Si la reclamació és denegada",
        desc: "Si l'ICAM confirma l'alta, el treballador pot acudir a la via judicial social (Jutjat Social) en el termini de 30 dies hàbils des de la notificació de la resolució.",
      },
    ],
    documentacio: [
      "DNI/NIE de la persona sol·licitant",
      "Part d'alta mèdica original",
      "Documentació mèdica de suport (informes, proves diagnòstiques)",
      "Document de representació (si actua en nom d'una altra persona)",
    ],
    consells: [
      "La reclamació NO suspèn l'alta: el treballador ha de reincorporar-se al treball mentre s'espera la resolució.",
      "Conserva còpia de tota la documentació mèdica prèvia a l'alta.",
      "Si tens un metge especialista que no estigui d'acord amb l'alta, demana un informe escrit.",
      "Pots trucar a l'ICAM per consultar l'estat de la reclamació: Barcelona 93 511 94 00.",
    ],
    baseLegal: [
      "Art. 71.2 Llei 36/2011, de 10 d'octubre, reguladora de la jurisdicció social",
      "Decret 196/2010, de 14 de desembre, sobre la inspecció mèdica de l'ICAM",
      "Art. 170-173 LGSS (RDLeg 8/2015): extinció de la IT per alta mèdica",
    ],
    contacte: [
      { label: "ICAM Barcelona", valor: "93 511 94 00" },
      { label: "ICAM Girona", valor: "97 294 23 22" },
      { label: "ICAM Lleida", valor: "97 325 43 61" },
      { label: "ICAM Tarragona", valor: "97 721 36 12" },
    ],
    url: "https://tramits.gencat.cat/ca/tramits/tramits-temes/Reclamacio-administrativa-previa-a-la-via-judicial-social-en-materia-dincapacitats-temporals",
    urlLabel: "Tràmit Gencat",
  },
  {
    id: "mutua-at",
    icon: HardHat,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-l-orange-500",
    badgeColor: "bg-orange-100 text-orange-800",
    title: "Alta de la mútua (Accident de Treball)",
    subtitle: "Procediment especial de revisió — INSS",
    termini: "10 dies hàbils",
    organisme: "INSS",
    urgencia: "Molt alta",
    resum:
      "Quan una mútua col·laboradora de la Seguretat Social emet una alta mèdica per contingència professional (accident de treball o malaltia professional) i el treballador no hi està d'acord, pot sol·licitar la revisió davant l'INSS en un procediment especial que SUSPÈN la reincorporació al treball.",
    passos: [
      {
        num: 1,
        titol: "Sol·licitar la revisió a l'INSS",
        desc: "Presentar la sol·licitud de revisió de l'alta a l'INSS (presencialment, per internet o per telèfon) en el termini de 10 dies hàbils des de la notificació de l'alta per la mútua.",
      },
      {
        num: 2,
        titol: "Suspensió de la reincorporació",
        desc: "IMPORTANT: Durant els 10 dies hàbils des de la sol·licitud, el treballador NO ha de reincorporar-se al treball. La mútua segueix pagant la prestació durant aquest període.",
      },
      {
        num: 3,
        titol: "Resolució de l'INSS (7 dies hàbils)",
        desc: "L'INSS té 7 dies hàbils per emetre resolució. Pot: (a) confirmar l'alta de la mútua, (b) emetre una nova baixa per contingència professional, o (c) emetre una baixa per contingència comuna.",
      },
      {
        num: 4,
        titol: "Si l'INSS confirma l'alta",
        desc: "Si l'INSS confirma l'alta de la mútua, el treballador ha de reincorporar-se immediatament. Si no ho fa, pot ser considerat absència injustificada. Pot recórrer la resolució de l'INSS en via administrativa (reclamació prèvia) i posteriorment judicial.",
      },
      {
        num: 5,
        titol: "Si no hi ha resposta en 7 dies",
        desc: "Si l'INSS no respon en 7 dies hàbils, s'entén que confirma l'alta de la mútua (silenci administratiu positiu per a la mútua). El treballador ha de reincorporar-se.",
      },
    ],
    documentacio: [
      "DNI/NIE de la persona sol·licitant",
      "Part d'alta mèdica emès per la mútua",
      "Part de baixa original i parts de confirmació",
      "Informes mèdics de la mútua i de l'atenció primària",
      "Documentació sobre l'accident de treball (informe d'accident, testimonis)",
    ],
    consells: [
      "La sol·licitud de revisió SUSPÈN la reincorporació: és l'única via de reclamació que ho fa.",
      "Presenta la sol·licitud el primer dia hàbil possible per aprofitar al màxim els 10 dies de suspensió.",
      "Guarda còpia segellada de la sol·licitud presentada a l'INSS.",
      "Si l'INSS confirma l'alta i no estàs d'acord, pots presentar reclamació prèvia en 30 dies i posteriorment demanda judicial.",
      "Consulta amb un advocat laboralista si l'accident és greu o hi ha discrepàncies sobre la contingència.",
    ],
    baseLegal: [
      "Art. 170.2 LGSS (RDLeg 8/2015): procediment de revisió d'alta de mútua",
      "RD 1430/2009, d'11 de setembre: procediment de revisió d'altes mèdiques de mútues",
      "Art. 80 Llei 36/2011: reclamació prèvia en matèria de Seguretat Social",
    ],
    contacte: [
      { label: "INSS (línia general)", valor: "901 16 65 65" },
      { label: "INSS (atenció gratuïta)", valor: "91 542 11 76" },
    ],
    url: "https://prestaciones.seg-social.es/servicio/revision-alta-medica-incapacidad-temporal.html",
    urlLabel: "Tràmit Seguretat Social",
  },
  {
    id: "inss-cc",
    icon: Building2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-l-green-500",
    badgeColor: "bg-green-100 text-green-800",
    title: "Alta de l'INSS (contingència comuna, >365 dies)",
    subtitle: "Reclamació prèvia administrativa — INSS",
    termini: "30 dies hàbils",
    organisme: "INSS / Jutjat Social",
    urgencia: "Mitjana",
    resum:
      "Quan l'INSS emet una alta mèdica per contingència comuna (malaltia comuna o accident no laboral) passats els 365 dies d'IT, el treballador pot impugnar-la. A diferència de les altes de mútua, aquesta via NO suspèn la reincorporació al treball.",
    passos: [
      {
        num: 1,
        titol: "Presentar reclamació prèvia a l'INSS",
        desc: "Escrit de reclamació administrativa prèvia davant l'INSS en el termini de 30 dies hàbils des de la notificació de l'alta. Es pot presentar presencialment, per internet o per correu.",
      },
      {
        num: 2,
        titol: "Resolució de l'INSS (45 dies)",
        desc: "L'INSS té 45 dies per resoldre la reclamació. Si no respon en 45 dies, s'entén desestimada per silenci administratiu negatiu.",
      },
      {
        num: 3,
        titol: "Demanda judicial (si cal)",
        desc: "Si l'INSS desestima la reclamació (o silenci), el treballador pot presentar demanda al Jutjat Social en el termini de 30 dies hàbils des de la notificació de la resolució o des que s'esgota el termini de silenci.",
      },
    ],
    documentacio: [
      "DNI/NIE de la persona sol·licitant",
      "Resolució d'alta de l'INSS",
      "Historial mèdic complet (informes d'especialistes, proves diagnòstiques)",
      "Informes del metge de família sobre l'estat actual",
    ],
    consells: [
      "L'alta de l'INSS NO suspèn la reincorporació: has de tornar a treballar mentre recorres.",
      "Si el metge de família considera que no estàs en condicions, pot emetre un nou part de baixa per recaiguda.",
      "Considera sol·licitar una nova baixa per recaiguda si la patologia persisteix.",
      "En casos complexos, valora sol·licitar una valoració per a Incapacitat Permanent si la patologia és crònica.",
    ],
    baseLegal: [
      "Art. 170-173 LGSS (RDLeg 8/2015): extinció de la IT per alta de l'INSS",
      "Art. 71 Llei 36/2011: reclamació prèvia en matèria de Seguretat Social",
      "Art. 80 Llei 36/2011: terminis de la reclamació prèvia",
    ],
    contacte: [
      { label: "INSS (línia general)", valor: "901 16 65 65" },
      { label: "INSS (atenció gratuïta)", valor: "91 542 11 76" },
    ],
    url: "https://prestaciones.seg-social.es/servicio/revision-alta-medica-incapacidad-temporal.html",
    urlLabel: "Tràmit Seguretat Social",
  },
  {
    id: "icam-proposta-mutua",
    icon: Shield,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-l-rose-500",
    badgeColor: "bg-rose-100 text-rose-800",
    title: "Alta per proposta de mútua confirmada per l'ICAM (<365 dies)",
    subtitle: "Reclamació administrativa prèvia — ICAM / Dep. Salut (Catalunya)",
    termini: "11 dies hàbils",
    organisme: "ICAM / Dep. Salut",
    urgencia: "Alta",
    resum:
      "Escenari específic: la mútua presenta una proposta motivada d'alta a l'ICAM; el metge de família discrepa i confirma la baixa; però l'ICAM no accepta la discrepància i dicta l'alta efectiva. En aquest cas, l'alta l'ha emès l'ICAM (no la mútua directament), de manera que la via de reclamació és la mateixa que per a qualsevol alta de l'ICAM: reclamació administrativa prèvia al Departament de Salut en 11 dies hàbils.",
    passos: [
      {
        num: 1,
        titol: "Entendre qui ha emès l'alta",
        desc: "En la proposta motivada d'alta de la mútua, l'alta efectiva la dicta sempre l'ICAM (no la mútua). Per tant, la via de reclamació és contra l'alta de l'ICAM, no contra la mútua. L'alta genera efectes l'endemà de la seva emissió per l'ICAM.",
      },
      {
        num: 2,
        titol: "Presentar la reclamació administrativa prèvia (11 dies hàbils)",
        desc: "El treballador disposa d'11 dies hàbils des de la notificació de l'alta per presentar una reclamació administrativa prèvia adreçada a la Direcció General d'Ordenació i Regulació Sanitària del Departament de Salut. Es pot fer per internet (formulari Gencat) o presencialment en qualsevol registre oficial.",
      },
      {
        num: 3,
        titol: "Reincorporació mentre es recorre",
        desc: "IMPORTANT: La reclamació NO suspèn l'alta. El treballador ha de reincorporar-se al treball l'endemà de l'alta mentre s'espera la resolució. Si no ho fa, pot ser considerat absència injustificada. Excepció: si el metge de família emet un nou part de baixa per recaiguda o nova patologia, el treballador pot continuar de baixa.",
      },
      {
        num: 4,
        titol: "Revisió per l'ICAM (nova avaluació)",
        desc: "L'ICAM revisa la reclamació. Pot citar el treballador per a un nou reconeixement mèdic. Si l'ICAM considera que la reclamació és fonamentada, pot revocar l'alta i emetre un nou part de baixa amb efectes retroactius des de la data de l'alta.",
      },
      {
        num: 5,
        titol: "Si la reclamació és denegada → via judicial",
        desc: "Si l'ICAM confirma l'alta (o no respon), el treballador pot presentar demanda al Jutjat Social en el termini de 30 dies hàbils des de la notificació de la resolució denegatòria (o des que s'esgota el termini de silenci administratiu). La demanda judicial pot sol·licitar la nul·litat de l'alta i el reconeixement de la prestació d'IT.",
      },
      {
        num: 6,
        titol: "Alternativa: nova baixa per recaiguda",
        desc: "Si el metge de família considera que el pacient no està en condicions de treballar, pot emetre un nou part de baixa per recaiguda (mateixa o similar patologia, dins dels 180 dies naturals). En aquest cas, el procés continua com una recaiguda del mateix procés d'IT. Si la recaiguda és per la mateixa patologia, l'INSS (a través de la mútua o el SPS) pot qüestionar si és realment una recaiguda o un nou procés.",
      },
    ],
    documentacio: [
      "DNI/NIE de la persona sol·licitant",
      "Alta mèdica emesa per l'ICAM (no per la mútua)",
      "Informe del metge de família on consta la discrepància amb la proposta d'alta",
      "Historial de parts de confirmació de la baixa",
      "Informes d'especialistes que avalin la continuació de la IT",
      "Documentació de la proposta motivada d'alta de la mútua (si es disposa)",
    ],
    consells: [
      "Clau: l'alta l'emet l'ICAM, no la mútua. La via correcta és la reclamació al Dep. de Salut (11 dies hàbils), no la revisió a l'INSS.",
      "El metge de família ha de documentar detalladament la discrepància: diagnòstic, tractament actiu, limitacions funcionals i pronòstic.",
      "Si el pacient té un especialista que no estigui d'acord amb l'alta, demana un informe escrit urgent per adjuntar a la reclamació.",
      "La reclamació NO suspèn la reincorporació. Si el pacient no pot treballar, el metge de família pot emetre un nou part de baixa per recaiguda o nova patologia.",
      "Si el pacient es reincorpora i empitjora, el metge de família pot emetre un nou part de baixa per recaiguda dins dels 180 dies naturals.",
      "En casos on la mútua ha presentat la proposta d'alta, és recomanable que el metge de família contacti directament amb l'ICAM per explicar la situació clínica.",
      "Per a casos complexos o si hi ha sospita de pressió indeguda de la mútua, es recomana que el pacient consulti un advocat laboralista.",
    ],
    baseLegal: [
      "Art. 170.1 LGSS (RDLeg 8/2015): competències de l'INSS i del SPS fins als 365 dies",
      "RD 1430/2009, d'11 de setembre: procediment de proposta motivada d'alta de les mútues",
      "Art. 71.2 Llei 36/2011, de 10 d'octubre: reclamació prèvia a la via judicial social",
      "Decret 196/2010, de 14 de desembre: inspecció mèdica de l'ICAM a Catalunya",
      "Canal Salut (Gencat): \"Proposta motivada d'alta mèdica\" — procediment de 5 dies",
    ],
    contacte: [
      { label: "ICAM Barcelona", valor: "93 511 94 00" },
      { label: "ICAM Girona", valor: "97 294 23 22" },
      { label: "ICAM Lleida", valor: "97 325 43 61" },
      { label: "ICAM Tarragona", valor: "97 721 36 12" },
    ],
    url: "https://tramits.gencat.cat/ca/tramits/tramits-temes/Reclamacio-administrativa-previa-a-la-via-judicial-social-en-materia-dincapacitats-temporals",
    urlLabel: "Tràmit Gencat — Reclamació administrativa prèvia",
  },
  {
    id: "determinacio-contingencies",
    icon: Scale,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-l-purple-500",
    badgeColor: "bg-purple-100 text-purple-800",
    title: "Determinació de contingències",
    subtitle: "Canviar la qualificació de CC a AT/MP (o viceversa)",
    termini: "En qualsevol moment",
    organisme: "INSS",
    urgencia: "Variable",
    resum:
      "Quan el treballador considera que la seva IT ha estat qualificada incorrectament (per exemple, com a contingència comuna quan hauria de ser accident de treball o malaltia professional), pot sol·licitar la determinació de la contingència davant l'INSS. La diferència econòmica pot ser significativa: AT/MP cotitza des del dia 1 al 75% BR, mentre que CC cotitza des del dia 4 al 60%/75% BR.",
    passos: [
      {
        num: 1,
        titol: "Sol·licitar la determinació a l'INSS",
        desc: "Presentar la sol·licitud de determinació de la contingència causant davant l'INSS. Es pot fer en qualsevol moment durant la IT o fins i tot un cop extingida. No hi ha termini específic, però és recomanable fer-ho el més aviat possible.",
      },
      {
        num: 2,
        titol: "Instrucció de l'expedient",
        desc: "L'INSS instrueix l'expedient, sol·licita informes a la mútua, a l'empresa i als serveis mèdics. Pot citar el treballador per a reconeixement mèdic.",
      },
      {
        num: 3,
        titol: "Resolució de l'INSS",
        desc: "L'INSS resol si la contingència és comuna o professional. Si és professional, la gestió passa a la mútua i es recalcula la prestació des de l'inici de la baixa (amb efectes retroactius).",
      },
      {
        num: 4,
        titol: "Efectes econòmics retroactius",
        desc: "Si es reconeix la contingència professional, el treballador té dret a la diferència de prestació des del primer dia de baixa: del 60% (CC) al 75% (AT/MP), i dels dies 1-3 que no es cobren en CC.",
      },
      {
        num: 5,
        titol: "Recurs si es denega",
        desc: "Si l'INSS denega la determinació de contingència professional, es pot presentar reclamació prèvia en 30 dies i posteriorment demanda al Jutjat Social.",
      },
    ],
    documentacio: [
      "DNI/NIE de la persona sol·licitant",
      "Part de baixa mèdica",
      "Informe sobre les circumstàncies de l'accident o exposició laboral",
      "Contracte de treball i descripció del lloc de treball",
      "Testimonis de l'accident (si n'hi ha)",
      "Informes mèdics que relacionin la patologia amb el treball",
    ],
    consells: [
      "La diferència econòmica entre CC i AT/MP pot ser molt significativa, especialment en baixes llargues.",
      "Si l'accident va ocórrer durant el teletreball, aplica la presumpció de l'art. 156 LGSS (iuris tantum).",
      "En malalties professionals, consulta el RD 1299/2006 (llistat de malalties professionals) per verificar si la patologia hi figura.",
      "Guarda tota la documentació sobre les condicions del lloc de treball (avaluació de riscos, equips de protecció).",
      "El metge de família pot emetre el part de baixa com a AT si té indicis suficients; la qualificació definitiva la fa l'INSS.",
    ],
    baseLegal: [
      "Art. 156-157 LGSS (RDLeg 8/2015): definició d'accident de treball i malaltia professional",
      "RD 1299/2006, de 10 de novembre: quadre de malalties professionals",
      "Art. 169.1 LGSS: definició de contingència comuna",
      "RD 1430/2009: procediment de determinació de contingències",
    ],
    contacte: [
      { label: "INSS (línia general)", valor: "901 16 65 65" },
      { label: "INSS (atenció gratuïta)", valor: "91 542 11 76" },
    ],
    url: "https://prestaciones.seg-social.es/servicio/determinacion-contingencia-causante-incapacidad-temporal.html",
    urlLabel: "Tràmit Seguretat Social",
  },
];


// ─── Component principal ─────────────────────────────────────────────────────

export default function Reclamacions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Inici</span>
              </Button>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <div className="flex items-center gap-1.5 font-medium text-gray-800">
              <Gavel className="h-4 w-4 text-slate-600" />
              <span>Reclamacions i Recursos</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-8 sm:py-12">
        <div className="max-w-3xl mx-auto text-center px-2">
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-1.5 text-sm text-slate-600 mb-4">
            <Scale className="h-4 w-4" />
            Guia pràctica per a professionals sanitaris
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Reclamacions i Recursos en IT
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-4">
            Cinc vies de reclamació explicades pas a pas: alta del metge de família, alta de la mútua per AT/MP, alta de l’ICAM quan la mútua ha proposat l’alta i el metge de família ha discrepat, alta de l’INSS passats els 365 dies, i determinació de contingències.
          </p>
          {/* Cas destacat: proposta mútua confirmada per ICAM */}
          <div className="inline-flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-800 text-left mb-6">
            <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold">Escenari freqüent i confús:</span> la mútua proposa l’alta a l’ICAM, el metge de família discrepa, però l’ICAM confirma l’alta igualment.
              {" "}<span className="font-medium">La via correcta és reclamar al Departament de Salut en 11 dies hàbils</span>, no a l’INSS.
            </span>
          </div>

          {/* Taula resum de terminis */}
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm mt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Via de reclamació</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Termini</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Suspèn reincorporació?</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Organisme</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-blue-700">Alta metge de família (ICAM)</td>
                  <td className="px-4 py-3">11 dies hàbils</td>
                  <td className="px-4 py-3"><span className="text-red-600 font-medium">No</span></td>
                  <td className="px-4 py-3">ICAM / Dep. Salut</td>
                </tr>
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-orange-700">Alta mútua (AT/MP)</td>
                  <td className="px-4 py-3">10 dies hàbils</td>
                  <td className="px-4 py-3"><span className="text-green-600 font-medium">Sí (10 dies)</span></td>
                  <td className="px-4 py-3">INSS</td>
                </tr>
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-rose-700">Alta ICAM (proposta mútua, &lt;365 dies)</td>
                  <td className="px-4 py-3">11 dies hàbils</td>
                  <td className="px-4 py-3"><span className="text-red-600 font-medium">No</span></td>
                  <td className="px-4 py-3">ICAM / Dep. Salut</td>
                </tr>
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-green-700">Alta INSS (&gt;365 dies CC)</td>
                  <td className="px-4 py-3">30 dies hàbils</td>
                  <td className="px-4 py-3"><span className="text-red-600 font-medium">No</span></td>
                  <td className="px-4 py-3">INSS / Jutjat Social</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-purple-700">Determinació contingències</td>
                  <td className="px-4 py-3">En qualsevol moment</td>
                  <td className="px-4 py-3"><span className="text-gray-500">N/A</span></td>
                  <td className="px-4 py-3">INSS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Vies de reclamació */}
      <section className="container pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {VIES.map((via) => {
            const Icon = via.icon;
            return (
              <Card key={via.id} className={`border-l-4 ${via.borderColor} shadow-sm`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${via.bgColor} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${via.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <CardTitle className="text-lg leading-tight">{via.title}</CardTitle>
                      </div>
                      <p className="text-sm text-gray-500">{via.subtitle}</p>
                    </div>
                  </div>

                  {/* Badges de termini i organisme */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-xs bg-gray-100 rounded-full px-3 py-1">
                      <Clock className="h-3.5 w-3.5 text-gray-500" />
                      <span className="font-medium">Termini:</span>
                      <span>{via.termini}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs bg-gray-100 rounded-full px-3 py-1">
                      <Building2 className="h-3.5 w-3.5 text-gray-500" />
                      <span className="font-medium">Organisme:</span>
                      <span>{via.organisme}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Resum */}
                  <p className="text-sm text-gray-700 leading-relaxed">{via.resum}</p>

                  <Accordion type="single" collapsible className="w-full">
                    {/* Passos */}
                    <AccordionItem value="passos">
                      <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-gray-500" />
                          Procediment pas a pas
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="space-y-3 mt-2">
                          {via.passos.map((pas) => (
                            <li key={pas.num} className="flex gap-3">
                              <span className={`shrink-0 w-6 h-6 rounded-full ${via.bgColor} ${via.color} text-xs font-bold flex items-center justify-center`}>
                                {pas.num}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{pas.titol}</p>
                                <p className="text-sm text-gray-600 mt-0.5">{pas.desc}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Documentació */}
                    <AccordionItem value="documentacio">
                      <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          Documentació necessària
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5 mt-2">
                          {via.documentacio.map((doc, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Consells pràctics */}
                    <AccordionItem value="consells">
                      <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-gray-500" />
                          Consells pràctics
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 mt-2">
                          {via.consells.map((consell, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <ArrowRight className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                              {consell}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Base legal */}
                    <AccordionItem value="base-legal">
                      <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-gray-500" />
                          Base legal
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5 mt-2">
                          {via.baseLegal.map((llei, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <Gavel className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                              {llei}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Contacte */}
                    {via.contacte.length > 0 && (
                      <AccordionItem value="contacte">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            Contacte i tràmit oficial
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 mt-2">
                            <div className="flex flex-wrap gap-2">
                              {via.contacte.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                                  <Phone className="h-3.5 w-3.5 text-gray-500" />
                                  <span className="text-gray-600">{c.label}:</span>
                                  <span className="font-semibold text-gray-800">{c.valor}</span>
                                </div>
                              ))}
                            </div>
                            <a
                              href={via.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              {via.urlLabel} — Tràmit oficial
                            </a>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Nota informativa */}
      <section className="container pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Nota per a professionals sanitaris</p>
              <p>
                Aquesta guia és orientativa per informar els pacients sobre les seves opcions de reclamació. Els terminis i procediments poden variar. Per a casos complexos, es recomana que el pacient consulti un advocat laboralista o un sindicat. La informació s'ha actualitzat d'acord amb la normativa vigent a Catalunya (març 2026).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA: consulta amb IA */}
      <section className="container pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center">
            <h3 className="text-lg font-bold mb-2">Tens dubtes sobre un cas concret?</h3>
            <p className="text-blue-100 text-sm mb-4">
              Consulta amb l'assistent d'IA especialitzat en normativa d'IT per obtenir orientació personalitzada.
            </p>
            <Link href="/chat">
              <Button variant="secondary" className="gap-2">
                Consultar amb l'assistent
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
