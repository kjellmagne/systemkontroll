import {
  applicationInventoryItems,
  controllerProtocolInventoryItems,
  datasetInventoryItems,
  mockRecords,
  organizationStructureData,
  processorProtocolInventoryItems,
  settingsCatalogs
} from "../public/screen-specs.js";
import { normalizeAppState } from "../frontend/src/utils.js";

function createLegacyDefaultState() {
  return structuredClone({
    applicationItems: applicationInventoryItems,
    controllerProtocolItems: controllerProtocolInventoryItems,
    datasetItems: datasetInventoryItems,
    processorProtocolItems: processorProtocolInventoryItems,
    organizationStructure: organizationStructureData,
    records: mockRecords,
    settings: settingsCatalogs
  });
}

export function createDefaultPersistedState() {
  return normalizeAppState(createLegacyDefaultState());
}

export function normalizePersistedState(payload) {
  const legacyDefaults = createLegacyDefaultState();
  const defaults = createDefaultPersistedState();
  const candidate = isPlainObject(payload) ? payload : {};

  return normalizeAppState({
    entities: normalizeObject(candidate.entities, defaults.entities),
    applicationItems: normalizeArray(candidate.applicationItems, legacyDefaults.applicationItems),
    controllerProtocolItems: normalizeArray(candidate.controllerProtocolItems, legacyDefaults.controllerProtocolItems),
    datasetItems: normalizeArray(candidate.datasetItems, legacyDefaults.datasetItems),
    processorProtocolItems: normalizeArray(candidate.processorProtocolItems, legacyDefaults.processorProtocolItems),
    organizationStructure: normalizeArray(candidate.organizationStructure, legacyDefaults.organizationStructure),
    records: normalizeObject(candidate.records, defaults.records),
    settings: normalizeObject(candidate.settings, defaults.settings)
  });
}

function normalizeArray(value, fallback) {
  return Array.isArray(value) ? value : structuredClone(fallback);
}

function normalizeObject(value, fallback) {
  return isPlainObject(value) ? value : structuredClone(fallback);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
