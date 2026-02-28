---
name: project-init
description: Scaffold a new full-stack monorepo from a tech stack selection. Creates directory structure, config files, and workspace setup. Run once before /project-execute.
---

# Project Init — Monorepo Scaffolder

You scaffold the project structure for the selected tech stack. You create the directory layout, config files, and workspace configuration so specialist agents have a consistent foundation.

---

## How to Invoke

```
/project-init 
/project-init 
```

Or called automatically by `/project-execute`.

---

## Directory Structure

All application code lives under the `app/` directory. The Makefile stays at project root.

```
project-root/
├── Makefile                    # Stays at root
├── app/                        # All app code and config
│   ├── api/                    # NestJS (if nestjs in stack)
│   ├── web/                    # Next.js (if nextjs in stack)
│   ├── packages/
│   │   ├── database/           # Drizzle (if drizzle in stack)
│   │   └── types/              # Shared types (always)
│   ├── services/
│   │   └── enterprise/         # Spring Boot (if spring in stack)
│   ├── package.json            # pnpm workspace root
│   ├── pnpm-workspace.yaml
│   ├── turbo.json
│   ├── tsconfig.base.json
│   ├── docker-compose.yml
│   └── .env.example
├── .claude/                    # Claude Code config (stays at root)
├── ai/                         # Turn artifacts (stays at root)
└── docs/                       # Documentation (stays at root)
```

---

## What You Create in `app/`

### `app/package.json` (pnpm workspace root):
```json
{
  "name": "<app-name>",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "db:generate": "pnpm --filter database db:generate",
    "db:migrate": "pnpm --filter database db:migrate",
    "db:studio": "pnpm --filter database db:studio"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### `app/pnpm-workspace.yaml`:
```yaml
packages:
  - "api"
  - "web"
  - "packages/*"
  - "services/*"
```

### `app/turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "persistent": true, "cache": false },
    "test": { "dependsOn": ["^build"] },
    "lint": {},
    "typecheck": {}
  }
}
```

### `app/tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### `app/.env.example`:
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev

# Auth (if applicable)
NEXTAUTH_SECRET=changeme-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# AI (if ai stack selected)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# NestJS API
API_URL=http://localhost:3001
API_SECRET=changeme
```

### `app/docker-compose.yml`:
```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Root `.gitignore` (at project root):
```
node_modules/
.next/
dist/
build/
target/
*.env
*.env.local
.turbo/
coverage/
.claude/audit/
```

---

## Stack-Conditional Scaffolding

### If `nextjs` in stack → Create `app/web/`

Directory structure:
```
app/web/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts      # if shadcn in stack
├── postcss.config.mjs      # if shadcn in stack
├── components.json         # if shadcn in stack
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       └── health/
│   │           └── route.ts
│   ├── components/
│   │   └── ui/             # if shadcn in stack
│   ├── lib/
│   │   ├── utils.ts
│   │   └── db.ts           # if drizzle in stack
│   └── types/
│       └── index.ts
├── public/
└── tests/
    └── setup.ts
```

**`app/web/package.json`** dependencies:
- `next: "^15.0.0"`, `react: "^19.0.0"`, `react-dom: "^19.0.0"`
- If shadcn: `tailwindcss`, `@tailwindcss/forms`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `@radix-ui/react-slot`
- If ai: `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`
- Dev: `typescript`, `@types/react`, `@types/node`, `vitest`, `@vitejs/plugin-react`, `playwright`

**`app/web/next.config.ts`**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
```

**`app/web/src/app/layout.tsx`**:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My App",
  description: "Generated by agentic-pipeline",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**`app/web/src/app/page.tsx`**:
```typescript
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Welcome</h1>
      <p className="mt-4 text-muted-foreground">Your app is ready.</p>
    </main>
  );
}
```

**`app/web/src/lib/utils.ts`** (if shadcn):
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### If `nestjs` in stack → Create `app/api/`

Directory structure:
```
app/api/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts
│   │   ├── pipes/
│   │   │   └── zod-validation.pipe.ts
│   │   └── interceptors/
│   │       └── response.interceptor.ts
│   └── modules/
│       └── health/
│           ├── health.module.ts
│           └── health.controller.ts
└── test/
    └── app.e2e-spec.ts
```

**`app/api/src/main.ts`**:
```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.enableCors({ origin: process.env.WEB_URL || "http://localhost:3000" });

  const config = new DocumentBuilder()
    .setTitle("API")
    .setDescription("Generated by agentic-pipeline")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
```

---

### If `spring` in stack → Create `app/services/enterprise/`

Directory structure:
```
app/services/enterprise/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/example/enterprise/
    │   │   ├── EnterpriseApplication.java
    │   │   ├── config/
    │   │   │   ├── SecurityConfig.java
    │   │   │   └── OpenApiConfig.java
    │   │   ├── common/
    │   │   │   ├── exception/
    │   │   │   │   ├── ResourceNotFoundException.java
    │   │   │   │   ├── ConflictException.java
    │   │   │   │   └── GlobalExceptionHandler.java
    │   │   │   └── dto/
    │   │   │       └── ErrorResponse.java
    │   │   └── health/
    │   │       └── HealthController.java
    │   └── resources/
    │       └── application.yml
    └── test/
        └── java/com/example/enterprise/
            └── EnterpriseApplicationTests.java
```

**`app/services/enterprise/src/main/resources/application.yml`**:
```yaml
spring:
  application:
    name: enterprise-api
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/myapp_dev}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

server:
  port: ${PORT:8080}

springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
```

---

### If `drizzle` in stack → Create `app/packages/database/`

Directory structure:
```
app/packages/database/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── src/
    ├── index.ts
    ├── schema/
    │   └── index.ts
    └── migrations/
```

**`app/packages/database/src/index.ts`**:
```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
export * from "./schema";
```

**`app/packages/database/drizzle.config.ts`**:
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/**/*.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

### Always Create `app/packages/types/`

```
app/packages/types/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

**`app/packages/types/src/index.ts`**:
```typescript
// Shared types across the monorepo
// Generated by agentic-pipeline — add domain types here

export type UUID = string;
export type ISODate = string;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

---

## Post-Scaffold Steps

After creating all files, run:

```bash
# Install all dependencies (from app/ directory)
cd app && pnpm install

# Initialize shadcn/ui if selected
# (if shadcn in stack) cd app/web && npx shadcn@latest init --yes

# Start the database (from app/ directory)
cd app && docker compose up -d postgres

# Verify the workspace builds
cd app && pnpm typecheck
```

Report the result:

```
✅ Project scaffolded

Structure created:
  app/web/              Next.js 15 App Router
  app/api/              NestJS REST API
  app/services/enterprise/ Spring Boot Enterprise API
  app/packages/database/   Drizzle ORM + PostgreSQL
  app/packages/types/      Shared TypeScript types

Next: /project-execute will continue with DDD parsing and code generation.
```

---

## Important Notes

- All generated files are **stubs** — specialist agents will replace them with domain-specific code
- The scaffold sets up the **plumbing** (workspace config, module registration, DB connection) so agents can focus on business logic
- If the project directory already has these files, **skip** them (don't overwrite existing work)
- Report which files were created vs. skipped
