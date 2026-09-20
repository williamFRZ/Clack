import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  build: { outDir: "../painel", emptyOutDir: true },
  server: { proxy: { "/api.php": "http://127.0.0.1:8080" } },
});
