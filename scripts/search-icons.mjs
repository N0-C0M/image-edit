import fs from 'node:fs';
import fsp from 'node:fs/promises';
import readline from 'node:readline';
import { createClassifier, familyFromManifest, loadTaxonomy } from './lib/classifier.mjs';

const args = process.argv.slice(2);
const option = (name, fallback = null) => args.find((x) => x.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const has = (name) => args.includes(`--${name}`);

const family = option('family', 'all').toLowerCase();
const pack = option('pack', '').toLowerCase();
const categoryFilter = option('category', '').toLowerCase();
const styleFilter = option('style', '').toLowerCase();
const limit = Math.max(1, Math.min(Number(option('limit', '50')) || 50, 1000));
const jsonOutput = has('json');
const pathOnly = has('path-only');
const query = args.filter((x) => !x.startsWith('--')).join(' ').trim().toLowerCase();

if (!query && !categoryFilter && !styleFilter && !pack) {
  console.error('Usage: node scripts/search-icons.mjs <query> [--family=all] [--pack=tabler] [--category=security] [--style=outline] [--limit=50] [--json|--path-only]');
  process.exit(1);
}

const taxonomy = await loadTaxonomy();
const classify = createClassifier(taxonomy);
let aliases = {};
try { aliases = JSON.parse(await fsp.readFile('catalog/search-aliases.json', 'utf8')); } catch {}

const queryVariants = new Set(query ? [query] : []);
for (const token of query.split(/\s+/).filter(Boolean)) {
  for (const alias of aliases[token] || []) queryVariants.add(String(alias).toLowerCase());
}
const queries = [...queryVariants];
const tokens = [...new Set(queries.flatMap((q) => q.split(/\s+/).filter(Boolean)))];

const manifestFiles = (await fsp.readdir('.'))
  .filter((name) => /^manifest(?:-[a-z0-9-]+)?\.jsonl$/i.test(name))
  .sort();
const manifests = manifestFiles
  .map((file) => ({ family: familyFromManifest(file), file }))
  .filter((source) => family === 'all' || source.family === family);

const results = [];

function score(item, itemFamily, classification) {
  const name = String(item.name || '').toLowerCase();
  const collection = String(item.collection || '').toLowerCase();
  const prefix = String(item.prefix || '').toLowerCase();
  const sourceId = String(item.sourceId || item.id || '').toLowerCase();
  const semanticCategory = String(classification.category || '').toLowerCase();
  const styles = classification.styles.join(' ').toLowerCase();
  const hay = `${name} ${collection} ${prefix} ${sourceId} ${semanticCategory} ${styles}`;

  if (pack && prefix !== pack && !collection.includes(pack)) return -1;
  if (categoryFilter && semanticCategory !== categoryFilter) return -1;
  if (styleFilter && !classification.styles.includes(styleFilter)) return -1;

  let value = query ? 0 : 1;
  for (const q of queries) {
    if (name === q) value = Math.max(value, 1200);
    if (name.startsWith(q)) value = Math.max(value, 700);
    if (name.includes(q)) value = Math.max(value, 420);
    if (sourceId.includes(q)) value = Math.max(value, 260);
    if (hay.includes(q)) value = Math.max(value, 120);
  }

  for (const token of tokens) {
    if (name === token) value += 300;
    else if (name.startsWith(token)) value += 150;
    else if (name.includes(token)) value += 100;
    if (collection.includes(token)) value += 28;
    if (prefix.includes(token)) value += 24;
    if (semanticCategory.includes(token)) value += 22;
    if (styles.includes(token)) value += 16;
  }

  if (item.variant === 'native-freehand') value += 8;
  if (item.variant === 'original') value += 5;
  if (itemFamily === 'beautiful') value += 3;
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
    const classification = classify(item, source.family);
    const itemScore = score(item, source.family, classification);
    if (itemScore <= 0) continue;
    results.push({ score: itemScore, family: source.family, category: classification.category, styles: classification.styles, ...item });
  }
}

results.sort((a,b) => b.score-a.score || String(a.name).localeCompare(String(b.name)));
const top = results.slice(0, limit);

if (jsonOutput) {
  console.log(JSON.stringify({ query, queryVariants: queries, filters: { family, pack, category: categoryFilter, style: styleFilter }, totalMatches: results.length, results: top }, null, 2));
  process.exit(0);
}
if (pathOnly) {
  for (const item of top) console.log(item.path);
  process.exit(0);
}
if (!top.length) {
  console.log('No icons found for the supplied query/filters.');
  process.exit(0);
}

if (queries.length > 1) console.log(`Query variants: ${queries.join(', ')}`);
console.log(`Found ${results.length} matches. Showing ${top.length}:\n`);
console.log('SCORE\tFAMILY\tCATEGORY\tSTYLES\tICON\tPACK\tPATH');
for (const item of top) {
  console.log(`${item.score}\t${item.family}\t${item.category}\t${item.styles.join(',')}\t${item.sourceId || item.id}\t${item.collection || item.prefix || ''}\t${item.path}`);
}
