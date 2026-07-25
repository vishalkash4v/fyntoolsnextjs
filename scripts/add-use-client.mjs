import fs from "fs";
import path from "path";

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      walk(p);
      continue;
    }
    if (!/\.(tsx|ts|jsx|js)$/.test(f.name)) continue;
    let c = fs.readFileSync(p, "utf8");
    if (c.includes("use client")) continue;
    const isToolsOrUi =
      p.includes(`${path.sep}components${path.sep}tools`) ||
      p.includes(`${path.sep}components${path.sep}ui`) ||
      p.includes(`${path.sep}hooks`);
    const looksClient =
      /useState|useEffect|useRef|useMemo|useCallback|useContext|onClick|window\.|localStorage|document\./.test(
        c
      );
    if (isToolsOrUi || looksClient) {
      fs.writeFileSync(p, `'use client';\n${c}`);
    }
  }
}

walk("src/components/ui");
walk("src/components/tools");
walk("src/hooks");
walk("src/components/sections");
console.log("use client annotations applied");
