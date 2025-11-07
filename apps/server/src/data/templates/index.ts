/**
 * Workflow Templates Index
 * Exports all workflow templates
 */

import { WorkflowTemplate, TemplateCategory } from '@taktak/types';
import { clinicTemplates } from './clinic';
import { storeTemplates } from './store';
import { cooperativeTemplates } from './cooperative';

// Combine all templates
export const allTemplates: WorkflowTemplate[] = [
  ...clinicTemplates,
  ...storeTemplates,
  ...cooperativeTemplates,
];

/**
 * Get all templates
 */
export function getAllTemplates(): WorkflowTemplate[] {
  return allTemplates;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): WorkflowTemplate[] {
  return allTemplates.filter(template => template.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return allTemplates.find(template => template.id === id);
}

/**
 * Search templates by tags
 */
export function searchTemplatesByTags(tags: string[]): WorkflowTemplate[] {
  return allTemplates.filter(template =>
    tags.some(tag => template.tags.includes(tag.toLowerCase()))
  );
}

/**
 * Get templates by difficulty
 */
export function getTemplatesByDifficulty(difficulty: string): WorkflowTemplate[] {
  return allTemplates.filter(template => template.difficulty === difficulty);
}

/**
 * Search templates by keyword
 */
export function searchTemplates(keyword: string): WorkflowTemplate[] {
  const lowerKeyword = keyword.toLowerCase();
  return allTemplates.filter(template =>
    template.name.toLowerCase().includes(lowerKeyword) ||
    template.description.toLowerCase().includes(lowerKeyword) ||
    template.tags.some(tag => tag.includes(lowerKeyword))
  );
}

// Export individual template collections
export { clinicTemplates, storeTemplates, cooperativeTemplates };

