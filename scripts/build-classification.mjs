import fs from 'node:fs/promises';

const taxonomy = JSON.parse(await fs.readFile('catalog/taxonomy.json', 'utf8'));

const manifestFiles = (await fs.readdir('.'))
  .filter((name) => /^manifest(?:-[a-z0-9-]+)?\.jsonl$/i.test(name))
  .sort();

function familyFromManifest(file) {
  if (file === 'manifest.jsonl') return 'core';
  return file.replace(/^manifest-/, '').replace(/\.jsonl$/, '');
}

function rootFromFamily(family) {
  return family === 'core' ? 'library/' : `library-${family}/`;
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
  if (family.includes('soft') && !styles.includes('soft')) styles.push('soft');
  if (family.includes('glass') && !styles.includes('glass')) styles.push('glass');
  if (item.palette === true && !styles.includes('color')) styles.push('color');
  if (/emoji/i.test(String(item.collection || '')) && !styles.includes('color')) styles.push('color');
  if (/brand|logo/i.test(`${item.category || ''} ${item.collection || ''}`) && !styles.includes('brand')) styles.push('brand');
  if (/game/i.test(`${item.category || ''} ${item.collection || ''}`) && !styles.includes('game')) styles.push('game');
  if (!styles.length) styles.push('standard');

  return { category, styles: [...new Set(styles)].sort() };
}

const packs = new Map();
const familyTotals = {};
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
    familyTotals[family] = (familyTotals[family] || 0) + 1;
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

const generatedAt = new Date().toISOString();
const familyOrder = ['core', 'handdrawn', 'beautiful', 'extended', 'neon', 'sticker', 'soft', 'glass'];
const orderedFamilies = [...new Set([...familyOrder.filter((f) => familyTotals[f]), ...Object.keys(familyTotals).sort()])];

await fs.writeFile('catalog/packs.json', JSON.stringify({ generatedAt, totalIcons: total, packs: packRows }, null, 2) + '\n');
await fs.writeFile('catalog/categories.json', JSON.stringify({ generatedAt, totals: categoryTotals, packs: categoryIndex }, null, 2) + '\n');
await fs.writeFile('catalog/styles.json', JSON.stringify({ generatedAt, totals: styleTotals, packs: styleIndex }, null, 2) + '\n');
await fs.writeFile('catalog/classification-stats.json', JSON.stringify({ generatedAt, totalIcons: total, manifestFiles, packCount: packRows.length, familyTotals, categoryTotals, styleTotals }, null, 2) + '\n');

const iconMap = {
  generatedAt,
  total,
  packCount: packRows.length,
  families: Object.fromEntries(orderedFamilies.map((family) => [family, {
    count: familyTotals[family],
    root: rootFromFamily(family),
    manifest: family === 'core' ? 'manifest.jsonl' : `manifest-${family}.jsonl`,
    collections: packRows.filter((pack) => pack.family === family).map((pack) => pack.prefix),
  }])),
};
await fs.writeFile('catalog/icon-map.json', JSON.stringify(iconMap, null, 2) + '\n');

const statsRows = orderedFamilies.map((family) => `| ${family} | ${familyTotals[family].toLocaleString('en-US')} | ${rootFromFamily(family)} |`).join('\n');
const stats = `# Icon Library Stats\n\n- Total SVG icons: **${total.toLocaleString('en-US')}**\n- Families: **${orderedFamilies.length}**\n- Packs: **${packRows.length.toLocaleString('en-US')}**\n- Manifests: **${manifestFiles.length}**\n- Generated: ${generatedAt}\n\n| Family | Icons | Root |\n|---|---:|---|\n${statsRows}\n\nSee [ICON_MAP.md](ICON_MAP.md), [docs/CLASSIFICATION.md](docs/CLASSIFICATION.md), and machine-readable indexes under \`catalog/\`.\n`;
await fs.writeFile('ICON_LIBRARY_STATS.md', stats);

const mapSections = orderedFamilies.map((family) => {
  const rows = packRows
    .filter((pack) => pack.family === family)
    .map((pack) => {
      const license = typeof pack.license === 'object' ? (pack.license.title || pack.license.spdx || 'See metadata') : (pack.license || 'See metadata');
      return `| ${pack.prefix} | ${pack.name} | ${pack.count} | ${pack.dominantCategory} | ${pack.dominantStyles.join(', ')} | ${license} |`;
    })
    .join('\n');
  return `## ${family}\n\n**${familyTotals[family].toLocaleString('en-US')} icons** · \`${rootFromFamily(family)}\`\n\n| Prefix | Pack | Icons | Dominant category | Styles | License |\n|---|---|---:|---|---|---|\n${rows}`;
}).join('\n\n');

const iconMapMd = `# AERO Icon Map\n\nAutomatically generated map of **${total.toLocaleString('en-US')} SVG icons** across **${orderedFamilies.length} families** and **${packRows.length} packs**.\n\n## Quick search\n\n\`\`\`bash\nnode scripts/search-icons.mjs settings\nnode scripts/search-icons.mjs безопасность --category=security\nnode scripts/search-icons.mjs sword --family=neon\nnode scripts/search-icons.mjs camera --style=glass\n\`\`\`\n\nFor classification rules see [docs/CLASSIFICATION.md](docs/CLASSIFICATION.md).\n\n${mapSections}\n`;
await fs.writeFile('ICON_MAP.md', iconMapMd);

console.log(`Classified ${total} icons from ${manifestFiles.length} manifests into ${packRows.length} packs across ${orderedFamilies.length} families.`);
