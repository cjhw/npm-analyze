import { readdir } from "fs";
import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";
import { globSync } from "glob";

export async function recurFindDep(root: string) {
  const pkgPath = path.join(root, "package.json");

  const { default: pkg } = await import(
    pathToFileURL(pkgPath) as unknown as string,
    {
      assert: { type: "json" },
    }
  );
  //   try {
  //     let esmRequire: NodeRequire;
  //     const _require = import.meta.url
  //       ? (esmRequire ??= createRequire(import.meta.url))
  //       : require;

  //     const devDependencies = pkg.devDependencies;
  //     Object.keys(devDependencies).forEach((dep) => {
  //       const depPath = _require.resolve(dep, { paths: [root] });
  //       console.log(depPath);
  //       recurFindDep(depPath);
  //     });
  //   } catch (e) {}
}
