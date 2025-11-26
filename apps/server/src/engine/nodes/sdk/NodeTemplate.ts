/**
 * Node Template Generator
 * Helps developers create new nodes quickly
 */

export interface NodeTemplateConfig {
  name: string;
  type: string;
  description: string;
  category: 'trigger' | 'action' | 'transform' | 'output';
  configFields: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required: boolean;
    description: string;
    default?: unknown;
  }>;
}

/**
 * Generate a node handler template
 */
export function generateNodeTemplate(config: NodeTemplateConfig): string {
  const className = toPascalCase(config.name) + 'NodeHandler';
  const configInterface = toPascalCase(config.name) + 'Config';

  return `/**
 * ${config.description}
 * Category: ${config.category}
 */

import { BaseNodeHandler, NodeContext } from '../sdk/NodeSDK';
import { WorkflowNode } from '@taktak/types';
import { ValidationError } from '../../../utils/errors';

/**
 * Configuration interface for ${config.name} node
 */
export interface ${configInterface} {
${config.configFields.map(field => `  ${field.name}${field.required ? '' : '?'}: ${field.type};  // ${field.description}`).join('\n')}
}

/**
 * ${config.name} node handler
 */
export class ${className} extends BaseNodeHandler {
  /**
   * Validate node configuration
   */
  validate(node: WorkflowNode): void {
    super.validate(node);
    
    const config = node.config as unknown as ${configInterface};
    
    // Validate required fields
    const requiredFields = [${config.configFields.filter(f => f.required).map(f => `'${f.name}'`).join(', ')}];
    this.validateRequired(config, requiredFields);
    
    // Add custom validation here
  }

  /**
   * Execute the node
   */
  async execute(node: WorkflowNode, context: NodeContext): Promise<unknown> {
    this.validate(node);
    
    const config = node.config as unknown as ${configInterface};
    
    this.log('info', \`Executing ${config.name} node: \${node.name}\`, node.id);
    
    try {
      // TODO: Implement node logic here
      
      const result = {
        success: true,
        message: '${config.name} executed successfully',
        // Add your result data here
      };
      
      this.log('info', \`${config.name} node completed: \${node.name}\`, node.id);
      
      return result;
    } catch (error) {
      this.log('error', \`${config.name} node failed: \${this.formatError(error)}\`, node.id);
      throw error;
    }
  }
}
`;
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Generate node type definition
 */
export function generateNodeTypeDefinition(config: NodeTemplateConfig): string {
  const typeName = config.type.toUpperCase();
  
  return `// Add to packages/types/src/index.ts NodeType enum:
${typeName} = '${config.type}',

// Add to packages/types/src/index.ts:
export interface ${toPascalCase(config.name)}Config {
${config.configFields.map(field => `  ${field.name}${field.required ? '' : '?'}: ${field.type};  // ${field.description}`).join('\n')}
}
`;
}

/**
 * Generate node registration code
 */
export function generateNodeRegistration(config: NodeTemplateConfig): string {
  const className = toPascalCase(config.name) + 'NodeHandler';
  const typeName = config.type.toUpperCase();
  
  return `// Add to apps/server/src/engine/nodeExecutor.ts:

import { ${className} } from './nodes/${config.type}Node';

// In constructor:
this.handlers.set(NodeType.${typeName}, new ${className}());
`;
}

/**
 * Generate complete node package
 */
export function generateCompleteNodePackage(config: NodeTemplateConfig): {
  handler: string;
  types: string;
  registration: string;
  test: string;
} {
  return {
    handler: generateNodeTemplate(config),
    types: generateNodeTypeDefinition(config),
    registration: generateNodeRegistration(config),
    test: generateNodeTest(config),
  };
}

/**
 * Generate node test template
 */
function generateNodeTest(config: NodeTemplateConfig): string {
  const className = toPascalCase(config.name) + 'NodeHandler';
  const configInterface = toPascalCase(config.name) + 'Config';

  return `/**
 * Tests for ${config.name} node
 */

import { ${className} } from './${config.type}Node';
import { NodeType, ${configInterface} } from '@taktak/types';

describe('${className}', () => {
  let handler: ${className};

  beforeEach(() => {
    handler = new ${className}();
  });

  describe('execute', () => {
    it('should execute successfully with valid config', async () => {
      const node = {
        id: 'test-node',
        type: NodeType.${config.type.toUpperCase()},
        name: 'Test ${config.name}',
        config: {
${config.configFields.filter(f => f.required).map(f => `          ${f.name}: ${getDefaultValue(f.type)},`).join('\n')}
        },
      };

      const context = {
        input: {},
        variables: {},
      };

      const result = await handler.execute(node, context);

      expect(result).toBeDefined();
      // Add more assertions here
    });

    it('should throw error for missing required fields', async () => {
      const node = {
        id: 'test-node',
        type: NodeType.${config.type.toUpperCase()},
        name: 'Test ${config.name}',
        config: {},
      };

      const context = {
        input: {},
        variables: {},
      };

      await expect(handler.execute(node, context)).rejects.toThrow();
    });
  });
});
`;
}

function getDefaultValue(type: string): string {
  switch (type) {
    case 'string': return "'test'";
    case 'number': return '123';
    case 'boolean': return 'true';
    case 'array': return '[]';
    case 'object': return '{}';
    default: return 'null';
  }
}

