export interface BaseEntity {
  id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Team extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface System extends BaseEntity {
  name: string;
  description?: string;
}

export interface Client extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface Status extends BaseEntity {
  name: string;
  color?: string;
}

export type EntityType = 'teams' | 'systems' | 'clients' | 'statuses';
