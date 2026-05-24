import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  FluentProvider,
  Spinner,
  Tab,
  TabList,
  Text,
  Toast,
  ToastTitle,
  Toaster,
  useToastController,
  webDarkTheme,
  webLightTheme
} from "@fluentui/react-components";
import {
  AppsRegular,
  BranchRegular,
  BuildingRegular,
  DatabaseRegular,
  GridRegular,
  OrganizationRegular,
  QuestionCircleRegular,
  ServerRegular,
  SettingsRegular,
  ShieldRegular,
  SignOutRegular
} from "@fluentui/react-icons";
import {
  NAV_BOTTOM_ITEMS,
  detailRouteForEntity,
  getEntityRecord,
  getFirstOrganizationNodeId,
  normalizeAppState,
  ORGANIZATION_ROOT_NODE_ID,
  parseHash,
  readHash,
  resolveOrganizationNode,
  resolveScreen,
  routeSectionFromHref,
  sidebarSectionLabel,
  touchEntityRecordForSave
} from "./utils.js";
import { PageRenderer } from "./components.jsx";

const toasterId = "systemkontroll-toaster";

const sidebarIcons = {
  apps: AppsRegular,
  database: DatabaseRegular,
  dns: ServerRegular,
  assignment_ind: GridRegular,
  security: ShieldRegular,
  badge: OrganizationRegular,
  account_tree: BranchRegular
};

const bottomNavIcons = {
  settings: SettingsRegular,
  help: QuestionCircleRegular,
  logout: SignOutRegular
};

function exportGrunnprinsipperEvaluationPdf(appState, exportedBy = "SystemKontroll") {
  const record = appState?.records?.grunnprinsipper_ikt_sikkerhet;
  if (!record) {
    return false;
  }

  const reportWindow = window.open("", "_blank", "width=1200,height=900");
  if (!reportWindow) {
    return false;
  }

  const reportHtml = buildGrunnprinsipperReportHtml(record, exportedBy);
  reportWindow.document.open();
  reportWindow.document.write(reportHtml);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.setTimeout(() => {
    reportWindow.print();
  }, 500);
  return true;
}

function buildGrunnprinsipperReportHtml(record, exportedBy) {
  const fieldValues = record.fieldValues ?? {};
  const collectionEntries = Object.entries(record.collectionValues ?? {})
    .filter(([key, rows]) => /^gp_\d+_\d+$/.test(key) && Array.isArray(rows))
    .sort(([leftKey], [rightKey]) => compareGrunnprinsippKeys(leftKey, rightKey));
  const allRows = collectionEntries.flatMap(([, rows]) => rows);
  const statusCounts = countByValue(allRows, "Status", "Ikke vurdert");
  const priorityCounts = countByValue(allRows, "Prioritet", "Ikke satt");
  const evaluatedCount = allRows.filter((row) => String(row?.Status ?? "").trim() && String(row.Status).trim() !== "Ikke vurdert").length;
  const generatedAt = new Date();
  const generatedAtLabel = new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(generatedAt);

  return `<!doctype html>
<html lang="nb">
  <head>
    <meta charset="utf-8">
    <title>Grunnprinsipper for IKT-sikkerhet - PDF-rapport</title>
    <style>
      ${buildGrunnprinsipperReportCss()}
    </style>
  </head>
  <body>
    <main>
      <section class="cover">
        <p class="eyebrow">SystemKontroll</p>
        <h1>Grunnprinsipper for IKT-sikkerhet</h1>
        <p class="lead">${escapeReportHtml(fieldValues.framework_summary || record.description || "")}</p>
        <dl class="metaGrid">
          <div><dt>Eksportert</dt><dd>${escapeReportHtml(generatedAtLabel)}</dd></div>
          <div><dt>Eksportert av</dt><dd>${escapeReportHtml(exportedBy)}</dd></div>
          <div><dt>Sist oppdatert</dt><dd>${escapeReportHtml(record.meta?.lastUpdated ?? "Ikke satt")}</dd></div>
          <div><dt>Antall tiltak</dt><dd>${allRows.length}</dd></div>
        </dl>
      </section>

      <section class="summarySection">
        <h2>Oppsummering</h2>
        <div class="summaryGrid">
          <div class="summaryCard"><span>Vurdert</span><strong>${evaluatedCount}</strong></div>
          <div class="summaryCard"><span>Ikke vurdert</span><strong>${allRows.length - evaluatedCount}</strong></div>
          <div class="summaryCard"><span>Grunnprinsipper</span><strong>${collectionEntries.length}</strong></div>
          <div class="summaryCard"><span>Kommentarer</span><strong>${allRows.filter((row) => String(row?.Kommentar ?? "").trim()).length}</strong></div>
        </div>
        ${renderReportBreakdown("Status", statusCounts)}
        ${renderReportBreakdown("Prioritet", priorityCounts)}
      </section>

      <section class="overviewSection">
        <h2>Rammeverk og bruk</h2>
        ${renderReportParagraph("Kategorier og fanestruktur", fieldValues.category_structure)}
        ${renderReportParagraph("Prioritering", fieldValues.priority_groups)}
        ${renderReportParagraph("ISO 27002-kobling", fieldValues.iso_mapping)}
        ${renderReportParagraph("Anbefalt bruk", fieldValues.recommended_usage)}
      </section>

      <section class="evaluationSection">
        <h2>Full evaluering</h2>
        ${collectionEntries.map(([collectionKey, rows]) => renderGrunnprinsipperCollectionReport(collectionKey, rows)).join("")}
      </section>
    </main>
  </body>
</html>`;
}

function buildGrunnprinsipperReportCss() {
  return `
    @page { size: A4; margin: 16mm 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #1f2933;
      background: #ffffff;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.45;
    }
    main { max-width: 100%; }
    h1, h2, h3, h4 { margin: 0; color: #111827; line-height: 1.18; }
    h1 { font-size: 30pt; letter-spacing: 0; }
    h2 { margin: 0 0 12px; font-size: 18pt; }
    h3 { font-size: 14pt; }
    h4 { font-size: 11pt; }
    p { margin: 0; }
    a { color: #0f6cbd; }
    .cover {
      min-height: 210mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 18px;
      page-break-after: always;
    }
    .eyebrow {
      color: #0f6cbd;
      font-size: 10pt;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .lead { max-width: 170mm; font-size: 13pt; color: #374151; }
    .metaGrid, .summaryGrid, .breakdownGrid {
      display: grid;
      gap: 10px;
    }
    .metaGrid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-top: 18px;
    }
    .metaGrid div, .summaryCard, .breakdownItem {
      border: 1px solid #d7dde8;
      border-radius: 6px;
      padding: 10px 12px;
      background: #f8fafc;
    }
    dt, .summaryCard span, .breakdownItem span {
      display: block;
      color: #5b6472;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    dd, .summaryCard strong, .breakdownItem strong {
      margin: 4px 0 0;
      color: #111827;
      font-size: 14pt;
      font-weight: 700;
    }
    section { margin-bottom: 18px; }
    .summarySection, .overviewSection { page-break-after: always; }
    .summaryGrid { grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 14px; }
    .breakdownBlock { margin-top: 12px; }
    .breakdownGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .overviewBlock {
      margin-bottom: 12px;
      padding: 12px;
      border-left: 4px solid #0f6cbd;
      background: #f8fafc;
    }
    .overviewBlock h3 { margin-bottom: 6px; font-size: 12pt; }
    .principleGroup {
      page-break-before: auto;
      margin-bottom: 18px;
    }
    .principleHeader {
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 2px solid #d7dde8;
    }
    .principleHeader p { margin-top: 4px; color: #4b5563; }
    .measureCard {
      page-break-inside: avoid;
      margin: 0 0 10px;
      border: 1px solid #d7dde8;
      border-radius: 6px;
      overflow: hidden;
    }
    .measureHeader {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px;
      background: #f8fafc;
      border-bottom: 1px solid #d7dde8;
    }
    .measureHeader h4 { margin-bottom: 4px; }
    .measureId { white-space: nowrap; color: #0f6cbd; font-weight: 700; }
    .measureBody { padding: 10px 12px; }
    .measureText { margin-bottom: 10px; color: #374151; white-space: pre-wrap; }
    .measureFacts {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 10px;
    }
    .fact {
      padding: 7px 8px;
      border: 1px solid #e5e7eb;
      border-radius: 5px;
    }
    .fact span {
      display: block;
      color: #6b7280;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
    }
    .fact strong {
      display: block;
      margin-top: 2px;
      font-size: 10pt;
    }
    .commentBlock {
      margin-top: 8px;
      padding: 9px 10px;
      border: 1px solid #d7dde8;
      border-radius: 5px;
      background: #ffffff;
    }
    .commentBlock h5 {
      margin: 0 0 6px;
      color: #374151;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .commentContent p { margin: 0 0 6px; }
    .commentContent ul, .commentContent ol { margin: 5px 0 7px 20px; padding: 0; }
    @media print {
      .principleGroup { break-inside: auto; }
      .measureCard { break-inside: avoid; }
    }
  `;
}

function renderReportParagraph(title, value) {
  const normalizedValue = String(value ?? "").trim();
  if (!normalizedValue) {
    return "";
  }
  return `<div class="overviewBlock"><h3>${escapeReportHtml(title)}</h3><p>${escapeReportHtml(normalizedValue)}</p></div>`;
}

function renderReportBreakdown(title, counts) {
  const entries = Object.entries(counts);
  if (!entries.length) {
    return "";
  }
  return `<div class="breakdownBlock">
    <h3>${escapeReportHtml(title)}</h3>
    <div class="breakdownGrid">
      ${entries.map(([label, count]) => `<div class="breakdownItem"><span>${escapeReportHtml(label)}</span><strong>${count}</strong></div>`).join("")}
    </div>
  </div>`;
}

function renderGrunnprinsipperCollectionReport(collectionKey, rows) {
  const firstRow = rows[0] ?? {};
  const title = [firstRow["GP-ID"], firstRow.Grunnprinsipp].filter(Boolean).join(" ");
  const subtitle = [firstRow.Kategori, firstRow.Spesifisering].filter(Boolean).join(" / ");

  return `<article class="principleGroup" id="${escapeReportAttribute(collectionKey)}">
    <div class="principleHeader">
      <h3>${escapeReportHtml(title || collectionKey)}</h3>
      ${subtitle ? `<p>${escapeReportHtml(subtitle)}</p>` : ""}
    </div>
    ${rows.map(renderGrunnprinsipperMeasureReport).join("")}
  </article>`;
}

function renderGrunnprinsipperMeasureReport(row) {
  const comment = sanitizeReportRichText(row?.Kommentar);
  return `<div class="measureCard">
    <div class="measureHeader">
      <div>
        <h4>${escapeReportHtml(row?.Tiltaksoverskrift || "Uten tiltak")}</h4>
        <p>${escapeReportHtml(row?.["Tiltak ID"] || row?.["Nr."] || "")}</p>
      </div>
      <div class="measureId">${escapeReportHtml(row?.["Tiltak ID"] || "")}</div>
    </div>
    <div class="measureBody">
      <p class="measureText">${escapeReportHtml(row?.Tiltaksbeskrivelse || "")}</p>
      <div class="measureFacts">
        <div class="fact"><span>Status</span><strong>${escapeReportHtml(row?.Status || "Ikke vurdert")}</strong></div>
        <div class="fact"><span>Prioritet</span><strong>${escapeReportHtml(row?.Prioritet || "Ikke satt")}</strong></div>
        <div class="fact"><span>ISO 27002</span><strong>${escapeReportHtml(row?.["ISO 27002"] || "Ikke satt")}</strong></div>
      </div>
      <div class="commentBlock">
        <h5>Kommentar og oppfølging</h5>
        <div class="commentContent">${comment || "<p>Ingen kommentar registrert.</p>"}</div>
      </div>
    </div>
  </div>`;
}

function compareGrunnprinsippKeys(leftKey, rightKey) {
  const leftParts = String(leftKey).match(/\d+/g)?.map(Number) ?? [];
  const rightParts = String(rightKey).match(/\d+/g)?.map(Number) ?? [];
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference) {
      return difference;
    }
  }
  return String(leftKey).localeCompare(String(rightKey), "nb");
}

function countByValue(rows, key, fallback) {
  return rows.reduce((counts, row) => {
    const label = String(row?.[key] ?? "").trim() || fallback;
    counts[label] = (counts[label] ?? 0) + 1;
    return counts;
  }, {});
}

function sanitizeReportRichText(value) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) {
    return "";
  }

  if (!/<\/?[a-z][\s\S]*>/i.test(rawValue)) {
    return `<p>${escapeReportHtml(rawValue).replace(/\n/g, "<br>")}</p>`;
  }

  const template = document.createElement("template");
  template.innerHTML = rawValue;
  return Array.from(template.content.childNodes).map(sanitizeReportNode).join("").trim();
}

function sanitizeReportNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeReportHtml(node.textContent ?? "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const tagName = node.tagName.toLowerCase();
  const children = Array.from(node.childNodes).map(sanitizeReportNode).join("");

  if (["strong", "b"].includes(tagName)) {
    return `<strong>${children}</strong>`;
  }
  if (["em", "i"].includes(tagName)) {
    return `<em>${children}</em>`;
  }
  if (tagName === "u") {
    return `<u>${children}</u>`;
  }
  if (tagName === "br") {
    return "<br>";
  }
  if (["p", "li", "ul", "ol"].includes(tagName)) {
    return `<${tagName}>${children}</${tagName}>`;
  }
  if (tagName === "a") {
    const href = normalizeReportHref(node.getAttribute("href"));
    return href ? `<a href="${escapeReportAttribute(href)}">${children || escapeReportHtml(href)}</a>` : children;
  }
  return children;
}

function normalizeReportHref(value) {
  const trimmed = String(value ?? "").trim();
  return /^(https?:|mailto:)/i.test(trimmed) ? trimmed : "";
}

function escapeReportHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeReportAttribute(value) {
  return escapeReportHtml(value).replace(/"/g, "&quot;");
}

export default function App() {
  const [authSession, setAuthSession] = useState(null);
  const [bootstrap, setBootstrap] = useState(null);
  const [model, setModel] = useState(null);
  const [appState, setAppState] = useState(null);
  const [hash, setHash] = useState(readHash());
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [searchState, setSearchState] = useState({});
  const [listFilters, setListFilters] = useState({
    datasets: { hosting: "all", privacy: "all" }
  });
  const [dialogState, setDialogState] = useState(null);
  const [isSettingsWindowOpen, setIsSettingsWindowOpen] = useState(false);
  const [selectedOrgNodeId, setSelectedOrgNodeId] = useState("");
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const { dispatchToast } = useToastController(toasterId);
  const currentUser = useMemo(() => {
    const authenticatedUser = authSession?.user;
    const roleLabel = {
      admin: "Administrator",
      editor: "Redaktør",
      viewer: "Lesetilgang"
    }[authenticatedUser?.role];
    return {
      name: authenticatedUser?.name || authenticatedUser?.email || "Ola Nordmann",
      role: roleLabel ? `${roleLabel} · ${authenticatedUser?.email ?? ""}` : authenticatedUser?.email || "Organisasjonsadministrator"
    };
  }, [authSession]);

  async function loadCurrentAuthSession() {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Klarte ikke å kontrollere innlogging.");
    }
    return response.json();
  }

  async function refreshAuthSession() {
    const payload = await loadCurrentAuthSession();
    setAuthSession(payload);
    return payload;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadAuthSession() {
      try {
        const payload = await loadCurrentAuthSession();
        if (isMounted) {
          setAuthSession(payload);
        }
      } catch (authError) {
        if (isMounted) {
          setError(authError.message ?? "Klarte ikke å kontrollere innlogging.");
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    loadAuthSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setHash(readHash());
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (isAuthLoading) {
        return;
      }

      if (authSession?.authRequired && !authSession.authenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [bootstrapResponse, modelResponse, stateResponse] = await Promise.all([
          fetch("/api/bootstrap"),
          fetch("/generated/systemkontroll-model.json"),
          fetch("/api/state")
        ]);

        if (bootstrapResponse.status === 401 || modelResponse.status === 401 || stateResponse.status === 401) {
          setAuthSession((previousSession) => ({
            ...(previousSession ?? { authRequired: true, providers: [] }),
            authenticated: false,
            user: null
          }));
          throw new Error("Du må logge inn på nytt.");
        }

        if (!bootstrapResponse.ok || !modelResponse.ok || !stateResponse.ok) {
          throw new Error("Klarte ikke å laste oppstartsdata.");
        }

        const [bootstrapPayload, modelPayload, statePayload] = await Promise.all([
          bootstrapResponse.json(),
          modelResponse.json(),
          stateResponse.json()
        ]);

        if (!isMounted) {
          return;
        }

        setBootstrap(bootstrapPayload);
        setModel(modelPayload);
        setAppState(normalizeAppState(statePayload));
        setError("");
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message ?? "En ukjent feil oppstod.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [authSession, isAuthLoading]);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mediaQuery) {
      return undefined;
    }

    const updatePreference = () => {
      setSystemPrefersDark(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener?.("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener?.("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    if (!isSettingsWindowOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsSettingsWindowOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsWindowOpen]);

  const routeInfo = useMemo(() => parseHash(hash), [hash]);
  const currentScreen = useMemo(() => {
    if (!bootstrap?.screenRegistry) {
      return null;
    }

    return resolveScreen(bootstrap.screenRegistry, routeInfo.routePath) ?? bootstrap.screenRegistry[0];
  }, [bootstrap, routeInfo.routePath]);
  const settingsScreen = useMemo(
    () => bootstrap?.screenRegistry?.find((screen) => screen.navKey === "settings" || screen.route === "#/settings") ?? null,
    [bootstrap]
  );

  const currentStructure = useMemo(() => {
    if (!currentScreen || !model?.structures) {
      return null;
    }

    return model.structures[currentScreen.entityKey] ?? null;
  }, [currentScreen, model]);

  const currentRecord = useMemo(() => {
    if (!currentScreen || !appState) {
      return null;
    }

    if (routeInfo.query.mode === "new") {
      if (currentScreen.entityKey === "application") {
        return appState.records.application_draft ?? null;
      }

      if (currentScreen.entityKey === "dataset") {
        return appState.records.dataset_draft ?? null;
      }

      if (currentScreen.entityKey === "controller_protocol") {
        return appState.records.controller_protocol_draft ?? null;
      }

      if (currentScreen.entityKey === "processor_protocol") {
        return appState.records.processor_protocol_draft ?? null;
      }
    }

    if (currentScreen.pageFamily === "EntityDetailPage") {
      if (!routeInfo.query.id && currentScreen.recordKey && appState.records?.[currentScreen.recordKey]) {
        return appState.records[currentScreen.recordKey] ?? null;
      }

      return getEntityRecord(appState, currentScreen.entityKey, routeInfo.query.id);
    }

    return currentScreen.recordKey ? appState.records[currentScreen.recordKey] ?? null : null;
  }, [appState, currentScreen, routeInfo.query.id, routeInfo.query.mode]);

  const selectedOrgNode = useMemo(() => {
    if (!appState?.organizationStructure) {
      return null;
    }

    if (selectedOrgNodeId === ORGANIZATION_ROOT_NODE_ID) {
      return null;
    }

    return resolveOrganizationNode(appState.organizationStructure, selectedOrgNodeId);
  }, [appState, selectedOrgNodeId]);

  useEffect(() => {
    if (!appState?.organizationStructure) {
      return;
    }

    const hasValidSelection =
      selectedOrgNodeId === ORGANIZATION_ROOT_NODE_ID || Boolean(resolveOrganizationNode(appState.organizationStructure, selectedOrgNodeId));

    if (!selectedOrgNodeId || !hasValidSelection) {
      setSelectedOrgNodeId(getFirstOrganizationNodeId(appState.organizationStructure) || ORGANIZATION_ROOT_NODE_ID);
    }
  }, [appState, selectedOrgNodeId]);

  const activeSidebarItems = useMemo(() => {
    if (!bootstrap?.sidebarNavigation || !currentScreen?.topSection) {
      return [];
    }

    return bootstrap.sidebarNavigation[currentScreen.topSection] ?? [];
  }, [bootstrap, currentScreen]);

  const themePreferences = useMemo(
    () => appState?.settings?.themePreferences ?? { appearance: "light", accent: "blue", surface: "warm" },
    [appState]
  );

  const resolvedAppearance = useMemo(() => {
    if (themePreferences.appearance === "system") {
      return systemPrefersDark ? "dark" : "light";
    }

    return themePreferences.appearance ?? "light";
  }, [systemPrefersDark, themePreferences.appearance]);

  const fluentTheme = resolvedAppearance === "dark" ? webDarkTheme : webLightTheme;

  function showToast(title, intent = "success") {
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
      </Toast>,
      { intent }
    );
  }

  function buildNormalizationContext(overrides = {}) {
    const preferredEntityKey = String(overrides?.preferredEntityKey ?? currentScreen?.entityKey ?? "").trim();
    const preferredRecordId =
      String(
        overrides?.preferredRecordId ??
          (routeInfo.query.mode === "new"
            ? ""
            : currentScreen?.pageFamily === "EntityDetailPage"
              ? currentRecord?.id ?? ""
              : "")
      ).trim();

    return {
      preferredEntityKey,
      preferredRecordId
    };
  }

  function updateDraft(updater, normalizationOverrides = {}) {
    setAppState((previousState) => {
      const nextState = structuredClone(previousState);
      updater(nextState);
      return normalizeAppState(nextState, buildNormalizationContext(normalizationOverrides));
    });
    setIsDirty(true);
  }

  function buildNextState(updater, normalizationOverrides = {}) {
    const nextState = structuredClone(appState);
    updater(nextState);
    return normalizeAppState(nextState, buildNormalizationContext(normalizationOverrides));
  }

  async function persistState(stateToPersist = appState, successMessage = "Lagre endringer er gjennomført.") {
    if (!stateToPersist || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stateToPersist)
      });

      if (!response.ok) {
        throw new Error("Lagring feilet.");
      }

      const savedState = await response.json();
      setAppState(normalizeAppState(savedState));
      setIsDirty(false);
      showToast(successMessage);
    } catch (saveError) {
      showToast(saveError.message ?? "Lagring feilet.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  function createBlankApplicationDraft() {
    const template = structuredClone(appState.entities?.application?.[0] ?? {});
    const blankFieldValues = Object.fromEntries(
      Object.entries(template.fieldValues ?? {}).map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, []];
        }
        if (typeof value === "boolean") {
          return [key, null];
        }
        return [key, ""];
      })
    );
    const blankCollectionValues = Object.fromEntries(Object.keys(template.collectionValues ?? {}).map((key) => [key, []]));

    return {
      ...template,
      id: "APP-DRAFT",
      recordKey: "application_draft",
      breadcrumbs: ["Systemer", "Applikasjoner", "Ny applikasjon"],
      description: "Registrer grunninformasjon, brukere, arkitektur, økonomi og drift for den nye applikasjonen.",
      fieldValues: {
        ...blankFieldValues,
        name: "",
        vendor: "",
        version: "",
        system_owner: ""
      },
      collectionValues: blankCollectionValues,
      meta: {
        ...template.meta,
        createdAt: new Date().toISOString().slice(0, 10),
        lastUpdated: new Date().toISOString().slice(0, 10),
        lastModifiedBy: currentUser.name
      }
    };
  }

  function createBlankDatasetDraft() {
    const template = structuredClone(appState.entities?.dataset?.[0] ?? {});
    const blankFieldValues = Object.fromEntries(
      Object.entries(template.fieldValues ?? {}).map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, []];
        }
        if (typeof value === "boolean") {
          return [key, null];
        }
        return [key, ""];
      })
    );
    const blankCollectionValues = Object.fromEntries(Object.keys(template.collectionValues ?? {}).map((key) => [key, []]));

    return {
      ...template,
      id: "DS-DRAFT",
      recordKey: "dataset_draft",
      entityKey: "dataset",
      breadcrumbs: ["Systemer", "Datasett", "Nytt datasett"],
      description: "Registrer grunninformasjon, datainnhold, lagring, relasjoner og lenker for det nye datasettet.",
      fieldValues: {
        ...blankFieldValues,
        name: "",
        purpose: "",
        description: "",
        hosting_type: ""
      },
      collectionValues: blankCollectionValues,
      meta: {
        ...(template.meta ?? {}),
        createdAt: new Date().toISOString().slice(0, 10),
        lastUpdated: new Date().toISOString().slice(0, 10),
        lastModifiedBy: currentUser.name
      }
    };
  }

  function createBlankControllerProtocolDraft() {
    const template = structuredClone(appState.entities?.controller_protocol?.[0] ?? {});
    const blankFieldValues = Object.fromEntries(
      Object.entries(template.fieldValues ?? {}).map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, []];
        }
        if (typeof value === "boolean") {
          return [key, null];
        }
        return [key, ""];
      })
    );
    const blankCollectionValues = Object.fromEntries(Object.keys(template.collectionValues ?? {}).map((key) => [key, []]));

    return {
      ...template,
      id: "CTRL-DRAFT",
      recordKey: "controller_protocol_draft",
      entityKey: "controller_protocol",
      breadcrumbs: ["Etterlevelse", "Behandlingsansvarlig protokoll", "Ny behandling"],
      description: "Registrer behandlingsaktivitet, organisasjonsforankring, formål, behandlingsgrunnlag og relasjoner.",
      fieldValues: {
        ...blankFieldValues,
        name: "",
        controller: "",
        article_6_reason: "",
        article_9_reason: ""
      },
      collectionValues: blankCollectionValues,
      meta: {
        ...(template.meta ?? {}),
        createdAt: new Date().toISOString().slice(0, 10),
        lastUpdated: new Date().toISOString().slice(0, 10),
        lastModifiedBy: currentUser.name
      }
    };
  }

  function createBlankProcessorProtocolDraft() {
    const template = structuredClone(appState.entities?.processor_protocol?.[0] ?? {});
    const blankFieldValues = Object.fromEntries(
      Object.entries(template.fieldValues ?? {}).map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, []];
        }
        if (typeof value === "boolean") {
          return [key, null];
        }
        return [key, ""];
      })
    );
    const blankCollectionValues = Object.fromEntries(Object.keys(template.collectionValues ?? {}).map((key) => [key, []]));

    return {
      ...template,
      id: "PROC-DRAFT",
      recordKey: "processor_protocol_draft",
      entityKey: "processor_protocol",
      breadcrumbs: ["Etterlevelse", "Databehandler protokoll", "Ny behandling"],
      description: "Registrer behandlingsaktivitet, databehandlerrolle, oppdragsgivere, sikkerhet og relasjoner.",
      fieldValues: {
        ...blankFieldValues,
        name: "",
        processor: "",
        controllers: []
      },
      collectionValues: blankCollectionValues,
      meta: {
        ...(template.meta ?? {}),
        createdAt: new Date().toISOString().slice(0, 10),
        lastUpdated: new Date().toISOString().slice(0, 10),
        lastModifiedBy: currentUser.name
      }
    };
  }

  function buildApplicationRevisionRows(record, revisionDate) {
    const criteriaRows = Array.isArray(record?.collectionValues?.review_criteria)
      ? record.collectionValues.review_criteria
      : [];

    return criteriaRows.map((criterion) => ({
      Kriterie: String(criterion?.label ?? criterion?.Kriterie ?? criterion?.key ?? "Uten navn").trim() || "Uten navn",
      Poengsum: String(criterion?.score ?? criterion?.Poengsum ?? "").trim(),
      Kommentar: String(criterion?.comment ?? criterion?.Kommentar ?? "").trim(),
      Dato: revisionDate
    }));
  }

  async function handlePageAction(action) {
    if (!action) {
      return;
    }

    if (action.actionId === "export-grunnprinsipper-pdf") {
      const didOpenReport = exportGrunnprinsipperEvaluationPdf(appState, currentUser.name);
      showToast(
        didOpenReport
          ? "PDF-rapporten åpnes i utskriftsvisning."
          : "Kunne ikke åpne PDF-rapporten. Sjekk at popup-vinduer er tillatt.",
        didOpenReport ? "info" : "error"
      );
      return;
    }

    if (action.actionId === "create-application-revision") {
      if (currentScreen?.entityKey !== "application" || !currentRecord?.id) {
        showToast("Revisjon er bare tilgjengelig for applikasjoner.", "error");
        return;
      }

      const revisionDate = new Date().toISOString().slice(0, 10);
      const revisionRows = buildApplicationRevisionRows(currentRecord, revisionDate);
      if (!revisionRows.length) {
        showToast("Ingen vurderingskriterier er registrert for applikasjonen.", "error");
        return;
      }

      const nextState = buildNextState((draftState) => {
        const targetRecord =
          (currentScreen.recordKey && draftState.records?.[currentScreen.recordKey]) ||
          getEntityRecord(draftState, "application", currentRecord.id);
        if (!targetRecord) {
          return;
        }

        targetRecord.fieldValues = {
          ...(targetRecord.fieldValues ?? {}),
          last_revised_date: revisionDate
        };
        targetRecord.collectionValues = targetRecord.collectionValues ?? {};
        targetRecord.collectionValues.historical_reviews = [
          ...revisionRows,
          ...(Array.isArray(targetRecord.collectionValues.historical_reviews)
            ? targetRecord.collectionValues.historical_reviews
            : [])
        ];
        targetRecord.listSummary = {
          ...(targetRecord.listSummary ?? {}),
          lastRevised: revisionDate
        };
        touchEntityRecordForSave(targetRecord, currentUser.name);
      }, { preferredEntityKey: "application", preferredRecordId: currentRecord.id });

      setAppState(nextState);
      await persistState(nextState, "Ny revisjon er lagret.");
      return;
    }

    if (action.label?.toLowerCase().includes("lagre")) {
      if (routeInfo.query.mode === "new" && currentScreen?.entityKey === "application" && appState?.records?.application_draft) {
        const today = new Date().toISOString().slice(0, 10);
        const generatedId = `APP-${Date.now()}`;
        const draftRecord = structuredClone(appState.records.application_draft);
        const nextState = buildNextState((draftState) => {
          const draftFields = draftState.records.application_draft.fieldValues ?? {};
          const applicationName = draftFields.name?.trim() || "Ny applikasjon";
          const vendorName = draftFields.vendor?.trim() || "Ukjent leverandør";
          const versionValue = draftFields.version?.trim() || "1.0";
          const ownerValue = draftFields.system_owner?.trim() || "Ikke satt";
          const lifecycleStatus = draftFields.lifecycle_status?.trim() || "Under vurdering";
          const criticalityValue = draftFields.criticality?.trim() || "Middels";

          draftState.entities.application.unshift({
            ...draftRecord,
            entityKey: "application",
            id: generatedId,
            recordKey: "application",
            breadcrumbs: ["Systemer", "Applikasjoner", applicationName],
            description:
              draftFields.description?.trim() || "Ny applikasjon registrert i SystemKontroll.",
            fieldValues: {
              ...draftFields,
              name: applicationName,
              vendor: vendorName,
              version: versionValue,
              system_owner: ownerValue,
              lifecycle_status: lifecycleStatus,
              criticality: criticalityValue
            },
            meta: {
              ...(draftRecord.meta ?? {}),
              createdAt: today,
              lastUpdated: today,
              lastModifiedBy: currentUser.name
            },
            listSummary: {
              ...(draftRecord.listSummary ?? {}),
              status: lifecycleStatus,
              criticality: criticalityValue,
              systemOwner: ownerValue,
              lastRevised: draftFields.last_revised_date ?? "",
              lastUpdated: today
            }
          });

          delete draftState.records.application_draft;
        }, { preferredEntityKey: "application", preferredRecordId: generatedId });

        setAppState(nextState);
        await persistState(nextState, "Ny applikasjon er opprettet.");
        navigateTo(detailRouteForEntity("application", generatedId));
        return;
      }

      if (routeInfo.query.mode === "new" && currentScreen?.entityKey === "dataset" && appState?.records?.dataset_draft) {
        const today = new Date().toISOString().slice(0, 10);
        const generatedId = `DS-${Date.now()}`;
        const draftRecord = structuredClone(appState.records.dataset_draft);
        const nextState = buildNextState((draftState) => {
          const draftFields = draftState.records.dataset_draft.fieldValues ?? {};
          const datasetName = draftFields.name?.trim() || "Nytt datasett";
          const purposeValue = draftFields.purpose?.trim() || "Ikke beskrevet";
          const descriptionValue = draftFields.description?.trim() || "";
          const hostingType = draftFields.hosting_type?.trim() || "Cloud";
          const hasPersonalData = Boolean(draftFields.has_personal_data);
          const hasSensitivePersonalData = Boolean(draftFields.has_sensitive_personal_data);

          draftState.entities.dataset.unshift({
            ...draftRecord,
            entityKey: "dataset",
            id: generatedId,
            recordKey: "dataset",
            breadcrumbs: ["Systemer", "Datasett", datasetName],
            description: descriptionValue || "Nytt datasett registrert i SystemKontroll.",
            fieldValues: {
              ...draftFields,
              name: datasetName,
              purpose: purposeValue,
              description: descriptionValue,
              hosting_type: hostingType,
              has_personal_data: hasPersonalData,
              has_sensitive_personal_data: hasSensitivePersonalData
            },
            meta: {
              ...(draftRecord.meta ?? {}),
              createdAt: today,
              lastUpdated: today,
              lastModifiedBy: currentUser.name
            },
            listSummary: {
              ...(draftRecord.listSummary ?? {}),
              name: datasetName,
              purpose: purposeValue,
              description: descriptionValue,
              hostingType,
              hasPersonalData,
              hasSensitivePersonalData,
              lastUpdated: today
            }
          });

          delete draftState.records.dataset_draft;
        }, { preferredEntityKey: "dataset", preferredRecordId: generatedId });

        setAppState(nextState);
        await persistState(nextState, "Nytt datasett er opprettet.");
        navigateTo(detailRouteForEntity("dataset", generatedId));
        return;
      }

      if (routeInfo.query.mode === "new" && currentScreen?.entityKey === "controller_protocol" && appState?.records?.controller_protocol_draft) {
        const today = new Date().toISOString().slice(0, 10);
        const generatedId = `CTRL-${Date.now()}`;
        const draftRecord = structuredClone(appState.records.controller_protocol_draft);
        const nextState = buildNextState((draftState) => {
          const draftFields = draftState.records.controller_protocol_draft.fieldValues ?? {};
          const treatmentName = draftFields.name?.trim() || "Ny behandling";
          const controllerValue = draftFields.controller?.trim() || "Ikke satt";
          const legalBasis = draftFields.article_6_reason?.trim() || "Ikke angitt";

          draftState.entities.controller_protocol.unshift({
            ...draftRecord,
            entityKey: "controller_protocol",
            id: generatedId,
            recordKey: "controller_protocol",
            breadcrumbs: ["Etterlevelse", "Behandlingsansvarlig protokoll", treatmentName],
            description: draftFields.description?.trim() || "Ny behandling registrert i SystemKontroll.",
            fieldValues: {
              ...draftFields,
              name: treatmentName,
              controller: controllerValue,
              article_6_reason: legalBasis
            },
            meta: {
              ...(draftRecord.meta ?? {}),
              createdAt: today,
              lastUpdated: today,
              lastModifiedBy: currentUser.name
            },
            listSummary: {
              ...(draftRecord.listSummary ?? {}),
              name: treatmentName,
              controller: controllerValue,
              legalBasis,
              status: "Under vurdering",
              privacyRisk: "Middels",
              lastUpdated: today
            }
          });

          delete draftState.records.controller_protocol_draft;
        }, { preferredEntityKey: "controller_protocol", preferredRecordId: generatedId });

        setAppState(nextState);
        await persistState(nextState, "Ny behandling er opprettet.");
        navigateTo(detailRouteForEntity("controller_protocol", generatedId));
        return;
      }

      if (routeInfo.query.mode === "new" && currentScreen?.entityKey === "processor_protocol" && appState?.records?.processor_protocol_draft) {
        const today = new Date().toISOString().slice(0, 10);
        const generatedId = `PROC-${Date.now()}`;
        const draftRecord = structuredClone(appState.records.processor_protocol_draft);
        const nextState = buildNextState((draftState) => {
          const draftFields = draftState.records.processor_protocol_draft.fieldValues ?? {};
          const treatmentName = draftFields.name?.trim() || "Ny behandling";
          const processorValue = draftFields.processor?.trim() || "Ikke satt";
          const controllerCount = Array.isArray(draftFields.controllers) ? draftFields.controllers.length : 0;

          draftState.entities.processor_protocol.unshift({
            ...draftRecord,
            entityKey: "processor_protocol",
            id: generatedId,
            recordKey: "processor_protocol",
            breadcrumbs: ["Etterlevelse", "Databehandler protokoll", treatmentName],
            description: draftFields.description?.trim() || "Ny behandling registrert i SystemKontroll.",
            fieldValues: {
              ...draftFields,
              name: treatmentName,
              processor: processorValue,
              controllers: Array.isArray(draftFields.controllers) ? draftFields.controllers : []
            },
            meta: {
              ...(draftRecord.meta ?? {}),
              createdAt: today,
              lastUpdated: today,
              lastModifiedBy: currentUser.name
            },
            listSummary: {
              ...(draftRecord.listSummary ?? {}),
              name: treatmentName,
              processor: processorValue,
              controllerCount,
              status: "Under vurdering",
              securityLevel: "Middels",
              lastUpdated: today
            }
          });

          delete draftState.records.processor_protocol_draft;
        }, { preferredEntityKey: "processor_protocol", preferredRecordId: generatedId });

        setAppState(nextState);
        await persistState(nextState, "Ny behandling er opprettet.");
        navigateTo(detailRouteForEntity("processor_protocol", generatedId));
        return;
      }

      if (currentScreen?.pageFamily === "EntityDetailPage" && currentRecord?.id) {
        const nextState = buildNextState((draftState) => {
          const targetRecord =
            (currentScreen.recordKey && draftState.records?.[currentScreen.recordKey]) ||
            getEntityRecord(draftState, currentScreen.entityKey, currentRecord.id);
          touchEntityRecordForSave(targetRecord, currentUser.name);
        });
        setAppState(nextState);
        await persistState(nextState);
        return;
      }

      persistState();
      return;
    }

    if (action.actionId === "add-application") {
      const nextState = buildNextState((draftState) => {
        draftState.records.application_draft = createBlankApplicationDraft();
      });
      setAppState(nextState);
      setIsDirty(true);
      navigateTo("#/applications/detail?mode=new");
      return;
    }

    if (action.actionId === "add-dataset") {
      const nextState = buildNextState((draftState) => {
        draftState.records.dataset_draft = createBlankDatasetDraft();
      });
      setAppState(nextState);
      setIsDirty(true);
      navigateTo("#/datasets/barnevern-datasett?mode=new");
      return;
    }

    if (action.actionId === "add-controller-protocol") {
      const nextState = buildNextState((draftState) => {
        draftState.records.controller_protocol_draft = createBlankControllerProtocolDraft();
      });
      setAppState(nextState);
      setIsDirty(true);
      navigateTo("#/controller-protocol/detail?mode=new");
      return;
    }

    if (action.actionId === "add-processor-protocol") {
      const nextState = buildNextState((draftState) => {
        draftState.records.processor_protocol_draft = createBlankProcessorProtocolDraft();
      });
      setAppState(nextState);
      setIsDirty(true);
      navigateTo("#/processor-protocol/detail?mode=new");
      return;
    }

    if (action.actionId === "add-infrastructure") {
      openDialog({
        title: "Nytt infrastrukturelement",
        initialValue: {
          name: "",
          description: ""
        },
        fields: [
          { key: "name", label: "Navn" },
          { key: "description", label: "Beskrivelse", type: "textarea" }
        ],
        onSubmit: (draft) => {
          updateDraft((nextState) => {
            if (!Array.isArray(nextState.infrastructureItems)) {
              nextState.infrastructureItems = [];
            }
            nextState.infrastructureItems.unshift({
              id: `INF-${Date.now()}`,
              name: draft.name || "Nytt infrastrukturelement",
              description: draft.description || "",
              lastUpdated: new Date().toISOString().slice(0, 10)
            });
          });
          showToast("Nytt infrastrukturelement er lagt til.");
        }
      });
      return;
    }

    showToast(`${action.label} er ikke koblet til enda.`, "info");
  }

  function openDialog(config) {
    setDialogState({
      ...config,
      draft: structuredClone(config.initialValue ?? {})
    });
  }

  function closeDialog() {
    setDialogState(null);
  }

  async function submitDialog() {
    if (!dialogState?.onSubmit) {
      return;
    }

    const missingRequiredField = dialogState.fields?.find((field) => field.required && !String(dialogState.draft?.[field.key] ?? "").trim());
    if (missingRequiredField) {
      showToast(`${missingRequiredField.label} må fylles ut.`, "error");
      return;
    }

    const result = await dialogState.onSubmit(dialogState.draft);
    if (result === false) {
      return;
    }
    closeDialog();
  }

  function updateDialogField(key, value) {
    setDialogState((previousDialog) => ({
      ...previousDialog,
      draft: {
        ...previousDialog.draft,
        [key]: value,
        ...(key === "serviceArea" ? { organization: "", department: "" } : {}),
        ...(key === "organization" ? { department: "" } : {})
      }
    }));
  }

  function navigateTo(href) {
    setIsSettingsWindowOpen(false);
    window.location.hash = href.startsWith("#") ? href : `#${href}`;
  }

  async function handleLogout() {
    if (!authSession?.authRequired) {
      showToast("Innlogging er ikke aktivert.", "info");
      return;
    }

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setAuthSession((previousSession) => ({
        ...(previousSession ?? { authRequired: false, providers: [] }),
        authenticated: false,
        user: null
      }));
      setBootstrap(null);
      setModel(null);
      setAppState(null);
      showToast("Du er logget ut.", "info");
    } catch {
      window.location.reload();
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <FluentProvider theme={fluentTheme}>
        <div className="loadingShell">
          <Spinner size="huge" label="Laster SystemKontroll..." />
        </div>
      </FluentProvider>
    );
  }

  if (authSession?.authRequired && !authSession.authenticated) {
    return (
      <FluentProvider theme={fluentTheme}>
        <LoginPage
          onAuthenticated={(user) => {
            setAuthSession((previousSession) => ({
              ...(previousSession ?? { authRequired: true, providers: [] }),
              authenticated: true,
              user
            }));
          }}
          providers={authSession.providers ?? []}
        />
      </FluentProvider>
    );
  }

  if (error || !bootstrap || !model || !appState || !currentScreen) {
    return (
      <FluentProvider theme={fluentTheme}>
        <div className="loadingShell">
          <Card className="errorCard">
            <Text weight="semibold" size={500}>
              Kunne ikke laste løsningen
            </Text>
            <Text>{error || "Ukjent feil."}</Text>
            <Button appearance="primary" onClick={() => window.location.reload()}>
              Last på nytt
            </Button>
          </Card>
        </div>
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={fluentTheme}>
      <Toaster toasterId={toasterId} position="bottom-end" />
      <div
        className="shell"
        data-appearance={resolvedAppearance}
        data-accent={themePreferences.accent}
        data-surface={themePreferences.surface}
      >
        <aside className="sidebar">
          <div className="brandBlock">
            <Avatar name="SystemKontroll" color="brand" size={32} />
            <div>
              <Text weight="semibold">SystemKontroll</Text>
              <div>
                <Text size={200}>IT COMPLIANCE</Text>
              </div>
            </div>
          </div>

          <div className="sidebarGroups">
            <div className="sidebarSection">
              <Text size={200} weight="medium" className="sectionLabel">
                {sidebarSectionLabel(currentScreen.topSection)}
              </Text>
              <div className="navStack">
                {activeSidebarItems.map((item) => {
                  const isActive = currentScreen.navKey === item.key;
                  const Icon = sidebarIcons[item.icon] ?? BuildingRegular;
                  return (
                    <Button
                      key={item.key}
                      appearance="subtle"
                      size="large"
                      icon={<Icon />}
                      className={`navButton ${isActive ? "isActive" : ""}`}
                      onClick={() => navigateTo(item.href)}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="sidebarBottom">
            {NAV_BOTTOM_ITEMS.map((item) => {
              const Icon = bottomNavIcons[item.key] ?? SettingsRegular;
              const isActive = currentScreen.navKey === item.key || (item.key === "settings" && isSettingsWindowOpen);
              return (
                <Button
                  key={item.key}
                  appearance="subtle"
                  size="large"
                  icon={<Icon />}
                  className={`navButton ${isActive ? "isActive" : ""}`}
                  onClick={() => {
                    if (item.key === "settings") {
                      refreshAuthSession()
                        .catch((sessionError) => {
                          showToast(sessionError.message ?? "Klarte ikke å oppdatere innlogging.", "error");
                        })
                        .finally(() => setIsSettingsWindowOpen(true));
                    } else if (item.key === "logout") {
                      handleLogout();
                    } else {
                      showToast(`${item.label} er ikke implementert ennå.`, "info");
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        </aside>

        <div className="contentShell">
          <header className="topbar">
            <TabList className="topNav" selectedValue={currentScreen.topSection} onTabSelect={(_event, data) => {
              const selectedLink = bootstrap.topBarLinks.find((link) => link.key === data.value);
              if (selectedLink) {
                navigateTo(selectedLink.href);
              }
            }}>
              {bootstrap.topBarLinks.map((link) => {
                return (
                  <Tab key={link.key} value={routeSectionFromHref(bootstrap.screenRegistry, link.href)}>
                    {link.label}
                  </Tab>
                );
              })}
            </TabList>
            <div className="topbarActions">
              <div className="userProfile">
                <Avatar name={currentUser.name} color="brand" size={32} />
                <div className="userProfileText">
                  <Text weight="medium">{currentUser.name}</Text>
                  <Text size={200}>{currentUser.role}</Text>
                </div>
              </div>
            </div>
          </header>

          <main className="main">
            <div className="mainInner">
              <PageRenderer
                appState={appState}
                authSession={authSession}
                bootstrap={bootstrap}
                closeDialog={closeDialog}
                currentRecord={currentRecord}
                currentScreen={currentScreen}
                currentStructure={currentStructure}
                dialogState={isSettingsWindowOpen ? null : dialogState}
                hashInfo={routeInfo}
                isDirty={isDirty}
                isSaving={isSaving}
                navigateTo={navigateTo}
                openDialog={openDialog}
                onAction={handlePageAction}
                searchState={searchState}
                selectedOrgNode={selectedOrgNode}
                selectedOrgNodeId={selectedOrgNodeId}
                setFilters={setListFilters}
                setSearchState={setSearchState}
                setSelectedOrgNodeId={setSelectedOrgNodeId}
                showToast={showToast}
                submitDialog={submitDialog}
                updateDialogField={updateDialogField}
                updateDraft={updateDraft}
                filters={listFilters}
              />
            </div>
          </main>
        </div>
        {isSettingsWindowOpen && settingsScreen ? (
          <div className="settingsWindowOverlay" role="presentation" onMouseDown={() => setIsSettingsWindowOpen(false)}>
            <section
              aria-label="Innstillinger"
              aria-modal="true"
              className="settingsWindow"
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="settingsWindowChrome">
                <Text weight="semibold">Innstillinger</Text>
                <Button appearance="primary" onClick={() => setIsSettingsWindowOpen(false)}>
                  Lukk
                </Button>
              </div>
              <div className="settingsWindowBody">
                <PageRenderer
                  appState={appState}
                  authSession={authSession}
                  bootstrap={bootstrap}
                  closeDialog={closeDialog}
                  currentRecord={null}
                  currentScreen={settingsScreen}
                  currentStructure={model?.structures?.[settingsScreen.entityKey] ?? null}
                  dialogState={dialogState}
                  hashInfo={{ routePath: "#/settings", query: {} }}
                  isDirty={isDirty}
                  isSaving={isSaving}
                  navigateTo={navigateTo}
                  openDialog={openDialog}
                  onAction={handlePageAction}
                  searchState={searchState}
                  selectedOrgNode={selectedOrgNode}
                  selectedOrgNodeId={selectedOrgNodeId}
                  setFilters={setListFilters}
                  setSearchState={setSearchState}
                  setSelectedOrgNodeId={setSelectedOrgNodeId}
                  showToast={showToast}
                  submitDialog={submitDialog}
                  updateDialogField={updateDialogField}
                  updateDraft={updateDraft}
                  filters={listFilters}
                />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </FluentProvider>
  );
}

function LoginPage({ onAuthenticated, providers }) {
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash || "#/applications"}`;
  const localProvider = providers.find((provider) => provider.type === "local");
  const externalProviders = providers.filter((provider) => provider.type !== "local");
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function submitLocalLogin(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });

      if (!response.ok) {
        throw new Error("Feil brukernavn eller passord.");
      }

      const payload = await response.json();
      onAuthenticated?.(payload.user);

      const targetUrl = new URL(returnTo, window.location.origin);
      if (targetUrl.href !== window.location.href) {
        window.location.href = targetUrl.href;
      }
    } catch (loginError) {
      setError(loginError.message ?? "Innlogging feilet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="loginShell">
      <Card className="loginPanel">
        <Avatar name="SystemKontroll" color="brand" size={48} />
        <div className="loginHeader">
          <Text as="h1" weight="semibold" size={700}>
            SystemKontroll
          </Text>
          <Text size={300}>
            Logg inn med SystemKontroll-konto eller organisasjonens identitetsleverandør.
          </Text>
        </div>
        {localProvider ? (
          <form className="loginForm" onSubmit={submitLocalLogin}>
            <label className="loginField">
              <span>Brukernavn eller e-post</span>
              <input
                autoComplete="username"
                name="username"
                onChange={(event) => setIdentifier(event.target.value)}
                type="text"
                value={identifier}
              />
            </label>
            <label className="loginField">
              <span>Passord</span>
              <input
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>
            {error ? (
              <Text className="loginError" size={200}>
                {error}
              </Text>
            ) : null}
            <Button appearance="primary" disabled={isSubmitting} size="large" type="submit">
              Logg inn
            </Button>
          </form>
        ) : null}
        <div className="loginProviderStack">
          {externalProviders.length ? (
            externalProviders.map((provider) => (
              <Button
                key={provider.key}
                appearance="primary"
                size="large"
                onClick={() => {
                  window.location.href = `/api/auth/login/${provider.key}?returnTo=${encodeURIComponent(returnTo)}`;
                }}
              >
                Logg inn med {provider.label}
              </Button>
            ))
          ) : !localProvider ? (
            <Text>
              Ingen innloggingsmetoder er konfigurert.
            </Text>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
