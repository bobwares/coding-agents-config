# Request contract

The wrapper accepts a request JSON file with this shape:

```json
{
  "appName": "customer-crud-api",
  "destinationRoot": "./apps",
  "schemaPath": "./specs/customer.schema.json",
  "resourceName": "customers",
  "packageManager": "npm",
  "strict": true,
  "skipInstall": false,
  "skipGit": true,
  "dryRun": false,
  "overwritePolicy": "fail"
}
```

## Field details

- `appName`: required; Nest application directory name
- `destinationRoot`: required; parent directory where the app will be created
- `schemaPath`: required; absolute or relative path to the schema JSON file
- `resourceName`: optional; defaults to `customers`
- `packageManager`: optional; defaults to `npm`
- `strict`: optional; defaults to `true`
- `skipInstall`: optional; defaults to `false`
- `skipGit`: optional; defaults to `true`
- `dryRun`: optional; defaults to `false`
- `overwritePolicy`: optional; one of `fail`, `overwrite`, `skip`; defaults to `fail`

# Schema contract

The included sample schema uses this shape:

```json
{
  "domain": "customer",
  "entityName": "Customer",
  "resourceName": "customers",
  "fields": [
    { "name": "id", "type": "string", "required": true, "id": true },
    { "name": "password", "type": "string", "required": true, "sensitive": true },
    { "name": "firstName", "type": "string", "required": true },
    { "name": "lastName", "type": "string", "required": true },
    { "name": "middleInitial", "type": "string", "required": false, "maxLength": 1 },
    { "name": "age", "type": "number", "required": false },
    { "name": "phone", "type": "string", "required": false },
    {
      "name": "homeAddress",
      "type": "object",
      "required": false,
      "ref": "Address"
    },
    {
      "name": "billingAddress",
      "type": "object",
      "required": false,
      "ref": "Address"
    },
    { "name": "preferences", "type": "json", "required": false }
  ],
  "references": {
    "Address": {
      "fields": [
        { "name": "line1", "type": "string", "required": true },
        { "name": "line2", "type": "string", "required": false },
        { "name": "city", "type": "string", "required": true },
        { "name": "state", "type": "string", "required": true },
        { "name": "postalCode", "type": "string", "required": true },
        { "name": "country", "type": "string", "required": true }
      ]
    }
  }
}
```

# File layout produced

The wrapper creates or updates files in this layout:

```text
src/
  customers/
    customers.module.ts
    customers.controller.ts
    customers.service.ts
    dto/
      address.dto.ts
      create-customer.dto.ts
      update-customer.dto.ts
    entities/
      address.value-object.ts
      customer.entity.ts
```

# Design choices

The wrapper follows Agent Skills guidance for scripts:

- non-interactive interface
- `--help` support
- structured JSON output
- diagnostics on stderr
- dry-run support
- explicit overwrite policy

The wrapper calls these Nest CLI generators:

```bash
npx -y @nestjs/cli new <appName> --package-manager npm --skip-git --strict
```

```bash
npx -y @nestjs/cli generate module <resourceName> --no-spec
```

```bash
npx -y @nestjs/cli generate service <resourceName> --no-spec
```

```bash
npx -y @nestjs/cli generate controller <resourceName> --no-spec
```

# Output contract

Success:

```json
{
  "status": "ok",
  "appRoot": "/workspace/apps/customer-crud-api",
  "commands": [
    "npx -y @nestjs/cli new customer-crud-api --package-manager npm --skip-git --strict"
  ],
  "filesWritten": [],
  "filesSkipped": [],
  "warnings": []
}
```

Error:

```json
{
  "status": "error",
  "errorCode": "FILE_EXISTS",
  "message": "Refusing to overwrite existing file.",
  "details": {
    "path": "/workspace/apps/customer-crud-api/src/customers/entities/customer.entity.ts"
  }
}
```
