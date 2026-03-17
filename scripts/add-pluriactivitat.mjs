import mysql2 from 'mysql2/promise';

async function main() {
  const conn = await mysql2.createConnection(process.env.DATABASE_URL);

  const pluriactivitatCase = {
    id: 70001,
    title: "Pluriactivitat: treballador simultàniament autònom (RETA) i assalariat (Règim General)",
    category: "pluriempleo",
    description: `La pluriactivitat és la situació en la qual un treballador exerceix simultàniament activitats que donen lloc a la seva alta obligatòria en dos o més règims distintos del sistema de la Seguretat Social. El cas més habitual és el del treballador que, alhora, és assalariat (Règim General) i autònom (RETA). Aquesta situació té implicacions específiques en la gestió de la Incapacitat Temporal (IT): les prestacions es calculen i gestionen de forma independent per a cada règim, amb bases reguladores separades i entitats gestores diferents. El metge de família a l'eCap ha d'emetre parts de baixa per a cada règim en el qual el treballador estigui d'alta.`,
    legalBasis: `NORMATIVA APLICABLE:

1. NORMATIVA ESTATAL BÀSICA:
• Art. 7.4 del RD 84/1996, de 26 de gener (Reglament General sobre Inscripció d'Empreses i Afiliació): defineix la pluriactivitat com la situació del treballador per compte propi i/o aliè les activitats del qual donin lloc a la seva alta obligatòria en dos o més règims distintos del sistema de la Seguretat Social.
• Art. 313 LGSS (RDL 8/2015, de 30 d'octubre): cotització en supòsits de pluriactivitat. Estableix la devolució del 50% de l'excés de cotització per contingències comunes quan la suma de quotes superi la base màxima.
• Arts. 169-172 LGSS: regulació general de la Incapacitat Temporal.
• Art. 175 LGSS: incompatibilitat de la IT amb el treball actiu (amb matisacions jurisprudencials per a la pluriactivitat).
• RD 625/2014, de 18 de juliol: gestió i control dels processos d'IT. Estableix que el professional sanitari ha d'emetre parts de baixa per a totes les empreses i règims en els quals el treballador presti serveis.

2. JURISPRUDÈNCIA CLAU:
• STS de 19 de febrer de 2002 (RCUD 2127/2001): doctrina fonamental sobre compatibilitat de la IT en un règim amb l'alta activa en un altre règim. El TS estableix que un treballador en pluriactivitat pot estar de baixa mèdica en un règim i, simultàniament, actiu en l'altre, sempre que les activitats siguin diferents i la dolença incapaciti per a una però no per a l'altra.
• STS de 7 d'abril de 2004 (RCUD 1508/2003): confirma i consolida la doctrina anterior sobre compatibilitat de la IT en pluriactivitat.
• STSJ Castella i Lleó (Valladolid), Sala Social, de 18 d'octubre de 2022, Rec. 232/2022: reafirma la vigència actual de la doctrina del TS sobre compatibilitat de la baixa mèdica en un règim amb l'activitat en un altre règim diferent.

3. NORMATIVA ESPECÍFICA RETA:
• Art. 313 LGSS: els autònoms en pluriactivitat que cotitzin per contingències comunes en el RETA tindran dret a la prestació d'IT per ambdós règims.
• Llei 6/2017, de 24 d'octubre, de Reformes Urgents del Treball Autònom: modifica l'art. 313 LGSS i estableix la devolució d'ofici de l'excés de cotització per la TGSS.
• Si l'autònom no cotitza per contingències comunes al RETA (opció voluntària quan ja té cobertura al Règim General), no tindrà dret a la prestació d'IT per compte propi.`,
    procedure: `PROCEDIMENT DES DE L'eCAP:

PRINCIPI FONAMENTAL: El metge de família ha d'emetre PARTS DE BAIXA SEPARATS per a cada règim en el qual el treballador estigui d'alta. No n'hi ha prou amb un únic part de baixa.

ESCENARI 1: INCAPACITAT TOTAL (la malaltia afecta ambdues activitats)
1. Emetre un part de baixa per a l'activitat assalariada (Règim General).
2. Emetre un part de baixa separat per a l'activitat autònoma (RETA).
3. Ambdós parts han d'indicar la mateixa contingència (malaltia comuna o accident no laboral si la causa és la mateixa).
4. El treballador ha de comunicar la situació a l'empresa i a la seva mútua d'autònoms.
5. La prestació d'IT del Règim General la gestiona la mútua de l'empresa o el INSS.
6. La prestació d'IT del RETA la gestiona la mútua d'autònoms triada pel treballador.
7. Ambdues prestacions es calculen de forma independent amb les seves respectives bases reguladores.

ESCENARI 2: INCAPACITAT PARCIAL (la malaltia afecta NOMÉS una de les activitats)
1. Emetre ÚNICAMENT el part de baixa per al règim afectat.
2. Documentar clarament en la història clínica per quina activitat s'emet la baixa i per quina no.
3. El treballador pot continuar treballant en l'activitat no afectada.
4. ATENCIÓ: el metge ha d'assegurar-se que la continuació de l'activitat no afectada no perjudica la recuperació.
5. El INSS pot revisar la situació si considera que l'activitat continuada posa en dubte la incapacitat declarada.

CÀLCUL DE LA PRESTACIÓ D'IT:
• Règim General: Base Reguladora = promig de les bases de cotització dels últims 12 mesos / 365 dies. Percentatge: 60% del dia 4 al 20; 75% del dia 21 en endavant.
• RETA: Base Reguladora = base de cotització del mes anterior a la baixa. Percentatge: 60% del dia 4 al 20; 75% del dia 21 en endavant (per malaltia comuna). Per AT/EP: 75% des del dia següent a la baixa.
• Les dues prestacions s'acumulen i el treballador les cobra simultàniament.

DEVOLUCIÓ DE L'EXCÉS DE COTITZACIÓ:
• Si la suma de les cotitzacions per contingències comunes al Règim General i al RETA supera la base màxima de cotització, la TGSS ha de retornar d'ofici el 50% de l'excés.
• La devolució es realitza durant el primer semestre de l'any següent.
• El treballador no ha de sol·licitar-ho; la TGSS ho gestiona automàticament.

ACCIDENT DE TREBALL EN PLURIACTIVITAT:
• Si l'accident ocorre en l'activitat autònoma: és AT al RETA, però es considera Malaltia Comuna (o Accident No Laboral) al Règim General.
• Si l'accident ocorre en l'activitat assalariada: és AT al Règim General, però es considera Malaltia Comuna al RETA.
• En cas d'AT al RETA: la prestació comença des del dia següent a la baixa (no hi ha espera de 3 dies).
• El metge de família ha d'emetre parts de baixa per a ambdós règims, indicant la contingència correcta per a cada un.`,
    examples: `EXEMPLES PRÀCTICS:

EXEMPLE 1: Metge de família que combina la sanitat pública (assalariat) i la clínica privada (autònom)
• Situació: El Dr. Martí treballa com a metge de família al CAP (Règim General) i té consulta privada pròpia (RETA).
• Patologia: Lumbalgia aguda que li impedeix treballar en ambdues activitats.
• Gestió: El metge de família del CAP (o ell mateix si és el seu propi metge) emet dos parts de baixa: un per al Règim General i un per al RETA.
• Prestació RG: Si la seva base de cotització al RG és de 3.000€/mes, la BR = 3.000/30 = 100€/dia. Cobra 60€/dia (dies 4-20) i 75€/dia (dia 21 en endavant).
• Prestació RETA: Si la seva base de cotització al RETA és de 2.000€/mes, la BR = 2.000/30 = 66,67€/dia. Cobra 40€/dia (dies 4-20) i 50€/dia (dia 21 en endavant).
• Total: Fins al dia 20: 100€/dia. A partir del dia 21: 125€/dia.

EXEMPLE 2: Infermer/a que combina hospital públic i clínica privada
• Situació: La Sra. Puig treballa a l'Hospital de la Vall d'Hebron (RG) i a una clínica privada com a autònoma (RETA).
• Patologia: Ansietat i depressió derivada de l'estrès laboral a l'hospital públic.
• Gestió: La dolença afecta principalment l'activitat a l'hospital (entorn estressant). Podria continuar treballant a la clínica privada si l'activitat és diferent i no perjudica la recuperació.
• Part de baixa: S'emet únicament per al Règim General.
• ATENCIÓ: El INSS pot revisar la situació. Cal documentar bé per quina activitat s'emet la baixa i justificar per quina no.
• Risc: Si el INSS considera que treballar a la clínica privada demostra capacitat laboral, pot donar l'alta al RG.

EXEMPLE 3: Fisioterapeuta autònom que treballa parcialment a una residència (assalariat)
• Situació: El Sr. Valls treballa 20h/setmana a una residència de gent gran (RG) i té la seva pròpia clínica de fisioteràpia (RETA).
• Patologia: Fractura de canell dret que li impedeix fer fisioteràpia però no tasques administratives.
• Gestió: Emet part de baixa per al RETA (no pot fer fisioteràpia). Pot continuar treballant a la residència si les tasques no requereixen l'ús del canell.
• Prestació RETA: Cobra la IT del RETA per la incapacitat per a la seva activitat autònoma.
• Activitat al RG: Continua treballant a la residència (tasques administratives o supervisió).
• IMPORTANT: Cal documentar clarament la diferència entre les activitats i que la continuació no perjudica la recuperació.

EXEMPLE 4: Accident de treball a l'activitat autònoma
• Situació: La Sra. Gómez és assalariada en una empresa de màrqueting (RG) i autònoma com a dissenyadora gràfica freelance (RETA).
• Accident: Cau per les escales de casa seva mentre anava a recollir material per a un client (AT in itinere al RETA).
• Gestió: AT al RETA (cobert per la mútua d'autònoms). Malaltia Comuna al RG (no va ocórrer treballant per a l'empresa).
• Parts de baixa: Dos parts: un per AT al RETA i un per MC al RG.
• Prestació RETA per AT: 75% de la BR des del dia següent a la baixa (sense espera de 3 dies).
• Prestació RG per MC: 60% de la BR des del dia 4 (3 dies de carència).

PREGUNTES FREQÜENTS:
• P: Si estic de baixa al RETA, he de seguir pagant la quota d'autònom?
  R: Sí, fins que la baixa duri més de 60 dies. A partir del dia 61, la mútua d'autònoms assumeix el pagament de la quota.
• P: Si esgoto la IT al RG, afecta la IT al RETA?
  R: Si la baixa és per la mateixa patologia i afecta ambdós règims, els terminis (365/545 dies) es computen de forma conjunta. Si les baixes són per causes independents, es computen per separat.
• P: Puc demanar la baixa només al RETA i continuar treballant com a assalariat?
  R: Sí, si la dolença afecta únicament l'activitat autònoma i no la assalariada, i sempre que continuar treballant no perjudiqui la recuperació.`
  };

  const insertSQL = 'INSERT INTO special_cases (id, title, category, description, legalBasis, `procedure`, examples, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
  const updateSQL = 'UPDATE special_cases SET title=?, category=?, description=?, legalBasis=?, `procedure`=?, examples=?, updatedAt=NOW() WHERE id=?';

  try {
    await conn.execute(insertSQL, [
      pluriactivitatCase.id,
      pluriactivitatCase.title,
      pluriactivitatCase.category,
      pluriactivitatCase.description,
      pluriactivitatCase.legalBasis,
      pluriactivitatCase.procedure,
      pluriactivitatCase.examples
    ]);
    console.log('Cas especial de pluriactivitat afegit correctament amb ID:', pluriactivitatCase.id);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('El cas especial ja existeix (ID:', pluriactivitatCase.id, '). Actualitzant...');
      await conn.execute(updateSQL, [
        pluriactivitatCase.title,
        pluriactivitatCase.category,
        pluriactivitatCase.description,
        pluriactivitatCase.legalBasis,
        pluriactivitatCase.procedure,
        pluriactivitatCase.examples,
        pluriactivitatCase.id
      ]);
      console.log('Cas especial actualitzat correctament.');
    } else {
      throw error;
    }
  }

  // Verificar que s'ha inserit correctament
  const [rows] = await conn.execute('SELECT id, title, category FROM special_cases WHERE id = ?', [pluriactivitatCase.id]);
  console.log('Verificació:', JSON.stringify(rows, null, 2));

  await conn.end();
}

main().catch(console.error);
