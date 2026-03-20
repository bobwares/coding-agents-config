#!/bin/bash
# =============================================================================
# detect-stack.sh - Detect project stack type
# Returns: typescript | java-reactive | java-jpa
# =============================================================================

PROJECT_ROOT="${1:-.}"

# Check for TypeScript/NestJS
if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    if grep -q "@nestjs/core" "$PROJECT_ROOT/package.json" 2>/dev/null || \
       grep -q "@nestjs/core" "$PROJECT_ROOT/app/package.json" 2>/dev/null || \
       grep -q "@nestjs/core" "$PROJECT_ROOT/app/api/package.json" 2>/dev/null; then
        echo "typescript"
        exit 0
    fi
fi

# Check for Java/Spring
if [[ -f "$PROJECT_ROOT/pom.xml" ]] || [[ -f "$PROJECT_ROOT/build.gradle" ]] || [[ -f "$PROJECT_ROOT/build.gradle.kts" ]]; then
    # Check for WebFlux (reactive) - default for Java
    if grep -q "spring-boot-starter-webflux" "$PROJECT_ROOT/pom.xml" 2>/dev/null || \
       grep -q "spring-boot-starter-webflux" "$PROJECT_ROOT/build.gradle" 2>/dev/null || \
       grep -q "spring-boot-starter-webflux" "$PROJECT_ROOT/build.gradle.kts" 2>/dev/null; then
        echo "java-reactive"
        exit 0
    fi

    # Check for R2DBC (reactive DB)
    if grep -q "r2dbc" "$PROJECT_ROOT/pom.xml" 2>/dev/null || \
       grep -q "r2dbc" "$PROJECT_ROOT/build.gradle" 2>/dev/null; then
        echo "java-reactive"
        exit 0
    fi

    # Check for Spring MVC + JPA (blocking)
    if grep -q "spring-boot-starter-web" "$PROJECT_ROOT/pom.xml" 2>/dev/null || \
       grep -q "spring-boot-starter-data-jpa" "$PROJECT_ROOT/pom.xml" 2>/dev/null; then
        echo "java-jpa"
        exit 0
    fi

    # Default Java to reactive
    echo "java-reactive"
    exit 0
fi

# Fallback: check for common patterns
if find "$PROJECT_ROOT" -name "*.ts" -type f 2>/dev/null | head -1 | grep -q .; then
    echo "typescript"
    exit 0
fi

if find "$PROJECT_ROOT" -name "*.java" -type f 2>/dev/null | head -1 | grep -q .; then
    echo "java-reactive"
    exit 0
fi

echo "unknown"
exit 1
