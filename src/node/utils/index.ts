import fs from "fs-extra";
import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";
// import { globSync } from "glob";

const map = new Map();

export async function recurFindDep(
  root: string,
  depArr: any[],
  set?: Set<string>
) {
  const pkgPath = path.join(root, "package.json");

  const pkgJsonContent = await readPackAgeJson(pkgPath);

  let pkgObj = {
    name: pkgJsonContent.name,
    children: [],
  };

  map.set(pkgObj.name, pkgObj);

  depArr.push(pkgObj);

  try {
    const depPkgs: string[] = {
      ...pkgJsonContent.devDependencies,
      ...pkgJsonContent.dependencies,
    };
    Object.keys(depPkgs).forEach(async (dep) => {
      if (dep !== pkgJsonContent.name) {
        if (map.get(dep) && !set.has(dep)) {
          pkgObj.children.push(map.get(dep));
        } else {
          console.log("name", pkgJsonContent.name);
          console.log("dep", dep);
          const pkgEntryPath = findEntry(dep, root);
          if (pkgEntryPath) {
            const packageFilePath = findPackageJsonFileByEntry(pkgEntryPath);
            const pkgPath = path.dirname(packageFilePath);
            const pkgJsonContent = await readPackAgeJson(packageFilePath);
            if (set && set.has(dep)) {
            } else {
              let helpSet: Set<string>;
              if (set) {
                helpSet = new Set([...set]);
                helpSet.add(dep);
              } else {
                helpSet = new Set<string>();
                helpSet.add(dep);
              }
              helpSet.add(pkgJsonContent.name);
              await recurFindDep(pkgPath, pkgObj.children, helpSet);
            }
          } else {
            return;
          }
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
