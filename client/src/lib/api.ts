const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const TOKEN_STORAGE_KEY = 'atelia_access_token';

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type GeneratedContentType = 'LANDING_PAGE' | 'EMAIL' | 'SOCIAL_POST' | 'OFFER';

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Brief {
  id: string;
  projectId: string;
  targetAudience: string;
  brandTone: string | null;
  marketContext: string | null;
  launchGoal: string | null;
  keyMessage: string | null;
  offerDescription: string | null;
  competitors: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedContent {
  id: string;
  productId: string;
  type: GeneratedContentType;
  title: string | null;
  content: string;
  promptUsed: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedVisual {
  id: string;
  productId: string;
  imageUrl: string;
  style: string;
  promptUsed: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  price: string | null;
  targetSegment: string | null;
  uniqueValueProposition: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  generatedContents?: GeneratedContent[];
  generatedVisuals?: GeneratedVisual[];
  _count?: {
    generatedContents: number;
    generatedVisuals: number;
  };
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  brief: Brief | null;
  products: Product[];
  _count?: {
    products: number;
  };
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const tokenStorage = {
  get() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  set(token: string) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => ({}))) as ApiErrorBody | T;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorBody;
    throw new ApiError(
      response.status,
      errorPayload.error?.message || 'Unexpected API error',
      errorPayload.error?.code,
      errorPayload.error?.details,
    );
  }

  return payload as T;
}

export const authApi = {
  async register(input: { name: string; email: string; password: string }) {
    return request<{ user: ApiUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async login(input: { email: string; password: string }) {
    return request<{ user: ApiUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async me() {
    return request<{ user: ApiUser }>('/auth/me');
  },
};

export const projectsApi = {
  async list() {
    return request<{ projects: Project[] }>('/projects');
  },
  async get(projectId: string) {
    return request<{ project: Project }>(`/projects/${projectId}`);
  },
  async create(input: {
    name: string;
    description?: string;
    status?: ProjectStatus;
    brief?: Partial<Brief> & { targetAudience: string };
  }) {
    return request<{ project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async update(projectId: string, input: {
    name?: string;
    description?: string | null;
    status?: ProjectStatus;
    brief?: Partial<Pick<Brief, 'targetAudience' | 'brandTone' | 'marketContext' | 'launchGoal' | 'keyMessage' | 'offerDescription' | 'competitors'>>;
  }) {
    return request<{ project: Project }>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  async delete(projectId: string) {
    return request<void>(`/projects/${projectId}`, { method: 'DELETE' });
  },
};

export const productsApi = {
  async get(productId: string) {
    return request<{ product: Product }>(`/products/${productId}`);
  },
  async create(input: {
    projectId: string;
    name: string;
    description?: string;
    price?: string;
    targetSegment?: string;
    uniqueValueProposition?: string;
    status?: ProductStatus;
  }) {
    return request<{ product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async update(productId: string, input: Partial<Pick<Product, 'name' | 'description' | 'price' | 'targetSegment' | 'uniqueValueProposition' | 'status'>>) {
    return request<{ product: Product }>(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  async delete(productId: string) {
    return request<void>(`/products/${productId}`, { method: 'DELETE' });
  },
};

export const generatedContentsApi = {
  async list(productId: string, type?: GeneratedContentType) {
    const params = new URLSearchParams({ productId });
    if (type) params.set('type', type);
    return request<{ generatedContents: GeneratedContent[] }>(`/generated-contents?${params.toString()}`);
  },
  async create(input: {
    productId: string;
    type: GeneratedContentType;
    title?: string;
    content: string;
    promptUsed?: string;
  }) {
    return request<{ generatedContent: GeneratedContent }>('/generated-contents', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

export const generatedVisualsApi = {
  async list(productId: string) {
    return request<{ generatedVisuals: GeneratedVisual[] }>(`/generated-visuals?${new URLSearchParams({ productId }).toString()}`);
  },
  async create(input: {
    productId: string;
    imageUrl: string;
    style: string;
    promptUsed: string;
  }) {
    return request<{ generatedVisual: GeneratedVisual }>('/generated-visuals', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

export function toProjectStatus(status: string): ProjectStatus {
  return status.toUpperCase() as ProjectStatus;
}

export function toProductStatus(status: string): ProductStatus {
  return status.toUpperCase() as ProductStatus;
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export { API_BASE_URL };
