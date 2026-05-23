import {
  applicationInventoryItems,
  controllerProtocolInventoryItems,
  datasetInventoryItems,
  mockRecords,
  organizationStructureData,
  processorProtocolInventoryItems,
  resolveHostingMeta,
  resolvePrivacyMeta,
  settingsCatalogs,
  screenRegistry,
  sidebarNavigation,
  topBarLinks
} from "./screen-specs.js";

const appRoot = document.getElementById("app");
const appState = {
  activeTabs: {},
  applicationItems: structuredClone(applicationInventoryItems),
  controllerProtocolItems: structuredClone(controllerProtocolInventoryItems),
  datasetItems: structuredClone(datasetInventoryItems),
  processorProtocolItems: structuredClone(processorProtocolInventoryItems),
  organizationStructure: structuredClone(organizationStructureData),
  organizationSelection: {
    activeLevel: "serviceArea",
    serviceAreaIndex: 0,
    organizationIndex: -1,
    departmentIndex: -1
  },
  records: structuredClone(mockRecords),
  settings: structuredClone(settingsCatalogs),
  modal: null,
  notice: "",
  datasetFilters: {
    search: "",
    hosting: "all",
    privacy: "all"
  },
  applicationFilters: {
    search: ""
  },
  controllerProtocolFilters: {
    search: ""
  },
  processorProtocolFilters: {
    search: ""
  }
};

let model;
let noticeTimeoutId = null;
let persistInFlight = Promise.resolve();
const SETTINGS_COLLECTION_CONFIG = {
  common_components: {
    settingsKey: "commonComponentsCatalog",
    singularLabel: "felleskomponent",
    sectionTitle: "Felleskomponenter",
    description: "Nasjonale og kommunale felleskomponenter som kan velges i applikasjonsarkitektur."
  },
  standards: {
    settingsKey: "standardsCatalog",
    singularLabel: "standard",
    sectionTitle: "Standarder",
    description: "Standarder som kan velges i applikasjonsarkitektur."
  }
};

initialize();

async function initialize() {
  try {
    const response = await fetch("./generated/systemkontroll-model.json");
    if (!response.ok) {
      throw new Error("Kunne ikke laste generert modellfil.");
    }

    model = await response.json();
    const stateLoaded = await loadPersistedAppData();
    if (!stateLoaded) {
      await loadOrganizationStructureData();
    }
    window.addEventListener("hashchange", renderApp);
    document.addEventListener("click", handleClick);
    document.addEventListener("input", handleInput);

    if (!location.hash) {
      location.hash = "#/applications";
      return;
    }

    renderApp();
  } catch (error) {
    appRoot.innerHTML = `
      <div class="error-state">
        <span class="material-symbols-outlined">error</span>
        <p>${escapeHtml(error.message)}</p>
        <p>Kjør <code>npm run build:data</code> og last siden på nytt.</p>
      </div>
    `;
  }
}

async function loadPersistedAppData() {
  try {
    const response = await fetch("./api/state");
    if (!response.ok) {
      return false;
    }

    const payload = await response.json();
    applyPersistedAppData(payload);
    return true;
  } catch (error) {
    console.warn("Kunne ikke laste state fra API, bruker lokal fallback.", error);
    return false;
  }
}

async function loadOrganizationStructureData() {
  try {
    const response = await fetch("./organization-structure.json");
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    if (Array.isArray(payload) && payload.length) {
      appState.organizationStructure = payload;
      normalizeOrganizationSelection(payload);
    }
  } catch (error) {
    console.warn("Kunne ikke laste organization-structure.json, bruker innebygd fallback.", error);
  }
}

function applyPersistedAppData(payload) {
  if (!payload || typeof payload !== "object") {
    return;
  }

  if (Array.isArray(payload.applicationItems)) {
    appState.applicationItems = payload.applicationItems;
  }
  if (Array.isArray(payload.controllerProtocolItems)) {
    appState.controllerProtocolItems = payload.controllerProtocolItems;
  }
  if (Array.isArray(payload.datasetItems)) {
    appState.datasetItems = payload.datasetItems;
  }
  if (Array.isArray(payload.processorProtocolItems)) {
    appState.processorProtocolItems = payload.processorProtocolItems;
  }
  if (Array.isArray(payload.organizationStructure)) {
    appState.organizationStructure = payload.organizationStructure;
    normalizeOrganizationSelection(payload.organizationStructure);
  }
  if (payload.records && typeof payload.records === "object") {
    appState.records = payload.records;
  }
  if (payload.settings && typeof payload.settings === "object") {
    appState.settings = payload.settings;
  }
}

function buildPersistedAppDataSnapshot() {
  return {
    applicationItems: appState.applicationItems,
    controllerProtocolItems: appState.controllerProtocolItems,
    datasetItems: appState.datasetItems,
    processorProtocolItems: appState.processorProtocolItems,
    organizationStructure: appState.organizationStructure,
    records: appState.records,
    settings: appState.settings
  };
}

async function persistAppData() {
  const snapshot = buildPersistedAppDataSnapshot();
  persistInFlight = persistInFlight
    .catch(() => undefined)
    .then(async () => {
      try {
        const response = await fetch("./api/state", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(snapshot)
        });

        if (!response.ok) {
          throw new Error("Lagring til database feilet.");
        }

        const payload = await response.json();
        applyPersistedAppData(payload);
        return true;
      } catch (error) {
        console.error("Kunne ikke lagre state til API.", error);
        setNotice("Kunne ikke lagre til databasen. Endringen ligger fortsatt lokalt i nettleseren.");
        return false;
      }
    });

  return persistInFlight;
}

function renderApp() {
  const resolved = resolveRoute(location.hash || "#/applications");
  const screen = resolved.screen;

  if (!screen) {
    appRoot.innerHTML = renderNotFound();
    return;
  }

  const structure = model.structures[screen.entityKey] ?? null;
  const screenHtml = renderScreen(screen, structure, resolved.query);
  appRoot.innerHTML = renderShell(screen, screenHtml);
  document.title = `${resolveDocumentTitle(screen, resolved.query)} | SystemKontroll`;
  syncOrganizationStructureTree(screen);
}

function renderAppPreservingField(field, selector) {
  const selectionStart = typeof field?.selectionStart === "number" ? field.selectionStart : null;
  const selectionEnd = typeof field?.selectionEnd === "number" ? field.selectionEnd : null;
  renderApp();

  if (!selector) {
    return;
  }

  const nextField = appRoot.querySelector(selector);
  if (!nextField) {
    return;
  }

  nextField.focus({ preventScroll: true });
  if (selectionStart != null && selectionEnd != null && typeof nextField.setSelectionRange === "function") {
    nextField.setSelectionRange(selectionStart, selectionEnd);
  }
}

function resolveRoute(hash) {
  const [path, queryString = ""] = hash.split("?");
  const screen =
    screenRegistry.find((candidate) => candidate.route === path || candidate.aliases?.includes(path)) ?? null;
  const query = new URLSearchParams(queryString);
  return { screen, path, query };
}

function renderScreen(screen, structure, query) {
  if (screen.pageFamily === "InventoryListPage") {
    if (screen.entityKey === "application") {
      return renderApplicationInventoryPage(screen);
    }
    if (screen.entityKey === "controller_protocol") {
      return renderControllerProtocolInventoryPage(screen);
    }
    if (screen.entityKey === "processor_protocol") {
      return renderProcessorProtocolInventoryPage(screen);
    }
    return renderInventoryPage(screen);
  }
  if (screen.pageFamily === "EntityDetailPage") {
    return renderEntityDetailPage(screen, structure, query);
  }
  if (screen.pageFamily === "AdminSectionsPage") {
    return renderAdminSectionsPage(screen, structure);
  }
  if (screen.pageFamily === "SettingsPage") {
    return renderSettingsPage(screen);
  }
  if (screen.pageFamily === "OrganizationStructurePage") {
    return renderOrganizationStructurePage(screen);
  }
  if (screen.pageFamily === "PlaceholderPage") {
    return renderPlaceholderPage(screen);
  }
  return renderNotFound();
}

function renderShell(screen, content) {
  const activeTopSection = screen.topSection ?? "systems";
  const sidebarItems = sidebarNavigation[activeTopSection] ?? [];
  const searchPlaceholder =
    screen.pageFamily === "InventoryListPage" ? "Søk i SystemKontroll..." : "Søk etter felt, tab eller innhold...";

  return `
    <header class="topbar">
      <div class="brand-row">
        <div class="brand-mark">
          <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">security</span>
        </div>
        <div class="brand-copy">
          <h1>SystemKontroll</h1>
          <p>IT Compliance</p>
        </div>
        <nav class="topbar-links">
          ${topBarLinks
            .map(
              (link) => `
                <a class="topbar-link ${activeTopSection === link.key ? "is-active" : ""}" href="${link.href}">
                  ${escapeHtml(link.label)}
                </a>
              `
            )
            .join("")}
        </nav>
      </div>
      <div class="topbar-tools">
        <div class="search-shell">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="${escapeHtml(searchPlaceholder)}" aria-label="Globalt søk" />
        </div>
        <button class="icon-button" type="button" aria-label="Varsler">
          <span class="material-symbols-outlined">notifications</span>
        </button>
        <a class="icon-button" href="#/settings" aria-label="Innstillinger">
          <span class="material-symbols-outlined">settings</span>
        </a>
        <div class="avatar" aria-hidden="true">SK</div>
      </div>
    </header>
    <aside class="sidebar">
      <div class="sidebar-main">
        <div class="sidebar-section-title">Navigasjon</div>
        <nav class="nav-list">
          ${sidebarItems
            .map(
              (item) => `
                <a class="nav-link ${screen.navKey === item.key ? "is-active" : ""}" href="${item.href}">
                  <span class="material-symbols-outlined">${item.icon}</span>
                  <span>${escapeHtml(item.label)}</span>
                </a>
              `
            )
            .join("")}
        </nav>
      </div>
      <div class="sidebar-bottom">
        <div class="sidebar-section-title">Snarveier</div>
        <nav class="nav-list">
        <a class="nav-link ${screen.navKey === "settings" ? "is-active" : ""}" href="#/settings">
          <span class="material-symbols-outlined">settings</span>
          <span>Innstillinger</span>
        </a>
        <a class="nav-link" href="#/datasets">
          <span class="material-symbols-outlined">help_outline</span>
          <span>Hjelp</span>
        </a>
        <a class="nav-link" href="#/applications">
          <span class="material-symbols-outlined">logout</span>
          <span>Logg ut</span>
        </a>
        </nav>
      </div>
    </aside>
    <main class="main">
      <div class="main-inner">
        ${content}
      </div>
    </main>
    ${renderNoticeToast()}
    ${renderModal()}
  `;
}

function renderNoticeToast() {
  if (!appState.notice) {
    return "";
  }

  return `
    <div class="notice-toast" role="status" aria-live="polite" aria-atomic="true">
      <span class="material-symbols-outlined">check_circle</span>
      <p>${escapeHtml(appState.notice)}</p>
    </div>
  `;
}

function renderModal() {
  if (!appState.modal) {
    return "";
  }

  const { title, description, fields, values, submitLabel } = appState.modal;

  return `
    <div class="modal-backdrop" data-action="close-modal" aria-hidden="true"></div>
    <section class="modal-shell" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-card">
        <header class="modal-card__header">
          <div>
            <h2 class="modal-card__title" id="modal-title">${escapeHtml(title)}</h2>
            ${description ? `<p class="modal-card__meta">${escapeHtml(description)}</p>` : ""}
          </div>
          <button class="icon-button" type="button" data-action="close-modal" aria-label="Lukk dialog">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>
        <div class="modal-form">
          ${fields.map((field) => renderModalField(field, values?.[field.key])).join("")}
        </div>
        <footer class="modal-card__footer">
          <button class="ghost-button" type="button" data-action="close-modal">Avbryt</button>
          <button class="action-button" type="button" data-action="submit-modal">
            <span class="material-symbols-outlined">check</span>
            ${escapeHtml(submitLabel ?? "Lagre")}
          </button>
        </footer>
      </div>
    </section>
  `;
}

function renderFieldLabelContent(label, required, helpText) {
  return `
    <span class="field-label-row">
      <span>${escapeHtml(label)}${required ? ' <span class="required-marker">*</span>' : ""}</span>
      ${renderHelpAffordance(helpText)}
    </span>
  `;
}

function renderHelpAffordance(helpText) {
  if (!helpText) {
    return "";
  }

  return `
    <span class="help-affordance" tabindex="0" aria-label="Vis hjelpetekst">
      <span class="help-affordance__dot">?</span>
      <span class="help-affordance__tooltip">${escapeHtml(helpText)}</span>
    </span>
  `;
}

function renderModalField(field, value) {
  if (field.type === "select") {
    return `
      <div class="field ${field.fullWidth ? "field--full" : ""}">
        <label>${renderFieldLabelContent(field.label, false, field.helpText)}</label>
        <select data-modal-field="${escapeHtml(field.key)}">
          ${(field.options ?? [])
            .map(
              (option) =>
                `<option value="${escapeHtml(option.value)}" ${String(option.value) === String(value ?? "") ? "selected" : ""}>${escapeHtml(option.label)}</option>`
            )
            .join("")}
        </select>
      </div>
    `;
  }

  if (field.type === "textarea") {
    return `
      <div class="field field--full">
        <label>${renderFieldLabelContent(field.label, false, field.helpText)}</label>
        <textarea data-modal-field="${escapeHtml(field.key)}" rows="${escapeHtml(String(field.rows ?? 5))}" placeholder="${escapeHtml(field.placeholder ?? "")}">${escapeHtml(value ?? "")}</textarea>
      </div>
    `;
  }

  return `
    <div class="field ${field.fullWidth ? "field--full" : ""}">
      <label>${renderFieldLabelContent(field.label, false, field.helpText)}</label>
      <input type="${escapeHtml(field.type ?? "text")}" data-modal-field="${escapeHtml(field.key)}" value="${escapeHtml(value ?? "")}" placeholder="${escapeHtml(field.placeholder ?? "")}" />
    </div>
  `;
}

function renderInventoryPage(screen) {
  const filters = appState.datasetFilters;
  const filtered = appState.datasetItems.filter((item) => {
    const search = filters.search.trim().toLowerCase();
    const privacyMeta = resolvePrivacyMeta(item);
    const hostingGroup = ["Cloud", "PrivateCloud", "CloudAndLocal"].includes(item.hostingType) ? "cloud" : "local";
    const matchesSearch =
      !search ||
      [item.name, item.purpose, item.description, item.id].some((value) => value.toLowerCase().includes(search));
    const matchesHosting = filters.hosting === "all" || filters.hosting === hostingGroup;
    const matchesPrivacy =
      filters.privacy === "all" ||
      (filters.privacy === "sensitive" && privacyMeta.label === "Sensitive") ||
      (filters.privacy === "personal" && privacyMeta.label === "Personopplysninger") ||
      (filters.privacy === "public" && privacyMeta.label === "Ikke sensitivt");
    return matchesSearch && matchesHosting && matchesPrivacy;
  });

  const sensitiveCount = appState.datasetItems.filter((item) => item.hasSensitivePersonalData).length;
  const cloudCount = appState.datasetItems.filter((item) => ["Cloud", "PrivateCloud", "CloudAndLocal"].includes(item.hostingType)).length;
  const totalDatasets = Math.max(appState.datasetItems.length, 1);
  const sensitivePercent = Math.round((sensitiveCount / totalDatasets) * 100);
  const cloudPercent = Math.round((cloudCount / totalDatasets) * 100);

  return `
    ${renderPageHeader({
      breadcrumbs: ["Systemer", "Datasett"],
      title: screen.title,
      description: screen.description,
      actions: screen.actions,
      actionContext: { screenId: screen.id, recordKey: screen.recordKey ?? screen.entityKey }
    })}
    ${renderMetricCards([
      { label: "Totalt", value: appState.datasetItems.length, tone: "neutral" },
      { label: "Sensitive", value: sensitiveCount, tone: "error" },
      { label: "Skybasert", value: `${cloudPercent}%`, tone: "primary" }
    ])}
    <section class="inventory-toolbar">
      <div class="inventory-search">
        <span class="material-symbols-outlined">search</span>
        <input
          type="text"
          data-filter-input="dataset-search"
          value="${escapeHtml(filters.search)}"
          placeholder="${escapeHtml(screen.searchPlaceholder)}"
        />
      </div>
      <div class="filter-strip">
        ${screen.filterDefinitions.map((definition) => renderFilterGroup(definition, filters[definition.key])).join("")}
      </div>
    </section>
    <section class="inventory-table-shell">
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              ${screen.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${
              filtered.length
                ? filtered.map((item) => renderInventoryRow(item)).join("")
                : `
                  <tr>
                    <td colspan="6">
                      <div class="empty-state">Ingen datasett matcher filtreringen.</div>
                    </td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <div>Viser ${filtered.length} av ${appState.datasetItems.length} datasett</div>
        <div class="pagination__controls">
          <span class="meta-badge"><span class="material-symbols-outlined">table_rows</span> 10 rader per side</span>
        </div>
      </div>
    </section>
    <section class="inventory-summary">
      <article class="inventory-hero">
        <span class="tag tag--primary">Compliance</span>
        <h3>Rapportering på tvers av datasett</h3>
        <p>Generer komplette personvern- og etterlevelsesrapporter basert på registrerte datasett, relasjoner og behandlingsaktiviteter.</p>
        <div style="margin-top:1rem">
          <a class="soft-button" href="#/controller-protocol/ny-behandling-02-06-2023">
            <span class="material-symbols-outlined">arrow_forward</span>
            Start rapportering
          </a>
        </div>
      </article>
      <aside class="stat-panel">
        <span class="tag tag--success">Fordeling</span>
        <div class="stat-line">
          <div class="stat-line__row">
            <span>Sensitive datasett</span>
            <span>${sensitivePercent}%</span>
          </div>
          <div class="stat-line__track">
            <div class="stat-line__fill stat-line__fill--error" style="width:${sensitivePercent}%"></div>
          </div>
        </div>
        <div class="stat-line">
          <div class="stat-line__row">
            <span>Skybasert</span>
            <span>${cloudPercent}%</span>
          </div>
          <div class="stat-line__track">
            <div class="stat-line__fill" style="width:${cloudPercent}%"></div>
          </div>
        </div>
        <p style="margin-top:1rem">Siste skanning ble utført 25.03.2026 kl. 04:00. Ingen kritiske avvik funnet.</p>
      </aside>
    </section>
  `;
}

function renderPlaceholderPage(screen) {
  return `
    ${renderPageHeader({
      breadcrumbs: [topBarLinks.find((link) => link.key === screen.topSection)?.label ?? "SystemKontroll", screen.title],
      title: screen.title,
      description: screen.description,
      actions: screen.actions ?? [],
      actionContext: { screenId: screen.id, recordKey: screen.recordKey ?? screen.entityKey }
    })}
    <section class="content-grid">
      <article class="section-card section-card--span-8">
        <div class="section-card__header">
          <div class="section-card__title-row">
            <span class="material-symbols-outlined">overview</span>
            <div>
              <h2>${escapeHtml(screen.title)}</h2>
              <p class="muted">Denne delen er lagt inn i navigasjonen og klar for videre modellering.</p>
            </div>
          </div>
        </div>
        <div class="empty-state">
          <p>${escapeHtml(screen.description)}</p>
          <p>Her kan vi legge inn registervisning, detaljsider og handlinger med samme Fluent-oppsett som resten av løsningen.</p>
        </div>
      </article>
      <aside class="stat-panel section-card--span-4">
        <span class="tag tag--primary">Neste steg</span>
        <h3>Utvid denne modulen</h3>
        <p>Vi kan koble denne siden til YAML-strukturen eller bygge en egen inventarliste med opprett, rediger og slett på samme måte som de andre modulene.</p>
      </aside>
    </section>
  `;
}

function renderOrganizationStructurePage(screen) {
  const structureData = getOrganizationStructureData();
  const {
    activeLevel,
    serviceAreaIndex,
    organizationIndex,
    departmentIndex,
    selectedServiceArea,
    organizations,
    selectedOrganization,
    departments,
    selectedDepartment,
    activeTitle,
    activeDescription,
    visibleChildren,
    pathLabels
  } = getOrganizationStructureContext(structureData);
  const serviceAreaCount = structureData.length;
  const organizationCount = structureData.reduce((sum, area) => sum + area.organizations.length, 0);
  const departmentCount = structureData.reduce(
    (sum, area) =>
      sum + area.organizations.reduce((organizationSum, organization) => organizationSum + organization.departments.length, 0),
    0
  );

  return `
    ${renderPageHeader({
      breadcrumbs: ["Organisasjon", screen.title],
      title: screen.title,
      description: screen.description,
      actions: screen.actions ?? [],
      actionContext: { screenId: screen.id, recordKey: screen.recordKey ?? screen.entityKey }
    })}
    ${renderMetricCards([
      { label: "Tjenesteområder", value: serviceAreaCount, tone: "primary" },
      { label: "Virksomheter", value: organizationCount, tone: "neutral" },
      { label: "Avdelinger", value: departmentCount, tone: "success" }
    ])}
    <section class="content-grid">
      <article class="section-card section-card--span-12">
        <div class="section-card__header">
          <div class="section-card__title-row">
            <span class="material-symbols-outlined">account_tree</span>
            <div>
              <h2>Strukturforvalter</h2>
              <p class="muted">Bruk treet til venstre for å navigere i strukturen, og arbeidsflaten til høyre for å opprette og vedlikeholde valgte noder.</p>
            </div>
          </div>
          <span class="tag tag--primary">JSON-kilde</span>
        </div>
        <div class="org-tree-layout">
          <section class="org-tree-surface">
            <div class="org-tree-surface__header">
              <div>
                <div class="org-node__eyebrow">Hierarki</div>
                <h3>Organisasjonsstruktur</h3>
                <p class="muted">Et samlet navigasjonstre gir bedre oversikt enn separate lister og er et bedre utgangspunkt for senere redigering av strukturen.</p>
              </div>
              <div class="org-tree-surface__meta">
                <span class="meta-badge">${serviceAreaCount} tjenesteområder</span>
              </div>
            </div>
            <div class="org-tree-host" data-organization-tree-root>
              <div class="loading-state loading-state--inline">
                <span class="material-symbols-outlined">account_tree</span>
                <p>Laster struktur...</p>
              </div>
            </div>
          </section>
          <aside class="org-inspector">
            <div class="org-node__eyebrow">Valgt node</div>
            <h3>${escapeHtml(activeTitle)}</h3>
            <p class="muted">${escapeHtml(activeDescription)}</p>
            <div class="structure-context__path">
              ${pathLabels
                .map(
                  (label, index) => `
                    <span class="meta-badge">${escapeHtml(label)}</span>
                    ${index < pathLabels.length - 1 ? `<span class="material-symbols-outlined">chevron_right</span>` : ""}
                  `
                )
                .join("")}
            </div>
            <div class="org-inspector__actions">
              <button
                class="soft-button"
                type="button"
                data-action="open-organization-structure-modal"
                data-structure-mode="create"
                data-structure-level="serviceArea"
              >
                <span class="material-symbols-outlined">add</span>
                Nytt tjenesteområde
              </button>
              ${
                activeLevel === "serviceArea" && selectedServiceArea
                  ? `
                    <button
                      class="soft-button"
                      type="button"
                      data-action="open-organization-structure-modal"
                      data-structure-mode="create"
                      data-structure-level="organization"
                      data-service-area-index="${serviceAreaIndex}"
                    >
                      <span class="material-symbols-outlined">add</span>
                      Ny virksomhet
                    </button>
                  `
                  : ""
              }
              ${
                activeLevel === "organization" && selectedOrganization
                  ? `
                    <button
                      class="soft-button"
                      type="button"
                      data-action="open-organization-structure-modal"
                      data-structure-mode="create"
                      data-structure-level="department"
                      data-service-area-index="${serviceAreaIndex}"
                      data-organization-index="${organizationIndex}"
                    >
                      <span class="material-symbols-outlined">add</span>
                      Ny avdeling
                    </button>
                  `
                  : ""
              }
              ${
                selectedServiceArea
                  ? `
                    <button
                      class="soft-button"
                      type="button"
                      data-action="open-organization-structure-modal"
                      data-structure-mode="edit"
                      data-structure-level="${escapeHtml(activeLevel)}"
                      data-service-area-index="${serviceAreaIndex}"
                      ${organizationIndex >= 0 ? `data-organization-index="${organizationIndex}"` : ""}
                      ${departmentIndex >= 0 ? `data-department-index="${departmentIndex}"` : ""}
                    >
                      <span class="material-symbols-outlined">edit</span>
                      Rediger valgt
                    </button>
                    <button
                      class="soft-button"
                      type="button"
                      data-action="delete-organization-structure-item"
                      data-structure-level="${escapeHtml(activeLevel)}"
                      data-service-area-index="${serviceAreaIndex}"
                      ${organizationIndex >= 0 ? `data-organization-index="${organizationIndex}"` : ""}
                      ${departmentIndex >= 0 ? `data-department-index="${departmentIndex}"` : ""}
                    >
                      <span class="material-symbols-outlined">delete</span>
                      Slett valgt
                    </button>
                  `
                  : ""
              }
            </div>
            <div class="org-inspector__section">
              <div class="org-node__eyebrow">Innhold</div>
              <div class="org-inspector__children">
                ${
                  visibleChildren.length
                    ? visibleChildren
                        .map(
                          (child) => `
                            <div class="org-inspector__child">
                              <strong>${escapeHtml(child.label)}</strong>
                              <span>${escapeHtml(child.meta)}</span>
                            </div>
                          `
                        )
                        .join("")
                    : `<div class="empty-state">Valgt node har ingen undernivåer.</div>`
                }
              </div>
            </div>
          </aside>
        </div>
        <footer class="footer-meta">
          <span class="footer-meta__item">
            <span class="material-symbols-outlined">data_object</span>
            Kilde: <strong>organization-structure.json</strong>
          </span>
          <span class="footer-meta__item">
            Endringer i UI-et er foreløpig prototypeendringer og lagres ikke tilbake til filen automatisk.
          </span>
        </footer>
      </article>
    </section>
  `;
}

function resolveStructureLevelLabel(level) {
  const map = {
    serviceArea: "Nivå 1",
    organization: "Nivå 2",
    department: "Nivå 3"
  };
  return map[level] ?? "Nivå";
}

function getOrganizationStructureData() {
  const structureData =
    Array.isArray(appState.organizationStructure) && appState.organizationStructure.length
      ? appState.organizationStructure
      : organizationStructureData;
  normalizeOrganizationSelection(structureData);
  return structureData;
}

function normalizeOrganizationSelection(structureData) {
  if (!Array.isArray(structureData) || !structureData.length) {
    appState.organizationSelection = {
      activeLevel: "serviceArea",
      serviceAreaIndex: -1,
      organizationIndex: -1,
      departmentIndex: -1
    };
    return;
  }

  let serviceAreaIndex = appState.organizationSelection?.serviceAreaIndex ?? 0;
  let activeLevel = appState.organizationSelection?.activeLevel ?? "serviceArea";
  if (serviceAreaIndex < 0 || serviceAreaIndex >= structureData.length) {
    serviceAreaIndex = 0;
  }

  const organizations = structureData[serviceAreaIndex]?.organizations ?? [];
  let organizationIndex = appState.organizationSelection?.organizationIndex ?? -1;
  if (activeLevel === "organization" || activeLevel === "department") {
    if (!organizations.length) {
      organizationIndex = -1;
      activeLevel = "serviceArea";
    } else if (organizationIndex < 0 || organizationIndex >= organizations.length) {
      organizationIndex = 0;
    }
  } else {
    organizationIndex = -1;
  }

  const departments = organizations[organizationIndex]?.departments ?? [];
  let departmentIndex = appState.organizationSelection?.departmentIndex ?? -1;
  if (activeLevel === "department") {
    if (!departments.length) {
      departmentIndex = -1;
      activeLevel = organizationIndex >= 0 ? "organization" : "serviceArea";
    } else if (departmentIndex < 0 || departmentIndex >= departments.length) {
      departmentIndex = 0;
    }
  } else {
    departmentIndex = -1;
  }

  appState.organizationSelection = {
    activeLevel,
    serviceAreaIndex,
    organizationIndex,
    departmentIndex
  };
}

function getOrganizationStructureContext(structureData = getOrganizationStructureData()) {
  const selection = appState.organizationSelection;
  const selectedServiceArea = structureData[selection.serviceAreaIndex] ?? null;
  const organizations = selectedServiceArea?.organizations ?? [];
  const selectedOrganization =
    selection.organizationIndex >= 0 && selection.organizationIndex < organizations.length
      ? organizations[selection.organizationIndex]
      : null;
  const departments = selectedOrganization?.departments ?? [];
  const selectedDepartment =
    selection.departmentIndex >= 0 && selection.departmentIndex < departments.length
      ? departments[selection.departmentIndex]
      : null;

  const pathLabels = [];
  if (selectedServiceArea) {
    pathLabels.push(selectedServiceArea.serviceArea);
  }
  if (selectedOrganization) {
    pathLabels.push(selectedOrganization.name);
  }
  if (selectedDepartment) {
    pathLabels.push(selectedDepartment);
  }

  let activeTitle = "Ingen valgt node";
  let activeDescription = "Velg et tjenesteområde, en virksomhet eller en avdeling i treet for å se og redigere detaljer.";
  let visibleChildren = [];

  if (selection.activeLevel === "serviceArea" && selectedServiceArea) {
    activeTitle = selectedServiceArea.serviceArea;
    activeDescription = "Tjenesteområde. Her kan du opprette og vedlikeholde virksomheter under valgt område.";
    visibleChildren = organizations.map((organization) => ({
      label: organization.name,
      meta: `${organization.departments.length} avdelinger`
    }));
  }

  if (selection.activeLevel === "organization" && selectedOrganization) {
    activeTitle = selectedOrganization.name;
    activeDescription = "Virksomhet. Her kan du opprette og vedlikeholde avdelinger under valgt virksomhet.";
    visibleChildren = departments.map((department) => ({
      label: department,
      meta: "Avdeling"
    }));
  }

  if (selection.activeLevel === "department" && selectedDepartment) {
    activeTitle = selectedDepartment;
    activeDescription = "Avdeling. Denne noden ligger på laveste nivå i strukturen og kan redigeres eller fjernes.";
    visibleChildren = [];
  }

  return {
    ...selection,
    selectedServiceArea,
    organizations,
    selectedOrganization,
    departments,
    selectedDepartment,
    activeTitle,
    activeDescription,
    visibleChildren,
    pathLabels
  };
}

function syncOrganizationStructureTree(screen) {
  if (screen.pageFamily !== "OrganizationStructurePage") {
    return;
  }

  const mountNode = appRoot.querySelector("[data-organization-tree-root]");
  if (!mountNode) {
    return;
  }

  mountNode.innerHTML = renderOrganizationStructureNavigationTree(getOrganizationStructureData(), appState.organizationSelection);
}

function openOrganizationStructureModal({ mode, level, serviceAreaIndex, organizationIndex, departmentIndex }) {
  const structureData = getOrganizationStructureData();
  const selectedServiceArea = structureData[serviceAreaIndex] ?? null;
  const selectedOrganization = selectedServiceArea?.organizations?.[organizationIndex] ?? null;
  const existingValue =
    level === "serviceArea"
      ? selectedServiceArea?.serviceArea ?? ""
      : level === "organization"
        ? selectedOrganization?.name ?? ""
        : selectedOrganization?.departments?.[departmentIndex] ?? "";

  const labelMap = {
    serviceArea: "tjenesteområde",
    organization: "virksomhet",
    department: "avdeling"
  };
  const titlePrefixMap = {
    serviceArea: "Nytt",
    organization: "Ny",
    department: "Ny"
  };
  const parentDescription =
    level === "organization"
      ? selectedServiceArea?.serviceArea
      : level === "department"
        ? selectedOrganization?.name
        : "";

  appState.modal = {
    mode: mode === "edit" ? "organization-structure-edit" : "organization-structure-create",
    structureLevel: level,
    serviceAreaIndex,
    organizationIndex,
    departmentIndex,
    title: `${mode === "edit" ? "Rediger" : titlePrefixMap[level]} ${labelMap[level]}`,
    description: parentDescription
      ? `Denne endringen gjelder under ${parentDescription}.`
      : `Opprett eller oppdater ${labelMap[level]} i organisasjonsstrukturen.`,
    submitLabel: mode === "edit" ? "Lagre endringer" : "Opprett",
    fields: [
      {
        key: "name",
        label: "Navn",
        type: "text",
        placeholder: `Skriv inn ${labelMap[level]}`
      }
    ],
    values: {
      name: existingValue
    }
  };

  renderApp();
}

async function saveOrganizationStructureModal(modal) {
  const name = String(modal.values?.name ?? "").trim();
  if (!name) {
    setNotice("Skriv inn et navn før du lagrer.");
    renderApp();
    return;
  }

  const structureData = structuredClone(getOrganizationStructureData());
  const { structureLevel, serviceAreaIndex, organizationIndex, departmentIndex } = modal;

  if (modal.mode === "organization-structure-create") {
    if (structureLevel === "serviceArea") {
      structureData.push({ serviceArea: name, organizations: [] });
      appState.organizationSelection = {
        activeLevel: "serviceArea",
        serviceAreaIndex: structureData.length - 1,
        organizationIndex: -1,
        departmentIndex: -1
      };
    }

    if (structureLevel === "organization" && structureData[serviceAreaIndex]) {
      structureData[serviceAreaIndex].organizations.push({ name, departments: [] });
      appState.organizationSelection = {
        activeLevel: "organization",
        serviceAreaIndex,
        organizationIndex: structureData[serviceAreaIndex].organizations.length - 1,
        departmentIndex: -1
      };
    }

    if (structureLevel === "department" && structureData[serviceAreaIndex]?.organizations?.[organizationIndex]) {
      structureData[serviceAreaIndex].organizations[organizationIndex].departments.push(name);
      appState.organizationSelection = {
        activeLevel: "department",
        serviceAreaIndex,
        organizationIndex,
        departmentIndex: structureData[serviceAreaIndex].organizations[organizationIndex].departments.length - 1
      };
    }
  }

  if (modal.mode === "organization-structure-edit") {
    if (structureLevel === "serviceArea" && structureData[serviceAreaIndex]) {
      structureData[serviceAreaIndex].serviceArea = name;
    }

    if (structureLevel === "organization" && structureData[serviceAreaIndex]?.organizations?.[organizationIndex]) {
      structureData[serviceAreaIndex].organizations[organizationIndex].name = name;
    }

    if (
      structureLevel === "department" &&
      structureData[serviceAreaIndex]?.organizations?.[organizationIndex]?.departments?.[departmentIndex] != null
    ) {
      structureData[serviceAreaIndex].organizations[organizationIndex].departments[departmentIndex] = name;
    }
  }

  appState.organizationStructure = structureData;
  normalizeOrganizationSelection(structureData);
  setNotice(`${modal.title} er gjennomført i prototypen.`);
  appState.modal = null;
  await persistAppData();
  renderApp();
}

async function deleteOrganizationStructureItem(level, serviceAreaIndex, organizationIndex, departmentIndex) {
  const structureData = structuredClone(getOrganizationStructureData());

  if (level === "serviceArea" && structureData[serviceAreaIndex]) {
    structureData.splice(serviceAreaIndex, 1);
  }

  if (level === "organization" && structureData[serviceAreaIndex]?.organizations?.[organizationIndex]) {
    structureData[serviceAreaIndex].organizations.splice(organizationIndex, 1);
  }

  if (
    level === "department" &&
    structureData[serviceAreaIndex]?.organizations?.[organizationIndex]?.departments?.[departmentIndex] != null
  ) {
    structureData[serviceAreaIndex].organizations[organizationIndex].departments.splice(departmentIndex, 1);
  }

  appState.organizationStructure = structureData;
  normalizeOrganizationSelection(structureData);
  setNotice("Elementet er fjernet fra prototypen.");
  await persistAppData();
  renderApp();
}

function renderOrganizationStructureNavigationTree(structureData, selection) {
  return `
    <div class="org-tree-nav" role="tree" aria-label="Organisasjonsstruktur">
      ${structureData
        .map((serviceArea, serviceAreaIndex) =>
          renderOrganizationStructureTreeNode({
            level: "serviceArea",
            label: serviceArea.serviceArea,
            meta: `${serviceArea.organizations.length} virksomheter`,
            serviceAreaIndex,
            selection,
            children: serviceArea.organizations
              .map((organization, organizationIndex) =>
                renderOrganizationStructureTreeNode({
                  level: "organization",
                  label: organization.name,
                  meta: `${organization.departments.length} avdelinger`,
                  serviceAreaIndex,
                  organizationIndex,
                  selection,
                  children: organization.departments
                    .map((department, departmentIndex) =>
                      renderOrganizationStructureTreeNode({
                        level: "department",
                        label: department,
                        meta: "Avdeling",
                        serviceAreaIndex,
                        organizationIndex,
                        departmentIndex,
                        selection,
                        children: ""
                      })
                    )
                    .join("")
                })
              )
              .join("")
          })
        )
        .join("")}
    </div>
  `;
}

function renderOrganizationStructureTreeNode({
  level,
  label,
  meta,
  serviceAreaIndex,
  organizationIndex = -1,
  departmentIndex = -1,
  selection,
  children
}) {
  const isSelected =
    selection.activeLevel === level &&
    selection.serviceAreaIndex === serviceAreaIndex &&
    selection.organizationIndex === organizationIndex &&
    selection.departmentIndex === departmentIndex;

  return `
    <div class="org-tree-node org-tree-node--${escapeHtml(level)}" role="treeitem" aria-selected="${isSelected ? "true" : "false"}">
      <button
        class="org-tree-node__button ${isSelected ? "is-selected" : ""}"
        type="button"
        data-action="select-organization-structure-item"
        data-structure-level="${escapeHtml(level)}"
        data-service-area-index="${serviceAreaIndex}"
        ${organizationIndex >= 0 ? `data-organization-index="${organizationIndex}"` : ""}
        ${departmentIndex >= 0 ? `data-department-index="${departmentIndex}"` : ""}
      >
        <span class="org-node__eyebrow">${escapeHtml(resolveStructureLevelLabel(level))}</span>
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(meta)}</span>
      </button>
      ${children ? `<div class="org-tree-children" role="group">${children}</div>` : ""}
    </div>
  `;
}

function renderSettingsPage(screen) {
  const sections = Object.entries(SETTINGS_COLLECTION_CONFIG).map(([collectionKey, config]) => {
    const values = getSettingsCatalogValues(config.settingsKey);
    return `
      <article class="settings-card">
        <div class="settings-card__header">
          <div class="settings-card__intro">
            <h2 class="card__title">${escapeHtml(config.sectionTitle)}</h2>
            <p class="muted settings-card__description">${escapeHtml(config.description)}</p>
          </div>
          <button
            class="soft-button soft-button--compact"
            type="button"
            data-action="open-settings-catalog-modal"
            data-settings-key="${escapeHtml(config.settingsKey)}"
          >
            <span class="material-symbols-outlined">add</span>
            Legg til
          </button>
        </div>
        ${
          values.length
            ? `
              <div class="reference-list reference-list--compact">
                ${values
                  .map(
                    (entry) => `
                      <div class="reference-list__item">
                        <div class="reference-list__body">
                          ${renderCatalogItemValue(entry.name, entry.description)}
                        </div>
                        <div class="reference-list__actions">
                          <button
                            class="table-action"
                            type="button"
                            data-action="edit-settings-catalog-item"
                            data-settings-key="${escapeHtml(config.settingsKey)}"
                            data-settings-value="${escapeHtml(entry.name)}"
                            aria-label="Rediger ${escapeHtml(entry.name)}"
                          >
                            <span class="material-symbols-outlined">edit</span>
                          </button>
                        </div>
                        <button
                          class="table-action table-action--danger"
                          type="button"
                          data-action="delete-settings-catalog-item"
                          data-settings-key="${escapeHtml(config.settingsKey)}"
                          data-settings-value="${escapeHtml(entry.name)}"
                          aria-label="Fjern ${escapeHtml(entry.name)}"
                        >
                          <span class="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            `
            : `<div class="empty-state">Ingen verdier registrert ennå.</div>`
        }
      </article>
    `;
  });

  return `
    ${renderPageHeader({
      breadcrumbs: ["Systemer", screen.title],
      title: screen.title,
      description: screen.description,
      actions: screen.actions ?? [],
      actionContext: { screenId: screen.id, recordKey: screen.recordKey ?? screen.entityKey }
    })}
    <section class="settings-grid">
      ${sections.join("")}
    </section>
  `;
}

function renderApplicationInventoryPage(screen) {
  const search = appState.applicationFilters.search.trim().toLowerCase();
  const filtered = appState.applicationItems.filter((item) =>
    !search ||
    [item.name, item.vendor, item.systemOwner, item.id, item.status].some((value) =>
      String(value).toLowerCase().includes(search)
    )
  );

  return `
    ${renderPageHeader({
      breadcrumbs: ["Systemer", "Applikasjoner"],
      title: screen.title,
      description: screen.description,
      actions: screen.actions,
      actionContext: { screenId: screen.id, recordKey: screen.recordKey ?? screen.entityKey }
    })}
    ${renderMetricCards([
      { label: "Totalt", value: appState.applicationItems.length, tone: "neutral" },
      { label: "Godkjent", value: appState.applicationItems.filter((item) => item.status === "Godkjent").length, tone: "success" },
      { label: "Avvik funnet", value: appState.applicationItems.filter((item) => item.status === "Avvik funnet").length, tone: "error" }
    ])}
    <section class="inventory-toolbar">
      <div class="inventory-search">
        <span class="material-symbols-outlined">search</span>
        <input
          type="text"
          data-filter-input="application-search"
          value="${escapeHtml(appState.applicationFilters.search)}"
          placeholder="${escapeHtml(screen.searchPlaceholder)}"
        />
      </div>
    </section>
    <section class="inventory-table-shell">
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              ${screen.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}
              <th>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            ${
              filtered.length
                ? filtered.map((item) => renderApplicationInventoryRow(item)).join("")
                : `
                  <tr>
                    <td colspan="7">
                      <div class="empty-state">Ingen applikasjoner matcher søket.</div>
                    </td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <div>Viser ${filtered.length} av ${appState.applicationItems.length} applikasjoner</div>
        <div class="pagination__controls">
          <span class="meta-badge"><span class="material-symbols-outlined">apps</span> Registrerte systemer</span>
        </div>
      </div>
    </section>
  `;
}

function renderControllerProtocolInventoryPage(screen) {
  return renderProtocolInventoryPage({
    screen,
    breadcrumbs: ["Etterlevelse", "Behandlingsansvarlig protokoll"],
    items: appState.controllerProtocolItems,
    search: appState.controllerProtocolFilters.search,
    searchKey: "controller-protocol-search",
    emptyMessage: "Ingen behandlinger matcher søket.",
    badgeLabel: "Registrerte behandlinger",
    rowRenderer: renderControllerProtocolInventoryRow
  });
}

function renderProcessorProtocolInventoryPage(screen) {
  return renderProtocolInventoryPage({
    screen,
    breadcrumbs: ["Etterlevelse", "Databehandler protokoll"],
    items: appState.processorProtocolItems,
    search: appState.processorProtocolFilters.search,
    searchKey: "processor-protocol-search",
    emptyMessage: "Ingen behandlinger matcher søket.",
    badgeLabel: "Registrerte behandlinger",
    rowRenderer: renderProcessorProtocolInventoryRow
  });
}

function renderProtocolInventoryPage({ screen, breadcrumbs, items, search, searchKey, emptyMessage, badgeLabel, rowRenderer }) {
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = items.filter((item) =>
    !normalizedSearch ||
    Object.values(item).some((value) => String(value).toLowerCase().includes(normalizedSearch))
  );
  const metricCards =
    screen.entityKey === "controller_protocol"
      ? [
          { label: "Totalt", value: items.length, tone: "neutral" },
          { label: "Under vurdering", value: items.filter((item) => item.status === "Under vurdering").length, tone: "warning" },
          { label: "Høy risiko", value: items.filter((item) => item.privacyRisk === "Høy").length, tone: "error" }
        ]
      : [
          { label: "Totalt", value: items.length, tone: "neutral" },
          { label: "Under vurdering", value: items.filter((item) => item.status === "Under vurdering").length, tone: "warning" },
          { label: "Høyt sikkerhetsnivå", value: items.filter((item) => item.securityLevel === "Høy").length, tone: "primary" }
        ];

  return `
    ${renderPageHeader({
      breadcrumbs,
      title: screen.title,
      description: screen.description,
      actions: screen.actions,
      actionContext: { screenId: screen.id, recordKey: screen.recordKey ?? screen.entityKey }
    })}
    ${renderMetricCards(metricCards)}
    <section class="inventory-toolbar">
      <div class="inventory-search">
        <span class="material-symbols-outlined">search</span>
        <input
          type="text"
          data-filter-input="${searchKey}"
          value="${escapeHtml(search)}"
          placeholder="${escapeHtml(screen.searchPlaceholder)}"
        />
      </div>
    </section>
    <section class="inventory-table-shell">
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              ${screen.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}
              <th>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            ${
              filtered.length
                ? filtered.map((item) => rowRenderer(item)).join("")
                : `
                  <tr>
                    <td colspan="7">
                      <div class="empty-state">${escapeHtml(emptyMessage)}</div>
                    </td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <div>Viser ${filtered.length} av ${items.length} behandlinger</div>
        <div class="pagination__controls">
          <span class="meta-badge"><span class="material-symbols-outlined">assignment_ind</span> ${escapeHtml(badgeLabel)}</span>
        </div>
      </div>
    </section>
  `;
}

function renderEntityDetailPage(screen, structure, query) {
  const record = resolveRecord(screen, query);
  const tabs = structure.tabs ?? [];
  const activeTab = resolveActiveTab(screen, tabs, query);
  const tab = tabs.find((candidate) => candidate.key === activeTab) ?? tabs[0];
  const body =
    screen.tabModes?.[tab.key] === "summary" || tab.derived
      ? renderSummaryTab(structure, record, tab)
      : renderTabSections(tab, screen, record);

  return `
    ${renderPageHeader({
      breadcrumbs: record.breadcrumbs,
      title: record.fieldValues.name ?? screen.title,
      description: record.description,
      actions: screen.actions,
      actionContext: { screenId: screen.id, recordKey: screen.recordKey }
    })}
    ${renderTabs(screen, tabs, activeTab)}
    ${tab.actions?.length ? `<div class="tab-actions" style="margin-bottom:1rem">${renderActions(tab.actions, "soft")}</div>` : ""}
    ${body}
    ${renderFooterMeta(record)}
  `;
}

function renderAdminSectionsPage(screen, structure) {
  const record = resolveRecord(screen);
  const sections = structure.sections ?? [];

  return `
    ${renderPageHeader({
      breadcrumbs: record.breadcrumbs,
      title: record.fieldValues.organization_name ?? screen.title,
      description: record.description,
      actions: screen.actions,
      actionContext: { screenId: screen.id, recordKey: screen.recordKey }
    })}
    <section class="content-grid">
      ${sections.map((section) => renderSectionCard(section, screen, record)).join("")}
    </section>
    ${renderFooterMeta(record)}
  `;
}

function renderPageHeader({ breadcrumbs, title, description, actions, actionContext = {} }) {
  return `
    <header class="page-header">
      <div class="page-header__copy">
        <nav class="breadcrumbs">
          ${breadcrumbs.map((crumb, index) => renderBreadcrumb(crumb, index < breadcrumbs.length - 1)).join("")}
        </nav>
        <h1 class="page-title">${escapeHtml(title)}</h1>
        <p class="page-subtitle">${escapeHtml(description)}</p>
      </div>
      <div class="page-actions">
        ${renderActions(actions, "primary", actionContext)}
      </div>
    </header>
  `;
}

function renderMetricCards(cards = []) {
  return `
    <section class="metric-grid">
      ${cards
        .map(
          (card) => `
            <article class="metric-card metric-card--${escapeHtml(card.tone ?? "neutral")}">
              <span class="metric-card__label">${escapeHtml(card.label)}</span>
              <strong class="metric-card__value">${escapeHtml(card.value)}</strong>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderBreadcrumb(label, withChevron) {
  return `
    <span>${escapeHtml(label)}</span>
    ${withChevron ? '<span class="material-symbols-outlined">chevron_right</span>' : ""}
  `;
}

function renderActions(actions = [], fallbackTone = "primary", context = {}) {
  return actions
    .map((action) => (typeof action === "string" ? { label: action, icon: inferActionIcon(action), tone: fallbackTone } : action))
    .filter((action) => !shouldHideAction(action.label))
    .map((action) => renderActionButton(action, fallbackTone, context))
    .join("");
}

function renderActionButton(action, fallbackTone = "primary", context = {}) {
  const tone = action.tone ?? fallbackTone;
  const className = context.className ?? (tone === "ghost" ? "ghost-button" : tone === "soft" ? "soft-button" : "action-button");
  const attributes = [];

  if (action.actionId) {
    attributes.push(`data-action="${escapeHtml(action.actionId)}"`);
  } else if (context.recordKey || context.sectionKey || context.collectionKey) {
    attributes.push('data-action="generic-ui-action"');
    attributes.push(`data-action-label="${escapeHtml(action.label)}"`);
  }

  if (context.recordKey) {
    attributes.push(`data-record-key="${escapeHtml(context.recordKey)}"`);
  }
  if (context.sectionKey) {
    attributes.push(`data-section-key="${escapeHtml(context.sectionKey)}"`);
  }
  if (context.collectionKey) {
    attributes.push(`data-collection-key="${escapeHtml(context.collectionKey)}"`);
  }

  return `
    <button class="${className}" type="button" ${attributes.join(" ")}>
      <span class="material-symbols-outlined">${escapeHtml(action.icon ?? inferActionIcon(action.label))}</span>
      ${escapeHtml(action.label)}
    </button>
  `;
}

function renderTabs(screen, tabs, activeTab) {
  return `
    <nav class="page-tabs">
      ${tabs
        .map(
          (tab) => `
            <button class="tab-button ${tab.key === activeTab ? "is-active" : ""}" type="button" data-route="${screen.route}" data-tab-key="${tab.key}">
              ${escapeHtml(tab.label)}
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderTabSections(tab, screen, record) {
  if (!tab.sections?.length) {
    return renderTabEmptyState(tab);
  }
  return `<section class="content-grid">${tab.sections.map((section) => renderSectionCard(section, screen, record)).join("")}</section>`;
}

function renderTabEmptyState(tab) {
  const notes = tab.notes?.length ? tab.notes.map((note) => `<p>${escapeHtml(note)}</p>`).join("") : "<p>Ingen felter er definert for denne fanen i YAML-modellen.</p>";
  return `
    <section class="content-grid">
      <article class="card span-12">
        <div class="card__header">
          <div class="card__title-wrap">
            <div class="card__icon">
              <span class="material-symbols-outlined">info</span>
            </div>
            <div>
              <h2 class="card__title">${escapeHtml(tab.label)}</h2>
              <p class="card__meta">Denne fanen mangler felter i kildemodellen og viser derfor bare tilgjengelige YAML-notater.</p>
            </div>
          </div>
        </div>
        <div class="empty-state">${notes}</div>
      </article>
    </section>
  `;
}

function renderSectionCard(section, screen, record) {
  const layout = screen.sectionLayouts?.[section.key] ?? {};
  const span = layout.span ?? 12;
  const toneClass = layout.tone === "accent" ? "card--accent" : layout.tone === "tint" ? "card--tint" : "";
  const icon = layout.icon ?? inferIcon(section.key);
  const showHeaderActions = layout.presentation !== "labels";
  const sectionActions =
    showHeaderActions && section.actions?.length
      ? `<div class="section-actions">${renderActions(section.actions, "soft", { recordKey: screen.recordKey, sectionKey: section.key })}</div>`
      : "";
  const callout = renderSectionCallout(layout.callout, record);

  return `
    <article class="card span-${span} ${toneClass}">
      <div class="card__header">
        <div class="card__title-wrap">
          <div class="card__icon">
            <span class="material-symbols-outlined">${icon}</span>
          </div>
          <div>
            <h2 class="card__title">${escapeHtml(section.label)}</h2>
            ${
              section.helpText
                ? `<p class="card__meta">${escapeHtml(section.helpText)}</p>`
                : section.notes?.length
                  ? `<p class="card__meta">${escapeHtml(section.notes.join(" "))}</p>`
                  : ""
            }
          </div>
        </div>
        ${sectionActions}
      </div>
      ${renderSectionContent(section, layout, record, screen)}
      ${callout}
    </article>
  `;
}

function renderSectionContent(section, layout, record, screen) {
  if (layout.presentation === "labels") {
    return renderLabelsSection(section, record, screen);
  }
  if (layout.presentation === "chips") {
    return renderChipCollections(section, record);
  }
  if (layout.presentation?.startsWith("linkGrid")) {
    return renderLinksSection(section, record, layout.presentation, screen);
  }
  if (section.repeatingItem?.fields?.length && section.criteria?.length) {
    return renderReviewCriteriaSection(section, record);
  }

  const fieldsHtml = section.fields?.length ? renderFields(section.fields, record) : "";
  const collectionsHtml = section.collections?.length ? section.collections.map((collection) => renderCollection(collection, record, screen, section)).join("") : "";

  if (!fieldsHtml && !collectionsHtml) {
    return `<div class="empty-state">${escapeHtml(section.emptyState ?? "Ingen innhold definert i denne delen ennå.")}</div>`;
  }

  return `${fieldsHtml}${collectionsHtml}`;
}

function renderFields(fields, record) {
  return `<div class="field-grid">${fields.map((field) => renderField(field, record)).join("")}</div>`;
}

function renderField(field, record) {
  const value = record.fieldValues?.[field.key];
  const fullWidthControls = new Set(["textarea", "search_select_repeating", "table", "file_upload"]);
  const isDisplayOnly = field.type === "display_text" && !field.control;
  const wrapperClass = isDisplayOnly ? "display-field" : "field";
  const fullClass = fullWidthControls.has(field.control) || String(field.label).length > 40 ? `${wrapperClass}--full` : "";
  const label = renderFieldLabelContent(field.label, field.required, field.helpText);
  const inputType = field.type === "number" || field.type === "integer" ? "number" : field.type === "date" ? "date" : "text";

  if (isDisplayOnly) {
    return `
      <div class="${wrapperClass} ${fullClass}">
        <span class="display-field__label">${escapeHtml(field.label)}</span>
        <div class="faux-input">${escapeHtml(formatValue(value))}</div>
      </div>
    `;
  }

  if (field.control === "checkbox") {
    return `
      <div class="${wrapperClass} ${fullClass}">
        <div class="checkbox-row">
          <input type="checkbox" data-record-field="${escapeHtml(`${record.id}:${field.key}`)}" ${value ? "checked" : ""} />
          <div class="checkbox-copy">
            <strong>${renderFieldLabelContent(field.label, field.required, field.helpText)}</strong>
          </div>
        </div>
      </div>
    `;
  }

  if (field.control === "radio") {
    return `
      <div class="${wrapperClass} ${fullClass}">
        <label>${label}</label>
        <div class="segmented-control">
          ${(field.options ?? [])
            .map((option, index) => {
              const optionValue = typeof option === "string" ? option : option.value;
              const optionLabel = typeof option === "string" ? option : option.label;
              const id = `${record.id}-${field.key}-${index}`;
              const isChecked = String(optionValue) === String(value);
              return `
                <label class="segmented-choice ${isChecked ? "is-selected" : ""}" for="${escapeHtml(id)}">
                  <input
                    id="${escapeHtml(id)}"
                    type="radio"
                    name="${escapeHtml(`${record.id}-${field.key}`)}"
                    data-record-field="${escapeHtml(`${record.id}:${field.key}`)}"
                    value="${escapeHtml(optionValue)}"
                    ${isChecked ? "checked" : ""}
                  />
                  <span>${escapeHtml(optionLabel)}</span>
                </label>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  if (field.control === "select") {
    const options = resolveOptions(field);
    return `
      <div class="${wrapperClass} ${fullClass}">
        <label>${label}</label>
        <select data-record-field="${escapeHtml(`${record.id}:${field.key}`)}">
          ${options.map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
        </select>
      </div>
    `;
  }

  if (field.control === "input_text_disabled") {
    return `
      <div class="${wrapperClass} ${fullClass}">
        <label>${label}</label>
        <input type="text" value="${escapeHtml(formatValue(value))}" disabled />
      </div>
    `;
  }

  if (field.control === "textarea") {
    return `
      <div class="${wrapperClass} ${fullClass}">
        <label>${label}</label>
        <textarea data-record-field="${escapeHtml(`${record.id}:${field.key}`)}" placeholder="${escapeHtml(field.placeholder ?? "")}">${escapeHtml(formatValue(value))}</textarea>
      </div>
    `;
  }

  if (field.control === "search_select_repeating") {
    return `
      <div class="${wrapperClass} ${fullClass}">
        <label>${label}</label>
        <div class="chip-list">${(Array.isArray(value) ? value : []).map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join("")}</div>
        <div class="faux-input">Velg fra forslag eller legg til egen verdi</div>
      </div>
    `;
  }

  if (field.control === "table") {
    return `
      <div class="${wrapperClass} ${fullClass}">
        <label>${label}</label>
        ${renderObjectTable(Array.isArray(value) ? value : [], null)}
      </div>
    `;
  }

  if (field.control === "file_upload") {
    return `
      <div class="${wrapperClass} ${fullClass}">
        <label>${label}</label>
        <div class="upload-box">
          <input type="file" />
        </div>
      </div>
    `;
  }

  return `
    <div class="${wrapperClass} ${fullClass}">
      <label>${label}</label>
      <input type="${inputType}" data-record-field="${escapeHtml(`${record.id}:${field.key}`)}" value="${escapeHtml(formatValue(value))}" placeholder="${escapeHtml(field.placeholder ?? "")}" />
    </div>
  `;
}

function renderCollection(collection, record, screen, section) {
  if (screen.recordKey === "application" && SETTINGS_COLLECTION_CONFIG[collection.key]) {
    return renderSettingsBackedCollection(collection, record, screen, section);
  }

  const items = record.collectionValues?.[collection.key] ?? [];
  const showCollectionTitle =
    collection.label && (collection.label !== section.label || (section.collections?.length ?? 0) > 1);
  const header = `
    <div class="collection-header">
      ${showCollectionTitle ? `<div><h3 class="card__title">${escapeHtml(collection.label)}</h3></div>` : "<div></div>"}
      ${
        collection.addButtonLabel
          ? renderActionButton(
              { label: collection.addButtonLabel, icon: "add", tone: "soft" },
              "soft",
              { recordKey: screen.recordKey, sectionKey: section.key, collectionKey: collection.key }
            )
          : ""
      }
    </div>
  `;

  if (!items.length) {
    return `${header}<div class="empty-state">${escapeHtml(collection.emptyState ?? "Ingen elementer registrert ennå.")}</div>`;
  }

  if (Array.isArray(items) && typeof items[0] === "string") {
    return `${header}<div class="chip-list">${items.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>`;
  }

  return `${header}${renderObjectTable(items, collection.columns ?? null)}`;
}

function renderSettingsBackedCollection(collection, record, screen, section) {
  const items = Array.isArray(record.collectionValues?.[collection.key]) ? record.collectionValues[collection.key] : [];
  const config = SETTINGS_COLLECTION_CONFIG[collection.key];

  return `
    <div class="collection-header">
      <div>
        <h3 class="card__title">${escapeHtml(collection.label)}</h3>
        <p class="muted">Verdiene vedlikeholdes under Innstillinger og kan velges flere ganger på tvers av applikasjoner.</p>
      </div>
      <button
        class="soft-button"
        type="button"
        data-action="open-settings-backed-modal"
        data-record-key="${escapeHtml(screen.recordKey)}"
        data-section-key="${escapeHtml(section.key)}"
        data-collection-key="${escapeHtml(collection.key)}"
      >
        <span class="material-symbols-outlined">add</span>
        Legg til
      </button>
    </div>
    ${
      items.length
        ? `
          <div class="reference-list">
            ${items
              .map(
                (item) => `
                  <div class="reference-list__item">
                    <div class="reference-list__body">
                      ${renderCatalogItemValue(
                        String(item),
                        getSettingsCatalogEntry(config.settingsKey, String(item))?.description ?? ""
                      )}
                    </div>
                    <button
                      class="table-action table-action--danger"
                      type="button"
                      data-action="delete-collection-string"
                      data-record-key="${escapeHtml(screen.recordKey)}"
                      data-collection-key="${escapeHtml(collection.key)}"
                      data-collection-value="${escapeHtml(String(item))}"
                      aria-label="Fjern ${escapeHtml(String(item))}"
                    >
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                `
              )
              .join("")}
          </div>
        `
        : `<div class="empty-state">Ingen ${escapeHtml(config.singularLabel)}er valgt ennå.</div>`
    }
  `;
}

function renderChipCollections(section, record) {
  const values = [];
  for (const field of section.fields ?? []) {
    const fieldValue = record.fieldValues?.[field.key];
    if (Array.isArray(fieldValue)) {
      values.push(...fieldValue);
    }
  }
  for (const collection of section.collections ?? []) {
    const collectionValue = record.collectionValues?.[collection.key];
    if (Array.isArray(collectionValue)) {
      values.push(...collectionValue);
    }
  }
  return values.length ? `<div class="chip-list">${values.map((value) => `<span class="chip">${escapeHtml(String(value))}</span>`).join("")}</div>` : `<div class="empty-state">Ingen verdier registrert ennå.</div>`;
}

function renderLinksSection(section, record, presentation, screen) {
  return (section.collections ?? []).map((collection) => renderCollection(collection, record, screen, section)).join("");
}

function renderLabelsSection(section, record, screen) {
  const labels = record.collectionValues?.labels ?? [];
  return `
    <div class="label-toolbar">
      <div class="label-summary">
        <span class="meta-badge"><span class="material-symbols-outlined">sell</span>${labels.length} merkelapper</span>
        <p class="muted">Bruk merkelapper for rask filtrering, kategorisering og gjenfinning på tvers av systemer.</p>
      </div>
      ${renderActions((section.actions ?? []).map((label) => ({ label, icon: "add", tone: "soft" })), "soft", {
        recordKey: screen.recordKey,
        sectionKey: section.key
      })}
    </div>
    ${
      labels.length
        ? `
          <div class="label-list">
            ${labels
              .map(
                (label) => `
                  <div class="label-list__item">
                    <span class="chip chip--emphasized">
                      <span class="material-symbols-outlined">sell</span>
                      ${escapeHtml(label)}
                    </span>
                  </div>
                `
              )
              .join("")}
          </div>
        `
        : `<div class="empty-state">${escapeHtml(section.emptyState ?? "Ingen merkelapper opprettet.")}</div>`
    }
  `;
}

function renderReviewCriteriaSection(section, record) {
  const values = record.collectionValues?.review_criteria ?? [];
  const valueMap = new Map(values.map((item) => [item.key, item]));

  return `
    <div class="review-panel">
      <div class="review-panel__intro">
        <p class="muted">Vurder applikasjonen etter de nasjonale arkitekturprinsippene. 1 betyr lav støtte, 5 betyr høy støtte.</p>
      </div>
      ${section.criteria
        .map((criterion) => {
          const value = valueMap.get(criterion.key) ?? {};
          return `
            <article class="review-card">
              <div class="review-card__header">
                <div>
                  <h3 class="review-card__title review-card__title--with-help">
                    <span>${escapeHtml(criterion.label)}</span>
                    ${renderHelpAffordance(criterion.helpText)}
                  </h3>
                </div>
                <div class="review-score">
                  ${[1, 2, 3, 4, 5]
                    .map((score) => {
                      const scoreId = `${record.id}-${criterion.key}-${score}`;
                      const isChecked = Number(value.score) === score;
                      return `
                        <label class="review-score__option ${isChecked ? "is-selected" : ""}" for="${escapeHtml(scoreId)}">
                          <input
                            id="${escapeHtml(scoreId)}"
                            type="radio"
                            name="${escapeHtml(`review-${criterion.key}`)}"
                            data-review-score="${escapeHtml(`${record.id}:${criterion.key}`)}"
                            value="${score}"
                            ${isChecked ? "checked" : ""}
                          />
                          <span>${score}</span>
                        </label>
                      `;
                    })
                    .join("")}
                </div>
              </div>
              <div class="field field--full">
                <label for="${escapeHtml(`${record.id}-${criterion.key}-comment`)}">Kommentar</label>
                <textarea
                  id="${escapeHtml(`${record.id}-${criterion.key}-comment`)}"
                  data-review-comment="${escapeHtml(`${record.id}:${criterion.key}`)}"
                  placeholder="Legg til kommentar for vurderingen"
                >${escapeHtml(value.comment ?? "")}</textarea>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderObjectTable(items, columns) {
  if (!items.length) {
    return `<div class="empty-state">Ingen rader registrert.</div>`;
  }

  const derivedColumns = columns?.length ? columns : Object.keys(items[0]).map((key) => key);

  return `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>${derivedColumns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${items
            .map((item) => {
              const row = derivedColumns
                .map((column) => {
                  const matchedKey = Object.keys(item).find((key) => normalizeKey(key) === normalizeKey(column)) ?? column;
                  return `<td>${escapeHtml(formatValue(item[matchedKey]))}</td>`;
                })
                .join("");
              return `<tr>${row}</tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSummaryTab(structure, record, tab) {
  const summaryItems = [];
  for (const sourceTab of structure.tabs ?? []) {
    if (sourceTab.key === tab.key) {
      continue;
    }
    for (const section of sourceTab.sections ?? []) {
      for (const field of section.fields ?? []) {
        const value = record.fieldValues?.[field.key];
        if (hasMeaningfulValue(value)) {
          summaryItems.push({ label: field.label, value: formatValue(value) });
        }
      }
      for (const collection of section.collections ?? []) {
        const value = record.collectionValues?.[collection.key];
        if (hasMeaningfulValue(value)) {
          summaryItems.push({ label: collection.label, value: formatValue(value) });
        }
      }
    }
  }

  return `
    <section class="content-grid">
      <article class="card span-12 card--accent">
        <div class="card__header">
          <div class="card__title-wrap">
            <div class="card__icon">
              <span class="material-symbols-outlined">print</span>
            </div>
            <div>
              <h2 class="card__title">${escapeHtml(tab.label)}</h2>
              <p class="card__meta">Denne visningen er avledet fra registrerte felt og er ment for gjennomgang, eksport og utskrift.</p>
            </div>
          </div>
          <div class="section-actions">
            <button class="ghost-button" type="button">
              <span class="material-symbols-outlined">print</span>
              Skriv ut
            </button>
          </div>
        </div>
        <div class="summary-list">
          ${summaryItems
            .map(
              (item, index) => `
                <div class="summary-item">
                  <strong>${index + 1}. ${escapeHtml(item.label)}</strong>
                  <span>${escapeHtml(item.value)}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </article>
    </section>
  `;
}

function renderFooterMeta(record) {
  return `
    <footer class="footer-meta">
      <div class="footer-meta__items">
        <span class="footer-meta__item"><span class="material-symbols-outlined">edit</span>Sist endret av: ${escapeHtml(record.meta.lastModifiedBy)}</span>
        <span class="footer-meta__item"><span class="material-symbols-outlined">calendar_today</span>Opprettet: ${formatDate(record.meta.createdAt)}</span>
        <span class="footer-meta__item"><span class="material-symbols-outlined">update</span>Sist oppdatert: ${formatDate(record.meta.lastUpdated)}</span>
      </div>
      <div class="meta-badge"><span class="material-symbols-outlined">fingerprint</span>ID: ${escapeHtml(record.id)}</div>
    </footer>
  `;
}

function renderInventoryRow(item) {
  const hosting = resolveHostingMeta(item.hostingType, item.cloudVariant);
  const privacy = resolvePrivacyMeta(item);
  const detailHref = `#/datasets/barnevern-datasett?id=${encodeURIComponent(item.id)}`;
  return `
    <tr>
      <td>
        <a class="name-cell" href="${detailHref}">
          <strong>${escapeHtml(item.name)}</strong>
        </a>
      </td>
      <td>${escapeHtml(item.purpose)}</td>
      <td><span class="tag ${hosting.tone}"><span class="material-symbols-outlined">${hosting.icon}</span>${escapeHtml(hosting.label)}</span></td>
      <td><span class="tag ${privacy.tone}"><span class="material-symbols-outlined">${privacy.icon}</span>${escapeHtml(privacy.label)}</span></td>
      <td>${formatDate(item.lastUpdated)}</td>
      <td><a class="table-action" href="${detailHref}" aria-label="Åpne datasett"><span class="material-symbols-outlined">open_in_new</span></a></td>
    </tr>
  `;
}

function renderApplicationInventoryRow(item) {
  const statusMeta = resolveApplicationStatusMeta(item.status);
  const criticalityMeta = resolveCriticalityMeta(item.criticality);
  const detailHref = `#/applications/detail?id=${encodeURIComponent(item.id)}`;

  return `
    <tr>
      <td>
        <a class="name-cell" href="${detailHref}">
          <strong>${escapeHtml(item.name)}</strong>
        </a>
      </td>
      <td>${escapeHtml(item.vendor)}</td>
      <td>${escapeHtml(item.version)}</td>
      <td><span class="tag ${statusMeta.tone}">${escapeHtml(item.status)}</span></td>
      <td><span class="tag ${criticalityMeta.tone}">${escapeHtml(item.criticality)}</span></td>
      <td>${formatDate(item.lastUpdated)}</td>
      <td>
        <div class="section-actions">
          <a class="table-action" href="${detailHref}" aria-label="Rediger applikasjon">
            <span class="material-symbols-outlined">edit</span>
          </a>
          <button class="table-action table-action--danger" type="button" data-action="delete-application" data-application-id="${escapeHtml(item.id)}" aria-label="Slett applikasjon">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderControllerProtocolInventoryRow(item) {
  const statusMeta = resolveApplicationStatusMeta(item.status);
  const riskMeta = resolveCriticalityMeta(item.privacyRisk);
  const detailHref = `#/controller-protocol/detail?id=${encodeURIComponent(item.id)}`;

  return `
    <tr>
      <td>
        <a class="name-cell" href="${detailHref}">
          <strong>${escapeHtml(item.name)}</strong>
        </a>
      </td>
      <td>${escapeHtml(item.controller)}</td>
      <td>${escapeHtml(item.legalBasis)}</td>
      <td><span class="tag ${statusMeta.tone}">${escapeHtml(item.status)}</span></td>
      <td><span class="tag ${riskMeta.tone}">${escapeHtml(item.privacyRisk)}</span></td>
      <td>${formatDate(item.lastUpdated)}</td>
      <td>
        <div class="section-actions">
          <a class="table-action" href="${detailHref}" aria-label="Rediger behandling">
            <span class="material-symbols-outlined">edit</span>
          </a>
          <button class="table-action table-action--danger" type="button" data-action="delete-controller-protocol" data-controller-protocol-id="${escapeHtml(item.id)}" aria-label="Slett behandling">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderProcessorProtocolInventoryRow(item) {
  const statusMeta = resolveApplicationStatusMeta(item.status);
  const securityMeta = resolveCriticalityMeta(item.securityLevel);
  const detailHref = `#/processor-protocol/detail?id=${encodeURIComponent(item.id)}`;

  return `
    <tr>
      <td>
        <a class="name-cell" href="${detailHref}">
          <strong>${escapeHtml(item.name)}</strong>
        </a>
      </td>
      <td>${escapeHtml(item.processor)}</td>
      <td>${escapeHtml(String(item.controllerCount))}</td>
      <td><span class="tag ${statusMeta.tone}">${escapeHtml(item.status)}</span></td>
      <td><span class="tag ${securityMeta.tone}">${escapeHtml(item.securityLevel)}</span></td>
      <td>${formatDate(item.lastUpdated)}</td>
      <td>
        <div class="section-actions">
          <a class="table-action" href="${detailHref}" aria-label="Rediger behandling">
            <span class="material-symbols-outlined">edit</span>
          </a>
          <button class="table-action table-action--danger" type="button" data-action="delete-processor-protocol" data-processor-protocol-id="${escapeHtml(item.id)}" aria-label="Slett behandling">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `;
}

function resolveRecord(screen, query = new URLSearchParams()) {
  if (screen.recordKey === "application") {
    const requestedId = query.get("id");
    const item = appState.applicationItems.find((candidate) => candidate.id === requestedId) ?? appState.applicationItems[0];
    return createApplicationRecord(item);
  }
  if (screen.recordKey === "dataset") {
    const requestedId = query.get("id");
    const item = appState.datasetItems.find((candidate) => candidate.id === requestedId) ?? appState.datasetItems[0];
    return createDatasetRecord(item);
  }
  if (screen.recordKey === "controller_protocol") {
    const requestedId = query.get("id");
    const item = appState.controllerProtocolItems.find((candidate) => candidate.id === requestedId) ?? appState.controllerProtocolItems[0];
    return createControllerProtocolRecord(item);
  }
  if (screen.recordKey === "processor_protocol") {
    const requestedId = query.get("id");
    const item = appState.processorProtocolItems.find((candidate) => candidate.id === requestedId) ?? appState.processorProtocolItems[0];
    return createProcessorProtocolRecord(item);
  }

  return appState.records[screen.recordKey];
}

function resolveDocumentTitle(screen, query = new URLSearchParams()) {
  if (screen.pageFamily === "EntityDetailPage") {
    const record = resolveRecord(screen, query);
    return record.fieldValues?.name ?? screen.title;
  }
  return screen.title;
}

function createApplicationRecord(item) {
  const template = appState.records.application;
  if (!item) {
    return template;
  }

  return {
    ...template,
    id: item.id,
    breadcrumbs: ["Systemer", "Applikasjoner", item.name],
    description: `${item.name} er registrert i porteføljen med leverandør ${item.vendor}, versjon ${item.version} og systemeier ${item.systemOwner}.`,
    fieldValues: {
      ...template.fieldValues,
      name: item.name,
      version: item.version,
      vendor: item.vendor,
      system_owner: item.systemOwner,
      criticality: item.criticality,
      description: `${item.name} støtter virksomhetens arbeidsprosesser og er registrert som ${item.status.toLowerCase()}.`
    },
    meta: {
      ...template.meta,
      lastUpdated: item.lastUpdated
    }
  };
}

function createDatasetRecord(item) {
  const template = appState.records.dataset;
  if (!item) {
    return template;
  }

  return {
    ...template,
    id: item.id,
    breadcrumbs: ["Systemer", "Datasett", item.name],
    description: item.description || template.description,
    fieldValues: {
      ...template.fieldValues,
      name: item.name,
      description: item.description || template.fieldValues.description,
      purpose: item.purpose || template.fieldValues.purpose,
      has_personal_data: Boolean(item.hasPersonalData),
      has_sensitive_personal_data: Boolean(item.hasSensitivePersonalData),
      hosting_type: item.hostingType || template.fieldValues.hosting_type
    },
    meta: {
      ...template.meta,
      lastUpdated: item.lastUpdated || template.meta.lastUpdated
    }
  };
}

function createControllerProtocolRecord(item) {
  const template = appState.records.controller_protocol;
  if (!item) {
    return template;
  }

  return {
    ...template,
    id: item.id,
    breadcrumbs: ["Etterlevelse", "Behandlingsansvarlig protokoll", item.name],
    description: `${item.name} er registrert for ${item.controller} med behandlingsgrunnlag ${item.legalBasis.toLowerCase()} og status ${item.status.toLowerCase()}.`,
    fieldValues: {
      ...template.fieldValues,
      name: item.name,
      controller: item.controller,
      high_privacy_risk: item.privacyRisk,
      article_6_reason: `${item.legalBasis}.`,
      processing_description: `${item.name} følges opp i behandlingsprotokollen og er registrert som ${item.status.toLowerCase()}.`
    },
    meta: {
      ...template.meta,
      lastUpdated: item.lastUpdated
    }
  };
}

function createProcessorProtocolRecord(item) {
  const template = appState.records.processor_protocol;
  if (!item) {
    return template;
  }

  return {
    ...template,
    id: item.id,
    breadcrumbs: ["Etterlevelse", "Databehandler protokoll", item.name],
    description: `${item.name} er registrert for ${item.processor} med ${item.controllerCount} oppdragsgivere og status ${item.status.toLowerCase()}.`,
    fieldValues: {
      ...template.fieldValues,
      name: item.name,
      processor: item.processor,
      controllers: Array.from({ length: item.controllerCount }, (_, index) => `Oppdragsgiver ${index + 1}`),
      additional_notes: `${item.name} er registrert som ${item.status.toLowerCase()} med sikkerhetsnivå ${item.securityLevel.toLowerCase()}.`
    },
    meta: {
      ...template.meta,
      lastUpdated: item.lastUpdated
    }
  };
}

function resolveApplicationStatusMeta(status) {
  if (status === "Godkjent") {
    return { tone: "tag--success" };
  }
  if (status === "Under vurdering") {
    return { tone: "tag--warning" };
  }
  if (status === "Avvik funnet") {
    return { tone: "tag--error" };
  }
  return { tone: "tag--neutral" };
}

function resolveCriticalityMeta(criticality) {
  if (criticality === "Kritisk" || criticality === "Høy") {
    return { tone: "tag--error" };
  }
  if (criticality === "Middels") {
    return { tone: "tag--warning" };
  }
  return { tone: "tag--neutral" };
}

function createNewApplicationItem() {
  const sequence = appState.applicationItems.length + 1;
  const suffix = String(sequence).padStart(3, "0");
  return {
    id: `APP-DRAFT-${suffix}`,
    name: `Ny applikasjon ${sequence}`,
    vendor: "Ny leverandør",
    version: "1.0",
    systemOwner: "Ikke satt",
    criticality: "Lav",
    status: "Under vurdering",
    lastUpdated: "2026-03-25"
  };
}

function createNewDatasetItem() {
  const sequence = appState.datasetItems.length + 1;
  const suffix = String(sequence).padStart(3, "0");
  return {
    id: `DS-DRAFT-${suffix}`,
    name: `Nytt datasett ${sequence}`,
    purpose: "Formål må registreres",
    description: "Beskrivelse må registreres.",
    hostingType: "LocalServer",
    cloudVariant: "Lokal server",
    hasPersonalData: false,
    hasSensitivePersonalData: false,
    lastUpdated: getTodayIsoDate(),
    route: "#/datasets/barnevern-datasett"
  };
}

function createNewControllerProtocolItem() {
  const sequence = appState.controllerProtocolItems.length + 1;
  const suffix = String(sequence).padStart(4, "0");
  return {
    id: `CTRL-DRAFT-${suffix}`,
    name: `Ny behandling ${sequence}`,
    controller: "Hammerfest kommune",
    legalBasis: "Offentlig myndighet",
    status: "Under vurdering",
    privacyRisk: "Middels",
    lastUpdated: "2026-03-25"
  };
}

function createNewProcessorProtocolItem() {
  const sequence = appState.processorProtocolItems.length + 1;
  const suffix = String(sequence).padStart(4, "0");
  return {
    id: `PROC-DRAFT-${suffix}`,
    name: `Ny behandling ${sequence}`,
    processor: "Ny databehandler",
    controllerCount: 1,
    status: "Under vurdering",
    securityLevel: "Middels",
    lastUpdated: "2026-03-25"
  };
}

function renderFilterGroup(definition, value) {
  return `
    <div class="segmented-control">
      ${definition.options
        .map(
          (option) => `
            <button
              class="segmented-button ${option.value === value ? "is-selected" : ""}"
              type="button"
              data-filter-key="${definition.key}"
              data-filter-value="${option.value}"
            >
              ${escapeHtml(option.label)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function resolveActiveTab(screen, tabs, query) {
  const requested = query.get("tab");
  const persisted = appState.activeTabs[screen.route];
  const fallback = tabs[0]?.key;
  const next = tabs.some((tab) => tab.key === requested) ? requested : persisted ?? fallback;
  appState.activeTabs[screen.route] = next;
  return next;
}

function renderSectionCallout(calloutKey, record) {
  if (calloutKey === "accessibility" && record.fieldValues.accessibility_statement_required && !record.fieldValues.has_accessibility_statement) {
    return `
      <div class="callout">
        <span class="material-symbols-outlined">warning</span>
        <p>Mangler påkrevd dokumentasjon for universell utforming og tilgjengelighetserklæring.</p>
      </div>
    `;
  }
  return "";
}

function resolveOptions(field) {
  if (field.options?.length) {
    return field.options.map((option) =>
      typeof option === "string" ? { label: option, value: option } : { label: option.label, value: option.value }
    );
  }
  if (field.observedValues?.length) {
    return field.observedValues.map((value) => ({ label: value, value }));
  }
  return [];
}

function getSettingsCatalogValues(settingsKey) {
  const values = Array.isArray(appState.settings?.[settingsKey]) ? appState.settings[settingsKey] : [];
  return values
    .map(normalizeSettingsCatalogEntry)
    .filter((entry) => entry.name);
}

function getSettingsCollectionConfig(collectionKey) {
  return SETTINGS_COLLECTION_CONFIG[collectionKey] ?? null;
}

function normalizeSettingsCatalogEntry(entry) {
  if (typeof entry === "string") {
    return {
      name: entry,
      description: ""
    };
  }

  return {
    name: String(entry?.name ?? "").trim(),
    description: String(entry?.description ?? "").trim()
  };
}

function storeSettingsCatalogValues(settingsKey, values) {
  appState.settings[settingsKey] = values
    .map(normalizeSettingsCatalogEntry)
    .filter((entry) => entry.name)
    .sort((left, right) => left.name.localeCompare(right.name, "nb"));
}

function getSettingsCatalogEntry(settingsKey, name) {
  return getSettingsCatalogValues(settingsKey).find((entry) => entry.name === name) ?? null;
}

function renderCatalogItemValue(name, description) {
  const label = `<span class="reference-list__value">${escapeHtml(name)}</span>`;
  if (!description) {
    return label;
  }

  return `
    <span class="reference-list__hover-target" tabindex="0">
      ${label}
      <span class="reference-list__tooltip">${escapeHtml(description)}</span>
    </span>
  `;
}

function inferIcon(sectionKey) {
  const map = {
    general_information: "info",
    organization_information: "domain",
    privacy_statement: "description",
    summary: "summarize",
    print_view: "print",
    datasets: "database",
    applications: "apps",
    links: "link",
    labels: "sell"
  };
  return map[sectionKey] ?? "widgets";
}

function inferActionIcon(label) {
  const lower = String(label).toLowerCase();
  if (lower.includes("send inn")) return "send";
  if (lower.includes("legg til")) return "add";
  if (lower.includes("last opp")) return "upload";
  if (lower.includes("slett")) return "delete";
  if (lower.includes("rediger")) return "edit";
  if (lower.includes("opprett")) return "add_circle";
  return "bolt";
}

function shouldHideAction(label) {
  return String(label).toLowerCase().includes("send inn til felles kommunalt applikasjonsregister");
}

async function handleGenericAction(actionButton) {
  const label = actionButton.getAttribute("data-action-label") ?? "";
  const recordKey = actionButton.getAttribute("data-record-key");
  const sectionKey = actionButton.getAttribute("data-section-key");
  const collectionKey = actionButton.getAttribute("data-collection-key");
  const lower = label.toLowerCase();

  if (shouldOpenCollectionModal({ label, collectionKey, sectionKey })) {
    openCollectionModal({ recordKey, sectionKey, collectionKey, label });
    return true;
  }

  if (collectionKey && recordKey) {
    await appendDraftCollectionItem(recordKey, collectionKey, label);
    return true;
  }

  if (recordKey === "roles" && sectionKey === "labels") {
    openCollectionModal({ recordKey: "roles", sectionKey, collectionKey: "labels", label });
    return true;
  }

  if (lower.includes("rediger")) {
    touchRecord(recordKey);
    setNotice("Redigeringsmodus er aktivert i prototypen.");
    renderApp();
    return true;
  }

  if (lower.includes("visualiser")) {
    setNotice("Visualisering er koblet til som handling, men visningen er ikke bygget ut ennå.");
    renderApp();
    return true;
  }

  if (lower.includes("skriv ut")) {
    window.print();
    return true;
  }

  if (lower.includes("lagre") || lower.includes("publiser")) {
    touchRecord(recordKey);
    setNotice(`${label} er gjennomført i prototypen.`);
    await persistAppData();
    renderApp();
    return true;
  }

  if (lower.includes("logg") || lower.includes("eksport")) {
    setNotice(`${label} er tilgjengelig som prototypehandling.`);
    renderApp();
    return true;
  }

  if (lower.includes("last opp")) {
    setNotice("Opplasting er koblet til i prototypen.");
    renderApp();
    return true;
  }

  if (lower.includes("opprett") || lower.includes("ny ") || lower.includes("legg til")) {
    setNotice(`Handling utført: ${label}.`);
    renderApp();
    return true;
  }

  return false;
}

function shouldOpenCollectionModal({ label, collectionKey, sectionKey }) {
  const normalizedLabel = label.trim().toLowerCase();
  if (collectionKey && /^(ny|legg til|opprett|last opp)/i.test(normalizedLabel)) {
    return true;
  }
  return sectionKey === "labels" && /^(opprett|ny|legg til)/i.test(normalizedLabel);
}

function openCollectionModal({ recordKey, sectionKey, collectionKey, label }) {
  const record = appState.records[recordKey];
  if (!record) {
    setNotice("Fant ikke data for dialogen.");
    renderApp();
    return;
  }

  const section = findStructureSection(recordKey, sectionKey);
  const resolvedCollectionKey = collectionKey ?? (sectionKey === "labels" ? "labels" : null);
  const collection = section?.collections?.find((candidate) => candidate.key === resolvedCollectionKey) ?? null;
  const existingItems = Array.isArray(record.collectionValues?.[resolvedCollectionKey])
    ? record.collectionValues[resolvedCollectionKey]
    : [];
  const customModal = buildCustomCollectionModal({
    recordKey,
    sectionKey,
    collectionKey: resolvedCollectionKey,
    label,
    section,
    collection,
    existingItems
  });

  if (customModal) {
    appState.modal = customModal;
    renderApp();
    return;
  }

  if (recordKey === "application" && getSettingsCollectionConfig(resolvedCollectionKey)) {
    renderApp();
    return;
  }

  const sample = existingItems.find((item) => item && typeof item === "object" && !Array.isArray(item)) ?? null;
  const nextIndex = existingItems.length + 1;
  const fieldKeys = resolveModalFieldKeys(section, collection, sample, resolvedCollectionKey);
  const fields = fieldKeys.map((key) => buildModalField(key, sample?.[key], nextIndex, section));
  const values = Object.fromEntries(
    fields.map((field) => [field.key, field.type === "date" ? getTodayIsoDate() : ""])
  );

  appState.modal = {
    mode: "collection-create",
    recordKey,
    sectionKey,
    collectionKey: resolvedCollectionKey,
    title: label,
    description:
      section?.helpText ??
      section?.emptyState ??
      collection?.emptyState ??
      "Registrer nye opplysninger og lagre dem direkte i oversikten.",
    submitLabel: "Lagre",
    fields,
    values
  };

  renderApp();
}

function buildCustomCollectionModal({ recordKey, sectionKey, collectionKey, label, section, collection, existingItems }) {
  if (recordKey === "application" && collectionKey === "application_dataset_relations") {
    const datasetOptions = appState.datasetItems.map((item) => ({ value: item.name, label: item.name }));
    return {
      mode: "dataset-relation-create",
      recordKey,
      sectionKey,
      collectionKey,
      title: label,
      description: "Velg et eksisterende datasett fra datasettregisteret og angi rollen applikasjonen har mot datasettet.",
      submitLabel: "Legg til datasett",
      fields: [
        {
          key: "Navn",
          label: "Datasett",
          type: "select",
          options: datasetOptions,
          fullWidth: true
        },
        {
          key: "Rolle",
          label: "Rolle",
          type: "text",
          placeholder: "For eksempel Forvalter, Innsyn eller Kilde"
        }
      ],
      values: {
        Navn: datasetOptions[0]?.value ?? "",
        Rolle: ""
      }
    };
  }

  if (recordKey === "application" && getSettingsCollectionConfig(collectionKey)) {
    const config = getSettingsCollectionConfig(collectionKey);
    const options = getSettingsCatalogValues(config.settingsKey)
      .filter((entry) => !existingItems.includes(entry.name))
      .map((entry) => ({ value: entry.name, label: entry.name }));

    if (!options.length) {
      setNotice(`Alle tilgjengelige ${config.singularLabel}er er allerede valgt.`);
      return null;
    }

    return {
      mode: "settings-backed-selection",
      recordKey,
      sectionKey,
      collectionKey,
      settingsKey: config.settingsKey,
      title: collection?.label ?? label,
      description: `Velg en eksisterende ${config.singularLabel} fra Innstillinger. Nye verdier opprettes under Innstillinger.`,
      submitLabel: "Legg til",
      fields: [
        {
          key: "selectedValue",
          label: collection?.label ?? label,
          type: "select",
          options: [{ value: "", label: `Velg ${config.singularLabel}` }, ...options],
          fullWidth: true
        }
      ],
      values: {
        selectedValue: ""
      }
    };
  }

  return null;
}

function resolveModalFieldKeys(section, collection, sample, collectionKey) {
  if (collectionKey === "labels") {
    const labelField = section?.fields?.[0];
    return [labelField?.key ?? "label_name"];
  }
  if (collection?.columns?.length) {
    return collection.columns;
  }
  if (sample && typeof sample === "object") {
    return Object.keys(sample);
  }
  return ["Navn"];
}

function buildModalField(key, sampleValue, index, section) {
  const normalized = normalizeKey(key);
  const isDateField =
    normalized.includes("dato") ||
    normalized.includes("oppdatert") ||
    normalized === "fra" ||
    (typeof sampleValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sampleValue));
  const isEmailField = normalized.includes("epost") || normalized.includes("email");
  const isLongTextField = normalized.includes("beskrivelse") || normalized.includes("kommentar");

  return {
    key,
    label: resolveModalFieldLabel(key, section),
    type: isLongTextField ? "textarea" : isDateField ? "date" : isEmailField ? "email" : "text",
    placeholder: resolveModalPlaceholder(key, index),
    fullWidth: isLongTextField
  };
}

function resolveModalFieldLabel(key, section) {
  const sectionField = section?.fields?.find((field) => field.key === key);
  return sectionField?.label ?? key;
}

function resolveModalPlaceholder(key, index) {
  const normalized = normalizeKey(key);
  if (normalized.includes("navn")) return `Skriv inn navn ${index}`;
  if (normalized.includes("lenke")) return "https://eksempel.no eller dokumentnavn";
  if (normalized.includes("epost") || normalized.includes("email")) return "navn@organisasjon.no";
  if (normalized.includes("beskrivelse")) return "Legg til en kort beskrivelse";
  if (normalized.includes("dato") || normalized === "fra" || normalized === "til") return "Velg dato";
  if (normalized.includes("fil")) return `filnavn_${index}.pdf`;
  return "Fyll inn verdi";
}

async function submitModal() {
  const modal = appState.modal;
  if (!modal) {
    return;
  }

  if (modal.mode === "settings-catalog-create") {
    const rawName = String(modal.values?.name ?? "").trim();
    const description = String(modal.values?.description ?? "").trim();
    if (!rawName) {
      setNotice("Skriv inn en verdi før du lagrer.");
      renderApp();
      return;
    }

    const existingValues = getSettingsCatalogValues(modal.settingsKey);
    if (existingValues.some((entry) => entry.name.toLowerCase() === rawName.toLowerCase())) {
      setNotice("Verdien finnes allerede i katalogen.");
      renderApp();
      return;
    }

    storeSettingsCatalogValues(modal.settingsKey, [...existingValues, { name: rawName, description }]);
    setNotice(`${modal.title} er oppdatert.`);
    appState.modal = null;
    await persistAppData();
    renderApp();
    return;
  }

  if (modal.mode === "settings-catalog-edit") {
    const rawName = String(modal.values?.name ?? "").trim();
    const description = String(modal.values?.description ?? "").trim();
    if (!rawName) {
      setNotice("Skriv inn et navn før du lagrer.");
      renderApp();
      return;
    }

    const existingValues = getSettingsCatalogValues(modal.settingsKey);
    if (
      existingValues.some(
        (entry) =>
          entry.name.toLowerCase() === rawName.toLowerCase() &&
          entry.name.toLowerCase() !== String(modal.originalValue ?? "").toLowerCase()
      )
    ) {
      setNotice("Det finnes allerede en verdi med dette navnet.");
      renderApp();
      return;
    }

    storeSettingsCatalogValues(
      modal.settingsKey,
      existingValues.map((entry) =>
        entry.name === modal.originalValue
          ? {
              name: rawName,
              description
            }
          : entry
      )
    );

    if (rawName !== modal.originalValue) {
      for (const record of Object.values(appState.records)) {
        for (const [collectionKey, config] of Object.entries(SETTINGS_COLLECTION_CONFIG)) {
          if (config.settingsKey !== modal.settingsKey) {
            continue;
          }
          if (Array.isArray(record.collectionValues?.[collectionKey])) {
            record.collectionValues[collectionKey] = record.collectionValues[collectionKey].map((item) =>
              item === modal.originalValue ? rawName : item
            );
          }
        }
      }
    }

    setNotice(`${modal.title} er oppdatert.`);
    appState.modal = null;
    await persistAppData();
    renderApp();
    return;
  }

  if (modal.mode === "organization-structure-create" || modal.mode === "organization-structure-edit") {
    await saveOrganizationStructureModal(modal);
    return;
  }

  if (modal.mode === "settings-backed-selection") {
    const record = appState.records[modal.recordKey];
    if (!record) {
      closeModal();
      return;
    }

    const selectedValue = String(modal.values?.selectedValue ?? "").trim();
    if (!selectedValue) {
      setNotice("Velg en verdi fra listen før du lagrer.");
      renderApp();
      return;
    }

    const existingItems = Array.isArray(record.collectionValues?.[modal.collectionKey])
      ? [...record.collectionValues[modal.collectionKey]]
      : [];

    if (existingItems.includes(selectedValue)) {
      setNotice("Verdien er allerede valgt.");
      renderApp();
      return;
    }

    record.collectionValues[modal.collectionKey] = [...existingItems, selectedValue];
    touchRecord(modal.recordKey);
    setNotice(`${modal.title} er lagt til.`);
    appState.modal = null;
    await persistAppData();
    renderApp();
    return;
  }

  if (modal.mode === "dataset-relation-create") {
    const record = appState.records[modal.recordKey];
    if (!record) {
      closeModal();
      return;
    }

    const existingItems = Array.isArray(record.collectionValues?.[modal.collectionKey])
      ? [...record.collectionValues[modal.collectionKey]]
      : [];
    const selectedDataset = String(modal.values?.Navn ?? "").trim();
    if (!selectedDataset) {
      setNotice("Velg et datasett fra listen før du lagrer.");
      renderApp();
      return;
    }

    record.collectionValues[modal.collectionKey] = [
      ...existingItems,
      {
        Navn: selectedDataset,
        Rolle: String(modal.values?.Rolle ?? "").trim() || "Relasjon"
      }
    ];
    touchRecord(modal.recordKey);
    setNotice(`${modal.title} er lagt til.`);
    appState.modal = null;
    await persistAppData();
    renderApp();
    return;
  }

  if (modal.mode === "collection-create") {
    const record = appState.records[modal.recordKey];
    if (!record) {
      closeModal();
      return;
    }

    const existingItems = Array.isArray(record.collectionValues?.[modal.collectionKey])
      ? [...record.collectionValues[modal.collectionKey]]
      : [];
    const index = existingItems.length + 1;
    const isStringCollection =
      modal.collectionKey === "labels" ||
      typeof existingItems[0] === "string" ||
      modal.fields.length === 1;

    const nextItem = isStringCollection
      ? String(modal.values?.[modal.fields[0].key] ?? "").trim() ||
        resolveDraftStringValue(modal.collectionKey, modal.title ?? "Nytt element", index)
      : Object.fromEntries(
          modal.fields.map((field) => {
            const rawValue = modal.values?.[field.key];
            const normalizedValue = String(rawValue ?? "").trim();
            return [
              field.key,
              normalizedValue || resolveDraftObjectValue(field.key, modal.title ?? "Nytt element", index)
            ];
          })
        );

    record.collectionValues[modal.collectionKey] = [...existingItems, nextItem];
    if (modal.collectionKey === "labels") {
      record.fieldValues.label_name = "";
    }
    touchRecord(modal.recordKey);
    setNotice(`${modal.title} er lagt til.`);
    appState.modal = null;
    await persistAppData();
    renderApp();
    return;
  }

  appState.modal = null;
  renderApp();
}

function closeModal() {
  appState.modal = null;
  renderApp();
}

function openSettingsCatalogModal(settingsKey) {
  const config = Object.values(SETTINGS_COLLECTION_CONFIG).find((item) => item.settingsKey === settingsKey);
  if (!config) {
    setNotice("Fant ikke kataloginnstillingen.");
    renderApp();
    return;
  }

  appState.modal = {
    mode: "settings-catalog-create",
    settingsKey,
    title: `Legg til ${config.singularLabel}`,
    description: `Opprett en ny ${config.singularLabel} som kan gjenbrukes i applikasjonsarkitektur.`,
    submitLabel: "Lagre",
    fields: [
      {
        key: "name",
        label: "Navn",
        type: "text",
        placeholder: `Skriv inn ${config.singularLabel}`
      },
      {
        key: "description",
        label: "Beskrivelse",
        type: "textarea",
        rows: 5,
        placeholder: `Kort forklaring av ${config.singularLabel}`,
        fullWidth: true
      }
    ],
    values: {
      name: "",
      description: ""
    }
  };

  renderApp();
}

function openEditSettingsCatalogModal(settingsKey, value) {
  const config = Object.values(SETTINGS_COLLECTION_CONFIG).find((item) => item.settingsKey === settingsKey);
  const entry = getSettingsCatalogEntry(settingsKey, value);
  if (!config || !entry) {
    setNotice("Fant ikke verdien som skulle redigeres.");
    renderApp();
    return;
  }

  appState.modal = {
    mode: "settings-catalog-edit",
    settingsKey,
    originalValue: entry.name,
    title: `Rediger ${config.singularLabel}`,
    description: `Oppdater navn og beskrivelse for ${config.singularLabel}.`,
    submitLabel: "Lagre endringer",
    fields: [
      {
        key: "name",
        label: "Navn",
        type: "text",
        placeholder: `Skriv inn ${config.singularLabel}`
      },
      {
        key: "description",
        label: "Beskrivelse",
        type: "textarea",
        rows: 5,
        placeholder: `Kort forklaring av ${config.singularLabel}`,
        fullWidth: true
      }
    ],
    values: {
      name: entry.name,
      description: entry.description
    }
  };

  renderApp();
}

async function removeSettingsCatalogValue(settingsKey, value) {
  const existingValues = getSettingsCatalogValues(settingsKey);
  storeSettingsCatalogValues(
    settingsKey,
    existingValues.filter((entry) => entry.name !== value)
  );

  for (const record of Object.values(appState.records)) {
    for (const [collectionKey, config] of Object.entries(SETTINGS_COLLECTION_CONFIG)) {
      if (config.settingsKey !== settingsKey) {
        continue;
      }
      if (Array.isArray(record.collectionValues?.[collectionKey])) {
        record.collectionValues[collectionKey] = record.collectionValues[collectionKey].filter((item) => item !== value);
      }
    }
  }

  setNotice(`${value} er fjernet fra katalogen.`);
  await persistAppData();
  renderApp();
}

async function removeCollectionStringValue(recordKey, collectionKey, value) {
  const record = appState.records[recordKey];
  if (!record || !Array.isArray(record.collectionValues?.[collectionKey])) {
    return;
  }

  record.collectionValues[collectionKey] = record.collectionValues[collectionKey].filter((item) => item !== value);
  touchRecord(recordKey);
  setNotice(`${value} er fjernet.`);
  await persistAppData();
  renderApp();
}

async function appendDraftCollectionItem(recordKey, collectionKey, label) {
  const record = appState.records[recordKey];
  if (!record) {
    setNotice("Fant ikke måldata for handlingen.");
    renderApp();
    return;
  }

  const currentItems = Array.isArray(record.collectionValues?.[collectionKey]) ? [...record.collectionValues[collectionKey]] : [];
  const nextItem = buildDraftCollectionValue(record, collectionKey, currentItems, label);
  record.collectionValues[collectionKey] = [...currentItems, nextItem];

  if (collectionKey === "labels") {
    record.fieldValues.label_name = "";
  }

  touchRecord(recordKey);
  setNotice(`${label} er utført.`);
  await persistAppData();
  renderApp();
}

function buildDraftCollectionValue(record, collectionKey, items, label) {
  const index = items.length + 1;
  const sample = items[0];

  if (collectionKey === "labels") {
    return record.fieldValues?.label_name?.trim() || `Ny merkelapp ${index}`;
  }

  if (collectionKey === "links") {
    return {
      title: `Ny lenke ${index}`,
      description: "Beskrivelse må fylles ut.",
      icon: "link"
    };
  }

  if (collectionKey === "privacy_statements") {
    return {
      Fil: `personvernerklaering_${index}.pdf`,
      "Sist oppdatert": getTodayIsoDate(),
      Type: "Opplastet fil"
    };
  }

  if (collectionKey === "processor_agreements") {
    return {
      "Leverandør / Part": `Ny leverandør ${index}`,
      "Dato inngått": getTodayIsoDate(),
      "Sist revidert": getTodayIsoDate(),
      Dokument: `vedlegg_${index}.pdf`
    };
  }

  if (typeof sample === "string" || collectionKey === "information_security_items") {
    return resolveDraftStringValue(collectionKey, label, index);
  }

  if (sample && typeof sample === "object") {
    return Object.fromEntries(
      Object.keys(sample).map((key) => [key, resolveDraftObjectValue(key, label, index)])
    );
  }

  return resolveDraftStringValue(collectionKey, label, index);
}

function resolveDraftStringValue(collectionKey, label, index) {
  if (collectionKey.includes("topic")) {
    return `Nytt tema ${index}`;
  }
  if (collectionKey.includes("security")) {
    return `Kontrollpunkt ${index}`;
  }
  return `${label.replace(/^legg til\s*/i, "").replace(/^ny\s*/i, "").replace(/^opprett\s*/i, "").trim() || "Nytt element"} ${index}`.trim();
}

function resolveDraftObjectValue(key, label, index) {
  const normalized = normalizeKey(key);
  if (normalized.includes("epost")) return `kontakt${index}@example.no`;
  if (normalized.includes("dato") || normalized.includes("oppdatert") || normalized === "fra") return getTodayIsoDate();
  if (normalized === "til") return "Aktiv";
  if (normalized.includes("fil") || normalized.includes("dokument")) return `vedlegg_${index}.pdf`;
  if (normalized.includes("versjon")) return "1.0";
  if (normalized.includes("rolle")) return "Ny relasjon";
  if (normalized.includes("status")) return "Under vurdering";
  if (normalized.includes("formal")) return `Formål ${index}`;
  if (normalized.includes("beskrivelse") || normalized.includes("kommentar")) return `Registrert fra ${label.toLowerCase()}.`;
  if (normalized.includes("navn") || normalized.includes("leverandrpart")) return `Ny registrering ${index}`;
  return `Verdi ${index}`;
}

function setNotice(message) {
  appState.notice = message;
  if (noticeTimeoutId) {
    window.clearTimeout(noticeTimeoutId);
  }
  noticeTimeoutId = window.setTimeout(() => {
    appState.notice = "";
    noticeTimeoutId = null;
    renderApp();
  }, 4000);
}

function touchRecord(recordKey) {
  if (!recordKey || !appState.records[recordKey]) {
    return;
  }
  appState.records[recordKey].meta.lastUpdated = getTodayIsoDate();
  appState.records[recordKey].meta.lastModifiedBy = "SystemKontroll";
  syncCurrentRecordField(recordKey, "__meta_lastUpdated", getTodayIsoDate());
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function syncCurrentRecordField(recordKey, fieldKey, value) {
  const current = resolveRoute(location.hash || "#/applications");
  const requestedId = current.query.get("id");
  if (!requestedId) {
    return;
  }

  const syncConfig = {
    application: {
      listKey: "applicationItems",
      map: {
        name: "name",
        version: "version",
        vendor: "vendor",
        criticality: "criticality",
        system_owner: "systemOwner",
        __meta_lastUpdated: "lastUpdated"
      }
    },
    dataset: {
      listKey: "datasetItems",
      map: {
        name: "name",
        description: "description",
        purpose: "purpose",
        hosting_type: "hostingType",
        has_personal_data: "hasPersonalData",
        has_sensitive_personal_data: "hasSensitivePersonalData",
        __meta_lastUpdated: "lastUpdated"
      }
    },
    controller_protocol: {
      listKey: "controllerProtocolItems",
      map: {
        name: "name",
        controller: "controller",
        __meta_lastUpdated: "lastUpdated"
      }
    },
    processor_protocol: {
      listKey: "processorProtocolItems",
      map: {
        name: "name",
        processor: "processor",
        __meta_lastUpdated: "lastUpdated"
      }
    }
  }[recordKey];

  if (!syncConfig) {
    return;
  }

  const property = syncConfig.map[fieldKey];
  if (!property) {
    return;
  }

  appState[syncConfig.listKey] = appState[syncConfig.listKey].map((item) =>
    item.id === requestedId
      ? {
          ...item,
          [property]: value
        }
      : item
  );
}

function formatValue(value) {
  if (!hasMeaningfulValue(value)) {
    return "Ikke registrert";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "boolean") {
    return value ? "Ja" : "Nei";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function formatDate(value) {
  if (!value) {
    return "Ikke registrert";
  }
  const [year, month, day] = String(value).split("-");
  if (year && month && day) {
    return `${day}.${month}.${year}`;
  }
  return String(value);
}

function normalizeKey(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findStructureSection(recordKey, sectionKey) {
  const structure = model?.structures?.[recordKey];
  if (!structure) {
    return null;
  }

  if (structure.sections?.length) {
    const directMatch = structure.sections.find((section) => section.key === sectionKey);
    if (directMatch) {
      return directMatch;
    }
  }

  for (const tab of structure.tabs ?? []) {
    const match = tab.sections?.find((section) => section.key === sectionKey);
    if (match) {
      return match;
    }
  }

  return null;
}

function hasMeaningfulValue(value) {
  return !(value == null || value === "" || (Array.isArray(value) && value.length === 0));
}

function renderSegmentOption(label, selected) {
  return `<button class="segmented-button ${selected ? "is-selected" : ""}" type="button">${escapeHtml(label)}</button>`;
}

async function handleClick(event) {
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    const actionId = actionButton.getAttribute("data-action");
    if (actionId === "close-modal") {
      closeModal();
      return;
    }
    if (actionId === "submit-modal") {
      await submitModal();
      return;
    }
    if (actionId === "open-settings-catalog-modal") {
      openSettingsCatalogModal(actionButton.getAttribute("data-settings-key"));
      return;
    }
    if (actionId === "delete-settings-catalog-item") {
      await removeSettingsCatalogValue(
        actionButton.getAttribute("data-settings-key"),
        actionButton.getAttribute("data-settings-value")
      );
      return;
    }
    if (actionId === "edit-settings-catalog-item") {
      openEditSettingsCatalogModal(
        actionButton.getAttribute("data-settings-key"),
        actionButton.getAttribute("data-settings-value")
      );
      return;
    }
    if (actionId === "select-organization-structure-item") {
      const level = actionButton.getAttribute("data-structure-level");
      if (level === "serviceArea") {
        appState.organizationSelection = {
          activeLevel: "serviceArea",
          serviceAreaIndex: Number(actionButton.getAttribute("data-service-area-index")),
          organizationIndex: -1,
          departmentIndex: -1
        };
      }
      if (level === "organization") {
        appState.organizationSelection = {
          activeLevel: "organization",
          serviceAreaIndex: Number(actionButton.getAttribute("data-service-area-index")),
          organizationIndex: Number(actionButton.getAttribute("data-organization-index")),
          departmentIndex: -1
        };
      }
      if (level === "department") {
        appState.organizationSelection = {
          activeLevel: "department",
          serviceAreaIndex: Number(actionButton.getAttribute("data-service-area-index")),
          organizationIndex: Number(actionButton.getAttribute("data-organization-index")),
          departmentIndex: Number(actionButton.getAttribute("data-department-index"))
        };
      }
      renderApp();
      return;
    }
    if (actionId === "open-organization-structure-modal") {
      openOrganizationStructureModal({
        mode: actionButton.getAttribute("data-structure-mode"),
        level: actionButton.getAttribute("data-structure-level"),
        serviceAreaIndex: Number(actionButton.getAttribute("data-service-area-index")),
        organizationIndex: Number(actionButton.getAttribute("data-organization-index")),
        departmentIndex: Number(actionButton.getAttribute("data-department-index"))
      });
      return;
    }
    if (actionId === "delete-organization-structure-item") {
      await deleteOrganizationStructureItem(
        actionButton.getAttribute("data-structure-level"),
        Number(actionButton.getAttribute("data-service-area-index")),
        Number(actionButton.getAttribute("data-organization-index")),
        Number(actionButton.getAttribute("data-department-index"))
      );
      return;
    }
    if (actionId === "open-settings-backed-modal") {
      openCollectionModal({
        recordKey: actionButton.getAttribute("data-record-key"),
        sectionKey: actionButton.getAttribute("data-section-key"),
        collectionKey: actionButton.getAttribute("data-collection-key"),
        label: "Legg til"
      });
      return;
    }
    if (actionId === "delete-collection-string") {
      await removeCollectionStringValue(
        actionButton.getAttribute("data-record-key"),
        actionButton.getAttribute("data-collection-key"),
        actionButton.getAttribute("data-collection-value")
      );
      return;
    }
    if (actionId === "add-application") {
      const newItem = createNewApplicationItem();
      appState.applicationItems = [newItem, ...appState.applicationItems];
      await persistAppData();
      location.hash = `#/applications/detail?id=${encodeURIComponent(newItem.id)}`;
      return;
    }
    if (actionId === "add-dataset") {
      const newItem = createNewDatasetItem();
      appState.datasetItems = [newItem, ...appState.datasetItems];
      setNotice(`Opprettet ${newItem.name}.`);
      await persistAppData();
      location.hash = `#/datasets/barnevern-datasett?id=${encodeURIComponent(newItem.id)}`;
      return;
    }
    if (actionId === "add-controller-protocol") {
      const newItem = createNewControllerProtocolItem();
      appState.controllerProtocolItems = [newItem, ...appState.controllerProtocolItems];
      await persistAppData();
      location.hash = `#/controller-protocol/detail?id=${encodeURIComponent(newItem.id)}`;
      return;
    }
    if (actionId === "add-processor-protocol") {
      const newItem = createNewProcessorProtocolItem();
      appState.processorProtocolItems = [newItem, ...appState.processorProtocolItems];
      await persistAppData();
      location.hash = `#/processor-protocol/detail?id=${encodeURIComponent(newItem.id)}`;
      return;
    }
    if (actionId === "delete-application") {
      const applicationId = actionButton.getAttribute("data-application-id");
      appState.applicationItems = appState.applicationItems.filter((item) => item.id !== applicationId);
      await persistAppData();
      renderApp();
      return;
    }
    if (actionId === "delete-controller-protocol") {
      const protocolId = actionButton.getAttribute("data-controller-protocol-id");
      appState.controllerProtocolItems = appState.controllerProtocolItems.filter((item) => item.id !== protocolId);
      await persistAppData();
      renderApp();
      return;
    }
    if (actionId === "delete-processor-protocol") {
      const protocolId = actionButton.getAttribute("data-processor-protocol-id");
      appState.processorProtocolItems = appState.processorProtocolItems.filter((item) => item.id !== protocolId);
      await persistAppData();
      renderApp();
      return;
    }
    if (actionId === "add-infrastructure") {
      setNotice("Nytt infrastrukturelement er registrert som kladd i prototypen.");
      renderApp();
      return;
    }
    if (actionId === "add-service") {
      setNotice("Ny tjeneste er registrert som kladd i prototypen.");
      renderApp();
      return;
    }
    if (actionId === "generic-ui-action") {
      if (await handleGenericAction(actionButton)) {
        return;
      }
    }
  }

  if (appState.modal && event.target.classList.contains("modal-backdrop")) {
    closeModal();
    return;
  }

  const tabButton = event.target.closest("[data-tab-key]");
  if (tabButton) {
    const route = tabButton.getAttribute("data-route");
    const tabKey = tabButton.getAttribute("data-tab-key");
    appState.activeTabs[route] = tabKey;
    location.hash = `${route}?tab=${tabKey}`;
    return;
  }

  const filterButton = event.target.closest("[data-filter-key]");
  if (filterButton) {
    appState.datasetFilters[filterButton.getAttribute("data-filter-key")] = filterButton.getAttribute("data-filter-value");
    renderApp();
  }
}

function handleInput(event) {
  const modalField = event.target.closest("[data-modal-field]");
  if (modalField && appState.modal) {
    const fieldKey = modalField.getAttribute("data-modal-field");
    appState.modal.values[fieldKey] = modalField.value;
    return;
  }

  const reviewScoreField = event.target.closest("[data-review-score]");
  if (reviewScoreField) {
    const [recordKey, criterionKey] = (reviewScoreField.getAttribute("data-review-score") ?? "").split(":");
    updateReviewCriterion(recordKey, criterionKey, { score: Number(reviewScoreField.value) });
    renderApp();
    return;
  }

  const reviewCommentField = event.target.closest("[data-review-comment]");
  if (reviewCommentField) {
    const [recordKey, criterionKey] = (reviewCommentField.getAttribute("data-review-comment") ?? "").split(":");
    updateReviewCriterion(recordKey, criterionKey, { comment: reviewCommentField.value });
    return;
  }

  const boundField = event.target.closest("[data-record-field]");
  if (boundField) {
    const [recordToken, fieldKey] = (boundField.getAttribute("data-record-field") ?? "").split(":");
    const currentScreen = resolveRoute(location.hash || "#/applications").screen;
    const recordKey = appState.records[recordToken] ? recordToken : currentScreen?.recordKey;
    if (recordKey && fieldKey && appState.records[recordKey]) {
      let value;
      if (boundField.type === "checkbox") {
        value = boundField.checked;
      } else if (boundField.type === "radio") {
        value = boundField.value === "true" ? true : boundField.value === "false" ? false : boundField.value;
      } else {
        value = boundField.value;
      }
      appState.records[recordKey].fieldValues[fieldKey] = value;
      syncCurrentRecordField(recordKey, fieldKey, value);
      if (boundField.type === "checkbox" || boundField.type === "radio" || boundField.tagName === "SELECT") {
        renderApp();
      }
    }
    return;
  }

  const input = event.target.closest("[data-filter-input='dataset-search']");
  if (input) {
    appState.datasetFilters.search = input.value;
    renderAppPreservingField(input, "[data-filter-input='dataset-search']");
    return;
  }

  const applicationInput = event.target.closest("[data-filter-input='application-search']");
  if (applicationInput) {
    appState.applicationFilters.search = applicationInput.value;
    renderAppPreservingField(applicationInput, "[data-filter-input='application-search']");
    return;
  }

  const controllerProtocolInput = event.target.closest("[data-filter-input='controller-protocol-search']");
  if (controllerProtocolInput) {
    appState.controllerProtocolFilters.search = controllerProtocolInput.value;
    renderAppPreservingField(controllerProtocolInput, "[data-filter-input='controller-protocol-search']");
    return;
  }

  const processorProtocolInput = event.target.closest("[data-filter-input='processor-protocol-search']");
  if (processorProtocolInput) {
    appState.processorProtocolFilters.search = processorProtocolInput.value;
    renderAppPreservingField(processorProtocolInput, "[data-filter-input='processor-protocol-search']");
  }
}

function updateReviewCriterion(recordKey, criterionKey, patch) {
  const record = appState.records[recordKey];
  if (!record) {
    return;
  }

  const existingItems = Array.isArray(record.collectionValues?.review_criteria)
    ? [...record.collectionValues.review_criteria]
    : [];
  const index = existingItems.findIndex((item) => item.key === criterionKey);
  const currentItem = index >= 0 ? existingItems[index] : { key: criterionKey, label: criterionKey, score: null, comment: "" };
  const nextItem = { ...currentItem, ...patch };

  if (index >= 0) {
    existingItems[index] = nextItem;
  } else {
    existingItems.push(nextItem);
  }

  record.collectionValues.review_criteria = existingItems;
  touchRecord(recordKey);
}

function renderNotFound() {
  return `
    <div class="error-state">
      <span class="material-symbols-outlined">explore_off</span>
      <p>Fant ikke siden du ba om.</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
