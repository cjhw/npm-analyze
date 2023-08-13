import { Plugin } from "vite";
import { recurFindDep } from "../utils";

interface PluginOptions {
  root: string;
  depth: number;
}

export const CONVENTIONAL_ROUTE_ID = "analyze:dep";

export async function pluginScanning(options: PluginOptions): Promise<Plugin> {
  const depArr = [];
  const { spinner: load } = await import("@astrojs/cli-kit");

  return {
    name: "analyze:dep",
    async configResolved() {
      await load({
        start: "Checking npm dependencies",
        end: "Check end",
        while: () => {
          recurFindDep(options.root, depArr, new Set(), options.depth);
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(1);
            }, 3000);
          });
        },
      });
    },
    resolveId(id) {
      if (id === CONVENTIONAL_ROUTE_ID) {
        return "\0" + CONVENTIONAL_ROUTE_ID;
      }
    },
    load(id) {
      if (id === "\0" + CONVENTIONAL_ROUTE_ID) {
        return `export default ${JSON.stringify(depArr)}`;
      }
    },
  };
}
