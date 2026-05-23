import React from "react";
import { createPortal } from "react-dom";
import {
  Badge,
  Body1,
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Divider,
  Dropdown,
  Field,
  Input,
  Option,
  Radio,
  RadioGroup,
  SearchBox,
  Tab,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tag,
  TagGroup,
  Text,
  Textarea,
  Title2,
  Title3,
  Tooltip,
} from "@fluentui/react-components";
import {
  AddRegular,
  AlertRegular,
  AppsRegular,
  ArchiveRegular,
  ArrowDownloadRegular,
  ArrowUploadRegular,
  BookRegular,
  BriefcaseRegular,
  BuildingPeopleRegular,
  BuildingRegular,
  CalendarRegular,
  ChatRegular,
  CheckmarkRegular,
  ChevronDownRegular,
  ChevronRightRegular,
  ClipboardRegular,
  CloudRegular,
  CodeRegular,
  DatabaseRegular,
  DeleteRegular,
  DesktopRegular,
  DocumentRegular,
  DocumentTextRegular,
  EditRegular,
  FolderRegular,
  GiftRegular,
  GlobeRegular,
  HeadphonesRegular,
  HomeRegular,
  InfoRegular,
  ImageRegular,
  LaptopRegular,
  LinkRegular,
  LocationRegular,
  MailRegular,
  MapRegular,
  MegaphoneRegular,
  NoteRegular,
  NotebookRegular,
  NewsRegular,
  OpenRegular,
  PeopleRegular,
  PersonRegular,
  PersonSupportRegular,
  PhoneRegular,
  QuestionRegular,
  QuestionCircleRegular,
  RenameRegular
  ,
  ReceiptRegular,
  ScanRegular,
  ServerRegular,
  ShieldRegular,
  SparkleRegular,
  StarRegular,
  TagRegular,
  TasksAppRegular,
  TextBoldRegular,
  TextBulletListLtrRegular,
  TextItalicRegular,
  TextNumberListLtrRegular,
  TextUnderlineRegular,
  ToolboxRegular,
  VehicleCarRegular,
  VideoRegular,
  WrenchRegular
} from "@fluentui/react-icons";
import {
  applyOrganizationNodeEdit,
  applyOrganizationRename,
  coerceRadioValue,
  createDepartmentRecord,
  createCatalogItemId,
  createOrganizationAreaRecord,
  createOrganizationRecord,
  datasetHostingLabel,
  datasetPrivacyLabel,
  detailRouteForEntity,
  filterInventoryItems,
  getEntityReferenceBlockers,
  getInventoryMetrics,
  inferColumnsFromRows,
  isFileReferenceValue,
  inventoryItemsForScreen,
  normalizeFileReferenceValue,
  ORGANIZATION_ROOT_NODE_ID,
  moveOrganizationNode,
  normalizeRadioValue,
  getFirstOrganizationNodeId,
  removeOrganizationNode,
  renderCollectionCell,
  resolveFileReferenceHref,
  resolveFileReferenceLabel,
  renderInventoryCells,
  resolveEditableRecord,
  resolveActiveTab,
  resolveApplicationReferenceLabel,
  resolveApplicationReferenceRecord,
  resolveApplicationReferenceRoute,
  resolveApplicationReferenceVersion,
  resolveDatasetReferenceLabel,
  resolveDatasetReferenceRecord,
  resolveDatasetReferenceRoute,
  resolveProcessingActivityReferenceLabel,
  resolveProcessingActivityReferencePurpose,
  resolveProcessingActivityReferenceRecord,
  resolveProcessingActivityReferenceRoute,
  resolveOrganizationNode,
  resolveFieldOptions,
  sidebarSectionLabel
} from "./utils.js";

const LINK_ICON_OPTIONS = [
  { value: "link", label: "Lenke", icon: LinkRegular },
  { value: "book", label: "Bok", icon: BookRegular },
  { value: "headphones", label: "Support", icon: HeadphonesRegular },
  { value: "globe", label: "Nettside", icon: GlobeRegular },
  { value: "document", label: "Dokument", icon: DocumentRegular },
  { value: "people", label: "Folk", icon: PeopleRegular },
  { value: "chat", label: "Dialog", icon: ChatRegular },
  { value: "phone", label: "Telefon", icon: PhoneRegular },
  { value: "home", label: "Hjem", icon: HomeRegular },
  { value: "apps", label: "Apper", icon: AppsRegular },
  { value: "info", label: "Info", icon: InfoRegular },
  { value: "question", label: "Hjelp", icon: QuestionCircleRegular },
  { value: "open", label: "Ekstern", icon: OpenRegular },
  { value: "mail", label: "E-post", icon: MailRegular },
  { value: "calendar", label: "Kalender", icon: CalendarRegular },
  { value: "video", label: "Video", icon: VideoRegular },
  { value: "image", label: "Bilde", icon: ImageRegular },
  { value: "folder", label: "Mappe", icon: FolderRegular },
  { value: "star", label: "Stjerne", icon: StarRegular },
  { value: "briefcase", label: "Arbeid", icon: BriefcaseRegular },
  { value: "building", label: "Bygg", icon: BuildingRegular },
  { value: "building_people", label: "Organisasjon", icon: BuildingPeopleRegular },
  { value: "cloud", label: "Sky", icon: CloudRegular },
  { value: "code", label: "Kode", icon: CodeRegular },
  { value: "document_text", label: "Tekstdokument", icon: DocumentTextRegular },
  { value: "notebook", label: "Notatbok", icon: NotebookRegular },
  { value: "note", label: "Notat", icon: NoteRegular },
  { value: "megaphone", label: "Melding", icon: MegaphoneRegular },
  { value: "location", label: "Lokasjon", icon: LocationRegular },
  { value: "map", label: "Kart", icon: MapRegular },
  { value: "person", label: "Person", icon: PersonRegular },
  { value: "person_support", label: "Brukerstotte", icon: PersonSupportRegular },
  { value: "shield", label: "Sikkerhet", icon: ShieldRegular },
  { value: "wrench", label: "Verktoy", icon: WrenchRegular },
  { value: "toolbox", label: "Verktoykasse", icon: ToolboxRegular },
  { value: "clipboard", label: "Utklippstavle", icon: ClipboardRegular },
  { value: "tasks", label: "Oppgaver", icon: TasksAppRegular },
  { value: "database", label: "Database", icon: DatabaseRegular },
  { value: "archive", label: "Arkiv", icon: ArchiveRegular },
  { value: "receipt", label: "Kvittering", icon: ReceiptRegular },
  { value: "tag", label: "Tagg", icon: TagRegular },
  { value: "news", label: "Nyhet", icon: NewsRegular },
  { value: "car", label: "Bil", icon: VehicleCarRegular },
  { value: "desktop", label: "Desktop", icon: DesktopRegular },
  { value: "laptop", label: "Laptop", icon: LaptopRegular },
  { value: "server", label: "Server", icon: ServerRegular },
  { value: "download", label: "Nedlasting", icon: ArrowDownloadRegular },
  { value: "upload", label: "Opplasting", icon: ArrowUploadRegular },
  { value: "scan", label: "Skann", icon: ScanRegular },
  { value: "sparkle", label: "Fremhev", icon: SparkleRegular },
  { value: "gift", label: "Gave", icon: GiftRegular },
  { value: "alert", label: "Varsel", icon: AlertRegular },
  { value: "question_simple", label: "Sporsmal", icon: QuestionRegular }
];

const TAG_COLOR_OPTIONS = [
  { value: "blue", label: "Blå", bg: "#dbeafe", border: "#93c5fd", fg: "#1d4ed8" },
  { value: "teal", label: "Petrol", bg: "#ccfbf1", border: "#5eead4", fg: "#0f766e" },
  { value: "green", label: "Grønn", bg: "#dcfce7", border: "#86efac", fg: "#15803d" },
  { value: "purple", label: "Lilla", bg: "#ede9fe", border: "#c4b5fd", fg: "#6d28d9" },
  { value: "pink", label: "Rosa", bg: "#fce7f3", border: "#f9a8d4", fg: "#be185d" },
  { value: "orange", label: "Oransje", bg: "#ffedd5", border: "#fdba74", fg: "#c2410c" },
  { value: "red", label: "Rød", bg: "#fee2e2", border: "#fca5a5", fg: "#b91c1c" },
  { value: "yellow", label: "Gul", bg: "#fef9c3", border: "#fde047", fg: "#a16207" },
  { value: "gray", label: "Grå", bg: "#e5e7eb", border: "#cbd5e1", fg: "#334155" }
];

function resolveTagColorValue(value) {
  const normalizedValue = String(value ?? "").trim().toLowerCase();
  return TAG_COLOR_OPTIONS.some((option) => option.value === normalizedValue) ? normalizedValue : "blue";
}

function resolveTagColorOption(value) {
  return TAG_COLOR_OPTIONS.find((option) => option.value === resolveTagColorValue(value)) ?? TAG_COLOR_OPTIONS[0];
}

function normalizeCatalogNameKey(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("nb");
}

function resolveTagChipStyle(colorValue) {
  const color = resolveTagColorOption(colorValue);
  return {
    "--chip-bg": color.bg,
    "--chip-border": color.border,
    "--chip-fg": color.fg,
    "--chip-selected-bg": color.fg,
    "--chip-selected-border": color.fg,
    "--chip-selected-fg": "#ffffff"
  };
}

function resolveLinkIconKey(value) {
  const normalizedValue = String(value ?? "").trim().toLowerCase();
  return LINK_ICON_OPTIONS.some((option) => option.value === normalizedValue) ? normalizedValue : "link";
}

function renderLinkIcon(iconKey) {
  const option = LINK_ICON_OPTIONS.find((item) => item.value === resolveLinkIconKey(iconKey)) ?? LINK_ICON_OPTIONS[0];
  const IconComponent = option.icon;
  return <IconComponent />;
}

function resolveIconPickerTheme(anchorElement) {
  if (typeof window === "undefined") {
    return {
      background: "#ffffff",
      borderColor: "#d9d9d9",
      shadow: "0 24px 56px rgba(15, 23, 42, 0.24)"
    };
  }

  const shell = anchorElement?.closest?.(".shell");
  const styles = window.getComputedStyle(shell ?? document.documentElement);
  return {
    background: styles.getPropertyValue("--surface-card").trim() || "#ffffff",
    borderColor: styles.getPropertyValue("--surface-border-strong").trim() || "#d9d9d9",
    shadow: "0 24px 56px rgba(15, 23, 42, 0.24)"
  };
}

function IconPickerField({
  dialogState,
  field,
  updateDialogField
}) {
  const expandedKey = `${field.key}__expanded`;
  const expanded = Boolean(dialogState.draft?.[expandedKey]);
  const selectedValue = resolveLinkIconKey(dialogState.draft?.[field.key]);
  const selectedOption = LINK_ICON_OPTIONS.find((option) => option.value === selectedValue) ?? LINK_ICON_OPTIONS[0];
  const SelectedIcon = selectedOption.icon;
  const triggerRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const [panelPosition, setPanelPosition] = React.useState(null);

  const closePanel = React.useCallback(() => {
    updateDialogField(expandedKey, false);
  }, [expandedKey, updateDialogField]);

  const updatePanelPosition = React.useCallback(() => {
    if (typeof window === "undefined" || !triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const theme = resolveIconPickerTheme(triggerRef.current);
    const panelWidth = Math.min(368, Math.max(280, window.innerWidth - 32));
    const estimatedHeight = panelRef.current?.offsetHeight || 286;
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const showAbove = spaceBelow < estimatedHeight && rect.top > estimatedHeight + 16;
    const preferredLeft = rect.left;
    const left = Math.max(16, Math.min(preferredLeft, window.innerWidth - panelWidth - 16));
    const top = showAbove
      ? Math.max(16, rect.top - estimatedHeight - gap)
      : Math.min(window.innerHeight - estimatedHeight - 16, rect.bottom + gap);

    setPanelPosition({
      left,
      top,
      width: panelWidth,
      background: theme.background,
      borderColor: theme.borderColor,
      boxShadow: theme.shadow
    });
  }, []);

  React.useEffect(() => {
    if (!expanded) {
      setPanelPosition(null);
      return undefined;
    }

    updatePanelPosition();

    function handlePointerDown(event) {
      const target = event.target;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      closePanel();
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        closePanel();
      }
    }

    function handleViewportChange() {
      updatePanelPosition();
    }

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closePanel, expanded, updatePanelPosition]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`dialogIconPickerTrigger ${expanded ? "isExpanded" : ""}`}
        aria-label={`Valgt symbol: ${selectedOption.label}`}
        onClick={() => updateDialogField(expandedKey, !expanded)}
      >
        <span className="dialogIconPickerTriggerMain">
          <span className="dialogIconPickerTriggerGlyph" aria-hidden="true">
            <SelectedIcon />
          </span>
        </span>
        <span className={`dialogIconPickerChevron ${expanded ? "isExpanded" : ""}`} aria-hidden="true">
          <ChevronDownRegular />
        </span>
      </button>
      {expanded && panelPosition && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              className="dialogIconPickerPortal"
              style={panelPosition}
            >
              <div className="dialogIconPickerPortalGrid">
                {LINK_ICON_OPTIONS.map((option) => {
                  const isSelected = selectedValue === option.value;
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`dialogIconOption ${isSelected ? "isSelected" : ""}`}
                      aria-label={option.label}
                      onClick={() => {
                        updateDialogField(field.key, option.value);
                        closePanel();
                      }}
                    >
                      <span className="dialogIconOptionGlyph" aria-hidden="true">
                        <IconComponent />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

function InlineTagColorTrigger({
  ariaLabel = "Velg farge",
  value,
  onChange
}) {
  const [expanded, setExpanded] = React.useState(false);
  const triggerRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const [panelPosition, setPanelPosition] = React.useState(null);
  const selectedOption = resolveTagColorOption(value);

  const closePanel = React.useCallback(() => {
    setExpanded(false);
  }, []);

  const updatePanelPosition = React.useCallback(() => {
    if (typeof window === "undefined" || !triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const portalHost =
      triggerRef.current.closest?.(".settingsTagCreatePortal, .editorDialogSurface") ?? document.body;
    const hostRect =
      portalHost && portalHost !== document.body
        ? portalHost.getBoundingClientRect()
        : null;
    const theme = resolveIconPickerTheme(portalHost ?? triggerRef.current);
    const panelWidth = Math.min(312, Math.max(208, panelRef.current?.offsetWidth || 248));
    const estimatedHeight = panelRef.current?.offsetHeight || 56;
    const gap = 6;

    if (hostRect) {
      const hostPadding = 12;
      const spaceBelow = hostRect.bottom - rect.bottom - hostPadding;
      const spaceAbove = rect.top - hostRect.top - hostPadding;
      const showAbove = spaceBelow < estimatedHeight && spaceAbove > estimatedHeight + gap;
      const preferredLeft = rect.right - panelWidth - hostRect.left;
      const left = Math.max(hostPadding, Math.min(preferredLeft, hostRect.width - panelWidth - hostPadding));
      const top = showAbove
        ? Math.max(hostPadding, rect.top - hostRect.top - estimatedHeight - gap)
        : Math.min(hostRect.height - estimatedHeight - hostPadding, rect.bottom - hostRect.top + gap);

      setPanelPosition({
        left,
        top,
        position: "absolute",
        portalHost,
        background: theme.background,
        borderColor: theme.borderColor,
        boxShadow: theme.shadow
      });
      return;
    }

    const viewportPadding = 16;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const showAbove = spaceBelow < estimatedHeight && rect.top > estimatedHeight + viewportPadding;
    const preferredLeft = rect.right - panelWidth;
    const left = Math.max(viewportPadding, Math.min(preferredLeft, window.innerWidth - panelWidth - viewportPadding));
    const top = showAbove
      ? Math.max(viewportPadding, rect.top - estimatedHeight - gap)
      : Math.min(window.innerHeight - estimatedHeight - viewportPadding, rect.bottom + gap);

    setPanelPosition({
      left,
      top,
      position: "fixed",
      portalHost: document.body,
      background: theme.background,
      borderColor: theme.borderColor,
      boxShadow: theme.shadow
    });
  }, []);

  const portalHost = panelPosition?.portalHost ?? (typeof document !== "undefined" ? document.body : null);
  const panelStyle = panelPosition
    ? {
        left: panelPosition.left,
        top: panelPosition.top,
        position: panelPosition.position,
        background: panelPosition.background,
        borderColor: panelPosition.borderColor,
        boxShadow: panelPosition.boxShadow
      }
    : null;

  React.useEffect(() => {
    if (!expanded) {
      setPanelPosition(null);
      return undefined;
    }

    updatePanelPosition();

    function handlePointerDown(event) {
      const target = event.target;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      closePanel();
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        closePanel();
      }
    }

    function handleViewportChange() {
      updatePanelPosition();
    }

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closePanel, expanded, updatePanelPosition]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`inlineTagColorTrigger ${expanded ? "isExpanded" : ""}`}
        aria-label={ariaLabel}
        title={selectedOption.label}
        style={{
          "--tag-color-bg": selectedOption.bg,
          "--tag-color-border": selectedOption.border,
          "--tag-color-fg": selectedOption.fg
        }}
        onClick={() => setExpanded((current) => !current)}
      >
      </button>
      {expanded && panelStyle && portalHost
        ? createPortal(
            <div
              ref={panelRef}
              className="inlineTagColorPortal"
              style={panelStyle}
            >
              <div className="inlineTagColorToolbar">
                {TAG_COLOR_OPTIONS.map((option) => {
                  const isSelected = resolveTagColorValue(value) === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`tagColorOption ${isSelected ? "isSelected" : ""}`}
                      aria-label={option.label}
                      title={option.label}
                      style={{
                        "--tag-color-bg": option.bg,
                        "--tag-color-border": option.border,
                        "--tag-color-fg": option.fg
                      }}
                      onClick={() => {
                        onChange(option.value);
                        closePanel();
                      }}
                    >
                      <span className="tagColorSwatch" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>,
            portalHost
          )
        : null}
    </>
  );
}

function formatFileSize(sizeBytes) {
  const normalizedSize = Number(sizeBytes ?? 0);
  if (!normalizedSize) {
    return "";
  }

  if (normalizedSize < 1024) {
    return `${normalizedSize} B`;
  }

  if (normalizedSize < 1024 * 1024) {
    return `${(normalizedSize / 1024).toFixed(1)} KB`;
  }

  return `${(normalizedSize / (1024 * 1024)).toFixed(1)} MB`;
}

function buildStoredFileReference(uploadedFile) {
  return normalizeFileReferenceValue({
    kind: "upload",
    fileId: String(uploadedFile?.id ?? "").trim(),
    name: String(uploadedFile?.name ?? "").trim(),
    mimeType: String(uploadedFile?.mimeType ?? "").trim(),
    sizeBytes: Number(uploadedFile?.sizeBytes ?? 0),
    createdAt: String(uploadedFile?.createdAt ?? "").trim(),
    downloadUrl: String(uploadedFile?.downloadUrl ?? "").trim()
  });
}

function createExternalFileReference(source) {
  return normalizeFileReferenceValue({
    kind: "external",
    source: String(source ?? "").trim()
  });
}

function isUrlReference(value) {
  return /^https?:\/\//i.test(String(value ?? "").trim());
}

function isCompactDialogHalfField(field) {
  const normalizedKey = String(field?.key ?? "").trim().toLowerCase();
  const normalizedLabel = String(field?.label ?? "").trim().toLowerCase();
  return [
    "dato inngått",
    "sist revidert"
  ].some((token) => normalizedKey.includes(token) || normalizedLabel.includes(token));
}

function getDialogFieldClassName(field) {
  const classes = ["dialogFieldItem"];
  classes.push(isCompactDialogHalfField(field) ? "dialogFieldItem--half" : "dialogFieldItem--full");
  if (field?.type === "file_reference") {
    classes.push("dialogFieldItem--fileReference");
  }
  return classes.join(" ");
}

function FileReferencePreview({ value }) {
  const normalizedValue = normalizeFileReferenceValue(value);
  if (!normalizedValue) {
    return null;
  }

  const label = resolveFileReferenceLabel(normalizedValue) || "Uten navn";
  const href = resolveFileReferenceHref(normalizedValue);
  const externalSource = String(normalizedValue.source ?? "").trim();
  const referenceBadgeLabel = normalizedValue.kind === "upload"
    ? "Lagret i databasen"
    : isUrlReference(normalizedValue.source)
      ? "URL"
      : "Filsti";
  const secondaryText = normalizedValue.kind === "upload"
    ? [normalizedValue.mimeType || "Lagret i databasen", formatFileSize(normalizedValue.sizeBytes)].filter(Boolean).join(" • ")
    : externalSource && externalSource !== label
      ? externalSource
      : "";

  return (
    <div className="fileReferencePreview">
      <span className="fileReferencePreviewIcon" aria-hidden="true">
        {normalizedValue.kind === "upload" ? <ArrowUploadRegular /> : isUrlReference(normalizedValue.source) ? <LinkRegular /> : <DocumentRegular />}
      </span>
      <div className="fileReferencePreviewText">
        <div className="fileReferencePreviewHeader">
          {href ? (
            <a className="fileReferencePreviewLink" href={href} rel="noreferrer" target="_blank">
              {label}
            </a>
          ) : (
            <Text weight="medium">{label}</Text>
          )}
          <Badge appearance="tint" size="small">
            {referenceBadgeLabel}
          </Badge>
        </div>
        {secondaryText ? <Text size={200}>{secondaryText}</Text> : null}
      </div>
    </div>
  );
}

function FileReferenceInput({
  field,
  value,
  onChange,
  showToast
}) {
  const fileInputRef = React.useRef(null);
  const uploadTriggerRef = React.useRef(null);
  const uploadDialogRef = React.useRef(null);
  const externalTriggerRef = React.useRef(null);
  const externalDialogRef = React.useRef(null);
  const normalizedValue = React.useMemo(() => normalizeFileReferenceValue(value), [value]);
  const [mode, setMode] = React.useState(normalizedValue?.kind === "external" ? "external" : "upload");
  const [externalSource, setExternalSource] = React.useState("");
  const [draftExternalSource, setDraftExternalSource] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
  const [isExternalDialogOpen, setIsExternalDialogOpen] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState("");
  const [statusIntent, setStatusIntent] = React.useState("info");

  React.useEffect(() => {
    const nextValue = normalizeFileReferenceValue(value);
    const nextExternalSource =
      nextValue?.kind === "external"
        ? String(nextValue.source ?? "").trim()
        : "";
    setMode(nextValue?.kind === "external" ? "external" : "upload");
    setExternalSource(nextExternalSource);
    setDraftExternalSource(nextExternalSource);
  }, [value]);

  React.useEffect(() => {
    if (!isUploadDialogOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (uploadDialogRef.current?.contains(event.target)) {
        return;
      }
      setIsUploadDialogOpen(false);
      setIsDragActive(false);
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsUploadDialogOpen(false);
        setIsDragActive(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isUploadDialogOpen]);

  React.useEffect(() => {
    if (!isExternalDialogOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (externalDialogRef.current?.contains(event.target)) {
        return;
      }
      setIsExternalDialogOpen(false);
      setDraftExternalSource(externalSource);
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsExternalDialogOpen(false);
        setDraftExternalSource(externalSource);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [externalSource, isExternalDialogOpen]);

  function applyExternalSource(nextSource) {
    const normalizedSource = String(nextSource ?? "").trim();
    setExternalSource(normalizedSource);
    setDraftExternalSource(normalizedSource);
    setMode("external");
    setIsExternalDialogOpen(false);
    onChange(normalizedSource ? createExternalFileReference(normalizedSource) : "");
    setStatusMessage("");
  }

  async function handleFileUpload(file) {
    try {
      setIsUploading(true);
      setStatusIntent("info");
      setStatusMessage("");
      const contentBase64 = await readFileAsBase64(file);
      const response = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          contentBase64
        })
      });

      if (!response.ok) {
        throw new Error("Opplasting av fil feilet.");
      }

      const uploadedFile = await response.json();
      onChange(buildStoredFileReference(uploadedFile));
      setMode("upload");
      setIsUploadDialogOpen(false);
      setStatusIntent("success");
      setStatusMessage("Fil er lastet opp og lagres i databasen.");
      showToast?.("Fil er lastet opp.");
    } catch (error) {
      setStatusIntent("error");
      setStatusMessage(error.message ?? "Opplasting av fil feilet.");
      showToast?.(error.message ?? "Opplasting av fil feilet.", "error");
    } finally {
      setIsUploading(false);
      setIsDragActive(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleFileSelection(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await handleFileUpload(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file || isUploading) {
      setIsDragActive(false);
      return;
    }
    void handleFileUpload(file);
  }

  const currentValueLabel = normalizedValue?.kind === "upload" ? "Gjeldende fil" : normalizedValue ? "Gjeldende referanse" : "";
  const uploadHelperText = normalizedValue
    ? "Velg en ny fil for å erstatte det som allerede er registrert."
    : "Dra en fil hit, eller velg en fil fra maskinen. Filen lagres i databasen."
  ;
  const selectionLabel = normalizedValue ? "Erstatt med nytt dokument:" : "Legg til dokument:";
  const isUploadSelected = mode === "upload" || isUploadDialogOpen;
  const isExternalSelected = mode === "external" || isExternalDialogOpen;
  const uploadPortalHost =
    isUploadDialogOpen && typeof document !== "undefined"
      ? uploadTriggerRef.current?.closest?.(".editorDialogSurface") ?? document.body
      : null;
  const isUploadDialogLocal = Boolean(uploadPortalHost && uploadPortalHost !== document.body);
  const uploadDialog = isUploadDialogOpen && uploadPortalHost
    ? createPortal(
        <div className={`fileReferenceUploadDialogBackdrop ${isUploadDialogLocal ? "fileReferenceUploadDialogBackdrop--local" : ""}`}>
          <div
            ref={uploadDialogRef}
            className={`fileReferenceUploadDialog ${isUploadDialogLocal ? "fileReferenceUploadDialog--local" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Last opp fil"
          >
            <div className="fileReferenceUploadDialogHeader">
              <div className="fileReferenceUploadDialogTitle">
                <Text weight="semibold">Last opp fil</Text>
                <Text size={200}>Dra og slipp en fil her, eller velg en fil fra maskinen.</Text>
              </div>
              <Button
                appearance="subtle"
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  setIsDragActive(false);
                }}
              >
                Lukk
              </Button>
            </div>
            <div
              className={`fileReferenceDropzone ${isDragActive ? "isDragActive" : ""}`}
              onDragEnter={(event) => {
                event.preventDefault();
                if (!isUploading) {
                  setIsDragActive(true);
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                if (event.currentTarget === event.target) {
                  setIsDragActive(false);
                }
              }}
              onDrop={handleDrop}
            >
              <span className="fileReferenceDropzoneIcon" aria-hidden="true">
                <ArrowUploadRegular />
              </span>
              <div className="fileReferenceDropzoneText">
                <Text weight="semibold">{normalizedValue?.kind === "upload" ? "Bytt fil" : "Last opp fil"}</Text>
                <Text size={200}>{uploadHelperText}</Text>
              </div>
              <Button
                appearance="secondary"
                icon={<ArrowUploadRegular />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="fileReferenceDropzoneButton"
              >
                {isUploading ? "Laster opp..." : normalizedValue?.kind === "upload" ? "Velg ny fil" : "Velg fil"}
              </Button>
            </div>
            <div className="fileReferenceUploadDialogActions">
              <Button
                appearance="subtle"
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  setIsDragActive(false);
                }}
              >
                Avbryt
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="fileReferenceHiddenInput"
              onChange={handleFileSelection}
            />
          </div>
        </div>,
        uploadPortalHost
      )
    : null;
  const externalPortalHost =
    isExternalDialogOpen && typeof document !== "undefined"
      ? externalTriggerRef.current?.closest?.(".editorDialogSurface") ?? document.body
      : null;
  const isExternalDialogLocal = Boolean(externalPortalHost && externalPortalHost !== document.body);
  const externalDialog = isExternalDialogOpen && externalPortalHost
    ? createPortal(
        <div className={`fileReferenceUploadDialogBackdrop ${isExternalDialogLocal ? "fileReferenceUploadDialogBackdrop--local" : ""}`}>
          <div
            ref={externalDialogRef}
            className={`fileReferenceUploadDialog fileReferenceSourceDialog ${isExternalDialogLocal ? "fileReferenceUploadDialog--local" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Bruk lenke eller sti"
          >
            <div className="fileReferenceUploadDialogHeader">
              <div className="fileReferenceUploadDialogTitle">
                <Text weight="semibold">Bruk lenke eller sti</Text>
                <Text size={200}>Pek til et dokument via lokal filsti eller URL.</Text>
              </div>
              <Button
                appearance="subtle"
                onClick={() => {
                  setIsExternalDialogOpen(false);
                  setDraftExternalSource(externalSource);
                }}
              >
                Lukk
              </Button>
            </div>
            <div className="fileReferenceSourceDialogBody">
              <Input
                value={draftExternalSource}
                placeholder={field?.placeholder ?? "For eksempel C:\\Felles\\Rutiner\\policy.pdf eller https://eksempel.no/policy.pdf"}
                onChange={(event) => setDraftExternalSource(event.target.value)}
              />
              {draftExternalSource ? (
                <div className="fileReferencePreviewWrap">
                  <FileReferencePreview value={createExternalFileReference(draftExternalSource)} />
                  <Button appearance="subtle" icon={<DeleteRegular />} onClick={() => setDraftExternalSource("")}>
                    Tøm
                  </Button>
                </div>
              ) : (
                <Text size={200} className="fileReferenceSourceDialogHint">
                  Eksempel: bruk en lokal filsti for interne dokumenter, eller en URL hvis dokumentet ligger tilgjengelig på nett.
                </Text>
              )}
            </div>
            <div className="fileReferenceUploadDialogActions">
              <Button
                appearance="subtle"
                onClick={() => {
                  setIsExternalDialogOpen(false);
                  setDraftExternalSource(externalSource);
                }}
              >
                Avbryt
              </Button>
              <Button
                appearance="primary"
                onClick={() => applyExternalSource(draftExternalSource)}
                disabled={!String(draftExternalSource ?? "").trim()}
              >
                Lagre referanse
              </Button>
            </div>
          </div>
        </div>,
        externalPortalHost
      )
    : null;

  return (
    <div className="fileReferenceField">
      {normalizedValue ? (
        <div className="fileReferenceCurrentCard">
          <div className="fileReferenceCurrentHeader">
            <Text size={200}>{currentValueLabel}</Text>
            <Button
              appearance="subtle"
              className="fileReferenceDangerButton"
              icon={<DeleteRegular />}
              onClick={() => {
                onChange("");
                setExternalSource("");
                setStatusMessage("");
              }}
            >
              Fjern
            </Button>
          </div>
          <FileReferencePreview value={normalizedValue} />
        </div>
      ) : null}

      <Text size={200} className="fileReferenceSectionLabel">
        {selectionLabel}
      </Text>

      <div className="fileReferenceModeSwitch" role="tablist" aria-label={field?.label ?? "Filvalg"}>
        <button
          ref={uploadTriggerRef}
          type="button"
          role="tab"
          aria-selected={isUploadSelected}
          className={`fileReferenceModeButton fileReferenceModeButton--upload ${isUploadSelected ? "isActive" : ""}`}
          onClick={() => {
            setIsExternalDialogOpen(false);
            setDraftExternalSource(externalSource);
            setMode("upload");
            setIsUploadDialogOpen(true);
          }}
        >
          <span className="fileReferenceModeButtonIcon" aria-hidden="true">
            <ArrowUploadRegular />
          </span>
          <span className="fileReferenceModeButtonText">
            <Text weight="semibold">Last opp fil</Text>
            <Text size={200}>Lagre dokumentet i databasen</Text>
          </span>
        </button>
        <button
          ref={externalTriggerRef}
          type="button"
          role="tab"
          aria-selected={isExternalSelected}
          className={`fileReferenceModeButton fileReferenceModeButton--external ${isExternalSelected ? "isActive" : ""}`}
          onClick={() => {
            setIsUploadDialogOpen(false);
            setIsDragActive(false);
            setMode("external");
            setDraftExternalSource(externalSource);
            setIsExternalDialogOpen(true);
          }}
        >
          <span className="fileReferenceModeButtonIcon" aria-hidden="true">
            <LinkRegular />
          </span>
          <span className="fileReferenceModeButtonText">
            <Text weight="semibold">Bruk lenke eller sti</Text>
            <Text size={200}>Pek til et dokument som allerede finnes</Text>
          </span>
        </button>
      </div>
      {statusMessage ? (
        <Text size={200} className={`fileReferenceStatus fileReferenceStatus--${statusIntent}`}>
          {statusMessage}
        </Text>
      ) : null}
      {uploadDialog}
      {externalDialog}
    </div>
  );
}

async function readFileAsBase64(file) {
  const arrayBuffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return window.btoa(binary);
}

export function PageRenderer({
  appState,
  authSession,
  bootstrap,
  closeDialog,
  currentRecord,
  currentScreen,
  currentStructure,
  dialogState,
  filters,
  hashInfo,
  navigateTo,
  onAction,
  openDialog,
  searchState,
  selectedOrgNode,
  selectedOrgNodeId,
  setFilters,
  setSearchState,
  setSelectedOrgNodeId,
  showToast,
  submitDialog,
  updateDialogField,
  updateDraft
}) {
  function resolveDialogOptions(field) {
    const options = field.options ?? [];
    if (options.length) {
      return options;
    }

    if (field.optionSource === "organization_structure.service_area") {
      return (appState.organizationStructure ?? []).map((item) => ({
        value: item.serviceArea,
        label: item.serviceArea
      }));
    }

    if (field.optionSource === "organization_structure.organization") {
      const serviceAreaValue = dialogState?.draft?.serviceArea;
      const matchingArea = (appState.organizationStructure ?? []).find((item) => item.serviceArea === serviceAreaValue);
      return (matchingArea?.organizations ?? []).map((item) => ({
        value: item.name,
        label: item.name
      }));
    }

    if (field.optionSource === "organization_structure.department") {
      const serviceAreaValue = dialogState?.draft?.serviceArea;
      const organizationValue = dialogState?.draft?.organization;
      const matchingArea = (appState.organizationStructure ?? []).find((item) => item.serviceArea === serviceAreaValue);
      const matchingOrganization = (matchingArea?.organizations ?? []).find((item) => item.name === organizationValue);
      return (matchingOrganization?.departments ?? []).map((item) => ({
        value: item.name,
        label: item.name
      }));
    }

    return resolveFieldOptions(field, appState, bootstrap);
  }

  return (
    <>
      {renderPage({
        appState,
        bootstrap,
        currentRecord,
        currentScreen,
        currentStructure,
        filters,
        hashInfo,
        navigateTo,
        onAction,
        openDialog,
        searchState,
        selectedOrgNode,
        selectedOrgNodeId,
        setFilters,
        setSearchState,
        setSelectedOrgNodeId,
        showToast,
        updateDraft
      })}

      <Dialog open={Boolean(dialogState)} onOpenChange={(_event, data) => !data.open && closeDialog()}>
        <DialogSurface className="editorDialogSurface">
          <DialogBody className="editorDialogBody">
            <DialogTitle>{dialogState?.title}</DialogTitle>
            <DialogContent className="editorDialogContent">
              <div className="dialogFieldStack">
                {dialogState?.fields?.map((field) => (
                  <Field key={field.key} label={field.label} className={getDialogFieldClassName(field)}>
                    {field.type === "tag_color_picker" ? (
                      <div className="tagColorPicker">
                        {TAG_COLOR_OPTIONS.map((option) => {
                          const isSelected = resolveTagColorValue(dialogState.draft?.[field.key]) === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              className={`tagColorOption ${isSelected ? "isSelected" : ""}`}
                              aria-label={option.label}
                              title={option.label}
                              style={{
                                "--tag-color-bg": option.bg,
                                "--tag-color-border": option.border,
                                "--tag-color-fg": option.fg
                              }}
                              onClick={() => updateDialogField(field.key, option.value)}
                            >
                              <span className="tagColorSwatch" aria-hidden="true" />
                            </button>
                          );
                        })}
                      </div>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        resize="vertical"
                        value={dialogState.draft?.[field.key] ?? ""}
                        onChange={(event) => updateDialogField(field.key, event.target.value)}
                      />
                    ) : field.type === "tag_picker_multi" ? (
                      (() => {
                        const selectedValues = Array.isArray(dialogState.draft?.[field.key]) ? dialogState.draft[field.key] : [];
                        const addModeKey = `${field.key}__adding`;
                        const addInputKey = `${field.key}__new`;
                        const addDescriptionKey = `${field.key}__description`;
                        const addColorKey = `${field.key}__color`;
                        const customOptionsKey = `${field.key}__customOptions`;
                        const customMetaKey = `${field.key}__customMeta`;
                        const addInputValue = dialogState.draft?.[addInputKey] ?? "";
                        const addDescriptionValue = dialogState.draft?.[addDescriptionKey] ?? "";
                        const addColorValue = resolveTagColorValue(dialogState.draft?.[addColorKey]);
                        const customOptions = Array.isArray(dialogState.draft?.[customOptionsKey])
                          ? dialogState.draft[customOptionsKey]
                              .map((option) =>
                                typeof option === "string"
                                  ? { value: option, label: option }
                                  : { value: String(option?.value ?? "").trim(), label: String(option?.label ?? option?.value ?? "").trim() }
                              )
                              .filter((option) => option.value)
                          : [];
                        const customMeta = dialogState.draft?.[customMetaKey] ?? {};
                        const optionMap = new Map(
                          resolveDialogOptions(field).map((option) => [
                            String(option.value),
                            { label: option.label, color: option.color, description: option.description }
                          ])
                        );

                        customOptions.forEach((option) => {
                          if (!optionMap.has(String(option.value))) {
                            optionMap.set(String(option.value), {
                              label: option.label,
                              color: option.color,
                              description: customMeta?.[option.value]?.description ?? ""
                            });
                          }
                        });

                        selectedValues.forEach((value) => {
                          if (!optionMap.has(String(value))) {
                            optionMap.set(
                              String(value),
                              {
                                label: String(customMeta?.[value]?.name ?? value),
                                color: String(customMeta?.[value]?.color ?? ""),
                                description: String(customMeta?.[value]?.description ?? "")
                              }
                            );
                          }
                        });

                        const visualOptions = Array.from(optionMap.entries()).map(([value, option]) => ({
                          value,
                          label: option?.label ?? value,
                          color: option?.color ?? "",
                          description: String(option?.description ?? "")
                        }));

                        function toggleValue(nextValue) {
                          const normalizedValue = String(nextValue);
                          const nextSelectedValues = selectedValues.includes(normalizedValue)
                            ? selectedValues.filter((value) => value !== normalizedValue)
                            : [...selectedValues, normalizedValue];
                          updateDialogField(field.key, nextSelectedValues);
                        }

                        function addNewTag() {
                          const normalizedLabel = String(addInputValue).trim();
                          if (!normalizedLabel) {
                            return;
                          }
                          if (field.catalogKey === "tagsCatalog") {
                            const normalizedLabelKey = normalizeCatalogNameKey(normalizedLabel);
                            const existingLabelKeys = new Set(
                              Array.from(optionMap.values())
                                .map((option) => normalizeCatalogNameKey(option?.label))
                                .filter(Boolean)
                            );
                            if (existingLabelKeys.has(normalizedLabelKey)) {
                              showToast("Merkelappen finnes allerede. Velg den fra listen i stedet.", "error");
                              return;
                            }
                          }
                          const nextId = createCatalogItemId(
                            field.catalogKey,
                            normalizedLabel,
                            new Set([
                              ...optionMap.keys(),
                              ...customOptions.map((option) => String(option.value)),
                              ...selectedValues.map((value) => String(value))
                            ])
                          );
                          const nextCustomOptions = customOptions.some((option) => option.value === nextId)
                            ? customOptions
                            : [...customOptions, { value: nextId, label: normalizedLabel, color: field.catalogKey === "tagsCatalog" ? addColorValue : "" }];
                          const nextSelectedValues = selectedValues.includes(nextId)
                            ? selectedValues
                            : [...selectedValues, nextId];
                          updateDialogField(customOptionsKey, nextCustomOptions);
                          updateDialogField(customMetaKey, {
                            ...customMeta,
                            [nextId]: {
                              name: normalizedLabel,
                              description: String(addDescriptionValue).trim(),
                              color: field.catalogKey === "tagsCatalog" ? addColorValue : ""
                            }
                          });
                          updateDialogField(field.key, nextSelectedValues);
                          updateDialogField(addInputKey, "");
                          updateDialogField(addDescriptionKey, "");
                          updateDialogField(addColorKey, "blue");
                          updateDialogField(addModeKey, false);
                        }

                        return (
                          <div className="dialogTagPickerMulti">
                            <div className="dialogTagPicker">
                              {visualOptions.length ? (
                                visualOptions.map((option) => {
                                  const isSelected = selectedValues.includes(String(option.value));
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      className={`dialogTagOption ${isSelected ? "isSelected" : ""}`}
                                      onClick={() => toggleValue(option.value)}
                                    >
                                      <Tooltip
                                        content={
                                          option.description ? <div className="tooltipContent">{option.description}</div> : option.label
                                        }
                                        relationship="label"
                                        showDelay={1200}
                                      >
                                        <span
                                          className={`labelChip dialogTagVisual ${isSelected ? "dialogTagVisual--selected" : ""}`}
                                          style={field.catalogKey === "tagsCatalog" ? resolveTagChipStyle(option.color) : undefined}
                                        >
                                          {option.label}
                                        </span>
                                      </Tooltip>
                                    </button>
                                  );
                                })
                              ) : (
                                <Text size={200}>{field.emptyMessage ?? "Ingen eksisterende verdier funnet."}</Text>
                              )}

                              {field.supportsCreate !== false ? (
                                <div className={`dialogTagCreateAnchor ${dialogState.draft?.[addModeKey] ? "isOpen" : ""}`}>
                                  <button
                                    type="button"
                                    className="dialogTagAddButton"
                                    onClick={() => updateDialogField(addModeKey, true)}
                                  >
                                    {field.addButtonLabel ?? "+ Legg til"}
                                  </button>
                                  {dialogState.draft?.[addModeKey] ? (
                                    <div className="dialogTagCreatePanel">
                                      <div className="dialogTagInputChip">
                                        <div className="dialogTagInlineNameRow">
                                          <input
                                            className="dialogTagInlineInput"
                                            placeholder={field.addPlaceholder ?? "Ny verdi"}
                                            value={addInputValue}
                                            onChange={(event) => updateDialogField(addInputKey, event.target.value)}
                                            onKeyDown={(event) => {
                                              if (event.key === "Enter" && !event.shiftKey) {
                                                event.preventDefault();
                                                addNewTag();
                                              }
                                              if (event.key === "Escape") {
                                                updateDialogField(addModeKey, false);
                                                updateDialogField(addInputKey, "");
                                                updateDialogField(addDescriptionKey, "");
                                                updateDialogField(addColorKey, "blue");
                                              }
                                            }}
                                          />
                                          {field.catalogKey === "tagsCatalog" ? (
                                            <InlineTagColorTrigger
                                              ariaLabel="Velg farge for ny merkelapp"
                                              value={addColorValue}
                                              onChange={(nextColor) => updateDialogField(addColorKey, nextColor)}
                                            />
                                          ) : null}
                                        </div>
                                        {field.supportsDescription ? (
                                          <div className="dialogTagDescriptionSlot">
                                            <textarea
                                              className="dialogTagInlineTextarea"
                                              rows={2}
                                              placeholder={field.addDescriptionPlaceholder ?? "Kort beskrivelse"}
                                              value={addDescriptionValue}
                                              onChange={(event) => updateDialogField(addDescriptionKey, event.target.value)}
                                            />
                                          </div>
                                        ) : null}
                                        <div className="dialogTagCreateActions">
                                          <button
                                            type="button"
                                            className="dialogTagInlineCancel"
                                            onClick={() => {
                                              updateDialogField(addModeKey, false);
                                              updateDialogField(addInputKey, "");
                                              updateDialogField(addDescriptionKey, "");
                                              updateDialogField(addColorKey, "blue");
                                            }}
                                          >
                                            Avbryt
                                          </button>
                                          <button
                                            type="button"
                                            className="dialogTagInlineConfirm"
                                            aria-label={`Lagre ny ${field.valueLabel ?? "verdi"}`}
                                            onClick={addNewTag}
                                          >
                                            <CheckmarkRegular />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })()
                    ) : field.type === "tag_picker" ? (
                      (() => {
                        const addModeKey = `${field.key}__adding`;
                        const addInputKey = `${field.key}__new`;
                        const addDescriptionKey = `${field.key}__description`;
                        const addColorKey = `${field.key}__color`;
                        const customOptionsKey = `${field.key}__customOptions`;
                        const customMetaKey = `${field.key}__customMeta`;
                        const addInputValue = dialogState.draft?.[addInputKey] ?? "";
                        const addDescriptionValue = dialogState.draft?.[addDescriptionKey] ?? "";
                        const addColorValue = resolveTagColorValue(dialogState.draft?.[addColorKey]);
                        const customOptions = Array.isArray(dialogState.draft?.[customOptionsKey])
                          ? dialogState.draft[customOptionsKey]
                              .map((option) =>
                                typeof option === "string"
                                  ? { value: option, label: option }
                                  : { value: String(option?.value ?? "").trim(), label: String(option?.label ?? option?.value ?? "").trim() }
                              )
                              .filter((option) => option.value)
                          : [];
                        const customMeta = dialogState.draft?.[customMetaKey] ?? {};
                        const optionMap = new Map(
                          resolveDialogOptions(field).map((option) => [
                            String(option.value),
                            { label: option.label, color: option.color, description: option.description }
                          ])
                        );

                        customOptions.forEach((option) => {
                          if (!optionMap.has(String(option.value))) {
                            optionMap.set(String(option.value), {
                              label: option.label,
                              color: option.color,
                              description: customMeta?.[option.value]?.description ?? ""
                            });
                          }
                        });

                        const selectedValue = String(dialogState.draft?.[field.key] ?? "");
                        if (selectedValue && !optionMap.has(selectedValue)) {
                          optionMap.set(selectedValue, {
                            label: String(customMeta?.[selectedValue]?.name ?? selectedValue),
                            color: String(customMeta?.[selectedValue]?.color ?? ""),
                            description: String(customMeta?.[selectedValue]?.description ?? "")
                          });
                        }

                        const visualOptions = Array.from(optionMap.entries()).map(([value, option]) => ({
                          value,
                          label: option?.label ?? value,
                          color: option?.color ?? "",
                          description: String(option?.description ?? "")
                        }));

                        function addNewTag() {
                          const normalizedLabel = String(addInputValue).trim();
                          if (!normalizedLabel) {
                            return;
                          }
                          if (field.catalogKey === "tagsCatalog") {
                            const normalizedLabelKey = normalizeCatalogNameKey(normalizedLabel);
                            const existingLabelKeys = new Set(
                              Array.from(optionMap.values())
                                .map((option) => normalizeCatalogNameKey(option?.label))
                                .filter(Boolean)
                            );
                            if (existingLabelKeys.has(normalizedLabelKey)) {
                              showToast("Merkelappen finnes allerede. Velg den fra listen i stedet.", "error");
                              return;
                            }
                          }
                          const nextId = createCatalogItemId(
                            field.catalogKey,
                            normalizedLabel,
                            new Set([
                              ...optionMap.keys(),
                              ...customOptions.map((option) => String(option.value)),
                              selectedValue
                            ].filter(Boolean))
                          );
                          const nextCustomOptions = customOptions.some((option) => option.value === nextId)
                            ? customOptions
                            : [...customOptions, { value: nextId, label: normalizedLabel, color: field.catalogKey === "tagsCatalog" ? addColorValue : "" }];
                          updateDialogField(customOptionsKey, nextCustomOptions);
                          updateDialogField(customMetaKey, {
                            ...customMeta,
                            [nextId]: {
                              name: normalizedLabel,
                              description: String(addDescriptionValue).trim(),
                              color: field.catalogKey === "tagsCatalog" ? addColorValue : ""
                            }
                          });
                          updateDialogField(field.key, nextId);
                          updateDialogField(addInputKey, "");
                          updateDialogField(addDescriptionKey, "");
                          updateDialogField(addColorKey, "blue");
                          updateDialogField(addModeKey, false);
                        }

                        return (
                          <div className="dialogTagPickerMulti">
                            <div className="dialogTagPicker">
                              {visualOptions.length ? (
                                visualOptions.map((option) => {
                                  const isSelected = selectedValue === String(option.value);
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      className={`dialogTagOption ${isSelected ? "isSelected" : ""}`}
                                      onClick={() => updateDialogField(field.key, isSelected ? "" : option.value)}
                                    >
                                      <Tooltip
                                        content={
                                          option.description ? <div className="tooltipContent">{option.description}</div> : option.label
                                        }
                                        relationship="label"
                                        showDelay={1200}
                                      >
                                        <span
                                          className={`labelChip dialogTagVisual ${isSelected ? "dialogTagVisual--selected" : ""}`}
                                          style={field.catalogKey === "tagsCatalog" ? resolveTagChipStyle(option.color) : undefined}
                                        >
                                          {option.label}
                                        </span>
                                      </Tooltip>
                                    </button>
                                  );
                                })
                              ) : (
                                <Text size={200}>{field.emptyMessage ?? "Ingen eksisterende verdier funnet."}</Text>
                              )}

                              {field.supportsCreate !== false ? (
                                <div className={`dialogTagCreateAnchor ${dialogState.draft?.[addModeKey] ? "isOpen" : ""}`}>
                                  <button
                                    type="button"
                                    className="dialogTagAddButton"
                                    onClick={() => updateDialogField(addModeKey, true)}
                                  >
                                    {field.addButtonLabel ?? "+ Legg til"}
                                  </button>
                                  {dialogState.draft?.[addModeKey] ? (
                                    <div className="dialogTagCreatePanel">
                                      <div className="dialogTagInputChip">
                                        <div className="dialogTagInlineNameRow">
                                          <input
                                            className="dialogTagInlineInput"
                                            placeholder={field.addPlaceholder ?? "Ny verdi"}
                                            value={addInputValue}
                                            onChange={(event) => updateDialogField(addInputKey, event.target.value)}
                                            onKeyDown={(event) => {
                                              if (event.key === "Enter" && !event.shiftKey) {
                                                event.preventDefault();
                                                addNewTag();
                                              }
                                              if (event.key === "Escape") {
                                                updateDialogField(addModeKey, false);
                                                updateDialogField(addInputKey, "");
                                                updateDialogField(addDescriptionKey, "");
                                                updateDialogField(addColorKey, "blue");
                                              }
                                            }}
                                          />
                                          {field.catalogKey === "tagsCatalog" ? (
                                            <InlineTagColorTrigger
                                              ariaLabel="Velg farge for ny merkelapp"
                                              value={addColorValue}
                                              onChange={(nextColor) => updateDialogField(addColorKey, nextColor)}
                                            />
                                          ) : null}
                                        </div>
                                        {field.supportsDescription ? (
                                          <div className="dialogTagDescriptionSlot">
                                            <textarea
                                              className="dialogTagInlineTextarea"
                                              rows={2}
                                              placeholder={field.addDescriptionPlaceholder ?? "Kort beskrivelse"}
                                              value={addDescriptionValue}
                                              onChange={(event) => updateDialogField(addDescriptionKey, event.target.value)}
                                            />
                                          </div>
                                        ) : null}
                                        <div className="dialogTagCreateActions">
                                          <button
                                            type="button"
                                            className="dialogTagInlineCancel"
                                            onClick={() => {
                                              updateDialogField(addModeKey, false);
                                              updateDialogField(addInputKey, "");
                                              updateDialogField(addDescriptionKey, "");
                                              updateDialogField(addColorKey, "blue");
                                            }}
                                          >
                                            Avbryt
                                          </button>
                                          <button
                                            type="button"
                                            className="dialogTagInlineConfirm"
                                            aria-label={`Lagre ny ${field.valueLabel ?? "verdi"}`}
                                            onClick={addNewTag}
                                          >
                                            <CheckmarkRegular />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })()
                    ) : field.type === "icon_picker" ? (
                      <IconPickerField
                        dialogState={dialogState}
                        field={field}
                        updateDialogField={updateDialogField}
                      />
                    ) : field.type === "organization_affiliation_picker" ? (
                      <OrganizationAffiliationPickerField
                        appState={appState}
                        dialogState={dialogState}
                        field={field}
                        updateDialogField={updateDialogField}
                      />
                    ) : field.type === "file_reference" ? (
                      <FileReferenceInput
                        field={field}
                        value={dialogState.draft?.[field.key] ?? ""}
                        onChange={(nextValue) => updateDialogField(field.key, nextValue)}
                        showToast={showToast}
                      />
                    ) : field.type === "select" ? (
                      <Dropdown
                        selectedOptions={dialogState.draft?.[field.key] ? [String(dialogState.draft[field.key])] : []}
                        onOptionSelect={(_event, data) => updateDialogField(field.key, data.optionValue ?? "")}
                      >
                        {resolveDialogOptions(field).map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Dropdown>
                    ) : (
                      <Input
                        value={dialogState.draft?.[field.key] ?? ""}
                        onChange={(event) => updateDialogField(field.key, event.target.value)}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={closeDialog}>
                Avbryt
              </Button>
              <Button appearance="primary" onClick={submitDialog}>
                Lagre
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}

function renderPage(context) {
  const { currentScreen } = context;

  switch (currentScreen.pageFamily) {
    case "InventoryListPage":
      return <InventoryPage {...context} />;
    case "EntityDetailPage":
      return <DetailPage {...context} />;
    case "AdminSectionsPage":
      return <AdminSectionsPage {...context} />;
    case "SettingsPage":
      return <SettingsPage {...context} />;
    case "OrganizationStructurePage":
      return <OrganizationStructurePage {...context} />;
    default:
      return <PlaceholderPage {...context} />;
  }
}

function buildOrganizationTreeData(serviceAreas, organizationName) {
  const mapDepartmentNode = (department, areaIndex, organizationIndex, departmentIndex, areaName, organizationNameValue) => ({
    id: department.id,
    type: "department",
    visualType: "unit",
    level: 3,
    label: department.name,
    title: department.name,
    childCount: 0,
    editValue: department.name,
    affiliation: createOrganizationAffiliation(areaName, organizationNameValue, department.name),
    details: {
      name: department.name,
      description: department.description ?? ""
    },
    indices: { areaIndex, organizationIndex, departmentIndex },
    metadata: {
      description: department.description ?? ""
    },
    children: []
  });

  const mapOrganizationNode = (organization, areaIndex, organizationIndex, areaName) => {
    const children = (organization.departments ?? []).map((department, departmentIndex) =>
      mapDepartmentNode(department, areaIndex, organizationIndex, departmentIndex, areaName, organization.name)
    );

    return {
      id: organization.id,
      type: "organization",
      visualType: children.length ? "branch" : "unit",
      level: 2,
      label: organization.name,
      title: organization.name,
      childCount: children.length,
      editValue: organization.name,
      affiliation: createOrganizationAffiliation(areaName, organization.name),
      details: {
        name: organization.name,
        description: organization.description ?? ""
      },
      indices: { areaIndex, organizationIndex },
      metadata: {
        description: organization.description ?? ""
      },
      children
    };
  };

  const serviceAreaChildren = (serviceAreas ?? []).map((area, areaIndex) => {
    const children = (area.organizations ?? []).map((organization, organizationIndex) =>
      mapOrganizationNode(organization, areaIndex, organizationIndex, area.serviceArea)
    );

    return {
      id: area.id,
      type: "serviceArea",
      visualType: "department",
      level: 1,
      label: area.serviceArea,
      title: area.serviceArea,
      childCount: children.length,
      editValue: area.serviceArea,
      affiliation: createOrganizationAffiliation(area.serviceArea),
      details: {
        name: area.serviceArea,
        description: area.description ?? ""
      },
      indices: { areaIndex },
      metadata: {
        description: area.description ?? ""
      },
      children
    };
  });

  return {
    id: ORGANIZATION_ROOT_NODE_ID,
    type: "root",
    visualType: "root",
    level: 0,
    label: organizationName,
    title: organizationName,
    childCount: serviceAreaChildren.length,
    editValue: organizationName,
    affiliation: null,
    details: {
      name: organizationName,
      description: ""
    },
    metadata: {
      description: ""
    },
    children: serviceAreaChildren
  };
}

function createDefaultHierarchyCollapsedNodeIds(serviceAreas) {
  const initialCollapsedNodeIds = new Set();

  (serviceAreas ?? []).forEach((area) => {
    (area.organizations ?? []).forEach((organization) => {
      if (Array.isArray(organization.departments) && organization.departments.length) {
        initialCollapsedNodeIds.add(organization.id);
      }
    });
  });

  return initialCollapsedNodeIds;
}

function createPickerCollapsedNodeIds(serviceAreas) {
  const initialCollapsedNodeIds = new Set();

  (serviceAreas ?? []).forEach((area) => {
    initialCollapsedNodeIds.add(area.id);
    (area.organizations ?? []).forEach((organization) => {
      initialCollapsedNodeIds.add(organization.id);
    });
  });

  return initialCollapsedNodeIds;
}

function nodeHasChildren(node) {
  return Array.isArray(node?.children) && node.children.length > 0;
}

function OrganizationAffiliationPickerField({ appState, dialogState, field, updateDialogField }) {
  const selectedAffiliations = Array.isArray(dialogState.draft?.[field.key]) ? dialogState.draft[field.key] : [];
  const organizationStructure = appState.organizationStructure ?? [];
  const organizationName = appState.records?.roles?.fieldValues?.organization_name?.trim?.() || "Organisasjon";
  const treeData = React.useMemo(
    () => buildOrganizationTreeData(organizationStructure, organizationName),
    [organizationName, organizationStructure]
  );
  const [collapsedNodeIds, setCollapsedNodeIds] = React.useState(() => createPickerCollapsedNodeIds(organizationStructure));

  React.useEffect(() => {
    setCollapsedNodeIds((previous) => {
      const validIds = new Set();
      (organizationStructure ?? []).forEach((area) => {
        validIds.add(area.id);
        (area.organizations ?? []).forEach((organization) => {
          validIds.add(organization.id);
        });
      });
      const next = new Set([...previous].filter((id) => validIds.has(id)));
      if (!next.size && validIds.size) {
        return createPickerCollapsedNodeIds(organizationStructure);
      }
      return next;
    });
  }, [organizationStructure]);

  function toggleAffiliation(nextAffiliation) {
    if (!nextAffiliation) {
      return;
    }
    const nextKey = organizationAffiliationKey(nextAffiliation);
    const hasValue = selectedAffiliations.some((entry) => organizationAffiliationKey(entry) === nextKey);
    if (field.multiple === false) {
      updateDialogField(field.key, hasValue ? [] : [nextAffiliation]);
      return;
    }
    updateDialogField(
      field.key,
      hasValue
        ? selectedAffiliations.filter((entry) => organizationAffiliationKey(entry) !== nextKey)
        : [...selectedAffiliations, nextAffiliation]
    );
  }

  function isSelected(nextAffiliation) {
    if (!nextAffiliation) {
      return false;
    }
    const nextKey = organizationAffiliationKey(nextAffiliation);
    return selectedAffiliations.some((entry) => organizationAffiliationKey(entry) === nextKey);
  }

  function isNodeExpanded(node) {
    if (!nodeHasChildren(node)) {
      return false;
    }
    return !collapsedNodeIds.has(node.id);
  }

  function toggleNodeExpanded(nodeId) {
    setCollapsedNodeIds((previous) => {
      const next = new Set(previous);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }

  function renderPickerNode(node) {
    const hasChildren = nodeHasChildren(node);
    const expanded = isNodeExpanded(node);
    const rowClassName = `treeNodeButton treeNodeButton--level-${node.level ?? 0} treeNodeButton--${node.visualType ?? "unit"} organizationPickerNodeButton ${isSelected(node.affiliation) ? "isSelected" : ""} ${node.type === "root" ? "organizationPickerNodeButton--root" : ""}`;

    return (
      <div className={`treeNodeShell organizationPickerTreeNodeShell ${hasChildren ? "hasChildren" : "isLeaf"} ${expanded ? "isExpanded" : "isCollapsed"} level-${node.level ?? 0}`}>
        <div
          className={rowClassName}
          role="treeitem"
          aria-expanded={hasChildren ? expanded : undefined}
          tabIndex={node.type === "root" ? -1 : 0}
          onClick={() => {
            if (node.type !== "root") {
              toggleAffiliation(node.affiliation);
            }
          }}
          onKeyDown={(event) => {
            if (node.type === "root") {
              return;
            }
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggleAffiliation(node.affiliation);
            }
          }}
        >
          <span className="treeNodeAccent" aria-hidden="true" />
          <span className="treeNodeLabel">{node.title}</span>
          {hasChildren ? (
            <button
              type="button"
              className={`organizationPickerNodeToggle ${expanded ? "isExpanded" : ""}`}
              aria-label={expanded ? `Skjul ${node.title}` : `Vis ${node.title}`}
              onClick={(event) => {
                event.stopPropagation();
                toggleNodeExpanded(node.id);
              }}
            >
              {expanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
            </button>
          ) : (
            <span className="treeNodeChevron treeNodeChevron--placeholder" aria-hidden="true" />
          )}
        </div>
      </div>
    );
  }

  function renderPickerBranch(node, isRoot = false) {
    const hasChildren = nodeHasChildren(node);
    const expanded = isNodeExpanded(node);

    return (
      <div key={node.id} className={`hierarchyBranch ${isRoot ? "hierarchyBranch--root" : ""}`}>
        <div className={`hierarchyNodeRow ${isRoot ? "hierarchyNodeRow--root" : ""} ${hasChildren ? "hierarchyNodeRow--branch" : "hierarchyNodeRow--leaf"}`}>
          {renderPickerNode(node)}
        </div>
        {hasChildren && expanded ? (
          <div className={`hierarchyChildren ${isRoot ? "hierarchyChildren--root" : ""}`} role="group">
            {node.children.map((child) => renderPickerBranch(child))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="organizationPickerDialog">
      <div className="organizationPickerSelected">
        {selectedAffiliations.length ? (
          <div className="labelChipEditor organizationAffiliationChipEditor">
            {selectedAffiliations.map((entry) => (
              <button
                key={organizationAffiliationKey(entry)}
                type="button"
                className="organizationPickerSelectedChip"
                onClick={() => toggleAffiliation(entry)}
              >
                <Tag className="labelChip">{formatOrganizationAffiliation(entry)}</Tag>
              </button>
            ))}
          </div>
        ) : (
          <Text size={200}>Ingen tilknytninger valgt ennå.</Text>
        )}
      </div>

      <div className="organizationPickerTreeShell">
        <div className="hierarchyTree organizationPickerHierarchyTree" role="tree" aria-label="Velg organisasjonstilknytning">
          {renderPickerBranch(treeData, true)}
        </div>
      </div>
    </div>
  );
}

function InventoryPage({ appState, currentScreen, filters, navigateTo, onAction, openDialog, searchState, setFilters, setSearchState, showToast, updateDraft }) {
  const items = inventoryItemsForScreen(currentScreen, appState);
  const searchValue = searchState[currentScreen.id] ?? "";
  const filteredItems = filterInventoryItems(currentScreen, items, searchValue, filters.datasets);
  const metricCards = getInventoryMetrics(currentScreen, items);

  return (
    <div className="pageStack">
      <PageHeader screen={currentScreen} onAction={onAction} />
      <div className="summaryGrid">
        {metricCards.map((card) => (
          <Card key={card.label} className="metricCard" appearance="filled-alternative">
            <div className="metricCardContent">
              <Text size={200} weight="medium">
                {card.label}
              </Text>
              <Title2>{card.value}</Title2>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="inventoryToolbar">
          <SearchBox
            className="sectionSearch"
            placeholder={currentScreen.searchPlaceholder}
            value={searchValue}
            onChange={(event) =>
              setSearchState((previousState) => ({
                ...previousState,
                [currentScreen.id]: event.target.value
              }))
            }
          />

          {currentScreen.entityKey === "dataset" ? (
            <div className="inlineActionGroup">
              <Dropdown
                selectedOptions={[filters.datasets.hosting]}
                value={datasetHostingLabel(filters.datasets.hosting)}
                onOptionSelect={(_event, data) =>
                  setFilters((previousFilters) => ({
                    ...previousFilters,
                    datasets: {
                      ...previousFilters.datasets,
                      hosting: data.optionValue ?? "all"
                    }
                  }))
                }
              >
                {[
                  { value: "all", label: "Alle driftsplasseringer" },
                  { value: "cloud", label: "Sky" },
                  { value: "local", label: "Lokal" }
                ].map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Dropdown>

              <Dropdown
                selectedOptions={[filters.datasets.privacy]}
                value={datasetPrivacyLabel(filters.datasets.privacy)}
                onOptionSelect={(_event, data) =>
                  setFilters((previousFilters) => ({
                    ...previousFilters,
                    datasets: {
                      ...previousFilters.datasets,
                      privacy: data.optionValue ?? "all"
                    }
                  }))
                }
              >
                {[
                  { value: "all", label: "Alle personvernnivåer" },
                  { value: "sensitive", label: "Sensitive" },
                  { value: "personal", label: "Personopplysninger" },
                  { value: "public", label: "Ikke sensitivt" }
                ].map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Dropdown>
            </div>
          ) : null}
        </div>

        <DataTable
          columns={currentScreen.columns}
          emptyState="Ingen treff i listen."
          rows={filteredItems}
          renderRow={(item) => (
            <InventoryRow
              appState={appState}
              currentScreen={currentScreen}
              item={item}
              navigateTo={navigateTo}
              openDialog={openDialog}
              showToast={showToast}
              updateDraft={updateDraft}
            />
          )}
        />
      </Card>
    </div>
  );
}

function InventoryRow({ appState, currentScreen, item, navigateTo, openDialog, showToast, updateDraft }) {
  const cells = renderInventoryCells(currentScreen, item);

  function openDetailView() {
    navigateTo(detailRouteForEntity(currentScreen.entityKey, item.id));
  }

  return (
    <TableRow onDoubleClick={openDetailView}>
      {cells.map((cell, index) => (
        <TableCell key={`${item.id}-${index}`}>{renderInventoryBadgeCell(currentScreen, index, cell)}</TableCell>
      ))}
      <TableCell className="actionsCell">
        <div className="inlineActionGroup">
          <Tooltip content="Rediger" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={<EditRegular />}
              aria-label="Rediger"
              className="tableActionButton iconActionButton"
              onClick={openDetailView}
            />
          </Tooltip>
          <Tooltip content="Slett" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={<DeleteRegular />}
              aria-label="Slett"
              className="tableActionButton iconActionButton"
              onClick={() => {
                const blockers = getEntityReferenceBlockers(appState, currentScreen.entityKey, item.id);
                if (blockers.length) {
                  const preview = blockers
                    .slice(0, 3)
                    .map((blocker) => `${blocker.ownerLabel} (${blocker.relationLabel})`)
                    .join(", ");
                  const remaining = blockers.length > 3 ? ` og ${blockers.length - 3} til` : "";
                  showToast(
                    `Kan ikke slette ${item.name ?? "elementet"} fordi det er i bruk i ${preview}${remaining}.`,
                    "error"
                  );
                  return;
                }

                updateDraft((nextState) => {
                  nextState.entities[currentScreen.entityKey] = (nextState.entities[currentScreen.entityKey] ?? []).filter(
                    (entry) => entry.id !== item.id
                  );
                });
                showToast("Elementet er fjernet.");
              }}
            />
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}

function DetailPage({ appState, bootstrap, currentRecord, currentScreen, currentStructure, hashInfo, onAction, openDialog, showToast, updateDraft }) {
  const tabs = currentStructure?.tabs ?? [];
  const activeTab = resolveActiveTab(tabs, hashInfo.query.tab);

  if (!currentRecord || !currentStructure || !activeTab) {
    return <PlaceholderCard description="Detaljvisningen mangler modell eller data." title="Ingen innhold tilgjengelig" />;
  }

  return (
    <div className={`pageStack detailPage detailPage--${currentScreen.entityKey}`}>
      <PageHeader record={currentRecord} screen={currentScreen} onAction={onAction} />
      <TabList
        selectedValue={activeTab.key}
        onTabSelect={(_event, data) => {
          const nextParams = new URLSearchParams(hashInfo.query ?? {});
          nextParams.set("tab", String(data.value));
          window.location.hash = `${currentScreen.route}?${nextParams.toString()}`;
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.key} value={tab.key}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <div className="sectionGrid">
        {activeTab.sections.map((section) => (
          <div key={section.key} className="sectionCell" style={sectionSpanStyle(currentScreen, section.key)}>
            <SectionCard
              appState={appState}
              bootstrap={bootstrap}
              currentRecord={currentRecord}
              openDialog={openDialog}
              section={section}
              showToast={showToast}
              updateDraft={updateDraft}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSectionsPage({ appState, bootstrap, currentRecord, currentStructure, currentScreen, onAction, openDialog, showToast, updateDraft }) {
  if (!currentRecord || !currentStructure) {
    return <PlaceholderCard description="Administrasjonssiden mangler modell eller data." title="Ingen innhold tilgjengelig" />;
  }

  return (
    <div className="pageStack">
      <PageHeader record={currentRecord} screen={currentScreen} onAction={onAction} />
      <div className="sectionGrid">
        {currentStructure.sections.map((section) => (
          <div key={section.key} className="sectionCell" style={sectionSpanStyle(currentScreen, section.key)}>
            <SectionCard
              appState={appState}
              bootstrap={bootstrap}
              currentRecord={currentRecord}
              openDialog={openDialog}
              section={section}
              showToast={showToast}
              updateDraft={updateDraft}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage({ appState, authSession, currentScreen, onAction, openDialog, showToast, updateDraft }) {
  const [activeSettingsTab, setActiveSettingsTab] = React.useState("catalogs");
  const [users, setUsers] = React.useState([]);
  const [isUsersLoading, setIsUsersLoading] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [userForm, setUserForm] = React.useState(createBlankUserForm());
  const [passwordDraft, setPasswordDraft] = React.useState("");
  const [apiKeys, setApiKeys] = React.useState([]);
  const [isApiKeysLoading, setIsApiKeysLoading] = React.useState(false);
  const [apiKeyForm, setApiKeyForm] = React.useState({ name: "", role: "viewer" });
  const [createdApiToken, setCreatedApiToken] = React.useState("");
  const [inlineCatalogAdd, setInlineCatalogAdd] = React.useState({ key: null, value: "", description: "", color: "blue" });
  const inlineCatalogTriggerRefs = React.useRef({});
  const inlineCatalogPanelRef = React.useRef(null);
  const [inlineCatalogPanelPosition, setInlineCatalogPanelPosition] = React.useState(null);
  const settings = appState.settings ?? {};
  const themePreferences = settings.themePreferences ?? { appearance: "light", accent: "blue", surface: "warm" };
  const cards = React.useMemo(
    () => [
      {
        key: "commonComponentsCatalog",
        title: "Felleskomponenter",
        singular: "felleskomponent",
        supportsInlineDescription: true,
        supportsInlineColor: false,
        description: "Nasjonale og kommunale felleskomponenter som kan velges i applikasjonsarkitektur."
      },
      {
        key: "standardsCatalog",
        title: "Standarder",
        singular: "standard",
        supportsInlineDescription: true,
        supportsInlineColor: false,
        description: "Standarder som kan velges i applikasjonsarkitektur."
      }
    ],
    []
  );
  const tagsCard = React.useMemo(
    () => ({
      key: "tagsCatalog",
      title: "Merkelapper",
      singular: "merkelapp",
      supportsInlineDescription: true,
      supportsInlineColor: true,
      description: "Sentralt register over merkelapper som kan brukes på tvers av løsningen."
    }),
    []
  );
  const allCatalogCards = React.useMemo(() => [...cards, tagsCard], [cards, tagsCard]);
  const activeInlineCard = allCatalogCards.find((card) => card.key === inlineCatalogAdd.key) ?? null;
  const catalogCollectionKeyBySettingsKey = React.useMemo(
    () => ({
      commonComponentsCatalog: "common_components",
      standardsCatalog: "standards",
      tagsCatalog: "labels"
    }),
    []
  );
  const accentOptions = [
    { value: "blue", label: "Havblå", color: "#0f6cbd" },
    { value: "teal", label: "Petrol", color: "#0f766e" },
    { value: "green", label: "Skoggrønn", color: "#1f7a4c" },
    { value: "berry", label: "Bærtoner", color: "#b146c2" }
  ];
  const sessionRole = getSessionRole(authSession);
  const isSessionAdmin = sessionRole === "admin";
  const [adminAccessStatus, setAdminAccessStatus] = React.useState(isSessionAdmin ? "granted" : "checking");
  const isUserAdmin = isSessionAdmin || adminAccessStatus === "granted";
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const settingsNavItems = [
    { key: "catalogs", label: "Registere", description: "Verdier og merkelapper", icon: TagRegular },
    { key: "users", label: "Brukere", description: "Tilgang og roller", icon: PeopleRegular },
    { key: "apiKeys", label: "API-nøkler", description: "Integrasjoner og tokens", icon: ShieldRegular },
    { key: "themes", label: "Tema", description: "Utseende og farger", icon: SparkleRegular }
  ];
  const activeSettingsItem = settingsNavItems.find((item) => item.key === activeSettingsTab) ?? settingsNavItems[0];
  const isAccessControlledSettingsTab = ["users", "apiKeys"].includes(activeSettingsTab);

  React.useEffect(() => {
    setAdminAccessStatus(isSessionAdmin ? "granted" : "checking");
  }, [authSession?.user?.id, authSession?.user?.email, isSessionAdmin]);

  React.useEffect(() => {
    if (activeSettingsTab !== "users") {
      return;
    }
    loadUsers();
  }, [activeSettingsTab]);

  React.useEffect(() => {
    if (activeSettingsTab !== "apiKeys") {
      return;
    }
    loadApiKeys();
  }, [activeSettingsTab]);

  React.useEffect(() => {
    if (!selectedUser) {
      setUserForm(createBlankUserForm());
      setPasswordDraft("");
      return;
    }
    setUserForm({
      displayName: selectedUser.displayName ?? "",
      email: selectedUser.email ?? "",
      username: selectedUser.username ?? "",
      role: selectedUser.role ?? "viewer",
      status: selectedUser.status ?? "active",
      localEnabled: Boolean(selectedUser.localEnabled),
      password: ""
    });
    setPasswordDraft("");
  }, [selectedUser]);

  async function loadUsers() {
    try {
      setIsUsersLoading(true);
      const response = await fetch("/api/users");
      if (response.status === 403) {
        setAdminAccessStatus("denied");
        return;
      }
      if (!response.ok) {
        throw new Error("Klarte ikke å hente brukere.");
      }
      const payload = await response.json();
      setAdminAccessStatus("granted");
      setUsers(payload.users ?? []);
    } catch (error) {
      showToast(error.message ?? "Klarte ikke å hente brukere.", "error");
    } finally {
      setIsUsersLoading(false);
    }
  }

  function updateUserForm(field, value) {
    setUserForm((current) => ({ ...current, [field]: value }));
  }

  async function saveUser() {
    try {
      const isEditing = Boolean(selectedUser);
      const response = await fetch(isEditing ? `/api/users/${selectedUser.id}` : "/api/users", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm)
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail ?? "Brukeren kunne ikke lagres.");
      }
      const payload = await response.json();
      await loadUsers();
      setSelectedUserId(payload.user?.id ?? "");
      setPasswordDraft("");
      showToast("Bruker lagret.");
    } catch (error) {
      showToast(error.message ?? "Brukeren kunne ikke lagres.", "error");
    }
  }

  async function resetUserPassword() {
    if (!selectedUser) {
      return;
    }
    try {
      const response = await fetch(`/api/users/${selectedUser.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordDraft })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail ?? "Passordet kunne ikke oppdateres.");
      }
      await loadUsers();
      setPasswordDraft("");
      showToast("Passord oppdatert.");
    } catch (error) {
      showToast(error.message ?? "Passordet kunne ikke oppdateres.", "error");
    }
  }

  function startNewUser() {
    setSelectedUserId("");
    setUserForm(createBlankUserForm());
    setPasswordDraft("");
  }

  async function loadApiKeys() {
    try {
      setIsApiKeysLoading(true);
      const response = await fetch("/api/api-keys");
      if (response.status === 403) {
        setAdminAccessStatus("denied");
        return;
      }
      if (!response.ok) {
        throw new Error("Klarte ikke å hente API-nøkler.");
      }
      const payload = await response.json();
      setAdminAccessStatus("granted");
      setApiKeys(payload.apiKeys ?? []);
    } catch (error) {
      showToast(error.message ?? "Klarte ikke å hente API-nøkler.", "error");
    } finally {
      setIsApiKeysLoading(false);
    }
  }

  async function createApiKey() {
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiKeyForm)
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail ?? "API-nøkkelen kunne ikke opprettes.");
      }
      const payload = await response.json();
      setCreatedApiToken(payload.token ?? "");
      setApiKeyForm({ name: "", role: "viewer" });
      await loadApiKeys();
      showToast("API-nøkkel opprettet.");
    } catch (error) {
      showToast(error.message ?? "API-nøkkelen kunne ikke opprettes.", "error");
    }
  }

  async function revokeApiKey(keyId) {
    try {
      const response = await fetch(`/api/api-keys/${keyId}/revoke`, { method: "POST" });
      if (!response.ok) {
        throw new Error("API-nøkkelen kunne ikke tilbakekalles.");
      }
      await loadApiKeys();
      showToast("API-nøkkel tilbakekalt.");
    } catch (error) {
      showToast(error.message ?? "API-nøkkelen kunne ikke tilbakekalles.", "error");
    }
  }

  function renderApiKeysTab() {
    if (!isUserAdmin) {
      return (
        <div className="settingsEmptyState">
          <div className="headerStack compact">
            <Title3>API-nøkler</Title3>
            <Body1>{adminAccessStatus === "checking" ? "Kontrollerer administratorrettigheter..." : "Du må være administrator for å administrere API-nøkler."}</Body1>
          </div>
        </div>
      );
    }

    return (
      <div className="apiKeysGrid">
        <Card className="settingsCard" appearance="filled-alternative">
          <div className="headerStack compact">
            <Title3>Ny API-nøkkel</Title3>
            <Body1>Nøkkelen vises bare én gang. Bruk den som Bearer-token mot OpenAPI-endepunktene.</Body1>
          </div>
          <div className="userAdminForm">
            <Field label="Navn">
              <Input value={apiKeyForm.name} onChange={(event) => setApiKeyForm((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Rolle">
              <Dropdown value={roleLabel(apiKeyForm.role)} selectedOptions={[apiKeyForm.role]} onOptionSelect={(_event, data) => setApiKeyForm((current) => ({ ...current, role: data.optionValue }))}>
                <Option value="admin">Administrator</Option>
                <Option value="editor">Redaktør</Option>
                <Option value="viewer">Lesetilgang</Option>
              </Dropdown>
            </Field>
            <Button appearance="primary" onClick={createApiKey}>
              Opprett API-nøkkel
            </Button>
            {createdApiToken ? (
              <div className="apiTokenCallout">
                <div className="headerStack compact">
                  <Text weight="semibold">Ny nøkkel er opprettet</Text>
                  <Text size={200}>Kopier den nå. Den vises ikke igjen etter at vinduet lukkes.</Text>
                </div>
                <Textarea className="apiTokenText" readOnly value={createdApiToken} />
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="settingsCard" appearance="filled-alternative">
          <div className="cardHeader">
            <div className="headerStack compact">
              <Title3>Aktive og tilbakekalte nøkler</Title3>
              <Body1>{isApiKeysLoading ? "Laster API-nøkler..." : `${apiKeys.length} nøkler registrert`}</Body1>
            </div>
            <Button appearance="secondary" onClick={loadApiKeys}>
              Oppdater
            </Button>
          </div>
          <Table size="small" className="userAdminTable">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Navn</TableHeaderCell>
                <TableHeaderCell>Rolle</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Handling</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell>
                    <div className="userAdminIdentity">
                      <Text weight="semibold">{apiKey.name}</Text>
                      <Text size={200}>{apiKey.keyPrefix}</Text>
                    </div>
                  </TableCell>
                  <TableCell>{roleLabel(apiKey.role)}</TableCell>
                  <TableCell>
                    <Badge appearance={apiKey.status === "active" ? "filled" : "outline"}>
                      {apiKey.status === "active" ? "Aktiv" : "Tilbakekalt"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="small" disabled={apiKey.status !== "active"} onClick={() => revokeApiKey(apiKey.id)}>
                      Tilbakekall
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  function renderUsersTab() {
    if (!isUserAdmin) {
      return (
        <div className="settingsEmptyState">
          <div className="headerStack compact">
            <Title3>Brukere</Title3>
            <Body1>{adminAccessStatus === "checking" ? "Kontrollerer administratorrettigheter..." : "Du må være administrator for å administrere brukere."}</Body1>
          </div>
        </div>
      );
    }

    return (
      <div className="userAdminGrid">
        <Card className="settingsCard userAdminList" appearance="filled-alternative">
          <div className="cardHeader">
            <div className="headerStack compact">
              <Title3>Brukere</Title3>
              <Body1>{isUsersLoading ? "Laster brukere..." : `${users.length} brukere registrert`}</Body1>
            </div>
            <Button appearance="secondary" icon={<AddRegular />} onClick={startNewUser}>
              Ny bruker
            </Button>
          </div>
          <Table size="small" className="userAdminTable">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Navn</TableHeaderCell>
                <TableHeaderCell>Rolle</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className={selectedUserId === user.id ? "isSelected" : ""}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <TableCell>
                    <div className="userAdminIdentity">
                      <Text weight="semibold">{user.displayName}</Text>
                      <Text size={200}>{user.email}</Text>
                    </div>
                  </TableCell>
                  <TableCell>{roleLabel(user.role)}</TableCell>
                  <TableCell>
                    <Badge appearance={user.status === "active" ? "filled" : "outline"}>
                      {user.status === "active" ? "Aktiv" : "Deaktivert"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="settingsCard userAdminEditor" appearance="filled-alternative">
          <div className="headerStack compact">
            <Title3>{selectedUser ? "Rediger bruker" : "Ny bruker"}</Title3>
            <Body1>Lokale brukere kan logge inn med brukernavn eller e-post. Entra og Google matcher brukeren på e-postadresse.</Body1>
          </div>
          <div className="userAdminForm">
            <Field label="Navn">
              <Input value={userForm.displayName} onChange={(event) => updateUserForm("displayName", event.target.value)} />
            </Field>
            <Field label="E-post">
              <Input value={userForm.email} onChange={(event) => updateUserForm("email", event.target.value)} />
            </Field>
            <Field label="Brukernavn">
              <Input value={userForm.username} onChange={(event) => updateUserForm("username", event.target.value)} />
            </Field>
            <Field label="Rolle">
              <Dropdown value={roleLabel(userForm.role)} selectedOptions={[userForm.role]} onOptionSelect={(_event, data) => updateUserForm("role", data.optionValue)}>
                <Option value="admin">Administrator</Option>
                <Option value="editor">Redaktør</Option>
                <Option value="viewer">Lesetilgang</Option>
              </Dropdown>
            </Field>
            <Field label="Status">
              <Dropdown value={userForm.status === "active" ? "Aktiv" : "Deaktivert"} selectedOptions={[userForm.status]} onOptionSelect={(_event, data) => updateUserForm("status", data.optionValue)}>
                <Option value="active">Aktiv</Option>
                <Option value="disabled">Deaktivert</Option>
              </Dropdown>
            </Field>
            <Checkbox
              checked={userForm.localEnabled}
              label="Tillat lokal innlogging"
              onChange={(_event, data) => updateUserForm("localEnabled", Boolean(data.checked))}
            />
            {!selectedUser && userForm.localEnabled ? (
              <Field label="Midlertidig passord">
                <Input type="password" value={userForm.password} onChange={(event) => updateUserForm("password", event.target.value)} />
              </Field>
            ) : null}
            <Button appearance="primary" onClick={saveUser}>
              Lagre bruker
            </Button>
          </div>

          {selectedUser ? (
            <>
              <Divider />
              <div className="userAdminForm">
                <Field label="Nytt lokalt passord">
                  <Input type="password" value={passwordDraft} onChange={(event) => setPasswordDraft(event.target.value)} />
                </Field>
                <Button appearance="secondary" disabled={!passwordDraft} onClick={resetUserPassword}>
                  Oppdater passord
                </Button>
              </div>
            </>
          ) : null}
        </Card>
      </div>
    );
  }

  const closeInlineCatalogAdd = React.useCallback(() => {
    setInlineCatalogAdd({ key: null, value: "", description: "", color: "blue" });
    setInlineCatalogPanelPosition(null);
  }, []);

  const updateInlineCatalogPanelPosition = React.useCallback(() => {
    if (typeof window === "undefined" || !inlineCatalogAdd.key) {
      return;
    }

    const trigger = inlineCatalogTriggerRefs.current[inlineCatalogAdd.key];
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const panelWidth = Math.min(420, Math.max(300, inlineCatalogPanelRef.current?.offsetWidth || 336));
    const estimatedHeight = inlineCatalogPanelRef.current?.offsetHeight || (activeInlineCard?.supportsInlineDescription || activeInlineCard?.supportsInlineColor ? 128 : 92);
    const viewportPadding = 16;
    const gap = 6;
    const left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - panelWidth - viewportPadding));
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const showAbove = spaceBelow < estimatedHeight && rect.top > estimatedHeight + viewportPadding;
    const top = showAbove
      ? Math.max(viewportPadding, rect.top - estimatedHeight - gap)
      : Math.min(window.innerHeight - estimatedHeight - viewportPadding, rect.bottom + gap);

    setInlineCatalogPanelPosition({ left, top });
  }, [activeInlineCard?.supportsInlineDescription, inlineCatalogAdd.key]);

  React.useEffect(() => {
    if (!activeInlineCard) {
      setInlineCatalogPanelPosition(null);
      return undefined;
    }

    updateInlineCatalogPanelPosition();

    function handlePointerDown(event) {
      const target = event.target;
      const trigger = inlineCatalogTriggerRefs.current[inlineCatalogAdd.key];
      if (inlineCatalogPanelRef.current?.contains(target) || trigger?.contains(target)) {
        return;
      }
      closeInlineCatalogAdd();
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        closeInlineCatalogAdd();
      }
    }

    function handleViewportChange() {
      updateInlineCatalogPanelPosition();
    }

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [activeInlineCard?.key, closeInlineCatalogAdd, inlineCatalogAdd.key, updateInlineCatalogPanelPosition]);

  function openSettingsItemDialog(card, item = { name: "", description: "" }, index = null) {
    const isEdit = typeof index === "number";
    openDialog({
      title: isEdit ? `Rediger ${item.name}` : `Ny ${card.title.toLowerCase().slice(0, -1)}`,
      initialValue: {
        ...item,
        color: resolveTagColorValue(item?.color)
      },
      fields: [
        { key: "name", label: "Navn" },
        ...(card.key === "tagsCatalog" ? [{ key: "color", label: "Farge", type: "tag_color_picker" }] : []),
        { key: "description", label: "Beskrivelse", type: "textarea" }
      ],
      onSubmit: (draft) => {
        const normalizedName = String(draft.name ?? "").trim();
        if (card.key === "tagsCatalog") {
          const duplicateExists = (appState.settings?.[card.key] ?? []).some(
            (entry, entryIndex) =>
              entryIndex !== index && normalizeCatalogNameKey(entry?.name) === normalizeCatalogNameKey(normalizedName)
          );
          if (duplicateExists) {
            showToast("Merkelappen finnes allerede. Navnet må være unikt.", "error");
            return false;
          }
        }
        updateDraft((nextState) => {
          const nextItem = {
            ...(item ?? {}),
            id:
              item?.id ??
              createCatalogItemId(card.key, normalizedName, new Set((nextState.settings?.[card.key] ?? []).map((entry) => entry?.id).filter(Boolean))),
            name: normalizedName,
            description: draft.description,
            color: card.key === "tagsCatalog" ? resolveTagColorValue(draft.color) : String(item?.color ?? "")
          };
          if (isEdit) {
            nextState.settings[card.key][index] = nextItem;
            return;
          }

          nextState.settings[card.key].push(nextItem);
        });
        showToast(isEdit ? "Verdien er oppdatert." : "Ny verdi er lagt til.");
      }
    });
  }

  function deleteSettingsItem(card, index) {
    const item = settings[card.key]?.[index];
    const targetValue = String(item?.id ?? "").trim();
    const collectionKey = catalogCollectionKeyBySettingsKey[card.key];
    updateDraft((nextState) => {
      nextState.settings[card.key].splice(index, 1);

      if (!targetValue || !collectionKey) {
        return;
      }

      Object.values(nextState.entities ?? {})
        .flat()
        .forEach((record) => {
          if (Array.isArray(record?.collectionValues?.[collectionKey])) {
            record.collectionValues[collectionKey] = record.collectionValues[collectionKey].filter((value) => String(value).trim() !== targetValue);
          }
        });

      Object.values(nextState.records ?? {})
        .filter(Boolean)
        .forEach((record) => {
          if (Array.isArray(record?.collectionValues?.[collectionKey])) {
            record.collectionValues[collectionKey] = record.collectionValues[collectionKey].filter((value) => String(value).trim() !== targetValue);
          }
        });
    });
    showToast("Verdien er fjernet.");
  }

  function submitInlineCatalogValue(card) {
    const normalizedName = String(inlineCatalogAdd.value).trim();
    const normalizedDescription = String(inlineCatalogAdd.description ?? "").trim();
    const normalizedColor = resolveTagColorValue(inlineCatalogAdd.color);
    if (!normalizedName) {
      return;
    }

    const existingNames = new Set((settings[card.key] ?? []).map((item) => normalizeCatalogNameKey(item.name)).filter(Boolean));
    if (existingNames.has(normalizeCatalogNameKey(normalizedName))) {
      showToast(card.key === "tagsCatalog" ? "Merkelappen finnes allerede. Navnet må være unikt." : `${card.title} inneholder allerede denne verdien.`, "error");
      return;
    }

    updateDraft((nextState) => {
      if (!Array.isArray(nextState.settings[card.key])) {
        nextState.settings[card.key] = [];
      }
      const usedIds = new Set(nextState.settings[card.key].map((item) => String(item?.id ?? "").trim()).filter(Boolean));
      nextState.settings[card.key].push({
        id: createCatalogItemId(card.key, normalizedName, usedIds),
        name: normalizedName,
        description: normalizedDescription,
        color: card.key === "tagsCatalog" ? normalizedColor : ""
      });
    });
    closeInlineCatalogAdd();
    showToast(`Ny ${card.singular} er lagt til.`);
  }

  function renderSettingsChipCard(card, className = "") {
    const items = settings[card.key] ?? [];
    const isAdding = inlineCatalogAdd.key === card.key;

    return (
      <Card key={card.key} className={`settingsCard ${className}`.trim()} appearance="filled-alternative">
        <div className="cardHeader">
          <div className="headerStack compact">
            <Title3>{card.title}</Title3>
            <Body1>{card.description}</Body1>
          </div>
        </div>

        <div className="labelChipEditor settingsLabelChipEditor">
          {items.length ? (
            items.map((item, index) => (
              <div key={item.id ?? `${card.key}-${String(item.name).trim().toLowerCase()}`} className="labelChipItem" onDoubleClick={() => openSettingsItemDialog(card, item, index)}>
                <Tooltip
                  content={
                    item.description ? (
                      <div className="tooltipContent">{item.description}</div>
                    ) : (
                      "Ingen beskrivelse registrert."
                    )
                  }
                  relationship="label"
                  showDelay={2000}
                >
                  <Tag className="labelChip" style={card.key === "tagsCatalog" ? resolveTagChipStyle(item.color) : undefined}>{item.name}</Tag>
                </Tooltip>
                <button
                  type="button"
                  className="chipDeleteButton"
                  aria-label={`Slett ${card.singular} ${item.name}`}
                  onClick={() => deleteSettingsItem(card, index)}
                >
                  <DeleteRegular />
                </button>
              </div>
            ))
          ) : (
            <Card appearance="subtle" className="settingsTagsEmptyState">
              <Body1>Ingen {card.title.toLowerCase()} registrert ennå.</Body1>
            </Card>
          )}

          <div className={`dialogTagCreateAnchor ${isAdding ? "isOpen" : ""}`}>
            <button
              ref={(node) => {
                if (node) {
                  inlineCatalogTriggerRefs.current[card.key] = node;
                } else {
                  delete inlineCatalogTriggerRefs.current[card.key];
                }
              }}
              type="button"
              className="labelChipAddButton labelChipAddButton--chip settingsTagAddChip"
              onClick={() => {
                if (isAdding) {
                  closeInlineCatalogAdd();
                  return;
                }
                setInlineCatalogAdd({ key: card.key, value: "", description: "", color: "blue" });
              }}
            >
              <span className="labelChipAddIcon" aria-hidden="true">
                <AddRegular />
              </span>
              <span>Ny {card.singular}</span>
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="settingsPageStack">
      <header className="settingsHeader">
        <div className="headerStack compact">
          <Text size={200} weight="semibold" className="sectionLabel">
            Innstillinger
          </Text>
          <Title2>{activeSettingsItem.label}</Title2>
          <Body1>{activeSettingsItem.description}</Body1>
        </div>
        <Badge appearance={isAccessControlledSettingsTab && isUserAdmin ? "filled" : "outline"}>
          {isAccessControlledSettingsTab ? (isUserAdmin ? "Administrator" : adminAccessStatus === "checking" ? "Kontrollerer tilgang" : "Standard tilgang") : "Lokal innstilling"}
        </Badge>
      </header>
      <div className="settingsWorkspace">
        <nav className="settingsSideNav" aria-label="Innstillinger">
          {settingsNavItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`settingsSideNavItem ${activeSettingsTab === item.key ? "isActive" : ""}`}
              onClick={() => setActiveSettingsTab(item.key)}
            >
              <span className="settingsSideNavIcon" aria-hidden="true">
                <item.icon />
              </span>
              <span className="settingsSideNavCopy">
                <span>{item.label}</span>
                <small>{item.description}</small>
              </span>
            </button>
          ))}
        </nav>
        <div className="settingsContentPanel">
          {activeSettingsTab === "catalogs" ? (
            <>
              <div className="twoColumnGrid">
                {cards.map((card) => renderSettingsChipCard(card))}
              </div>

              {renderSettingsChipCard(tagsCard, "settingsCard--fullWidth")}

              {activeInlineCard && inlineCatalogPanelPosition && typeof document !== "undefined"
                ? createPortal(
                    <div
                      ref={inlineCatalogPanelRef}
                      className="dialogTagCreatePanel settingsTagCreatePanel settingsTagCreatePortal"
                      style={inlineCatalogPanelPosition}
                    >
                      <div className="dialogTagInputChip settingsTagInputChip">
                        <div className="dialogTagInlineNameRow">
                          <input
                            className="dialogTagInlineInput"
                            placeholder={`Ny ${activeInlineCard.singular}`}
                            value={inlineCatalogAdd.value}
                            onChange={(event) => setInlineCatalogAdd((current) => ({ ...current, key: activeInlineCard.key, value: event.target.value }))}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                submitInlineCatalogValue(activeInlineCard);
                              }
                              if (event.key === "Escape") {
                                closeInlineCatalogAdd();
                              }
                            }}
                          />
                          {activeInlineCard.key === "tagsCatalog" ? (
                            <InlineTagColorTrigger
                              ariaLabel="Velg farge for ny merkelapp"
                              value={inlineCatalogAdd.color}
                              onChange={(nextColor) => setInlineCatalogAdd((current) => ({ ...current, key: activeInlineCard.key, color: nextColor }))}
                            />
                          ) : null}
                        </div>
                        {activeInlineCard.supportsInlineDescription ? (
                          <div className="dialogTagDescriptionSlot">
                            <textarea
                              className="dialogTagInlineTextarea"
                              rows={2}
                              placeholder="Kort beskrivelse"
                              value={inlineCatalogAdd.description ?? ""}
                              onChange={(event) => setInlineCatalogAdd((current) => ({ ...current, key: activeInlineCard.key, description: event.target.value }))}
                            />
                          </div>
                        ) : null}
                        <div className="dialogTagCreateActions">
                          <button
                            type="button"
                            className="dialogTagInlineCancel"
                            onClick={closeInlineCatalogAdd}
                          >
                            Avbryt
                          </button>
                          <button
                            type="button"
                            className="dialogTagInlineConfirm"
                            aria-label={`Lagre ny ${activeInlineCard.singular}`}
                            onClick={() => submitInlineCatalogValue(activeInlineCard)}
                          >
                            <CheckmarkRegular />
                          </button>
                        </div>
                      </div>
                    </div>,
                    document.body
                  )
                : null}
            </>
          ) : activeSettingsTab === "users" ? (
            renderUsersTab()
          ) : activeSettingsTab === "apiKeys" ? (
            renderApiKeysTab()
          ) : (
            <Card className="settingsCard settingsCard--fullWidth" appearance="filled-alternative">
              <div className="headerStack compact">
                <Title3>Tema og farger</Title3>
                <Body1>Styr visuell retning for løsningen. Valgene lagres i innstillinger og kan senere kobles videre til rettigheter og utvidet tematikk.</Body1>
              </div>

              <div className="settingsThemeGrid">
                <Field label="Utseende">
                  <RadioGroup
                    value={themePreferences.appearance}
                    onChange={(_event, data) =>
                      updateDraft((nextState) => {
                        nextState.settings.themePreferences.appearance = data.value;
                      })
                    }
                  >
                    <Radio value="light" label="Lyst" />
                    <Radio value="system" label="Følg system" />
                  </RadioGroup>
                </Field>

                <Field label="Flateprofil">
                  <RadioGroup
                    value={themePreferences.surface}
                    onChange={(_event, data) =>
                      updateDraft((nextState) => {
                        nextState.settings.themePreferences.surface = data.value;
                      })
                    }
                  >
                    <Radio value="warm" label="Varm nøytral" />
                    <Radio value="neutral" label="Nøytral grå" />
                    <Radio value="cool" label="Kjølig blågrå" />
                  </RadioGroup>
                </Field>

                <Field className="settingsThemeField--wide" label="Accentfarge">
                  <div className="themeSwatchGrid">
                    {accentOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`themeSwatchButton ${themePreferences.accent === option.value ? "isSelected" : ""}`}
                        onClick={() =>
                          updateDraft((nextState) => {
                            nextState.settings.themePreferences.accent = option.value;
                          })
                        }
                      >
                        <span className="themeSwatchColor" style={{ background: option.color }} />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <Card appearance="subtle" className="themePreviewCard">
                <div className="headerStack compact">
                  <Text weight="semibold">Forhåndsvisning</Text>
                  <Body1>Denne fanen gir et sentralt sted for å styre visuelle valg. Den kan senere kobles til mer komplett tema- og rettighetsstyring.</Body1>
                </div>
                <div className="themePreviewRow">
                  <Badge appearance="filled">Accent</Badge>
                  <Tag className="labelChip">Eksempelmerkelapp</Tag>
                  <Button appearance="primary">Primær handling</Button>
                </div>
              </Card>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function createBlankUserForm() {
  return {
    displayName: "",
    email: "",
    username: "",
    role: "viewer",
    status: "active",
    localEnabled: true,
    password: ""
  };
}

function roleLabel(role) {
  return {
    admin: "Administrator",
    editor: "Redaktør",
    viewer: "Lesetilgang"
  }[getNormalizedRole(role)] ?? "Lesetilgang";
}

function getSessionRole(authSession) {
  return getNormalizedRole(
    authSession?.user?.role ??
      authSession?.role ??
      authSession?.user?.appRole ??
      authSession?.user?.claims?.role ??
      authSession?.user?.claims?.roles?.[0]
  );
}

function getNormalizedRole(role) {
  return String(role ?? "").trim().toLowerCase();
}

function OrganizationStructurePage({ appState, currentScreen, onAction, openDialog, selectedOrgNode, selectedOrgNodeId, setSelectedOrgNodeId, showToast, updateDraft }) {
  const serviceAreas = appState.organizationStructure ?? [];
  const [draggedNodeId, setDraggedNodeId] = React.useState("");
  const [collapsedNodeIds, setCollapsedNodeIds] = React.useState(() => createDefaultHierarchyCollapsedNodeIds(serviceAreas));
  const [treeQuery, setTreeQuery] = React.useState("");
  const organizationName = appState.records?.roles?.fieldValues?.organization_name?.trim?.() || "Organisasjon";
  const [hasCustomizedExpansion, setHasCustomizedExpansion] = React.useState(false);

  const treeData = React.useMemo(() => buildOrganizationTreeData(serviceAreas, organizationName), [organizationName, serviceAreas]);

  const rootNode = treeData;
  const activeNode = selectedOrgNodeId === ORGANIZATION_ROOT_NODE_ID ? rootNode : selectedOrgNode;
  const metrics = [
    { label: "Tjenesteområder", value: serviceAreas.length },
    { label: "Virksomheter", value: serviceAreas.reduce((sum, area) => sum + (area.organizations?.length ?? 0), 0) },
    {
      label: "Avdelinger",
      value: serviceAreas.reduce(
        (sum, area) => sum + (area.organizations ?? []).reduce((innerSum, organization) => innerSum + (organization.departments?.length ?? 0), 0),
        0
      )
    }
  ];

  function findNodeById(node, nodeId) {
    if (!node) {
      return null;
    }

    if (node.id === nodeId) {
      return node;
    }

    for (const child of node.children ?? []) {
      const match = findNodeById(child, nodeId);
      if (match) {
        return match;
      }
    }

    return null;
  }

  function highlightLabel(label, query) {
    if (!query) {
      return label;
    }

    const normalizedLabel = String(label ?? "");
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return normalizedLabel;
    }

    const lowerLabel = normalizedLabel.toLocaleLowerCase("nb");
    const lowerQuery = normalizedQuery.toLocaleLowerCase("nb");
    const matchIndex = lowerLabel.indexOf(lowerQuery);

    if (matchIndex === -1) {
      return normalizedLabel;
    }

    const before = normalizedLabel.slice(0, matchIndex);
    const match = normalizedLabel.slice(matchIndex, matchIndex + normalizedQuery.length);
    const after = normalizedLabel.slice(matchIndex + normalizedQuery.length);

    return (
      <>
        {before}
        <mark className="treeNodeMark">{match}</mark>
        {after}
      </>
    );
  }

  const filteredTree = React.useMemo(() => {
    const normalizedQuery = treeQuery.trim().toLocaleLowerCase("nb");

    if (!normalizedQuery) {
      return {
        root: treeData,
        forcedExpandedIds: new Set([ORGANIZATION_ROOT_NODE_ID]),
        hasMatches: true
      };
    }

    function visit(node) {
      const selfMatch = node.label.toLocaleLowerCase("nb").includes(normalizedQuery);
      const visitedChildren = (node.children ?? []).map(visit).filter(Boolean);
      const hasMatchingDescendants = visitedChildren.length > 0;

      if (node.type === "root" || selfMatch || hasMatchingDescendants) {
        const forcedExpandedIds = new Set();
        visitedChildren.forEach((child) => {
          child.forcedExpandedIds.forEach((id) => forcedExpandedIds.add(id));
        });

        if (hasMatchingDescendants) {
          forcedExpandedIds.add(node.id);
        }

        return {
          node: {
            ...node,
            children: visitedChildren.map((child) => child.node),
            searchState: {
              selfMatch,
              hasMatchingDescendants
            }
          },
          forcedExpandedIds
        };
      }

      return null;
    }

    const visitedRoot = visit(treeData);
    return {
      root: visitedRoot?.node ?? { ...treeData, children: [] },
      forcedExpandedIds: visitedRoot?.forcedExpandedIds ?? new Set([ORGANIZATION_ROOT_NODE_ID]),
      hasMatches: Boolean(visitedRoot?.node?.children?.length)
    };
  }, [treeData, treeQuery]);

  function isNodeExpanded(node) {
    if (!treeQuery && !hasCustomizedExpansion) {
      return nodeHasChildren(node) && (node.level ?? 0) < 2;
    }

    return nodeHasChildren(node) && (!collapsedNodeIds.has(node.id) || filteredTree.forcedExpandedIds.has(node.id));
  }

  function setNodeExpanded(nodeId, shouldExpand) {
    setHasCustomizedExpansion(true);
    setCollapsedNodeIds((previous) => {
      const next = new Set(previous);
      if (shouldExpand) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }

  function toggleNodeExpanded(nodeId) {
    setHasCustomizedExpansion(true);
    setCollapsedNodeIds((previous) => {
      const next = new Set(previous);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }

  function openCreateAreaDialog() {
    openDialog({
      title: "Nytt tjenesteområde",
      initialValue: { name: "", description: "" },
      fields: [
        { key: "name", label: "Navn" },
        { key: "description", label: "Beskrivelse", type: "textarea" }
      ],
      onSubmit: (draft) => {
        const nextArea = createOrganizationAreaRecord({
          name: draft.name,
          description: draft.description
        });
        updateDraft((nextState) => {
          nextState.organizationStructure.push(nextArea);
        });
        setNodeExpanded(ORGANIZATION_ROOT_NODE_ID, true);
        setSelectedOrgNodeId(nextArea.id);
        showToast("Tjenesteområdet er lagt til.");
      }
    });
  }

  function openCreateChildDialog(node = activeNode) {
    if (!node) {
      return;
    }

    if (node.type === "root") {
      openCreateAreaDialog();
      return;
    }

    if (node.type === "serviceArea") {
      openDialog({
        title: "Ny virksomhet",
        initialValue: { name: "", description: "" },
        fields: [
          { key: "name", label: "Navn" },
          { key: "description", label: "Beskrivelse", type: "textarea" }
        ],
        onSubmit: (draft) => {
          const nextOrganization = createOrganizationRecord({
            name: draft.name,
            description: draft.description
          });
          updateDraft((nextState) => {
            nextState.organizationStructure[node.indices.areaIndex].organizations.push(nextOrganization);
          });
          setNodeExpanded(node.id, true);
          setSelectedOrgNodeId(nextOrganization.id);
          showToast("Virksomheten er lagt til.");
        }
      });
      return;
    }

    if (node.type === "organization") {
      openDialog({
        title: "Ny avdeling",
        initialValue: { name: "", description: "" },
        fields: [
          { key: "name", label: "Navn" },
          { key: "description", label: "Beskrivelse", type: "textarea" }
        ],
        onSubmit: (draft) => {
          const nextDepartment = createDepartmentRecord({
            name: draft.name,
            description: draft.description
          });
          updateDraft((nextState) => {
            nextState.organizationStructure[node.indices.areaIndex].organizations[node.indices.organizationIndex].departments.push(nextDepartment);
          });
          setNodeExpanded(node.id, true);
          setSelectedOrgNodeId(nextDepartment.id);
          showToast("Avdelingen er lagt til.");
        }
      });
    }
  }

  function openRenameDialog(node = activeNode) {
    if (!node) {
      return;
    }

    openDialog({
      title: "Gi nytt navn",
      initialValue: { name: node.editValue },
      fields: [{ key: "name", label: "Navn" }],
      onSubmit: (draft) => {
        updateDraft((nextState) => {
          if (node.type === "root") {
            const nextName = String(draft.name ?? "").trim() || "Organisasjon";
            nextState.records.roles.fieldValues = {
              ...(nextState.records.roles.fieldValues ?? {}),
              organization_name: nextName
            };
            nextState.records.roles.breadcrumbs = ["Organisasjon", "Roller", nextName];
            return;
          }

          applyOrganizationRename(nextState.organizationStructure, node, draft.name);
        });
        showToast("Navnet er oppdatert.");
      }
    });
  }

  function openEditDialog(node = activeNode) {
    if (!node || node.type === "root") {
      return;
    }

    openDialog({
      title: "Rediger node",
      initialValue: {
        name: node.details?.name ?? node.editValue,
        description: node.details?.description ?? ""
      },
      fields: [
        { key: "name", label: "Navn", readOnly: true },
        { key: "description", label: "Beskrivelse", type: "textarea" }
      ],
      onSubmit: (draft) => {
        updateDraft((nextState) => {
          applyOrganizationNodeEdit(nextState.organizationStructure, node, draft);
        });
        showToast("Nodeinformasjonen er oppdatert.");
      }
    });
  }

  function deleteSelectedNode(node = activeNode) {
    if (!node || node.type === "root") {
      return;
    }

    let nextSelectedId = "";
    updateDraft((nextState) => {
      removeOrganizationNode(nextState.organizationStructure, node);
      nextSelectedId = resolveOrganizationNode(nextState.organizationStructure, selectedOrgNodeId)
        ? selectedOrgNodeId
        : getFirstOrganizationNodeId(nextState.organizationStructure) || ORGANIZATION_ROOT_NODE_ID;
    });
    setSelectedOrgNodeId(nextSelectedId);
    showToast("Node er slettet.");
  }

  function handleNodeDrop(targetNodeId) {
    if (!draggedNodeId || !targetNodeId || draggedNodeId === targetNodeId) {
      setDraggedNodeId("");
      return;
    }

    let nextSelectedId = draggedNodeId;
    updateDraft((nextState) => {
      nextSelectedId = moveOrganizationNode(nextState.organizationStructure, draggedNodeId, targetNodeId);
    });
    setNodeExpanded(targetNodeId, true);
    setSelectedOrgNodeId(nextSelectedId);
    setDraggedNodeId("");
    showToast("Node er flyttet.");
  }

  function contextActionsForNode(node) {
    if (node.type === "root") {
      return [
        {
          key: "create-area",
          label: "Nytt tjenesteområde",
          icon: <AddRegular />,
          onClick: () => openCreateChildDialog(node)
        }
      ];
    }

    return [
      ...(node.type !== "department"
        ? [
            {
              key: "create-child",
              label: node.type === "serviceArea" ? "Ny virksomhet" : "Ny avdeling",
              icon: <AddRegular />,
              onClick: () => openCreateChildDialog(node)
            }
          ]
        : []),
      {
        key: "rename",
        label: "Gi nytt navn",
        icon: <RenameRegular />,
        onClick: () => openRenameDialog(node)
      },
      {
        key: "edit",
        label: "Rediger",
        icon: <EditRegular />,
        onClick: () => openEditDialog(node)
      },
      {
        key: "delete",
        label: "Slett",
        icon: <DeleteRegular />,
        onClick: () => deleteSelectedNode(node)
      }
    ];
  }

  function renderNodeToolbar(node) {
    return (
      <div className="treeNodeToolbar" role="toolbar" aria-label={`Handlinger for ${node.title}`}>
        {contextActionsForNode(node).map((action) => (
          <Tooltip key={action.key} content={action.label} relationship="label" showDelay={600}>
            <Button
              appearance="subtle"
              size="small"
              icon={action.icon}
              aria-label={action.label}
              className="treeNodeToolbarButton"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSelectedOrgNodeId(node.id);
                action.onClick();
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          </Tooltip>
        ))}
      </div>
    );
  }

  function renderTreeNode(node) {
    const hasChildren = nodeHasChildren(node);
    const expanded = isNodeExpanded(node);
    const level = node.level ?? 0;
    const visualType = node.visualType ?? "unit";
    const rowClassName = `treeNodeButton treeNodeButton--level-${level} treeNodeButton--${visualType} ${selectedOrgNodeId === node.id ? "isSelected" : ""} ${draggedNodeId === node.id ? "isDragging" : ""}`;

    return (
      <div className={`treeNodeShell ${hasChildren ? "hasChildren" : "isLeaf"} ${expanded ? "isExpanded" : "isCollapsed"} level-${level}`}>
        <button
          className={rowClassName}
          onClick={() => {
            setSelectedOrgNodeId(node.id);
            if (hasChildren) {
              toggleNodeExpanded(node.id);
            }
          }}
          type="button"
          role="treeitem"
          aria-expanded={hasChildren ? expanded : undefined}
          draggable={node.type !== "root"}
          onDragStart={() => {
            if (node.type !== "root") {
              setDraggedNodeId(node.id);
            }
          }}
          onDragEnd={() => setDraggedNodeId("")}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            handleNodeDrop(node.id);
          }}
        >
          <span className="treeNodeAccent" aria-hidden="true" />
          <span className="treeNodeLabel">{highlightLabel(node.title, treeQuery)}</span>
          {hasChildren ? (
            <span className={`treeNodeChevron ${expanded ? "isExpanded" : ""}`} aria-hidden="true">
              {expanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
            </span>
          ) : (
            <span className="treeNodeChevron treeNodeChevron--placeholder" aria-hidden="true" />
          )}
        </button>
        {renderNodeToolbar(node)}
      </div>
    );
  }

  function renderDepartmentBranch(department) {
    return (
      <div key={department.id} className="hierarchyBranch">
        <div className="hierarchyNodeRow hierarchyNodeRow--leaf">{renderTreeNode(department)}</div>
      </div>
    );
  }

  function renderOrganizationBranch(organization) {
    return (
      <div key={organization.id} className="hierarchyBranch">
        <div className={`hierarchyNodeRow ${(organization.children ?? []).length ? "hierarchyNodeRow--branch" : "hierarchyNodeRow--leaf"}`}>
          {renderTreeNode(organization)}
        </div>
        {(organization.children ?? []).length && isNodeExpanded(organization) ? (
          <div className="hierarchyChildren" role="group">
            {(organization.children ?? []).map((department) => renderDepartmentBranch(department))}
          </div>
        ) : null}
      </div>
    );
  }

  function renderServiceAreaBranch(area) {
    return (
      <div key={area.id} className="hierarchyBranch">
        <div className={`hierarchyNodeRow ${(area.children ?? []).length ? "hierarchyNodeRow--branch" : "hierarchyNodeRow--leaf"}`}>
          {renderTreeNode(area)}
        </div>
        {(area.children ?? []).length && isNodeExpanded(area) ? (
          <div className="hierarchyChildren" role="group">
            {(area.children ?? []).map((organization) => renderOrganizationBranch(organization))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="pageStack">
      <PageHeader screen={currentScreen} onAction={onAction} />
      <div className="summaryGrid">
        {metrics.map((card) => (
          <Card key={card.label} className="metricCard" appearance="filled-alternative">
            <div className="metricCardContent">
              <Text size={200} weight="medium">
                {card.label}
              </Text>
              <Title2>{card.value}</Title2>
            </div>
          </Card>
        ))}
      </div>

      <Card className="orgPanelCard orgWorkspaceCard" appearance="filled-alternative">
        <div className="cardHeader">
          <div className="headerStack compact">
            <Title3>Hierarki</Title3>
            <Body1>Hold pekeren over en node for handlinger, klikk raden for a aapne eller lukke grener, og dra noder for a omorganisere strukturen.</Body1>
          </div>
        </div>
        <Divider />
        <div className="orgWorkspace isSinglePane">
          <div className="treeToolbar">
            <SearchBox
              className="treeSearch"
              placeholder="Sok i hierarkiet"
              value={treeQuery}
              onChange={(event, data) => setTreeQuery(data?.value ?? event.target.value ?? "")}
            />
          </div>
          <div className="treeContainer">
            <div className="hierarchyTree" role="tree" aria-label="Organisasjonsstruktur">
              <div className="hierarchyBranch hierarchyBranch--root">
                <div className="hierarchyNodeRow hierarchyNodeRow--root hierarchyNodeRow--branch">{renderTreeNode(rootNode)}</div>
                {isNodeExpanded(rootNode) ? (
                  <div className="hierarchyChildren hierarchyChildren--root" role="group">
                    {(filteredTree.root.children ?? []).length ? (
                      filteredTree.root.children.map((area) => renderServiceAreaBranch(area))
                    ) : (
                      <div className="treeEmptyState">
                        <Text>Ingen treff i hierarkiet.</Text>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PlaceholderPage({ currentScreen, onAction }) {
  return (
    <div className="pageStack">
      <PageHeader screen={currentScreen} onAction={onAction} />
      <PlaceholderCard title={currentScreen.title} description={currentScreen.description} />
    </div>
  );
}

function PlaceholderCard({ description, title }) {
  return (
    <Card appearance="filled-alternative">
      <Title3>{title}</Title3>
      <Body1>{description}</Body1>
    </Card>
  );
}

function PageHeader({ record, screen, onAction }) {
  const breadcrumbTitle = record?.breadcrumbs?.[record.breadcrumbs.length - 1];
  const title =
    record?.fieldValues?.name?.trim() ||
    record?.fieldValues?.organization_name?.trim() ||
    (record?.recordKey === "application_draft"
      ? "Ny applikasjon"
      : record?.recordKey === "dataset_draft"
        ? "Nytt datasett"
        : record?.recordKey === "controller_protocol_draft" || record?.recordKey === "processor_protocol_draft"
          ? "Ny behandling"
        : breadcrumbTitle) ||
    screen.title;
  const rawBreadcrumbs = record?.breadcrumbs ?? [sidebarSectionLabel(screen.topSection), screen.title];
  const breadcrumbs = screen.entityKey === "roles" ? rawBreadcrumbs.slice(0, -1) : rawBreadcrumbs;
  const description = record?.description ?? screen.description;

  return (
    <div className="headerStack">
      <div className="breadcrumbRow">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={`${crumb}-${index}`}>
            <Text size={200}>{crumb}</Text>
            {index < breadcrumbs.length - 1 ? <Text size={200}>/</Text> : null}
          </React.Fragment>
        ))}
      </div>
      <div className="pageHeaderRow">
          <div className="pageTitleBlock">
            <Title2>{title}</Title2>
            <Body1>{description}</Body1>
          </div>
        <div className="inlineActionGroup">
          {(screen.actions ?? []).map((action) => (
            <Button key={action.label} appearance={action.tone === "ghost" ? "secondary" : "primary"} onClick={() => onAction(action)}>
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ appState, bootstrap, currentRecord, openDialog, section, showToast, updateDraft }) {
  const fieldValues = currentRecord.fieldValues ?? {};
  const collectionValues = currentRecord.collectionValues ?? {};
  const headerFields = (section.fields ?? []).filter((field) => field.control === "checkbox");
  const bodyFields = (section.fields ?? []).filter((field) => field.control !== "checkbox");
  const headerCollections = (section.collections ?? []).filter((collection) => !(
    collection.itemType === "link" ||
    isChecklistCollectionDefinition(collection, currentRecord) ||
    collection.key === "links" ||
    collection.key === "labels" ||
    Boolean(resolveCatalogCollectionMeta(collection))
  ));

  return (
    <Card className={`sectionCard sectionCard--${section.key}`} appearance="filled-alternative">
      <div className="cardHeader">
        <div className="sectionHeaderCopy">
          <div className="cardTitleRow">
            <Title3>{section.label}</Title3>
            {section.helpText ? <HelpTooltip content={section.helpText} /> : null}
          </div>
          {section.notes?.length ? <Body1 className="sectionSubtitle">{section.notes[0]}</Body1> : null}
        </div>
        {headerFields.length || headerCollections.length ? (
          <div className="sectionHeaderActions">
            {headerFields.map((field) => (
              <Checkbox
                key={field.key}
                checked={Boolean(fieldValues[field.key])}
                label={field.label}
                className="sectionHeaderCheckbox"
                onChange={(_event, data) =>
                  updateDraft((nextState) => {
                    const targetRecord = resolveEditableRecord(nextState, currentRecord);
                    targetRecord.fieldValues[field.key] = data.checked;
                  })
                }
              />
            ))}
            {headerCollections.map((collection) => (
                <CollectionCreateButton
                  key={`${section.key}-${collection.key}-create`}
                  appState={appState}
                  collection={collection}
                  currentRecord={currentRecord}
                  openDialog={openDialog}
                  rows={collectionValues[collection.key] ?? []}
                  showToast={showToast}
                  updateDraft={updateDraft}
                />
              ))}
          </div>
        ) : null}
      </div>

      {bodyFields.length ? (
        <div className="formGrid">
          {bodyFields.map((field) => (
            <FieldControl
              key={field.key}
              appState={appState}
              bootstrap={bootstrap}
              currentRecord={currentRecord}
              field={field}
              value={fieldValues[field.key]}
              onChange={(value) =>
                updateDraft((nextState) => {
                  const targetRecord = resolveEditableRecord(nextState, currentRecord);
                  targetRecord.fieldValues[field.key] = value;
                  if (field.key === "service_area") {
                    targetRecord.fieldValues.organization = "";
                    targetRecord.fieldValues.department = "";
                  }
                  if (field.key === "organization") {
                    targetRecord.fieldValues.department = "";
                  }
                })
              }
            />
          ))}
        </div>
      ) : null}

      {section.criteria?.length && section.repeatingItem ? (
        <div className="criteriaList">
          {section.criteria.map((criterion) => {
            const existingItems = collectionValues[section.key] ?? [];
            const criterionValue = existingItems.find((item) => item.key === criterion.key) ?? {
              key: criterion.key,
              label: criterion.label,
              score: 0,
              comment: ""
            };

            return (
              <Card key={criterion.key} appearance="filled">
                <div className="criteriaHeader">
                  <div className="cardTitleRow">
                    <Text weight="semibold">{criterion.label}</Text>
                    {criterion.helpText ? <HelpTooltip content={criterion.helpText} /> : null}
                  </div>
                  <Badge appearance={criterionValue.score >= 4 ? "filled" : "tint"}>{criterionValue.score || "Ikke vurdert"}</Badge>
                </div>
                <RadioGroup
                  layout="horizontal"
                  value={String(criterionValue.score || "")}
                  onChange={(_event, data) =>
                    updateDraft((nextState) => {
                      const targetRecord = resolveEditableRecord(nextState, currentRecord);
                      const targetList = targetRecord.collectionValues[section.key] ?? [];
                      const targetItem = targetList.find((item) => item.key === criterion.key);
                      if (targetItem) {
                        targetItem.score = Number(data.value);
                      }
                    })
                  }
                >
                  {["1", "2", "3", "4", "5"].map((score) => (
                    <Radio key={score} label={score} value={score} />
                  ))}
                </RadioGroup>
                <Field label="Kommentar">
                  <Textarea
                    resize="vertical"
                    value={criterionValue.comment ?? ""}
                    onChange={(event) =>
                      updateDraft((nextState) => {
                        const targetRecord = resolveEditableRecord(nextState, currentRecord);
                        const targetList = targetRecord.collectionValues[section.key] ?? [];
                        const targetItem = targetList.find((item) => item.key === criterion.key);
                        if (targetItem) {
                          targetItem.comment = event.target.value;
                        }
                      })
                    }
                  />
                </Field>
              </Card>
            );
          })}
        </div>
      ) : null}

      {section.collections?.map((collection) => (
        <CollectionEditor
          appState={appState}
          key={collection.key}
          collection={collection}
          currentRecord={currentRecord}
          openDialog={openDialog}
          rows={collectionValues[collection.key] ?? []}
          showHeader={false}
          showToast={showToast}
          updateDraft={updateDraft}
        />
      ))}
    </Card>
  );
}

function normalizeRepeatingFieldValues(value) {
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

function repeatingFieldSupportsCustomValues(field) {
  return ["collection_enum_or_text", "collection_text_or_search"].includes(field.type);
}

function resolveRepeatingFieldPlaceholder(field, hasOptions) {
  if (field.placeholder) {
    return field.placeholder;
  }

  if (repeatingFieldSupportsCustomValues(field)) {
    return hasOptions ? "Skriv ny eller velg fra listen" : "Skriv ny verdi";
  }

  return "Velg fra listen";
}

function SearchSelectRepeatingField({ field, onChange, options, value }) {
  const [customValue, setCustomValue] = React.useState("");
  const selectedValues = normalizeRepeatingFieldValues(value);
  const optionLabels = new Map(options.map((option) => [String(option.value), option.label ?? String(option.value)]));
  const selectedValueSet = new Set(selectedValues.map((entry) => String(entry)));
  const availableOptions = options.filter((option) => !selectedValueSet.has(String(option.value)));
  const supportsCustomValues = repeatingFieldSupportsCustomValues(field);
  const dropdownPlaceholder = resolveRepeatingFieldPlaceholder(field, availableOptions.length > 0);

  const addValue = (nextValue) => {
    const normalizedValue = String(nextValue ?? "").trim();
    if (!normalizedValue || selectedValueSet.has(normalizedValue)) {
      return;
    }
    onChange([...selectedValues, normalizedValue]);
  };

  const removeValue = (valueToRemove) => {
    const normalizedValue = String(valueToRemove ?? "").trim();
    onChange(selectedValues.filter((entry) => String(entry) !== normalizedValue));
  };

  const submitCustomValue = () => {
    const normalizedInput = customValue.trim();
    if (!normalizedInput) {
      return;
    }

    const matchingOption = options.find((option) => {
      const optionValue = String(option.value ?? "").trim().toLowerCase();
      const optionLabel = String(option.label ?? option.value ?? "").trim().toLowerCase();
      const nextValue = normalizedInput.toLowerCase();
      return optionValue === nextValue || optionLabel === nextValue;
    });

    if (matchingOption) {
      addValue(matchingOption.value);
      setCustomValue("");
      return;
    }

    if (!supportsCustomValues) {
      return;
    }

    addValue(normalizedInput);
    setCustomValue("");
  };

  return (
    <div className="repeatingPicker">
      {selectedValues.length ? (
        <div className="repeatingPickerTags">
          {selectedValues.map((entry) => {
            const normalizedValue = String(entry);
            const label = optionLabels.get(normalizedValue) ?? normalizedValue;
            return (
              <button
                key={normalizedValue}
                type="button"
                className="repeatingPickerTag"
                onClick={() => removeValue(normalizedValue)}
                title={`Fjern ${label}`}
              >
                <span>{label}</span>
                <DeleteRegular />
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="repeatingPickerControls">
        {availableOptions.length ? (
          <Dropdown
            placeholder={dropdownPlaceholder}
            selectedOptions={[]}
            onOptionSelect={(_event, data) => {
              if (data.optionValue) {
                addValue(data.optionValue);
              }
            }}
          >
            {availableOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Dropdown>
        ) : null}

        {supportsCustomValues ? (
          <div className="repeatingPickerCustomRow">
            <SearchBox
              placeholder={availableOptions.length ? "Skriv egen verdi" : dropdownPlaceholder}
              value={customValue}
              onChange={(event) => setCustomValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitCustomValue();
                }
              }}
            />
            <Button appearance="secondary" icon={<AddRegular />} disabled={!customValue.trim()} onClick={submitCustomValue}>
              Legg til
            </Button>
          </div>
        ) : null}

        {!availableOptions.length && !supportsCustomValues ? (
          <Text size={200} className="repeatingPickerHint">
            {options.length === 0
              ? field.empty_state ?? "Ingen tilgjengelige valg."
              : "Alle tilgjengelige valg er allerede lagt til."}
          </Text>
        ) : null}
      </div>
    </div>
  );
}

function FieldControl({ appState, bootstrap, currentRecord, field, onChange, value }) {
  let options = resolveFieldOptions(field, appState, bootstrap);
  const isWideField =
    field.control === "textarea" ||
    field.control === "rich_text" ||
    field.key === "description" ||
    field.key?.includes("description") ||
    field.key?.includes("conditions") ||
    field.key?.includes("notes") ||
    field.key?.includes("contact_info") ||
    field.key?.includes("link");
  const fieldClassName = `formField${isWideField ? " formField--wide" : ""}${["textarea", "rich_text"].includes(field.control) ? " formField--textarea" : ""}`;
  const organizationStructure = appState.organizationStructure ?? [];
  const serviceAreaValue = currentRecord?.fieldValues?.service_area;
  const organizationValue = currentRecord?.fieldValues?.organization;

  if (field.optionSource === "organization_structure.service_area") {
    options = organizationStructure.map((item) => ({ value: item.serviceArea, label: item.serviceArea }));
  }

  if (field.optionSource === "organization_structure.organization") {
    const matchingArea = organizationStructure.find((item) => item.serviceArea === serviceAreaValue);
    options = (matchingArea?.organizations ?? []).map((item) => ({ value: item.name, label: item.name }));
  }

  if (field.optionSource === "organization_structure.department") {
    const matchingArea = organizationStructure.find((item) => item.serviceArea === serviceAreaValue);
    const matchingOrganization = (matchingArea?.organizations ?? []).find((item) => item.name === organizationValue);
    options = (matchingOrganization?.departments ?? []).map((item) => ({ value: item.name, label: item.name }));
  }

  if (field.control === "checkbox") {
    return (
      <div className={fieldClassName}>
        <Field label={field.label}>
          <Checkbox checked={Boolean(value)} label={field.helpText ?? ""} onChange={(_event, data) => onChange(data.checked)} />
        </Field>
      </div>
    );
  }

  if (field.control === "radio" || field.control === "radio_1_to_5") {
    const radioOptions =
      field.control === "radio_1_to_5"
        ? ["1", "2", "3", "4", "5"].map((score) => ({ value: score, label: score }))
        : options.length
          ? options
          : [{ value: "true", label: "Ja" }, { value: "false", label: "Nei" }];

    return (
      <div className={fieldClassName}>
        <Field label={<InlineLabel field={field} />}>
          <RadioGroup layout="horizontal" value={normalizeRadioValue(value)} onChange={(_event, data) => onChange(coerceRadioValue(data.value))}>
            {radioOptions.map((option) => (
              <Radio key={String(option.value)} label={option.label} value={normalizeRadioValue(option.value)} />
            ))}
          </RadioGroup>
        </Field>
      </div>
    );
  }

  if (field.control === "select") {
    const normalizedValue = value == null ? "" : String(value);
    const selectedOption = options.find((option) => String(option.value ?? "") === normalizedValue);

    return (
      <div className={fieldClassName}>
        <Field label={<InlineLabel field={field} />}>
          <Dropdown
            placeholder={field.placeholder ?? "Velg fra listen"}
            selectedOptions={normalizedValue ? [normalizedValue] : []}
            value={selectedOption?.label ?? (normalizedValue || undefined)}
            onOptionSelect={(_event, data) => onChange(data.optionValue ?? "")}
          >
            {options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Dropdown>
        </Field>
      </div>
    );
  }

  if (field.control === "search_select_repeating") {
    return (
      <div className={fieldClassName}>
        <Field label={<InlineLabel field={field} />}>
          <SearchSelectRepeatingField field={field} options={options} value={value} onChange={onChange} />
        </Field>
      </div>
    );
  }

  if (field.control === "file_upload") {
    return (
      <div className={fieldClassName}>
        <Field label={<InlineLabel field={field} />}>
          <FileReferenceInput field={field} value={value} onChange={onChange} showToast={() => {}} />
        </Field>
      </div>
    );
  }

  if (field.control === "rich_text") {
    return (
      <div className={fieldClassName}>
        <Field label={<InlineLabel field={field} />}>
          <RichTextEditor value={value} placeholder={field.placeholder} onChange={onChange} />
        </Field>
      </div>
    );
  }

  if (field.control === "table") {
    const rows = Array.isArray(value) ? value.filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry)) : [];
    const columns = inferColumnsFromRows(rows);

    return (
      <div className={fieldClassName}>
        <Field label={<InlineLabel field={field} />}>
          {rows.length ? (
            <div className="tableWrapper tableWrapper--inline">
              <Table size="medium" className="dataTable" aria-label={field.label}>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHeaderCell key={column}>{column}</TableHeaderCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <TableRow key={`${field.key}-${rowIndex}`}>
                      {columns.map((column) => (
                        <TableCell key={column}>{String(row?.[column] ?? "–") || "–"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card appearance="subtle">
              <Body1>Ingen verdier registrert.</Body1>
            </Card>
          )}
        </Field>
      </div>
    );
  }

  const commonProps = {
    value: value ?? "",
    placeholder: field.placeholder ?? undefined,
    readOnly: field.control === "input_text_disabled",
    disabled: field.control === "input_text_disabled",
    onChange: (event) => onChange(event.target.value)
  };

  return (
    <div className={fieldClassName}>
      <Field label={<InlineLabel field={field} />}>
        {field.control === "textarea" ? (
          <Textarea resize="vertical" {...commonProps} />
        ) : (
          <Input type={field.type === "date" ? "date" : field.type === "integer" || field.type === "number" ? "number" : "text"} {...commonProps} />
        )}
      </Field>
    </div>
  );
}

function RichTextEditor({ value, placeholder, onChange }) {
  const editorRef = React.useRef(null);
  const sanitizedValue = React.useMemo(() => sanitizeRichTextHtml(value), [value]);

  React.useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor || editor.innerHTML === sanitizedValue) {
      return;
    }
    editor.innerHTML = sanitizedValue;
  }, [sanitizedValue]);

  function updateValue() {
    const nextValue = sanitizeRichTextHtml(editorRef.current?.innerHTML ?? "");
    onChange(nextValue);
  }

  function applyCommand(command, commandValue = null) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    updateValue();
  }

  function applyLink() {
    const rawUrl = window.prompt("Lenkeadresse");
    if (rawUrl === null) {
      return;
    }
    const href = normalizeRichTextHref(rawUrl);
    if (!href) {
      applyCommand("unlink");
      return;
    }
    applyCommand("createLink", href);
  }

  const preserveSelection = (event) => event.preventDefault();

  return (
    <div className="richTextEditor">
      <div className="richTextToolbar" aria-label="Formatering">
        <Tooltip content="Fet" relationship="label">
          <Button appearance="subtle" size="small" icon={<TextBoldRegular />} onMouseDown={preserveSelection} onClick={() => applyCommand("bold")} />
        </Tooltip>
        <Tooltip content="Kursiv" relationship="label">
          <Button appearance="subtle" size="small" icon={<TextItalicRegular />} onMouseDown={preserveSelection} onClick={() => applyCommand("italic")} />
        </Tooltip>
        <Tooltip content="Understreking" relationship="label">
          <Button appearance="subtle" size="small" icon={<TextUnderlineRegular />} onMouseDown={preserveSelection} onClick={() => applyCommand("underline")} />
        </Tooltip>
        <Divider vertical />
        <Tooltip content="Punktliste" relationship="label">
          <Button appearance="subtle" size="small" icon={<TextBulletListLtrRegular />} onMouseDown={preserveSelection} onClick={() => applyCommand("insertUnorderedList")} />
        </Tooltip>
        <Tooltip content="Nummerert liste" relationship="label">
          <Button appearance="subtle" size="small" icon={<TextNumberListLtrRegular />} onMouseDown={preserveSelection} onClick={() => applyCommand("insertOrderedList")} />
        </Tooltip>
        <Tooltip content="Lenke" relationship="label">
          <Button appearance="subtle" size="small" icon={<LinkRegular />} onMouseDown={preserveSelection} onClick={applyLink} />
        </Tooltip>
      </div>
      <div
        ref={editorRef}
        className="richTextEditable"
        contentEditable
        data-placeholder={placeholder ?? ""}
        dangerouslySetInnerHTML={{ __html: sanitizedValue }}
        onBlur={updateValue}
        onInput={updateValue}
        onPaste={(event) => {
          event.preventDefault();
          const html = event.clipboardData.getData("text/html");
          const text = event.clipboardData.getData("text/plain");
          document.execCommand("insertHTML", false, sanitizeRichTextHtml(html || text));
          updateValue();
        }}
        role="textbox"
        aria-multiline="true"
        suppressContentEditableWarning
      />
    </div>
  );
}

function sanitizeRichTextHtml(value) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) {
    return "";
  }

  if (typeof document === "undefined") {
    return escapeHtmlText(rawValue).replace(/\n/g, "<br>");
  }

  const sourceHtml = looksLikeHtml(rawValue) ? rawValue : escapeHtmlText(rawValue).replace(/\n/g, "<br>");
  const template = document.createElement("template");
  template.innerHTML = sourceHtml;
  const sanitized = Array.from(template.content.childNodes).map(sanitizeRichTextNode).join("");
  return normalizeEmptyRichText(sanitized);
}

function sanitizeRichTextNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtmlText(node.textContent ?? "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const tagName = node.tagName.toLowerCase();
  const children = Array.from(node.childNodes).map(sanitizeRichTextNode).join("");

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

  if (["ul", "ol"].includes(tagName)) {
    return `<${tagName}>${children}</${tagName}>`;
  }

  if (tagName === "li") {
    return `<li>${children || "<br>"}</li>`;
  }

  if (["p", "div"].includes(tagName)) {
    return `<p>${children || "<br>"}</p>`;
  }

  if (tagName === "a") {
    const href = normalizeRichTextHref(node.getAttribute("href"));
    return href ? `<a href="${escapeHtmlAttribute(href)}" target="_blank" rel="noreferrer">${children || escapeHtmlText(href)}</a>` : children;
  }

  return children;
}

function normalizeEmptyRichText(html) {
  const normalized = String(html ?? "")
    .replace(/<p><br><\/p>/g, "")
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return normalized ? html.trim() : "";
}

function normalizeRichTextHref(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return "";
  }

  if (/^(https?:|mailto:)/i.test(trimmed)) {
    return trimmed;
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return `mailto:${trimmed}`;
  }

  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function escapeHtmlText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlAttribute(value) {
  return escapeHtmlText(value).replace(/"/g, "&quot;");
}

function createOrganizationAffiliation(serviceArea = "", organization = "", department = "") {
  return {
    Tjenesteområde: serviceArea ?? "",
    Virksomhet: organization ?? "",
    Avdeling: department ?? ""
  };
}

function organizationAffiliationKey(entry = {}) {
  return [entry?.Tjenesteområde ?? "", entry?.Virksomhet ?? "", entry?.Avdeling ?? ""].join("||");
}

function formatOrganizationAffiliation(entry = {}) {
  return entry?.Avdeling || entry?.Virksomhet || entry?.Tjenesteområde || "Uten navn";
}

function renderOrganizationAffiliationTooltip(entry = {}) {
  return (
    <div className="tooltipContent">
      <div><strong>Tjenesteområde:</strong> {entry?.Tjenesteområde || "Ikke valgt"}</div>
      <div><strong>Virksomhet:</strong> {entry?.Virksomhet || "Ikke valgt"}</div>
      <div><strong>Avdeling:</strong> {entry?.Avdeling || "Ikke valgt"}</div>
    </div>
  );
}

function resolveCatalogCollectionMeta(collection = {}) {
  const optionSource = String(collection.optionSource ?? "").trim();

  if (["common_component_catalog", "common_components_catalog"].includes(optionSource) || collection.key === "common_components") {
    return {
      settingsKey: "commonComponentsCatalog",
      singularLabel: "felleskomponent",
      pluralLabel: "felleskomponenter",
      emptyMessage: "Ingen eksisterende felleskomponenter funnet."
    };
  }

  if (["standard_catalog", "standards_catalog"].includes(optionSource) || collection.key === "standards") {
    return {
      settingsKey: "standardsCatalog",
      singularLabel: "standard",
      pluralLabel: "standarder",
      emptyMessage: "Ingen eksisterende standarder funnet."
    };
  }

  if (collection.key === "labels") {
    return {
      settingsKey: "tagsCatalog",
      singularLabel: "merkelapp",
      pluralLabel: "merkelapper",
      emptyMessage: "Ingen eksisterende merkelapper funnet."
    };
  }

  return null;
}

function resolveCatalogItems(appState, collection) {
  const meta = resolveCatalogCollectionMeta(collection);
  if (!meta?.settingsKey) {
    return [];
  }
  return appState?.settings?.[meta.settingsKey] ?? [];
}

function resolveCatalogItem(appState, collection, value) {
  const normalizedValue = String(value ?? "").trim();
  if (!normalizedValue) {
    return null;
  }

  const items = resolveCatalogItems(appState, collection);
  return (
    items.find((item) => String(item?.id ?? "").trim() === normalizedValue) ??
    items.find((item) => String(item?.name ?? "").trim().toLowerCase() === normalizedValue.toLowerCase()) ??
    null
  );
}

function resolveCatalogItemLabel(appState, collection, value) {
  return resolveCatalogItem(appState, collection, value)?.name ?? String(value ?? "").trim();
}

function ensureCatalogValues(settings, catalogKey, values = []) {
  if (!catalogKey || !Array.isArray(values) || !values.length) {
    return;
  }

  if (!Array.isArray(settings[catalogKey])) {
    settings[catalogKey] = [];
  }

  const existingItemsById = new Map(
    settings[catalogKey]
      .filter(Boolean)
      .map((item) => [String(item?.id ?? "").trim(), item])
      .filter(([id]) => Boolean(id))
  );
  const existingItemsByName = new Map(
    settings[catalogKey]
      .filter(Boolean)
      .map((item) => [String(item?.name).trim().toLowerCase(), item])
  );
  const usedIds = new Set(existingItemsById.keys());

  values.forEach((value) => {
    const normalizedId = typeof value === "object" && value !== null ? String(value.id ?? "").trim() : "";
    const normalizedValue = typeof value === "object" && value !== null ? String(value.name).trim() : String(value).trim();
    const normalizedDescription = typeof value === "object" && value !== null ? String(value.description ?? "").trim() : "";
    const normalizedColor = typeof value === "object" && value !== null ? String(value.color ?? "").trim() : "";
    if (!normalizedValue && !normalizedId) {
      return;
    }
    const existingItem = (normalizedId && existingItemsById.get(normalizedId)) || existingItemsByName.get(normalizedValue.toLowerCase());
    if (existingItem) {
      if (normalizedValue && !String(existingItem.name ?? "").trim()) {
        existingItem.name = normalizedValue;
      }
      if (normalizedDescription) {
        existingItem.description = normalizedDescription;
      }
      if (normalizedColor) {
        existingItem.color = normalizedColor;
      }
      return;
    }
    const nextItem = {
      id: normalizedId || createCatalogItemId(catalogKey, normalizedValue || normalizedId, usedIds),
      name: normalizedValue || normalizedId,
      description: normalizedDescription,
      color: normalizedColor
    };
    settings[catalogKey].push(nextItem);
    usedIds.add(nextItem.id);
    existingItemsById.set(nextItem.id, nextItem);
    existingItemsByName.set(String(nextItem.name).trim().toLowerCase(), nextItem);
  });
}

function resolveCatalogItemDescription(appState, collection, value) {
  return String(resolveCatalogItem(appState, collection, value)?.description ?? "").trim();
}

const NIS2_CHECKLIST_COLLECTION_KEYS = new Set([
  "scope_and_governance",
  "risk_and_assets_access",
  "protection",
  "detection_and_response",
  "continuity_and_suppliers",
  "training_documentation_improvement"
]);

const GRUNNPRINSIPPER_CHECKLIST_KEY_PATTERN = /^gp_\d+_\d+$/;

function resolveChecklistCollectionKind(collection, currentRecord) {
  const collectionKey = String(collection?.key ?? "").trim();

  if (currentRecord?.entityKey === "nis2" && NIS2_CHECKLIST_COLLECTION_KEYS.has(collectionKey)) {
    return "nis2";
  }

  if (
    currentRecord?.entityKey === "grunnprinsipper_ikt_sikkerhet" &&
    GRUNNPRINSIPPER_CHECKLIST_KEY_PATTERN.test(collectionKey)
  ) {
    return "grunnprinsipper";
  }

  return null;
}

function isChecklistCollectionDefinition(collection, currentRecord) {
  return Boolean(resolveChecklistCollectionKind(collection, currentRecord));
}

function splitDelimitedValues(value) {
  return String(value ?? "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isNis2ChecklistChoiceField(row) {
  const fieldType = String(row?.Felttype ?? "").trim().toLowerCase();
  return fieldType === "dropdown" || fieldType === "radio/options" || splitDelimitedValues(row?.Svaralternativer).length > 0;
}

function resolveNis2ChecklistAnswerField(row) {
  const fieldType = String(row?.Felttype ?? "").trim().toLowerCase();
  const options = splitDelimitedValues(row?.Svaralternativer);

  if (fieldType === "textarea") {
    return {
      key: "nis2_status_textarea",
      label: "Dokumentasjon",
      control: "textarea",
      placeholder: "Beskriv status, nåsituasjon eller dokumentasjon"
    };
  }

  if (fieldType === "date") {
    return {
      key: "nis2_status_date",
      label: "Dato",
      control: "input_text",
      type: "date"
    };
  }

  if (fieldType === "file upload") {
    return {
      key: "nis2_status_file",
      label: "Vedlegg eller lenke",
      control: "file_upload",
      placeholder: "Lim inn lokal sti eller URL"
    };
  }

  if (fieldType === "dropdown" || fieldType === "radio/options" || options.length) {
    return {
      key: "nis2_status_select",
      label: "Status",
      control: "select",
      placeholder: "Velg fra listen",
      options: options.includes("Ikke vurdert") ? options : ["Ikke vurdert", ...options]
    };
  }

  return {
    key: "nis2_status_text",
    label: "Svar",
    control: "input_text",
    placeholder: "Skriv inn svar"
  };
}

function resolveNis2ChecklistAnswerValue(row) {
  const rawValue = row?.Status;

  if (isNis2ChecklistChoiceField(row)) {
    const normalizedRawValue = String(rawValue ?? "").trim();
    return normalizedRawValue || "Ikke vurdert";
  }

  if (String(row?.Felttype ?? "").trim().toLowerCase() === "file upload") {
    const normalizedRawValue = String(rawValue ?? "").trim();
    if (!normalizedRawValue || normalizedRawValue.toLowerCase() === "ikke vurdert") {
      return "";
    }
    return normalizeFileReferenceValue(rawValue);
  }

  const normalizedRawValue = String(rawValue ?? "").trim();
  return normalizedRawValue === "Ikke vurdert" ? "" : normalizedRawValue;
}

function resolveGrunnprinsipperChecklistAnswerField() {
  return {
    key: "grunnprinsipp_status",
    label: "Status",
    control: "select",
    placeholder: "Velg status",
    options: ["Ikke vurdert", "Etablert", "Delvis etablert", "Ikke etablert", "Ikke relevant"]
  };
}

function resolveGrunnprinsipperChecklistAnswerValue(row) {
  return String(row?.Status ?? "").trim() || "Ikke vurdert";
}

function resolveChecklistAnswerField(kind, row) {
  if (kind === "nis2") {
    return resolveNis2ChecklistAnswerField(row);
  }

  return resolveGrunnprinsipperChecklistAnswerField();
}

function resolveChecklistAnswerValue(kind, row) {
  if (kind === "nis2") {
    return resolveNis2ChecklistAnswerValue(row);
  }

  return resolveGrunnprinsipperChecklistAnswerValue(row);
}

function resolveChecklistPriorityAppearance(priority) {
  const normalizedPriority = String(priority ?? "").trim().toLowerCase();

  if (/^\d+$/.test(normalizedPriority)) {
    if (normalizedPriority === "1") {
      return "filled";
    }

    if (normalizedPriority === "2") {
      return "tint";
    }

    return "outline";
  }

  if (normalizedPriority.startsWith("h")) {
    return "filled";
  }

  if (normalizedPriority.startsWith("m")) {
    return "tint";
  }

  return "outline";
}

function formatChecklistReferenceLabel(reference, index) {
  try {
    return new URL(reference).hostname.replace(/^www\./i, "");
  } catch {
    return `Kilde ${index + 1}`;
  }
}

function CollectionCreateButton({ appState, collection, currentRecord, openDialog, rows, showToast, updateDraft }) {
  return (
    <Button
      appearance="secondary"
      className="sectionAddButton"
      onClick={() =>
        openCollectionEditorDialog({
          appState,
          collection,
          currentRecord,
          mode: "create",
          openDialog,
          rows,
          showToast,
          updateDraft
        })
      }
    >
      Legg til
    </Button>
  );
}

function isFileReferenceColumn(column) {
  const normalizedColumn = String(column ?? "").trim().toLowerCase();
  return ["fil", "dokument", "vedlegg", "attachment", "file"].includes(normalizedColumn);
}

function normalizeCollectionDraftValue(collection, draftValue, columns = []) {
  if (!draftValue || typeof draftValue !== "object" || Array.isArray(draftValue)) {
    return draftValue;
  }

  let nextValue = draftValue;
  columns.forEach((column) => {
    if (!isFileReferenceColumn(column)) {
      return;
    }

    const normalizedFileReference = normalizeFileReferenceValue(draftValue[column]);
    if (nextValue === draftValue) {
      nextValue = { ...draftValue };
    }
    nextValue[column] = normalizedFileReference;
  });

  if (collection.itemType === "file_reference" && Object.prototype.hasOwnProperty.call(nextValue, "Fil")) {
    nextValue.Fil = normalizeFileReferenceValue(nextValue.Fil);
  }

  return nextValue;
}

function openCollectionEditorDialog({ appState, collection, currentRecord, mode, openDialog, row, rowIndex, rows, showToast, updateDraft }) {
  const isScalarCollection = rows.every((row) => row === null || ["string", "number", "boolean"].includes(typeof row));
  const isControllerDatasetRelationCollection = currentRecord?.entityKey === "controller_protocol" && collection.key === "datasets";
  const columns = isControllerDatasetRelationCollection
    ? ["Navn", "Rolle"]
    : collection.columns?.length
      ? collection.columns
      : collection.itemType === "agreement"
        ? ["Leverandør / Part", "Dato inngått", "Sist revidert", "Dokument"]
      : inferColumnsFromRows(rows);
  const isOrganizationAffiliations = collection.key === "organization_affiliations";
  const isApplicationDatasetRelationCollection = collection.key === "application_dataset_relations";
  const isDatasetApplicationRelationCollection = collection.key === "application_relations";
  const isRelatedApplicationCollection = collection.key === "related_applications";
  const isRelatedDatasetCollection = collection.key === "related_datasets";
  const isRelatedProcessingActivityCollection = collection.key === "related_processing_activities";
  const isLabelCollection = collection.key === "labels";
  const isLinkCollection = collection.itemType === "link" || collection.key === "links";
  const isFileReferenceCollection = collection.itemType === "file_reference";
  const isDocumentReferenceCollection = collection.itemType === "document_or_reference";
  const catalogCollectionMeta = resolveCatalogCollectionMeta(collection);
  const isCatalogReferenceCollection = Boolean(catalogCollectionMeta) && isScalarCollection && !isLabelCollection;
  const availableDatasetOptions = (isApplicationDatasetRelationCollection || isRelatedDatasetCollection || isControllerDatasetRelationCollection)
    ? (appState?.entities?.dataset ?? [])
        .filter((record) => !isRelatedDatasetCollection || String(record?.id ?? "").trim() !== String(currentRecord?.id ?? "").trim())
        .map((record) => ({
          value: String(record?.id ?? "").trim(),
          label: resolveDatasetReferenceLabel(appState?.entities?.dataset ?? [], record),
          description: String(record?.fieldValues?.purpose ?? record?.fieldValues?.description ?? "").trim()
        }))
        .filter((option) => option.value && option.label)
        .sort((left, right) => left.label.localeCompare(right.label, "nb"))
    : [];
  const availableApplicationOptions = (isRelatedApplicationCollection || isDatasetApplicationRelationCollection)
    ? (appState?.entities?.application ?? [])
        .filter((record) => String(record?.id ?? "").trim() !== String(currentRecord?.id ?? "").trim())
        .map((record) => ({
          value: String(record?.id ?? "").trim(),
          label: resolveApplicationReferenceLabel(appState?.entities?.application ?? [], record),
          description: String(record?.fieldValues?.description ?? "").trim()
        }))
        .filter((option) => option.value && option.label)
        .sort((left, right) => left.label.localeCompare(right.label, "nb"))
    : [];
  const availableProcessingActivityOptions = isRelatedProcessingActivityCollection
    ? (appState?.entities?.controller_protocol ?? [])
        .map((record) => ({
          value: String(record?.id ?? "").trim(),
          label: resolveProcessingActivityReferenceLabel(appState?.entities?.controller_protocol ?? [], record),
          description: resolveProcessingActivityReferencePurpose(appState?.entities?.controller_protocol ?? [], record)
        }))
        .filter((option) => option.value && option.label)
        .sort((left, right) => left.label.localeCompare(right.label, "nb"))
    : [];
  const availableLabels = Array.from(
    new Map(
      (appState?.settings?.tagsCatalog ?? [])
        .filter((item) => item?.id && item?.name)
        .map((item) => [
          String(item.id).trim(),
          {
            value: String(item.id).trim(),
            label: String(item.name).trim(),
            color: String(item.color ?? ""),
            description: String(item.description ?? "").trim()
          }
        ])
    ).values()
  ).sort((left, right) => left.label.localeCompare(right.label, "nb"));
  const availableCatalogValues = isCatalogReferenceCollection
    ? Array.from(
        new Map(
          (appState?.settings?.[catalogCollectionMeta.settingsKey] ?? [])
            .filter((item) => item?.id && item?.name)
            .map((item) => [
              String(item.id).trim(),
              {
                value: String(item.id).trim(),
                label: String(item.name).trim(),
                description: String(item.description ?? "").trim()
              }
            ])
        ).values()
      ).sort((left, right) => left.label.localeCompare(right.label, "nb"))
    : [];
  const pickerFieldKey = mode === "create" ? "selectedValues" : "selectedValue";
  const customMetaKey = `${pickerFieldKey}__customMeta`;

  function createChipPickerField(key, multiple) {
    const fallbackOptions = isLabelCollection ? availableLabels : availableCatalogValues;
    return {
      key,
      label: multiple ? `Velg ${catalogCollectionMeta.pluralLabel}` : `Velg ${catalogCollectionMeta.singularLabel}`,
      type: multiple ? "tag_picker_multi" : "tag_picker",
      options: fallbackOptions,
      emptyMessage: catalogCollectionMeta.emptyMessage,
      addButtonLabel: `Ny ${catalogCollectionMeta.singularLabel}`,
      addPlaceholder: `Ny ${catalogCollectionMeta.singularLabel}`,
      addDescriptionPlaceholder: "Kort beskrivelse",
      valueLabel: multiple ? catalogCollectionMeta.pluralLabel : catalogCollectionMeta.singularLabel,
      supportsDescription: isCatalogReferenceCollection || isLabelCollection,
      catalogKey: catalogCollectionMeta.settingsKey,
      supportsCreate: isLabelCollection
    };
  }

  const fieldDefinitions = (isLabelCollection || isCatalogReferenceCollection) && mode === "create"
      ? [createChipPickerField("selectedValues", true)]
      : (isLabelCollection || isCatalogReferenceCollection)
        ? [createChipPickerField("selectedValue", false)]
      : isApplicationDatasetRelationCollection
      ? [
          {
            key: "DatasetId",
            label: "Datasett",
            type: "select",
            options: availableDatasetOptions
          },
          {
            key: "Rolle",
            label: "Rolle",
            type: "text"
          }
        ]
      : isControllerDatasetRelationCollection
      ? [
          {
            key: "DatasetId",
            label: "Datasett",
            type: "select",
            options: availableDatasetOptions
          },
          {
            key: "Rolle",
            label: "Rolle",
            type: "text"
          }
        ]
      : isDatasetApplicationRelationCollection
      ? [
          {
            key: "ApplicationId",
            label: "Applikasjon",
            type: "select",
            options: availableApplicationOptions
          },
          {
            key: "Rolle",
            label: "Rolle",
            type: "text"
          }
        ]
      : isRelatedApplicationCollection
      ? [
          {
            key: "ApplicationId",
            label: "Applikasjon",
            type: "select",
            options: availableApplicationOptions
          },
          {
            key: "Relasjon",
            label: "Relasjon",
            type: "text"
          }
        ]
      : isRelatedDatasetCollection
      ? [
          {
            key: "DatasetId",
            label: "Datasett",
            type: "select",
            options: availableDatasetOptions
          },
          {
            key: "Relasjon",
            label: "Relasjon",
            type: "text"
          }
        ]
      : isRelatedProcessingActivityCollection
      ? [
          {
            key: "ProcessingActivityId",
            label: "Behandling",
            type: "select",
            options: availableProcessingActivityOptions
          }
        ]
      : isOrganizationAffiliations
      ? [
          {
            key: "selectedAffiliations",
            label: mode === "edit" ? "Velg organisasjonstilknytning" : "Velg en eller flere organisasjonstilknytninger",
            type: "organization_affiliation_picker",
            required: true,
            multiple: mode !== "edit"
          }
        ]
      : isLinkCollection
        ? [
            { key: "title", label: "Lenketittel", type: "text" },
            { key: "url", label: "URL", type: "text" },
            { key: "description", label: "Beskrivelse", type: "textarea" },
            { key: "icon", label: "Symbol", type: "icon_picker" }
          ]
      : isDocumentReferenceCollection && isScalarCollection
        ? [{ key: "value", label: collection.label, type: "file_reference", placeholder: "Lim inn lokal sti eller URL" }]
      : isScalarCollection
        ? [{ key: "value", label: collection.label, type: "text" }]
        : columns.map((column) => {
            const normalizedColumn = column.toLowerCase();
            const isLongTextColumn =
              normalizedColumn.includes("beskrivelse") ||
              normalizedColumn.includes("kommentar") ||
              normalizedColumn.includes("referanse") ||
              normalizedColumn.includes("kilde");

            return {
              key: column,
              label: column,
              type: isFileReferenceColumn(column) ? "file_reference" : isLongTextColumn ? "textarea" : "text",
              placeholder: isFileReferenceColumn(column) ? "Lim inn lokal sti eller URL" : undefined
            };
          });

    const initialValue = (isLabelCollection || isCatalogReferenceCollection) && mode === "create"
      ? {
          selectedValues: []
        }
      : (isLabelCollection || isCatalogReferenceCollection)
        ? { selectedValue: row ?? "" }
      : isOrganizationAffiliations
      ? {
          selectedAffiliations: row ? [createOrganizationAffiliation(row?.Tjenesteområde, row?.Virksomhet, row?.Avdeling)] : []
        }
      : isLinkCollection
        ? {
            icon: resolveLinkIconKey(row?.Icon),
            title: row?.Lenke ?? row?.link ?? "",
            url: row?.Url ?? (/^https?:\/\//i.test(String(row?.Lenke ?? row?.link ?? "").trim()) ? String(row?.Lenke ?? row?.link ?? "").trim() : ""),
            description: row?.Beskrivelse ?? row?.description ?? ""
          }
      : isApplicationDatasetRelationCollection
        ? {
            DatasetId: String(resolveDatasetReferenceRecord(appState?.entities?.dataset ?? [], row)?.id ?? row?.DatasetId ?? row?.datasetId ?? "").trim(),
            Rolle: String(row?.Rolle ?? row?.role ?? "").trim()
          }
      : isControllerDatasetRelationCollection
        ? {
            DatasetId: String(resolveDatasetReferenceRecord(appState?.entities?.dataset ?? [], row)?.id ?? row?.DatasetId ?? row?.datasetId ?? "").trim(),
            Rolle: String(row?.Rolle ?? row?.role ?? "").trim()
          }
      : isDatasetApplicationRelationCollection
        ? {
            ApplicationId: String(resolveApplicationReferenceRecord(appState?.entities?.application ?? [], row)?.id ?? row?.ApplicationId ?? row?.applicationId ?? "").trim(),
            Rolle: String(row?.Rolle ?? row?.role ?? "").trim()
          }
      : isRelatedApplicationCollection
        ? {
            ApplicationId: String(resolveApplicationReferenceRecord(appState?.entities?.application ?? [], row)?.id ?? row?.ApplicationId ?? row?.applicationId ?? "").trim(),
            Relasjon: String(row?.Relasjon ?? row?.relation ?? "").trim()
          }
      : isRelatedDatasetCollection
        ? {
            DatasetId: String(resolveDatasetReferenceRecord(appState?.entities?.dataset ?? [], row)?.id ?? row?.DatasetId ?? row?.datasetId ?? "").trim(),
            Relasjon: String(row?.Relasjon ?? row?.relation ?? "").trim()
          }
      : isRelatedProcessingActivityCollection
        ? {
            ProcessingActivityId: String(
              resolveProcessingActivityReferenceRecord(appState?.entities?.controller_protocol ?? [], row)?.id ??
                row?.ProcessingActivityId ??
                row?.processingActivityId ??
                row?.ControllerProtocolId ??
                row?.controllerProtocolId ??
                ""
            ).trim()
          }
      : isDocumentReferenceCollection && isScalarCollection
        ? { value: normalizeFileReferenceValue(row ?? "") }
      : isScalarCollection
        ? { value: row ?? "" }
        : normalizeCollectionDraftValue(collection, row ?? Object.fromEntries(columns.map((column) => [column, ""])), columns);

  openDialog({
    title: mode === "edit" ? `Rediger ${collection.label}` : `Legg til ${collection.label.toLowerCase()}`,
    initialValue,
    fields: fieldDefinitions,
    onSubmit: (draft) => {
      let submitSucceeded = true;
      updateDraft((nextState) => {
        const targetRecord = resolveEditableRecord(nextState, currentRecord);
        const targetRows = targetRecord.collectionValues[collection.key] ?? [];
        if (!targetRecord.collectionValues[collection.key]) {
          targetRecord.collectionValues[collection.key] = targetRows;
        }
        const nextValue = (isLabelCollection || isCatalogReferenceCollection) && mode === "create"
          ? (Array.isArray(draft.selectedValues) ? draft.selectedValues.map((item) => String(item).trim()).filter(Boolean) : [])
          : (isLabelCollection || isCatalogReferenceCollection)
          ? String(draft.selectedValue ?? "").trim()
          : isApplicationDatasetRelationCollection
          ? {
              DatasetId: String(draft.DatasetId ?? "").trim(),
              Navn: resolveDatasetReferenceLabel(appState?.entities?.dataset ?? [], draft.DatasetId),
              Rolle: String(draft.Rolle ?? "").trim()
            }
          : isControllerDatasetRelationCollection
          ? {
              DatasetId: String(draft.DatasetId ?? "").trim(),
              Navn: resolveDatasetReferenceLabel(appState?.entities?.dataset ?? [], draft.DatasetId),
              Rolle: String(draft.Rolle ?? "").trim()
            }
          : isDatasetApplicationRelationCollection
          ? {
              ApplicationId: String(draft.ApplicationId ?? "").trim(),
              Navn: resolveApplicationReferenceLabel(appState?.entities?.application ?? [], draft.ApplicationId),
              Versjon: resolveApplicationReferenceVersion(appState?.entities?.application ?? [], draft.ApplicationId),
              Rolle: String(draft.Rolle ?? "").trim()
            }
          : isRelatedApplicationCollection
          ? {
              ApplicationId: String(draft.ApplicationId ?? "").trim(),
              Navn: resolveApplicationReferenceLabel(appState?.entities?.application ?? [], draft.ApplicationId),
              Relasjon: String(draft.Relasjon ?? "").trim()
            }
          : isRelatedDatasetCollection
          ? {
              DatasetId: String(draft.DatasetId ?? "").trim(),
              Navn: resolveDatasetReferenceLabel(appState?.entities?.dataset ?? [], draft.DatasetId),
              Relasjon: String(draft.Relasjon ?? "").trim()
            }
          : isRelatedProcessingActivityCollection
          ? {
              ProcessingActivityId: String(draft.ProcessingActivityId ?? "").trim(),
              Navn: resolveProcessingActivityReferenceLabel(appState?.entities?.controller_protocol ?? [], draft.ProcessingActivityId),
              "Formål": resolveProcessingActivityReferencePurpose(appState?.entities?.controller_protocol ?? [], draft.ProcessingActivityId)
            }
          : isOrganizationAffiliations
          ? (Array.isArray(draft.selectedAffiliations) ? draft.selectedAffiliations.map((entry) => createOrganizationAffiliation(
              entry?.Tjenesteområde,
              entry?.Virksomhet,
              entry?.Avdeling
            )) : [])
          : isLinkCollection
            ? {
                Icon: resolveLinkIconKey(draft.icon),
                Lenke: String(draft.title ?? "").trim(),
                Url: String(draft.url ?? "").trim(),
                Beskrivelse: String(draft.description ?? "").trim()
              }
            : isDocumentReferenceCollection && isScalarCollection
            ? normalizeFileReferenceValue(draft.value)
            : isScalarCollection
            ? draft.value
            : normalizeCollectionDraftValue(collection, draft, columns);
        const customMeta = draft?.[customMetaKey] ?? {};

        if ((isLabelCollection || isCatalogReferenceCollection) && mode === "create" && !nextValue.length) {
          submitSucceeded = false;
          return;
        }

        if ((isLabelCollection || isCatalogReferenceCollection) && mode === "edit" && !nextValue) {
          submitSucceeded = false;
          return;
        }

        if (isApplicationDatasetRelationCollection && !nextValue.DatasetId) {
          submitSucceeded = false;
          return;
        }

        if (isControllerDatasetRelationCollection && !nextValue.DatasetId) {
          submitSucceeded = false;
          return;
        }

        if (isDatasetApplicationRelationCollection && !nextValue.ApplicationId) {
          submitSucceeded = false;
          return;
        }

        if (isRelatedApplicationCollection && !nextValue.ApplicationId) {
          submitSucceeded = false;
          return;
        }

        if (isRelatedDatasetCollection && !nextValue.DatasetId) {
          submitSucceeded = false;
          return;
        }

        if (isRelatedProcessingActivityCollection && !nextValue.ProcessingActivityId) {
          submitSucceeded = false;
          return;
        }

        if (isOrganizationAffiliations && !nextValue.length) {
          submitSucceeded = false;
          return;
        }

        if (isLinkCollection && !nextValue.Lenke) {
          submitSucceeded = false;
          return;
        }

        if (isDocumentReferenceCollection && isScalarCollection && !resolveFileReferenceLabel(nextValue)) {
          submitSucceeded = false;
          return;
        }

        if (isFileReferenceCollection && !resolveFileReferenceLabel(nextValue?.Fil)) {
          submitSucceeded = false;
          return;
        }

        const existingValues = targetRows.map((entry, index) => (mode === "edit" && index === rowIndex ? null : String(entry).trim()));
        if ((isLabelCollection || isCatalogReferenceCollection) && mode === "create") {
          const uniqueNewValues = nextValue.filter((value, index) => nextValue.indexOf(value) === index);
          const valuesToAdd = uniqueNewValues.filter((value) => !existingValues.includes(value));
          if (!valuesToAdd.length) {
            submitSucceeded = false;
            return;
          }
          targetRows.push(...valuesToAdd);
          ensureCatalogValues(
            nextState.settings,
            catalogCollectionMeta?.settingsKey,
            valuesToAdd.map((value) => ({
              id: value,
              name: String(customMeta?.[value]?.name ?? resolveCatalogItemLabel({ settings: nextState.settings }, collection, value)).trim(),
              description: String(customMeta?.[value]?.description ?? "").trim(),
              color: String(customMeta?.[value]?.color ?? "")
            }))
          );
          return;
        }

        if (isOrganizationAffiliations) {
          const existingAffiliationKeys = new Set(
            targetRows
              .map((entry, index) => (mode === "edit" && index === rowIndex ? null : organizationAffiliationKey(entry)))
              .filter(Boolean)
          );

          if (mode === "create") {
            const valuesToAdd = nextValue.filter((entry, index) => {
              const nextKey = organizationAffiliationKey(entry);
              return nextValue.findIndex((candidate) => organizationAffiliationKey(candidate) === nextKey) === index && !existingAffiliationKeys.has(nextKey);
            });

            if (!valuesToAdd.length) {
              submitSucceeded = false;
              return;
            }

            targetRows.push(...valuesToAdd);
            return;
          }

          const replacement = nextValue[0];
          if (!replacement || existingAffiliationKeys.has(organizationAffiliationKey(replacement))) {
            submitSucceeded = false;
            return;
          }

          targetRows[rowIndex] = replacement;
          return;
        }

        if (isApplicationDatasetRelationCollection) {
          const existingDatasetIds = targetRows
            .map((entry, index) => (mode === "edit" && index === rowIndex ? "" : String(entry?.DatasetId ?? entry?.datasetId ?? "").trim()))
            .filter(Boolean);

          if (existingDatasetIds.includes(nextValue.DatasetId)) {
            submitSucceeded = false;
            return;
          }

          if (mode === "edit") {
            targetRows[rowIndex] = nextValue;
          } else {
            targetRows.push(nextValue);
          }
          return;
        }

        if (isControllerDatasetRelationCollection) {
          const existingDatasetIds = targetRows
            .map((entry, index) => (mode === "edit" && index === rowIndex ? "" : String(entry?.DatasetId ?? entry?.datasetId ?? "").trim()))
            .filter(Boolean);

          if (existingDatasetIds.includes(nextValue.DatasetId)) {
            submitSucceeded = false;
            return;
          }

          if (mode === "edit") {
            targetRows[rowIndex] = nextValue;
          } else {
            targetRows.push(nextValue);
          }
          return;
        }

        if (isDatasetApplicationRelationCollection) {
          const existingApplicationIds = targetRows
            .map((entry, index) => (mode === "edit" && index === rowIndex ? "" : String(entry?.ApplicationId ?? entry?.applicationId ?? "").trim()))
            .filter(Boolean);

          if (existingApplicationIds.includes(nextValue.ApplicationId)) {
            submitSucceeded = false;
            return;
          }

          if (mode === "edit") {
            targetRows[rowIndex] = nextValue;
          } else {
            targetRows.push(nextValue);
          }
          return;
        }

        if (isRelatedApplicationCollection) {
          const existingApplicationIds = targetRows
            .map((entry, index) => (mode === "edit" && index === rowIndex ? "" : String(entry?.ApplicationId ?? entry?.applicationId ?? "").trim()))
            .filter(Boolean);

          if (existingApplicationIds.includes(nextValue.ApplicationId)) {
            submitSucceeded = false;
            return;
          }

          if (mode === "edit") {
            targetRows[rowIndex] = nextValue;
          } else {
            targetRows.push(nextValue);
          }
          return;
        }

        if (isRelatedDatasetCollection) {
          const existingDatasetIds = targetRows
            .map((entry, index) => (mode === "edit" && index === rowIndex ? "" : String(entry?.DatasetId ?? entry?.datasetId ?? "").trim()))
            .filter(Boolean);

          if (existingDatasetIds.includes(nextValue.DatasetId)) {
            submitSucceeded = false;
            return;
          }

          if (mode === "edit") {
            targetRows[rowIndex] = nextValue;
          } else {
            targetRows.push(nextValue);
          }
          return;
        }

        if (isRelatedProcessingActivityCollection) {
          const existingProcessingActivityIds = targetRows
            .map((entry, index) => (mode === "edit" && index === rowIndex ? "" : String(entry?.ProcessingActivityId ?? entry?.processingActivityId ?? entry?.ControllerProtocolId ?? entry?.controllerProtocolId ?? "").trim()))
            .filter(Boolean);

          if (existingProcessingActivityIds.includes(nextValue.ProcessingActivityId)) {
            submitSucceeded = false;
            return;
          }

          if (mode === "edit") {
            targetRows[rowIndex] = nextValue;
          } else {
            targetRows.push(nextValue);
          }
          return;
        }

        if ((isLabelCollection || isCatalogReferenceCollection) && existingValues.includes(nextValue)) {
          submitSucceeded = false;
          return;
        }

        if (mode === "edit") {
          targetRows[rowIndex] = nextValue;
          ensureCatalogValues(nextState.settings, catalogCollectionMeta?.settingsKey, [
            {
              id: nextValue,
              name: String(customMeta?.[nextValue]?.name ?? resolveCatalogItemLabel({ settings: nextState.settings }, collection, nextValue)).trim(),
              description: String(customMeta?.[nextValue]?.description ?? "").trim(),
              color: String(customMeta?.[nextValue]?.color ?? "")
            }
          ]);
        } else {
          targetRows.push(nextValue);
        }
      });
      if (!submitSucceeded) {
        showToast(
          isLinkCollection
            ? "Lenketittel er påkrevd."
            : isFileReferenceCollection
            ? "Velg en fil eller legg inn en ekstern referanse."
            : isDocumentReferenceCollection && isScalarCollection
            ? "Legg inn en fil, sti eller URL."
            : isApplicationDatasetRelationCollection
            ? "Velg et datasett som finnes i datasettregisteret, og unngå duplikater på samme applikasjon."
            : isRelatedApplicationCollection
            ? "Velg en applikasjon som finnes i applikasjonsregisteret, og unngå duplikater på samme post."
            : isOrganizationAffiliations
            ? "Velg en eller flere organisasjonstilknytninger som ikke allerede finnes på posten."
            : `Velg ${mode === "create" ? "en eller flere" : "en"} eksisterende ${catalogCollectionMeta?.pluralLabel ?? "verdier"} eller opprett ${mode === "create" ? "nye" : "en ny"} som ikke allerede finnes på posten.`,
          "error"
        );
        return false;
      }
      showToast(
        (isLabelCollection || isCatalogReferenceCollection) && mode === "create"
          ? `${collection.label} er lagt til.`
          : mode === "edit"
            ? "Raden er oppdatert."
            : "Ny rad er lagt til."
      );
    }
  });
}

function CollectionEditor({ appState, collection, currentRecord, openDialog, rows, showHeader = true, showToast, updateDraft }) {
  const isScalarCollection = rows.every((row) => row === null || ["string", "number", "boolean"].includes(typeof row));
  const isControllerDatasetRelationCollection = currentRecord?.entityKey === "controller_protocol" && collection.key === "datasets";
  const columns = isControllerDatasetRelationCollection
    ? ["Navn", "Rolle"]
    : collection.columns?.length
      ? collection.columns
      : collection.itemType === "agreement"
        ? ["Leverandør / Part", "Dato inngått", "Sist revidert", "Dokument"]
      : inferColumnsFromRows(rows);
  const isOrganizationAffiliations = collection.key === "organization_affiliations";
  const isApplicationDatasetRelationCollection = collection.key === "application_dataset_relations";
  const isDatasetApplicationRelationCollection = collection.key === "application_relations";
  const isRelatedApplicationCollection = collection.key === "related_applications";
  const isRelatedDatasetCollection = collection.key === "related_datasets";
  const isRelatedProcessingActivityCollection = collection.key === "related_processing_activities";
  const isLabelCollection = collection.key === "labels";
  const isLinkCollection = collection.itemType === "link" || collection.key === "links";
  const isFileReferenceCollection = collection.itemType === "file_reference";
  const isDocumentReferenceCollection = collection.itemType === "document_or_reference";
  const checklistCollectionKind = resolveChecklistCollectionKind(collection, currentRecord);
  const isChecklistCollection = Boolean(checklistCollectionKind);
  const catalogCollectionMeta = resolveCatalogCollectionMeta(collection);
  const isCatalogReferenceCollection = Boolean(catalogCollectionMeta) && isScalarCollection && !isLabelCollection;
  const datasetRecords = appState?.entities?.dataset ?? [];
  const applicationRecords = appState?.entities?.application ?? [];
  const processingActivityRecords = appState?.entities?.controller_protocol ?? [];

  function deleteRow(rowIndex) {
    updateDraft((nextState) => {
      const targetRecord = resolveEditableRecord(nextState, currentRecord);
      targetRecord.collectionValues[collection.key].splice(rowIndex, 1);
    });
    showToast("Raden er slettet.");
  }

  function openRowDialog(mode, row, rowIndex) {
    openCollectionEditorDialog({
      appState,
      collection,
      currentRecord,
      mode,
      openDialog,
      row,
      rowIndex,
      rows,
      showToast,
      updateDraft
    });
  }

  function updateChecklistRow(rowIndex, key, value) {
    updateDraft((nextState) => {
      const targetRecord = resolveEditableRecord(nextState, currentRecord);
      if (!Array.isArray(targetRecord.collectionValues[collection.key])) {
        targetRecord.collectionValues[collection.key] = [];
      }
      const targetRow = targetRecord.collectionValues[collection.key][rowIndex];
      if (!targetRow) {
        return;
      }
      targetRow[key] = value ?? "";
    });
  }

  function renderLinkTitle(row) {
    const linkValue = String(row?.Lenke ?? row?.link ?? "").trim();
    const linkHref = String(row?.Url ?? row?.url ?? "").trim() || (/^https?:\/\//i.test(linkValue) ? linkValue : "");
    if (linkHref) {
      return (
        <a className="linkCardAnchor" href={linkHref} rel="noreferrer" target="_blank">
          {linkValue || linkHref}
        </a>
      );
    }

    return <Text weight="semibold">{linkValue || "Uten lenke"}</Text>;
  }

  function renderLinkCardIcon(row) {
    return (
      <span className="linkCardGlyph" aria-hidden="true">
        {renderLinkIcon(row?.Icon)}
      </span>
    );
  }

  function renderFileReferenceCell(value) {
    const normalizedValue = normalizeFileReferenceValue(value);
    if (!normalizedValue) {
      return "–";
    }

    const href = resolveFileReferenceHref(normalizedValue);
    const label = resolveFileReferenceLabel(normalizedValue) || "Uten navn";
    const externalSource = String(normalizedValue.source ?? "").trim();
    const secondaryText = normalizedValue.kind === "upload"
      ? [normalizedValue.mimeType || "Lagret i databasen", formatFileSize(normalizedValue.sizeBytes)].filter(Boolean).join(" • ")
      : externalSource && externalSource !== label
        ? externalSource
        : "";

    return (
      <div className="fileReferenceCell">
        {href ? (
          <a className="fileReferencePreviewLink" href={href} rel="noreferrer" target="_blank">
            {label}
          </a>
        ) : (
          <Text weight="medium">{label}</Text>
        )}
        {secondaryText ? <Text size={200}>{secondaryText}</Text> : null}
      </div>
    );
  }

  function renderCollectionTableCell(row, column) {
    if (isFileReferenceValue(row?.[column])) {
      return renderFileReferenceCell(row?.[column]);
    }

    if (isApplicationDatasetRelationCollection && column === "Navn") {
      const label = resolveDatasetReferenceLabel(datasetRecords, row);
      const route = resolveDatasetReferenceRoute(datasetRecords, row);

      if (route) {
        return (
          <a className="linkCardAnchor" href={route}>
            {label || "Uten navn"}
          </a>
        );
      }

      return label || "–";
    }

    if (isControllerDatasetRelationCollection && column === "Navn") {
      const label = resolveDatasetReferenceLabel(datasetRecords, row);
      const route = resolveDatasetReferenceRoute(datasetRecords, row);

      if (route) {
        return (
          <a className="linkCardAnchor" href={route}>
            {label || "Uten navn"}
          </a>
        );
      }

      return label || "–";
    }

    if (isDatasetApplicationRelationCollection && column === "Navn") {
      const label = resolveApplicationReferenceLabel(applicationRecords, row);
      const route = resolveApplicationReferenceRoute(applicationRecords, row);

      if (route) {
        return (
          <a className="linkCardAnchor" href={route}>
            {label || "Uten navn"}
          </a>
        );
      }

      return label || "–";
    }

    if (isDatasetApplicationRelationCollection && column === "Versjon") {
      return resolveApplicationReferenceVersion(applicationRecords, row) || "–";
    }

    if (isRelatedApplicationCollection && column === "Navn") {
      const label = resolveApplicationReferenceLabel(applicationRecords, row);
      const route = resolveApplicationReferenceRoute(applicationRecords, row);

      if (route) {
        return (
          <a className="linkCardAnchor" href={route}>
            {label || "Uten navn"}
          </a>
        );
      }

      return label || "–";
    }

    if (isRelatedDatasetCollection && column === "Navn") {
      const label = resolveDatasetReferenceLabel(datasetRecords, row);
      const route = resolveDatasetReferenceRoute(datasetRecords, row);

      if (route) {
        return (
          <a className="linkCardAnchor" href={route}>
            {label || "Uten navn"}
          </a>
        );
      }

      return label || "–";
    }

    if (isRelatedProcessingActivityCollection && column === "Navn") {
      const label = resolveProcessingActivityReferenceLabel(processingActivityRecords, row);
      const route = resolveProcessingActivityReferenceRoute(processingActivityRecords, row);

      if (route) {
        return (
          <a className="linkCardAnchor" href={route}>
            {label || "Uten navn"}
          </a>
        );
      }

      return label || "–";
    }

    if (isRelatedProcessingActivityCollection && column === "Formål") {
      return resolveProcessingActivityReferencePurpose(processingActivityRecords, row) || "–";
    }

    return renderCollectionCell(row?.[column]);
  }

  return (
    <div className="collectionBlock">
      {showHeader && !isLinkCollection && !isLabelCollection && !isCatalogReferenceCollection && !isChecklistCollection ? (
        <div className="cardHeader">
          <div />
          <CollectionCreateButton
            appState={appState}
            collection={collection}
            currentRecord={currentRecord}
            openDialog={openDialog}
            rows={rows}
            showToast={showToast}
            updateDraft={updateDraft}
          />
        </div>
      ) : null}

      {isChecklistCollection ? (
        <div className="nis2ChecklistStack">
          {rows.length ? (
            rows.map((row, rowIndex) => {
              const isNis2Checklist = checklistCollectionKind === "nis2";
              const answerField = resolveChecklistAnswerField(checklistCollectionKind, row);
              const answerValue = resolveChecklistAnswerValue(checklistCollectionKind, row);
              const responsibleRoles = splitDelimitedValues(row?.["Ansvarlig rolle"]);
              const references = splitDelimitedValues(row?.Referanse);
              const isoReferences = splitDelimitedValues(row?.["ISO 27002"]);
              const principleLabel = [row?.["GP-ID"], row?.Grunnprinsipp].filter(Boolean).join(" ").trim();
              const specification = String(row?.Spesifisering ?? "").trim();
              const cardKey = isNis2Checklist
                ? String(row?.ID ?? rowIndex)
                : String(row?.["Tiltak ID"] ?? row?.["Nr."] ?? rowIndex);
              const cardTitle = isNis2Checklist
                ? String(row?.["Spørsmål"] ?? "Uten spørsmål").trim()
                : String(row?.Tiltaksoverskrift ?? "Uten tiltak").trim();
              const cardDescription = isNis2Checklist
                ? String(row?.Beskrivelse ?? "").trim()
                : String(row?.Tiltaksbeskrivelse ?? "").trim();
              const badges = isNis2Checklist
                ? [
                    row?.ID ? { key: "id", label: String(row.ID).trim(), appearance: "outline" } : null,
                    row?.Prioritet
                      ? {
                          key: "priority",
                          label: String(row.Prioritet).trim(),
                          appearance: resolveChecklistPriorityAppearance(row.Prioritet)
                        }
                      : null
                  ].filter(Boolean)
                : [
                    row?.["Tiltak ID"]
                      ? { key: "tiltak", label: String(row["Tiltak ID"]).trim(), appearance: "outline" }
                      : null,
                    row?.Prioritet
                      ? {
                          key: "priority",
                          label: `Prioritet ${String(row.Prioritet).trim()}`,
                          appearance: resolveChecklistPriorityAppearance(row.Prioritet)
                        }
                      : null
                  ].filter(Boolean);
              const metaSections = isNis2Checklist
                ? [
                    responsibleRoles.length
                      ? {
                          label: "Ansvarlig rolle",
                          items: responsibleRoles.map((role) => ({ key: role, label: role }))
                        }
                      : null,
                    references.length
                      ? {
                          label: "Referanse",
                          items: references.map((reference, referenceIndex) => ({
                            key: `${referenceIndex}-${reference}`,
                            label: /^https?:\/\//i.test(reference)
                              ? formatChecklistReferenceLabel(reference, referenceIndex)
                              : reference,
                            href: /^https?:\/\//i.test(reference) ? reference : ""
                          }))
                        }
                      : null
                  ].filter(Boolean)
                : [
                    principleLabel
                      ? {
                          label: "Grunnprinsipp",
                          items: [{ key: principleLabel, label: principleLabel }]
                        }
                      : null,
                    specification
                      ? {
                          label: "Spesifisering",
                          items: [{ key: specification, label: specification }]
                        }
                      : null,
                    isoReferences.length
                      ? {
                          label: "ISO 27002",
                          items: isoReferences.map((reference) => ({ key: reference, label: reference }))
                        }
                      : null
                  ].filter(Boolean);

              return (
                <Card key={`${collection.key}-${cardKey}`} className="nis2ChecklistCard" appearance="filled-alternative">
                  <div className="nis2ChecklistHeader">
                    <div className="nis2ChecklistTitleBlock">
                      <Text className="nis2ChecklistQuestion" weight="semibold">
                        {cardTitle}
                      </Text>
                      {cardDescription ? <Body1 className="nis2ChecklistDescription">{cardDescription}</Body1> : null}
                    </div>
                    <div className="nis2ChecklistBadges">
                      {badges.map((badge) => (
                        <Badge key={`${cardKey}-${badge.key}`} appearance={badge.appearance}>
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {metaSections.length ? (
                    <div className="nis2ChecklistMetaGrid">
                      {metaSections.map((section) => (
                        <div key={`${cardKey}-${section.label}`} className="nis2ChecklistMetaSection">
                          <Text className="nis2ChecklistMetaLabel" weight="medium">{section.label}</Text>
                          <div className="nis2ChecklistMetaTokens">
                            {section.items.map((item) =>
                              item.href ? (
                                <a
                                  key={`${cardKey}-${section.label}-${item.key}`}
                                  className="nis2ChecklistMetaToken nis2ChecklistMetaToken--link"
                                  href={item.href}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  {item.label}
                                </a>
                              ) : (
                                <span key={`${cardKey}-${section.label}-${item.key}`} className="nis2ChecklistMetaToken">
                                  {item.label}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="nis2ChecklistFields">
                    <FieldControl
                      appState={appState}
                      bootstrap={null}
                      currentRecord={currentRecord}
                      field={answerField}
                      value={answerValue}
                      onChange={(value) => updateChecklistRow(rowIndex, "Status", value)}
                    />
                    <FieldControl
                      appState={appState}
                      bootstrap={null}
                      currentRecord={currentRecord}
                      field={{
                        key: isNis2Checklist ? "nis2_comment" : "grunnprinsipp_comment",
                        label: "Kommentar og oppfølging",
                        control: isNis2Checklist ? "textarea" : "rich_text",
                        placeholder: isNis2Checklist
                          ? "Beskriv vurdering, funn, avvik eller neste steg"
                          : "Beskriv modenhet, lokal vurdering, avvik eller planlagt oppfølging"
                      }}
                      value={String(row?.Kommentar ?? "")}
                      onChange={(value) => updateChecklistRow(rowIndex, "Kommentar", value)}
                    />
                  </div>
                </Card>
              );
            })
          ) : (
            <Card appearance="subtle">
              <Body1>{collection.emptyState ?? "Ingen verdier registrert."}</Body1>
            </Card>
          )}
        </div>
      ) : isOrganizationAffiliations ? (
        <div className="labelChipEditor organizationAffiliationChipEditor">
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <div key={`affiliation-${organizationAffiliationKey(row)}`} className="labelChipItem" onDoubleClick={() => openRowDialog("edit", row, rowIndex)}>
                <Tooltip content={renderOrganizationAffiliationTooltip(row)} relationship="label" showDelay={800}>
                  <Tag className="labelChip">{formatOrganizationAffiliation(row)}</Tag>
                </Tooltip>
                <button
                  type="button"
                  className="chipDeleteButton"
                  aria-label={`Slett organisasjonstilknytning ${formatOrganizationAffiliation(row)}`}
                  onClick={() => deleteRow(rowIndex)}
                >
                  <DeleteRegular />
                </button>
              </div>
            ))
          ) : (
            <Card appearance="subtle">
              <Body1>{collection.emptyState ?? "Ingen verdier registrert."}</Body1>
            </Card>
          )}
        </div>
      ) : isLinkCollection ? (
        <div className="linkCardGrid">
          {rows.length ? (
            <>
              {rows.map((row, rowIndex) => (
                <div
                  key={`${collection.key}-${rowIndex}`}
                  className="linkCardWrap"
                  onDoubleClick={() => openRowDialog("edit", row, rowIndex)}
                >
                  <div className="linkCardToolbar" aria-label="Handlinger for lenke">
                    <Tooltip content="Rediger" relationship="label">
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<EditRegular />}
                        aria-label="Rediger"
                        className="tableActionButton iconActionButton linkCardToolbarButton"
                        onClick={() => openRowDialog("edit", row, rowIndex)}
                      />
                    </Tooltip>
                    <Tooltip content="Slett" relationship="label">
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<DeleteRegular />}
                        aria-label="Slett"
                        className="tableActionButton iconActionButton linkCardToolbarButton"
                        onClick={() => deleteRow(rowIndex)}
                      />
                    </Tooltip>
                  </div>
                  <Card
                    className="linkCard"
                    appearance="filled-alternative"
                  >
                    <div className="linkCardHeader">
                      <div className="linkCardTitle">
                        {renderLinkCardIcon(row)}
                        {renderLinkTitle(row)}
                      </div>
                    </div>
                    {row?.Beskrivelse ? <Body1 className="linkCardDescription">{row.Beskrivelse}</Body1> : null}
                  </Card>
                </div>
              ))}
              <button
                type="button"
                className="linkCard linkCardAdd"
                onClick={() => openRowDialog("create")}
                aria-label={`Legg til ${collection.label.toLowerCase()}`}
              >
                <span className="linkCardAddIcon">
                  <AddRegular />
                </span>
                <Text className="linkCardAddText" weight="medium">
                  Ny lenke
                </Text>
              </button>
            </>
          ) : (
            <>
              <Card appearance="subtle">
                <Body1>{collection.emptyState ?? "Ingen verdier registrert."}</Body1>
              </Card>
              <button
                type="button"
                className="linkCard linkCardAdd"
                onClick={() => openRowDialog("create")}
                aria-label={`Legg til ${collection.label.toLowerCase()}`}
              >
                <span className="linkCardAddIcon">
                  <AddRegular />
                </span>
                <Text className="linkCardAddText" weight="medium">
                  Ny lenke
                </Text>
              </button>
            </>
          )}
        </div>
      ) : isDocumentReferenceCollection && isScalarCollection ? (
        <div className="listStack">
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <div key={`${collection.key}-${rowIndex}`} className="listRow simpleValueRow" onDoubleClick={() => openRowDialog("edit", row, rowIndex)}>
                <div className="listRowContent">
                  {renderFileReferenceCell(row)}
                </div>
                <div className="inlineActionGroup tableActionGroup">
                  <Tooltip content="Rediger" relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<EditRegular />}
                      aria-label="Rediger"
                      className="tableActionButton iconActionButton"
                      onClick={() => openRowDialog("edit", row, rowIndex)}
                    />
                  </Tooltip>
                  <Tooltip content="Slett" relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<DeleteRegular />}
                      aria-label="Slett"
                      className="tableActionButton iconActionButton"
                      onClick={() => deleteRow(rowIndex)}
                    />
                  </Tooltip>
                </div>
              </div>
            ))
          ) : (
            <Card appearance="subtle">
              <Body1>{collection.emptyState ?? "Ingen verdier registrert."}</Body1>
            </Card>
          )}
        </div>
      ) : isScalarCollection ? (
        isLabelCollection || isCatalogReferenceCollection ? (
          <div className="labelChipEditor">
            {rows.length ? (
              <>
                {rows.map((row, rowIndex) => (
                  <div
                    key={`label-${String(row).trim().toLowerCase()}`}
                    className="labelChipItem"
                    onDoubleClick={isLabelCollection ? () => openRowDialog("edit", row, rowIndex) : undefined}
                  >
                    <Tooltip
                      content={
                        resolveCatalogItemDescription(appState, collection, row) ? (
                          <div className="tooltipContent">{resolveCatalogItemDescription(appState, collection, row)}</div>
                        ) : (
                          resolveCatalogItemLabel(appState, collection, row)
                        )
                      }
                      relationship="label"
                      showDelay={2000}
                    >
                      <Tag
                        className="labelChip"
                        style={isLabelCollection ? resolveTagChipStyle(resolveCatalogItem(appState, collection, row)?.color) : undefined}
                      >
                        {resolveCatalogItemLabel(appState, collection, row)}
                      </Tag>
                    </Tooltip>
                    <button
                      type="button"
                      className="chipDeleteButton"
                      aria-label={`Slett ${catalogCollectionMeta?.singularLabel ?? "verdi"} ${resolveCatalogItemLabel(appState, collection, row)}`}
                      onClick={() => deleteRow(rowIndex)}
                    >
                      <DeleteRegular />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={`labelChipAddButton${isLabelCollection || isCatalogReferenceCollection ? " labelChipAddButton--chip" : ""}`}
                  aria-label={`Legg til ${collection.label.toLowerCase()}`}
                  onClick={() => openRowDialog("create")}
                >
                  <span className="labelChipAddIcon" aria-hidden="true">
                    <AddRegular />
                  </span>
                  <span>Legg til</span>
                </button>
              </>
            ) : (
              <>
                <Card appearance="subtle">
                  <Body1>{collection.emptyState ?? "Ingen verdier registrert."}</Body1>
                </Card>
                <button
                  type="button"
                  className={`labelChipAddButton${isLabelCollection || isCatalogReferenceCollection ? " labelChipAddButton--chip" : ""}`}
                  aria-label={`Legg til ${collection.label.toLowerCase()}`}
                  onClick={() => openRowDialog("create")}
                >
                  <span className="labelChipAddIcon" aria-hidden="true">
                    <AddRegular />
                  </span>
                  <span>Legg til</span>
                </button>
              </>
            )}
          </div>
        ) : (
        <div className="listStack">
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <div key={`${collection.key}-${rowIndex}`} className="listRow simpleValueRow" onDoubleClick={() => openRowDialog("edit", row, rowIndex)}>
                <div className="listRowContent">
                  <Text>{String(row)}</Text>
                </div>
                <div className="inlineActionGroup tableActionGroup">
                  <Tooltip content="Rediger" relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<EditRegular />}
                      aria-label="Rediger"
                      className="tableActionButton iconActionButton"
                      onClick={() => openRowDialog("edit", row, rowIndex)}
                    />
                  </Tooltip>
                  <Tooltip content="Slett" relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<DeleteRegular />}
                      aria-label="Slett"
                      className="tableActionButton iconActionButton"
                      onClick={() => deleteRow(rowIndex)}
                    />
                  </Tooltip>
                </div>
              </div>
            ))
          ) : (
            <Card appearance="subtle">
              <Body1>{collection.emptyState ?? "Ingen verdier registrert."}</Body1>
            </Card>
          )}
        </div>
        )
      ) : (
        <DataTable
          columns={columns.map((column) => ({ key: column, label: column }))}
          emptyState={collection.emptyState ?? "Ingen verdier registrert."}
          rows={rows}
          renderRow={(row, rowIndex) => (
            <TableRow key={`${collection.key}-${rowIndex}`} onDoubleClick={() => openRowDialog("edit", row, rowIndex)}>
              {columns.map((column) => (
                <TableCell key={column}>{renderCollectionTableCell(row, column)}</TableCell>
              ))}
              <TableCell className="actionsCell">
                <div className="inlineActionGroup tableActionGroup">
                  <Tooltip content="Rediger" relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<EditRegular />}
                      aria-label="Rediger"
                      className="tableActionButton iconActionButton"
                      onClick={() => openRowDialog("edit", row, rowIndex)}
                    />
                  </Tooltip>
                  <Tooltip content="Slett" relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<DeleteRegular />}
                      aria-label="Slett"
                      className="tableActionButton iconActionButton"
                      onClick={() => deleteRow(rowIndex)}
                    />
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          )}
        />
      )}
    </div>
  );
}

function DataTable({ columns, emptyState, renderRow, rows }) {
  return (
    <div className="tableWrapper">
      <Table size="medium" className="dataTable" aria-label="Data table">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHeaderCell key={column.key}>{column.label}</TableHeaderCell>
            ))}
            <TableHeaderCell className="actionsHeaderCell">
              <span className="actionsHeaderContent">Handlinger</span>
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row, index) => renderRow(row, index))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1}>
                <Body1>{emptyState}</Body1>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function InlineLabel({ field }) {
  return (
    <div className="inlineFieldLabel">
      <span>{field.label}</span>
      {field.helpText ? <HelpTooltip content={field.helpText} /> : null}
    </div>
  );
}

function HelpTooltip({ content }) {
  return (
    <Tooltip content={<div className="tooltipContent">{content}</div>} relationship="label">
      <span className="helpCircle">?</span>
    </Tooltip>
  );
}

function renderInventoryBadgeCell(screen, index, cell) {
  const badgeColumns = {
    application: [3, 4],
    dataset: [2, 3],
    controller_protocol: [3, 4],
    processor_protocol: [3, 4]
  }[screen.entityKey] ?? [];

  if (!badgeColumns.includes(index)) {
    return cell;
  }

  return <Badge appearance={index === 3 ? "tint" : "outline"}>{cell}</Badge>;
}

function sectionSpanStyle(screen, sectionKey) {
  const layout = screen.sectionLayouts?.[sectionKey];
  const span = Math.max(3, Math.min(layout?.span ?? 12, 12));
  return { gridColumn: `span ${span}` };
}
