import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.REPO_NAME || "/",
});
