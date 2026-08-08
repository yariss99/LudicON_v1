import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    // Must come before react() — the plugin rewrites route modules that the
    // React plugin then transforms.
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: "es2023",
    sourcemap: true,
    rollupOptions: {
      output: {
        /**
         * Keep the heavy, rarely-changing libraries in their own chunks so a
         * product change doesn't invalidate them in users' caches.
         *
         * Must be a function on Vite 8 / rolldown — the object form used by
         * Rollup is no longer accepted and fails the build at output time.
         */
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id))
            return "react";
          if (id.includes("node_modules/@tanstack/")) return "tanstack";
          return undefined;
        },
      },
    },
  },
});
