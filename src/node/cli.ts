import { cac } from "cac";
import { createDevServer } from "./dev";
import path from "path";
import { PACKAGE_ROOT } from "./constants";
import { pathToFileURL } from "url";
import { recurFindDep } from "./utils";

const version = require("../../package.json").version;

const cli = cac("cai-cli").version(version).help();

cli
  .command("[root]", "start dev server")
  .alias("analyze")
  .action(async (root: string) => {
    // 添加以下逻辑
    root = root ? path.resolve(root) : process.cwd();

    recurFindDep(root);

    const server = await createDevServer(PACKAGE_ROOT);
    await server.listen();
    server.printUrls();
  });

cli.parse();
