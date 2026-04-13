import { ApiClient, Part, PartCategory } from './api-client';

export type CleanupEntry =
  | { type: 'part'; id: number }
  | { type: 'category'; id: number };

/**
 * Central factory for creating test data with automatic cleanup tracking.
 * Cleanup happens in LIFO order to respect referential integrity.
 */
export class TestDataFactory {
  private registry: CleanupEntry[] = [];

  constructor(private readonly client: ApiClient) {}

  uniqueName(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  async createCategory(overrides: Partial<PartCategory> = {}): Promise<PartCategory & { id: number }> {
    const data: PartCategory = {
      name: this.uniqueName('cat'),
      description: 'Test category',
      ...overrides,
    };
    const res = await this.client.createCategory(data);
    if (!res.ok()) {
      throw new Error(`createCategory failed: ${res.status()} ${await res.text()}`);
    }
    const body = await res.json();
    this.registry.push({ type: 'category', id: body.id });
    return body;
  }

  async createPart(
    categoryId: number,
    overrides: Partial<Part> = {},
  ): Promise<Part & { id: number }> {
    const data: Part = {
      name: this.uniqueName('part'),
      description: 'Test part',
      category: categoryId,
      active: true,
      ...overrides,
    };
    const res = await this.client.createPart(data);
    if (!res.ok()) {
      throw new Error(`createPart failed: ${res.status()} ${await res.text()}`);
    }
    const body = await res.json();
    this.registry.push({ type: 'part', id: body.id });
    return body;
  }

  /**
   * Delete all created resources in reverse order (LIFO).
   * Ignores 404s (already deleted) and logs other failures.
   */
  async cleanup(): Promise<void> {
    const toDelete = [...this.registry].reverse();
    this.registry = [];

    for (const entry of toDelete) {
      try {
        if (entry.type === 'part') {
          const res = await this.client.deletePart(entry.id);
          if (!res.ok() && res.status() !== 404) {
            console.warn(`Failed to delete part ${entry.id}: ${res.status()}`);
          }
        } else {
          const res = await this.client.deleteCategory(entry.id);
          if (!res.ok() && res.status() !== 404) {
            console.warn(`Failed to delete category ${entry.id}: ${res.status()}`);
          }
        }
      } catch (e) {
        console.warn(`Cleanup error for ${entry.type} ${entry.id}:`, e);
      }
    }
  }
}