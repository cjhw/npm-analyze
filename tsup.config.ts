import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/node/cli.ts"],
  bundle: true,
  splitting: true,
  minify: process.env.NODE_ENV === "production",
  outDir: "dist",
  format: ["cjs", "esm"],
  dts: true,
  // 打入pollyfill
  shims: true,
  clean: true,
});
