import fs from 'node:fs/promises';

const file = process.argv[2] || 'catalog/packs.json';
const data = JSON.parse(await fs.readFile(file, 'utf8'));
let changed = 0;

for (const pack of data.packs || []) {
  // Keep the open-source pack, but expose neutral project-level metadata in Atlas.
  if (pack.prefix === 'la') {
    pack.author = { name: 'Line Awesome contributors', url: null };
    changed++;
  }
}

await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
console.log(`Sanitized public metadata for ${changed} pack entries in ${file}.`);
