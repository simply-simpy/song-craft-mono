import fs from "fs";
import path from "path";

console.log("🔍 Comparing Drizzle Schema vs Mermaid ERDs...\n");

// Read the generated DBML (current schema)
const dbmlPath = "./schema.dbml";
const dbmlContent = fs.readFileSync(dbmlPath, "utf8");

// Extract table names from DBML
const dbmlTables = extractTablesFromDbml(dbmlContent);

// Read Mermaid ERD files
const mermaidDir = "../diagrams/09-db";
const mermaidFiles = [
  "core-identity-erd.mermaid",
  "account-user-songs-erd.mermaid",
  "all-erds.mermaid",
  "billing-subscriptions-erd.mermaid",
];

console.log("📊 Current Database Schema (from Drizzle):");
console.log(`Found ${dbmlTables.length} tables:`);
dbmlTables.forEach((table) => console.log(`  - ${table}`));

console.log("\n🎨 Mermaid ERD Files:");
mermaidFiles.forEach((file) => {
  const filePath = path.join(mermaidDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    const mermaidTables = extractTablesFromMermaid(content);
    console.log(`\n📁 ${file}:`);
    console.log(`  Found ${mermaidTables.length} tables:`);
    mermaidTables.forEach((table) => console.log(`    - ${table}`));

    // Compare with DBML
    const missing = dbmlTables.filter((t) => !mermaidTables.includes(t));
    const extra = mermaidTables.filter((t) => !dbmlTables.includes(t));

    if (missing.length > 0) {
      console.log(`  ⚠️  Missing from Mermaid: ${missing.join(", ")}`);
    }
    if (extra.length > 0) {
      console.log(`  ℹ️  Extra in Mermaid: ${extra.join(", ")}`);
    }
    if (missing.length === 0 && extra.length === 0) {
      console.log(`  ✅ Perfect match with DBML`);
    }
  } else {
    console.log(`  ❌ File not found: ${file}`);
  }
});

console.log("\n🎯 Summary:");
console.log("- DBML shows your current database schema (from Drizzle)");
console.log("- Mermaid ERDs show your design documentation");
console.log("- Use both for complete understanding of your data architecture");

function extractTablesFromDbml(dbml: string): string[] {
  const tables: string[] = [];
  const lines = dbml.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("table ")) {
      const tableName = trimmed.replace("table ", "").replace(" {", "");
      tables.push(tableName);
    }
  }

  return tables.sort();
}

function extractTablesFromMermaid(mermaid: string): string[] {
  const tables: string[] = [];
  const lines = mermaid.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.includes(" {") &&
      !trimmed.startsWith("%%") &&
      !trimmed.startsWith("erDiagram")
    ) {
      const tableName = trimmed.split(" {")[0].trim();
      if (tableName && !tableName.includes("||") && !tableName.includes("--")) {
        tables.push(tableName);
      }
    }
  }

  return [...new Set(tables)].sort(); // Remove duplicates and sort
}
