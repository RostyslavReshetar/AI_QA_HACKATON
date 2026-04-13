import { APIRequestContext } from '@playwright/test';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PartData {
  name: string;
  description: string;
  category: number;
  IPN: string | null;
  active: boolean;
  assembly: boolean;
  component: boolean;
  is_template: boolean;
  purchaseable: boolean;
  salable: boolean;
  trackable: boolean;
  testable: boolean;
  virtual: boolean;
  keywords: string | null;
  link: string | null;
  minimum_stock: number;
  default_expiry: number;
  units: string;
  variant_of: number | null;
  revision: string;
  locked: boolean;
}

export interface CategoryDetail {
  pk: number;
  name: string;
  description: string;
  default_location: number | null;
  default_keywords: string | null;
  level: number;
  parent: number | null;
  part_count: number | null;
  subcategories: number | null;
  pathstring: string;
  starred: boolean;
  structural: boolean;
  icon: string;
  parent_default_location: number | null;
}

export interface PartResponse {
  pk: number;
  name: string;
  description: string;
  category: number;
  category_detail: CategoryDetail;
  category_name: string;
  category_path: Array<{ pk: number; name: string; icon: string }>;
  IPN: string;
  active: boolean;
  assembly: boolean;
  component: boolean;
  is_template: boolean;
  purchaseable: boolean;
  salable: boolean;
  trackable: boolean;
  testable: boolean;
  virtual: boolean;
  keywords: string | null;
  link: string | null;
  minimum_stock: number;
  default_expiry: number;
  units: string;
  variant_of: number | null;
  revision: string;
  revision_of: number | null;
  revision_count: number | null;
  locked: boolean;
  barcode_hash: string;
  creation_date: string;
  creation_user: number;
  default_location: number | null;
  default_location_detail: object | null;
  full_name: string;
  image: string | null;
  thumbnail: string;
  parameters: any[];
  starred: boolean;
  pricing_min: string | null;
  pricing_max: string | null;
  pricing_updated: string | null;
  responsible: number | null;
  in_stock: number | null;
  total_in_stock: number | null;
  external_stock: number | null;
  unallocated_stock: number | null;
  variant_stock: number | null;
  building: number | null;
  ordering: number | null;
  stock_item_count: number | null;
  allocated_to_build_orders: number | null;
  allocated_to_sales_orders: number | null;
  required_for_build_orders: number | null;
  required_for_sales_orders: number | null;
  scheduled_to_build: number | null;
  category_default_location: number | null;
  tags: string[];
  price_breaks: any[];
}

export interface CategoryData {
  name: string;
  description: string;
  parent: number | null;
  default_location: number | null;
  default_keywords: string | null;
  structural: boolean;
  icon: string;
}

export interface CategoryResponse {
  pk: number;
  name: string;
  description: string;
  default_location: number | null;
  default_keywords: string | null;
  level: number;
  parent: number | null;
  part_count: number;
  subcategories: number;
  pathstring: string;
  starred: boolean;
  structural: boolean;
  icon: string;
  parent_default_location: number | null;
}

export interface ListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  status: number;
  body: any;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export class ApiClient {
  constructor(private readonly ctx: APIRequestContext) {}

  // ── Parts ────────────────────────────────────────────────────────────────

  async createPart(data: Partial<PartData>): Promise<PartResponse> {
    const response = await this.ctx.post('/api/part/', { data });
    if (!response.ok()) {
      const body = await response.json().catch(() => response.statusText());
      const err: ApiError = { status: response.status(), body };
      throw err;
    }
    return response.json();
  }

  async getPart(id: number): Promise<PartResponse> {
    const response = await this.ctx.get(`/api/part/${id}/`);
    if (!response.ok()) {
      const body = await response.json().catch(() => response.statusText());
      const err: ApiError = { status: response.status(), body };
      throw err;
    }
    return response.json();
  }

  async listParts(filters?: Record<string, string | number | boolean>): Promise<ListResponse<PartResponse>> {
    const params = filters
      ? Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, String(v)]))
      : undefined;
    const response = await this.ctx.get('/api/part/', { params });
    if (!response.ok()) {
      const body = await response.json().catch(() => response.statusText());
      const err: ApiError = { status: response.status(), body };
      throw err;
    }
    return response.json();
  }

  async updatePart(id: number, data: Partial<PartData>, method: 'PATCH' | 'PUT' = 'PATCH'): Promise<PartResponse> {
    const response = method === 'PUT'
      ? await this.ctx.put(`/api/part/${id}/`, { data })
      : await this.ctx.patch(`/api/part/${id}/`, { data });
    if (!response.ok()) {
      const body = await response.json().catch(() => response.statusText());
      const err: ApiError = { status: response.status(), body };
      throw err;
    }
    return response.json();
  }

  async deletePart(id: number): Promise<number> {
    // InvenTree requires parts to be inactive before deletion
    await this.ctx.patch(`/api/part/${id}/`, { data: { active: false } }).catch(() => {});
    const response = await this.ctx.delete(`/api/part/${id}/`);
    if (!response.ok() && response.status() !== 204) {
      const body = await response.json().catch(() => response.statusText());
      const err: ApiError = { status: response.status(), body };
      throw err;
    }
    return response.status();
  }

  // ── Raw request helpers (for testing error scenarios) ────────────────────

  async rawPost(path: string, data: any): Promise<{ status: number; body: any }> {
    const response = await this.ctx.post(path, { data });
    const body = await response.json().catch(() => null);
    return { status: response.status(), body };
  }

  async rawPatch(path: string, data: any): Promise<{ status: number; body: any }> {
    const response = await this.ctx.patch(path, { data });
    const body = await response.json().catch(() => null);
    return { status: response.status(), body };
  }

  async rawGet(path: string): Promise<{ status: number; body: any }> {
    const response = await this.ctx.get(path);
    const body = await response.json().catch(() => null);
    return { status: response.status(), body };
  }

  async rawDelete(path: string): Promise<{ status: number; body: any }> {
    const response = await this.ctx.delete(path);
    const body = await response.json().catch(() => null);
    return { status: response.status(), body };
  }

  // ── Categories ───────────────────────────────────────────────────────────

  async createCategory(data: Partial<CategoryData>): Promise<CategoryResponse> {
    const response = await this.ctx.post('/api/part/category/', { data });
    if (!response.ok()) {
      const body = await response.json().catch(() => response.statusText());
      const err: ApiError = { status: response.status(), body };
      throw err;
    }
    return response.json();
  }

  async getCategory(id: number): Promise<CategoryResponse> {
    const response = await this.ctx.get(`/api/part/category/${id}/`);
    if (!response.ok()) {
      const body = await response.json().catch(() => response.statusText());
      const err: ApiError = { status: response.status(), body };
      throw err;
    }
    return response.json();
  }

  async listCategories(filters?: Record<string, string | number | boolean>): Promise<CategoryResponse[]> {
    const params = filters
      ? Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, String(v)]))
      : undefined;
    const response = await this.ctx.get('/api/part/category/', { params });
    if (!response.ok()) {
      const body = await response.json().catch(() => response.statusText());
      const err: ApiError = { status: response.status(), body };
      throw err;
    }
    return response.json();
  }

  async deleteCategory(id: number): Promise<number> {
    const response = await this.ctx.delete(`/api/part/category/${id}/`);
    if (!response.ok() && response.status() !== 204) {
      const body = await response.json().catch(() => response.statusText());
      const err: ApiError = { status: response.status(), body };
      throw err;
    }
    return response.status();
  }

  async getCategoryTree(): Promise<any> {
    const response = await this.ctx.get('/api/part/category/', {
      params: { depth: '0' },
    });
    if (!response.ok()) {
      const body = await response.json().catch(() => response.statusText());
      const err: ApiError = { status: response.status(), body };
      throw err;
    }
    return response.json();
  }
}
