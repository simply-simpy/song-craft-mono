import * as schema from "../src/schema";
import { pgGenerate } from "drizzle-dbml-generator";
import fs from "fs";

console.log("🔨 Generating DBML with relationships from Drizzle schema...");

// Generate basic DBML first
const outputFile = "./schema-with-relations.dbml";
pgGenerate({
  schema,
  out: outputFile,
  relational: true,
});

console.log(`✅ Basic DBML generated: ${outputFile}`);

// Read the generated DBML and add relationships
let dbmlContent = fs.readFileSync(outputFile, "utf8");

// Add relationships based on the schema
const relationships = `
// Relationships
Ref: users.primary_account_id > accounts.id [delete: no action, update: no action]
Ref: users.current_account_id > accounts.id [delete: no action, update: no action]
Ref: user_context.user_id > users.id [delete: no action, update: no action]
Ref: user_context.current_account_id > accounts.id [delete: no action, update: no action]
Ref: accounts.org_id > orgs.id [delete: no action, update: no action]
Ref: accounts.parent_org_id > orgs.id [delete: no action, update: no action]
Ref: memberships.user_id > users.id [delete: no action, update: no action]
Ref: memberships.account_id > accounts.id [delete: no action, update: no action]
Ref: songs.account_id > accounts.id [delete: no action, update: no action]
Ref: lyric_versions.song_id > songs.id [delete: no action, update: no action]
Ref: lyric_versions.account_id > accounts.id [delete: no action, update: no action]
Ref: song_authors.song_id > songs.id [delete: no action, update: no action]
Ref: song_authors.user_id > users.id [delete: no action, update: no action]
Ref: song_account_links.song_id > songs.id [delete: no action, update: no action]
Ref: song_account_links.account_id > accounts.id [delete: no action, update: no action]
`;

// Append relationships to the DBML content
dbmlContent += relationships;

// Write the enhanced DBML
fs.writeFileSync(outputFile, dbmlContent);

console.log(`✅ Enhanced DBML with relationships generated: ${outputFile}`);
console.log("📊 You can view this at: https://dbdiagram.io/");
console.log("🔗 This version includes all foreign key relationships!");
