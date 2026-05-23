function joinReferences(...references) {
  return references.filter(Boolean).join(" ; ");
}

function createChecklistRow(
  id,
  question,
  description,
  fieldType,
  predefinedAnswers,
  priority,
  responsibleRole,
  referenceUrl,
  status = "Ikke vurdert",
  comment = ""
) {
  return {
    ID: id,
    "Spørsmål": question,
    Beskrivelse: description,
    Felttype: fieldType,
    Svaralternativer: predefinedAnswers,
    Prioritet: priority,
    "Ansvarlig rolle": responsibleRole,
    Referanse: referenceUrl,
    Status: status,
    Kommentar: comment
  };
}

const yesPartialNoUnknown = "Ja; Delvis; Nei; Vet ikke";

const scopeAndGovernanceRows = [
  createChecklistRow(
    "SCOPE-01",
    "Er kommunen (inkl. KF/IKS) kartlagt mot NIS2-sektorer og norsk digitalsikkerhetslov?",
    "Dokumenter om kommunen leverer tjenester i NIS2-vedlegg, for eksempel drikkevann og avløpsvann, og hvilke enheter som inngår i vurderingen.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "Kommunedirektør; CISO/sikkerhetsleder; IT-leder; Juridisk",
    joinReferences(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555",
      "https://nsm.no/regelverk-og-hjelp/digitalsikkerhetsloven-og-forskriften/",
      "https://www.regjeringen.no/no/sub/eos-notatbasen/notatene/2021/feb/nis2-direktivet/id2846097/"
    )
  ),
  createChecklistRow(
    "SCOPE-02",
    "Er kommunens samfunnskritiske tjenester og digitale avhengigheter definert og prioritert?",
    "List opp kritiske tjenester og hvilke nettverk, informasjonssystemer, skyløsninger og leverandører de er avhengige av.",
    "textarea",
    "",
    "Høy",
    "Kommunedirektør; Tjenesteiere; IT-leder; Beredskapsansvarlig",
    joinReferences(
      "https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/identifisere-og-kartlegge/kartlegg-enheter-og-programvare/",
      "https://www.ks.no/fagomrader/digitalisering/sikkerhet/anbefalte-felles-sikkerhetskrav-for-kommunal-sektor/veiledning-anbefalte-driftskrav-til-kommunen-og-dets-driftsorganisasjon/"
    )
  ),
  createChecklistRow(
    "SCOPE-03",
    "Er det avklart om NIS2 kan gjelde kommunen som lokal offentlig administrasjon?",
    "Dokumenter status, antakelser og oppfølging av nasjonal implementering for lokal offentlig administrasjon.",
    "dropdown",
    "Inkludert i nasjonal implementering; Ikke inkludert; Uavklart",
    "Middels",
    "Kommunedirektør; Juridisk; CISO/sikkerhetsleder",
    joinReferences(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555",
      "https://www.regjeringen.no/no/sub/eos-notatbasen/notatene/2021/feb/nis2-direktivet/id2846097/"
    )
  ),
  createChecklistRow(
    "SCOPE-04",
    "Er ansvarlig sektortilsyn og varslingsmottak identifisert for kommunens tjenester?",
    "Dokumenter tilsynsmyndighet per sektor og hvordan varsling skal sendes, inkludert kopi til NSM der det er relevant.",
    "textarea",
    "",
    "Høy",
    "CISO/sikkerhetsleder; Beredskapsansvarlig; Juridisk",
    joinReferences(
      "https://nsm.no/regelverk-og-hjelp/digitalsikkerhetsloven-og-forskriften/varsle-om-hendelser-etter-digitalsikkerhetsloven",
      "https://www.mattilsynet.no/drikkevannsforsyning/krav-til-vannverk-i-digitalsikkerhetsloven"
    )
  ),
  createChecklistRow(
    "GOV-01",
    "Har toppledelsen godkjent cybersikkerhetsrisikotiltak og følger opp gjennomføring?",
    "Dokumenter ledelsesbeslutning, mandat og rapporteringsfrekvens for cybersikkerhetstiltakene.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "Kommunedirektør; Kommunalsjef; CISO/sikkerhetsleder",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  ),
  createChecklistRow(
    "GOV-02",
    "Har ledelsen gjennomført og planlagt opplæring i cybersikkerhetsrisiko?",
    "Dokumenter kurs, dato og plan for periodisk repetisjon for medlemmer av ledelsen.",
    "date",
    "",
    "Høy",
    "Kommunedirektør; HR; CISO/sikkerhetsleder",
    joinReferences(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555",
      "https://www.ks.no/fagomrader/digitalisering/digital-kompetanse/informasjonssikkerhet-og-personvern/veiviser-for-a-styrke-robusthet/"
    )
  ),
  createChecklistRow(
    "GOV-03",
    "Er roller og ansvar for digital sikkerhet definert, dokumentert og kommunisert?",
    "Definer ansvar for sikkerhetsleder, IT-drift, tjenesteeiere, innkjøp, HR, beredskap og kommunikasjon, inkludert beslutningsmyndighet ved hendelser.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "Kommunedirektør; CISO/sikkerhetsleder; HR",
    joinReferences(
      "https://www.ks.no/fagomrader/digitalisering/sikkerhet/slik-sikrer-du-oppfolging-av-personvern-og-informasjonssikkerhet/",
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
    )
  ),
  createChecklistRow(
    "GOV-04",
    "Finnes det en overordnet sikkerhetspolicy og mål som dekker NIS2-krav?",
    "Policyen bør dekke risikostyring, hendelser, leverandørstyring, logging, tilgang, kryptering, kontinuitet og kompetanse.",
    "file upload",
    "",
    "Høy",
    "CISO/sikkerhetsleder; IT-leder; Juridisk",
    joinReferences(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555",
      "https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/introduksjon/de-fire-kategoriene/"
    )
  ),
  createChecklistRow(
    "GOV-05",
    "Er cybersikkerhet integrert i kommunens internkontroll og virksomhetsstyring?",
    "Sikre at informasjonssikkerhet inngår i ordinær internkontroll med oversikt, ansvar, risiko, tiltaksplan og rapportering.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "Kommunedirektør; Økonomi/controlling; CISO/sikkerhetsleder",
    "https://www.ks.no/fagomrader/digitalisering/sikkerhet/slik-sikrer-du-oppfolging-av-personvern-og-informasjonssikkerhet/"
  )
];

const riskAndAssetsRows = [
  createChecklistRow(
    "RISK-01",
    "Er det etablert metode for risikoanalyse og system- og informasjonssikkerhet?",
    "Metoden bør dekke all hazards, fysisk miljø der relevant og støtte kommunens risikobaserte prioriteringer.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "CISO/sikkerhetsleder; IT-leder; Beredskapsansvarlig",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  ),
  createChecklistRow(
    "RISK-02",
    "Gjennomføres risikovurderinger regelmessig og ved større endringer?",
    "Dokumenter frekvens, hendelsesdrevne vurderinger og hvilke endringer som utløser ny vurdering.",
    "dropdown",
    "Kvartalsvis; Halvårlig; Årlig; Ved behov; Ikke etablert",
    "Høy",
    "CISO/sikkerhetsleder; IT-leder; Tjenesteeiere",
    joinReferences(
      "https://www.ks.no/fagomrader/digitalisering/sikkerhet/slik-sikrer-du-oppfolging-av-personvern-og-informasjonssikkerhet/",
      "https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/identifisere-og-kartlegge/kartlegg-enheter-og-programvare/"
    )
  ),
  createChecklistRow(
    "RISK-03",
    "Finnes tiltaksplan for å håndtere uakseptabel risiko, med ansvar og frister?",
    "Tiltaksplanen bør vise tiltak, eier, frist, status og ledelsesoppfølging.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "Kommunedirektør; CISO/sikkerhetsleder; Tjenesteeiere",
    "https://www.ks.no/fagomrader/digitalisering/sikkerhet/slik-sikrer-du-oppfolging-av-personvern-og-informasjonssikkerhet/"
  ),
  createChecklistRow(
    "ASSET-01",
    "Finnes oppdatert oversikt over enheter og programvare?",
    "Kommunen bør ha prosess og helst automatiserte verktøy for å kartlegge maskinvare, programvare og uforvaltede enheter.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "IT-leder; Drift; CISO/sikkerhetsleder",
    "https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/identifisere-og-kartlegge/kartlegg-enheter-og-programvare/"
  ),
  createChecklistRow(
    "ASSET-02",
    "Er det definert retningslinjer for godkjente enheter og programvare?",
    "Omfatter policy for hva som er tillatt, hvordan avvik håndteres og hvordan ukjente enheter følges opp.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "IT-leder; CISO/sikkerhetsleder; HR",
    "https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/identifisere-og-kartlegge/kartlegg-enheter-og-programvare/"
  ),
  createChecklistRow(
    "ASSET-03",
    "Er kritiske systemer, data og avhengigheter dokumentert i kart eller arkitektur?",
    "Oversikten skal støtte beredskap, segmentering og prioritering av tiltak, inkludert interne og eksterne avhengigheter.",
    "textarea",
    "",
    "Høy",
    "IT-arkitekt; IT-leder; Beredskapsansvarlig",
    "https://www.ks.no/fagomrader/digitalisering/sikkerhet/anbefalte-felles-sikkerhetskrav-for-kommunal-sektor/veiledning-anbefalte-driftskrav-til-kommunen-og-dets-driftsorganisasjon/"
  ),
  createChecklistRow(
    "ACC-01",
    "Brukes flerfaktorautentisering for brukere og særlig administratorer?",
    "MFA er særlig viktig for administrative kontoer og fjernaksess.",
    "dropdown",
    "Alltid; Delvis (noen systemer); Planlagt; Ikke brukt",
    "Høy",
    "IT-leder; Drift; CISO/sikkerhetsleder",
    joinReferences(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555",
      "https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/identifisere-og-kartlegge/kartlegg-enheter-og-programvare/"
    )
  ),
  createChecklistRow(
    "ACC-02",
    "Er tilgangsstyring basert på minste privilegium og regelmessig tilgangsrevisjon etablert?",
    "Krever rollebasert tilgang, periodisk attestasjon og streng håndtering av privilegerte tilganger.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "IT-leder; Systemeiere; CISO/sikkerhetsleder",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  ),
  createChecklistRow(
    "ACC-03",
    "Er offboarding-prosessen dokumentert og testet?",
    "Prosessen skal fjerne tilganger ved fratredelse og være integrert med HR-rutiner.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "HR; IT-leder; CISO/sikkerhetsleder",
    "https://www.ks.no/fagomrader/digitalisering/digital-kompetanse/informasjonssikkerhet-og-personvern/veiviser-for-a-styrke-robusthet/"
  )
];

const protectionRows = [
  createChecklistRow(
    "PROTECT-01",
    "Er nettverk segmentert slik at kritiske soner som VA, helse og administrasjon isoleres?",
    "Segmentering begrenser spredning ved kompromittering og støtter minste privilegium.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "IT-arkitekt; Drift; CISO/sikkerhetsleder",
    joinReferences(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555",
      "https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/introduksjon/de-fire-kategoriene/"
    )
  ),
  createChecklistRow(
    "PROTECT-02",
    "Er sårbarhetshåndtering og patching etablert med klare frister for kritiske oppdateringer?",
    "Etabler rutiner for scanning, prioritering og hurtig patching av særlig internett-eksponerte tjenester.",
    "dropdown",
    "<48t kritisk; <7d kritisk; <30d kritisk; Ad hoc; Ikke etablert",
    "Høy",
    "IT-drift; CISO/sikkerhetsleder",
    joinReferences(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555",
      "https://nsm.no/fagomrader/digital-sikkerhet/nasjonalt-cybersikkerhetssenter/digital-beredskap-i-en-skjerpet-situasjon/"
    )
  ),
  createChecklistRow(
    "PROTECT-03",
    "Er sikker konfigurasjon og harding standardisert og etterlevd?",
    "Krever baselines for klienter, servere og nettverk, samt avvikshåndtering og verifikasjon.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "IT-drift; IT-arkitekt; CISO/sikkerhetsleder",
    "https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/identifisere-og-kartlegge/kartlegg-enheter-og-programvare/"
  ),
  createChecklistRow(
    "PROTECT-04",
    "Er kryptering og kryptografi policybasert for data i ro og i transitt?",
    "Dokumenter når og hvor kryptering brukes, samt tilhørende nøkkelrutiner.",
    "radio/options",
    yesPartialNoUnknown,
    "Middels",
    "IT-sikkerhet; Systemeiere; CISO/sikkerhetsleder",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  ),
  createChecklistRow(
    "PROTECT-05",
    "Er sikker e-post- og nettleserbeskyttelse etablert?",
    "Omfatter tekniske kontroller og brukeradferd som reduserer risiko fra skadevare og phishing.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "IT-drift; CISO/sikkerhetsleder",
    "https://www.ks.no/fagomrader/digitalisering/digital-kompetanse/informasjonssikkerhet-og-personvern/veiviser-for-a-styrke-robusthet/"
  ),
  createChecklistRow(
    "PROTECT-06",
    "Er endringshåndtering integrert med sikkerhet og testing før produksjon?",
    "Endringer bør risikovurderes og testes før produksjonssetting.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "IT-leder; Endringsråd/CAB; Systemeiere",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  )
];

const detectionAndResponseRows = [
  createChecklistRow(
    "DETECT-01",
    "Er sikkerhetslogging definert med innhold, oppbevaringstid og tilgangskontroll?",
    "Logging må være tilstrekkelig til å oppdage, undersøke og dokumentere hendelser.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "IT-sikkerhet; Drift; Personvernombud",
    "https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/introduksjon/de-fire-kategoriene/"
  ),
  createChecklistRow(
    "DETECT-02",
    "Er sikkerhetsovervåkning etablert for kritiske systemer?",
    "Dokumenter om overvåkning skjer 24/7, i utvidet åpningstid eller kun i kontortid.",
    "dropdown",
    "24/7; Utvidet åpningstid; Kontortid; Ikke etablert",
    "Høy",
    "IT-leder; CISO/sikkerhetsleder; Driftspartner",
    joinReferences(
      "https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/introduksjon/de-fire-kategoriene/",
      "https://www.ks.no/fagomrader/digitalisering/sikkerhet/anbefalte-felles-sikkerhetskrav-for-kommunal-sektor/"
    )
  ),
  createChecklistRow(
    "DETECT-03",
    "Er det etablert rutiner for intern eskalering og varsling ved alarmer?",
    "Definer terskler, kontaktliste, vaktordning og krav til dokumentasjon ved håndtering.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "CISO/sikkerhetsleder; IT-vakt; Beredskapsansvarlig",
    "https://nsm.no/regelverk-og-hjelp/digitalsikkerhetsloven-og-forskriften/varsle-om-hendelser-etter-digitalsikkerhetsloven"
  ),
  createChecklistRow(
    "IR-01",
    "Finnes en dokumentert hendelseshåndteringsplan for kommunen?",
    "Planen bør inkludere roller, triage, isolering, kommunikasjon, bevis og gjenoppretting.",
    "file upload",
    "",
    "Høy",
    "CISO/sikkerhetsleder; IT-leder; Beredskapsansvarlig",
    joinReferences(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555",
      "https://nsm.no/regelverk-og-hjelp/digitalsikkerhetsloven-og-forskriften/varsle-om-hendelser-etter-digitalsikkerhetsloven"
    )
  ),
  createChecklistRow(
    "IR-02",
    "Øves hendelseshåndtering regelmessig, både tabletop og teknisk?",
    "Dokumenter øvelsesplan, særlig for ransomware og bortfall av kritiske tjenester, og læringspunkter etter øvelsene.",
    "dropdown",
    "Kvartalsvis; Halvårlig; Årlig; Ad hoc; Ikke øvd",
    "Middels",
    "Beredskapsansvarlig; IT-leder; Kommunikasjon",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  ),
  createChecklistRow(
    "IR-03",
    "Er kriterier for alvorlig eller vesentlig hendelse definert?",
    "Definer terskler for hva som regnes som signifikant hendelse for kommunen og dens tjenester.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "CISO/sikkerhetsleder; Beredskapsansvarlig; Tjenesteeiere",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  ),
  createChecklistRow(
    "IR-04",
    "Kan kommunen levere tidlig varsel innen 24 timer ved signifikant hendelse?",
    "Dokumenter prosess, ansvar og informasjonsminimum, inkludert vurdering av mistanke om ondsinnet handling.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "CISO/sikkerhetsleder; IT-vakt; Beredskapsansvarlig",
    joinReferences(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555",
      "https://nsm.no/regelverk-og-hjelp/digitalsikkerhetsloven-og-forskriften/varsle-om-hendelser-etter-digitalsikkerhetsloven"
    )
  ),
  createChecklistRow(
    "IR-05",
    "Kan kommunen sende oppdatering innen 72 timer og sluttrapport innen én måned?",
    "Etabler maler for status, påvirkning, indikatorer på kompromittering, rotårsak og korrigerende tiltak.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "CISO/sikkerhetsleder; IT-leder; Juridisk",
    joinReferences(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555",
      "https://www.mattilsynet.no/drikkevannsforsyning/krav-til-vannverk-i-digitalsikkerhetsloven"
    )
  ),
  createChecklistRow(
    "IR-06",
    "Er prosess for varsling til tjenestemottakere og innbyggere etablert?",
    "Kommunen bør ha plan for innbyggerinformasjon, kanalvalg og samordning med beredskapsledelsen.",
    "radio/options",
    yesPartialNoUnknown,
    "Middels",
    "Kommunikasjon; Beredskapsledelse; Tjenesteeiere",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  )
];

const continuityAndSuppliersRows = [
  createChecklistRow(
    "BC-01",
    "Er Business Impact Analysis gjennomført for kritiske tjenester?",
    "BIA gir grunnlag for RTO, RPO og prioritering av gjenoppretting for kritiske tjenester.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "Beredskapsansvarlig; Tjenesteeiere; IT-leder",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  ),
  createChecklistRow(
    "BC-02",
    "Finnes testing av backup og gjenoppretting for kritiske data?",
    "Test jevnlig at restore faktisk fungerer, inkludert isolerte eller offline kopier der det er relevant.",
    "dropdown",
    "Månedlig; Kvartalsvis; Halvårlig; Årlig; Ikke testet",
    "Høy",
    "IT-drift; IT-leder; Beredskapsansvarlig",
    joinReferences(
      "https://nsm.no/fagomrader/digital-sikkerhet/nasjonalt-cybersikkerhetssenter/digital-beredskap-i-en-skjerpet-situasjon/",
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
    )
  ),
  createChecklistRow(
    "BC-03",
    "Er kriseledelse og kontinuitetsplanverk koblet mot IKT-hendelser?",
    "Sikre integrasjon mellom kommunal kriseledelse, tjenestekontinuitet og IT-hendelseshåndtering.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "Beredskapsansvarlig; Kommunedirektør; CISO/sikkerhetsleder",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  ),
  createChecklistRow(
    "SUP-01",
    "Gjennomføres leverandørrisikovurdering for kritiske leveranser som sky, drift og fagsystem?",
    "Dokumenter metode og kritikalitet per leverandør og underleverandør.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "Innkjøp; IT-leder; CISO/sikkerhetsleder",
    joinReferences(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555",
      "https://www.ks.no/fagomrader/digitalisering/sikkerhet/slik-sikrer-du-oppfolging-av-personvern-og-informasjonssikkerhet/"
    )
  ),
  createChecklistRow(
    "SUP-02",
    "Inneholder kontrakter krav til sikkerhetstiltak, hendelsesvarsling og revisjonsrett?",
    "Kontrakter bør stille krav til sikkerhet, underleverandørkontroll, patching, loggtilgang og tidsfrister for leverandørvarsling.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "Innkjøp; Juridisk; CISO/sikkerhetsleder",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  ),
  createChecklistRow(
    "SUP-03",
    "Er leverandørkjeden kartlagt for kritiske tjenester, inkludert underleverandører?",
    "Dokumenter hvem som leverer hva, hvor data behandles og hvem som kan påvirke drift eller sikkerhet.",
    "textarea",
    "",
    "Høy",
    "Innkjøp; IT-arkitekt; Tjenesteeiere",
    "https://www.ks.no/fagomrader/digitalisering/sikkerhet/slik-sikrer-du-oppfolging-av-personvern-og-informasjonssikkerhet/"
  ),
  createChecklistRow(
    "SUP-04",
    "Finnes felles opplegg for oppfølging av leverandører med målinger, møter og avvikshåndtering?",
    "Dokumenter faste sikkerhetsmøter, KPI-er, oppfølging av revisjonsfunn og plan for forbedring.",
    "radio/options",
    yesPartialNoUnknown,
    "Middels",
    "Innkjøp; Leverandøransvarlig; CISO/sikkerhetsleder",
    "https://www.ks.no/fagomrader/digitalisering/sikkerhet/anbefalte-felles-sikkerhetskrav-for-kommunal-sektor/"
  )
];

const trainingDocumentationImprovementRows = [
  createChecklistRow(
    "TRAIN-01",
    "Har alle ansatte grunnleggende opplæring i cyberhygiene?",
    "Omfatter passord, phishing, trygg bruk av enheter og sikker lagring av informasjon.",
    "dropdown",
    "Årlig; Halvårlig; Ved ansettelse; Ad hoc; Ikke etablert",
    "Middels",
    "HR; CISO/sikkerhetsleder; Linjeledere",
    joinReferences(
      "https://www.ks.no/fagomrader/digitalisering/digital-kompetanse/informasjonssikkerhet-og-personvern/veiviser-for-a-styrke-robusthet/",
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
    )
  ),
  createChecklistRow(
    "TRAIN-02",
    "Finnes spesialisert opplæring for IT og personell med kritiske roller?",
    "Målrettet opplæring bør dekke hendelser, logganalyse, gjenoppretting og leverandørstyring for nøkkelroller.",
    "radio/options",
    yesPartialNoUnknown,
    "Middels",
    "IT-leder; CISO/sikkerhetsleder; Tjenesteeiere",
    joinReferences(
      "https://www.kins.no/kurs/nis2-direktivet/",
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
    )
  ),
  createChecklistRow(
    "DOC-01",
    "Er innmelding av samfunnsviktige tjenester gjennomført der kommunen omfattes?",
    "For samfunnsviktige tjenester skal virksomhet og tjeneste meldes inn etter NSMs rutiner, med én tjeneste per skjema der det kreves.",
    "radio/options",
    "Ja; Delvis; Nei; Ikke relevant",
    "Høy",
    "Kommunedirektør; Juridisk; CISO/sikkerhetsleder",
    "https://nsm.no/regelverk-og-hjelp/digitalsikkerhetsloven-og-forskriften/innmelding-av-samfunnsviktige-tjenester-etter-digitalsikkerhetsloven"
  ),
  createChecklistRow(
    "DOC-02",
    "Foreligger dokumentert bevispakke for tilsyn?",
    "Kommunen bør kunne vise policy, risiko, logger, øvelser, leverandørkrav og annen relevant dokumentasjon.",
    "radio/options",
    yesPartialNoUnknown,
    "Middels",
    "CISO/sikkerhetsleder; IT-leder; Kvalitet/internkontroll",
    "https://www.ks.no/fagomrader/digitalisering/sikkerhet/slik-sikrer-du-oppfolging-av-personvern-og-informasjonssikkerhet/"
  ),
  createChecklistRow(
    "AUDIT-01",
    "Gjennomføres intern revisjon eller effektmåling av sikkerhetstiltak?",
    "Etabler kontrollprogram, internrevisjon eller eksterne tester som vurderer effekten av tiltakene.",
    "dropdown",
    "Kvartalsvis; Halvårlig; Årlig; Ad hoc; Ikke etablert",
    "Middels",
    "Internkontroll; CISO/sikkerhetsleder; IT-leder",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  ),
  createChecklistRow(
    "AUDIT-02",
    "Gjennomføres tekniske tester av kritiske tjenester, som sårbarhetsskann eller pentest?",
    "Et dokumentert testregime gjør det mulig å måle faktisk sikkerhetsnivå og forbedring over tid.",
    "radio/options",
    yesPartialNoUnknown,
    "Middels",
    "IT-sikkerhet; IT-leder; Tjenesteeiere",
    "https://nsm.no/regelverk-og-hjelp/rad-og-anbefalinger/introduksjon/de-fire-kategoriene/"
  ),
  createChecklistRow(
    "CLOSE-01",
    "Er det etablert prosess for å lukke avvik raskt og uten unødig opphold?",
    "Dokumenter avvik, risiko, kompenserende tiltak og hvordan avvik lukkes innen rimelig tid.",
    "radio/options",
    yesPartialNoUnknown,
    "Høy",
    "CISO/sikkerhetsleder; IT-leder; Kommunedirektør",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32022L2555"
  )
];

export const nis2Record = {
  id: "NIS2-KOMMUNE-001",
  recordKey: "nis2",
  entityKey: "nis2",
  breadcrumbs: ["Etterlevelse", "NIS2"],
  description:
    "Kommunetilpasset NIS2-sjekkliste med oversikt, kontrollpunkter, ansvar og lokal oppfølging av cybersikkerhet og digital robusthet.",
  fieldValues: {
    name: "NIS2-sjekkliste for kommune",
    legal_status_in_norway:
      "Digitalsikkerhetsloven og digitalsikkerhetsforskriften trådte i kraft 1. oktober 2025 og krever varsling ved hendelser som virker betydelig inn på tjenesteleveransen. NIS2 er per 28. mars 2026 ikke innført som norsk lov, men norske myndigheter forbereder gjennomføring av NIS2 og CER i norsk rett. Denne siden kan derfor brukes som modenhets- og etterlevelsessjekkliste også før endelig nasjonal innplassering er avklart.",
    governance_and_reporting_requirements:
      "NIS2 krever at ledelsen godkjenner cybersikkerhetstiltak, følger opp gjennomføring og gjennomfører opplæring. Minimumstiltakene omfatter blant annet hendelseshåndtering, kontinuitet og backup, leverandørkjede, sårbarhetshåndtering, kryptering, tilgangsstyring, inventar, MFA og sikker kommunikasjon. Ved signifikante hendelser skal tidlig varsel kunne sendes innen 24 timer, hendelsesvarsling innen 72 timer og sluttrapport innen én måned.",
    municipal_relevance:
      "For kommuner er NIS2 særlig relevant for tjenester og avhengigheter knyttet til drikkevann, avløpsvann, helse- og omsorgskjeden, kritiske felleskomponenter og andre digitale tjenester med stor innbygger- eller samfunnspåvirkning. Direktivet åpner også for at nasjonale myndigheter kan la lokal offentlig administrasjon omfattes. Denne sjekklisten er derfor tilpasset en kommunal kontekst med tjenesteeiere, IT-drift, beredskap, innkjøp, HR og kommunedirektørens internkontroll.",
    implementation_recommendations:
      "Anbefalt gjennomføring er å starte med scope-kartlegging, kritiske tjenester og varslingsberedskap, deretter grunnsikring som inventar, MFA, patching, logging og backup- og restore-test, og til slutt bygge modenhet i leverandørstyring, effektmåling, revisjon og kontinuerlig forbedring. Kjør gjerne første utfylling som workshop og rapporter minst kvartalsvis til ledelsen.",
    recommended_answer_scale:
      "Bruk gjerne Ja, Delvis, Nei eller Vet ikke som standardskala der kontrollpunktet legger opp til valg. Suppler med kommentarer, ansvarlig rolle og lenker til dokumentasjon der det er relevant."
  },
  collectionValues: {
    scope_and_governance: scopeAndGovernanceRows,
    risk_and_assets_access: riskAndAssetsRows,
    protection: protectionRows,
    detection_and_response: detectionAndResponseRows,
    continuity_and_suppliers: continuityAndSuppliersRows,
    training_documentation_improvement: trainingDocumentationImprovementRows
  },
  meta: {
    lastModifiedBy: "SystemKontroll",
    createdAt: "2026-03-28",
    lastUpdated: "2026-03-28"
  }
};
