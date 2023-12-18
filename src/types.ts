export interface Session {
  [k: string]: unknown;
}

export interface SessionStoreItem {
  data: Session;
  expires: number;
}

export interface SessionStore {
  get: (
    id: string
  ) => SessionStoreItem | undefined | Promise<SessionStoreItem | undefined>;
  set: (id: string, item: SessionStoreItem) => void | Promise<void>;
  del: (id: string) => void | Promise<void>;
}

export interface Params {
  store?: SessionStore;
  renew?: number;
  maxAge?: number;
  cookieName?: string;
}
