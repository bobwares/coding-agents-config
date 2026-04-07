#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const EXIT_CODES = {
  OK: 0,
  INVALID_REQUEST: 2,
  INVALID_SCHEMA: 3,
  COMMAND_FAILED: 4,
  FILE_EXISTS: 5,
  INTERNAL_ERROR: 9,
};

function printHelp() {
  const helpText = `Usage: node scripts/create-nestjs-customer-crud.js --request REQUEST_JSON

Create a NestJS customer CRUD app from a schema file using non-interactive Nest CLI commands.

Options:
  --request FILE   Path to request JSON file.
  --help           Show this help text.

Example:
  node scripts/create-nestjs-customer-crud.js --request /workspace/request.json
`;
  process.stdout.write(helpText);
}

function fail(errorCode, message, details) {
  const payload = {
    status: 'error',
    errorCode,
    message,
  };

  if (details) {
    payload.details = details;
  }

  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exit(EXIT_CODES[errorCode] ?? EXIT_CODES.INTERNAL_ERROR);
}

function parseArgs(argv) {
  const args = {
    request: null,
    help: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--help' || value === '-h') {
      args.help = true;
      continue;
    }
    if (value === '--request') {
      args.request = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    fail('INVALID_REQUEST', `Unknown argument: ${value}`);
  }

  return args;
}

function readJsonFile(filePath, errorCode) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    fail(errorCode, `Unable to read JSON file: ${filePath}`, {
      reason: error.message,
    });
  }
}

function resolveRequiredPath(baseDir, rawPath, fieldName) {
  if (!rawPath || typeof rawPath !== 'string') {
    fail('INVALID_REQUEST', `${fieldName} is required`);
  }
  if (path.isAbsolute(rawPath)) {
    return path.normalize(rawPath);
  }
  return path.resolve(baseDir, rawPath);
}

function ensureRequest(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    fail('INVALID_REQUEST', 'Request JSON must be an object.');
  }

  const overwritePolicy = request.overwritePolicy ?? 'fail';
  if (!['fail', 'overwrite', 'skip'].includes(overwritePolicy)) {
    fail('INVALID_REQUEST', 'overwritePolicy must be one of: fail, overwrite, skip.');
  }

  const packageManager = request.packageManager ?? 'npm';
  if (packageManager !== 'npm') {
    fail('INVALID_REQUEST', 'packageManager must be npm for this wrapper.');
  }

  return {
    appName: request.appName,
    destinationRoot: request.destinationRoot,
    schemaPath: request.schemaPath,
    resourceName: request.resourceName ?? 'customers',
    packageManager,
    strict: request.strict !== false,
    skipInstall: request.skipInstall === true,
    skipGit: request.skipGit !== false,
    dryRun: request.dryRun === true,
    overwritePolicy,
  };
}

function validateSchema(schema) {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    fail('INVALID_SCHEMA', 'Schema JSON must be an object.');
  }

  if (!schema.entityName || typeof schema.entityName !== 'string') {
    fail('INVALID_SCHEMA', 'Schema entityName is required.');
  }

  if (!Array.isArray(schema.fields) || schema.fields.length === 0) {
    fail('INVALID_SCHEMA', 'Schema fields must be a non-empty array.');
  }
}

function kebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function pascalCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function camelCase(value) {
  const result = pascalCase(value);
  return result.charAt(0).toLowerCase() + result.slice(1);
}

function runCommand(command, args, options) {
  const rendered = [command, ...args].join(' ');
  options.commands.push(rendered);

  if (options.dryRun) {
    return;
  }

  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    fail('COMMAND_FAILED', `Command failed: ${rendered}`, {
      cwd: options.cwd,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.status,
    });
  }

  if (result.stdout) {
    process.stderr.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
}

function writeFileWithPolicy(targetPath, content, context) {
  const exists = fs.existsSync(targetPath);

  if (exists && context.overwritePolicy === 'fail') {
    fail('FILE_EXISTS', 'Refusing to overwrite existing file.', {
      path: targetPath,
    });
  }

  if (exists && context.overwritePolicy === 'skip') {
    context.filesSkipped.push(targetPath);
    return;
  }

  if (context.dryRun) {
    context.filesPlanned.push(targetPath);
    return;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
  context.filesWritten.push(targetPath);
}

function tsTypeForField(field) {
  if (field.type === 'number') {
    return 'number';
  }
  if (field.type === 'boolean') {
    return 'boolean';
  }
  if (field.type === 'json') {
    return 'Record<string, unknown>';
  }
  if (field.type === 'object' && field.ref) {
    return pascalCase(field.ref);
  }
  return 'string';
}

function typeOrmColumnForField(field) {
  if (field.id) {
    return "@PrimaryColumn({ type: 'varchar', length: 64 })";
  }
  if (field.type === 'number') {
    return "@Column({ type: 'int', nullable: true })";
  }
  if (field.type === 'boolean') {
    return "@Column({ type: 'boolean', nullable: true, default: false })";
  }
  if (field.type === 'json') {
    return "@Column({ type: 'json', nullable: true })";
  }
  if (field.type === 'object' && field.ref) {
    return '@Column(() => AddressValueObject)';
  }
  if (field.maxLength) {
    return `@Column({ type: 'varchar', length: ${field.maxLength}, nullable: ${field.required ? 'false' : 'true'} })`;
  }
  return `@Column({ type: 'varchar', nullable: ${field.required ? 'false' : 'true'} })`;
}

function dtoDecoratorForField(field) {
  const decorators = [];
  const required = field.required === true;

  if (!required) {
    decorators.push('@IsOptional()');
  }

  if (field.type === 'number') {
    decorators.push('@IsNumber()');
  } else if (field.type === 'boolean') {
    decorators.push('@IsBoolean()');
  } else if (field.type === 'json') {
    decorators.push('@IsObject()');
  } else if (field.type === 'object' && field.ref) {
    decorators.push('@ValidateNested()');
    decorators.push(`@Type(() => ${pascalCase(field.ref)}Dto)`);
  } else {
    decorators.push('@IsString()');
    if (field.maxLength) {
      decorators.push(`@MaxLength(${field.maxLength})`);
    }
  }

  return decorators;
}

function buildAddressDto(addressRef) {
  const lines = [];
  lines.push("import { IsOptional, IsString } from 'class-validator';");
  lines.push('');
  lines.push('export class AddressDto {');
  for (const field of addressRef.fields) {
    if (!field.required) {
      lines.push('  @IsOptional()');
    }
    lines.push('  @IsString()');
    lines.push(`  ${field.name}${field.required ? '' : '?'}: string;`);
    lines.push('');
  }
  lines.push('}');
  return `${lines.join('\n')}\n`;
}

function buildAddressValueObject(addressRef) {
  const lines = [];
  lines.push("import { Column } from 'typeorm';");
  lines.push('');
  lines.push('export class AddressValueObject {');
  for (const field of addressRef.fields) {
    lines.push(`  @Column({ type: 'varchar', nullable: ${field.required ? 'false' : 'true'} })`);
    lines.push(`  ${field.name}${field.required ? '' : '?'}: string;`);
    lines.push('');
  }
  lines.push('}');
  return `${lines.join('\n')}\n`;
}

function buildCreateDto(schema) {
  const needsAddress = schema.fields.some((field) => field.type === 'object' && field.ref === 'Address');
  const imports = [
    'IsBoolean',
    'IsNumber',
    'IsObject',
    'IsOptional',
    'IsString',
    'MaxLength',
    'ValidateNested',
  ];

  const lines = [];
  lines.push(`import { ${imports.join(', ')} } from 'class-validator';`);
  if (needsAddress) {
    lines.push("import { Type } from 'class-transformer';");
    lines.push("import { AddressDto } from './address.dto';");
  }
  lines.push('');
  lines.push(`export class Create${pascalCase(schema.entityName)}Dto {`);

  for (const field of schema.fields) {
    const typeName = tsTypeForField(field);
    for (const decorator of dtoDecoratorForField(field)) {
      lines.push(`  ${decorator}`);
    }
    const declaredType = field.type === 'object' && field.ref ? `${pascalCase(field.ref)}Dto` : typeName;
    lines.push(`  ${field.name}${field.required ? '' : '?'}: ${declaredType};`);
    lines.push('');
  }

  lines.push('}');
  return `${lines.join('\n')}\n`;
}

function buildUpdateDto(schema) {
  const lines = [];
  const createDtoName = `Create${pascalCase(schema.entityName)}Dto`;
  const updateDtoName = `Update${pascalCase(schema.entityName)}Dto`;

  lines.push("import { PartialType } from '@nestjs/mapped-types';");
  lines.push(`import { ${createDtoName} } from './create-${kebabCase(schema.entityName)}.dto';`);
  lines.push('');
  lines.push(`export class ${updateDtoName} extends PartialType(${createDtoName}) {}`);
  return `${lines.join('\n')}\n`;
}

function buildEntity(schema) {
  const lines = [];
  const needsAddress = schema.fields.some((field) => field.type === 'object' && field.ref === 'Address');
  lines.push("import { Column, Entity, PrimaryColumn } from 'typeorm';");
  if (needsAddress) {
    lines.push("import { AddressValueObject } from './address.value-object';");
  }
  lines.push('');
  lines.push(`@Entity('${schema.resourceName ?? 'customers'}')`);
  lines.push(`export class ${pascalCase(schema.entityName)} {`);

  for (const field of schema.fields) {
    lines.push(`  ${typeOrmColumnForField(field)}`);
    lines.push(`  ${field.name}${field.required ? '' : '?'}: ${tsTypeForField(field)};`);
    lines.push('');
  }

  lines.push('}');
  return `${lines.join('\n')}\n`;
}

function buildService(schema) {
  const entityName = pascalCase(schema.entityName);
  const createDtoName = `Create${entityName}Dto`;
  const updateDtoName = `Update${entityName}Dto`;
  const singularName = camelCase(schema.entityName);
  const idField = schema.fields.find((field) => field.id) ?? { name: 'id' };

  const lines = [];
  lines.push("import { Injectable, NotFoundException } from '@nestjs/common';");
  lines.push(`import { ${createDtoName} } from './dto/create-${kebabCase(schema.entityName)}.dto';`);
  lines.push(`import { ${updateDtoName} } from './dto/update-${kebabCase(schema.entityName)}.dto';`);
  lines.push(`import { ${entityName} } from './entities/${kebabCase(schema.entityName)}.entity';`);
  lines.push('');
  lines.push('@Injectable()');
  lines.push(`export class ${pascalCase(schema.resourceName ?? 'customers')}Service {`);
  lines.push(`  private readonly records = new Map<string, ${entityName}>();`);
  lines.push('');
  lines.push(`  create(createDto: ${createDtoName}): ${entityName} {`);
  lines.push(`    const ${singularName}: ${entityName} = { ...createDto };`);
  lines.push(`    this.records.set(${singularName}.${idField.name}, ${singularName});`);
  lines.push(`    return ${singularName};`);
  lines.push('  }');
  lines.push('');
  lines.push(`  findAll(): ${entityName}[] {`);
  lines.push('    return Array.from(this.records.values());');
  lines.push('  }');
  lines.push('');
  lines.push(`  findOne(id: string): ${entityName} {`);
  lines.push('    const record = this.records.get(id);');
  lines.push('    if (!record) {');
  lines.push(`      throw new NotFoundException('${entityName} not found');`);
  lines.push('    }');
  lines.push('    return record;');
  lines.push('  }');
  lines.push('');
  lines.push(`  update(id: string, updateDto: ${updateDtoName}): ${entityName} {`);
  lines.push('    const existing = this.findOne(id);');
  lines.push('    const updated = { ...existing, ...updateDto };');
  lines.push('    this.records.set(id, updated);');
  lines.push('    return updated;');
  lines.push('  }');
  lines.push('');
  lines.push('  remove(id: string): void {');
  lines.push('    this.findOne(id);');
  lines.push('    this.records.delete(id);');
  lines.push('  }');
  lines.push('}');
  return `${lines.join('\n')}\n`;
}

function buildController(schema) {
  const entityName = pascalCase(schema.entityName);
  const controllerClass = `${pascalCase(schema.resourceName ?? 'customers')}Controller`;
  const serviceClass = `${pascalCase(schema.resourceName ?? 'customers')}Service`;
  const createDtoName = `Create${entityName}Dto`;
  const updateDtoName = `Update${entityName}Dto`;
  const resourcePath = schema.resourceName ?? 'customers';

  const lines = [];
  lines.push("import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';");
  lines.push(`import { ${serviceClass} } from './${resourcePath}.service';`);
  lines.push(`import { ${createDtoName} } from './dto/create-${kebabCase(schema.entityName)}.dto';`);
  lines.push(`import { ${updateDtoName} } from './dto/update-${kebabCase(schema.entityName)}.dto';`);
  lines.push('');
  lines.push(`@Controller('${resourcePath}')`);
  lines.push(`export class ${controllerClass} {`);
  lines.push(`  constructor(private readonly ${camelCase(serviceClass)}: ${serviceClass}) {}`);
  lines.push('');
  lines.push(`  @Post()`);
  lines.push(`  create(@Body() createDto: ${createDtoName}) {`);
  lines.push(`    return this.${camelCase(serviceClass)}.create(createDto);`);
  lines.push('  }');
  lines.push('');
  lines.push('  @Get()');
  lines.push('  findAll() {');
  lines.push(`    return this.${camelCase(serviceClass)}.findAll();`);
  lines.push('  }');
  lines.push('');
  lines.push(`  @Get(':id')`);
  lines.push('  findOne(@Param(\'id\') id: string) {');
  lines.push(`    return this.${camelCase(serviceClass)}.findOne(id);`);
  lines.push('  }');
  lines.push('');
  lines.push(`  @Patch(':id')`);
  lines.push(`  update(@Param('id') id: string, @Body() updateDto: ${updateDtoName}) {`);
  lines.push(`    return this.${camelCase(serviceClass)}.update(id, updateDto);`);
  lines.push('  }');
  lines.push('');
  lines.push(`  @Delete(':id')`);
  lines.push("  remove(@Param('id') id: string) {");
  lines.push(`    return this.${camelCase(serviceClass)}.remove(id);`);
  lines.push('  }');
  lines.push('}');
  return `${lines.join('\n')}\n`;
}

function scaffoldNestShell(config, appRoot, results) {
  const destinationRoot = path.resolve(config.destinationRoot);
  const appExists = fs.existsSync(appRoot);

  if (!appExists) {
    const newArgs = ['-y', '@nestjs/cli', 'new', config.appName, '--package-manager', 'npm'];
    if (config.skipGit) {
      newArgs.push('--skip-git');
    }
    if (config.skipInstall) {
      newArgs.push('--skip-install');
    }
    if (config.strict) {
      newArgs.push('--strict');
    }
    runCommand('npx', newArgs, {
      cwd: destinationRoot,
      dryRun: config.dryRun,
      commands: results.commands,
    });
  } else {
    results.warnings.push(`App already exists at ${appRoot}; skipping app creation.`);
  }

  const generateBaseArgs = ['-y', '@nestjs/cli', 'generate'];
  runCommand('npx', [...generateBaseArgs, 'module', config.resourceName, '--no-spec'], {
    cwd: appRoot,
    dryRun: config.dryRun,
    commands: results.commands,
  });
  runCommand('npx', [...generateBaseArgs, 'service', config.resourceName, '--no-spec'], {
    cwd: appRoot,
    dryRun: config.dryRun,
    commands: results.commands,
  });
  runCommand('npx', [...generateBaseArgs, 'controller', config.resourceName, '--no-spec'], {
    cwd: appRoot,
    dryRun: config.dryRun,
    commands: results.commands,
  });
}

function writeDomainFiles(schema, config, appRoot, results) {
  const resourceRoot = path.join(appRoot, 'src', config.resourceName);
  const dtoRoot = path.join(resourceRoot, 'dto');
  const entityRoot = path.join(resourceRoot, 'entities');

  const context = {
    overwritePolicy: config.overwritePolicy,
    dryRun: config.dryRun,
    filesWritten: results.filesWritten,
    filesSkipped: results.filesSkipped,
    filesPlanned: results.filesPlanned,
  };

  const addressRef = schema.references?.Address;
  if (addressRef) {
    writeFileWithPolicy(path.join(dtoRoot, 'address.dto.ts'), buildAddressDto(addressRef), context);
    writeFileWithPolicy(path.join(entityRoot, 'address.value-object.ts'), buildAddressValueObject(addressRef), context);
  }

  writeFileWithPolicy(
    path.join(dtoRoot, `create-${kebabCase(schema.entityName)}.dto.ts`),
    buildCreateDto(schema),
    context,
  );
  writeFileWithPolicy(
    path.join(dtoRoot, `update-${kebabCase(schema.entityName)}.dto.ts`),
    buildUpdateDto(schema),
    context,
  );
  writeFileWithPolicy(
    path.join(entityRoot, `${kebabCase(schema.entityName)}.entity.ts`),
    buildEntity(schema),
    context,
  );
  writeFileWithPolicy(
    path.join(resourceRoot, `${config.resourceName}.service.ts`),
    buildService(schema),
    context,
  );
  writeFileWithPolicy(
    path.join(resourceRoot, `${config.resourceName}.controller.ts`),
    buildController(schema),
    context,
  );
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(EXIT_CODES.OK);
  }

  if (!args.request) {
    fail('INVALID_REQUEST', '--request is required');
  }

  const requestPath = path.resolve(process.cwd(), args.request);
  const requestBaseDir = path.dirname(requestPath);
  const requestJson = readJsonFile(requestPath, 'INVALID_REQUEST');
  const config = ensureRequest(requestJson);
  const destinationRoot = resolveRequiredPath(requestBaseDir, config.destinationRoot, 'destinationRoot');
  const schemaPath = resolveRequiredPath(requestBaseDir, config.schemaPath, 'schemaPath');
  const appRoot = path.join(destinationRoot, config.appName);
  const schema = readJsonFile(schemaPath, 'INVALID_SCHEMA');
  validateSchema(schema);

  const results = {
    status: 'ok',
    appRoot,
    commands: [],
    filesWritten: [],
    filesSkipped: [],
    filesPlanned: [],
    warnings: [],
  };

  if (!fs.existsSync(destinationRoot)) {
    if (config.dryRun) {
      results.warnings.push(`Destination root does not exist yet: ${destinationRoot}`);
    } else {
      fs.mkdirSync(destinationRoot, { recursive: true });
    }
  }

  scaffoldNestShell({ ...config, destinationRoot }, appRoot, results);
  writeDomainFiles(schema, config, appRoot, results);

  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  fail('INTERNAL_ERROR', error.message, {
    stack: error.stack,
  });
}
