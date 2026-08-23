import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },

    router: {
      generatedRouteTree: "routeTree.gen.ts",
      quoteStyle: "single",
    },
  },

  vite: {
    server: {
      headers: {
        "Cross-Origin-Opener-Policy":
          "same-origin-allow-popups",
      },
    },
  },
});