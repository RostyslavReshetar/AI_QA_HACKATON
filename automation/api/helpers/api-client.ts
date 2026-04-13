import { APIRequestContext } from '@playwright/test';
import { authHeaders } from './auth';

export interface PartCategory {
  id?: number;
  name: string;
  description?: string;
  parent?: number | null;
}

export interface Part {
  id?: number;
  name: string;
  description?: string;
  category: number;
  active?: boolean;
  assembly?: boolean;
  component?: boolean;
  purchaseable?: boolean;
  salable?: boolean;
  trackable?: boolean;
  virtual?: boolean;
  minimum_stock?: number;
  units?: string;
  keywords?: string;
  notes?: string;
  link?: string;
  revision?: string;
  variant_of?: number | null;
  revision_of?: number | null;
  is_template?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export class ApiClient {
  constructor(
    private readonly ctx: APIRequestContext,
    private readonly token: string,
    private readonly baseUrl: string,
  ) {}

  private headers() {
    return authHeaders(this.token);
  }

  // ── Categories ──────────────────────────────────────────────────────────

  async createCategory(data: PartCategory) {
    return this.ctx.post(`${this.baseUrl}/api/part/category/`, {
      headers: this.headers(),
      data,
    });
  }

  async getCategory(id: number) {
    return this.ctx.get(`${this.baseUrl}/api/part/category/${id}/`, {
      headers: this.headers(),
    });
  }

  async listCategories(params?: Record<string, string | number | boolean>) {
    return this.ctx.get(`${this.baseUrl}/api/part/category/`, {
      headers: this.headers(),
      params,
    });
  }

  async deleteCategory(id: number) {
    return this.ctx.delete(`${this.baseUrl}/api/part/category/${id}/`, {
      headers: this.headers(),
    });
  }

  // ── Parts ────────────────────────────────────────────────────────────────

  async createPart(data: Part) {
    return this.ctx.post(`${this.baseUrl}/api/part/`, {
      headers: this.headers(),
      data,
    });
  }

  async getPart(id: number) {
    return this.ctx.get(`${this.baseUrl}/api/part/${id}/`, {
      headers: this.headers(),
    });
  }

  async listParts(params?: Record<string, string | number | boolean>) {
    return this.ctx.get(`${this.baseUrl}/api/part/`, {
      headers: this.headers(),
      params,
    });
  }

  async updatePart(id: number, data: Partial<Part>) {
    return this.ctx.patch(`${this.baseUrl}/api/part/${id}/`, {
      headers: this.headers(),
      data,
    });
  }

  async replacePart(id: number, data: Part) {
    return this.ctx.put(`${this.baseUrl}/api/part/${id}/`, {
      headers: this.headers(),
      data,
    });
  }

  async deletePart(id: number) {
    // Parts must be inactive before deletion
    await this.ctx.patch(`${this.baseUrl}/api/part/${id}/`, {
      headers: this.headers(),
      data: { active: false },
    });
    return this.ctx.delete(`${this.baseUrl}/api/part/${id}/`, {
      headers: this.headers(),
    });
  }

  // ── Raw (for auth/error tests) ────────────────────────────────────────

  async rawGet(path: string, headers: Record<string, string>, params?: Record<string, string>) {
    return this.ctx.get(`${this.baseUrl}${path}`, { headers, params });
  }

  async rawPost(path: string, headers: Record<string, string>, data: unknown) {
    return this.ctx.post(`${this.baseUrl}${path}`, { headers, data });
  }
}