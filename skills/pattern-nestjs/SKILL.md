---
name: pattern-nestjs
description: NestJS patterns for modules, controllers, services, DTOs, guards, and pipes. Activate when building NestJS API endpoints or backend features.
---

# NestJS Patterns

## Module Structure

Every feature follows this structure:

```
app/api/src/modules/feature/
├── feature.module.ts          # Imports/exports/providers
├── feature.controller.ts      # HTTP handlers + Swagger docs
├── feature.service.ts         # Business logic + DB access
├── dto/
│   ├── create-feature.dto.ts  # Input validation with nestjs-zod
│   └── feature-response.dto.ts # Output shape
└── feature.controller.spec.ts # Unit tests
```

## DTO with nestjs-zod

```typescript
// dto/create-user.dto.ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['user', 'admin']).default('user'),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}

// Response DTO
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;

  static from(user: User): UserResponseDto {
    return Object.assign(new UserResponseDto(), {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  }
}
```

## Controller

```typescript
// feature.controller.ts
import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(dto);
    return UserResponseDto.from(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOneOrThrow(id);
    return UserResponseDto.from(user);
  }
}
```

## Service

```typescript
// feature.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectDrizzle } from '@/database/drizzle.module';

@Injectable()
export class UsersService {
  constructor(@InjectDrizzle() private readonly db: DrizzleDB) {}

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const [user] = await this.db.insert(users).values(dto).returning();
      return user;
    } catch (err) {
      if (err instanceof Error && err.message.includes('unique')) {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }

  async findOneOrThrow(id: string): Promise<User> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}
```

## Guard Pattern

```typescript
// guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

## Module Registration

```typescript
// feature.module.ts
@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Only export if other modules need it
})
export class UsersModule {}

// app.module.ts — register the module
@Module({
  imports: [UsersModule, ...other modules],
})
export class AppModule {}
```

## Anti-Patterns

- `class-validator` — use `nestjs-zod` instead
- Business logic in controllers
- Raw SQL strings — use Drizzle
- Exposing database entities directly in responses
- `throw new Error()` — use NestJS exceptions
