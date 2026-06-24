/**
 * json.ts — full-project JSON export/import for reload & version control.
 */
import type { Project } from '../types';
import { SCHEMA_VERSION } from '../types';

export function projectToJson(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export function parseProjectJson(text: string): Project {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.spaces)) {
    throw new Error('Not a valid project file (missing spaces array).');
  }
  if (typeof parsed.schemaVersion !== 'number') parsed.schemaVersion = SCHEMA_VERSION;
  return parsed as Project;
}
