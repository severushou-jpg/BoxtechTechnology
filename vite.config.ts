import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  esbuild: command === "build" ? { drop: ["console", "debugger"] } : undefined,
  build: {
    target: "es2022",
    sourcemap: false,
  },
}));
