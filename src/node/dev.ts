import { createServer as createViteDevServer } from "vite";
import { pluginIndexHtml } from "./plugins/indexHtml";
import vue from "@vitejs/plugin-vue";
import { PACKAGE_ROOT } from "./constants";
import { pluginScanning } from "./plugins/pluginScanning";

export async function createDevServer(
  package_root: string,
  root = process.cwd(),
  depth: number
) {
  return createViteDevServer({
    root: package_root,
    plugins: [pluginIndexHtml(), await pluginScanning({ root, depth }), vue()],
    // 允许访问不在根目录下的文件夹
    server: {
      fs: {
        allow: [PACKAGE_ROOT],
      },
      open: true,
    },
  });
}
