import { mockRecords, settingsCatalogs } from "../../public/screen-specs.js";

export const NAV_BOTTOM_ITEMS = [
  { key: "settings", label: "Innstillinger", href: "#/settings" },
  { key: "help", label: "Hjelp", href: "#/help" },
  { key: "logout", label: "Logg ut", href: "#/logout" }
];

export const ORGANIZATION_ROOT_NODE_ID = "organization-root";

export function parseHash(hash) {
  const normalizedHash = hash && hash !== "#" ? hash : "#/applications";
  const [routePath, queryString = ""] = normalizedHash.split("?");
  return {
    routePath,
    query: Object.fromEntries(new URLSearchParams(queryString).entries())
  };
}

export function readHash() {
  return window.location.hash || "#/applications";
}

export function resolveScreen(screenRegistry, routePath) {
  return screenRegistry.find((screen) => [screen.route, ...(screen.aliases ?? [])].includes(routePath));
}

export function resolveActiveTab(tabs, requestedTab) {
  return tabs.find((tab) => tab.key === requestedTab) ?? tabs[0] ?? null;
}

export function routeSectionFromHref(screenRegistry, href) {
  return resolveScreen(screenRegistry, href)?.topSection ?? "systems";
}

export function sidebarSectionLabel(sectionKey) {
  return {
    systems: "Systemer",
    compliance: "Etterlevelse",
    organization: "Organisasjon"
  }[sectionKey];
}

function inventoryStateKey(entityKey) {
  return {
    application: "applicationItems",
    controller_protocol: "controllerProtocolItems",
    dataset: "datasetItems",
    processor_protocol: "processorProtocolItems"
  }[entityKey];
}

function entityBaseBreadcrumbs(entityKey) {
  switch (entityKey) {
    case "nis2":
      return ["Etterlevelse", "NIS2"];
    case "grunnprinsipper_ikt_sikkerhet":
      return ["Etterlevelse", "Grunnprinsipper for IKT-sikkerhet"];
    case "application":
      return ["Systemer", "Applikasjoner"];
    case "dataset":
      return ["Systemer", "Datasett"];
    case "controller_protocol":
      return ["Etterlevelse", "Behandlingsansvarlig protokoll"];
    case "processor_protocol":
      return ["Etterlevelse", "Databehandler protokoll"];
    default:
      return ["SystemKontroll"];
  }
}

export function detailRouteForEntity(entityKey, recordId = "") {
  const baseRoute = {
    application: "#/applications/detail",
    controller_protocol: "#/controller-protocol/detail",
    dataset: "#/datasets/barnevern-datasett",
    processor_protocol: "#/processor-protocol/detail"
  }[entityKey];

  if (!baseRoute || !recordId) {
    return baseRoute;
  }

  return `${baseRoute}?id=${encodeURIComponent(recordId)}`;
}

function coerceTrimmedString(value, fallback = "") {
  const normalizedValue = String(value ?? "").trim();
  return normalizedValue || fallback;
}

function createStableNodeId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeCatalogLookupKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

const TAG_COLOR_VALUES = new Set(["blue", "teal", "green", "purple", "pink", "orange", "red", "yellow", "gray"]);

function normalizeCatalogColor(catalogKey, value) {
  const normalizedValue = String(value ?? "").trim().toLowerCase();
  if (catalogKey === "tagsCatalog") {
    return TAG_COLOR_VALUES.has(normalizedValue) ? normalizedValue : "blue";
  }
  return normalizedValue;
}

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

export function createCatalogItemId(catalogKey, name, existingIds = new Set()) {
  const prefixes = {
    commonComponentsCatalog: "felleskomponent",
    standardsCatalog: "standard",
    tagsCatalog: "merkelapp"
  };
  const baseId = `${prefixes[catalogKey] ?? "katalog"}-${slugifyCatalogName(name) || "verdi"}`;
  let nextId = baseId;
  let suffix = 2;

  while (existingIds.has(nextId)) {
    nextId = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return nextId;
}

function coerceFirstArrayValue(value, fallback = "") {
  if (Array.isArray(value)) {
    return coerceTrimmedString(value[0], fallback);
  }
  return coerceTrimmedString(value, fallback);
}

function resolveLinkIconKey(value) {
  const normalizedValue = String(value ?? "").trim().toLowerCase();
  return [
    "link",
    "book",
    "headphones",
    "globe",
    "document",
    "people",
    "chat",
    "phone",
    "home",
    "apps",
    "info",
    "question",
    "open",
    "mail",
    "calendar",
    "video",
    "image",
    "folder",
    "star",
    "briefcase",
    "building",
    "building_people",
    "cloud",
    "code",
    "document_text",
    "notebook",
    "note",
    "megaphone",
    "location",
    "map",
    "person",
    "person_support",
    "shield",
    "wrench",
    "toolbox",
    "clipboard",
    "tasks",
    "database",
    "archive",
    "receipt",
    "tag",
    "news",
    "car",
    "desktop",
    "laptop",
    "server",
    "download",
    "upload",
    "scan",
    "sparkle",
    "gift",
    "alert",
    "question_simple"
  ].includes(normalizedValue)
    ? normalizedValue
    : "link";
}

function applyInventorySummaryToRecord(entityKey, record, item = {}) {
  record.listSummary = {
    ...(record.listSummary ?? {}),
    ...item
  };

  switch (entityKey) {
    case "application":
      record.fieldValues = {
        ...(record.fieldValues ?? {}),
        name: item.name ?? record.fieldValues?.name ?? "",
        vendor: item.vendor ?? record.fieldValues?.vendor ?? "",
        version: item.version ?? record.fieldValues?.version ?? "",
        system_owner: item.systemOwner ?? record.fieldValues?.system_owner ?? "",
        lifecycle_status: item.status ?? record.fieldValues?.lifecycle_status ?? "",
        criticality: item.criticality ?? record.fieldValues?.criticality ?? ""
      };
      return;
    case "dataset":
      record.fieldValues = {
        ...(record.fieldValues ?? {}),
        name: item.name ?? record.fieldValues?.name ?? "",
        purpose: item.purpose ?? record.fieldValues?.purpose ?? "",
        description: item.description ?? record.fieldValues?.description ?? "",
        hosting_type: item.hostingType ?? record.fieldValues?.hosting_type ?? "",
        has_personal_data: item.hasPersonalData ?? record.fieldValues?.has_personal_data ?? false,
        has_sensitive_personal_data: item.hasSensitivePersonalData ?? record.fieldValues?.has_sensitive_personal_data ?? false
      };
      return;
    case "controller_protocol":
      record.fieldValues = {
        ...(record.fieldValues ?? {}),
        name: item.name ?? record.fieldValues?.name ?? "",
        controller: item.controller ?? record.fieldValues?.controller ?? ""
      };
      if (!record.fieldValues.article_6_reason && item.legalBasis) {
        record.fieldValues.article_6_reason = item.legalBasis;
      }
      return;
    case "processor_protocol":
      record.fieldValues = {
        ...(record.fieldValues ?? {}),
        name: item.name ?? record.fieldValues?.name ?? "",
        processor: item.processor ?? record.fieldValues?.processor ?? ""
      };
      return;
    default:
      return;
  }
}

function normalizeLinkCollections(record, seedRecord = null) {
  if (!record?.collectionValues?.links || !Array.isArray(record.collectionValues.links)) {
    return;
  }

  const seedLinks = Array.isArray(seedRecord?.collectionValues?.links) ? seedRecord.collectionValues.links : [];
  const seedByKey = new Map(
    seedLinks.map((item) => [
      `${String(item?.Lenke ?? "").trim()}|${String(item?.Beskrivelse ?? "").trim()}`,
      item
    ])
  );

  record.collectionValues.links = record.collectionValues.links.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return item;
    }

    const title = String(item?.Lenke ?? item?.link ?? "").trim();
    const description = String(item?.Beskrivelse ?? item?.description ?? "").trim();
    const existingUrl = String(item?.Url ?? item?.url ?? "").trim();
    const seedMatch = seedByKey.get(`${title}|${description}`);
    const seededUrl = String(seedMatch?.Url ?? "").trim();
    const seededIcon = String(seedMatch?.Icon ?? "").trim();

    return {
      ...item,
      Icon: resolveLinkIconKey(item?.Icon ?? seededIcon),
      Lenke: title,
      Url: existingUrl || seededUrl,
      Beskrivelse: description
    };
  });
}

const CONTROLLER_PROTOCOL_MULTI_VALUE_FIELDS = [
  "joint_controllers",
  "purposes",
  "data_subject_categories",
  "personal_data_categories",
  "recipient_categories",
  "guarantees_or_agreement",
  "article_6_legal_basis",
  "article_9_10_legal_basis",
  "personal_data_source",
  "data_processors"
];

function normalizeControllerProtocolFields(record) {
  if (!record?.fieldValues || typeof record.fieldValues !== "object") {
    return;
  }

  CONTROLLER_PROTOCOL_MULTI_VALUE_FIELDS.forEach((key) => {
    if (Array.isArray(record.fieldValues[key]) || typeof record.fieldValues[key] === "string") {
      record.fieldValues[key] = normalizeStringCollectionValue(record.fieldValues[key]);
    }
  });

  if (typeof record.fieldValues.high_privacy_risk === "string") {
    const normalizedValue = record.fieldValues.high_privacy_risk.trim().toLowerCase();
    if (normalizedValue.startsWith("ja")) {
      record.fieldValues.high_privacy_risk = true;
    } else if (normalizedValue.startsWith("nei")) {
      record.fieldValues.high_privacy_risk = false;
    }
  }
}

function normalizeEntityRecord(entityKey, inputRecord, fallbackRecord = null) {
  const record = structuredClone(inputRecord ?? fallbackRecord ?? {});
  const fieldValues = record.fieldValues ?? {};
  const displayName = coerceTrimmedString(fieldValues.name, record.breadcrumbs?.[2] ?? "Uten navn");

  record.entityKey = entityKey;
  record.recordKey = entityKey;
  record.id = record.id ?? `${entityKey}-${Date.now()}`;
  record.fieldValues = fieldValues;
  record.collectionValues = structuredClone(record.collectionValues ?? {});
  record.meta = {
    ...(record.meta ?? {})
  };
  record.breadcrumbs = [...entityBaseBreadcrumbs(entityKey), displayName];
  if (entityKey === "controller_protocol") {
    normalizeControllerProtocolFields(record);
  }
  normalizeOrganizationAffiliations(record);
  normalizeLinkCollections(record, mockRecords?.[entityKey] ?? fallbackRecord);
  normalizeFileReferenceCollections(record);
  return record;
}

function createEntityRecordFromLegacy(entityKey, item, templateRecord, detailedRecord) {
  const record = normalizeEntityRecord(entityKey, detailedRecord ?? templateRecord, templateRecord);
  record.id = item?.id ?? record.id;
  applyInventorySummaryToRecord(entityKey, record, item);
  record.meta = {
    ...(record.meta ?? {}),
    lastUpdated: item?.lastUpdated ?? record.meta?.lastUpdated
  };
  record.breadcrumbs = [
    ...entityBaseBreadcrumbs(entityKey),
    coerceTrimmedString(record.fieldValues?.name, item?.name ?? record.breadcrumbs?.[2] ?? "Uten navn")
  ];
  return record;
}

function legacyEntityCollections(state) {
  const collections = {};
  const records = state.records ?? {};

  ["application", "dataset", "controller_protocol", "processor_protocol"].forEach((entityKey) => {
    const legacyItems = Array.isArray(state[inventoryStateKey(entityKey)]) ? state[inventoryStateKey(entityKey)] : [];
    const templateRecord = records[entityKey] ?? null;

    if (legacyItems.length) {
      collections[entityKey] = legacyItems.map((item) =>
        createEntityRecordFromLegacy(
          entityKey,
          item,
          templateRecord,
          templateRecord?.id === item.id ? templateRecord : null
        )
      );
      return;
    }

    collections[entityKey] = templateRecord ? [normalizeEntityRecord(entityKey, templateRecord)] : [];
  });

  return collections;
}

function normalizeEntityCollections(state) {
  if (state?.entities && typeof state.entities === "object") {
    return {
      application: (state.entities.application ?? []).map((record) => normalizeEntityRecord("application", record)),
      dataset: (state.entities.dataset ?? []).map((record) => normalizeEntityRecord("dataset", record)),
      controller_protocol: (state.entities.controller_protocol ?? []).map((record) => normalizeEntityRecord("controller_protocol", record)),
      processor_protocol: (state.entities.processor_protocol ?? []).map((record) => normalizeEntityRecord("processor_protocol", record))
    };
  }

  return legacyEntityCollections(state);
}

export function getEntityCollection(state, entityKey) {
  return state?.entities?.[entityKey] ?? [];
}

export function getEntityRecord(state, entityKey, recordId = "") {
  const collection = getEntityCollection(state, entityKey);
  if (!collection.length) {
    return null;
  }

  if (!recordId) {
    return collection[0] ?? null;
  }

  return collection.find((record) => record.id === recordId) ?? collection[0] ?? null;
}

export function resolveEditableRecord(state, currentRecord) {
  if (!currentRecord) {
    return null;
  }

  if (
    currentRecord.recordKey === "nis2" ||
    currentRecord.recordKey === "grunnprinsipper_ikt_sikkerhet" ||
    currentRecord.recordKey === "roles" ||
    currentRecord.recordKey === "application_draft" ||
    currentRecord.recordKey === "dataset_draft" ||
    currentRecord.recordKey === "controller_protocol_draft" ||
    currentRecord.recordKey === "processor_protocol_draft" ||
    currentRecord.entityKey === "nis2" ||
    currentRecord.entityKey === "grunnprinsipper_ikt_sikkerhet" ||
    currentRecord.entityKey === "roles"
  ) {
    return state?.records?.[currentRecord.recordKey ?? currentRecord.entityKey] ?? null;
  }

  return getEntityRecord(state, currentRecord.entityKey ?? inferRecordKeyFromBreadcrumbs(currentRecord.breadcrumbs), currentRecord.id);
}

export function touchEntityRecordForSave(record, currentUserName = "SystemKontroll") {
  if (!record) {
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const nextName = coerceTrimmedString(record.fieldValues?.name, record.breadcrumbs?.[2] ?? "Uten navn");
  record.breadcrumbs = [...entityBaseBreadcrumbs(record.entityKey ?? record.recordKey), nextName];
  record.meta = {
    ...(record.meta ?? {}),
    lastUpdated: today,
    lastModifiedBy: currentUserName
  };
  record.listSummary = {
    ...(record.listSummary ?? {}),
    lastUpdated: today
  };
}

export function createInventoryItemFromRecord(entityKey, record) {
  const fieldValues = record?.fieldValues ?? {};
  const listSummary = record?.listSummary ?? {};
  const lastUpdated = record?.meta?.lastUpdated ?? listSummary.lastUpdated ?? "";

  switch (entityKey) {
    case "application":
      return {
        id: record.id,
        route: detailRouteForEntity(entityKey, record.id),
        name: coerceTrimmedString(fieldValues.name, listSummary.name ?? "Uten navn"),
        vendor: coerceTrimmedString(fieldValues.vendor, listSummary.vendor ?? ""),
        version: coerceTrimmedString(fieldValues.version, listSummary.version ?? ""),
        status: coerceTrimmedString(fieldValues.lifecycle_status, listSummary.status ?? ""),
        criticality: coerceTrimmedString(fieldValues.criticality, listSummary.criticality ?? ""),
        lastUpdated,
        systemOwner: coerceTrimmedString(fieldValues.system_owner, listSummary.systemOwner ?? "")
      };
    case "dataset":
      return {
        id: record.id,
        route: detailRouteForEntity(entityKey, record.id),
        name: coerceTrimmedString(fieldValues.name, listSummary.name ?? "Uten navn"),
        purpose: coerceTrimmedString(fieldValues.purpose, listSummary.purpose ?? ""),
        description: coerceTrimmedString(fieldValues.description, listSummary.description ?? ""),
        hostingType: coerceTrimmedString(fieldValues.hosting_type, listSummary.hostingType ?? ""),
        hasPersonalData: Boolean(fieldValues.has_personal_data ?? listSummary.hasPersonalData),
        hasSensitivePersonalData: Boolean(fieldValues.has_sensitive_personal_data ?? listSummary.hasSensitivePersonalData),
        lastUpdated,
        cloudVariant: listSummary.cloudVariant ?? ""
      };
    case "controller_protocol": {
      const highPrivacyRisk =
        fieldValues.high_privacy_risk === true ||
        String(fieldValues.high_privacy_risk ?? "").trim().toLowerCase().startsWith("ja");
      return {
        id: record.id,
        route: detailRouteForEntity(entityKey, record.id),
        name: coerceTrimmedString(fieldValues.name, listSummary.name ?? "Uten navn"),
        controller: coerceTrimmedString(fieldValues.controller, listSummary.controller ?? ""),
        legalBasis: coerceFirstArrayValue(fieldValues.article_6_legal_basis, coerceTrimmedString(fieldValues.article_6_reason, listSummary.legalBasis ?? "")),
        status: coerceTrimmedString(listSummary.status, "Under vurdering"),
        privacyRisk: highPrivacyRisk ? "Høy" : coerceTrimmedString(listSummary.privacyRisk, ""),
        lastUpdated
      };
    }
    case "processor_protocol":
      return {
        id: record.id,
        route: detailRouteForEntity(entityKey, record.id),
        name: coerceTrimmedString(fieldValues.name, listSummary.name ?? "Uten navn"),
        processor: coerceTrimmedString(fieldValues.processor, listSummary.processor ?? ""),
        controllerCount: Array.isArray(fieldValues.controllers)
          ? fieldValues.controllers.length
          : Number(listSummary.controllerCount ?? 0),
        status: coerceTrimmedString(listSummary.status, "Under vurdering"),
        securityLevel: coerceTrimmedString(listSummary.securityLevel, "Middels"),
        lastUpdated
      };
    default:
      return {
        id: record.id,
        route: detailRouteForEntity(entityKey, record.id),
        name: coerceTrimmedString(fieldValues.name, "Uten navn")
      };
  }
}

export function inventoryItemsForScreen(screen, state) {
  return getEntityCollection(state, screen.entityKey).map((record) => createInventoryItemFromRecord(screen.entityKey, record));
}

export function inferRecordKeyFromBreadcrumbs(breadcrumbs = []) {
  const joined = breadcrumbs.join(" ").toLowerCase();
  if (joined.includes("behandlingsansvarlig")) {
    return "controller_protocol";
  }
  if (joined.includes("databehandler")) {
    return "processor_protocol";
  }
  if (joined.includes("datasett")) {
    return "dataset";
  }
  if (joined.includes("roller")) {
    return "roles";
  }
  return "application";
}

export function normalizeRadioValue(value) {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

export function coerceRadioValue(value) {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  return value;
}

export function inferColumnsFromRows(rows) {
  return Object.keys(rows[0] ?? {});
}

const FILE_REFERENCE_COLLECTION_KEYS = new Set(["information_security_items"]);
const FILE_REFERENCE_COLUMN_KEYS = new Set(["fil", "dokument", "vedlegg", "attachment", "file"]);

export function isFileReferenceValue(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (String(value.kind ?? "").trim() === "upload" || String(value.kind ?? "").trim() === "external" || value.fileId || value.source)
  );
}

function deriveFileReferenceName(source) {
  const normalizedSource = String(source ?? "").trim();
  if (!normalizedSource) {
    return "";
  }

  try {
    const url = new URL(normalizedSource);
    const lastSegment = url.pathname.split("/").filter(Boolean).pop();
    if (lastSegment) {
      return decodeURIComponent(lastSegment);
    }
  } catch {
    // Fall through to local path parsing.
  }

  const localPathSegment = normalizedSource
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .pop();

  return localPathSegment || normalizedSource;
}

export function resolveFileReferenceLabel(value) {
  if (isFileReferenceValue(value)) {
    const explicitName = String(value.name ?? "").trim();
    return explicitName || deriveFileReferenceName(value.source);
  }

  return String(value ?? "").trim();
}

export function resolveFileReferenceHref(value) {
  if (!isFileReferenceValue(value)) {
    return "";
  }

  const normalizedDownloadUrl = String(value.downloadUrl ?? "").trim();
  if (normalizedDownloadUrl) {
    return normalizedDownloadUrl;
  }

  const normalizedFileId = String(value.fileId ?? value.id ?? "").trim();
  if (normalizedFileId) {
    return `/api/files/${encodeURIComponent(normalizedFileId)}`;
  }

  const normalizedSource = String(value.source ?? "").trim();
  return /^https?:\/\//i.test(normalizedSource) ? normalizedSource : "";
}

export function normalizeFileReferenceValue(value) {
  if (isFileReferenceValue(value)) {
    const normalizedKind =
      String(value.kind ?? "").trim() === "upload" ||
      String(value.fileId ?? value.id ?? "").trim()
        ? "upload"
        : "external";
    const normalizedSource = String(value.source ?? "").trim();
    const normalizedFileId = String(value.fileId ?? value.id ?? "").trim();
    const normalizedDownloadUrl = String(value.downloadUrl ?? "").trim();

    return {
      kind: normalizedKind,
      fileId: normalizedFileId,
      name: String(value.name ?? "").trim() || deriveFileReferenceName(normalizedSource || normalizedDownloadUrl || normalizedFileId),
      source: normalizedSource,
      mimeType: String(value.mimeType ?? value.mime_type ?? "").trim(),
      sizeBytes: Number(value.sizeBytes ?? value.size_bytes ?? 0) || 0,
      createdAt: String(value.createdAt ?? value.created_at ?? "").trim(),
      downloadUrl: normalizedDownloadUrl || (normalizedFileId ? `/api/files/${encodeURIComponent(normalizedFileId)}` : "")
    };
  }

  const normalizedValue = String(value ?? "").trim();
  if (!normalizedValue) {
    return "";
  }

  return {
    kind: "external",
    fileId: "",
    name: deriveFileReferenceName(normalizedValue),
    source: normalizedValue,
    mimeType: "",
    sizeBytes: 0,
    createdAt: "",
    downloadUrl: ""
  };
}

export function renderCollectionCell(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (isFileReferenceValue(value)) {
    return resolveFileReferenceLabel(value) || "–";
  }
  return value ?? "–";
}

export function datasetHostingLabel(value) {
  return {
    all: "Alle driftsplasseringer",
    cloud: "Sky",
    local: "Lokal"
  }[value];
}

export function datasetPrivacyLabel(value) {
  return {
    all: "Alle personvernnivåer",
    sensitive: "Sensitive",
    personal: "Personopplysninger",
    public: "Ikke sensitivt"
  }[value];
}

export function getInventoryMetrics(screen, items) {
  switch (screen.entityKey) {
    case "application":
      return [
        { label: "Totalt", value: items.length },
        { label: "Godkjent", value: items.filter((item) => item.status === "Godkjent").length },
        { label: "Avvik funnet", value: items.filter((item) => item.status === "Avvik funnet").length }
      ];
    case "dataset":
      return [
        { label: "Totalt", value: items.length },
        { label: "Sensitive", value: items.filter((item) => item.hasSensitivePersonalData).length },
        {
          label: "Skybasert",
          value: `${Math.round((items.filter((item) => item.hostingType === "Cloud").length / Math.max(items.length, 1)) * 100)}%`
        }
      ];
    case "controller_protocol":
      return [
        { label: "Totalt", value: items.length },
        { label: "Under vurdering", value: items.filter((item) => item.status === "Under vurdering").length },
        { label: "Høy risiko", value: items.filter((item) => item.privacyRisk === "Høy").length }
      ];
    case "processor_protocol":
      return [
        { label: "Totalt", value: items.length },
        { label: "Under vurdering", value: items.filter((item) => item.status === "Under vurdering").length },
        { label: "Høyt sikkerhetsnivå", value: items.filter((item) => item.securityLevel === "Høy").length }
      ];
    default:
      return [];
  }
}

export function filterInventoryItems(screen, items, searchValue, datasetFilters) {
  const normalizedSearch = searchValue.trim().toLowerCase();
  let filtered = items.filter((item) => JSON.stringify(item).toLowerCase().includes(normalizedSearch));

  if (screen.entityKey === "dataset") {
    if (datasetFilters.hosting === "cloud") {
      filtered = filtered.filter((item) => item.hostingType === "Cloud");
    }
    if (datasetFilters.hosting === "local") {
      filtered = filtered.filter((item) => item.hostingType !== "Cloud");
    }
    if (datasetFilters.privacy === "sensitive") {
      filtered = filtered.filter((item) => item.hasSensitivePersonalData);
    }
    if (datasetFilters.privacy === "personal") {
      filtered = filtered.filter((item) => item.hasPersonalData && !item.hasSensitivePersonalData);
    }
    if (datasetFilters.privacy === "public") {
      filtered = filtered.filter((item) => !item.hasPersonalData);
    }
  }

  return filtered;
}

export function renderInventoryCells(screen, item) {
  switch (screen.entityKey) {
    case "application":
      return [item.name, item.vendor, item.version, item.status, item.criticality, item.lastUpdated];
    case "dataset":
      return [
        item.name,
        item.purpose,
        item.hostingType === "Cloud" ? `Sky (${item.cloudVariant})` : `Lokal (${item.cloudVariant})`,
        item.hasSensitivePersonalData ? "Sensitive" : item.hasPersonalData ? "Personopplysninger" : "Ikke sensitivt",
        item.lastUpdated
      ];
    case "controller_protocol":
      return [item.name, item.controller, item.legalBasis, item.status, item.privacyRisk, item.lastUpdated];
    case "processor_protocol":
      return [item.name, item.processor, item.controllerCount, item.status, item.securityLevel, item.lastUpdated];
    default:
      return [item.name];
  }
}

function uniqueOptionObjects(values = []) {
  return Array.from(new Set(values.map((value) => String(value).trim()).filter(Boolean)))
    .sort((left, right) => left.localeCompare(right, "nb"))
    .map((value) => ({ value, label: value }));
}

function normalizeStringCollectionValue(value) {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean)));
  }

  if (typeof value === "string") {
    return Array.from(
      new Set(
        value
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
  }

  return [];
}

function isFileReferenceColumnKey(columnKey) {
  return FILE_REFERENCE_COLUMN_KEYS.has(String(columnKey ?? "").trim().toLowerCase());
}

function normalizeFileReferenceCollections(record) {
  if (!record?.collectionValues || typeof record.collectionValues !== "object") {
    return;
  }

  Object.entries(record.collectionValues).forEach(([collectionKey, entries]) => {
    if (!Array.isArray(entries)) {
      return;
    }

    if (FILE_REFERENCE_COLLECTION_KEYS.has(collectionKey)) {
      record.collectionValues[collectionKey] = entries
        .map((entry) => normalizeFileReferenceValue(entry))
        .filter(Boolean);
      return;
    }

    record.collectionValues[collectionKey] = entries.map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return entry;
      }

      let nextEntry = entry;
      Object.keys(entry).forEach((columnKey) => {
        if (!isFileReferenceColumnKey(columnKey)) {
          return;
        }

        const normalizedValue = normalizeFileReferenceValue(entry[columnKey]);
        if (normalizedValue === entry[columnKey]) {
          return;
        }

        if (nextEntry === entry) {
          nextEntry = { ...entry };
        }
        nextEntry[columnKey] = normalizedValue;
      });

      return nextEntry;
    });
  });
}

function roleCollectionValues(appState, key) {
  return appState?.records?.roles?.collectionValues?.[key] ?? [];
}

function roleNameValues(appState, key) {
  return roleCollectionValues(appState, key)
    .map((item) => item?.Navn ?? item?.name ?? "")
    .filter(Boolean);
}

function organizationUserValues(appState) {
  return roleNameValues(appState, "system_responsibles");
}

function controllerProtocolFieldValues(appState, key) {
  return (appState?.entities?.controller_protocol ?? []).flatMap((record) => normalizeStringCollectionValue(record?.fieldValues?.[key]));
}

function processorProtocolProcessorValues(appState) {
  return (appState?.entities?.processor_protocol ?? [])
    .map((record) => String(record?.fieldValues?.processor ?? record?.listSummary?.processor ?? "").trim())
    .filter(Boolean);
}

export function resolveFieldOptions(field, appState, bootstrap) {
  if (field.options?.length) {
    return field.options.map((option) =>
      typeof option === "string" ? { value: option, label: option } : { value: option.value, label: option.label ?? option.value }
    );
  }

  if (field.optionSource) {
    if (field.optionSource === "common_components_catalog") {
      return (appState.settings?.commonComponentsCatalog ?? []).map((item) => ({ value: item.id, label: item.name }));
    }
    if (field.optionSource === "standards_catalog") {
      return (appState.settings?.standardsCatalog ?? []).map((item) => ({ value: item.id, label: item.name }));
    }
    if (field.optionSource === "organization_users") {
      const dynamicOptions = uniqueOptionObjects(organizationUserValues(appState));
      if (dynamicOptions.length) {
        return dynamicOptions;
      }
    }
    if (field.optionSource === "organization_role.system_responsible") {
      const dynamicOptions = uniqueOptionObjects(roleNameValues(appState, "system_responsibles"));
      if (dynamicOptions.length) {
        return dynamicOptions;
      }
    }
    if (field.optionSource === "organization_role.system_owner") {
      const dynamicOptions = uniqueOptionObjects(roleNameValues(appState, "system_owners"));
      if (dynamicOptions.length) {
        return dynamicOptions;
      }
    }
    if (field.optionSource === "organization_role.controller") {
      const dynamicOptions = uniqueOptionObjects(roleNameValues(appState, "controllers"));
      if (dynamicOptions.length) {
        return dynamicOptions;
      }
    }
    if (field.optionSource === "organization_role.data_protection_officer") {
      const dynamicOptions = uniqueOptionObjects(roleNameValues(appState, "data_protection_officers"));
      if (dynamicOptions.length) {
        return dynamicOptions;
      }
    }
    if (field.optionSource === "organization_role.processor_protocol_controller") {
      const dynamicOptions = uniqueOptionObjects(roleNameValues(appState, "processor_protocol_controllers"));
      if (dynamicOptions.length) {
        return dynamicOptions;
      }
    }
    if (field.optionSource === "organization_role.joint_controller") {
      const dynamicOptions = uniqueOptionObjects(roleNameValues(appState, "joint_controllers"));
      if (dynamicOptions.length) {
        return dynamicOptions;
      }
    }

    return [];
  }

  if (field.observedValues?.length) {
    return field.observedValues.map((value) => ({ value, label: value }));
  }

  if (field.key === "guarantees_or_agreement") {
    const dynamicOptions = uniqueOptionObjects(controllerProtocolFieldValues(appState, "guarantees_or_agreement"));
    if (dynamicOptions.length) {
      return dynamicOptions;
    }
  }

  if (field.key === "data_processors") {
    const dynamicOptions = uniqueOptionObjects([
      ...processorProtocolProcessorValues(appState),
      ...controllerProtocolFieldValues(appState, "data_processors")
    ]);
    if (dynamicOptions.length) {
      return dynamicOptions;
    }
  }

  return [];
}

export function resolveOrganizationNode(organizationStructure, selectedId) {
  for (let areaIndex = 0; areaIndex < organizationStructure.length; areaIndex += 1) {
    const area = organizationStructure[areaIndex];
    if (selectedId === area.id) {
      return {
        type: "serviceArea",
        title: area.serviceArea,
        description: area.description?.trim?.() || "Tjenesteområde på nivå 1 i organisasjonsstrukturen.",
        children: (area.organizations ?? []).map((organization) => organization.name),
        editValue: area.serviceArea,
        id: area.id,
        details: {
          name: area.serviceArea,
          description: area.description ?? ""
        },
        indices: { areaIndex }
      };
    }

    for (let organizationIndex = 0; organizationIndex < (area.organizations ?? []).length; organizationIndex += 1) {
      const organization = area.organizations[organizationIndex];
      if (selectedId === organization.id) {
        return {
          type: "organization",
          title: organization.name,
          description: organization.description?.trim?.() || `${organization.departments?.length ?? 0} avdelinger under valgt virksomhet.`,
          children: (organization.departments ?? []).map((department) => department.name),
          editValue: organization.name,
          id: organization.id,
          details: {
            name: organization.name,
            description: organization.description ?? ""
          },
          indices: { areaIndex, organizationIndex }
        };
      }

      for (let departmentIndex = 0; departmentIndex < (organization.departments ?? []).length; departmentIndex += 1) {
        const department = organization.departments[departmentIndex];
        if (selectedId === department.id) {
          return {
            type: "department",
            title: department.name,
            description: department.description?.trim?.() || "Avdeling på nivå 3 i organisasjonsstrukturen.",
            children: [],
            editValue: department.name,
            id: department.id,
            details: {
              name: department.name,
              description: department.description ?? ""
            },
            indices: { areaIndex, organizationIndex, departmentIndex }
          };
        }
      }
    }
  }

  return null;
}

export function applyOrganizationRename(organizationStructure, selectedNode, nextName) {
  if (selectedNode.type === "serviceArea") {
    organizationStructure[selectedNode.indices.areaIndex].serviceArea = nextName;
  }
  if (selectedNode.type === "organization") {
    organizationStructure[selectedNode.indices.areaIndex].organizations[selectedNode.indices.organizationIndex].name = nextName;
  }
  if (selectedNode.type === "department") {
    organizationStructure[selectedNode.indices.areaIndex].organizations[selectedNode.indices.organizationIndex].departments[
      selectedNode.indices.departmentIndex
    ].name = nextName;
  }
}

export function applyOrganizationNodeEdit(organizationStructure, selectedNode, updates) {
  const trimmedDescription = String(updates?.description ?? "").trim();

  if (selectedNode.type === "serviceArea") {
    organizationStructure[selectedNode.indices.areaIndex].description = trimmedDescription;
  }
  if (selectedNode.type === "organization") {
    organizationStructure[selectedNode.indices.areaIndex].organizations[selectedNode.indices.organizationIndex].description = trimmedDescription;
  }
  if (selectedNode.type === "department") {
    organizationStructure[selectedNode.indices.areaIndex].organizations[selectedNode.indices.organizationIndex].departments[
      selectedNode.indices.departmentIndex
    ].description = trimmedDescription;
  }
}

export function removeOrganizationNode(organizationStructure, selectedNode) {
  if (selectedNode.type === "serviceArea") {
    organizationStructure.splice(selectedNode.indices.areaIndex, 1);
  }
  if (selectedNode.type === "organization") {
    organizationStructure[selectedNode.indices.areaIndex].organizations.splice(selectedNode.indices.organizationIndex, 1);
  }
  if (selectedNode.type === "department") {
    organizationStructure[selectedNode.indices.areaIndex].organizations[selectedNode.indices.organizationIndex].departments.splice(
      selectedNode.indices.departmentIndex,
      1
    );
  }
}

export function getFirstOrganizationNodeId(organizationStructure) {
  if ((organizationStructure ?? []).length) {
    return organizationStructure[0]?.id ?? "";
  }

  return "";
}

function normalizeOrganizationDepartment(department) {
  if (typeof department === "string") {
    return {
      id: createStableNodeId("department"),
      name: department,
      description: ""
    };
  }

  return {
    id: coerceTrimmedString(department?.id, createStableNodeId("department")),
    name: String(department?.name ?? "").trim(),
    description: String(department?.description ?? "").trim()
  };
}

export function normalizeOrganizationStructure(organizationStructure) {
  if (!Array.isArray(organizationStructure)) {
    return [];
  }

  return organizationStructure
    .map((area) => ({
      id: coerceTrimmedString(area?.id, createStableNodeId("service-area")),
      serviceArea: String(area?.serviceArea ?? "").trim(),
      description: String(area?.description ?? "").trim(),
      organizations: Array.isArray(area?.organizations)
        ? area.organizations
            .map((organization) => ({
              id: coerceTrimmedString(organization?.id, createStableNodeId("organization")),
              name: String(organization?.name ?? "").trim(),
              description: String(organization?.description ?? "").trim(),
              departments: Array.isArray(organization?.departments)
                ? organization.departments
                    .map((department) => normalizeOrganizationDepartment(department))
                    .filter((department) => department.name)
                : []
            }))
            .filter((organization) => organization.name)
        : []
    }))
    .filter((area) => area.serviceArea);
}

export function createOrganizationAreaRecord({ name, description = "" }) {
  return {
    id: createStableNodeId("service-area"),
    serviceArea: String(name ?? "").trim(),
    description: String(description ?? "").trim(),
    organizations: []
  };
}

export function createOrganizationRecord({ name, description = "" }) {
  return {
    id: createStableNodeId("organization"),
    name: String(name ?? "").trim(),
    description: String(description ?? "").trim(),
    departments: []
  };
}

export function createDepartmentRecord({ name, description = "" }) {
  return {
    id: createStableNodeId("department"),
    name: String(name ?? "").trim(),
    description: String(description ?? "").trim()
  };
}

function insertAt(items, index, item) {
  const nextIndex = Math.max(0, Math.min(index, items.length));
  items.splice(nextIndex, 0, item);
}

export function moveOrganizationNode(organizationStructure, draggedNodeId, targetNodeId) {
  const draggedNode = resolveOrganizationNode(organizationStructure, draggedNodeId);
  const isRootDropTarget = targetNodeId === ORGANIZATION_ROOT_NODE_ID;
  const targetNode = isRootDropTarget ? null : resolveOrganizationNode(organizationStructure, targetNodeId);

  if (!draggedNode || (!isRootDropTarget && !targetNode) || draggedNode.id === targetNode?.id) {
    return draggedNodeId;
  }

  if (isRootDropTarget) {
    if (draggedNode.type !== "serviceArea") {
      return draggedNodeId;
    }

    const [movedArea] = organizationStructure.splice(draggedNode.indices.areaIndex, 1);
    organizationStructure.push(movedArea);
    return movedArea.id;
  }

  if (draggedNode.type === "serviceArea" && targetNode.type === "serviceArea") {
    const [movedArea] = organizationStructure.splice(draggedNode.indices.areaIndex, 1);
    const targetIndex = organizationStructure.findIndex((area) => area.id === targetNode.id);
    insertAt(organizationStructure, targetIndex, movedArea);
    return movedArea.id;
  }

  if (draggedNode.type === "organization") {
    const sourceOrganizations = organizationStructure[draggedNode.indices.areaIndex].organizations;
    const [movedOrganization] = sourceOrganizations.splice(draggedNode.indices.organizationIndex, 1);

    if (targetNode.type === "serviceArea") {
      organizationStructure[targetNode.indices.areaIndex].organizations.push(movedOrganization);
      return movedOrganization.id;
    }

    if (targetNode.type === "organization") {
      const targetOrganizations = organizationStructure[targetNode.indices.areaIndex].organizations;
      const targetIndex = targetOrganizations.findIndex((organization) => organization.id === targetNode.id);
      insertAt(targetOrganizations, targetIndex, movedOrganization);
      return movedOrganization.id;
    }

    sourceOrganizations.splice(draggedNode.indices.organizationIndex, 0, movedOrganization);
    return draggedNode.id;
  }

  if (draggedNode.type === "department") {
    const sourceDepartments =
      organizationStructure[draggedNode.indices.areaIndex].organizations[draggedNode.indices.organizationIndex].departments;
    const [movedDepartment] = sourceDepartments.splice(draggedNode.indices.departmentIndex, 1);

    if (targetNode.type === "organization") {
      organizationStructure[targetNode.indices.areaIndex].organizations[targetNode.indices.organizationIndex].departments.push(movedDepartment);
      return movedDepartment.id;
    }

    if (targetNode.type === "department") {
      const targetDepartments =
        organizationStructure[targetNode.indices.areaIndex].organizations[targetNode.indices.organizationIndex].departments;
      const targetIndex = targetDepartments.findIndex((department) => department.id === targetNode.id);
      insertAt(targetDepartments, targetIndex, movedDepartment);
      return movedDepartment.id;
    }

    sourceDepartments.splice(draggedNode.indices.departmentIndex, 0, movedDepartment);
    return draggedNode.id;
  }

  return draggedNode.id;
}

function normalizeOrganizationAffiliations(record) {
  if (!record) {
    return;
  }

  const fieldValues = record.fieldValues ?? {};
  const collectionValues = record.collectionValues ?? {};
  const existingRows = collectionValues.organization_affiliations;
  if (Array.isArray(existingRows) && existingRows.length) {
    return;
  }

  const serviceArea = fieldValues.service_area?.trim?.() ?? "";
  const organization = fieldValues.organization?.trim?.() ?? "";
  const department = fieldValues.department?.trim?.() ?? "";

  if (!serviceArea && !organization && !department) {
    return;
  }

  record.collectionValues = {
    ...collectionValues,
    organization_affiliations: [
      {
        Tjenesteområde: serviceArea,
        Virksomhet: organization,
        Avdeling: department
      }
    ]
  };
}

function normalizeRolesCollections(record) {
  if (!record?.collectionValues) {
    return;
  }

  const seededRoleCollections = mockRecords?.roles?.collectionValues ?? {};

  if (!Array.isArray(record.collectionValues.system_responsibles) && Array.isArray(seededRoleCollections.system_responsibles)) {
    record.collectionValues.system_responsibles = structuredClone(seededRoleCollections.system_responsibles);
  }

  if (Array.isArray(record.collectionValues.system_responsibles)) {
    record.collectionValues.system_responsibles = record.collectionValues.system_responsibles.map((item) => ({
      ...item,
      Epost: item?.Epost ?? item?.["E-post"] ?? ""
    }));
  }

  normalizeFileReferenceCollections(record);
}

function mergeSettingsCatalogEntries(existingEntries, defaultEntries, catalogKey) {
  const defaultEntriesByName = new Map(
    (defaultEntries ?? []).map((item) => [normalizeCatalogLookupKey(item?.name), item])
  );
  const mergedEntries = [];
  const usedIds = new Set();
  const seenNames = new Set();

  (Array.isArray(existingEntries) ? existingEntries : []).forEach((item) => {
    const name = String(item?.name ?? "").trim();
    if (!name) {
      return;
    }

    const normalizedName = normalizeCatalogLookupKey(name);
    const matchingDefault = defaultEntriesByName.get(normalizedName);
    const preferredId = String(item?.id ?? matchingDefault?.id ?? "").trim();
    const id = preferredId || createCatalogItemId(catalogKey, name, usedIds);
    usedIds.add(id);
    seenNames.add(normalizedName);
    mergedEntries.push({
      id,
      name,
      description: String(item?.description ?? "").trim() || String(matchingDefault?.description ?? "").trim(),
      color: normalizeCatalogColor(catalogKey, item?.color ?? matchingDefault?.color ?? "")
    });
  });

  (defaultEntries ?? []).forEach((item) => {
    const name = String(item?.name ?? "").trim();
    const normalizedName = normalizeCatalogLookupKey(name);
    if (!name || seenNames.has(normalizedName)) {
      return;
    }

    const preferredId = String(item?.id ?? "").trim();
    const id = preferredId && !usedIds.has(preferredId)
      ? preferredId
      : createCatalogItemId(catalogKey, name, usedIds);
    usedIds.add(id);
    seenNames.add(normalizedName);
    mergedEntries.push({
      id,
      name,
      description: String(item?.description ?? "").trim(),
      color: normalizeCatalogColor(catalogKey, item?.color ?? "")
    });
  });

  return mergedEntries;
}

function ensureCatalogEntry(settings, catalogKey, rawValue) {
  if (!catalogKey || rawValue === null || rawValue === undefined) {
    return "";
  }

  if (!Array.isArray(settings[catalogKey])) {
    settings[catalogKey] = [];
  }

  const existingEntries = settings[catalogKey];
  const primitiveValue = typeof rawValue === "object" && rawValue !== null ? "" : String(rawValue).trim();
  const normalizedId = typeof rawValue === "object" && rawValue !== null ? String(rawValue.id ?? "").trim() : "";
  const normalizedName = typeof rawValue === "object" && rawValue !== null
    ? String(rawValue.name ?? "").trim()
    : primitiveValue;
  const normalizedDescription = typeof rawValue === "object" && rawValue !== null
    ? String(rawValue.description ?? "").trim()
    : "";
  const normalizedColor = typeof rawValue === "object" && rawValue !== null
    ? normalizeCatalogColor(catalogKey, rawValue.color ?? "")
    : normalizeCatalogColor(catalogKey, "");

  if (!normalizedId && !normalizedName) {
    return "";
  }

  let existingEntry = normalizedId
    ? existingEntries.find((item) => String(item?.id ?? "").trim() === normalizedId)
    : null;

  if (!existingEntry && primitiveValue) {
    existingEntry = existingEntries.find((item) => String(item?.id ?? "").trim() === primitiveValue);
  }

  if (!existingEntry && normalizedName) {
    existingEntry = existingEntries.find((item) => normalizeCatalogLookupKey(item?.name) === normalizeCatalogLookupKey(normalizedName));
  }

  if (existingEntry) {
    if (normalizedDescription && !String(existingEntry.description ?? "").trim()) {
      existingEntry.description = normalizedDescription;
    }
    if (catalogKey === "tagsCatalog" && normalizedColor) {
      existingEntry.color = normalizeCatalogColor(catalogKey, existingEntry.color ?? normalizedColor);
    }
    return String(existingEntry.id ?? "").trim();
  }

  const usedIds = new Set(existingEntries.map((item) => String(item?.id ?? "").trim()).filter(Boolean));
  const id = normalizedId && !usedIds.has(normalizedId)
    ? normalizedId
    : createCatalogItemId(catalogKey, normalizedName || normalizedId, usedIds);
  const nextEntry = {
    id,
    name: normalizedName || normalizedId,
    description: normalizedDescription,
    color: normalizedColor
  };
  existingEntries.push(nextEntry);
  return id;
}

function collapseCatalogAliases(settings, catalogKey) {
  if (!Array.isArray(settings[catalogKey])) {
    return new Map();
  }

  const aliasMap = new Map();
  const byId = new Map(
    settings[catalogKey]
      .filter((item) => item?.id)
      .map((item) => [String(item.id).trim(), item])
  );
  const keptEntries = [];

  settings[catalogKey].forEach((item) => {
    const itemId = String(item?.id ?? "").trim();
    const itemName = String(item?.name ?? "").trim();
    const canonicalItem = itemName ? byId.get(itemName) : null;

    if (itemId && canonicalItem && canonicalItem !== item) {
      aliasMap.set(itemId, canonicalItem.id);
      if (!String(canonicalItem.description ?? "").trim() && String(item?.description ?? "").trim()) {
        canonicalItem.description = String(item.description).trim();
      }
      return;
    }

    keptEntries.push(item);
  });

  settings[catalogKey] = keptEntries;
  return aliasMap;
}

function normalizeCatalogReferenceArray(settings, catalogKey, values, aliasMap = new Map()) {
  if (!Array.isArray(values)) {
    return values;
  }

  const seenIds = new Set();
  return values
    .map((value) => {
      const normalizedPrimitive = typeof value === "object" && value !== null ? "" : String(value).trim();
      if (normalizedPrimitive && aliasMap.has(normalizedPrimitive)) {
        return aliasMap.get(normalizedPrimitive);
      }

      if (typeof value === "object" && value !== null) {
        const normalizedObjectId = String(value.id ?? "").trim();
        if (normalizedObjectId && aliasMap.has(normalizedObjectId)) {
          return aliasMap.get(normalizedObjectId);
        }
      }

      return ensureCatalogEntry(settings, catalogKey, value);
    })
    .filter(Boolean)
    .filter((value) => {
      if (seenIds.has(value)) {
        return false;
      }
      seenIds.add(value);
      return true;
    });
}

function resolveDatasetDisplayName(record) {
  return coerceTrimmedString(
    record?.fieldValues?.name,
    record?.listSummary?.name ?? record?.name ?? record?.Navn ?? record?.breadcrumbs?.[record?.breadcrumbs?.length - 1] ?? record?.id ?? ""
  );
}

function resolveApplicationDisplayName(record) {
  return coerceTrimmedString(
    record?.fieldValues?.name,
    record?.listSummary?.name ?? record?.name ?? record?.Navn ?? record?.breadcrumbs?.[record?.breadcrumbs?.length - 1] ?? record?.id ?? ""
  );
}

function resolveApplicationVersion(record) {
  return coerceTrimmedString(
    record?.fieldValues?.version,
    record?.listSummary?.version ?? record?.Versjon ?? record?.version ?? ""
  );
}

function resolveProcessingActivityDisplayName(record) {
  return coerceTrimmedString(
    record?.fieldValues?.name,
    record?.listSummary?.name ?? record?.name ?? record?.Navn ?? record?.breadcrumbs?.[record?.breadcrumbs?.length - 1] ?? record?.id ?? ""
  );
}

function resolveProcessingActivityPurpose(record) {
  const purposes = Array.isArray(record?.fieldValues?.purposes)
    ? record.fieldValues.purposes.map((value) => String(value ?? "").trim()).filter(Boolean).join(", ")
    : "";
  const fallbackPurpose =
    record?.fieldValues?.purpose ??
    record?.listSummary?.purpose ??
    record?.["Formål"] ??
    record?.purpose ??
    purposes ??
    "";

  return coerceTrimmedString(
    record?.fieldValues?.processing_description,
    fallbackPurpose
  );
}

export function resolveApplicationReferenceRecord(applicationRecords = [], reference) {
  const relationObject = typeof reference === "object" && reference !== null ? reference : null;
  if (relationObject?.fieldValues || relationObject?.listSummary) {
    return relationObject;
  }

  const normalizedId = String(relationObject?.ApplicationId ?? relationObject?.applicationId ?? relationObject?.id ?? reference ?? "").trim();
  const normalizedName = String(relationObject?.Navn ?? relationObject?.name ?? relationObject?.label ?? "").trim().toLowerCase();

  if (normalizedId) {
    const matchById = applicationRecords.find((record) => String(record?.id ?? "").trim() === normalizedId);
    if (matchById) {
      return matchById;
    }
  }

  if (!normalizedName) {
    return null;
  }

  const exactMatch =
    applicationRecords.find((record) => resolveApplicationDisplayName(record).trim().toLowerCase() === normalizedName) ??
    null;

  if (exactMatch) {
    return exactMatch;
  }

  const partialMatches = applicationRecords.filter((record) => {
    const displayName = resolveApplicationDisplayName(record).trim().toLowerCase();
    return displayName.includes(normalizedName) || normalizedName.includes(displayName);
  });

  return partialMatches.length === 1 ? partialMatches[0] : null;
}

export function resolveApplicationReferenceLabel(applicationRecords = [], reference) {
  const matchedRecord = resolveApplicationReferenceRecord(applicationRecords, reference);
  if (matchedRecord) {
    return resolveApplicationDisplayName(matchedRecord);
  }

  if (typeof reference === "object" && reference !== null) {
    return String(reference?.Navn ?? reference?.name ?? "").trim();
  }

  return String(reference ?? "").trim();
}

export function resolveApplicationReferenceRoute(applicationRecords = [], reference) {
  const matchedRecord = resolveApplicationReferenceRecord(applicationRecords, reference);
  return matchedRecord?.id ? detailRouteForEntity("application", matchedRecord.id) : "";
}

export function resolveApplicationReferenceVersion(applicationRecords = [], reference) {
  const matchedRecord = resolveApplicationReferenceRecord(applicationRecords, reference);
  if (matchedRecord) {
    return resolveApplicationVersion(matchedRecord);
  }

  if (typeof reference === "object" && reference !== null) {
    return String(reference?.Versjon ?? reference?.version ?? "").trim();
  }

  return "";
}

export function resolveDatasetReferenceRecord(datasetRecords = [], reference) {
  const relationObject = typeof reference === "object" && reference !== null ? reference : null;
  if (relationObject?.fieldValues || relationObject?.listSummary) {
    return relationObject;
  }

  const normalizedId = String(relationObject?.DatasetId ?? relationObject?.datasetId ?? relationObject?.id ?? reference ?? "").trim();
  const normalizedName = String(relationObject?.Navn ?? relationObject?.name ?? relationObject?.label ?? "").trim().toLowerCase();

  if (normalizedId) {
    const matchById = datasetRecords.find((record) => String(record?.id ?? "").trim() === normalizedId);
    if (matchById) {
      return matchById;
    }
  }

  if (!normalizedName) {
    return null;
  }

  const exactMatch =
    datasetRecords.find((record) => resolveDatasetDisplayName(record).trim().toLowerCase() === normalizedName) ??
    null;

  if (exactMatch) {
    return exactMatch;
  }

  const partialMatches = datasetRecords.filter((record) => {
    const displayName = resolveDatasetDisplayName(record).trim().toLowerCase();
    return displayName.includes(normalizedName) || normalizedName.includes(displayName);
  });

  return partialMatches.length === 1 ? partialMatches[0] : null;
}

export function resolveDatasetReferenceLabel(datasetRecords = [], reference) {
  const matchedRecord = resolveDatasetReferenceRecord(datasetRecords, reference);
  if (matchedRecord) {
    return resolveDatasetDisplayName(matchedRecord);
  }

  if (typeof reference === "object" && reference !== null) {
    return String(reference?.Navn ?? reference?.name ?? "").trim();
  }

  return String(reference ?? "").trim();
}

export function resolveDatasetReferenceRoute(datasetRecords = [], reference) {
  const matchedRecord = resolveDatasetReferenceRecord(datasetRecords, reference);
  return matchedRecord?.id ? detailRouteForEntity("dataset", matchedRecord.id) : "";
}

export function resolveProcessingActivityReferenceRecord(processingActivityRecords = [], reference) {
  const relationObject = typeof reference === "object" && reference !== null ? reference : null;
  if (relationObject?.fieldValues || relationObject?.listSummary) {
    return relationObject;
  }

  const normalizedId = String(
    relationObject?.ProcessingActivityId ??
      relationObject?.processingActivityId ??
      relationObject?.ControllerProtocolId ??
      relationObject?.controllerProtocolId ??
      relationObject?.id ??
      reference ??
      ""
  ).trim();
  const normalizedName = String(relationObject?.Navn ?? relationObject?.name ?? relationObject?.label ?? "").trim().toLowerCase();

  if (normalizedId) {
    const matchById = processingActivityRecords.find((record) => String(record?.id ?? "").trim() === normalizedId);
    if (matchById) {
      return matchById;
    }
  }

  if (!normalizedName) {
    return null;
  }

  const exactMatch =
    processingActivityRecords.find((record) => resolveProcessingActivityDisplayName(record).trim().toLowerCase() === normalizedName) ??
    null;

  if (exactMatch) {
    return exactMatch;
  }

  const partialMatches = processingActivityRecords.filter((record) => {
    const displayName = resolveProcessingActivityDisplayName(record).trim().toLowerCase();
    return displayName.includes(normalizedName) || normalizedName.includes(displayName);
  });

  return partialMatches.length === 1 ? partialMatches[0] : null;
}

export function resolveProcessingActivityReferenceLabel(processingActivityRecords = [], reference) {
  const matchedRecord = resolveProcessingActivityReferenceRecord(processingActivityRecords, reference);
  if (matchedRecord) {
    return resolveProcessingActivityDisplayName(matchedRecord);
  }

  if (typeof reference === "object" && reference !== null) {
    return String(reference?.Navn ?? reference?.name ?? "").trim();
  }

  return String(reference ?? "").trim();
}

export function resolveProcessingActivityReferencePurpose(processingActivityRecords = [], reference) {
  const matchedRecord = resolveProcessingActivityReferenceRecord(processingActivityRecords, reference);
  if (matchedRecord) {
    return resolveProcessingActivityPurpose(matchedRecord);
  }

  if (typeof reference === "object" && reference !== null) {
    return String(reference?.["Formål"] ?? reference?.purpose ?? "").trim();
  }

  return "";
}

export function resolveProcessingActivityReferenceRoute(processingActivityRecords = [], reference) {
  const matchedRecord = resolveProcessingActivityReferenceRecord(processingActivityRecords, reference);
  return matchedRecord?.id ? detailRouteForEntity("controller_protocol", matchedRecord.id) : "";
}

function normalizeControllerProtocolDatasets(record, datasetRecords = []) {
  if (!Array.isArray(record?.collectionValues?.datasets)) {
    return;
  }

  const seenRelations = new Set();
  record.collectionValues.datasets = record.collectionValues.datasets
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const matchedRecord = resolveDatasetReferenceRecord(datasetRecords, entry);
      if (!matchedRecord?.id) {
        return null;
      }
      const datasetId = String(matchedRecord.id).trim();
      const datasetName = resolveDatasetDisplayName(matchedRecord);
      const role = String(entry?.Rolle ?? entry?.role ?? "").trim();

      const relationKey = datasetId;
      if (seenRelations.has(relationKey)) {
        return null;
      }
      seenRelations.add(relationKey);

      return {
        DatasetId: datasetId,
        Navn: datasetName,
        Rolle: role
      };
    })
    .filter(Boolean);
}

function normalizeDatasetApplicationRelations(record, applicationRecords = []) {
  if (!Array.isArray(record?.collectionValues?.application_relations)) {
    return;
  }

  const seenRelations = new Set();
  record.collectionValues.application_relations = record.collectionValues.application_relations
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const matchedRecord = resolveApplicationReferenceRecord(applicationRecords, entry);
      if (!matchedRecord?.id) {
        return null;
      }
      const applicationId = String(matchedRecord.id).trim();
      const applicationName = resolveApplicationDisplayName(matchedRecord);
      const version = resolveApplicationVersion(matchedRecord);
      const role = String(entry?.Rolle ?? entry?.role ?? "").trim();

      const relationKey = applicationId;
      if (seenRelations.has(relationKey)) {
        return null;
      }
      seenRelations.add(relationKey);

      return {
        ApplicationId: applicationId,
        Navn: applicationName,
        Versjon: version,
        Rolle: role
      };
    })
    .filter(Boolean);
}

function normalizeRelatedDatasets(record, datasetRecords = []) {
  if (!Array.isArray(record?.collectionValues?.related_datasets)) {
    return;
  }

  const seenRelations = new Set();
  record.collectionValues.related_datasets = record.collectionValues.related_datasets
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const matchedRecord = resolveDatasetReferenceRecord(datasetRecords, entry);
      if (!matchedRecord?.id) {
        return null;
      }
      const datasetId = String(matchedRecord.id).trim();
      if (datasetId === String(record?.id ?? "").trim()) {
        return null;
      }
      const datasetName = resolveDatasetDisplayName(matchedRecord);
      const relation = String(entry?.Relasjon ?? entry?.relation ?? "").trim();

      const relationKey = datasetId;
      if (seenRelations.has(relationKey)) {
        return null;
      }
      seenRelations.add(relationKey);

      return {
        DatasetId: datasetId,
        Navn: datasetName,
        Relasjon: relation
      };
    })
    .filter(Boolean);
}

function normalizeRelatedProcessingActivities(record, processingActivityRecords = []) {
  if (!Array.isArray(record?.collectionValues?.related_processing_activities)) {
    return;
  }

  const seenRelations = new Set();
  record.collectionValues.related_processing_activities = record.collectionValues.related_processing_activities
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const matchedRecord = resolveProcessingActivityReferenceRecord(processingActivityRecords, entry);
      if (!matchedRecord?.id) {
        return null;
      }

      const processingActivityId = String(matchedRecord.id).trim();
      const processingActivityName = resolveProcessingActivityDisplayName(matchedRecord);
      const purpose = resolveProcessingActivityPurpose(matchedRecord);
      const relationKey = processingActivityId;

      if (seenRelations.has(relationKey)) {
        return null;
      }
      seenRelations.add(relationKey);

      return {
        ProcessingActivityId: processingActivityId,
        Navn: processingActivityName,
        "Formål": purpose
      };
    })
    .filter(Boolean);
}

function normalizeApplicationDatasetRelations(record, datasetRecords = []) {
  if (!Array.isArray(record?.collectionValues?.application_dataset_relations)) {
    return;
  }

  const seenRelations = new Set();
  record.collectionValues.application_dataset_relations = record.collectionValues.application_dataset_relations
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const matchedRecord = resolveDatasetReferenceRecord(datasetRecords, entry);
      if (!matchedRecord?.id) {
        return null;
      }
      const datasetId = String(matchedRecord.id).trim();
      const datasetName = resolveDatasetDisplayName(matchedRecord);
      const role = String(entry?.Rolle ?? entry?.role ?? "").trim();

      const relationKey = datasetId;
      if (seenRelations.has(relationKey)) {
        return null;
      }
      seenRelations.add(relationKey);

      return {
        DatasetId: datasetId,
        Navn: datasetName,
        Rolle: role
      };
    })
    .filter(Boolean);
}

function normalizeRelatedApplications(record, applicationRecords = []) {
  if (!Array.isArray(record?.collectionValues?.related_applications)) {
    return;
  }

  const seenRelations = new Set();
  record.collectionValues.related_applications = record.collectionValues.related_applications
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const matchedRecord = resolveApplicationReferenceRecord(applicationRecords, entry);
      if (!matchedRecord?.id) {
        return null;
      }
      const applicationId = String(matchedRecord.id).trim();
      if (applicationId === String(record?.id ?? "").trim()) {
        return null;
      }
      const applicationName = resolveApplicationDisplayName(matchedRecord);
      const relation = String(entry?.Relasjon ?? entry?.relation ?? "").trim();

      const relationKey = applicationId;
      if (seenRelations.has(relationKey)) {
        return null;
      }
      seenRelations.add(relationKey);

      return {
        ApplicationId: applicationId,
        Navn: applicationName,
        Relasjon: relation
      };
    })
    .filter(Boolean);
}

function ensureCollectionArray(record, collectionKey) {
  if (!record || typeof record !== "object") {
    return [];
  }

  if (!record.collectionValues || typeof record.collectionValues !== "object") {
    record.collectionValues = {};
  }

  if (!Array.isArray(record.collectionValues[collectionKey])) {
    record.collectionValues[collectionKey] = [];
  }

  return record.collectionValues[collectionKey];
}

function orderMirroredCollectionEntries(existingEntries = [], nextEntriesById = new Map(), resolveEntryId) {
  const orderedEntries = [];
  const seenIds = new Set();

  (Array.isArray(existingEntries) ? existingEntries : []).forEach((entry) => {
    const relationId = String(resolveEntryId(entry) ?? "").trim();
    if (!relationId || seenIds.has(relationId) || !nextEntriesById.has(relationId)) {
      return;
    }

    orderedEntries.push(nextEntriesById.get(relationId));
    seenIds.add(relationId);
  });

  nextEntriesById.forEach((entry, relationId) => {
    if (seenIds.has(relationId)) {
      return;
    }

    orderedEntries.push(entry);
    seenIds.add(relationId);
  });

  return orderedEntries;
}

function createRelationPreferenceMatcher(options = {}) {
  const preferredEntityKey = String(options?.preferredEntityKey ?? "").trim();
  const preferredRecordId = String(options?.preferredRecordId ?? "").trim();

  return (entityKey, recordId) => {
    if (!preferredEntityKey || preferredEntityKey !== String(entityKey ?? "").trim()) {
      return false;
    }

    if (!preferredRecordId) {
      return true;
    }

    return String(recordId ?? "").trim() === preferredRecordId;
  };
}

function resolveMirroredFieldValue(candidates = [], prefers) {
  const normalizedCandidates = candidates
    .filter((candidate) => candidate?.exists)
    .map((candidate) => ({
      entityKey: candidate.entityKey,
      recordId: String(candidate.recordId ?? "").trim(),
      value: String(candidate.value ?? "").trim()
    }));

  const preferredCandidate = normalizedCandidates.find((candidate) => prefers(candidate.entityKey, candidate.recordId));
  if (preferredCandidate) {
    return preferredCandidate.value;
  }

  const firstNonEmptyCandidate = normalizedCandidates.find((candidate) => candidate.value);
  if (firstNonEmptyCandidate) {
    return firstNonEmptyCandidate.value;
  }

  return normalizedCandidates[0]?.value ?? "";
}

function synchronizeApplicationDatasetRelations(applicationRecords = [], datasetRecords = [], options = {}) {
  const prefers = createRelationPreferenceMatcher(options);
  const canonicalApplicationId =
    String(options?.preferredEntityKey ?? "").trim() === "application" ? String(options?.preferredRecordId ?? "").trim() : "";
  const canonicalDatasetId =
    String(options?.preferredEntityKey ?? "").trim() === "dataset" ? String(options?.preferredRecordId ?? "").trim() : "";

  const applicationById = new Map(
    applicationRecords
      .map((record) => [String(record?.id ?? "").trim(), record])
      .filter(([recordId]) => recordId)
  );
  const datasetById = new Map(
    datasetRecords
      .map((record) => [String(record?.id ?? "").trim(), record])
      .filter(([recordId]) => recordId)
  );

  const pairMap = new Map();
  function ensurePair(applicationId, datasetId) {
    const pairKey = `${applicationId}::${datasetId}`;
    if (!pairMap.has(pairKey)) {
      pairMap.set(pairKey, { applicationId, datasetId, applicationEntry: null, datasetEntry: null });
    }
    return pairMap.get(pairKey);
  }

  applicationRecords.forEach((record) => {
    const applicationId = String(record?.id ?? "").trim();
    ensureCollectionArray(record, "application_dataset_relations").forEach((entry) => {
      const matchedDataset = resolveDatasetReferenceRecord(datasetRecords, entry);
      const datasetId = String(matchedDataset?.id ?? "").trim();
      if (!applicationId || !datasetId || !datasetById.has(datasetId)) {
        return;
      }
      if (canonicalDatasetId && datasetId === canonicalDatasetId) {
        return;
      }

      ensurePair(applicationId, datasetId).applicationEntry = entry;
    });
  });

  datasetRecords.forEach((record) => {
    const datasetId = String(record?.id ?? "").trim();
    ensureCollectionArray(record, "application_relations").forEach((entry) => {
      const matchedApplication = resolveApplicationReferenceRecord(applicationRecords, entry);
      const applicationId = String(matchedApplication?.id ?? "").trim();
      if (!datasetId || !applicationId || !applicationById.has(applicationId)) {
        return;
      }
      if (canonicalApplicationId && applicationId === canonicalApplicationId) {
        return;
      }

      ensurePair(applicationId, datasetId).datasetEntry = entry;
    });
  });

  const nextApplicationRelations = new Map(applicationRecords.map((record) => [String(record?.id ?? "").trim(), new Map()]));
  const nextDatasetRelations = new Map(datasetRecords.map((record) => [String(record?.id ?? "").trim(), new Map()]));

  pairMap.forEach(({ applicationId, datasetId, applicationEntry, datasetEntry }) => {
    const applicationRecord = applicationById.get(applicationId);
    const datasetRecord = datasetById.get(datasetId);
    if (!applicationRecord || !datasetRecord) {
      return;
    }

    const role = resolveMirroredFieldValue(
      [
        {
          entityKey: "application",
          recordId: applicationId,
          exists: Boolean(applicationEntry),
          value: applicationEntry?.Rolle ?? applicationEntry?.role ?? ""
        },
        {
          entityKey: "dataset",
          recordId: datasetId,
          exists: Boolean(datasetEntry),
          value: datasetEntry?.Rolle ?? datasetEntry?.role ?? ""
        }
      ],
      prefers
    );

    nextApplicationRelations.get(applicationId)?.set(datasetId, {
      DatasetId: datasetId,
      Navn: resolveDatasetDisplayName(datasetRecord),
      Rolle: role
    });

    nextDatasetRelations.get(datasetId)?.set(applicationId, {
      ApplicationId: applicationId,
      Navn: resolveApplicationDisplayName(applicationRecord),
      Versjon: resolveApplicationVersion(applicationRecord),
      Rolle: role
    });
  });

  applicationRecords.forEach((record) => {
    const applicationId = String(record?.id ?? "").trim();
    const nextEntriesById = nextApplicationRelations.get(applicationId) ?? new Map();
    const existingEntries = ensureCollectionArray(record, "application_dataset_relations");
    record.collectionValues.application_dataset_relations = orderMirroredCollectionEntries(
      existingEntries,
      nextEntriesById,
      (entry) => resolveDatasetReferenceRecord(datasetRecords, entry)?.id ?? entry?.DatasetId ?? entry?.datasetId ?? ""
    );
  });

  datasetRecords.forEach((record) => {
    const datasetId = String(record?.id ?? "").trim();
    const nextEntriesById = nextDatasetRelations.get(datasetId) ?? new Map();
    const existingEntries = ensureCollectionArray(record, "application_relations");
    record.collectionValues.application_relations = orderMirroredCollectionEntries(
      existingEntries,
      nextEntriesById,
      (entry) => resolveApplicationReferenceRecord(applicationRecords, entry)?.id ?? entry?.ApplicationId ?? entry?.applicationId ?? ""
    );
  });
}

function synchronizeControllerProtocolDatasetRelations(processingActivityRecords = [], datasetRecords = [], options = {}) {
  const canonicalDatasetId =
    String(options?.preferredEntityKey ?? "").trim() === "dataset" ? String(options?.preferredRecordId ?? "").trim() : "";
  const canonicalProcessingActivityId =
    String(options?.preferredEntityKey ?? "").trim() === "controller_protocol"
      ? String(options?.preferredRecordId ?? "").trim()
      : "";

  const datasetById = new Map(
    datasetRecords
      .map((record) => [String(record?.id ?? "").trim(), record])
      .filter(([recordId]) => recordId)
  );
  const processingActivityById = new Map(
    processingActivityRecords
      .map((record) => [String(record?.id ?? "").trim(), record])
      .filter(([recordId]) => recordId)
  );

  const pairMap = new Map();
  function ensurePair(processingActivityId, datasetId) {
    const pairKey = `${processingActivityId}::${datasetId}`;
    if (!pairMap.has(pairKey)) {
      pairMap.set(pairKey, { processingActivityId, datasetId, processingEntry: null, datasetEntry: null });
    }
    return pairMap.get(pairKey);
  }

  processingActivityRecords.forEach((record) => {
    const processingActivityId = String(record?.id ?? "").trim();
    ensureCollectionArray(record, "datasets").forEach((entry) => {
      const matchedDataset = resolveDatasetReferenceRecord(datasetRecords, entry);
      const datasetId = String(matchedDataset?.id ?? "").trim();
      if (!processingActivityId || !datasetId || !datasetById.has(datasetId)) {
        return;
      }
      if (canonicalDatasetId && datasetId === canonicalDatasetId) {
        return;
      }

      ensurePair(processingActivityId, datasetId).processingEntry = entry;
    });
  });

  datasetRecords.forEach((record) => {
    const datasetId = String(record?.id ?? "").trim();
    ensureCollectionArray(record, "related_processing_activities").forEach((entry) => {
      const matchedProcessingActivity = resolveProcessingActivityReferenceRecord(processingActivityRecords, entry);
      const processingActivityId = String(matchedProcessingActivity?.id ?? "").trim();
      if (!datasetId || !processingActivityId || !processingActivityById.has(processingActivityId)) {
        return;
      }
      if (canonicalProcessingActivityId && processingActivityId === canonicalProcessingActivityId) {
        return;
      }

      ensurePair(processingActivityId, datasetId).datasetEntry = entry;
    });
  });

  const nextProcessingRelations = new Map(processingActivityRecords.map((record) => [String(record?.id ?? "").trim(), new Map()]));
  const nextDatasetRelations = new Map(datasetRecords.map((record) => [String(record?.id ?? "").trim(), new Map()]));

  pairMap.forEach(({ processingActivityId, datasetId, processingEntry }) => {
    const processingActivityRecord = processingActivityById.get(processingActivityId);
    const datasetRecord = datasetById.get(datasetId);
    if (!processingActivityRecord || !datasetRecord) {
      return;
    }

    nextProcessingRelations.get(processingActivityId)?.set(datasetId, {
      DatasetId: datasetId,
      Navn: resolveDatasetDisplayName(datasetRecord),
      Rolle: String(processingEntry?.Rolle ?? processingEntry?.role ?? "").trim()
    });

    nextDatasetRelations.get(datasetId)?.set(processingActivityId, {
      ProcessingActivityId: processingActivityId,
      Navn: resolveProcessingActivityDisplayName(processingActivityRecord),
      "Formål": resolveProcessingActivityPurpose(processingActivityRecord)
    });
  });

  processingActivityRecords.forEach((record) => {
    const processingActivityId = String(record?.id ?? "").trim();
    const nextEntriesById = nextProcessingRelations.get(processingActivityId) ?? new Map();
    const existingEntries = ensureCollectionArray(record, "datasets");
    record.collectionValues.datasets = orderMirroredCollectionEntries(
      existingEntries,
      nextEntriesById,
      (entry) => resolveDatasetReferenceRecord(datasetRecords, entry)?.id ?? entry?.DatasetId ?? entry?.datasetId ?? ""
    );
  });

  datasetRecords.forEach((record) => {
    const datasetId = String(record?.id ?? "").trim();
    const nextEntriesById = nextDatasetRelations.get(datasetId) ?? new Map();
    const existingEntries = ensureCollectionArray(record, "related_processing_activities");
    record.collectionValues.related_processing_activities = orderMirroredCollectionEntries(
      existingEntries,
      nextEntriesById,
      (entry) =>
        resolveProcessingActivityReferenceRecord(processingActivityRecords, entry)?.id ??
        entry?.ProcessingActivityId ??
        entry?.processingActivityId ??
        entry?.ControllerProtocolId ??
        entry?.controllerProtocolId ??
        ""
    );
  });
}

function synchronizeSymmetricApplicationRelations(applicationRecords = [], options = {}) {
  const prefers = createRelationPreferenceMatcher(options);
  const canonicalApplicationId =
    String(options?.preferredEntityKey ?? "").trim() === "application" ? String(options?.preferredRecordId ?? "").trim() : "";

  const applicationById = new Map(
    applicationRecords
      .map((record) => [String(record?.id ?? "").trim(), record])
      .filter(([recordId]) => recordId)
  );

  const pairMap = new Map();
  function ensurePair(firstApplicationId, secondApplicationId) {
    const orderedIds = [firstApplicationId, secondApplicationId].sort();
    const pairKey = `${orderedIds[0]}::${orderedIds[1]}`;
    if (!pairMap.has(pairKey)) {
      pairMap.set(pairKey, {
        firstApplicationId: orderedIds[0],
        secondApplicationId: orderedIds[1],
        firstEntry: null,
        secondEntry: null
      });
    }
    return pairMap.get(pairKey);
  }

  applicationRecords.forEach((record) => {
    const sourceApplicationId = String(record?.id ?? "").trim();
    ensureCollectionArray(record, "related_applications").forEach((entry) => {
      const matchedApplication = resolveApplicationReferenceRecord(applicationRecords, entry);
      const targetApplicationId = String(matchedApplication?.id ?? "").trim();
      if (!sourceApplicationId || !targetApplicationId || sourceApplicationId === targetApplicationId || !applicationById.has(targetApplicationId)) {
        return;
      }
      if (canonicalApplicationId && sourceApplicationId !== canonicalApplicationId && targetApplicationId === canonicalApplicationId) {
        return;
      }

      const pair = ensurePair(sourceApplicationId, targetApplicationId);
      if (pair.firstApplicationId === sourceApplicationId) {
        pair.firstEntry = entry;
      } else {
        pair.secondEntry = entry;
      }
    });
  });

  const nextRelations = new Map(applicationRecords.map((record) => [String(record?.id ?? "").trim(), new Map()]));

  pairMap.forEach(({ firstApplicationId, secondApplicationId, firstEntry, secondEntry }) => {
    const firstRecord = applicationById.get(firstApplicationId);
    const secondRecord = applicationById.get(secondApplicationId);
    if (!firstRecord || !secondRecord) {
      return;
    }

    const relation = resolveMirroredFieldValue(
      [
        {
          entityKey: "application",
          recordId: firstApplicationId,
          exists: Boolean(firstEntry),
          value: firstEntry?.Relasjon ?? firstEntry?.relation ?? ""
        },
        {
          entityKey: "application",
          recordId: secondApplicationId,
          exists: Boolean(secondEntry),
          value: secondEntry?.Relasjon ?? secondEntry?.relation ?? ""
        }
      ],
      prefers
    );

    nextRelations.get(firstApplicationId)?.set(secondApplicationId, {
      ApplicationId: secondApplicationId,
      Navn: resolveApplicationDisplayName(secondRecord),
      Relasjon: relation
    });
    nextRelations.get(secondApplicationId)?.set(firstApplicationId, {
      ApplicationId: firstApplicationId,
      Navn: resolveApplicationDisplayName(firstRecord),
      Relasjon: relation
    });
  });

  applicationRecords.forEach((record) => {
    const applicationId = String(record?.id ?? "").trim();
    const nextEntriesById = nextRelations.get(applicationId) ?? new Map();
    const existingEntries = ensureCollectionArray(record, "related_applications");
    record.collectionValues.related_applications = orderMirroredCollectionEntries(
      existingEntries,
      nextEntriesById,
      (entry) => resolveApplicationReferenceRecord(applicationRecords, entry)?.id ?? entry?.ApplicationId ?? entry?.applicationId ?? ""
    );
  });
}

function synchronizeSymmetricDatasetRelations(datasetRecords = [], options = {}) {
  const prefers = createRelationPreferenceMatcher(options);
  const canonicalDatasetId =
    String(options?.preferredEntityKey ?? "").trim() === "dataset" ? String(options?.preferredRecordId ?? "").trim() : "";

  const datasetById = new Map(
    datasetRecords
      .map((record) => [String(record?.id ?? "").trim(), record])
      .filter(([recordId]) => recordId)
  );

  const pairMap = new Map();
  function ensurePair(firstDatasetId, secondDatasetId) {
    const orderedIds = [firstDatasetId, secondDatasetId].sort();
    const pairKey = `${orderedIds[0]}::${orderedIds[1]}`;
    if (!pairMap.has(pairKey)) {
      pairMap.set(pairKey, {
        firstDatasetId: orderedIds[0],
        secondDatasetId: orderedIds[1],
        firstEntry: null,
        secondEntry: null
      });
    }
    return pairMap.get(pairKey);
  }

  datasetRecords.forEach((record) => {
    const sourceDatasetId = String(record?.id ?? "").trim();
    ensureCollectionArray(record, "related_datasets").forEach((entry) => {
      const matchedDataset = resolveDatasetReferenceRecord(datasetRecords, entry);
      const targetDatasetId = String(matchedDataset?.id ?? "").trim();
      if (!sourceDatasetId || !targetDatasetId || sourceDatasetId === targetDatasetId || !datasetById.has(targetDatasetId)) {
        return;
      }
      if (canonicalDatasetId && sourceDatasetId !== canonicalDatasetId && targetDatasetId === canonicalDatasetId) {
        return;
      }

      const pair = ensurePair(sourceDatasetId, targetDatasetId);
      if (pair.firstDatasetId === sourceDatasetId) {
        pair.firstEntry = entry;
      } else {
        pair.secondEntry = entry;
      }
    });
  });

  const nextRelations = new Map(datasetRecords.map((record) => [String(record?.id ?? "").trim(), new Map()]));

  pairMap.forEach(({ firstDatasetId, secondDatasetId, firstEntry, secondEntry }) => {
    const firstRecord = datasetById.get(firstDatasetId);
    const secondRecord = datasetById.get(secondDatasetId);
    if (!firstRecord || !secondRecord) {
      return;
    }

    const relation = resolveMirroredFieldValue(
      [
        {
          entityKey: "dataset",
          recordId: firstDatasetId,
          exists: Boolean(firstEntry),
          value: firstEntry?.Relasjon ?? firstEntry?.relation ?? ""
        },
        {
          entityKey: "dataset",
          recordId: secondDatasetId,
          exists: Boolean(secondEntry),
          value: secondEntry?.Relasjon ?? secondEntry?.relation ?? ""
        }
      ],
      prefers
    );

    nextRelations.get(firstDatasetId)?.set(secondDatasetId, {
      DatasetId: secondDatasetId,
      Navn: resolveDatasetDisplayName(secondRecord),
      Relasjon: relation
    });
    nextRelations.get(secondDatasetId)?.set(firstDatasetId, {
      DatasetId: firstDatasetId,
      Navn: resolveDatasetDisplayName(firstRecord),
      Relasjon: relation
    });
  });

  datasetRecords.forEach((record) => {
    const datasetId = String(record?.id ?? "").trim();
    const nextEntriesById = nextRelations.get(datasetId) ?? new Map();
    const existingEntries = ensureCollectionArray(record, "related_datasets");
    record.collectionValues.related_datasets = orderMirroredCollectionEntries(
      existingEntries,
      nextEntriesById,
      (entry) => resolveDatasetReferenceRecord(datasetRecords, entry)?.id ?? entry?.DatasetId ?? entry?.datasetId ?? ""
    );
  });
}

function migrateCatalogReferencesForRecord(record, settings, aliasMaps = {}) {
  if (!record?.collectionValues || typeof record.collectionValues !== "object") {
    return;
  }

  if (Array.isArray(record.collectionValues.labels)) {
    record.collectionValues.labels = normalizeCatalogReferenceArray(settings, "tagsCatalog", record.collectionValues.labels, aliasMaps.tagsCatalog);
  }

  if (Array.isArray(record.collectionValues.common_components)) {
    record.collectionValues.common_components = normalizeCatalogReferenceArray(
      settings,
      "commonComponentsCatalog",
      record.collectionValues.common_components,
      aliasMaps.commonComponentsCatalog
    );
  }

  if (Array.isArray(record.collectionValues.standards)) {
    record.collectionValues.standards = normalizeCatalogReferenceArray(
      settings,
      "standardsCatalog",
      record.collectionValues.standards,
      aliasMaps.standardsCatalog
    );
  }
}

export function normalizeAppState(state, options = {}) {
  if (!state || typeof state !== "object") {
    return state;
  }

  state.entities = normalizeEntityCollections(state);
  state.records = {
    nis2: state.records?.nis2 ? structuredClone(state.records.nis2) : structuredClone(mockRecords.nis2),
    grunnprinsipper_ikt_sikkerhet: state.records?.grunnprinsipper_ikt_sikkerhet
      ? structuredClone(state.records.grunnprinsipper_ikt_sikkerhet)
      : structuredClone(mockRecords.grunnprinsipper_ikt_sikkerhet),
    roles: state.records?.roles ?? null,
    application_draft: state.records?.application_draft ? structuredClone(state.records.application_draft) : null,
    dataset_draft: state.records?.dataset_draft ? structuredClone(state.records.dataset_draft) : null,
    controller_protocol_draft: state.records?.controller_protocol_draft ? structuredClone(state.records.controller_protocol_draft) : null,
    processor_protocol_draft: state.records?.processor_protocol_draft ? structuredClone(state.records.processor_protocol_draft) : null
  };
  state.settings = state.settings ?? {};
  state.settings.commonComponentsCatalog = mergeSettingsCatalogEntries(
    state.settings.commonComponentsCatalog,
    settingsCatalogs.commonComponentsCatalog,
    "commonComponentsCatalog"
  );
  state.settings.standardsCatalog = mergeSettingsCatalogEntries(
    state.settings.standardsCatalog,
    settingsCatalogs.standardsCatalog,
    "standardsCatalog"
  );
  state.settings.tagsCatalog = mergeSettingsCatalogEntries(
    state.settings.tagsCatalog,
    settingsCatalogs.tagsCatalog,
    "tagsCatalog"
  );
  const catalogAliasMaps = {
    commonComponentsCatalog: collapseCatalogAliases(state.settings, "commonComponentsCatalog"),
    standardsCatalog: collapseCatalogAliases(state.settings, "standardsCatalog"),
    tagsCatalog: collapseCatalogAliases(state.settings, "tagsCatalog")
  };

  state.settings.themePreferences = {
    appearance: state.settings.themePreferences?.appearance ?? "light",
    accent: state.settings.themePreferences?.accent ?? "blue",
    surface: state.settings.themePreferences?.surface ?? "warm"
  };

  if (state.records.nis2) {
    state.records.nis2.recordKey = "nis2";
    state.records.nis2.entityKey = "nis2";
    state.records.nis2.breadcrumbs = Array.isArray(state.records.nis2.breadcrumbs) && state.records.nis2.breadcrumbs.length
      ? state.records.nis2.breadcrumbs
      : ["Etterlevelse", "NIS2"];
    state.records.nis2.fieldValues = state.records.nis2.fieldValues ?? {};
    state.records.nis2.collectionValues = state.records.nis2.collectionValues ?? {};
    state.records.nis2.meta = state.records.nis2.meta ?? {};
  }

  if (state.records.grunnprinsipper_ikt_sikkerhet) {
    state.records.grunnprinsipper_ikt_sikkerhet.recordKey = "grunnprinsipper_ikt_sikkerhet";
    state.records.grunnprinsipper_ikt_sikkerhet.entityKey = "grunnprinsipper_ikt_sikkerhet";
    state.records.grunnprinsipper_ikt_sikkerhet.breadcrumbs =
      Array.isArray(state.records.grunnprinsipper_ikt_sikkerhet.breadcrumbs) &&
      state.records.grunnprinsipper_ikt_sikkerhet.breadcrumbs.length
        ? state.records.grunnprinsipper_ikt_sikkerhet.breadcrumbs
        : ["Etterlevelse", "Grunnprinsipper for IKT-sikkerhet"];
    state.records.grunnprinsipper_ikt_sikkerhet.fieldValues =
      state.records.grunnprinsipper_ikt_sikkerhet.fieldValues ?? {};
    state.records.grunnprinsipper_ikt_sikkerhet.collectionValues =
      state.records.grunnprinsipper_ikt_sikkerhet.collectionValues ?? {};
    state.records.grunnprinsipper_ikt_sikkerhet.meta =
      state.records.grunnprinsipper_ikt_sikkerhet.meta ?? {};
  }

  if (state.records.roles) {
    state.records.roles.recordKey = "roles";
    state.records.roles.entityKey = "roles";
    normalizeRolesCollections(state.records.roles);
  }

  if (state.records.application_draft) {
    state.records.application_draft.recordKey = "application_draft";
    state.records.application_draft.entityKey = "application";
  }

  if (state.records.dataset_draft) {
    state.records.dataset_draft.recordKey = "dataset_draft";
    state.records.dataset_draft.entityKey = "dataset";
  }

  if (state.records.controller_protocol_draft) {
    state.records.controller_protocol_draft.recordKey = "controller_protocol_draft";
    state.records.controller_protocol_draft.entityKey = "controller_protocol";
  }

  if (state.records.processor_protocol_draft) {
    state.records.processor_protocol_draft.recordKey = "processor_protocol_draft";
    state.records.processor_protocol_draft.entityKey = "processor_protocol";
  }

  delete state.applicationItems;
  delete state.datasetItems;
  delete state.controllerProtocolItems;
  delete state.processorProtocolItems;

  state.organizationStructure = normalizeOrganizationStructure(state.organizationStructure);

  Object.values(state.entities ?? {})
    .flat()
    .forEach((record) => migrateCatalogReferencesForRecord(record, state.settings, catalogAliasMaps));
  Object.values(state.records ?? {})
    .filter(Boolean)
    .forEach((record) => migrateCatalogReferencesForRecord(record, state.settings, catalogAliasMaps));

  const datasetRecords = state.entities?.dataset ?? [];
  const applicationRecords = state.entities?.application ?? [];
  const processingActivityRecords = state.entities?.controller_protocol ?? [];
  (state.entities?.application ?? []).forEach((record) => normalizeApplicationDatasetRelations(record, datasetRecords));
  (state.entities?.application ?? []).forEach((record) => normalizeRelatedApplications(record, applicationRecords));
  normalizeApplicationDatasetRelations(state.records?.application_draft, datasetRecords);
  normalizeRelatedApplications(state.records?.application_draft, applicationRecords);
  (state.entities?.dataset ?? []).forEach((record) => normalizeDatasetApplicationRelations(record, applicationRecords));
  (state.entities?.dataset ?? []).forEach((record) => normalizeRelatedDatasets(record, datasetRecords));
  (state.entities?.dataset ?? []).forEach((record) => normalizeRelatedProcessingActivities(record, processingActivityRecords));
  normalizeDatasetApplicationRelations(state.records?.dataset_draft, applicationRecords);
  normalizeRelatedDatasets(state.records?.dataset_draft, datasetRecords);
  normalizeRelatedProcessingActivities(state.records?.dataset_draft, processingActivityRecords);
  (state.entities?.controller_protocol ?? []).forEach((record) => normalizeControllerProtocolDatasets(record, datasetRecords));
  normalizeControllerProtocolDatasets(state.records?.controller_protocol_draft, datasetRecords);

  synchronizeApplicationDatasetRelations(applicationRecords, datasetRecords, options);
  synchronizeSymmetricApplicationRelations(applicationRecords, options);
  synchronizeSymmetricDatasetRelations(datasetRecords, options);
  synchronizeControllerProtocolDatasetRelations(processingActivityRecords, datasetRecords, options);

  normalizeOrganizationAffiliations(state.records?.application_draft);

  return state;
}

export function getEntityReferenceBlockers(state, entityKey, recordId) {
  const normalizedId = String(recordId ?? "").trim();
  if (!normalizedId) {
    return [];
  }

  const blockers = [];
  const applications = state?.entities?.application ?? [];
  const datasets = state?.entities?.dataset ?? [];
  const processingActivities = state?.entities?.controller_protocol ?? [];

  if (entityKey === "application") {
    datasets.forEach((record) => {
      const isReferenced = (record?.collectionValues?.application_relations ?? []).some(
        (entry) => String(entry?.ApplicationId ?? entry?.applicationId ?? "").trim() === normalizedId
      );
      if (isReferenced) {
        blockers.push({
          ownerEntityKey: "dataset",
          ownerId: record.id,
          ownerLabel: resolveDatasetDisplayName(record),
          relationLabel: "Applikasjoner"
        });
      }
    });

    applications.forEach((record) => {
      if (String(record?.id ?? "").trim() === normalizedId) {
        return;
      }
      const isReferenced = (record?.collectionValues?.related_applications ?? []).some(
        (entry) => String(entry?.ApplicationId ?? entry?.applicationId ?? "").trim() === normalizedId
      );
      if (isReferenced) {
        blockers.push({
          ownerEntityKey: "application",
          ownerId: record.id,
          ownerLabel: resolveApplicationDisplayName(record),
          relationLabel: "Relaterte applikasjoner"
        });
      }
    });
  }

  if (entityKey === "dataset") {
    applications.forEach((record) => {
      const isReferenced = (record?.collectionValues?.application_dataset_relations ?? []).some(
        (entry) => String(entry?.DatasetId ?? entry?.datasetId ?? "").trim() === normalizedId
      );
      if (isReferenced) {
        blockers.push({
          ownerEntityKey: "application",
          ownerId: record.id,
          ownerLabel: resolveApplicationDisplayName(record),
          relationLabel: "Datasett"
        });
      }
    });

    datasets.forEach((record) => {
      if (String(record?.id ?? "").trim() === normalizedId) {
        return;
      }
      const isReferenced = (record?.collectionValues?.related_datasets ?? []).some(
        (entry) => String(entry?.DatasetId ?? entry?.datasetId ?? "").trim() === normalizedId
      );
      if (isReferenced) {
        blockers.push({
          ownerEntityKey: "dataset",
          ownerId: record.id,
          ownerLabel: resolveDatasetDisplayName(record),
          relationLabel: "Relaterte datasett"
        });
      }
    });

    processingActivities.forEach((record) => {
      const isReferenced = (record?.collectionValues?.datasets ?? []).some(
        (entry) => String(entry?.DatasetId ?? entry?.datasetId ?? "").trim() === normalizedId
      );
      if (isReferenced) {
        blockers.push({
          ownerEntityKey: "controller_protocol",
          ownerId: record.id,
          ownerLabel: resolveProcessingActivityDisplayName(record),
          relationLabel: "Datasett"
        });
      }
    });
  }

  if (entityKey === "controller_protocol") {
    datasets.forEach((record) => {
      const isReferenced = (record?.collectionValues?.related_processing_activities ?? []).some(
        (entry) =>
          String(
            entry?.ProcessingActivityId ??
              entry?.processingActivityId ??
              entry?.ControllerProtocolId ??
              entry?.controllerProtocolId ??
              ""
          ).trim() === normalizedId
      );
      if (isReferenced) {
        blockers.push({
          ownerEntityKey: "dataset",
          ownerId: record.id,
          ownerLabel: resolveDatasetDisplayName(record),
          relationLabel: "Relaterte behandlinger"
        });
      }
    });
  }

  return Array.from(
    new Map(
      blockers.map((blocker) => [
        `${blocker.ownerEntityKey}|${blocker.ownerId}|${blocker.relationLabel}`,
        blocker
      ])
    ).values()
  );
}
