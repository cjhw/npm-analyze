import fs from "fs-extra";
import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";
// import { globSync } from "glob";

const map = new Map();

export async function recurFindDep(
  root: string,
  depArr: any[],
  set?: Set<string>,
  depth?: number
) {
  const pkgPath = path.join(root, "package.json");

  const pkgJsonContent = await readPackAgeJson(pkgPath);

  let pkgObj = {
    name: pkgJsonContent.name,
    detailName: pkgJsonContent?.version
      ? `${pkgJsonContent.name}@${pkgJsonContent?.version}`
      : pkgJsonContent.name,
    children: [],
  };

  map.set(pkgObj.name, JSON.stringify(pkgObj));

  depArr.push(pkgObj);

  if (depth) {
    depth--;
    if (depth === 0) {
      return;
    }
  }

  try {
    const depPkgs: string[] = {
      ...pkgJsonContent.devDependencies,
      ...pkgJsonContent.dependencies,
    };
    Object.keys(depPkgs).forEach(async (dep) => {
      if (dep !== pkgJsonContent.name) {
        if (map.get(dep)) {
          pkgObj.children.push(JSON.parse(map.get(dep)));
        } else {
          //   console.log("name", pkgJsonContent.name);
          //   console.log("dep", dep);
          const pkgEntryPath = findEntry(dep, root);
          if (pkgEntryPath) {
            const packageFilePath = await findPackageJsonFileByEntry(
              pkgEntryPath
            );
            if (pkgEntryPath) {
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
                await recurFindDep(pkgPath, pkgObj.children, helpSet, depth);
              }
            }
          } else {
            pkgObj.children.push({ name: dep, children: [] });
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

async function findPackageJsonFileByEntry(entry: string) {
  let dir = path.dirname(entry);
  let packageJsonFilePath = path.join(dir, "package.json");

  try {
    const stat = fs.statSync(packageJsonFilePath);
    if (stat.isFile()) {
      const pkgContent = await readPackAgeJson(packageJsonFilePath);
      if (pkgContent.name) {
        return packageJsonFilePath;
      } else {
        return await findPackageJsonFileByEntry(path.dirname(entry));
      }
    } else {
      return await findPackageJsonFileByEntry(path.dirname(entry));
    }
  } catch (error) {
    return await findPackageJsonFileByEntry(path.dirname(entry));
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

export function computedDepsNum(depArr: any[]) {
  for (let i = 0; i < depArr.length; i++) {
    if (depArr[i]?.children.length) {
      depArr[i].value = depArr[i].children.length;
      depArr[i].success = `该npm包共有${depArr[i].value}个依赖~~~`;
      computedDepsNum(depArr[i].children);
    } else {
      depArr[i].warn =
        "由于种种原因，该npm包没有找到包，该分析程序是基于package.json来分析的，有一些缺陷，可能是真的没有依赖或者出现了bug，谁知道呢~~~";
    }
  }
}
