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

export default function App() {
  const currentUser = {
    name: "Ken Are Johnsen",
    role: "Organisasjonsadministrator"
  };
  const [bootstrap, setBootstrap] = useState(null);
  const [model, setModel] = useState(null);
  const [appState, setAppState] = useState(null);
  const [hash, setHash] = useState(readHash());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [searchState, setSearchState] = useState({});
  const [listFilters, setListFilters] = useState({
    datasets: { hosting: "all", privacy: "all" }
  });
  const [dialogState, setDialogState] = useState(null);
  const [selectedOrgNodeId, setSelectedOrgNodeId] = useState("");
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const { dispatchToast } = useToastController(toasterId);

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
      try {
        setIsLoading(true);
        const [bootstrapResponse, modelResponse, stateResponse] = await Promise.all([
          fetch("/api/bootstrap"),
          fetch("/generated/systemkontroll-model.json"),
          fetch("/api/state")
        ]);

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
  }, []);

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

  const routeInfo = useMemo(() => parseHash(hash), [hash]);
  const currentScreen = useMemo(() => {
    if (!bootstrap?.screenRegistry) {
      return null;
    }

    return resolveScreen(bootstrap.screenRegistry, routeInfo.routePath) ?? bootstrap.screenRegistry[0];
  }, [bootstrap, routeInfo.routePath]);

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

  async function handlePageAction(action) {
    if (!action) {
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

  function submitDialog() {
    if (!dialogState?.onSubmit) {
      return;
    }

    const missingRequiredField = dialogState.fields?.find((field) => field.required && !String(dialogState.draft?.[field.key] ?? "").trim());
    if (missingRequiredField) {
      showToast(`${missingRequiredField.label} må fylles ut.`, "error");
      return;
    }

    const result = dialogState.onSubmit(dialogState.draft);
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
    window.location.hash = href.startsWith("#") ? href : `#${href}`;
  }

  if (isLoading) {
    return (
      <FluentProvider theme={fluentTheme}>
        <div className="loadingShell">
          <Spinner size="huge" label="Laster SystemKontroll..." />
        </div>
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
            {NAV_BOTTOM_ITEMS.map((item) => (
              (() => {
                const Icon = bottomNavIcons[item.key] ?? SettingsRegular;
                return (
              <Button
                key={item.key}
                appearance="subtle"
                size="large"
                icon={<Icon />}
                className={`navButton ${currentScreen.navKey === item.key ? "isActive" : ""}`}
                onClick={() => {
                  if (item.key === "settings") {
                    navigateTo(item.href);
                  } else {
                    showToast(`${item.label} er ikke implementert ennå.`, "info");
                  }
                }}
              >
                {item.label}
              </Button>
                );
              })()
            ))}
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
                bootstrap={bootstrap}
                closeDialog={closeDialog}
                currentRecord={currentRecord}
                currentScreen={currentScreen}
                currentStructure={currentStructure}
                dialogState={dialogState}
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
      </div>
    </FluentProvider>
  );
}
