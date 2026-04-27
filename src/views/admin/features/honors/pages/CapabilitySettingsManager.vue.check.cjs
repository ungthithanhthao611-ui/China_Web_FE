const fs = require('fs');
const content = fs.readFileSync('d:/Web_TQ/China_Web_FE/src/views/admin/features/honors/pages/CapabilitySettingsManager.vue', 'utf8');
const scriptPart = content.match(/<script setup>([\s\S]*?)<\/script>/)[1];

let braces = 0;
let parens = 0;
let brackets = 0;

for (let i = 0; i < scriptPart.length; i++) {
  const char = scriptPart[i];
  if (char === '{') braces++;
  if (char === '}') braces--;
  if (char === '(') parens++;
  if (char === ')') parens--;
  if (char === '[') brackets++;
  if (char === ']') brackets--;
}

console.log({ braces, parens, brackets });
