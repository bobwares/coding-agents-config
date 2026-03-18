#!/usr/bin/env node
/**
 * generate-crud.js - Generate CRUD module/service/controller from entity
 *
 * Usage: node generate-crud.js <entity-name> <stack-type> [project-root] [output-dir]
 *
 * Stack types: typescript | java-reactive | java-jpa
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// CONFIGURATION
// =============================================================================

const ENTITY_NAME = process.argv[2];
const STACK_TYPE = process.argv[3] || 'typescript';
const PROJECT_ROOT = process.argv[4] || process.cwd();
const OUTPUT_DIR = process.argv[5];
const TURN_ID = process.env.TURN_ID || 'T000';
const DATE = new Date().toISOString().split('T')[0];

if (!ENTITY_NAME) {
  console.error('Usage: generate-crud.js <entity-name> <stack-type> [project-root] [output-dir]');
  process.exit(1);
}

// =============================================================================
// HELPERS
// =============================================================================

const toKebabCase = (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
const toSnakeCase = (str) => str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
const toCamelCase = (str) => str.charAt(0).toLowerCase() + str.slice(1);
const toPascalCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const toPlural = (str) => str.endsWith('s') ? str + 'es' : str.endsWith('y') ? str.slice(0, -1) + 'ies' : str + 's';

const kebab = toKebabCase(ENTITY_NAME);
const snake = toSnakeCase(ENTITY_NAME);
const camel = toCamelCase(ENTITY_NAME);
const pascal = toPascalCase(ENTITY_NAME);
const plural = toPlural(camel);
const pluralPascal = toPascalCase(plural);
const pluralKebab = toKebabCase(plural);

// =============================================================================
// ENTITY PARSER
// =============================================================================

function findEntityFile() {
  const patterns = [
    `app/api/src/entities/${kebab}/${kebab}.entity.ts`,
    `app/api/src/entities/${kebab}.entity.ts`,
    `src/entities/${kebab}/${kebab}.entity.ts`,
    `src/entities/${kebab}.entity.ts`,
    `src/main/java/**/entity/${pascal}.java`,
    `src/main/java/**/model/${pascal}.java`,
  ];

  for (const pattern of patterns) {
    const fullPath = path.join(PROJECT_ROOT, pattern);
    if (fs.existsSync(fullPath)) return fullPath;
  }

  // Glob search
  const searchDirs = ['app/api/src', 'src'];
  for (const dir of searchDirs) {
    const searchPath = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(searchPath)) {
      const found = findFileRecursive(searchPath, `${kebab}.entity.ts`) ||
                    findFileRecursive(searchPath, `${pascal}.java`);
      if (found) return found;
    }
  }
  return null;
}

function findFileRecursive(dir, filename) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      const found = findFileRecursive(fullPath, filename);
      if (found) return found;
    } else if (file.name === filename) {
      return fullPath;
    }
  }
  return null;
}

function parseTypeScriptEntity(content) {
  const fields = [];
  const relations = [];

  // Extract @Column fields
  const columnRegex = /@Column\s*\(\s*\{([^}]*)\}\s*\)\s*\n\s*(\w+)\s*[?:]?\s*:\s*([^;]+)/g;
  let match;
  while ((match = columnRegex.exec(content)) !== null) {
    const [, options, name, type] = match;
    const nullable = options.includes('nullable: true') || type.includes('null');
    const isEnum = options.includes('enum:');
    fields.push({
      name,
      type: type.replace(/\s*\|\s*null/g, '').trim(),
      nullable,
      isEnum,
      columnOptions: options,
    });
  }

  // Simple columns without options
  const simpleColumnRegex = /@Column\s*\(\s*\)\s*\n\s*(\w+)\s*:\s*([^;]+)/g;
  while ((match = simpleColumnRegex.exec(content)) !== null) {
    fields.push({ name: match[1], type: match[2].trim(), nullable: false });
  }

  // Extract relations
  const relationRegex = /@(ManyToOne|OneToMany|ManyToMany|OneToOne)\s*\([^)]+\)[^@]*@JoinColumn[^}]*\}\s*\)\s*\n\s*(\w+)/g;
  while ((match = relationRegex.exec(content)) !== null) {
    relations.push({ type: match[1], name: match[2] });
  }

  return { fields, relations };
}

function parseJavaEntity(content) {
  const fields = [];
  const relations = [];

  // Extract @Column fields
  const columnRegex = /@Column[^\n]*\n\s*private\s+(\w+)\s+(\w+)/g;
  let match;
  while ((match = columnRegex.exec(content)) !== null) {
    fields.push({ name: match[2], type: match[1], nullable: content.includes('nullable = true') });
  }

  // Fields without @Column
  const fieldRegex = /private\s+(\w+)\s+(\w+)\s*;/g;
  while ((match = fieldRegex.exec(content)) !== null) {
    if (!fields.find(f => f.name === match[2])) {
      fields.push({ name: match[2], type: match[1], nullable: true });
    }
  }

  return { fields, relations };
}

// =============================================================================
// TYPESCRIPT/NESTJS GENERATORS
// =============================================================================

function generateTypeScriptCrud(fields) {
  const outputBase = OUTPUT_DIR || path.join(PROJECT_ROOT, 'app/api/src', kebab);
  const dtoDir = path.join(outputBase, 'dto');
  fs.mkdirSync(dtoDir, { recursive: true });

  // Filter out auto-generated fields
  const inputFields = fields.filter(f =>
    !['id', 'createdAt', 'updatedAt', 'schemaType', 'schemaContext'].includes(f.name)
  );

  // Generate Create DTO
  const createDto = `/**
 * @file create-${kebab}.dto.ts
 * @description Create ${pascal} DTO with validation
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */

import { IsString, IsOptional, IsEmail, IsEnum, IsDateString, IsUUID, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create${pascal}Dto {
${inputFields.map(f => {
  const decorators = [];
  const isRequired = !f.nullable;

  if (isRequired) {
    decorators.push(`  @ApiProperty({ description: '${f.name}' })`);
  } else {
    decorators.push(`  @ApiPropertyOptional({ description: '${f.name}' })`);
    decorators.push('  @IsOptional()');
  }

  if (f.name.toLowerCase().includes('email')) decorators.push('  @IsEmail()');
  else if (f.name.toLowerCase().includes('url')) decorators.push('  @IsUrl()');
  else if (f.type.includes('Date') || f.name.toLowerCase().includes('date')) decorators.push('  @IsDateString()');
  else if (f.isEnum) decorators.push(`  @IsEnum(${f.type.split('.')[0] || f.type})`);
  else if (f.type === 'string') decorators.push('  @IsString()');

  const tsType = f.type.replace('Date', 'string').replace(/\s*\|\s*null/g, '');
  return `${decorators.join('\\n')}
  ${f.name}${f.nullable ? '?' : ''}: ${tsType};`;
}).join('\\n\\n')}
}
`;

  // Generate Update DTO
  const updateDto = `/**
 * @file update-${kebab}.dto.ts
 * @description Update ${pascal} DTO (partial)
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */

import { PartialType } from '@nestjs/swagger';
import { Create${pascal}Dto } from './create-${kebab}.dto';

export class Update${pascal}Dto extends PartialType(Create${pascal}Dto) {}
`;

  // Generate Response DTO
  const responseDto = `/**
 * @file ${kebab}-response.dto.ts
 * @description ${pascal} response DTO
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ${pascal}ResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

${fields.map(f => {
  const decorator = f.nullable ? '@ApiPropertyOptional()' : '@ApiProperty()';
  const tsType = f.type.replace(/\s*\|\s*null/g, '');
  return `  ${decorator}
  ${f.name}${f.nullable ? '?' : ''}: ${tsType};`;
}).join('\\n\\n')}

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
`;

  // Generate DTO index
  const dtoIndex = `/**
 * @file index.ts
 * @description DTO barrel exports
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */

export { Create${pascal}Dto } from './create-${kebab}.dto';
export { Update${pascal}Dto } from './update-${kebab}.dto';
export { ${pascal}ResponseDto } from './${kebab}-response.dto';
`;

  // Generate Service
  const service = `/**
 * @file ${kebab}.service.ts
 * @description ${pascal} CRUD service
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ${pascal} } from '../entities/${kebab}';
import { Create${pascal}Dto, Update${pascal}Dto } from './dto';

export interface ${pascal}FindOptions {
  skip?: number;
  take?: number;
  where?: FindOptionsWhere<${pascal}>;
}

@Injectable()
export class ${pascal}Service {
  constructor(
    @InjectRepository(${pascal})
    private readonly repository: Repository<${pascal}>,
  ) {}

  async create(dto: Create${pascal}Dto): Promise<${pascal}> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async findAll(options: ${pascal}FindOptions = {}): Promise<${pascal}[]> {
    return this.repository.find({
      where: options.where,
      skip: options.skip ?? 0,
      take: options.take ?? 100,
      order: { createdAt: 'DESC' } as any,
    });
  }

  async findOne(id: string): Promise<${pascal}> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException(\`${pascal} with id \${id} not found\`);
    }
    return entity;
  }

  async update(id: string, dto: Update${pascal}Dto): Promise<${pascal}> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }

  async count(where?: FindOptionsWhere<${pascal}>): Promise<number> {
    return this.repository.count({ where });
  }
}
`;

  // Generate Controller
  const controller = `/**
 * @file ${kebab}.controller.ts
 * @description ${pascal} REST API controller
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ${pascal}Service } from './${kebab}.service';
import { Create${pascal}Dto, Update${pascal}Dto, ${pascal}ResponseDto } from './dto';

@ApiTags('${pluralPascal}')
@Controller('${pluralKebab}')
export class ${pascal}Controller {
  constructor(private readonly service: ${pascal}Service) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ${camel}' })
  @ApiResponse({ status: 201, description: '${pascal} created', type: ${pascal}ResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() dto: Create${pascal}Dto): Promise<${pascal}ResponseDto> {
    return this.service.create(dto) as any;
  }

  @Get()
  @ApiOperation({ summary: 'List all ${plural}' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Pagination offset' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Pagination limit (max 100)' })
  @ApiResponse({ status: 200, description: 'List of ${plural}', type: [${pascal}ResponseDto] })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<${pascal}ResponseDto[]> {
    return this.service.findAll({ skip, take: Math.min(take || 100, 100) }) as any;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${camel} by ID' })
  @ApiParam({ name: 'id', type: String, description: '${pascal} UUID' })
  @ApiResponse({ status: 200, description: '${pascal} found', type: ${pascal}ResponseDto })
  @ApiResponse({ status: 404, description: '${pascal} not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<${pascal}ResponseDto> {
    return this.service.findOne(id) as any;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ${camel}' })
  @ApiParam({ name: 'id', type: String, description: '${pascal} UUID' })
  @ApiResponse({ status: 200, description: '${pascal} updated', type: ${pascal}ResponseDto })
  @ApiResponse({ status: 404, description: '${pascal} not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Update${pascal}Dto,
  ): Promise<${pascal}ResponseDto> {
    return this.service.update(id, dto) as any;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete ${camel}' })
  @ApiParam({ name: 'id', type: String, description: '${pascal} UUID' })
  @ApiResponse({ status: 204, description: '${pascal} deleted' })
  @ApiResponse({ status: 404, description: '${pascal} not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
`;

  // Generate Module
  const module = `/**
 * @file ${kebab}.module.ts
 * @description ${pascal} NestJS module
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${pascal} } from '../entities/${kebab}';
import { ${pascal}Service } from './${kebab}.service';
import { ${pascal}Controller } from './${kebab}.controller';

@Module({
  imports: [TypeOrmModule.forFeature([${pascal}])],
  controllers: [${pascal}Controller],
  providers: [${pascal}Service],
  exports: [${pascal}Service],
})
export class ${pascal}Module {}
`;

  // Write files
  fs.writeFileSync(path.join(dtoDir, `create-${kebab}.dto.ts`), createDto);
  fs.writeFileSync(path.join(dtoDir, `update-${kebab}.dto.ts`), updateDto);
  fs.writeFileSync(path.join(dtoDir, `${kebab}-response.dto.ts`), responseDto);
  fs.writeFileSync(path.join(dtoDir, 'index.ts'), dtoIndex);
  fs.writeFileSync(path.join(outputBase, `${kebab}.service.ts`), service);
  fs.writeFileSync(path.join(outputBase, `${kebab}.controller.ts`), controller);
  fs.writeFileSync(path.join(outputBase, `${kebab}.module.ts`), module);

  // Generate Unit Tests for Service
  const serviceSpec = `/**
 * @file ${kebab}.service.spec.ts
 * @description Unit tests for ${pascal}Service
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ${pascal}Service } from './${kebab}.service';
import { ${pascal} } from '../entities/${kebab}';
import { Create${pascal}Dto, Update${pascal}Dto } from './dto';

describe('${pascal}Service', () => {
  let service: ${pascal}Service;
  let repository: jest.Mocked<Repository<${pascal}>>;

  const mock${pascal}: ${pascal} = {
    id: 'test-uuid-1234',
${inputFields.map(f => \`    ${f.name}: ${f.type === 'string' ? \`'test-${f.name}'\` : f.type === 'number' ? '1' : f.type.includes('Date') ? 'new Date()' : 'null'},\`).join('\\n')}
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ${pascal};

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${pascal}Service,
        {
          provide: getRepositoryToken(${pascal}),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<${pascal}Service>(${pascal}Service);
    repository = module.get(getRepositoryToken(${pascal}));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ${camel}', async () => {
      const createDto: Create${pascal}Dto = {
${inputFields.filter(f => !f.nullable).map(f => \`        ${f.name}: ${f.type === 'string' ? \`'test-${f.name}'\` : f.type === 'number' ? '1' : 'null'},\`).join('\\n')}
      };

      mockRepository.create.mockReturnValue(mock${pascal});
      mockRepository.save.mockResolvedValue(mock${pascal});

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mock${pascal});
    });
  });

  describe('findAll', () => {
    it('should return an array of ${plural}', async () => {
      mockRepository.find.mockResolvedValue([mock${pascal}]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mock${pascal}]);
    });

    it('should apply pagination options', async () => {
      mockRepository.find.mockResolvedValue([mock${pascal}]);

      await service.findAll({ skip: 10, take: 20 });

      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 20 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a ${camel} by id', async () => {
      mockRepository.findOne.mockResolvedValue(mock${pascal});

      const result = await service.findOne('test-uuid-1234');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-1234' },
      });
      expect(result).toEqual(mock${pascal});
    });

    it('should throw NotFoundException if ${camel} not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a ${camel}', async () => {
      const updateDto: Update${pascal}Dto = {
        ${inputFields[0]?.name || 'name'}: 'updated-value',
      };

      mockRepository.findOne.mockResolvedValue(mock${pascal});
      mockRepository.save.mockResolvedValue({ ...mock${pascal}, ...updateDto });

      const result = await service.update('test-uuid-1234', updateDto);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.${inputFields[0]?.name || 'name'}).toBe('updated-value');
    });

    it('should throw NotFoundException if ${camel} not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a ${camel}', async () => {
      mockRepository.findOne.mockResolvedValue(mock${pascal});
      mockRepository.remove.mockResolvedValue(mock${pascal});

      await service.remove('test-uuid-1234');

      expect(mockRepository.remove).toHaveBeenCalledWith(mock${pascal});
    });

    it('should throw NotFoundException if ${camel} not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('count', () => {
    it('should return the count of ${plural}', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await service.count();

      expect(result).toBe(5);
    });
  });
});
`;

  // Generate E2E Tests for Controller
  const e2eSpec = `/**
 * @file ${kebab}.e2e-spec.ts
 * @description E2E tests for ${pascal} endpoints
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { ${pascal}Service } from './${kebab}.service';

describe('${pascal}Controller (e2e)', () => {
  let app: INestApplication;
  let service: ${pascal}Service;
  let created${pascal}Id: string;

  const valid${pascal}Data = {
${inputFields.filter(f => !f.nullable).map(f => \`    ${f.name}: ${f.type === 'string' ? \`'e2e-test-${f.name}'\` : f.type === 'number' ? '1' : f.type.includes('Date') ? \`'2024-01-01T00:00:00.000Z'\` : 'null'},\`).join('\\n')}
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    service = moduleFixture.get<${pascal}Service>(${pascal}Service);
  });

  afterAll(async () => {
    // Cleanup: remove test data
    if (created${pascal}Id) {
      try {
        await service.remove(created${pascal}Id);
      } catch {
        // Ignore if already deleted
      }
    }
    await app.close();
  });

  describe('POST /${pluralKebab}', () => {
    it('should create a new ${camel}', () => {
      return request(app.getHttpServer())
        .post('/${pluralKebab}')
        .send(valid${pascal}Data)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.${inputFields[0]?.name || 'id'}).toBe(valid${pascal}Data.${inputFields[0]?.name || 'id'});
          created${pascal}Id = res.body.id;
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/${pluralKebab}')
        .send({})
        .expect(400);
    });
  });

  describe('GET /${pluralKebab}', () => {
    it('should return a list of ${plural}', () => {
      return request(app.getHttpServer())
        .get('/${pluralKebab}')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/${pluralKebab}?skip=0&take=10')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(10);
        });
    });
  });

  describe('GET /${pluralKebab}/:id', () => {
    it('should return a ${camel} by id', () => {
      return request(app.getHttpServer())
        .get(\`/${pluralKebab}/\${created${pascal}Id}\`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(created${pascal}Id);
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/${pluralKebab}/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 for invalid UUID', () => {
      return request(app.getHttpServer())
        .get('/${pluralKebab}/invalid-uuid')
        .expect(400);
    });
  });

  describe('PATCH /${pluralKebab}/:id', () => {
    it('should update a ${camel}', () => {
      const updateData = {
        ${inputFields[0]?.name || 'name'}: 'updated-value',
      };

      return request(app.getHttpServer())
        .patch(\`/${pluralKebab}/\${created${pascal}Id}\`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.${inputFields[0]?.name || 'name'}).toBe('updated-value');
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .patch('/${pluralKebab}/00000000-0000-0000-0000-000000000000')
        .send({ ${inputFields[0]?.name || 'name'}: 'test' })
        .expect(404);
    });
  });

  describe('DELETE /${pluralKebab}/:id', () => {
    it('should delete a ${camel}', () => {
      return request(app.getHttpServer())
        .delete(\`/${pluralKebab}/\${created${pascal}Id}\`)
        .expect(204);
    });

    it('should return 404 for already deleted ${camel}', () => {
      return request(app.getHttpServer())
        .delete(\`/${pluralKebab}/\${created${pascal}Id}\`)
        .expect(404);
    });
  });
});
`;

  // Write test files
  fs.writeFileSync(path.join(outputBase, `${kebab}.service.spec.ts`), serviceSpec);

  // Create e2e test directory if needed
  const e2eDir = path.join(PROJECT_ROOT, 'test', kebab);
  fs.mkdirSync(e2eDir, { recursive: true });
  fs.writeFileSync(path.join(e2eDir, `${kebab}.e2e-spec.ts`), e2eSpec);

  return {
    outputDir: outputBase,
    files: [
      `dto/create-${kebab}.dto.ts`,
      `dto/update-${kebab}.dto.ts`,
      `dto/${kebab}-response.dto.ts`,
      `dto/index.ts`,
      `${kebab}.service.ts`,
      `${kebab}.controller.ts`,
      `${kebab}.module.ts`,
      `${kebab}.service.spec.ts`,
    ],
    testFiles: [
      `${kebab}.service.spec.ts`,
      `test/${kebab}/${kebab}.e2e-spec.ts`,
    ],
    endpoints: [
      { method: 'POST', path: `/${pluralKebab}`, action: 'Create' },
      { method: 'GET', path: `/${pluralKebab}`, action: 'List' },
      { method: 'GET', path: `/${pluralKebab}/:id`, action: 'Get by ID' },
      { method: 'PATCH', path: `/${pluralKebab}/:id`, action: 'Update' },
      { method: 'DELETE', path: `/${pluralKebab}/:id`, action: 'Delete' },
    ],
    moduleImport: `import { ${pascal}Module } from './${kebab}/${kebab}.module';`,
  };
}

// =============================================================================
// JAVA REACTIVE GENERATORS
// =============================================================================

function generateJavaReactiveCrud(fields) {
  const basePackage = detectJavaPackage();
  const outputBase = OUTPUT_DIR || path.join(PROJECT_ROOT, 'src/main/java', basePackage.replace(/\./g, '/'), kebab);
  fs.mkdirSync(outputBase, { recursive: true });
  fs.mkdirSync(path.join(outputBase, 'dto'), { recursive: true });

  const inputFields = fields.filter(f => !['id', 'createdAt', 'updatedAt'].includes(f.name));

  // Repository (R2DBC)
  const repository = `/**
 * ${pascal}Repository.java
 * Reactive repository for ${pascal}
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import ${basePackage}.entity.${pascal};
import reactor.core.publisher.Flux;

@Repository
public interface ${pascal}Repository extends R2dbcRepository<${pascal}, String> {
    Flux<${pascal}> findAllByOrderByCreatedAtDesc();
}
`;

  // Service
  const service = `/**
 * ${pascal}Service.java
 * Reactive CRUD service for ${pascal}
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ${basePackage}.entity.${pascal};
import ${basePackage}.${kebab}.dto.Create${pascal}Dto;
import ${basePackage}.${kebab}.dto.Update${pascal}Dto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Transactional
public class ${pascal}Service {

    private final ${pascal}Repository repository;

    public Mono<${pascal}> create(Create${pascal}Dto dto) {
        ${pascal} entity = new ${pascal}();
${inputFields.map(f => `        entity.set${toPascalCase(f.name)}(dto.get${toPascalCase(f.name)}());`).join('\n')}
        return repository.save(entity);
    }

    @Transactional(readOnly = true)
    public Flux<${pascal}> findAll(int skip, int take) {
        return repository.findAllByOrderByCreatedAtDesc()
                .skip(skip)
                .take(Math.min(take, 100));
    }

    @Transactional(readOnly = true)
    public Mono<${pascal}> findById(String id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new ${pascal}NotFoundException(id)));
    }

    public Mono<${pascal}> update(String id, Update${pascal}Dto dto) {
        return findById(id)
                .flatMap(entity -> {
${inputFields.map(f => `                    if (dto.get${toPascalCase(f.name)}() != null) entity.set${toPascalCase(f.name)}(dto.get${toPascalCase(f.name)}());`).join('\n')}
                    return repository.save(entity);
                });
    }

    public Mono<Void> delete(String id) {
        return findById(id)
                .flatMap(repository::delete);
    }

    public Mono<Long> count() {
        return repository.count();
    }
}
`;

  // Controller
  const controller = `/**
 * ${pascal}Controller.java
 * Reactive REST controller for ${pascal}
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ${basePackage}.entity.${pascal};
import ${basePackage}.${kebab}.dto.Create${pascal}Dto;
import ${basePackage}.${kebab}.dto.Update${pascal}Dto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/${pluralKebab}")
@RequiredArgsConstructor
@Tag(name = "${pluralPascal}", description = "${pascal} management APIs")
public class ${pascal}Controller {

    private final ${pascal}Service service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new ${camel}")
    public Mono<${pascal}> create(@Valid @RequestBody Create${pascal}Dto dto) {
        return service.create(dto);
    }

    @GetMapping
    @Operation(summary = "List all ${plural}")
    public Flux<${pascal}> findAll(
            @Parameter(description = "Pagination offset") @RequestParam(defaultValue = "0") int skip,
            @Parameter(description = "Pagination limit") @RequestParam(defaultValue = "100") int take) {
        return service.findAll(skip, take);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ${camel} by ID")
    public Mono<${pascal}> findById(@PathVariable String id) {
        return service.findById(id);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update ${camel}")
    public Mono<${pascal}> update(@PathVariable String id, @Valid @RequestBody Update${pascal}Dto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete ${camel}")
    public Mono<Void> delete(@PathVariable String id) {
        return service.delete(id);
    }
}
`;

  // Exception
  const exception = `/**
 * ${pascal}NotFoundException.java
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ${pascal}NotFoundException extends RuntimeException {
    public ${pascal}NotFoundException(String id) {
        super("${pascal} not found with id: " + id);
    }
}
`;

  // Create DTO
  const createDto = `/**
 * Create${pascal}Dto.java
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab}.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class Create${pascal}Dto {
${inputFields.map(f => {
  const annotations = [];
  if (!f.nullable) annotations.push('    @NotNull');
  if (f.name.toLowerCase().includes('email')) annotations.push('    @Email');
  if (f.type === 'String' && !f.nullable) annotations.push('    @NotBlank');
  return `${annotations.join('\n')}
    private ${f.type} ${f.name};`;
}).join('\n\n')}
}
`;

  // Update DTO
  const updateDto = `/**
 * Update${pascal}Dto.java
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab}.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class Update${pascal}Dto {
${inputFields.map(f => {
  const annotations = [];
  if (f.name.toLowerCase().includes('email')) annotations.push('    @Email');
  return `${annotations.length ? annotations.join('\n') + '\n' : ''}    private ${f.type} ${f.name};`;
}).join('\n\n')}
}
`;

  // Unit Test for Service
  const serviceTest = `/**
 * ${pascal}ServiceTest.java
 * Unit tests for ${pascal}Service (Reactive)
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ${basePackage}.entity.${pascal};
import ${basePackage}.${kebab}.dto.Create${pascal}Dto;
import ${basePackage}.${kebab}.dto.Update${pascal}Dto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ${pascal}ServiceTest {

    @Mock
    private ${pascal}Repository repository;

    @InjectMocks
    private ${pascal}Service service;

    private ${pascal} test${pascal};
    private Create${pascal}Dto createDto;
    private Update${pascal}Dto updateDto;

    @BeforeEach
    void setUp() {
        test${pascal} = new ${pascal}();
        test${pascal}.setId("test-uuid-1234");
${inputFields.map(f => \`        test${pascal}.set${toPascalCase(f.name)}(${f.type === 'String' ? \`"test-${f.name}"\` : f.type === 'Integer' || f.type === 'Long' ? '1' : 'null'});\`).join('\\n')}

        createDto = new Create${pascal}Dto();
${inputFields.filter(f => !f.nullable).map(f => \`        createDto.set${toPascalCase(f.name)}(${f.type === 'String' ? \`"test-${f.name}"\` : f.type === 'Integer' || f.type === 'Long' ? '1' : 'null'});\`).join('\\n')}

        updateDto = new Update${pascal}Dto();
        updateDto.set${toPascalCase(inputFields[0]?.name || 'name')}("updated-value");
    }

    @Test
    void create_shouldSaveAndReturn${pascal}() {
        when(repository.save(any(${pascal}.class))).thenReturn(Mono.just(test${pascal}));

        StepVerifier.create(service.create(createDto))
            .expectNext(test${pascal})
            .verifyComplete();

        verify(repository).save(any(${pascal}.class));
    }

    @Test
    void findAll_shouldReturnFluxOf${pluralPascal}() {
        when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(Flux.just(test${pascal}));

        StepVerifier.create(service.findAll(0, 10))
            .expectNext(test${pascal})
            .verifyComplete();
    }

    @Test
    void findById_shouldReturn${pascal}WhenFound() {
        when(repository.findById("test-uuid-1234")).thenReturn(Mono.just(test${pascal}));

        StepVerifier.create(service.findById("test-uuid-1234"))
            .expectNext(test${pascal})
            .verifyComplete();
    }

    @Test
    void findById_shouldThrowWhenNotFound() {
        when(repository.findById("nonexistent")).thenReturn(Mono.empty());

        StepVerifier.create(service.findById("nonexistent"))
            .expectError(${pascal}NotFoundException.class)
            .verify();
    }

    @Test
    void update_shouldUpdateAndReturn${pascal}() {
        when(repository.findById("test-uuid-1234")).thenReturn(Mono.just(test${pascal}));
        when(repository.save(any(${pascal}.class))).thenReturn(Mono.just(test${pascal}));

        StepVerifier.create(service.update("test-uuid-1234", updateDto))
            .expectNext(test${pascal})
            .verifyComplete();

        verify(repository).save(any(${pascal}.class));
    }

    @Test
    void delete_shouldRemove${pascal}() {
        when(repository.findById("test-uuid-1234")).thenReturn(Mono.just(test${pascal}));
        when(repository.delete(test${pascal})).thenReturn(Mono.empty());

        StepVerifier.create(service.delete("test-uuid-1234"))
            .verifyComplete();

        verify(repository).delete(test${pascal});
    }

    @Test
    void count_shouldReturnCount() {
        when(repository.count()).thenReturn(Mono.just(5L));

        StepVerifier.create(service.count())
            .expectNext(5L)
            .verifyComplete();
    }
}
`;

  // E2E Test for Controller
  const controllerTest = `/**
 * ${pascal}ControllerTest.java
 * E2E/Integration tests for ${pascal}Controller (Reactive)
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import ${basePackage}.entity.${pascal};
import ${basePackage}.${kebab}.dto.Create${pascal}Dto;
import ${basePackage}.${kebab}.dto.Update${pascal}Dto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@WebFluxTest(${pascal}Controller.class)
class ${pascal}ControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private ${pascal}Service service;

    @Test
    void create_shouldReturn201() {
        ${pascal} entity = new ${pascal}();
        entity.setId("test-uuid");

        when(service.create(any(Create${pascal}Dto.class))).thenReturn(Mono.just(entity));

        webTestClient.post()
            .uri("/api/${pluralKebab}")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("{${inputFields.filter(f => !f.nullable).map(f => \`\\"${f.name}\\": \\"test\\"\`).join(', ')}}")
            .exchange()
            .expectStatus().isCreated()
            .expectBody()
            .jsonPath("$.id").isEqualTo("test-uuid");
    }

    @Test
    void findAll_shouldReturn200() {
        ${pascal} entity = new ${pascal}();
        entity.setId("test-uuid");

        when(service.findAll(0, 100)).thenReturn(Flux.just(entity));

        webTestClient.get()
            .uri("/api/${pluralKebab}")
            .exchange()
            .expectStatus().isOk()
            .expectBodyList(${pascal}.class)
            .hasSize(1);
    }

    @Test
    void findById_shouldReturn200WhenFound() {
        ${pascal} entity = new ${pascal}();
        entity.setId("test-uuid");

        when(service.findById("test-uuid")).thenReturn(Mono.just(entity));

        webTestClient.get()
            .uri("/api/${pluralKebab}/test-uuid")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.id").isEqualTo("test-uuid");
    }

    @Test
    void findById_shouldReturn404WhenNotFound() {
        when(service.findById("nonexistent"))
            .thenReturn(Mono.error(new ${pascal}NotFoundException("nonexistent")));

        webTestClient.get()
            .uri("/api/${pluralKebab}/nonexistent")
            .exchange()
            .expectStatus().isNotFound();
    }

    @Test
    void update_shouldReturn200() {
        ${pascal} entity = new ${pascal}();
        entity.setId("test-uuid");

        when(service.update(eq("test-uuid"), any(Update${pascal}Dto.class)))
            .thenReturn(Mono.just(entity));

        webTestClient.patch()
            .uri("/api/${pluralKebab}/test-uuid")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("{}")
            .exchange()
            .expectStatus().isOk();
    }

    @Test
    void delete_shouldReturn204() {
        when(service.delete("test-uuid")).thenReturn(Mono.empty());

        webTestClient.delete()
            .uri("/api/${pluralKebab}/test-uuid")
            .exchange()
            .expectStatus().isNoContent();
    }
}
`;

  // Write files
  fs.writeFileSync(path.join(outputBase, `${pascal}Repository.java`), repository);
  fs.writeFileSync(path.join(outputBase, `${pascal}Service.java`), service);
  fs.writeFileSync(path.join(outputBase, `${pascal}Controller.java`), controller);
  fs.writeFileSync(path.join(outputBase, `${pascal}NotFoundException.java`), exception);
  fs.writeFileSync(path.join(outputBase, 'dto', `Create${pascal}Dto.java`), createDto);
  fs.writeFileSync(path.join(outputBase, 'dto', `Update${pascal}Dto.java`), updateDto);

  // Write test files
  const testBase = path.join(PROJECT_ROOT, 'src/test/java', basePackage.replace(/\./g, '/'), kebab);
  fs.mkdirSync(testBase, { recursive: true });
  fs.writeFileSync(path.join(testBase, `${pascal}ServiceTest.java`), serviceTest);
  fs.writeFileSync(path.join(testBase, `${pascal}ControllerTest.java`), controllerTest);

  return {
    outputDir: outputBase,
    files: [
      `${pascal}Repository.java`,
      `${pascal}Service.java`,
      `${pascal}Controller.java`,
      `${pascal}NotFoundException.java`,
      `dto/Create${pascal}Dto.java`,
      `dto/Update${pascal}Dto.java`,
    ],
    testFiles: [
      `src/test/java/.../\${kebab}/${pascal}ServiceTest.java`,
      `src/test/java/.../\${kebab}/${pascal}ControllerTest.java`,
    ],
    endpoints: [
      { method: 'POST', path: `/api/${pluralKebab}`, action: 'Create' },
      { method: 'GET', path: `/api/${pluralKebab}`, action: 'List' },
      { method: 'GET', path: `/api/${pluralKebab}/{id}`, action: 'Get by ID' },
      { method: 'PATCH', path: `/api/${pluralKebab}/{id}`, action: 'Update' },
      { method: 'DELETE', path: `/api/${pluralKebab}/{id}`, action: 'Delete' },
    ],
    reactive: true,
  };
}

// =============================================================================
// JAVA JPA GENERATORS
// =============================================================================

function generateJavaJpaCrud(fields) {
  const basePackage = detectJavaPackage();
  const outputBase = OUTPUT_DIR || path.join(PROJECT_ROOT, 'src/main/java', basePackage.replace(/\./g, '/'), kebab);
  fs.mkdirSync(outputBase, { recursive: true });
  fs.mkdirSync(path.join(outputBase, 'dto'), { recursive: true });

  const inputFields = fields.filter(f => !['id', 'createdAt', 'updatedAt'].includes(f.name));

  // Repository (JPA)
  const repository = `/**
 * ${pascal}Repository.java
 * JPA repository for ${pascal}
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import ${basePackage}.entity.${pascal};

@Repository
public interface ${pascal}Repository extends JpaRepository<${pascal}, String> {
    Page<${pascal}> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
`;

  // Service
  const service = `/**
 * ${pascal}Service.java
 * CRUD service for ${pascal}
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ${basePackage}.entity.${pascal};
import ${basePackage}.${kebab}.dto.Create${pascal}Dto;
import ${basePackage}.${kebab}.dto.Update${pascal}Dto;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ${pascal}Service {

    private final ${pascal}Repository repository;

    public ${pascal} create(Create${pascal}Dto dto) {
        ${pascal} entity = new ${pascal}();
${inputFields.map(f => `        entity.set${toPascalCase(f.name)}(dto.get${toPascalCase(f.name)}());`).join('\n')}
        return repository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<${pascal}> findAll(int page, int size) {
        Page<${pascal}> result = repository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, Math.min(size, 100)));
        return result.getContent();
    }

    @Transactional(readOnly = true)
    public ${pascal} findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ${pascal}NotFoundException(id));
    }

    public ${pascal} update(String id, Update${pascal}Dto dto) {
        ${pascal} entity = findById(id);
${inputFields.map(f => `        if (dto.get${toPascalCase(f.name)}() != null) entity.set${toPascalCase(f.name)}(dto.get${toPascalCase(f.name)}());`).join('\n')}
        return repository.save(entity);
    }

    public void delete(String id) {
        ${pascal} entity = findById(id);
        repository.delete(entity);
    }

    public long count() {
        return repository.count();
    }
}
`;

  // Controller
  const controller = `/**
 * ${pascal}Controller.java
 * REST controller for ${pascal}
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ${basePackage}.entity.${pascal};
import ${basePackage}.${kebab}.dto.Create${pascal}Dto;
import ${basePackage}.${kebab}.dto.Update${pascal}Dto;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/${pluralKebab}")
@RequiredArgsConstructor
@Tag(name = "${pluralPascal}", description = "${pascal} management APIs")
public class ${pascal}Controller {

    private final ${pascal}Service service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new ${camel}")
    public ${pascal} create(@Valid @RequestBody Create${pascal}Dto dto) {
        return service.create(dto);
    }

    @GetMapping
    @Operation(summary = "List all ${plural}")
    public List<${pascal}> findAll(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "100") int size) {
        return service.findAll(page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ${camel} by ID")
    public ${pascal} findById(@PathVariable String id) {
        return service.findById(id);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update ${camel}")
    public ${pascal} update(@PathVariable String id, @Valid @RequestBody Update${pascal}Dto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete ${camel}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
`;

  // Exception
  const exception = `/**
 * ${pascal}NotFoundException.java
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ${pascal}NotFoundException extends RuntimeException {
    public ${pascal}NotFoundException(String id) {
        super("${pascal} not found with id: " + id);
    }
}
`;

  // Create DTO
  const createDto = `/**
 * Create${pascal}Dto.java
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab}.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class Create${pascal}Dto {
${inputFields.map(f => {
  const annotations = [];
  if (!f.nullable) annotations.push('    @NotNull');
  if (f.name.toLowerCase().includes('email')) annotations.push('    @Email');
  if (f.type === 'String' && !f.nullable) annotations.push('    @NotBlank');
  return `${annotations.join('\n')}
    private ${f.type} ${f.name};`;
}).join('\n\n')}
}
`;

  // Update DTO
  const updateDto = `/**
 * Update${pascal}Dto.java
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab}.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class Update${pascal}Dto {
${inputFields.map(f => {
  const annotations = [];
  if (f.name.toLowerCase().includes('email')) annotations.push('    @Email');
  return `${annotations.length ? annotations.join('\n') + '\n' : ''}    private ${f.type} ${f.name};`;
}).join('\n\n')}
}
`;

  // Unit Test for Service
  const serviceTest = `/**
 * ${pascal}ServiceTest.java
 * Unit tests for ${pascal}Service (JPA)
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import ${basePackage}.entity.${pascal};
import ${basePackage}.${kebab}.dto.Create${pascal}Dto;
import ${basePackage}.${kebab}.dto.Update${pascal}Dto;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ${pascal}ServiceTest {

    @Mock
    private ${pascal}Repository repository;

    @InjectMocks
    private ${pascal}Service service;

    private ${pascal} test${pascal};
    private Create${pascal}Dto createDto;
    private Update${pascal}Dto updateDto;

    @BeforeEach
    void setUp() {
        test${pascal} = new ${pascal}();
        test${pascal}.setId("test-uuid-1234");
${inputFields.map(f => \`        test${pascal}.set${toPascalCase(f.name)}(${f.type === 'String' ? \`"test-${f.name}"\` : f.type === 'Integer' || f.type === 'Long' ? '1' : 'null'});\`).join('\\n')}

        createDto = new Create${pascal}Dto();
${inputFields.filter(f => !f.nullable).map(f => \`        createDto.set${toPascalCase(f.name)}(${f.type === 'String' ? \`"test-${f.name}"\` : f.type === 'Integer' || f.type === 'Long' ? '1' : 'null'});\`).join('\\n')}

        updateDto = new Update${pascal}Dto();
        updateDto.set${toPascalCase(inputFields[0]?.name || 'name')}("updated-value");
    }

    @Test
    void create_shouldSaveAndReturn${pascal}() {
        when(repository.save(any(${pascal}.class))).thenReturn(test${pascal});

        ${pascal} result = service.create(createDto);

        assertThat(result).isEqualTo(test${pascal});
        verify(repository).save(any(${pascal}.class));
    }

    @Test
    void findAll_shouldReturnListOf${pluralPascal}() {
        Page<${pascal}> page = new PageImpl<>(List.of(test${pascal}));
        when(repository.findAllByOrderByCreatedAtDesc(any(PageRequest.class))).thenReturn(page);

        List<${pascal}> result = service.findAll(0, 10);

        assertThat(result).containsExactly(test${pascal});
    }

    @Test
    void findById_shouldReturn${pascal}WhenFound() {
        when(repository.findById("test-uuid-1234")).thenReturn(Optional.of(test${pascal}));

        ${pascal} result = service.findById("test-uuid-1234");

        assertThat(result).isEqualTo(test${pascal});
    }

    @Test
    void findById_shouldThrowWhenNotFound() {
        when(repository.findById("nonexistent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById("nonexistent"))
            .isInstanceOf(${pascal}NotFoundException.class);
    }

    @Test
    void update_shouldUpdateAndReturn${pascal}() {
        when(repository.findById("test-uuid-1234")).thenReturn(Optional.of(test${pascal}));
        when(repository.save(any(${pascal}.class))).thenReturn(test${pascal});

        ${pascal} result = service.update("test-uuid-1234", updateDto);

        assertThat(result).isEqualTo(test${pascal});
        verify(repository).save(any(${pascal}.class));
    }

    @Test
    void delete_shouldRemove${pascal}() {
        when(repository.findById("test-uuid-1234")).thenReturn(Optional.of(test${pascal}));
        doNothing().when(repository).delete(test${pascal});

        service.delete("test-uuid-1234");

        verify(repository).delete(test${pascal});
    }

    @Test
    void count_shouldReturnCount() {
        when(repository.count()).thenReturn(5L);

        long result = service.count();

        assertThat(result).isEqualTo(5L);
    }
}
`;

  // E2E Test for Controller
  const controllerTest = `/**
 * ${pascal}ControllerTest.java
 * E2E/Integration tests for ${pascal}Controller (JPA)
 * @version 1.0.0
 * @turns [${TURN_ID}]
 * @generated ${DATE} by AI Coding Agent
 */
package ${basePackage}.${kebab};

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import ${basePackage}.entity.${pascal};
import ${basePackage}.${kebab}.dto.Create${pascal}Dto;
import ${basePackage}.${kebab}.dto.Update${pascal}Dto;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(${pascal}Controller.class)
class ${pascal}ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ${pascal}Service service;

    @Test
    void create_shouldReturn201() throws Exception {
        ${pascal} entity = new ${pascal}();
        entity.setId("test-uuid");

        when(service.create(any(Create${pascal}Dto.class))).thenReturn(entity);

        Create${pascal}Dto dto = new Create${pascal}Dto();
${inputFields.filter(f => !f.nullable).map(f => \`        dto.set${toPascalCase(f.name)}(${f.type === 'String' ? \`"test"\` : '1'});\`).join('\\n')}

        mockMvc.perform(post("/api/${pluralKebab}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value("test-uuid"));
    }

    @Test
    void findAll_shouldReturn200() throws Exception {
        ${pascal} entity = new ${pascal}();
        entity.setId("test-uuid");

        when(service.findAll(0, 100)).thenReturn(List.of(entity));

        mockMvc.perform(get("/api/${pluralKebab}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value("test-uuid"));
    }

    @Test
    void findById_shouldReturn200WhenFound() throws Exception {
        ${pascal} entity = new ${pascal}();
        entity.setId("test-uuid");

        when(service.findById("test-uuid")).thenReturn(entity);

        mockMvc.perform(get("/api/${pluralKebab}/test-uuid"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("test-uuid"));
    }

    @Test
    void findById_shouldReturn404WhenNotFound() throws Exception {
        when(service.findById("nonexistent"))
            .thenThrow(new ${pascal}NotFoundException("nonexistent"));

        mockMvc.perform(get("/api/${pluralKebab}/nonexistent"))
            .andExpect(status().isNotFound());
    }

    @Test
    void update_shouldReturn200() throws Exception {
        ${pascal} entity = new ${pascal}();
        entity.setId("test-uuid");

        when(service.update(eq("test-uuid"), any(Update${pascal}Dto.class)))
            .thenReturn(entity);

        Update${pascal}Dto dto = new Update${pascal}Dto();

        mockMvc.perform(patch("/api/${pluralKebab}/test-uuid")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isOk());
    }

    @Test
    void delete_shouldReturn204() throws Exception {
        doNothing().when(service).delete("test-uuid");

        mockMvc.perform(delete("/api/${pluralKebab}/test-uuid"))
            .andExpect(status().isNoContent());
    }
}
`;

  // Write files
  fs.writeFileSync(path.join(outputBase, `${pascal}Repository.java`), repository);
  fs.writeFileSync(path.join(outputBase, `${pascal}Service.java`), service);
  fs.writeFileSync(path.join(outputBase, `${pascal}Controller.java`), controller);
  fs.writeFileSync(path.join(outputBase, `${pascal}NotFoundException.java`), exception);
  fs.writeFileSync(path.join(outputBase, 'dto', `Create${pascal}Dto.java`), createDto);
  fs.writeFileSync(path.join(outputBase, 'dto', `Update${pascal}Dto.java`), updateDto);

  // Write test files
  const testBase = path.join(PROJECT_ROOT, 'src/test/java', basePackage.replace(/\./g, '/'), kebab);
  fs.mkdirSync(testBase, { recursive: true });
  fs.writeFileSync(path.join(testBase, `${pascal}ServiceTest.java`), serviceTest);
  fs.writeFileSync(path.join(testBase, `${pascal}ControllerTest.java`), controllerTest);

  return {
    outputDir: outputBase,
    files: [
      `${pascal}Repository.java`,
      `${pascal}Service.java`,
      `${pascal}Controller.java`,
      `${pascal}NotFoundException.java`,
      `dto/Create${pascal}Dto.java`,
      `dto/Update${pascal}Dto.java`,
    ],
    testFiles: [
      `src/test/java/.../\${kebab}/${pascal}ServiceTest.java`,
      `src/test/java/.../\${kebab}/${pascal}ControllerTest.java`,
    ],
    endpoints: [
      { method: 'POST', path: `/api/${pluralKebab}`, action: 'Create' },
      { method: 'GET', path: `/api/${pluralKebab}`, action: 'List' },
      { method: 'GET', path: `/api/${pluralKebab}/{id}`, action: 'Get by ID' },
      { method: 'PATCH', path: `/api/${pluralKebab}/{id}`, action: 'Update' },
      { method: 'DELETE', path: `/api/${pluralKebab}/{id}`, action: 'Delete' },
    ],
    reactive: false,
  };
}

function detectJavaPackage() {
  // Try to detect from existing Java files
  const srcMain = path.join(PROJECT_ROOT, 'src/main/java');
  if (fs.existsSync(srcMain)) {
    const dirs = fs.readdirSync(srcMain, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'));
    if (dirs.length > 0) {
      // Traverse to find package
      let pkg = [];
      let current = path.join(srcMain, dirs[0].name);
      pkg.push(dirs[0].name);
      while (fs.existsSync(current)) {
        const subdirs = fs.readdirSync(current, { withFileTypes: true })
          .filter(d => d.isDirectory());
        if (subdirs.length === 1) {
          pkg.push(subdirs[0].name);
          current = path.join(current, subdirs[0].name);
        } else break;
      }
      return pkg.join('.');
    }
  }
  return 'com.example.app';
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
  console.log(`\n🔍 Finding entity: ${ENTITY_NAME}`);

  const entityFile = findEntityFile();
  if (!entityFile) {
    console.error(`❌ Entity ${ENTITY_NAME} not found.`);
    console.error('   Run /schema-to-database first to generate the entity.');
    process.exit(1);
  }
  console.log(`✓ Found: ${entityFile}`);

  const content = fs.readFileSync(entityFile, 'utf-8');
  let parsed;

  if (entityFile.endsWith('.ts')) {
    parsed = parseTypeScriptEntity(content);
  } else if (entityFile.endsWith('.java')) {
    parsed = parseJavaEntity(content);
  }

  console.log(`✓ Parsed ${parsed.fields.length} fields`);
  console.log(`\n🏗️  Generating ${STACK_TYPE} CRUD...`);

  let result;
  switch (STACK_TYPE) {
    case 'typescript':
      result = generateTypeScriptCrud(parsed.fields);
      break;
    case 'java-reactive':
      result = generateJavaReactiveCrud(parsed.fields);
      break;
    case 'java-jpa':
      result = generateJavaJpaCrud(parsed.fields);
      break;
    default:
      console.error(`❌ Unknown stack type: ${STACK_TYPE}`);
      process.exit(1);
  }

  // Output summary as JSON for skill to parse
  console.log('\n--- OUTPUT ---');
  console.log(JSON.stringify(result, null, 2));
}

main();
