import { grunnprinsipperIktSikkerhetRecord } from "./grunnprinsipper-ikt-seed.js";
import { nis2Record } from "./nis2-seed.js";

export const componentMap = {
  input_text: "TextInput",
  textarea: "TextArea",
  select: "Select",
  input_text_disabled: "ReadOnlyInput",
  search_select_repeating: "TokenSelector",
  table: "EditableTable",
  file_upload: "FileUpload",
  display_text: "DisplayText",
  checkbox: "Checkbox",
  radio: "SegmentedBoolean",
  radio_1_to_5: "SegmentedScore"
};

function slugifyCatalogName(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createCatalogEntries(catalogKey, values) {
  const prefixes = {
    commonComponentsCatalog: "felleskomponent",
    standardsCatalog: "standard",
    tagsCatalog: "merkelapp"
  };
  const usedIds = new Set();

  return values.map((value) => {
    const entry = typeof value === "string" ? { name: value, description: "" } : value;
    const baseId = entry.id ?? `${prefixes[catalogKey] ?? "katalog"}-${slugifyCatalogName(entry.name) || "verdi"}`;
    let nextId = baseId;
    let suffix = 2;

    while (usedIds.has(nextId)) {
      nextId = `${baseId}-${suffix}`;
      suffix += 1;
    }

    usedIds.add(nextId);

    return {
      id: nextId,
      name: entry.name,
      description: entry.description ?? "",
      color: entry.color ?? ""
    };
  });
}

export const settingsCatalogs = {
  commonComponentsCatalog: createCatalogEntries("commonComponentsCatalog", [
    {
      name: "Det sentrale folkeregisteret (utgått)",
      description: "Tidligere nasjonal løsning for oppslag i folkeregisterdata; erstattet av nyere tjenester som FREG og Persontjenesten."
    },
    {
      name: "Altinn styring av tilgang",
      description: "Tjeneste for å delegere, administrere og kontrollere roller og rettigheter i Altinn og tilknyttede tjenester."
    },
    {
      name: "Bibliotekkortet",
      description: "Nasjonal løsning for felles bibliotekkort og identifikasjon av lånere på tvers av bibliotek."
    },
    {
      name: "DigiHelse",
      description: "Innbyggertjeneste for digital dialog med kommunale helse- og omsorgstjenester."
    },
    {
      name: "DigiSos",
      description: "Digital løsning for søknad, innsending av dokumentasjon og oppfølging av økonomisk sosialhjelp."
    },
    {
      name: "Digital postkasse til innbyggere",
      description: "Sikker løsning for å sende digital post fra offentlig sektor til innbyggere i valgt digital postkasse."
    },
    {
      name: "DIPS (utgått)",
      description: "Utgått henvisning til eldre DIPS-basert løsning eller integrasjon i helsesektoren."
    },
    {
      name: "eFormidling",
      description: "Felles infrastruktur for sikker digital meldingsutveksling mellom offentlige og private virksomheter."
    },
    {
      name: "eInnsyn",
      description: "Tjeneste for publisering og innsyn i offentlige postjournaler og dokumenter."
    },
    {
      name: "Elektronisk mottakerregister (ELMA)",
      description: "Register over elektroniske mottaksadresser for EHF og andre standardiserte elektroniske dokumenter."
    },
    {
      name: "Enhetsregisteret",
      description: "Grunndataregister over virksomheter, organisasjonsnummer og roller i Norge."
    },
    {
      name: "eSignering",
      description: "Fellesløsning for elektronisk signering av dokumenter."
    },
    {
      name: "Feide",
      description: "Felles innloggings- og tilgangsløsning for utdanningssektoren."
    },
    {
      name: "Felles datakatalog",
      description: "Nasjonal oversikt over datasett, API-er, begreper og informasjonsmodeller i offentlig sektor."
    },
    {
      name: "Fiks del dokument",
      description: "KS Fiks-tjeneste for sikker deling av dokumenter mellom virksomheter og systemer."
    },
    {
      name: "Fiks digiorden",
      description: "KS Fiks-tjeneste for digital samhandling om ordre, bestillinger eller oppdrag mellom aktører."
    },
    {
      name: "Fiks eDialog",
      description: "KS Fiks-tjeneste for sikker innsending av brev og henvendelser fra innbyggere til virksomheter."
    },
    {
      name: "Fiks folkeregister",
      description: "KS Fiks-integrasjon for oppslag, uttrekk og hendelseslister fra Skatteetatens moderniserte folkeregister."
    },
    {
      name: "Fiks IO",
      description: "KS Fiks-tjeneste for sikker integrasjon og informasjonsutveksling mellom systemer."
    },
    {
      name: "Fiks kjøretøyregister",
      description: "KS Fiks-integrasjon for oppslag i kjøretøy- og eierinformasjon."
    },
    {
      name: "Fiks MinSide",
      description: "KS Fiks-komponent for å bygge personaliserte MinSide-løsninger for innbyggere."
    },
    {
      name: "FIKS smittesporing",
      description: "KS Fiks-løsning for digital støtte til smittesporingsarbeid."
    },
    {
      name: "Fiks SvarInn",
      description: "KS Fiks-tjeneste for mottak av digital post og meldinger inn til virksomhetens systemer."
    },
    {
      name: "Fiks SvarUt",
      description: "KS Fiks-tjeneste for utsending av digital post til innbyggere og virksomheter."
    },
    {
      name: "Fiks vaksine",
      description: "KS Fiks-løsning for støtte til vaksinering og administrasjon av vaksinedata."
    },
    {
      name: "FREG modernisert folkeregister",
      description: "Skatteetatens moderniserte, API-baserte tilgang til folkeregisterdata."
    },
    {
      name: "Grunnboken",
      description: "Nasjonalt register over tinglyste eiendomsrettigheter, heftelser og pant."
    },
    {
      name: "ID-porten",
      description: "Felles innloggingsløsning for innbyggere til offentlige digitale tjenester."
    },
    {
      name: "Kartverket (utgått)",
      description: "Utgått henvisning til eldre kart- eller eiendomstjenester fra Kartverket."
    },
    {
      name: "Kjernejournal",
      description: "Nasjonal løsning for deling av sentrale helseopplysninger på tvers av helsevirksomheter."
    },
    {
      name: "Kontaktregisteret",
      description: "Register over innbyggeres kontaktopplysninger og reservasjon mot digital kommunikasjon."
    },
    {
      name: "KS Læring",
      description: "Plattform for digital læring og kompetanseutvikling i kommunal sektor."
    },
    {
      name: "KS svar inn (utgått)",
      description: "Eldre KS-løsning for mottak av digital post; erstattet av nyere Fiks-baserte tjenester."
    },
    {
      name: "KS SvarUt (utgått)",
      description: "Eldre KS-løsning for utsending av digital post; erstattet av nyere Fiks SvarUt."
    },
    {
      name: "Maskinporten",
      description: "Fellesløsning for maskin-til-maskin-autentisering og tilgangsstyring mot API-er."
    },
    {
      name: "Matrikkelen",
      description: "Norges offisielle register over eiendommer, adresser, bygninger og boliger."
    },
    {
      name: "Nasjonal portal for bekymringsmeldinger",
      description: "Digital løsning for innsending og håndtering av bekymringsmeldinger til offentlige tjenester."
    },
    {
      name: "Nasjonalt introduksjonsregister (NIR)",
      description: "Register for oppfølging av introduksjonsprogram og opplæring for nyankomne innvandrere."
    },
    {
      name: "Norsk Helsenett (utgått)",
      description: "Utgått henvisning til eldre nett- eller plattformtjenester som nå leveres som egne NHN-tjenester."
    },
    {
      name: "PAS (Utdanningsdirektoratets prøveadministrasjonssystem) (utgått)",
      description: "Eldre system for administrasjon av nasjonale prøver og eksamener i utdanningssektoren."
    },
    {
      name: "Persontjenesten (Norsk helsenett)",
      description: "Tjeneste som gir oppdaterte personopplysninger fra Folkeregisteret, KRR og Kartverket til helsesektoren."
    },
    {
      name: "Statistisk sentralbyrå (SSB) (utgått)",
      description: "Utgått henvisning til eldre integrasjon eller registerbruk mot SSB-data."
    },
    {
      name: "Tjenestebasert adressering (Helsenett)",
      description: "Løsning for å adressere meldinger til riktig helsetjeneste eller funksjon i helsenettet."
    }
  ]),
  standardsCatalog: createCatalogEntries("standardsCatalog", [
    {
      name: "Noark5",
      description: "Norsk standard for arkivdanning, journalføring og uttrekk i elektroniske arkivsystemer."
    },
    {
      name: "COLLADA",
      description: "Åpent XML-basert format for utveksling av 3D-modeller, scener og grafikk."
    },
    {
      name: "EDIPAC",
      description: "EDI-basert meldingsformat for strukturert utveksling av administrative eller faglige data mellom systemer."
    },
    {
      name: "EHF",
      description: "Elektronisk handelsformat for standardisert utveksling av ordre, faktura og andre handelsdokumenter."
    },
    {
      name: "GeoIntegrasjon",
      description: "Norsk standard for integrasjon og datautveksling mellom geodata-, kart- og fagsystemer."
    },
    {
      name: "HTML",
      description: "Standard språk for å beskrive struktur og innhold i nettsider."
    },
    {
      name: "JVM",
      description: "Spesifikasjon og kjøremiljø for å kjøre Java-baserte applikasjoner på tvers av plattformer."
    },
    {
      name: "LSB",
      description: "Linux Standard Base, et sett krav som gjør Linux-programvare mer portabel mellom distribusjoner."
    },
    {
      name: "Noark3",
      description: "Eldre norsk arkivstandard for journalføring og elektronisk arkiv."
    },
    {
      name: "Noark4",
      description: "Eldre norsk arkivstandard som videreførte og utvidet kravene i Noark3."
    },
    {
      name: "OAUTH",
      description: "Åpen standard for autorisasjon og delegering av tilgang til API-er og tjenester."
    },
    {
      name: "ODF",
      description: "Åpen dokumentstandard for tekst, regneark og presentasjoner."
    },
    {
      name: "OOXML",
      description: "XML-basert dokumentstandard for kontordokumenter som tekst, regneark og presentasjoner."
    },
    {
      name: "OXML",
      description: "Generell betegnelse for XML-baserte Office-dokumentformater og dokumentstrukturer."
    },
    {
      name: "RDBMS",
      description: "Relasjonsdatabase-system som lagrer data i tabeller med relasjoner og spørringer."
    },
    {
      name: "REST",
      description: "Arkitekturstil for API-er som bruker ressurser, URI-er og standard HTTP-operasjoner."
    },
    {
      name: "SAML",
      description: "Standard for utveksling av autentiserings- og autorisasjonsinformasjon mellom identitetsløsninger og tjenester."
    },
    {
      name: "SOAP",
      description: "Protokoll for strukturert meldingsutveksling mellom systemer, ofte brukt i eldre webtjenester."
    },
    {
      name: "SQL",
      description: "Standard språk for å definere, hente, endre og administrere data i relasjonsdatabaser."
    },
    {
      name: "SUS",
      description: "Single UNIX Specification, en standard for kompatibilitet på tvers av Unix-lignende systemer."
    },
    {
      name: "WAD",
      description: "XML-basert format for å beskrive webtjenester og endepunkter."
    },
    {
      name: "WCAG",
      description: "Retningslinjer for universell utforming og tilgjengelighet på web."
    },
    {
      name: "XML",
      description: "Markeringsspråk for strukturert datautveksling og dokumentbeskrivelse."
    }
  ]),
  tagsCatalog: createCatalogEntries("tagsCatalog", [
    { name: "HR", color: "blue" },
    { name: "Kritisk drift", color: "red" },
    { name: "Lønn", color: "green" },
    { name: "Personvern", color: "purple" }
  ])
};

const settingsCatalogIdByName = Object.fromEntries(
  Object.entries(settingsCatalogs).map(([catalogKey, items]) => [
    catalogKey,
    Object.fromEntries(items.map((item) => [item.name, item.id]))
  ])
);

export const sidebarNavigation = {
  systems: [
    { key: "application", label: "Applikasjoner", icon: "apps", href: "#/applications" },
    { key: "dataset", label: "Dataset", icon: "database", href: "#/datasets" },
    { key: "infrastructure", label: "Infrastruktur", icon: "dns", href: "#/infrastructure" }
  ],
  compliance: [
    { key: "nis2", label: "NIS2", icon: "security", href: "#/nis2" },
    {
      key: "grunnprinsipper_ikt_sikkerhet",
      label: "Grunnprinsipper for IKT-sikkerhet",
      icon: "security",
      href: "#/grunnprinsipper-ikt-sikkerhet"
    },
    { key: "controller_protocol", label: "Behandlingsansvarlig protokoll", icon: "assignment_ind", href: "#/controller-protocol" },
    { key: "processor_protocol", label: "Databehandler protokoll", icon: "security", href: "#/processor-protocol" }
  ],
  organization: [
    { key: "roles", label: "Roller", icon: "badge", href: "#/roles" },
    { key: "services", label: "Organisasjonsstruktur", icon: "account_tree", href: "#/services" }
  ]
};

export const topBarLinks = [
  { key: "systems", label: "Systemer", href: "#/applications" },
  { key: "compliance", label: "Etterlevelse", href: "#/nis2" },
  { key: "organization", label: "Organisasjon", href: "#/roles" }
];

export const organizationStructureData = [
  {
    serviceArea: "Oppvekst og utdanning",
    organizations: [
      {
        name: "Skole og læring",
        departments: ["Eksempelskolen", "SFO", "Pedagogisk støtte"]
      },
      {
        name: "Barnehage",
        departments: ["Kommunale barnehager", "Spesialpedagogisk team", "Foreldreveiledning"]
      }
    ]
  },
  {
    serviceArea: "Helse og velferd",
    organizations: [
      {
        name: "Helse og omsorg",
        departments: ["Hjemmetjenester", "Sykehjem", "Tildelingskontor"]
      },
      {
        name: "Psykisk helse og rus",
        departments: ["Oppfølgingsteam", "Lavterskeltilbud", "Koordinerende enhet"]
      }
    ]
  },
  {
    serviceArea: "Samfunn og infrastruktur",
    organizations: [
      {
        name: "Teknisk drift",
        departments: ["Vei og park", "Vann og avløp", "Eiendomsdrift"]
      },
      {
        name: "Plan og utvikling",
        departments: ["Arealplan", "Byggesak", "Geodata"]
      }
    ]
  },
  {
    serviceArea: "Stab og støtte",
    organizations: [
      {
        name: "Organisasjon og HR",
        departments: ["HR", "Lønn", "Arbeidsmiljø og utvikling"]
      },
      {
        name: "Digitalisering og fellestjenester",
        departments: ["IT-drift", "Informasjonssikkerhet", "Dokumentforvaltning"]
      }
    ]
  }
];

export const applicationInventoryItems = [
  {
    id: "APP-99432-HRM",
    name: "Visma Ent. HRM",
    vendor: "Visma Norge AS",
    version: "12.4",
    systemOwner: "HR-Avdelingen (HR-DIR)",
    criticality: "Høy",
    status: "Under vurdering",
    lastUpdated: "2026-03-24"
  },
  {
    id: "APP-21210-O365",
    name: "Microsoft 365",
    vendor: "Microsoft",
    version: "2026.3",
    systemOwner: "IT og digitalisering",
    criticality: "Kritisk",
    status: "Godkjent",
    lastUpdated: "2026-03-20"
  },
  {
    id: "APP-31002-SAK",
    name: "Sak/Arkiv",
    vendor: "Acos",
    version: "9.1",
    systemOwner: "Dokumentsenteret",
    criticality: "Middels",
    status: "Avvik funnet",
    lastUpdated: "2026-03-18"
  },
  {
    id: "APP-44113-FLYT",
    name: "Visma Flyt Skole",
    vendor: "Visma",
    version: "7.8",
    systemOwner: "Oppvekst og kultur",
    criticality: "Høy",
    status: "Godkjent",
    lastUpdated: "2026-03-15"
  }
];

export const datasetInventoryItems = [
  {
    id: "DS-9921-X",
    name: "Ansattregister_Hoved",
    purpose: "Lønnsutbetaling og HR-administrasjon for faste ansatte",
    description: "Primærdatasett for ansatte, lønn og fravær.",
    hostingType: "Cloud",
    cloudVariant: "Azure",
    hasPersonalData: true,
    hasSensitivePersonalData: true,
    lastUpdated: "2026-03-24",
    route: "#/datasets/barnevern-datasett"
  },
  {
    id: "DS-1044-B",
    name: "Produkt_Katalog_v2",
    purpose: "Offentlig oversikt over tilgjengelige tjenester og priser",
    description: "Publiseringsdatasett for produktinformasjon.",
    hostingType: "LocalServer",
    cloudVariant: "On-Prem",
    hasPersonalData: false,
    hasSensitivePersonalData: false,
    lastUpdated: "2026-03-12",
    route: "#/datasets/barnevern-datasett"
  },
  {
    id: "DS-4432-Y",
    name: "Kunde_Interaksjonslogg",
    purpose: "Loggføring av kundesupportsaker og chat-historikk",
    description: "Historikk for kundedialog og serviceforløp.",
    hostingType: "Cloud",
    cloudVariant: "SaaS",
    hasPersonalData: true,
    hasSensitivePersonalData: true,
    lastUpdated: "2026-03-25",
    route: "#/datasets/barnevern-datasett"
  },
  {
    id: "DS-8871-M",
    name: "Server_Performance_Logs",
    purpose: "Teknisk monitorering av kjerneinfrastruktur",
    description: "Operasjonelle logger og ytelsesdata.",
    hostingType: "LocalServer",
    cloudVariant: "Datacenter",
    hasPersonalData: false,
    hasSensitivePersonalData: false,
    lastUpdated: "2026-03-25",
    route: "#/datasets/barnevern-datasett"
  }
];

export const controllerProtocolInventoryItems = [
  {
    id: "CTRL-2023-0206",
    name: "Oppfølging av barnevernssaker",
    controller: "Min organisasjon",
    legalBasis: "Offentlig myndighet",
    status: "Godkjent",
    privacyRisk: "Høy",
    lastUpdated: "2026-03-21"
  },
  {
    id: "CTRL-2024-0112",
    name: "Ansattoppfølging og sykefravær",
    controller: "Min organisasjon",
    legalBasis: "Rettslig plikt",
    status: "Under vurdering",
    privacyRisk: "Middels",
    lastUpdated: "2026-03-19"
  },
  {
    id: "CTRL-2025-0721",
    name: "Tildeling av barnehageplass",
    controller: "Min organisasjon",
    legalBasis: "Offentlig myndighet",
    status: "Avvik funnet",
    privacyRisk: "Høy",
    lastUpdated: "2026-03-17"
  }
];

export const processorProtocolInventoryItems = [
  {
    id: "PROC-2026-0324",
    name: "Drift av sakssystem for kommunal oppfølging",
    processor: "Driftspartner AS",
    controllerCount: 2,
    status: "Godkjent",
    securityLevel: "Høy",
    lastUpdated: "2026-03-25"
  },
  {
    id: "PROC-2025-0910",
    name: "Sikker backup og gjenoppretting",
    processor: "Driftspartner AS",
    controllerCount: 4,
    status: "Under vurdering",
    securityLevel: "Middels",
    lastUpdated: "2026-03-20"
  },
  {
    id: "PROC-2025-1202",
    name: "Drift av HR-integrasjoner",
    processor: "SkyDrift Norge",
    controllerCount: 1,
    status: "Avvik funnet",
    securityLevel: "Høy",
    lastUpdated: "2026-03-16"
  }
];

export const mockRecords = {
  nis2: nis2Record,
  grunnprinsipper_ikt_sikkerhet: grunnprinsipperIktSikkerhetRecord,
  application: {
    id: "APP-99432-HRM",
    breadcrumbs: ["Systemer", "Applikasjoner", "Visma Ent. HRM"],
    description:
      "Enterprise Resource Management for moderne HR med samlet kontroll for lønn, personale og etterlevelse.",
    fieldValues: {
      name: "Visma Ent. HRM",
      version: "12.4",
      vendor: "Visma Norge AS",
      description:
        "Visma Enterprise HRM er en komplett løsning for personaladministrasjon, lønnskjøring og fraværshåndtering. Systemet er integrert med statlige registre og støtter komplekse tariffavtaler.",
      system_responsible: "Ola Nordmann",
      system_owner: "HR-Avdelingen (HR-DIR)",
      not_relevant_for_application: false,
      accessibility_statement_required: true,
      has_accessibility_statement: false,
      criticality: "Høy",
      annual_cost_ex_vat: "1450000",
      annual_indirect_cost_ex_vat: "260000",
      acquisition_cost: "3150000",
      agreement_signed_date: "2022-05-12",
      agreement_description: "Avtalen dekker lisens, vedlikehold, support og leverandørens forpliktelser knyttet til lønns- og HR-funksjonalitet.",
      termination_conditions: "Gjensidig oppsigelsesfrist på 12 måneder. Data skal utleveres i avtalt format ved avtalens opphør.",
      agreement_owner_role: "Systemeier HR",
      agreement_link: "https://systemkontroll.example.no/avtaler/visma-ent-hrm",
      technical_operations_supplier: "Visma Norge AS",
      supplier_organization_number: "912345678",
      supplier_contact_info: "Supportportal og dedikert kundekontakt",
      hosting_type: "Cloud",
      user_count: "850",
      lifecycle_status: "I drift",
      other_operations_notes: "Løsningen overvåkes av leverandør døgnet rundt og inngår i kommunens plan for beredskap og kontinuitet.",
      label_name: ""
    },
    collectionValues: {
      processor_agreements: [
        {
          "Leverandør / Part": "Visma Norge AS",
          "Dato inngått": "12.05.2022",
          "Sist revidert": "15.01.2024",
          Dokument: "HRM_DBA_2024.pdf"
        }
      ],
      links: [
        {
          Icon: "book",
          Lenke: "Brukerveiledning",
          Url: "https://intranett.example.no/wiki/visma-ent-hrm",
          Beskrivelse: "Intern wikiside med rutiner for HR-ansatte."
        },
        {
          Icon: "headphones",
          Lenke: "Kundesupport",
          Url: "https://support.visma.no/",
          Beskrivelse: "Direktelenke til Vismas supportportal."
        }
      ],
      organization_affiliations: [
        {
          Tjenesteområde: "Stab og støtte",
          Virksomhet: "Digitalisering og fellestjenester",
          Avdeling: "Informasjonssikkerhet"
        }
      ],
      los_main_topics: ["Administrasjon", "Helse og omsorg"],
      los_sub_topics: ["Lønn", "Personal"],
      information_security_items: ["Tilgangsstyring", "Årlig ROS-gjennomgang"],
      application_dataset_relations: [
        { Navn: "Ansattregister_Hoved", Rolle: "System of record" },
        { Navn: "Kunde_Interaksjonslogg", Rolle: "Forbruker" }
      ],
      common_components: [
        settingsCatalogIdByName.commonComponentsCatalog["ID-porten"],
        settingsCatalogIdByName.commonComponentsCatalog["Matrikkelen"],
        settingsCatalogIdByName.commonComponentsCatalog["KS SvarUt (utgått)"]
      ],
      standards: [
        settingsCatalogIdByName.standardsCatalog.Noark5,
        settingsCatalogIdByName.standardsCatalog.REST
      ],
      related_applications: [
        { Navn: "Visma Flyt Skole", Relasjon: "Integrasjon" },
        { Navn: "Sak/Arkiv", Relasjon: "Rapportering" }
      ],
      review_criteria: [
        { key: "service_orientation", label: "Tjenesteorientering", score: 4, comment: "Løsningen støtter kjerneprosesser godt, men noen integrasjoner kan modulariseres ytterligere." },
        { key: "interoperability", label: "Interoperabilitet", score: 3, comment: "Samhandler med flere systemer, men standardisering av grensesnitt bør styrkes." },
        { key: "accessibility", label: "Tilgjengelighet", score: 2, comment: "Tilgjengelighet er vurdert, men dokumentasjon og erklæring mangler fortsatt." },
        { key: "security", label: "Sikkerhet", score: 4, comment: "Tiltak for tilgangsstyring og logging er etablert og følges opp." },
        { key: "openness", label: "Åpenhet", score: 3, comment: "Datagrunnlag og beslutningsstøtte er delvis dokumentert." },
        { key: "flexibility", label: "Fleksibilitet", score: 3, comment: "Endringer kan gjennomføres, men krever fortsatt koordinering med leverandør." },
        { key: "scalability", label: "Skalerbarhet", score: 4, comment: "Løsningen tåler forventet vekst i brukere og datavolum." }
      ],
      historical_reviews: [
        { Kriterie: "Sikkerhet", Poengsum: "4", Kommentar: "Ny revisjon gjennomført uten avvik.", Dato: "2025-11-18" },
        { Kriterie: "Tilgjengelighet", Poengsum: "2", Kommentar: "Tiltak planlagt for å lukke dokumentasjonsgap.", Dato: "2025-11-18" }
      ],
      application_experts: [
        { Navn: "Ingrid Nilsen", "E-post": "ingrid.nilsen@example.no" },
        { Navn: "Lars Larsen", "E-post": "lars.larsen@example.no" }
      ],
      labels: [
        settingsCatalogIdByName.tagsCatalog.HR,
        settingsCatalogIdByName.tagsCatalog["Lønn"],
        settingsCatalogIdByName.tagsCatalog["Kritisk drift"]
      ]
    },
    meta: {
      lastModifiedBy: "Kari Nordmann",
      createdAt: "2019-11-14",
      lastUpdated: "2026-03-24"
    }
  },
  dataset: {
    id: "DS-7821-BV",
    breadcrumbs: ["Systemer", "Datasett", "Barnevern Datasett"],
    description:
      "Sentralt register for håndtering av barnevernssaker, inkludert oppfølgingstiltak og juridisk dokumentasjon.",
    fieldValues: {
      name: "Barnevern Datasett",
      description: "Komplett oversikt over aktive og avsluttede barnevernssaker i kommunen.",
      purpose:
        "Behandlingen støtter saksbehandling, dokumentasjon og lovpålagt oppfølging innen barnevernstjenesten.",
      has_master_data: true,
      has_personal_data: true,
      has_sensitive_personal_data: true,
      hosting_type: "LocalServer"
    },
    collectionValues: {
      information_elements: [
        {
          Navn: "Fødselsnummer",
          Beskrivelse: "Unik identifikator for barnet",
          "Person-opplysninger": "Ja",
          "Sensitive personopplysninger": "Nei"
        },
        {
          Navn: "Tiltakshistorikk",
          Beskrivelse: "Oversikt over iverksatte hjelpetiltak",
          "Person-opplysninger": "Ja",
          "Sensitive personopplysninger": "Ja"
        }
      ],
      links: [
        {
          Icon: "document",
          Lenke: "Databehandleravtale v2",
          Url: "https://systemkontroll.example.no/dokumenter/databehandleravtale-v2.pdf",
          Beskrivelse: "Signert avtale for drift"
        },
        {
          Icon: "document",
          Lenke: "Arkivplan barnevern",
          Url: "https://systemkontroll.example.no/dokumenter/arkivplan-barnevern.docx",
          Beskrivelse: "Rutine for langtidslagring"
        }
      ],
      application_relations: [
        { Navn: "Visma Ent. HRM", Versjon: "12.4", Rolle: "Kilde" },
        { Navn: "Sak/Arkiv", Versjon: "9.1", Rolle: "Arkiv" }
      ],
      related_datasets: [{ Navn: "Familieoppfølging", Relasjon: "Koplet datasett" }],
      related_processing_activities: [
        { Navn: "Barnevernssak", Formål: "Saksbehandling og lovpålagt oppfølging" }
      ]
    },
    meta: {
      lastModifiedBy: "Anne Olsen",
      createdAt: "2022-08-30",
      lastUpdated: "2026-03-25"
    }
  },
  controller_protocol: {
    id: "CTRL-2023-0206",
    breadcrumbs: ["Etterlevelse", "Behandlingsansvarlig protokoll", "Ny behandling (02-06-2023)"],
    description:
      "Protokollvisning for behandlingsansvarlig med tydelig struktur for formål, kategorier, sikkerhetstiltak og rettslig grunnlag.",
    fieldValues: {
      name: "Oppfølging av barnevernssaker",
      processing_description: "Registrering og oppfølging av tiltak, vedtak og kommunikasjon i barnevernssaker.",
      controller: "Min organisasjon",
      data_protection_officer: "Kari Nordmann",
      joint_controllers: ["NAV Troms og Finnmark"],
      purposes: ["Saksbehandling", "Statistikkformål"],
      data_subject_categories: ["Barn", "Foresatte", "Verge"],
      personal_data_categories: ["Navn", "Kontaktopplysninger", "Straffbare forhold (artikkel 10)"],
      recipient_categories: ["Pårørende", "Skolehelsetjeneste", "Verge"],
      third_country_or_international_organization: "Ikke relevant",
      guarantees_or_agreement: ["Standard databehandleravtale", "Intern behandlingsprotokoll"],
      deletion_of_personal_data: "Opplysninger slettes eller arkiveres i henhold til arkivlov og kommunal bevaringsplan.",
      security_measures:
        "Tilgangsstyring med rollebaserte rettigheter, kryptert lagring, sikkerhetskopi og årlig revisjon av driftsrutiner.",
      article_6_legal_basis: ["6.1.c Nødvendig for å oppfylle en rettslig plikt", "6.1.e Nødvendig for å utføre en oppgave i offentlig interesse eller utøve offentlig myndighet"],
      article_6_reason: "Kommunen er lovpålagt å behandle opplysninger i barnevernssaker.",
      article_9_10_legal_basis: ["9.2.g Har hjemmel i lov og hensyn til viktig allmenn interesse"],
      article_9_10_reason: "Behandlingen gjelder særlige kategorier når helse- og familiesituasjon dokumenteres.",
      legal_obligation: "Barnevernsloven og tilhørende forskrifter",
      high_privacy_risk: true,
      personal_data_source: ["Den registrerte", "Foresatte", "Offentlig dataregister"],
      data_processors: ["Driftspartner AS"],
      data_processor_agreements: [{ Leverandør: "Driftspartner AS", "Signert dato": "10.02.2024", Status: "Aktiv" }],
      internal_responsible: "Anne Olsen",
      additional_notes: "DPIA er gjennomført og oppdateres årlig."
    },
    collectionValues: {
      datasets: [{ Navn: "Barnevern Datasett", Rolle: "Primærdatasett" }]
    },
    meta: {
      lastModifiedBy: "Kari Nordmann",
      createdAt: "2023-06-02",
      lastUpdated: "2026-03-21"
    }
  },
  processor_protocol: {
    id: "PROC-2026-0324",
    breadcrumbs: ["Etterlevelse", "Databehandler protokoll", "Ny behandling (24-03-2026)"],
    description:
      "Protokollvisning for databehandler med fokus på behandlingskategorier, tredjestatsoverføringer og interne sikkerhetstiltak.",
    fieldValues: {
      name: "Drift av sakssystem for kommunal oppfølging",
      processor: "Driftspartner AS",
      controllers: ["Min organisasjon", "Samarbeidsorganisasjon"],
      data_protection_officer: "Kari Nordmann",
      processing_categories: ["Lagring", "Bruk", "Registrering", "Utlevering ved overføring"],
      third_country_or_international_organization: "Ingen tredjestatsoverføring",
      guarantees_or_agreement: "Underlagt norsk databehandleravtale og driftsinstruks.",
      security_measures:
        "MFA for administratorer, segmentert nettverk, kryptert backup, hendelseslogging og dokumentert beredskapsplan.",
      internal_responsible: "Per Hansen",
      additional_notes: "Årlig revisjon utføres sammen med kundens sikkerhetsansvarlige."
    },
    collectionValues: {},
    meta: {
      lastModifiedBy: "Per Hansen",
      createdAt: "2026-03-24",
      lastUpdated: "2026-03-25"
    }
  },
  roles: {
    id: "ORG-540291",
    breadcrumbs: ["Organisasjon", "Roller", "Min organisasjon"],
    description:
      "Administrasjon av organisasjonsinformasjon, kontaktroller og personvernerklæringer for virksomheten.",
    fieldValues: {
      organization_name: "Min organisasjon",
      organization_number: "999999999",
      label_name: ""
    },
    collectionValues: {
      application_experts: [
        { Navn: "Ola Nordmann", "E-post": "ola.nordmann@example.no" },
        { Navn: "Kari Nordmann", "E-post": "kari.nordmann@example.no" }
      ],
      system_responsibles: [
        { Navn: "Ola Nordmann", Epost: "ola.nordmann@example.no" },
        { Navn: "Kari Nordmann", Epost: "kari.nordmann@example.no" },
        { Navn: "Per Hansen", Epost: "per.hansen@example.no" }
      ],
      system_owners: [{ Navn: "HR-avdelingen", Epost: "hr@example.no" }],
      controllers: [{ Navn: "Min organisasjon", Epost: "postmottak@example.no", Fra: "2024-01-01", Til: "Aktiv" }],
      controller_representatives: [{ Navn: "Kari Nordmann", Epost: "kari.nordmann@example.no" }],
      joint_controllers: [{ Navn: "KS Digital", Epost: "kontakt@ks.no" }],
      data_protection_officers: [{ Navn: "Kari Nordmann", Epost: "kari.nordmann@example.no", Fra: "2023-09-01", Til: "Aktiv" }],
      processor_protocol_controllers: [{ Navn: "Min organisasjon", Epost: "postmottak@example.no" }],
      privacy_statements: [{ Fil: "standard-personvernerklaering.pdf", "Sist oppdatert": "2026-02-14", Type: "Standard erklæring" }],
      labels: [
        settingsCatalogIdByName.tagsCatalog.HR,
        settingsCatalogIdByName.tagsCatalog.Personvern,
        settingsCatalogIdByName.tagsCatalog["Kritisk drift"]
      ]
    },
    meta: {
      lastModifiedBy: "Ola Nordmann",
      createdAt: "2021-03-12",
      lastUpdated: "2026-03-18"
    }
  }
};

export const screenRegistry = [
  {
    id: "nis2.detail",
    entityKey: "nis2",
    pageFamily: "EntityDetailPage",
    route: "#/nis2",
    topSection: "compliance",
    navKey: "nis2",
    recordKey: "nis2",
    title: "NIS2",
    description: "Kommunetilpasset NIS2-sjekkliste med oversikt, kontrollpunkter og lokal oppfølging.",
    tabSource: "model",
    actions: [{ label: "Lagre endringer", icon: "save", tone: "primary" }],
    sectionLayouts: {
      overview: { span: 12, icon: "shield", tone: "accent" },
      scope_and_governance: { span: 12, icon: "clipboard" },
      risk_and_assets_access: { span: 12, icon: "tasks" },
      protection: { span: 12, icon: "shield" },
      detection_and_response: { span: 12, icon: "alert", tone: "accent" },
      continuity_and_suppliers: { span: 12, icon: "toolbox" },
      training_documentation_improvement: { span: 12, icon: "notebook" }
    }
  },
  {
    id: "grunnprinsipper_ikt_sikkerhet.detail",
    entityKey: "grunnprinsipper_ikt_sikkerhet",
    pageFamily: "EntityDetailPage",
    route: "#/grunnprinsipper-ikt-sikkerhet",
    topSection: "compliance",
    navKey: "grunnprinsipper_ikt_sikkerhet",
    recordKey: "grunnprinsipper_ikt_sikkerhet",
    title: "Grunnprinsipper for IKT-sikkerhet",
    description: "NSMs grunnprinsipper for IKT-sikkerhet med oversikt, grunnprinsipper og lokal oppfølging av tiltak.",
    tabSource: "model",
    actions: [{ label: "Lagre endringer", icon: "save", tone: "primary" }],
    sectionLayouts: {
      overview: { span: 12, icon: "shield", tone: "accent" },
      gp_1_1: { span: 12, icon: "clipboard" },
      gp_1_2: { span: 12, icon: "clipboard" },
      gp_1_3: { span: 12, icon: "clipboard" },
      gp_2_1: { span: 12, icon: "shield" },
      gp_2_2: { span: 12, icon: "shield" },
      gp_2_3: { span: 12, icon: "shield" },
      gp_2_4: { span: 12, icon: "shield" },
      gp_2_5: { span: 12, icon: "shield" },
      gp_2_6: { span: 12, icon: "shield" },
      gp_2_7: { span: 12, icon: "shield" },
      gp_2_8: { span: 12, icon: "shield" },
      gp_2_9: { span: 12, icon: "shield" },
      gp_2_10: { span: 12, icon: "shield" },
      gp_3_1: { span: 12, icon: "alert", tone: "accent" },
      gp_3_2: { span: 12, icon: "alert", tone: "accent" },
      gp_3_3: { span: 12, icon: "alert", tone: "accent" },
      gp_3_4: { span: 12, icon: "alert", tone: "accent" },
      gp_4_1: { span: 12, icon: "toolbox" },
      gp_4_2: { span: 12, icon: "toolbox" },
      gp_4_3: { span: 12, icon: "toolbox" },
      gp_4_4: { span: 12, icon: "toolbox" }
    }
  },
  {
    id: "applications.inventory",
    entityKey: "application",
    pageFamily: "InventoryListPage",
    route: "#/applications",
    topSection: "systems",
    navKey: "application",
    title: "Applikasjoner",
    searchPlaceholder: "Søk i applikasjoner, leverandør eller systemeier...",
    description: "Oversikt over registrerte applikasjoner med status, kritikalitet, eierskap og siste oppdatering.",
    actions: [{ label: "Ny applikasjon", icon: "add", actionId: "add-application" }],
    columns: [
      { key: "name", label: "Navn" },
      { key: "vendor", label: "Leverandør" },
      { key: "version", label: "Versjon" },
      { key: "status", label: "Status" },
      { key: "criticality", label: "Kritikalitet" },
      { key: "lastUpdated", label: "Sist oppdatert" }
    ]
  },
  {
    id: "datasets.inventory",
    entityKey: "dataset",
    pageFamily: "InventoryListPage",
    route: "#/datasets",
    topSection: "systems",
    navKey: "dataset",
    title: "Datasett",
    searchPlaceholder: "Søk i datasett, formål eller merkelapper...",
    description:
      "Sentral oversikt over alle registrerte datasett i organisasjonen, inkludert lagringsformål, vertstype og personvernklassifisering.",
    actions: [{ label: "Nytt datasett", icon: "add", actionId: "add-dataset" }],
    filterDefinitions: [
      { key: "hosting", label: "Driftsplassering", type: "segmented", options: [{ label: "Alle", value: "all" }, { label: "Sky", value: "cloud" }, { label: "Lokal", value: "local" }] },
      { key: "privacy", label: "Personvernstatus", type: "segmented", options: [{ label: "Alle", value: "all" }, { label: "Sensitive", value: "sensitive" }, { label: "Personopplysninger", value: "personal" }, { label: "Ikke sensitivt", value: "public" }] }
    ],
    columns: [
      { key: "name", label: "Navn" },
      { key: "purpose", label: "Formål" },
      { key: "hosting", label: "Driftsplassering" },
      { key: "privacy", label: "Personvernstatus" },
      { key: "lastUpdated", label: "Sist oppdatert" }
    ],
    idLabel: true,
    lastUpdated: true,
    statusBadge: true,
    hostingBadge: true,
    rowActions: true,
    secondaryInsights: true
  },
  {
    id: "controller.inventory",
    entityKey: "controller_protocol",
    pageFamily: "InventoryListPage",
    route: "#/controller-protocol",
    topSection: "compliance",
    navKey: "controller_protocol",
    title: "Behandlingsansvarlig protokoll",
    searchPlaceholder: "Søk i behandlinger, behandlingsansvarlig eller behandlingsgrunnlag...",
    description: "Oversikt over registrerte behandlingsaktiviteter for behandlingsansvarlig med status, risiko og siste oppdatering.",
    actions: [{ label: "Ny behandling", icon: "add", actionId: "add-controller-protocol" }],
    columns: [
      { key: "name", label: "Navn" },
      { key: "controller", label: "Behandlingsansvarlig" },
      { key: "legalBasis", label: "Behandlingsgrunnlag" },
      { key: "status", label: "Status" },
      { key: "privacyRisk", label: "Personvernrisiko" },
      { key: "lastUpdated", label: "Sist oppdatert" }
    ]
  },
  {
    id: "processor.inventory",
    entityKey: "processor_protocol",
    pageFamily: "InventoryListPage",
    route: "#/processor-protocol",
    topSection: "compliance",
    navKey: "processor_protocol",
    title: "Databehandler protokoll",
    searchPlaceholder: "Søk i behandlinger, databehandler eller oppdragsgivere...",
    description: "Oversikt over registrerte behandlingsaktiviteter for databehandler med status, sikkerhetsnivå og siste oppdatering.",
    actions: [{ label: "Ny behandling", icon: "add", actionId: "add-processor-protocol" }],
    columns: [
      { key: "name", label: "Navn" },
      { key: "processor", label: "Databehandler" },
      { key: "controllerCount", label: "Oppdragsgivere" },
      { key: "status", label: "Status" },
      { key: "securityLevel", label: "Sikkerhetsnivå" },
      { key: "lastUpdated", label: "Sist oppdatert" }
    ]
  },
  {
    id: "applications.detail",
    entityKey: "application",
    pageFamily: "EntityDetailPage",
    route: "#/applications/detail",
    aliases: ["#/applications/visma-ent-hrm"],
    topSection: "systems",
    navKey: "application",
    recordKey: "application",
    title: "Visma Ent. HRM",
    tabSource: "model",
    actions: [{ label: "Logg", icon: "history", tone: "ghost" }, { label: "Lagre endringer", icon: "save", tone: "primary" }],
    sectionLayouts: {
      general_information: { span: 12, icon: "info", tone: "default" },
      accessibility: { span: 12, icon: "accessibility", tone: "accent", callout: "accessibility" },
      data_processor_agreements: { span: 12, icon: "contract" },
      links: { span: 12, icon: "link", presentation: "linkGrid" },
      organization_structure: { span: 12, icon: "account_tree", tone: "tint" },
      information_security: { span: 12, icon: "verified_user", presentation: "chips" },
      criticality: { span: 12, icon: "priority_high", tone: "accent" },
      visualization: { span: 12, icon: "hub", tone: "accent" },
      datasets: { span: 12, icon: "database" },
      related_applications: { span: 12, icon: "device_hub" },
      common_components: { span: 12, icon: "hub" },
      standards: { span: 12, icon: "code" },
      review_criteria: { span: 12, icon: "rule" },
      historical_reviews: { span: 12, icon: "history" },
      financial_overview: { span: 12, icon: "payments" },
      operations_overview: { span: 12, icon: "dns", tone: "accent" },
      application_experts: { span: 12, icon: "group" },
      labels: { span: 12, icon: "sell", presentation: "labels" }
    }
  },
  {
    id: "datasets.detail",
    entityKey: "dataset",
    pageFamily: "EntityDetailPage",
    route: "#/datasets/barnevern-datasett",
    topSection: "systems",
    navKey: "dataset",
    recordKey: "dataset",
    title: "Barnevern Datasett",
    tabSource: "model",
        actions: [{ label: "Lagre utkast", icon: "draft", tone: "ghost" }, { label: "Lagre endringer", icon: "save", tone: "primary" }],
    sectionLayouts: {
      general_information: { span: 12, icon: "info" },
      data_characteristics: { span: 12, icon: "checklist", tone: "accent" },
      hosting: { span: 12, icon: "cloud_done" },
      information_elements: { span: 12, icon: "list_alt" },
      links: { span: 12, icon: "link", presentation: "linkGridCompact" },
      applications: { span: 12, icon: "apps" },
      related_datasets: { span: 12, icon: "dataset_linked" },
      related_processing_activities: { span: 12, icon: "gavel" }
    }
  },
  {
    id: "controller.detail",
    entityKey: "controller_protocol",
    pageFamily: "EntityDetailPage",
    route: "#/controller-protocol/detail",
    aliases: ["#/controller-protocol/ny-behandling-02-06-2023"],
    topSection: "compliance",
    navKey: "controller_protocol",
    recordKey: "controller_protocol",
    title: "Ny behandling (02-06-2023)",
    tabSource: "model",
    tabModes: { summary: "summary" },
    actions: [{ label: "Eksportér utskrift", icon: "print", tone: "ghost" }, { label: "Lagre endringer", icon: "save", tone: "primary" }],
    sectionLayouts: {
      general_information: { span: 12, icon: "description" },
      organization_context: { span: 12, icon: "corporate_fare", tone: "tint" },
      purpose_and_categories: { span: 12, icon: "category" },
      transfer_and_guarantees: { span: 12, icon: "public" },
      retention_and_security: { span: 12, icon: "shield" },
      legal_basis: { span: 12, icon: "gavel", tone: "accent" },
      risk_sources_processors: { span: 12, icon: "warning" },
      dataset_relations: { span: 12, icon: "database" },
      print_view: { span: 12, icon: "print" }
    }
  },
  {
    id: "processor.detail",
    entityKey: "processor_protocol",
    pageFamily: "EntityDetailPage",
    route: "#/processor-protocol/detail",
    aliases: ["#/processor-protocol/ny-behandling-24-03-2026"],
    topSection: "compliance",
    navKey: "processor_protocol",
    recordKey: "processor_protocol",
    title: "Ny behandling (24-03-2026)",
    tabSource: "model",
    tabModes: { summary: "summary" },
    actions: [{ label: "Lagre endringer", icon: "save", tone: "primary" }],
    sectionLayouts: {
      general_information: { span: 12, icon: "description" },
      role_and_organization_context: { span: 12, icon: "badge", tone: "tint" },
      processing_categories: { span: 12, icon: "view_list" },
      transfer_and_guarantees: { span: 12, icon: "public" },
      security_and_internal_follow_up: { span: 12, icon: "shield" },
      print_view: { span: 12, icon: "print" }
    }
  },
  {
    id: "roles.admin",
    entityKey: "roles",
    pageFamily: "AdminSectionsPage",
    route: "#/roles",
    topSection: "organization",
    navKey: "roles",
    recordKey: "roles",
    title: "Min organisasjon",
    sectionSource: "model",
    actions: [{ label: "Lagre endringer", icon: "save", tone: "primary" }],
    sectionLayouts: {
      organization_information: { span: 12, icon: "domain", tone: "accent" },
      application_experts: { span: 12, icon: "support_agent" },
      system_responsibles: { span: 12, icon: "badge" },
      system_owners: { span: 12, icon: "badge" },
      controllers: { span: 12, icon: "security" },
      controller_representatives: { span: 12, icon: "groups" },
      joint_controllers: { span: 12, icon: "hub" },
      data_protection_officers: { span: 12, icon: "verified_user" },
      processor_protocol_controllers: { span: 12, icon: "apartment" },
      privacy_statement: { span: 12, icon: "description" }
    }
  },
  {
    id: "settings.admin",
    entityKey: "settings",
    pageFamily: "SettingsPage",
    route: "#/settings",
    topSection: "systems",
    navKey: "settings",
    title: "Innstillinger",
    description: "Konfigurer sentrale referanselister som brukes på tvers av applikasjoner og arkitekturregistrering.",
    actions: []
  },
  {
    id: "infrastructure.placeholder",
    entityKey: "infrastructure",
    pageFamily: "PlaceholderPage",
    route: "#/infrastructure",
    topSection: "systems",
    navKey: "infrastructure",
    title: "Infrastruktur",
    description: "Oversikt over registrert infrastruktur og tilknyttede driftskomponenter.",
    actions: [{ label: "Nytt infrastrukturelement", icon: "add", tone: "primary", actionId: "add-infrastructure" }]
  },
  {
    id: "services.placeholder",
    entityKey: "services",
    pageFamily: "OrganizationStructurePage",
    route: "#/services",
    topSection: "organization",
    navKey: "services",
    title: "Organisasjonsstruktur",
    description: "Hierarkisk oversikt over tjenesteområder, virksomheter og avdelinger, basert på organisasjonsdata importert fra HTML-kilden.",
    actions: [{ label: "Lagre endringer", icon: "save", tone: "primary" }]
  }
];

export function resolveHostingMeta(hostingType, variant) {
  const map = {
    Cloud: { label: `Sky${variant ? ` (${variant})` : ""}`, icon: "cloud_done", tone: "tag--primary" },
    PrivateCloud: { label: "Privat sky", icon: "cloud", tone: "tag--primary" },
    CloudAndLocal: { label: "Sky/lokalt", icon: "cloud_sync", tone: "tag--primary" },
    LocalServer: { label: variant ? `Lokal (${variant})` : "Lokal server", icon: "dns", tone: "tag--success" },
    ExternalServer: { label: "Ekstern server", icon: "lan", tone: "tag--success" }
  };
  return map[hostingType] ?? { label: hostingType ?? "Ukjent", icon: "device_unknown", tone: "tag--primary" };
}

export function resolvePrivacyMeta(item) {
  if (item.hasSensitivePersonalData) {
    return { label: "Sensitive", tone: "tag--error", icon: "warning" };
  }
  if (item.hasPersonalData) {
    return { label: "Personopplysninger", tone: "tag--primary", icon: "verified_user" };
  }
  return { label: "Ikke sensitivt", tone: "tag--success", icon: "check_circle" };
}
