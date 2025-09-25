import * as schema from "../src/schema";
import { pgGenerate } from "drizzle-dbml-generator";
import fs from "fs";
import path from "path";

console.log("🔨 Generating ERD from Drizzle schema...");

// Generate DBML first
const dbmlOutputFile = "./schema.dbml";
pgGenerate({
  schema,
  out: dbmlOutputFile,
  relational: true,
});

console.log(`✅ DBML generated: ${dbmlOutputFile}`);

// Convert DBML to Mermaid (basic conversion)
const dbmlContent = fs.readFileSync(dbmlOutputFile, "utf8");
const mermaidContent = convertDbmlToMermaid(dbmlContent);

const mermaidOutputFile = "./schema.mermaid";
fs.writeFileSync(mermaidOutputFile, mermaidContent);

console.log(`✅ Mermaid ERD generated: ${mermaidOutputFile}`);
console.log("📊 View DBML at: https://dbdiagram.io/");
console.log("📊 View Mermaid at: https://mermaid.live/");

function convertDbmlToMermaid(dbml: string): string {
  const lines = dbml.split("\n");
  let mermaid = "erDiagram\n";

  const tables: string[] = [];
  const relationships: string[] = [];
  let currentTable = "";
  let inTable = false;
  let inIndexes = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("table ")) {
      inTable = true;
      inIndexes = false;
      const tableName = trimmed.replace("table ", "").replace(" {", "");
      currentTable = tableName;
      tables.push(tableName);
      mermaid += `  ${tableName} {\n`;
    } else if (trimmed === "}") {
      if (inTable) {
        mermaid += `  }\n`;
        inTable = false;
        inIndexes = false;
      }
    } else if (trimmed.startsWith("indexes {")) {
      inIndexes = true;
    } else if (inTable && !inIndexes && trimmed.includes(" ")) {
      // Parse field definition
      const parts = trimmed.split(" ");
      if (parts.length >= 2) {
        const fieldName = parts[0];
        const fieldType = parts[1];
        let constraints = "";

        if (trimmed.includes("[pk")) constraints += " PK";
        if (trimmed.includes("not null")) constraints += ' "not null"';
        if (trimmed.includes("unique")) constraints += ' "unique"';
        if (trimmed.includes("default:")) {
          const defaultMatch = trimmed.match(/default: `([^`]+)`/);
          if (defaultMatch) {
            constraints += ` "default: ${defaultMatch[1]}"`;
          }
        }

        mermaid += `    ${fieldType} ${fieldName}${constraints}\n`;
      }
    }
  }

  // Add basic relationships (this is a simplified version)
  // In a real implementation, you'd parse the DBML relationships more carefully
  mermaid += "\n  %% Relationships would be added here\n";
  mermaid += "  %% For now, use the DBML file for full relationship details\n";

  return mermaid;
}
