import fs from "fs-extra";
import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";
// import { globSync } from "glob";

export async function recurFindDep(root: string, depArr: any[]) {
  const pkgPath = path.join(root, "package.json");

  const pkgJsonContent = await readPackAgeJson(pkgPath);

  let pkgObj = {
    name: pkgJsonContent.name,
    children: [],
  };

  depArr.push(pkgObj);

  try {
    const depPkgs: string[] = {
      // ...pkgJsonContent.devDependencies,
      ...pkgJsonContent.dependencies,
    };
    Object.keys(depPkgs).forEach(async (dep) => {
      if (dep !== pkgJsonContent.name) {
        // console.log("name", pkgJsonContent.name);
        // console.log("dep", dep);
        const pkgEntryPath = findEntry(dep, root);
        if (pkgEntryPath) {
          const packageFilePath = findPackageJsonFileByEntry(pkgEntryPath);
          const pkgPath = path.dirname(packageFilePath);
          const pkgJsonContent = await readPackAgeJson(packageFilePath);
          await recurFindDep(pkgPath, pkgObj.children);
        } else {
          return;
        }
      }
    });
  } catch (e) {}
}

function findEntry(pkgName: string, root: string) {
  try {
    let esmRequire: NodeRequire;
    const _require = import.meta.url
      ? (esmRequire ??= createRequire(import.meta.url))
      : require;

    const pkgEntryPath = _require.resolve(pkgName, { paths: [root] });

    return pkgEntryPath;
  } catch (e) {}
}

function findPackageJsonFileByEntry(entry: string) {
  let dir = path.dirname(entry);
  let packageJsonFilePath = path.join(dir, "package.json");

  try {
    const stat = fs.statSync(packageJsonFilePath);
    if (stat.isFile()) {
      return packageJsonFilePath;
    } else {
      return findPackageJsonFileByEntry(path.dirname(entry));
    }
  } catch (error) {
    return findPackageJsonFileByEntry(path.dirname(entry));
  }
}

async function readPackAgeJson(pkgJsonFilePath: string) {
  const { default: pkg } = await import(
    pathToFileURL(pkgJsonFilePath) as unknown as string,
    {
      assert: { type: "json" },
    }
  );

  return pkg;
}
