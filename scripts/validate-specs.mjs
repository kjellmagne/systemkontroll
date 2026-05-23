import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import YAML from "yaml";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), "..");
const sourcePath = path.join(rootDir, "SystemKontroll_strukturer_med_hjelpetekster.yaml");
const specsPath = pathToFileURL(path.join(rootDir, "public", "screen-specs.js")).href;

const rawYaml = await readFile(sourcePath, "utf8");
const parsed = YAML.parse(rawYaml);
const { componentMap, screenRegistry } = await import(specsPath);

const errors = [];
const structures = parsed.structures ?? {};

const controlsInYaml = new Set();
for (const structure of Object.values(structures)) {
  for (const tab of structure.tabs ?? []) {
    for (const section of tab.sections ?? []) {
      for (const field of section.fields ?? []) {
        if (field.control) {
          controlsInYaml.add(field.control);
        }
      }
    }
  }
  for (const section of structure.sections ?? []) {
    for (const field of section.fields ?? []) {
      if (field.control) {
        controlsInYaml.add(field.control);
      }
    }
  }
}

for (const control of controlsInYaml) {
  if (!componentMap[control]) {
    errors.push(`Missing component mapping for control "${control}".`);
  }
}

function getEntityScreen(entityKey, family) {
  return screenRegistry.find((screen) => screen.entityKey === entityKey && screen.pageFamily === family);
}

for (const [entityKey, structure] of Object.entries(structures)) {
  if (structure.tabs?.length) {
    const screen = getEntityScreen(entityKey, "EntityDetailPage");
    if (!screen) {
      errors.push(`Missing EntityDetailPage screen for "${entityKey}".`);
      continue;
    }
    if (screen.tabSource !== "model") {
      errors.push(`Entity "${entityKey}" must use tabSource="model".`);
    }

    const knownTabKeys = new Set((structure.tabs ?? []).map((tab) => tab.key));
    for (const tabKey of Object.keys(screen.tabModes ?? {})) {
      if (!knownTabKeys.has(tabKey)) {
        errors.push(`Unknown tab override "${tabKey}" on entity "${entityKey}".`);
      }
    }
    for (const sectionKey of Object.keys(screen.sectionLayouts ?? {})) {
      const knownSection = (structure.tabs ?? []).some((tab) =>
        (tab.sections ?? []).some((section) => section.key === sectionKey)
      );
      if (!knownSection) {
        errors.push(`Unknown section layout "${sectionKey}" on entity "${entityKey}".`);
      }
    }
  } else {
    const screen = getEntityScreen(entityKey, "AdminSectionsPage");
    if (!screen) {
      errors.push(`Missing AdminSectionsPage screen for "${entityKey}".`);
      continue;
    }
    if (screen.sectionSource !== "model") {
      errors.push(`Entity "${entityKey}" must use sectionSource="model".`);
    }

    const knownSectionKeys = new Set((structure.sections ?? []).map((section) => section.key));
    for (const sectionKey of Object.keys(screen.sectionLayouts ?? {})) {
      if (!knownSectionKeys.has(sectionKey)) {
        errors.push(`Unknown section layout "${sectionKey}" on admin entity "${entityKey}".`);
      }
    }
  }
}

const datasetInventory = screenRegistry.find(
  (screen) => screen.entityKey === "dataset" && screen.pageFamily === "InventoryListPage"
);

if (!datasetInventory) {
  errors.push('Missing InventoryListPage screen for "dataset".');
} else {
  const requiredListFields = ["idLabel", "lastUpdated", "statusBadge", "hostingBadge", "rowActions", "filterDefinitions", "secondaryInsights"];
  for (const field of requiredListFields) {
    if (!(field in datasetInventory)) {
      errors.push(`Dataset inventory screen must expose "${field}".`);
    }
  }
}

if (errors.length) {
  console.error("Validation failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Validation passed.");
console.log(`Mapped ${Object.keys(structures).length} entities and ${controlsInYaml.size} control types.`);
