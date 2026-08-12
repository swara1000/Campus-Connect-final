import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },

    router: {
      generatedRouteTree: "src/routeTree.gen.js",
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