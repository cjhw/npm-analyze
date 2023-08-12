import { cac } from "cac";
import { createDevServer } from "./dev";
import path from "path";
import { PACKAGE_ROOT } from "./constants";

const version = require("../../package.json").version;

const cli = cac("cai-cli").version(version).help();

cli
  .command("[root]", "start dev server")
  .alias("analyze")
  .option("-d,--depth <depth>", "change dependency hierarchy,")
  .action(async (root: string, options) => {
    // 添加以下逻辑
    console.log(options.depth);

    root = root ? path.resolve(root) : process.cwd();

    const server = await createDevServer(PACKAGE_ROOT, root, options.depth);
    await server.listen();
    server.printUrls();
  });

cli.parse();
