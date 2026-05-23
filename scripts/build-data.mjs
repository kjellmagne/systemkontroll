import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), "..");
const sourcePath = path.join(rootDir, "SystemKontroll_strukturer_med_hjelpetekster.yaml");
const outputDir = path.join(rootDir, "public", "generated");
const outputPath = path.join(outputDir, "systemkontroll-model.json");

const rawYaml = await readFile(sourcePath, "utf8");
const parsed = YAML.parse(rawYaml);

function normalizeField(field) {
  return {
    key: field.key,
    label: field.label,
    type: field.type ?? null,
    control: field.control ?? null,
    required: field.required ?? false,
    placeholder: field.placeholder ?? null,
    helpText: field.help_text ?? null,
    helpTextMode: field.help_text_mode ?? null,
    helpTextStatus: field.help_text_status ?? null,
    options: field.options ?? null,
    observedValues: field.observed_values ?? null,
    optionSource: field.option_source ?? null,
    emptyState: field.empty_state ?? null
  };
}

function normalizeCollection(collection) {
  return {
    key: collection.key,
    label: collection.label,
    itemType: collection.item_type ?? null,
    addButtonLabel: collection.add_button_label ?? null,
    columns: collection.columns ?? [],
    observedValues: collection.observed_values ?? null,
    emptyState: collection.empty_state ?? null
  };
}

function normalizeSection(section) {
  return {
    key: section.key,
    label: section.label,
    helpText: section.help_text ?? null,
    helpTextStatus: section.help_text_status ?? null,
    emptyState: section.empty_state ?? null,
    actions: section.actions ?? [],
    notes: section.notes ?? [],
    repeatingItem: section.repeating_item
      ? {
          fields: (section.repeating_item.fields ?? []).map(normalizeField)
        }
      : null,
    criteria: (section.criteria ?? []).map((criterion) => ({
      key: criterion.key,
      label: criterion.label,
      helpText: criterion.help_text ?? null,
      helpTextMode: criterion.help_text_mode ?? null
    })),
    fields: (section.fields ?? []).map(normalizeField),
    collections: (section.collections ?? []).map(normalizeCollection)
  };
}

function normalizeTab(tab) {
  return {
    key: tab.key,
    label: tab.label,
    derived: tab.derived ?? false,
    actions: tab.actions ?? [],
    notes: tab.notes ?? [],
    sections: (tab.sections ?? []).map(normalizeSection)
  };
}

function normalizeStructure([key, structure]) {
  const tabs = (structure.tabs ?? []).map(normalizeTab);
  const sections = (structure.sections ?? []).map(normalizeSection);
  const allSections = tabs.flatMap((tab) => tab.sections).concat(sections);
  const controls = Array.from(
    new Set(
      allSections.flatMap((section) =>
        section.fields
          .concat(section.repeatingItem?.fields ?? [])
          .map((field) => field.control)
          .filter(Boolean)
      )
    )
  ).sort();

  return [
    key,
    {
      key,
      entity: structure.entity,
      profile: structure.profile ?? null,
      source: structure.source ?? {},
      tabs,
      sections,
      counts: {
        tabs: tabs.length,
        sections: allSections.length,
        fields: allSections.reduce(
          (sum, section) => sum + section.fields.length + (section.repeatingItem?.fields.length ?? 0),
          0
        ),
        collections: allSections.reduce((sum, section) => sum + section.collections.length, 0),
        actions:
          tabs.reduce((sum, tab) => sum + tab.actions.length, 0) +
          allSections.reduce((sum, section) => sum + section.actions.length, 0)
      },
      controls
    }
  ];
}

const normalized = {
  schemaVersion: parsed.schema_version,
  exportedAt: parsed.exported_at,
  exportName: parsed.export_name,
  notes: parsed.notes ?? [],
  structures: Object.fromEntries(Object.entries(parsed.structures ?? {}).map(normalizeStructure))
};

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, JSON.stringify(normalized, null, 2), "utf8");

console.log(`Built ${path.relative(rootDir, outputPath)} from ${path.basename(sourcePath)}`);
