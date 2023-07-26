import { createServer as createViteDevServer } from "vite";
import { pluginIndexHtml } from "./plugins/indexHtml";
import vue from "@vitejs/plugin-vue";
import { PACKAGE_ROOT } from "./constants";

export async function createDevServer(root = process.cwd()) {
  return createViteDevServer({
    root,
    plugins: [pluginIndexHtml(), vue()],
    // 允许访问不在根目录下的文件夹
    server: {
      fs: {
        allow: [PACKAGE_ROOT],
      },
    },
  });
}
