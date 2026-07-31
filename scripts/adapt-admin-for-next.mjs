import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src", "components", "admin");

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const files = walk(root);

for (const file of files) {
  let s = fs.readFileSync(file, "utf8");

  if (file.endsWith("ProtectedRoute.tsx")) {
    fs.writeFileSync(
      file,
      `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/fyntoolsadmin/login');
      return;
    }
    setOk(true);
  }, [router]);

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}
`
    );
    console.log("rewrote ProtectedRoute");
    continue;
  }

  if (!s.startsWith("'use client'") && !s.startsWith('"use client"')) {
    s = `'use client';\n\n` + s;
  }

  s = s.replace(/from ['"]react-router-dom['"]/g, "from 'next/navigation'");

  // Split mixed imports from the old react-router barrel
  s = s.replace(
    /import \{ useNavigate, useLocation \} from 'next\/navigation';/g,
    "import { useRouter, usePathname } from 'next/navigation';"
  );
  s = s.replace(
    /import \{ useNavigate, useParams \} from 'next\/navigation';/g,
    "import { useRouter, useParams } from 'next/navigation';"
  );
  s = s.replace(
    /import \{ useNavigate \} from 'next\/navigation';/g,
    "import { useRouter } from 'next/navigation';"
  );
  s = s.replace(
    /import \{ Link \} from 'next\/navigation';/g,
    "import Link from 'next/link';"
  );
  // AdminLoginPage had both useNavigate and Link from react-router
  if (s.includes("from 'next/navigation'") && s.includes("<Link") && !s.includes("from 'next/link'")) {
    // may still need Link from next/link if Link was in a separate import already fixed
  }

  // Fix AdminLoginPage which imported Link and useNavigate from same module originally as two imports
  if (file.endsWith("AdminLoginPage.tsx")) {
    s = s.replace(/import Link from 'next\/link';\n/g, "");
    s = s.replace(
      /import \{ useRouter \} from 'next\/navigation';/,
      "import { useRouter } from 'next/navigation';\nimport Link from 'next/link';"
    );
  }

  s = s.replace(/const navigate = useNavigate\(\);/g, "const router = useRouter();");
  s = s.replace(/\bnavigate\(/g, "router.push(");
  s = s.replace(/const location = useLocation\(\);/g, "const pathname = usePathname();");
  s = s.replace(/location\.pathname/g, "pathname");

  s = s.replace(/from ['"]@\/contexts\/ThemeContext['"]/g, "from 'next-themes'");
  s = s.replace(/import \{ Helmet \} from ['"]react-helmet-async['"];\n?/g, "");
  s = s.replace(/\s*<Helmet>[\s\S]*?<\/Helmet>\n?/g, "");

  s = s.replace(
    /const API_BASE_URL = ['"]https:\/\/express-two-umber\.vercel\.app\/api['"];/g,
    "import { API_BASE_URL } from '@/lib/seo/site';"
  );
  s = s.replace(
    /const API_BASE_URL = ['"]https:\/\/express-two-umber\.vercel\.app['"];/g,
    `const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.replace(/\\/api\\/?$/, "") ||
  "https://express-two-umber.vercel.app"
).replace(/\\/$/, "");`
  );

  s = s.replace(/<Link(\s+)to=/g, "<Link$1href=");

  // Move imports to top if API import landed mid-file
  if (s.includes("import { API_BASE_URL } from '@/lib/seo/site';")) {
    const apiImport = "import { API_BASE_URL } from '@/lib/seo/site';";
    s = s.replace(apiImport, "");
    // insert after first import block / use client
    const lines = s.split("\n");
    let insertAt = 0;
    if (lines[0].includes("use client")) insertAt = 1;
    while (insertAt < lines.length && (lines[insertAt].startsWith("import ") || lines[insertAt].trim() === "")) {
      insertAt++;
    }
    lines.splice(insertAt, 0, apiImport);
    s = lines.join("\n");
  }

  fs.writeFileSync(file, s);
  console.log("updated", path.relative(root, file));
}

console.log("done", files.length);
