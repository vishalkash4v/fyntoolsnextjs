import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const globalsPath = path.join(root, "src", "app", "globals.css");
const stylesDir = path.join(root, "src", "styles");
fs.mkdirSync(stylesDir, { recursive: true });

let s = fs.readFileSync(globalsPath, "utf8");

function extract(startMarker, endMarker, outName) {
  const start = s.indexOf(startMarker);
  if (start < 0) {
    console.log("skip missing", outName);
    return;
  }
  const end = s.indexOf(endMarker, start);
  if (end < 0) {
    console.log("skip no end", outName);
    return;
  }
  // include through end of the block that ends before endMarker's section
  // Find last closing brace before endMarker for coin, or use endMarker start for rsuite next section
  let cutEnd = end;
  // For rsuite, endMarker is next comment "/* MUI"
  // Include everything from startMarker to just before endMarker
  const block = s.slice(start, cutEnd).trim() + "\n";
  fs.writeFileSync(path.join(stylesDir, outName), block);
  s = s.slice(0, start) + s.slice(cutEnd);
  console.log("wrote", outName, block.length);
}

extract("  /* Rsuite DatePicker", "  /* MUI DatePicker", "rsuite-datepicker.css");
extract("  /* Coin Flip Animation", "  .perspective-1000", "coin-flip.css");

// Also pull .perspective-1000 block if left behind after coin extract started at comment
// Re-read: coin extract stopped at .perspective-1000 - need to include that rule too
const pers = s.indexOf("  .perspective-1000");
if (pers >= 0) {
  const after = s.indexOf("}", pers);
  if (after > 0) {
    const rule = s.slice(pers, after + 1).trim() + "\n";
    const coinPath = path.join(stylesDir, "coin-flip.css");
    if (fs.existsSync(coinPath)) {
      fs.appendFileSync(coinPath, "\n" + rule);
      s = s.slice(0, pers) + s.slice(after + 1);
      console.log("appended perspective rule");
    }
  }
}

fs.writeFileSync(globalsPath, s);
console.log("globals updated", s.length);
