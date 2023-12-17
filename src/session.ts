import { randomUUID } from "node:crypto";

import { getSimpleStore } from "./utils";

import type { Middleware } from "@w72/coco";
import type { Params, Session } from "./types";

declare module "@w72/coco" {
  interface Context {
    session: Record<string, unknown>;
  }
}

export function session(params?: Params): Middleware {
  const {
    store = getSimpleStore(),
    maxAge = 30 * 24 * 60 * 60,
    cookieName = "coco_session_id",
  } = params ?? {};

  return async (ctx, next) => {
    const sessionID = ctx.cookies[cookieName];

    let sessionData: Record<string, unknown> = {};
    let needRenew: boolean = false;

    if (sessionID) {
      const sessionStr = await store.get(sessionID);
      if (sessionStr) {
        const sessionVal: Session = JSON.parse(sessionStr);
        const restTime = sessionVal.expires - Date.now();
        if (restTime > 0) {
          sessionData = sessionVal.data;
          if (restTime < (sessionVal.maxAge * 1000) / 3) {
            needRenew = true;
          }
        }
      }
    }

    ctx.session = sessionData;
    const prevSessionData = Object.assign({}, sessionData);

    await next();

    const nextSessionData = ctx.session;

    const needClear = sessionID && !Object.keys(nextSessionData).length;

    if (needClear) {
      ctx.setCookie(cookieName, "", { maxAge: 0 });
      await store.del(sessionID);
      return;
    }

    const isSessionChanged =
      Object.keys(prevSessionData).length !==
        Object.keys(nextSessionData).length ||
      Object.entries(prevSessionData).some(
        ([k, v]) => v !== nextSessionData![k]
      );

    if (isSessionChanged || needRenew) {
      const nextSessionID = randomUUID();
      ctx.setCookie(cookieName, nextSessionID, { maxAge });

      if (isSessionChanged) {
        const nextSessionStr = JSON.stringify({
          maxAge,
          expires: Date.now() + maxAge * 1000,
          data: nextSessionData,
        });
        await store.set(nextSessionID, nextSessionStr);
      }
    }
  };
}
