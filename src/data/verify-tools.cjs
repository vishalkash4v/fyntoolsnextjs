const fs = require('fs');
const content = fs.readFileSync('toolsData.ts', 'utf8');

// Find all tool objects (not commented)
const toolMatches = [];
const lines = content.split('\n');
let inTool = false;
let toolLines = [];
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Skip commented lines
  if (trimmed.startsWith('//')) continue;
  
  // Check if we're starting a new tool object
  if (trimmed === '{' && !inTool) {
    inTool = true;
    toolLines = [line];
    braceCount = 1;
    continue;
  }
  
  if (inTool) {
    toolLines.push(line);
    
    // Count braces
    braceCount += (line.match(/\{/g) || []).length;
    braceCount -= (line.match(/\}/g) || []).length;
    
    // If we've closed all braces, we've finished a tool
    if (braceCount === 0) {
      const toolText = toolLines.join('\n');
      const idMatch = toolText.match(/id:\s*'([^']+)'/);
      const urlMatch = toolText.match(/url:\s*'https:\/\/fyntools\.com\/[^']+'/);
      const featuresMatch = toolText.match(/features:\s*'[^']+'/);
      
      if (idMatch) {
        toolMatches.push({
          id: idMatch[1],
          line: i + 1,
          hasUrl: !!urlMatch,
          hasFeatures: !!featuresMatch
        });
      }
      
      inTool = false;
      toolLines = [];
    }
  }
}

console.log(`\n=== TOOL VERIFICATION REPORT ===\n`);
console.log(`Total active tools found: ${toolMatches.length}`);
console.log(`Tools with URL: ${toolMatches.filter(t => t.hasUrl).length}`);
console.log(`Tools with features: ${toolMatches.filter(t => t.hasFeatures).length}\n`);

const missing = toolMatches.filter(t => !t.hasUrl || !t.hasFeatures);

if (missing.length === 0) {
  console.log('✅ ALL TOOLS HAVE URL AND FEATURES!');
} else {
  console.log(`❌ ${missing.length} tool(s) missing URL or features:\n`);
  missing.forEach(t => {
    console.log(`  - ${t.id} (around line ${t.line})`);
    console.log(`    URL: ${t.hasUrl ? '✅' : '❌'}`);
    console.log(`    Features: ${t.hasFeatures ? '✅' : '❌'}\n`);
  });
}
