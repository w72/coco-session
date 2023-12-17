import { Store } from "./types";

export function getSimpleStore(): Store {
  const data: Record<string, string> = {};
  return {
    get: async (k) => data[k],
    set: async (k, v) => {
      data[k] = v;
    },
    del: async (k) => {
      delete data[k];
    },
  };
}
