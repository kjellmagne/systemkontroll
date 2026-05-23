import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = process.argv[2];
const outputPath = process.argv[3] ?? path.resolve("public", "organization-structure.json");

if (!inputPath) {
  console.error("Usage: node scripts/import-orgchart-html.mjs <input-html-path> [output-json-path]");
  process.exit(1);
}

const html = await readFile(inputPath, "utf8");
const arrayMatch = html.match(/const nodeDataArray = \[(.|\r|\n)*?\n\s*\];/);

if (!arrayMatch) {
  throw new Error("Could not find nodeDataArray in HTML file.");
}

const arraySource = arrayMatch[0].replace(/^const nodeDataArray = /, "").replace(/;\s*$/, "");
const nodeDataArray = Function(`return (${arraySource})`)();

const nodesByKey = new Map(
  nodeDataArray.map((node) => [
    String(node.key),
    {
      ...node,
      key: String(node.key),
      parent: String(node.parent ?? ""),
      children: []
    }
  ])
);

for (const node of nodesByKey.values()) {
  if (node.parent && nodesByKey.has(node.parent)) {
    nodesByKey.get(node.parent).children.push(node);
  }
}

const rootNode = [...nodesByKey.values()].find((node) => !node.parent);

if (!rootNode) {
  throw new Error("Could not find root node in org chart data.");
}

function describeNode(node) {
  const parts = [];
  if (node.unittype) {
    parts.push(String(node.unittype).trim());
  }
  if (node.manager) {
    parts.push(`Leder: ${String(node.manager).trim()}`);
  }
  return parts.join(". ");
}

function flattenDepartments(node, ancestors = []) {
  const currentPath = [...ancestors, node.name].filter(Boolean);
  const label = currentPath.length > 1 ? currentPath.join(" / ") : node.name;

  const departments = [
    {
      id: `department-${node.key}`,
      name: label,
      description: describeNode(node)
    }
  ];

  for (const child of node.children ?? []) {
    departments.push(...flattenDepartments(child, currentPath));
  }

  return departments;
}

const serviceAreas = (rootNode.children ?? []).map((area) => ({
  id: `service-area-${area.key}`,
  serviceArea: area.name,
  description: describeNode(area),
  organizations: (area.children ?? []).map((organization) => ({
    id: `organization-${organization.key}`,
    name: organization.name,
    description: describeNode(organization),
    departments: (organization.children ?? []).flatMap((department) => flattenDepartments(department))
  }))
}));

await writeFile(outputPath, `${JSON.stringify(serviceAreas, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      source: inputPath,
      output: outputPath,
      root: rootNode.name,
      serviceAreas: serviceAreas.length,
      organizations: serviceAreas.reduce((sum, area) => sum + area.organizations.length, 0),
      departments: serviceAreas.reduce(
        (sum, area) => sum + area.organizations.reduce((inner, organization) => inner + organization.departments.length, 0),
        0
      )
    },
    null,
    2
  )
);
