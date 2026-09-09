import fs from 'node:fs/promises';
import path from 'node:path';

const taxonomy = JSON.parse(await fs.readFile('catalog/taxonomy.json', 'utf8'));

const manifestFiles = (await fs.readdir('.'))
  .filter((name) => /^manifest(?:-[a-z0-9-]+)?\.jsonl$/i.test(name))
  .sort();

function familyFromManifest(file) {
  if (file === 'manifest.jsonl') return 'core';
  return file.replace(/^manifest-/, '').replace(/\.jsonl$/, '');
}

function words(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const categoryRules = Object.entries(taxonomy.categories)
  .filter(([name]) => name !== 'misc')
  .map(([name, terms]) => [name, new Set(terms.flatMap(words))]);

const styleRules = Object.entries(taxonomy.styles)
  .map(([name, terms]) => [name, new Set(terms.flatMap(words))]);

export function classifyIcon(item, family) {
  const semantic = new Set([
    ...words(item.name),
    ...words(item.collection),
    ...words(item.prefix),
    ...words(item.category),
    ...words(item.variant),
    ...words(family),
  ]);

  let category = 'misc';
  let bestScore = 0;
  for (const [candidate, terms] of categoryRules) {
    let score = 0;
    for (const token of semantic) if (terms.has(token)) score++;
    if (score > bestScore) {
      category = candidate;
      bestScore = score;
    }
  }

  const styles = [];
  for (const [style, terms] of styleRules) {
    for (const token of semantic) {
      if (terms.has(token)) {
        styles.push(style);
        break;
      }
    }
  }

  if (family.includes('handdrawn') && !styles.includes('handdrawn')) styles.push('handdrawn');
  if (family.includes('neon') && !styles.includes('neon')) styles.push('neon');
  if (family.includes('sticker') && !styles.includes('sticker')) styles.push('sticker');
  if (item.palette === true && !styles.includes('color')) styles.push('color');
  if (/emoji/i.test(String(item.collection || '')) && !styles.includes('color')) styles.push('color');
  if (/brand|logo/i.test(`${item.category || ''} ${item.collection || ''}`) && !styles.includes('brand')) styles.push('brand');
  if (/game/i.test(`${item.category || ''} ${item.collection || ''}`) && !styles.includes('game')) styles.push('game');
  if (!styles.length) styles.push('standard');

  return { category, styles: [...new Set(styles)].sort() };
}

const packs = new Map();
const categoryTotals = Object.fromEntries(Object.keys(taxonomy.categories).map((x) => [x, 0]));
const styleTotals = {};
let total = 0;

for (const file of manifestFiles) {
  const family = familyFromManifest(file);
  const text = await fs.readFile(file, 'utf8');
  for (const line of text.split('\n')) {
    if (!line) continue;
    const item = JSON.parse(line);
    const { category, styles } = classifyIcon(item, family);
    const prefix = item.prefix || 'unknown';
    const key = `${family}:${prefix}`;
    if (!packs.has(key)) {
      packs.set(key, {
        id: key,
        family,
        prefix,
        name: item.collection || prefix,
        author: item.author || null,
        license: item.license || null,
        count: 0,
        categories: {},
        styles: {},
        sample: [],
      });
    }
    const pack = packs.get(key);
    pack.count++;
    pack.categories[category] = (pack.categories[category] || 0) + 1;
    for (const style of styles) {
      pack.styles[style] = (pack.styles[style] || 0) + 1;
      styleTotals[style] = (styleTotals[style] || 0) + 1;
    }
    categoryTotals[category] = (categoryTotals[category] || 0) + 1;
    if (pack.sample.length < 8) pack.sample.push({ id: item.id, name: item.name, path: item.path, category, styles });
    total++;
  }
}

const packRows = [...packs.values()]
  .map((pack) => ({
    ...pack,
    dominantCategory: Object.entries(pack.categories).sort((a,b) => b[1]-a[1])[0]?.[0] || 'misc',
    dominantStyles: Object.entries(pack.styles).sort((a,b) => b[1]-a[1]).slice(0,4).map(([name]) => name),
  }))
  .sort((a,b) => a.family.localeCompare(b.family) || b.count-a.count || a.name.localeCompare(b.name));

const categoryIndex = Object.fromEntries(Object.keys(taxonomy.categories).map((category) => [category, []]));
const styleIndex = {};
for (const pack of packRows) {
  for (const [category, count] of Object.entries(pack.categories)) {
    if (count > 0) categoryIndex[category].push({ pack: pack.id, count });
  }
  for (const [style, count] of Object.entries(pack.styles)) {
    (styleIndex[style] ||= []).push({ pack: pack.id, count });
  }
}
for (const rows of Object.values(categoryIndex)) rows.sort((a,b) => b.count-a.count);
for (const rows of Object.values(styleIndex)) rows.sort((a,b) => b.count-a.count);

await fs.writeFile('catalog/packs.json', JSON.stringify({ generatedAt: new Date().toISOString(), totalIcons: total, packs: packRows }, null, 2) + '\n');
await fs.writeFile('catalog/categories.json', JSON.stringify({ generatedAt: new Date().toISOString(), totals: categoryTotals, packs: categoryIndex }, null, 2) + '\n');
await fs.writeFile('catalog/styles.json', JSON.stringify({ generatedAt: new Date().toISOString(), totals: styleTotals, packs: styleIndex }, null, 2) + '\n');
await fs.writeFile('catalog/classification-stats.json', JSON.stringify({ generatedAt: new Date().toISOString(), totalIcons: total, manifestFiles, packCount: packRows.length, categoryTotals, styleTotals }, null, 2) + '\n');

console.log(`Classified ${total} icons from ${manifestFiles.length} manifests into ${packRows.length} packs.`);
