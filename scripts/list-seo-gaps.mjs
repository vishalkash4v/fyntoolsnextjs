#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const tools = fs.readFileSync(path.join(root, 'src/data/toolsData.ts'), 'utf8');
const facts = fs.readFileSync(path.join(root, 'src/data/tool-content/toolFactCards.ts'), 'utf8');
const examples = fs.readFileSync(path.join(root, 'src/data/tool-content/toolExamples.ts'), 'utf8');
const paths = [...tools.matchAll(/path:\s*'(\/[^']+)'/g)].map((m) => m[1]);
const missingFacts = paths.filter((p) => !facts.includes(`'${p}'`) && !facts.includes(`"${p}"`));
const missingExamples = paths.filter((p) => !examples.includes(`'${p}'`) && !examples.includes(`"${p}"`));
console.log('tools', paths.length);
console.log('missing facts', missingFacts.length);
console.log(missingFacts.join('\n'));
console.log('---');
console.log('missing PATH_EXAMPLES', missingExamples.length);
console.log(missingExamples.slice(0, 40).join('\n'));
