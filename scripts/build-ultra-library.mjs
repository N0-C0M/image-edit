// Adds 340k icons: 100k additional originals + 4 x 60k deterministic visual variants.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { parseIconSet, iconToSVG } from '@iconify/utils';

const sourceRoot = process.argv[2] || '.cache/iconify';
const extendedTarget = Number(process.argv[3] || '100000');
const perVariantTarget = Number(process.argv[4] || '60000');
const maxExtendedPerCollection = Number(process.env.MAX_EXTENDED_PER_COLLECTION || '4000');
const ioConcurrency = Math.max(16, Math.min(96, Number(process.env.ICON_IO_CONCURRENCY || Math.max(32, os.cpus().length * 4))));
const variantFamilies = ['neon', 'sticker', 'soft', 'glass'];

const collections = JSON.parse(await fs.readFile(path.join(sourceRoot, 'collections.json'), 'utf8'));

function safeName(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'icon';
}

function stableHash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function licenseText(meta) {
  const license = meta?.license;
  if (!license) return 'Unknown';
  if (typeof license === 'string') return license;
  return [license.title, license.spdx].filter(Boolean).join(' / ') || 'Unknown';
}

function allowed(meta) {
  const text = licenseText(meta);
  if (/noncommercial|\bNC\b|CC-BY-NC|BY-NC/i.test(text)) return false;
  return /(MIT|Apache|CC0|CC BY|CC-BY|BSD|ISC|Open Font|OFL|MPL|GPL)/i.test(text);
}

function sourceIdOf(item) {
  if (item.sourceId) return item.sourceId;
  const parts = String(item.id || '').split(':');
  return parts.length >= 2 ? parts.slice(-2).join(':') : `${item.prefix || 'unknown'}:${item.name || 'icon'}`;
}

function renderIconData(iconData) {
  const render = iconToSVG(iconData, { height: 'auto' });
  const attrs = { xmlns: 'http://www.w3.org/2000/svg', 'xmlns:xlink': 'http://www.w3.org/1999/xlink', ...render.attributes };
  return `<svg ${Object.entries(attrs).map(([k,v]) => `${k}="${v}"`).join(' ')}>${render.body}</svg>`;
}

function splitSvg(svg) {
  const open = svg.match(/<svg\b([^>]*)>/i);
  const attrsText = open?.[1] || '';
  const viewBox = attrsText.match(/viewBox=["']([^"']+)["']/i)?.[1] || '0 0 24 24';
  const nums = viewBox.trim().split(/\s+/).map(Number);
  const [x=0,y=0,w=24,h=24] = nums;
  const body = svg.replace(/^\s*<svg\b[^>]*>/i, '').replace(/<\/svg>\s*$/i, '');
  return { attrsText, viewBox, x, y, w, h, body };
}

function wrapSvg(attrsText, body) {
  const clean = attrsText.replace(/\s+xmlns(?::xlink)?=["'][^"']+["']/gi, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${clean}>${body}</svg>`;
}

function neonVariant(svg, id) {
  const p = splitSvg(svg);
  const fid = `neon-${stableHash(id).toString(36)}`;
  const blur = Math.max(.15, Math.max(p.w,p.h) * .025).toFixed(3);
  const body = `<defs><filter id="${fid}" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${blur}" result="b"/><feFlood flood-color="#79f7ff" flood-opacity=".9" result="c"/><feComposite in="c" in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#${fid})">${p.body}</g>`;
  return wrapSvg(p.attrsText, body);
}

function stickerVariant(svg, id) {
  const p = splitSvg(svg);
  const fid = `sticker-${stableHash(id).toString(36)}`;
  const radius = Math.max(.2, Math.max(p.w,p.h) * .035).toFixed(3);
  const body = `<defs><filter id="${fid}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="${radius}" result="d"/><feFlood flood-color="#ffffff" result="w"/><feComposite in="w" in2="d" operator="in" result="outline"/><feMerge><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#${fid})">${p.body}</g>`;
  return wrapSvg(p.attrsText, body);
}

function softVariant(svg, id) {
  const p = splitSvg(svg);
  const padX = p.w * .11, padY = p.h * .11;
  const rx = Math.max(p.w,p.h) * .18;
  const body = `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${rx.toFixed(3)}" fill="#8c9eff" opacity=".12"/><g transform="translate(${padX.toFixed(3)} ${padY.toFixed(3)}) scale(.78)">${p.body}</g>`;
  return wrapSvg(p.attrsText, body);
}

function glassVariant(svg, id) {
  const p = splitSvg(svg);
  const gid = `glass-${stableHash(id).toString(36)}`;
  const rx = Math.max(p.w,p.h) * .2;
  const padX = p.w * .12, padY = p.h * .12;
  const body = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".42"/><stop offset=".5" stop-color="#8fd3ff" stop-opacity=".17"/><stop offset="1" stop-color="#b7ff8b" stop-opacity=".12"/></linearGradient></defs><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${rx.toFixed(3)}" fill="url(#${gid})" stroke="#ffffff" stroke-opacity=".32" stroke-width="${Math.max(.08,Math.max(p.w,p.h)*.008).toFixed(3)}"/><g transform="translate(${padX.toFixed(3)} ${padY.toFixed(3)}) scale(.76)">${p.body}</g>`;
  return wrapSvg(p.attrsText, body);
}

const variantFns = { neon: neonVariant, sticker: stickerVariant, soft: softVariant, glass: glassVariant };

async function readJsonl(file) {
  try {
    const text = await fs.readFile(file, 'utf8');
    return text.split('\n').filter(Boolean).map((line) => JSON.parse(line));
  } catch { return []; }
}

async function writeJsonl(file, rows) {
  await fs.writeFile(file, rows.map((row) => JSON.stringify(row)).join('\n') + '\n');
}

async function mapLimit(items, limit, fn) {
  let cursor = 0;
  const out = new Array(items.length);
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      out[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({length: Math.min(limit, items.length)}, worker));
  return out;
}

// Existing original icons should not be exported again into extended.
const coreRows = await readJsonl('manifest.jsonl');
const beautifulRows = await readJsonl('manifest-beautiful.jsonl');
const usedOriginal = new Set([...coreRows, ...beautifulRows].map(sourceIdOf));

await fs.rm('library-extended', { recursive: true, force: true });
await fs.mkdir('library-extended', { recursive: true });
const extended = [];
const extendedSelected = {};

const collectionEntries = Object.entries(collections)
  .filter(([,meta]) => Number(meta.total || 0) > 0 && allowed(meta))
  .sort((a,b) => Number(b[1].total || 0) - Number(a[1].total || 0));

for (const [prefix, meta] of collectionEntries) {
  if (extended.length >= extendedTarget) break;
  let data;
  try { data = JSON.parse(await fs.readFile(path.join(sourceRoot, 'json', `${prefix}.json`), 'utf8')); }
  catch { continue; }
  const batch = [];
  parseIconSet(data, (name, iconData) => {
    if (!iconData || extended.length + batch.length >= extendedTarget || batch.length >= maxExtendedPerCollection) return;
    const sourceId = `${prefix}:${name}`;
    if (usedOriginal.has(sourceId)) return;
    usedOriginal.add(sourceId);
    const filename = `${safeName(name)}.svg`;
    batch.push({
      id: `extended:${sourceId}`,
      sourceId,
      prefix,
      name,
      collection: meta.name,
      category: meta.category ?? null,
      palette: meta.palette ?? null,
      author: meta.author ?? null,
      license: meta.license ?? null,
      family: 'extended',
      variant: 'original',
      path: path.posix.join('library-extended', prefix, filename),
      svg: renderIconData(iconData),
    });
  });
  if (!batch.length) continue;
  await fs.mkdir(path.join('library-extended', prefix), { recursive: true });
  await mapLimit(batch, ioConcurrency, (item) => fs.writeFile(item.path, item.svg));
  for (const item of batch) delete item.svg;
  extended.push(...batch);
  extendedSelected[prefix] = { ...meta, prefix, family: 'extended', variant: 'original', exported: batch.length };
  console.log(`extended ${prefix}: +${batch.length} (${extended.length}/${extendedTarget})`);
}

if (extended.length !== extendedTarget) throw new Error(`Extended library contains ${extended.length}; expected ${extendedTarget}`);
await writeJsonl('manifest-extended.jsonl', extended);
await fs.writeFile('collections-extended.json', JSON.stringify(extendedSelected, null, 2) + '\n');

// Build a diverse deterministic source pool for visual variants.
const sourceMap = new Map();
for (const row of [...coreRows, ...beautifulRows, ...extended]) {
  const sourceId = sourceIdOf(row);
  if (!sourceMap.has(sourceId)) sourceMap.set(sourceId, { ...row, sourceId });
}
const sourcePool = [...sourceMap.values()]
  .sort((a,b) => stableHash(a.sourceId) - stableHash(b.sourceId))
  .slice(0, perVariantTarget);
if (sourcePool.length !== perVariantTarget) throw new Error(`Only ${sourcePool.length} sources available for variants`);

for (const family of variantFamilies) {
  await fs.rm(`library-${family}`, { recursive: true, force: true });
  await fs.mkdir(`library-${family}`, { recursive: true });
}
const variantManifests = Object.fromEntries(variantFamilies.map((x) => [x, []]));

await mapLimit(sourcePool, ioConcurrency, async (source, index) => {
  const svg = await fs.readFile(source.path, 'utf8');
  const filename = path.basename(source.path);
  for (const family of variantFamilies) {
    const outDir = path.join(`library-${family}`, source.prefix);
    await fs.mkdir(outDir, { recursive: true });
    const outPath = path.posix.join(`library-${family}`, source.prefix, filename);
    await fs.writeFile(outPath, variantFns[family](svg, source.sourceId));
    variantManifests[family][index] = {
      id: `${family}:${source.sourceId}`,
      sourceId: source.sourceId,
      sourcePath: source.path,
      prefix: source.prefix,
      name: source.name,
      collection: source.collection,
      category: source.category ?? null,
      palette: source.palette ?? null,
      author: source.author ?? null,
      license: source.license ?? null,
      family,
      variant: `generated-${family}`,
      path: outPath,
    };
  }
  if ((index + 1) % 5000 === 0) console.log(`variants ${index + 1}/${perVariantTarget}`);
});

for (const family of variantFamilies) await writeJsonl(`manifest-${family}.jsonl`, variantManifests[family]);

async function countManifest(file) { return (await readJsonl(file)).length; }
const counts = {
  core: await countManifest('manifest.jsonl'),
  handdrawn: await countManifest('manifest-handdrawn.jsonl'),
  beautiful: await countManifest('manifest-beautiful.jsonl'),
  extended: extended.length,
  neon: variantManifests.neon.length,
  sticker: variantManifests.sticker.length,
  soft: variantManifests.soft.length,
  glass: variantManifests.glass.length,
};
const total = Object.values(counts).reduce((a,b) => a+b, 0);

const statsRows = Object.entries(counts).map(([name,count]) => `| ${name} | ${count} |`).join('\n');
await fs.writeFile('ICON_LIBRARY_STATS.md', `# Icon Library Stats\n\n- Total SVG icons: **${total}**\n- Additional originals in extended: **${extended.length}**\n- New generated style variants: **${perVariantTarget * variantFamilies.length}**\n- Source originals retain author/license metadata. Generated variants retain sourceId/sourcePath provenance.\n\n| Family | Icons |\n|---|---:|\n${statsRows}\n\nSee [ICON_MAP.md](ICON_MAP.md), \`catalog/taxonomy.json\` and generated classification indexes for navigation.\n`);

let iconMap = {};
try { iconMap = JSON.parse(await fs.readFile('catalog/icon-map.json','utf8')); } catch {}
iconMap.generatedAt = new Date().toISOString();
iconMap.total = total;
iconMap.families ||= {};
for (const [family,count] of Object.entries(counts)) {
  iconMap.families[family] = {
    ...(iconMap.families[family] || {}),
    count,
    root: family === 'core' ? 'library/' : `library-${family}/`,
    manifest: family === 'core' ? 'manifest.jsonl' : `manifest-${family}.jsonl`,
  };
}
await fs.writeFile('catalog/icon-map.json', JSON.stringify(iconMap, null, 2) + '\n');

const notices = Object.entries(extendedSelected).map(([prefix,meta]) => `- **${meta.name || prefix}** (${prefix}) — ${licenseText(meta)}; ${meta.exported} additional originals`).join('\n');
await fs.writeFile('EXTENDED_LICENSES.md', `# Extended library provenance\n\nThe extended family contains additional original icons selected from open/free licensed collections. The neon/sticker/soft/glass families are deterministic visual derivatives of icons already present in the repository and preserve the original metadata in their manifests.\n\n${notices}\n`);

console.log(`Done. Added ${extended.length + perVariantTarget * variantFamilies.length} icons. Repository total: ${total}.`);
