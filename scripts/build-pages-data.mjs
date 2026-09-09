import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createClassifier, familyFromManifest, loadTaxonomy, compactLicense, safeFilePart, words } from './lib/classifier.mjs';

const outRoot = process.argv[2] || '.pages-dist';
const taxonomy = await loadTaxonomy();
const classify = createClassifier(taxonomy);
const concurrency = Math.max(8, Math.min(96, Number(process.env.SPRITE_CONCURRENCY || Math.max(24, os.cpus().length * 4))));

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    if (entry.isDirectory()) await copyDir(from, to);
    else await fs.copyFile(from, to);
  }
}

function hash32(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function symbolId(id) { return `i-${hash32(id).toString(36)}`; }
function sourceIdOf(item) {
  if (item.sourceId) return String(item.sourceId);
  const parts = String(item.id || '').split(':');
  return parts.length >= 2 ? parts.slice(-2).join(':') : `${item.prefix || 'unknown'}:${item.name || 'icon'}`;
}

function normalizeSvgForSymbol(svg, sid) {
  const open = svg.match(/<svg\b([^>]*)>/i);
  const attrs = open?.[1] || '';
  let viewBox = attrs.match(/viewBox=["']([^"']+)["']/i)?.[1];
  if (!viewBox) {
    const width = attrs.match(/width=["']?([0-9.]+)/i)?.[1] || '24';
    const height = attrs.match(/height=["']?([0-9.]+)/i)?.[1] || '24';
    viewBox = `0 0 ${width} ${height}`;
  }
  let body = svg.replace(/^\s*<svg\b[^>]*>/i, '').replace(/<\/svg>\s*$/i, '');
  const ids = [...body.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]);
  for (const oldId of ids) {
    const next = `${sid}-${safeFilePart(oldId)}`;
    body = body
      .replaceAll(`id="${oldId}"`, `id="${next}"`)
      .replaceAll(`id='${oldId}'`, `id='${next}'`)
      .replaceAll(`url(#${oldId})`, `url(#${next})`)
      .replaceAll(`href="#${oldId}"`, `href="#${next}"`)
      .replaceAll(`href='#${oldId}'`, `href='#${next}'`)
      .replaceAll(`xlink:href="#${oldId}"`, `xlink:href="#${next}"`)
      .replaceAll(`xlink:href='#${oldId}'`, `xlink:href='#${next}'`);
  }
  return `<symbol id="${sid}" viewBox="${viewBox}">${body}</symbol>`;
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

await fs.rm(outRoot, { recursive: true, force: true });
await copyDir('site', outRoot);
await fs.mkdir(path.join(outRoot, 'data', 'packs'), { recursive: true });
await fs.mkdir(path.join(outRoot, 'data', 'sprites'), { recursive: true });
await fs.mkdir(path.join(outRoot, 'data', 'search'), { recursive: true });

const manifestFiles = (await fs.readdir('.'))
  .filter((name) => /^manifest(?:-[a-z0-9-]+)?\.jsonl$/i.test(name))
  .sort();

const packs = new Map();
const sourceCandidates = new Map();
const familyTotals = {};
const categoryTotals = Object.fromEntries(Object.keys(taxonomy.categories).map((x) => [x, 0]));
const styleTotals = {};
let totalIcons = 0;

const sourceRank = (record) => {
  if (record.v === 'original' && record.f === 'core') return 50;
  if (record.v === 'original' && record.f === 'beautiful') return 45;
  if (record.v === 'original' && record.f === 'extended') return 40;
  if (record.v === 'original') return 35;
  if (record.v === 'native-freehand') return 30;
  return 0;
};

// Pass 1: metadata only. Generated families are intentionally NOT duplicated in Pages sprites.
for (const manifestFile of manifestFiles) {
  const family = familyFromManifest(manifestFile);
  const text = await fs.readFile(manifestFile, 'utf8');
  for (const line of text.split('\n')) {
    if (!line) continue;
    const item = JSON.parse(line);
    const prefix = item.prefix || 'unknown';
    const packId = `${family}:${prefix}`;
    const packFileId = safeFilePart(packId);
    const { category, styles } = classify(item, family);
    const variant = item.variant || 'original';
    const sourceId = sourceIdOf(item);

    if (!packs.has(packId)) {
      packs.set(packId, {
        id: packId,
        fileId: packFileId,
        family,
        prefix,
        name: item.collection || prefix,
        author: item.author || null,
        license: compactLicense(item.license),
        count: 0,
        categories: {},
        styles: {},
        preview: [],
        icons: [],
      });
    }

    const record = {
      n: item.name,
      i: item.id,
      q: sourceId,
      c: category,
      t: styles,
      p: item.path,
      v: variant,
      f: family,
      k: packId,
      z: packFileId,
      o: packs.get(packId).icons.length,
    };

    const existingSource = sourceCandidates.get(sourceId);
    if (sourceRank(record) > sourceRank(existingSource || {})) sourceCandidates.set(sourceId, record);

    const pack = packs.get(packId);
    pack.icons.push(record);
    pack.count++;
    pack.categories[category] = (pack.categories[category] || 0) + 1;
    for (const style of styles) pack.styles[style] = (pack.styles[style] || 0) + 1;

    familyTotals[family] = (familyTotals[family] || 0) + 1;
    categoryTotals[category] = (categoryTotals[category] || 0) + 1;
    for (const style of styles) styleTotals[style] = (styleTotals[style] || 0) + 1;
    totalIcons++;
  }
}

// Pass 2: resolve each derivative to one shared source preview. If no original source exists,
// use the derivative itself as a fallback. This keeps the site below the 1 GiB Pages limit.
const spriteGroups = new Map();
const searchShards = new Map();
for (const pack of packs.values()) {
  for (const record of pack.icons) {
    const source = sourceCandidates.get(record.q) || record;
    const sourcePackFileId = source.z;
    const sid = symbolId(source.i || `${source.k}:${source.n}`);
    record.s = sid;
    record.r = `data/sprites/${sourcePackFileId}.svg`;
    record.e = source.i === record.i; // exact preview vs source-geometry preview

    if (!spriteGroups.has(sourcePackFileId)) spriteGroups.set(sourcePackFileId, new Map());
    spriteGroups.get(sourcePackFileId).set(sid, source);

    if (pack.preview.length < 8) pack.preview.push(record);

    const shardKeys = new Set(words(record.n).map((token) => /^[a-z0-9]/.test(token) ? token[0] : '_'));
    if (!shardKeys.size) shardKeys.add('_');
    for (const shardKey of shardKeys) {
      if (!searchShards.has(shardKey)) searchShards.set(shardKey, []);
      searchShards.get(shardKey).push([record.n, pack.id, sid, record.c, record.t, record.p, record.v, record.r, record.e]);
    }
  }
}

const spriteEntries = [...spriteGroups.entries()];
for (let index = 0; index < spriteEntries.length; index++) {
  const [fileId, iconMap] = spriteEntries[index];
  const sources = [...iconMap.entries()];
  const symbols = await mapLimit(sources, concurrency, async ([sid, source]) => {
    try {
      const svg = await fs.readFile(source.p, 'utf8');
      return normalizeSvgForSymbol(svg, sid);
    } catch {
      return `<symbol id="${sid}" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none" stroke="currentColor"/><path d="M8 12h8" stroke="currentColor"/></symbol>`;
    }
  });
  await fs.writeFile(path.join(outRoot, 'data', 'sprites', `${fileId}.svg`), `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>`);
  console.log(`Pages sprite ${index + 1}/${spriteEntries.length}: ${fileId} (${sources.length} unique source icons)`);
}

const packRows = [...packs.values()].sort((a,b) => b.count-a.count || a.name.localeCompare(b.name));
for (const pack of packRows) {
  const packPath = path.join(outRoot, 'data', 'packs', `${pack.fileId}.json`);
  await fs.writeFile(packPath, JSON.stringify({
    id: pack.id,
    fileId: pack.fileId,
    family: pack.family,
    prefix: pack.prefix,
    name: pack.name,
    author: pack.author,
    license: pack.license,
    count: pack.count,
    categories: pack.categories,
    styles: pack.styles,
    icons: pack.icons.map(({ f,k,z,q,...record }) => record),
  }));
}

for (const [key, rows] of searchShards) {
  await fs.writeFile(path.join(outRoot, 'data', 'search', `${safeFilePart(key)}.json`), JSON.stringify(rows));
}

const catalogPacks = packRows.map((pack) => ({
  id: pack.id,
  fileId: pack.fileId,
  family: pack.family,
  prefix: pack.prefix,
  name: pack.name,
  author: pack.author,
  license: pack.license,
  count: pack.count,
  categories: pack.categories,
  styles: pack.styles,
  dominantCategory: Object.entries(pack.categories).sort((a,b) => b[1]-a[1])[0]?.[0] || 'misc',
  dominantStyles: Object.entries(pack.styles).sort((a,b) => b[1]-a[1]).slice(0,4).map(([name]) => name),
  preview: pack.preview.map(({ f,k,z,q,...record }) => record),
}));

await fs.writeFile(path.join(outRoot, 'data', 'catalog.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalIcons,
  uniquePreviewSources: [...spriteGroups.values()].reduce((sum, group) => sum + group.size, 0),
  packCount: catalogPacks.length,
  families: familyTotals,
  categories: categoryTotals,
  styles: styleTotals,
  packs: catalogPacks,
}));
await fs.writeFile(path.join(outRoot, 'data', 'taxonomy.json'), JSON.stringify(taxonomy));
await fs.writeFile(path.join(outRoot, '.nojekyll'), '');
console.log(`Pages data ready: ${totalIcons} logical icons, ${catalogPacks.length} packs, ${spriteGroups.size} sprite packs, ${searchShards.size} search shards.`);
