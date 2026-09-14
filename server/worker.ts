import { createApp } from "./app.ts";
import type { Bindings } from "./app.ts";
import { originalResponse } from "./original.ts";
const app = createApp();
export default {
  async fetch(request: Request, env: Bindings, executionCtx: ExecutionContext) {
    if (!new URL(request.url).pathname.startsWith("/api/") && env.ASSETS) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return originalResponse(asset, new URL(request.url).pathname, env.DB);
    }
    return app.fetch(request, env, executionCtx);
  },
};
