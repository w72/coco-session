import { randomUUID } from "node:crypto";

import { getLRUCacheStore } from "./utils";
import {
  DEFAULT_COOKIE_NAME,
  DEFAULT_MAX_AGE,
  DEFAULT_RENEW,
} from "./constants";

import type { Middleware } from "@w72/coco";
import type { Params } from "./types";

declare module "@w72/coco" {
  interface Context {
    session: Record<string, unknown>;
  }
}

export function session(params: Params = {}): Middleware {
  const {
    store = getLRUCacheStore(),
    renew = DEFAULT_RENEW,
    maxAge = DEFAULT_MAX_AGE,
    cookieName = DEFAULT_COOKIE_NAME,
  } = params;

  const maxAgeMs = maxAge * 1000;

  return async (ctx, next) => {
    let sessionData: Record<string, unknown> = {};
    let needRenew: boolean = false;
    let isExpired: boolean = false;
    let isSessionExist: boolean = false;

    const sessionID = ctx.cookies[cookieName];

    if (sessionID) {
      const sessionItem = await store.get(sessionID);
      if (sessionItem) {
        isSessionExist = true;
        const restTime = sessionItem.expires - Date.now();
        if (restTime > 0) {
          sessionData = sessionItem.data;
          if (restTime < maxAgeMs * renew) {
            needRenew = true;
          }
        } else {
          isExpired = true;
        }
      }
    }

    ctx.session = { ...sessionData };

    await next();

    const nextSessionData = ctx.session;
    const isNextSessionDataEmpty = !Object.keys(nextSessionData).length;

    if (sessionID && isNextSessionDataEmpty) {
      ctx.setCookie(cookieName, "", { maxAge: 0 });

      if (isSessionExist) await store.del(sessionID);

      return;
    }

    const isSessionChanged =
      Object.keys(sessionData).length !== Object.keys(nextSessionData).length ||
      Object.entries(sessionData).some(([k, v]) => v !== nextSessionData[k]);

    if (isSessionChanged || needRenew) {
      const nextSessionID = randomUUID();

      ctx.setCookie(cookieName, nextSessionID, { maxAge });

      await store.set(nextSessionID, {
        data: nextSessionData,
        expires: Date.now() + maxAgeMs,
      });
    }

    if (sessionID && (isSessionChanged || needRenew || isExpired)) {
      await store.del(sessionID);
    }
  };
}
