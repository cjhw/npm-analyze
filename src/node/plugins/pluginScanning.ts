import { Plugin } from "vite";
import { recurFindDep } from "../utils";

interface PluginOptions {
  root: string;
}

export const CONVENTIONAL_ROUTE_ID = "analyze:dep";

export function pluginScanning(options: PluginOptions): Plugin {
  const depArr = [];

  return {
    name: "analyze:dep",
    async configResolved() {
      recurFindDep(options.root, depArr);
    },
    resolveId(id) {
      if (id === CONVENTIONAL_ROUTE_ID) {
        return "\0" + CONVENTIONAL_ROUTE_ID;
      }
    },
    load(id) {
      if (id === "\0" + CONVENTIONAL_ROUTE_ID) {
        debugger;
        return `export default ${JSON.stringify(depArr)}`;
      }
    },
  };
}
