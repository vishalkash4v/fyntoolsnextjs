#!/usr/bin/env node
import fs from 'fs';
const s = fs.readFileSync('src/data/tool-content/pageOverrides.ts', 'utf8');
const blocks = s.split(/\n  "\//);
const errs = [];
for (let i = 1; i < blocks.length; i++) {
  const path = '/' + blocks[i].match(/^([^"]+)/)[1];
  const keys = [...blocks[i].matchAll(/^\s{4}"([^"]+)":/gm)].map((x) => x[1]);
  const dk = [...new Set(keys.filter((k, j) => keys.indexOf(k) !== j))];
  if (dk.length) errs.push(`${path}: ${dk.join(',')}`);
}
console.log(errs.length ? errs.join('\n') : 'no dup keys');
