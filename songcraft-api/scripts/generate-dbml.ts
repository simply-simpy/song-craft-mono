import * as schema from "../src/schema";
import { pgGenerate } from "drizzle-dbml-generator";

const outputFile = "./schema.dbml";
const includeRelations = true;

console.log("🔨 Generating DBML from Drizzle schema...");

pgGenerate({
  schema,
  out: outputFile,
  relational: includeRelations,
});

console.log(`✅ DBML generated successfully: ${outputFile}`);
console.log("📊 You can view this at: https://dbdiagram.io/");
