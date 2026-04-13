import { ApiClient } from './api-client.js';
import type { PartData, CategoryData } from './api-client.js';

// ─── Cleanup Registry ────────────────────────────────────────────────────────

type CleanupEntry = { type: 'part' | 'category'; id: number };

const cleanupRegistry: CleanupEntry[] = [];

export function registerForCleanup(type: 'part' | 'category', id: number): void {
  cleanupRegistry.push({ type, id });
}

/**
 * Cleans up all registered resources in reverse order (LIFO).
 * Parts are deleted before categories to avoid FK conflicts.
 */
export async function cleanupAll(client: ApiClient): Promise<void> {
  // Sort: parts first, then categories
  const parts = cleanupRegistry.filter((e) => e.type === 'part').reverse();
  const categories = cleanupRegistry.filter((e) => e.type === 'category').reverse();

  for (const entry of parts) {
    try {
      await client.deletePart(entry.id);
    } catch {
      // already deleted or doesn't exist — ignore
    }
  }

  for (const entry of categories) {
    try {
      await client.deleteCategory(entry.id);
    } catch {
      // already deleted or doesn't exist — ignore
    }
  }

  // Clear the registry
  cleanupRegistry.length = 0;
}

// ─── Data Generators ─────────────────────────────────────────────────────────

let counter = 0;

function uniqueSuffix(): string {
  counter++;
  return `${Date.now()}_${counter}`;
}

/**
 * Generates part data with unique name. Merge overrides on top.
 */
export function generatePartData(overrides?: Partial<PartData>): Partial<PartData> {
  const suffix = uniqueSuffix();
  return {
    name: `TestPart_${suffix}`,
    description: `Auto-generated test part ${suffix}`,
    category: 1, // Electronics — always exists
    active: true,
    component: true,
    purchaseable: true,
    ...overrides,
  };
}

/**
 * Generates category data with unique name. Merge overrides on top.
 */
export function generateCategoryData(overrides?: Partial<CategoryData>): Partial<CategoryData> {
  const suffix = uniqueSuffix();
  return {
    name: `TestCategory_${suffix}`,
    description: `Auto-generated test category ${suffix}`,
    parent: null,
    structural: false,
    ...overrides,
  };
}
