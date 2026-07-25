import fs from "fs";
import path from "path";

for (const f of fs.readdirSync("src/contexts")) {
  const fp = path.join("src/contexts", f);
  let c = fs.readFileSync(fp, "utf8");
  if (!c.includes("use client")) {
    fs.writeFileSync(fp, `'use client';\n${c}`);
  }
}
console.log("contexts annotated");
