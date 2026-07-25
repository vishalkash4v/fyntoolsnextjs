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
    if (!/\.(tsx|ts)$/.test(f.name)) continue;
    let c = fs.readFileSync(p, "utf8");
    const orig = c;
    // Replace react-router-dom Link imports with next/link
    c = c.replace(
      /import\s*\{([^}*]*)\}\s*from\s*['"]react-router-dom['"]\s*;?/g,
      (match, imports) => {
        const parts = imports.split(",").map((s) => s.trim()).filter(Boolean);
        const hasLink = parts.some((p) => p === "Link" || p.startsWith("Link "));
        const rest = parts.filter(
          (p) =>
            p !== "Link" &&
            !p.startsWith("Link ") &&
            p !== "NavLink" &&
            p !== "useNavigate" &&
            p !== "useLocation" &&
            p !== "useParams" &&
            p !== "Navigate" &&
            p !== "BrowserRouter" &&
            p !== "Routes" &&
            p !== "Route" &&
            p !== "Outlet"
        );
        const lines = [];
        if (hasLink || parts.includes("NavLink")) {
          lines.push(`import Link from "next/link";`);
        }
        if (parts.includes("useNavigate") || parts.includes("useLocation") || parts.includes("useParams")) {
          lines.push(`import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";`);
        }
        if (rest.length) {
          lines.push(`// leftover router imports removed: ${rest.join(", ")}`);
        }
        return lines.join("\n") || "// react-router-dom removed";
      }
    );
    // useNavigate() -> useRouter()
    c = c.replace(/const\s+navigate\s*=\s*useNavigate\(\)/g, "const router = useRouter()");
    c = c.replace(/navigate\(/g, "router.push(");
    // useLocation().pathname -> usePathname()
    c = c.replace(/const\s+\{\s*pathname\s*\}\s*=\s*useLocation\(\)/g, "const pathname = usePathname()");
    c = c.replace(/useLocation\(\)\.pathname/g, "usePathname()");
    c = c.replace(/const\s+location\s*=\s*useLocation\(\)/g, "const pathname = usePathname();\n  const location = { pathname, search: typeof window !== 'undefined' ? window.location.search : '' }");
    // Link to= stays same for next/link
    if (c !== orig) fs.writeFileSync(p, c);
  }
}

walk("src/components");
walk("src/data");
walk("src/utils");
walk("src/hooks");
console.log("router migration pass done");
