import fs from 'node:fs/promises';

export async function loadTaxonomy(file = 'catalog/taxonomy.json') {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

export function words(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function familyFromManifest(file) {
  if (file === 'manifest.jsonl') return 'core';
  return file.replace(/^manifest-/, '').replace(/\.jsonl$/, '');
}

export function createClassifier(taxonomy) {
  const categoryRules = Object.entries(taxonomy.categories)
    .filter(([name]) => name !== 'misc')
    .map(([name, terms]) => [name, new Set(terms.flatMap(words))]);

  const styleRules = Object.entries(taxonomy.styles)
    .map(([name, terms]) => [name, new Set(terms.flatMap(words))]);

  return function classifyIcon(item, family) {
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

    const haystack = `${family} ${item.variant || ''} ${item.collection || ''} ${item.category || ''}`.toLowerCase();
    if (/handdrawn|freehand/.test(haystack) && !styles.includes('handdrawn')) styles.push('handdrawn');
    if (/neon|glow/.test(haystack) && !styles.includes('neon')) styles.push('neon');
    if (/sticker/.test(haystack) && !styles.includes('sticker')) styles.push('sticker');
    if (/glass/.test(haystack) && !styles.includes('glass')) styles.push('glass');
    if (/soft|rounded|plump/.test(haystack) && !styles.includes('rounded')) styles.push('rounded');
    if (item.palette === true && !styles.includes('color')) styles.push('color');
    if (/emoji/.test(haystack) && !styles.includes('color')) styles.push('color');
    if (/brand|logo/.test(haystack) && !styles.includes('brand')) styles.push('brand');
    if (/game|rpg/.test(haystack) && !styles.includes('game')) styles.push('game');
    if (!styles.length) styles.push('standard');

    return { category, styles: [...new Set(styles)].sort() };
  };
}

export function compactLicense(license) {
  if (!license) return 'Unknown';
  if (typeof license === 'string') return license;
  return license.spdx || license.title || 'Unknown';
}

export function safeFilePart(value) {
  return String(value || 'unknown').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}
