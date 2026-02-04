import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/advanced-features.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false, // Set to true for production
  treeshake: true,
  external: ["@prisma/client", "zod"],
  outDir: "dist",
  target: "es2020",
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".js" : ".mjs",
    };
  },
  tsconfig: "./tsconfig.json",
});
