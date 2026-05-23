import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

export default defineConfig({
  root: currentDir,
  plugins: [react()],
  build: {
    outDir: path.join(currentDir, "dist"),
    emptyOutDir: true
  }
});
