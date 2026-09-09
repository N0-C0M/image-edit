import fs from 'node:fs';
import readline from 'node:readline';

const args = process.argv.slice(2);
const familyArg = args.find((x) => x.startsWith('--family='));
const limitArg = args.find((x) => x.startsWith('--limit='));
const family = familyArg ? familyArg.split('=')[1] : 'all';
const limit = Number(limitArg ? limitArg.split('=')[1] : '50');
const query = args.filter((x) => !x.startsWith('--family=') && !x.startsWith('--limit=')).join(' ').trim().toLowerCase();

if (!query) {
  console.error('Usage: node scripts/search-icons.mjs <query> [--family=core|handdrawn|beautiful] [--limit=50]');
  process.exit(1);
}

const manifests = [
  { family: 'core', file: 'manifest.jsonl' },
  { family: 'handdrawn', file: 'manifest-handdrawn.jsonl' },
  { family: 'beautiful', file: 'manifest-beautiful.jsonl' },
].filter((x) => family === 'all' || x.family === family);

const tokens = query.split(/\s+/).filter(Boolean);
const results = [];

function score(item, itemFamily) {
  const name = String(item.name || '').toLowerCase();
  const collection = String(item.collection || '').toLowerCase();
  const prefix = String(item.prefix || '').toLowerCase();
  const category = String(item.category || '').toLowerCase();
  const hay = `${name} ${collection} ${prefix} ${category}`;
  let value = 0;

  if (name === query) value += 1000;
  if (name.startsWith(query)) value += 600;
  if (name.includes(query)) value += 350;
  if (hay.includes(query)) value += 150;

  for (const token of tokens) {
    if (name === token) value += 250;
    else if (name.startsWith(token)) value += 120;
    else if (name.includes(token)) value += 80;
    if (collection.includes(token)) value += 25;
    if (category.includes(token)) value += 15;
  }

  if (itemFamily === 'beautiful') value += 3;
  if (itemFamily === 'handdrawn' && item.variant === 'native-freehand') value += 5;
  return value;
}

for (const source of manifests) {
  if (!fs.existsSync(source.file)) continue;
  const input = fs.createReadStream(source.file, { encoding: 'utf8' });
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    let item;
    try { item = JSON.parse(line); } catch { continue; }
    const itemScore = score(item, source.family);
    if (itemScore <= 0) continue;
    results.push({ score: itemScore, family: source.family, ...item });
  }
}

results.sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name)));
const top = results.slice(0, Math.max(1, Math.min(limit, 500)));

if (!top.length) {
  console.log(`No icons found for: ${query}`);
  process.exit(0);
}

console.log(`Found ${results.length} matches. Showing ${top.length}:\n`);
console.log('SCORE\tFAMILY\tVARIANT\tICON\tCOLLECTION\tPATH');
for (const item of top) {
  console.log(`${item.score}\t${item.family}\t${item.variant || 'original'}\t${item.sourceId || item.id}\t${item.collection || ''}\t${item.path}`);
}
