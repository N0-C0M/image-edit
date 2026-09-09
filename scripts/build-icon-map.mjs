import fs from 'node:fs/promises';

const packsData = JSON.parse(await fs.readFile('catalog/packs.json', 'utf8'));
const categoriesData = JSON.parse(await fs.readFile('catalog/categories.json', 'utf8'));
const stylesData = JSON.parse(await fs.readFile('catalog/styles.json', 'utf8'));

const packs = packsData.packs || [];
const families = {};
for (const pack of packs) {
  families[pack.family] ||= { icons: 0, packs: 0 };
  families[pack.family].icons += pack.count || 0;
  families[pack.family].packs++;
}

function tableRows(rows) {
  return rows.map((cells) => `| ${cells.map((x) => String(x ?? '').replace(/\|/g, '\\|')).join(' | ')} |`).join('\n');
}

const familyRows = Object.entries(families)
  .sort((a,b) => b[1].icons-a[1].icons)
  .map(([family,meta]) => [family, meta.icons, meta.packs, family === 'core' ? 'library/' : `library-${family}/`, family === 'core' ? 'manifest.jsonl' : `manifest-${family}.jsonl`]);

const categoryRows = Object.entries(categoriesData.totals || {})
  .filter(([,count]) => count > 0)
  .sort((a,b) => b[1]-a[1])
  .map(([name,count]) => [name,count,(categoriesData.packs?.[name] || []).slice(0,5).map((x) => x.pack).join(', ')]);

const styleRows = Object.entries(stylesData.totals || {})
  .filter(([,count]) => count > 0)
  .sort((a,b) => b[1]-a[1])
  .map(([name,count]) => [name,count,(stylesData.packs?.[name] || []).slice(0,5).map((x) => x.pack).join(', ')]);

const packRows = packs
  .slice()
  .sort((a,b) => b.count-a.count || a.name.localeCompare(b.name))
  .map((pack) => [pack.family, pack.prefix, pack.name, pack.count, pack.dominantCategory, (pack.dominantStyles || []).join(', '), typeof pack.license === 'object' ? (pack.license.spdx || pack.license.title || '') : (pack.license || '')]);

const total = packs.reduce((sum,pack) => sum + Number(pack.count || 0), 0);
const markdown = `# Icon Map\n\nУдобная карта локальной библиотеки. Она генерируется автоматически из manifests и semantic taxonomy.\n\n- **Icons:** ${total}\n- **Families:** ${Object.keys(families).length}\n- **Packs:** ${packs.length}\n- Машинный каталог: \`catalog/packs.json\`\n- Категории: \`catalog/categories.json\`\n- Стили: \`catalog/styles.json\`\n- Taxonomy rules: \`catalog/taxonomy.json\`\n- Поиск: \`node scripts/search-icons.mjs <query>\`\n\n## Families\n\n| Family | Icons | Packs | Root | Manifest |\n|---|---:|---:|---|---|\n${tableRows(familyRows)}\n\n## Semantic categories\n\n| Category | Icons | Top packs |\n|---|---:|---|\n${tableRows(categoryRows)}\n\n## Visual styles\n\n| Style | Icons | Top packs |\n|---|---:|---|\n${tableRows(styleRows)}\n\n## Packs\n\n| Family | Prefix | Pack | Icons | Dominant category | Styles | License |\n|---|---|---|---:|---|---|---|\n${tableRows(packRows)}\n\n## AI routing\n\n1. Определи semantic category.\n2. Выбери family под визуальный язык проекта.\n3. Выбери pack, не смешивая соседние controls из разных наборов без причины.\n4. Выполни поиск по имени/синонимам.\n5. Открой 2–5 кандидатов и выбери по семантике и optical weight.\n6. Проверь license metadata и accessibility.\n\n## Web explorer\n\nGitHub Pages собирается workflow \`.github/workflows/deploy-pages.yml\`. Сайт использует pack indexes, search shards и SVG sprites вместо загрузки сотен тысяч отдельных файлов.\n`;

await fs.writeFile('ICON_MAP.md', markdown);
console.log(`ICON_MAP.md rebuilt for ${total} icons / ${packs.length} packs.`);
