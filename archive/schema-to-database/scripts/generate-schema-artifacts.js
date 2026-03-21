#!/usr/bin/env node

/**
 * App: coding-agents-config
 * Package: skills/sql-schema-generator
 * File: generate-from-schema.js
 * Version: 1.1.0
 * Author: Bobwares / AI Coding Agent
 * Created: 2026-03-13
 * Runtime: Node.js
 * Purpose: Generate SQL DDL plus either a TypeScript interface or Java entity from a JSON schema definition.
 * Usage:
 *   node generate-from-schema.js <schema-file> <type>
 * Examples:
 *   node generate-from-schema.js user-schema.json typescript
 *   node generate-from-schema.js user-schema.json java
 */

import fs from "fs";

function snake(s) {
    return s
        .replace(/([A-Z])/g, "_$1")
        .toLowerCase()
        .replace(/^_/, "");
}

function sqlType(f) {
    if (f.type === "uuid") {
        return "uuid";
    }

    if (f.type === "timestamp") {
        return "timestamp";
    }

    if (f.type === "string") {
        return `varchar(${f.maxLength || 255})`;
    }

    return "text";
}

function ddl(schema) {
    const cols = schema.fields
        .map((f) => {
            const name = snake(f.name);
            const type = sqlType(f);
            const pk = f.primaryKey ? " primary key" : "";
            const nn =
                f.nullable === false || f.primaryKey ? " not null" : "";
            const uq = f.unique ? " unique" : "";

            return `  ${name} ${type}${pk}${nn}${uq}`;
        })
        .join(",\n");

    return `create table ${schema.tableName}
(
${cols}
);`;
}

function ts(schema) {
    const fields = schema.fields
        .map((f) => {
            let t = "string";

            if (f.type === "timestamp") {
                t = "Date";
            }

            return `  ${f.name}: ${t};`;
        })
        .join("\n");

    return `export interface ${schema.entity} {
${fields}
}`;
}

function java(schema) {
    const fields = schema.fields
        .map((f) => {
            let t = "String";

            if (f.type === "uuid") {
                t = "UUID";
            }

            if (f.type === "timestamp") {
                t = "LocalDateTime";
            }

            return `  private ${t} ${f.name};`;
        })
        .join("\n");

    return `@Entity
@Table(name = "${schema.tableName}")
public class ${schema.entity}Entity {

${fields}

}`;
}

function usage() {
    console.error(
        "Usage: node generate-from-schema.js <schema-file> <type>"
    );
    console.error("Type must be: typescript or java");
    process.exit(1);
}

const schemaFile = process.argv[2];
const outputType = process.argv[3];

if (!schemaFile || !outputType) {
    usage();
}

if (outputType !== "typescript" && outputType !== "java") {
    usage();
}

const schema = JSON.parse(fs.readFileSync(schemaFile, "utf8"));

fs.writeFileSync("table.sql", ddl(schema), "utf8");

if (outputType === "typescript") {
    fs.writeFileSync(`${schema.entity}.ts`, ts(schema), "utf8");
}

if (outputType === "java") {
    fs.writeFileSync(`${schema.entity}Entity.java`, java(schema), "utf8");
}