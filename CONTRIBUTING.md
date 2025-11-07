# Contributing to Taktak

Thank you for your interest in contributing to Taktak! This document provides guidelines and standards for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- (Optional) Docker for CouchDB

### Setup

```bash
# Clone the repository
git clone https://github.com/MfFischer/taktak.git
cd taktak

# Install dependencies
npm install

# Build shared types
cd packages/types && npm run build && cd ../..

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development
npm run dev
```

---

## Coding Standards

### File Naming Conventions

```
✅ PascalCase.tsx        - React components
✅ camelCase.ts          - Utilities, services, hooks
✅ kebab-case.test.ts    - Test files
✅ SCREAMING_SNAKE.md    - Documentation files
```

**Examples:**
- `WorkflowEditor.tsx` - React component
- `workflowService.ts` - Service file
- `useWorkflow.ts` - Custom hook
- `workflowService.test.ts` - Test file

### Code Naming Conventions

#### Variables & Functions
```typescript
// ✅ camelCase for variables and functions
const workflowEngine = new WorkflowEngine();
const userName = 'John';

async function executeWorkflow(id: string): Promise<void> {
  // implementation
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### Classes & Components
```typescript
// ✅ PascalCase for classes and React components
class WorkflowService {
  constructor() {}
}

function WorkflowEditor() {
  return <div>Editor</div>;
}

interface WorkflowEditorProps {
  workflowId: string;
}
```

#### Constants
```typescript
// ✅ SCREAMING_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = process.env.VITE_API_URL;
const DEFAULT_TIMEOUT_MS = 5000;
```

#### Interfaces & Types
```typescript
// ✅ PascalCase for interfaces and types
interface Workflow {
  id: string;
  name: string;
}

type WorkflowStatus = 'active' | 'paused' | 'draft';

// ✅ Use descriptive names
interface WorkflowExecutionContext {
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
}
```

#### Enums
```typescript
// ✅ PascalCase for enum names, SCREAMING_SNAKE_CASE for values
enum NodeType {
  SCHEDULE = 'schedule',
  DATABASE_QUERY = 'database_query',
  SEND_EMAIL = 'send_email',
}
```

### TypeScript Standards

#### Always Use Explicit Types
```typescript
// ✅ Good - explicit return type
async function getWorkflow(id: string): Promise<Workflow> {
  return await workflowService.findById(id);
}

// ❌ Bad - implicit return type
async function getWorkflow(id: string) {
  return await workflowService.findById(id);
}
```

#### Avoid `any`, Use `unknown` or Proper Types
```typescript
// ✅ Good - use unknown for truly unknown data
function parseJSON(input: string): unknown {
  return JSON.parse(input);
}

// ✅ Good - use proper types
function processWorkflow(workflow: Workflow): void {
  // implementation
}

// ❌ Bad - avoid any
function processData(data: any): void {
  // implementation
}
```

#### Use Strict Null Checks
```typescript
// ✅ Good - explicit null handling
function findUser(id: string): User | null {
  return users.find(u => u.id === id) ?? null;
}

// ✅ Good - use optional chaining
const userName = user?.profile?.name ?? 'Anonymous';
```

#### Prefer `readonly` for Immutability
```typescript
// ✅ Good - readonly properties
interface Config {
  readonly apiKey: string;
  readonly timeout: number;
}

// ✅ Good - readonly arrays
function processItems(items: readonly Item[]): void {
  // items cannot be modified
}
```

### Import Order

Organize imports in the following order with blank lines between groups:

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import express from 'express';
import { z } from 'zod';

// 2. Internal modules (absolute paths)
import { WorkflowService } from '@/services/workflowService';
import { logger } from '@/utils/logger';

// 3. Relative imports
import { Button } from '../components/Button';
import { useWorkflow } from './useWorkflow';

// 4. Types (use 'type' keyword)
import type { Workflow, WorkflowNode } from '@taktak/types';

// 5. Styles
import './styles.css';
```

### Error Handling

#### Always Handle Errors Explicitly
```typescript
// ✅ Good - explicit error handling
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error('Operation failed', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  throw new OperationError('Failed to complete operation', { cause: error });
}

// ❌ Bad - silent failures
try {
  await riskyOperation();
} catch (error) {
  // Silent failure
}
```

#### Use Custom Error Classes
```typescript
// ✅ Good - custom error classes
export class WorkflowExecutionError extends Error {
  constructor(
    message: string,
    public workflowId: string,
    public nodeId?: string
  ) {
    super(message);
    this.name = 'WorkflowExecutionError';
  }
}
```

### Comments & Documentation

#### Use JSDoc for Public APIs
```typescript
/**
 * Executes a workflow with the given input
 * @param workflowId - The unique identifier of the workflow
 * @param input - Input data for the workflow execution
 * @returns Promise resolving to the execution result
 * @throws {WorkflowNotFoundError} If workflow doesn't exist
 * @throws {WorkflowExecutionError} If execution fails
 */
async function executeWorkflow(
  workflowId: string,
  input?: Record<string, unknown>
): Promise<WorkflowExecution> {
  // implementation
}
```

#### Comment Complex Logic
```typescript
// ✅ Good - explain WHY, not WHAT
// Use exponential backoff to avoid overwhelming the API
// during high-traffic periods
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
```

---

## Project Structure

```
taktak/
├── apps/
│   ├── client/              # React frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components (PascalCase.tsx)
│   │   │   ├── pages/       # Route pages (PascalCase.tsx)
│   │   │   ├── hooks/       # Custom React hooks (useCamelCase.ts)
│   │   │   ├── services/    # API clients (camelCase.ts)
│   │   │   ├── utils/       # Helper functions (camelCase.ts)
│   │   │   ├── types/       # TypeScript types (camelCase.ts)
│   │   │   └── constants/   # App constants (SCREAMING_SNAKE.ts)
│   │   └── package.json
│   └── server/              # Express backend
│       ├── src/
│       │   ├── routes/      # Express routes (camelCase.ts)
│       │   ├── services/    # Business logic (camelCase.ts)
│       │   ├── middleware/  # Express middleware (camelCase.ts)
│       │   ├── engine/      # Workflow engine (camelCase.ts)
│       │   ├── utils/       # Helper functions (camelCase.ts)
│       │   └── types/       # TypeScript types (camelCase.ts)
│       └── package.json
├── packages/
│   └── types/               # Shared TypeScript definitions
├── .github/
│   └── workflows/           # CI/CD pipelines
├── docker-compose.yml
├── CONTRIBUTING.md
└── README.md
```

---

## Development Workflow

### Branch Naming

```
feature/add-local-llm-support
fix/workflow-execution-error
refactor/cleanup-unused-code
docs/update-api-documentation
```

### Before Committing

```bash
# 1. Lint your code
npm run lint:fix

# 2. Format code
npm run format

# 3. Type check
npm run type-check

# 4. Run tests
npm test

# 5. Build to ensure no errors
npm run build
```

---

## Testing

### Test File Naming
```
workflowService.test.ts
workflowEngine.test.ts
encryption.test.ts
```

### Test Structure
```typescript
describe('WorkflowService', () => {
  describe('createWorkflow', () => {
    it('should create a workflow with valid data', async () => {
      // Arrange
      const workflowData = { name: 'Test', nodes: [] };
      
      // Act
      const result = await workflowService.create(workflowData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Test');
    });

    it('should throw error with invalid data', async () => {
      // Arrange
      const invalidData = { name: '' };
      
      // Act & Assert
      await expect(workflowService.create(invalidData))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples
```bash
feat(workflow): add local LLM fallback support

Integrate llama.cpp for offline AI workflow generation.
Falls back to Phi-3 when Gemini API is unavailable.

Closes #123
```

```bash
fix(auth): resolve token expiration issue

Users were being logged out prematurely due to incorrect
token expiration calculation.
```

```bash
refactor: remove unused dependencies and clean up code

- Remove zustand (unused)
- Fix hardcoded API URLs
- Implement missing TODO items
- Standardize file naming
```

---

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the coding standards
3. **Write/update tests** for your changes
4. **Update documentation** if needed
5. **Run all checks** (lint, type-check, test, build)
6. **Create a PR** with a clear description
7. **Address review feedback**
8. **Squash commits** before merging (if requested)

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

---

## Questions?

If you have questions, please:
1. Check existing documentation
2. Search closed issues
3. Open a new issue with the `question` label

---

**Thank you for contributing to Taktak!** 🚀

