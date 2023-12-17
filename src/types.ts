export interface Session {
  maxAge: number;
  expires: number;
  data: Record<string, unknown>;
}

export interface Store {
  get: (id: string) => Promise<string>;
  set: (id: string, value: string) => Promise<void>;
  del: (id: string) => Promise<void>;
}

export interface Params {
  store?: Store;
  maxAge?: number;
  cookieName?: string;
}
