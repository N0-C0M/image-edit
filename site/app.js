const $ = (selector) => document.querySelector(selector);
const els = {
  headerStats: $('#headerStats'),
  globalSearch: $('#globalSearch'),
  quickChips: $('#quickChips'),
  familyFilters: $('#familyFilters'),
  categoryFilters: $('#categoryFilters'),
  styleFilters: $('#styleFilters'),
  packSearch: $('#packSearch'),
  sortSelect: $('#sortSelect'),
  packGrid: $('#packGrid'),
  iconGrid: $('#iconGrid'),
  loadMore: $('#loadMore'),
  sectionKicker: $('#sectionKicker'),
  sectionTitle: $('#sectionTitle'),
  notice: $('#notice'),
  themeButton: $('#themeButton'),
  iconDialog: $('#iconDialog'),
  dialogClose: $('#dialogClose'),
  dialogPreview: $('#dialogPreview'),
  dialogFamily: $('#dialogFamily'),
  dialogName: $('#dialogName'),
  dialogTags: $('#dialogTags'),
  dialogMeta: $('#dialogMeta'),
  copyPath: $('#copyPath'),
  copyId: $('#copyId'),
  packCardTemplate: $('#packCardTemplate'),
  iconCardTemplate: $('#iconCardTemplate'),
};

const state = {
  catalog: null,
  packById: new Map(),
  family: 'all',
  category: 'all',
  style: 'all',
  packQuery: '',
  sort: 'count',
  activePack: null,
  activeIcons: [],
  visibleIcons: 120,
  activeDialogIcon: null,
  searchToken: 0,
};

const nf = new Intl.NumberFormat('ru-RU');
const QUICK = ['security', 'calendar', 'game', 'download', 'user', 'wallet', 'camera', 'code'];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}

function svgUse(sprite, symbol, className = '') {
  return `<svg class="${className}" aria-hidden="true" focusable="false"><use href="./${sprite}#${symbol}"></use></svg>`;
}

function setNotice(text = '') {
  els.notice.textContent = text;
  els.notice.classList.toggle('hidden', !text);
}

function dominantEntries(object, limit = 3) {
  return Object.entries(object || {}).sort((a,b) => b[1]-a[1]).slice(0, limit).map(([key]) => key);
}

function filterButton(label, value, count, active, onClick) {
  const button = document.createElement('button');
  button.className = `filter-button${active ? ' active' : ''}`;
  button.type = 'button';
  button.innerHTML = `<span>${escapeHtml(label)}</span><span>${nf.format(count || 0)}</span>`;
  button.addEventListener('click', onClick);
  return button;
}

function renderFilters() {
  const c = state.catalog;
  els.familyFilters.replaceChildren();
  els.familyFilters.append(filterButton('Все', 'all', c.totalIcons, state.family === 'all', () => { state.family='all'; renderFilters(); renderPacks(); }));
  for (const [family, count] of Object.entries(c.families).sort((a,b) => b[1]-a[1])) {
    els.familyFilters.append(filterButton(family, family, count, state.family === family, () => { state.family=family; renderFilters(); renderPacks(); }));
  }

  els.categoryFilters.replaceChildren();
  els.categoryFilters.append(filterButton('Все', 'all', c.totalIcons, state.category === 'all', () => { state.category='all'; renderFilters(); renderPacks(); }));
  for (const [category, count] of Object.entries(c.categories).sort((a,b) => b[1]-a[1])) {
    if (!count) continue;
    els.categoryFilters.append(filterButton(category, category, count, state.category === category, () => { state.category=category; renderFilters(); renderPacks(); }));
  }

  els.styleFilters.replaceChildren();
  els.styleFilters.append(filterButton('Все', 'all', c.totalIcons, state.style === 'all', () => { state.style='all'; renderFilters(); renderPacks(); }));
  for (const [style, count] of Object.entries(c.styles).sort((a,b) => b[1]-a[1])) {
    if (!count) continue;
    els.styleFilters.append(filterButton(style, style, count, state.style === style, () => { state.style=style; renderFilters(); renderPacks(); }));
  }
}

function filteredPacks() {
  let rows = state.catalog.packs.filter((pack) => {
    if (state.family !== 'all' && pack.family !== state.family) return false;
    if (state.category !== 'all' && !pack.categories?.[state.category]) return false;
    if (state.style !== 'all' && !pack.styles?.[state.style]) return false;
    if (state.packQuery) {
      const hay = `${pack.name} ${pack.prefix} ${pack.family}`.toLowerCase();
      if (!hay.includes(state.packQuery)) return false;
    }
    return true;
  });
  if (state.sort === 'name') rows.sort((a,b) => a.name.localeCompare(b.name));
  else if (state.sort === 'family') rows.sort((a,b) => a.family.localeCompare(b.family) || b.count-a.count);
  else rows.sort((a,b) => b.count-a.count || a.name.localeCompare(b.name));
  return rows;
}

function renderPacks() {
  state.activePack = null;
  state.activeIcons = [];
  els.iconGrid.classList.add('hidden');
  els.loadMore.classList.add('hidden');
  els.packGrid.classList.remove('hidden');
  els.sectionKicker.textContent = 'PACKS';
  const rows = filteredPacks();
  els.sectionTitle.textContent = `${nf.format(rows.length)} паков`;
  els.packGrid.replaceChildren();
  setNotice(rows.length ? '' : 'Ничего не найдено. Попробуй убрать часть фильтров.');

  const fragment = document.createDocumentFragment();
  for (const pack of rows) {
    const card = els.packCardTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector('.pack-family').textContent = pack.family;
    card.querySelector('.pack-count').textContent = nf.format(pack.count);
    card.querySelector('.pack-name').textContent = pack.name;
    const preview = card.querySelector('.pack-preview');
    for (const icon of pack.preview.slice(0,8)) {
      const tile = document.createElement('span');
      tile.className = 'preview-tile';
      tile.innerHTML = svgUse(pack.sprite, icon.s);
      preview.append(tile);
    }
    const tags = card.querySelector('.pack-tags');
    for (const tag of [...new Set([pack.dominantCategory, ...pack.dominantStyles])].slice(0,4)) {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag;
      tags.append(span);
    }
    card.addEventListener('click', () => openPack(pack));
    fragment.append(card);
  }
  els.packGrid.append(fragment);
}

async function openPack(pack) {
  setNotice('Загружаю индекс пака…');
  const response = await fetch(`./data/packs/${pack.fileId}.json`);
  if (!response.ok) {
    setNotice('Не удалось загрузить pack index.');
    return;
  }
  state.activePack = await response.json();
  state.activeIcons = state.activePack.icons;
  state.visibleIcons = 120;
  els.packGrid.classList.add('hidden');
  els.iconGrid.classList.remove('hidden');
  els.sectionKicker.textContent = `${state.activePack.family} / ${state.activePack.prefix}`.toUpperCase();
  els.sectionTitle.textContent = `${state.activePack.name} · ${nf.format(state.activePack.count)}`;
  setNotice('');
  renderIcons();
  history.replaceState(null, '', `?pack=${encodeURIComponent(pack.id)}`);
}

function iconModelFromPack(record, pack = state.activePack) {
  return {
    name: record.n,
    id: record.i,
    symbol: record.s,
    category: record.c,
    styles: record.t || [],
    path: record.p,
    variant: record.v,
    family: pack.family,
    prefix: pack.prefix,
    packName: pack.name,
    packId: pack.id,
    sprite: pack.sprite,
    license: pack.license,
    author: pack.author,
  };
}

function iconModelFromSearch(record) {
  const [name, packId, symbol, category, styles, iconPath, variant] = record;
  const pack = state.packById.get(packId);
  return {
    name, id: `${packId}:${name}`, symbol, category, styles: styles || [], path: iconPath, variant,
    family: pack?.family || packId.split(':')[0], prefix: pack?.prefix || packId.split(':')[1], packName: pack?.name || packId,
    packId, sprite: pack?.sprite, license: pack?.license, author: pack?.author,
  };
}

function renderIconCard(icon, fragment) {
  const card = els.iconCardTemplate.content.firstElementChild.cloneNode(true);
  card.querySelector('.icon-preview').innerHTML = svgUse(icon.sprite, icon.symbol, `variant-${icon.variant || 'original'}`);
  card.querySelector('.icon-name').textContent = icon.name;
  card.querySelector('.icon-pack').textContent = `${icon.family} · ${icon.packName}`;
  card.addEventListener('click', () => openIcon(icon));
  fragment.append(card);
}

function renderIcons() {
  els.iconGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  const visible = state.activeIcons.slice(0, state.visibleIcons);
  for (const record of visible) renderIconCard(iconModelFromPack(record), fragment);
  els.iconGrid.append(fragment);
  els.loadMore.classList.toggle('hidden', state.visibleIcons >= state.activeIcons.length);
}

function openIcon(icon) {
  state.activeDialogIcon = icon;
  els.dialogPreview.innerHTML = svgUse(icon.sprite, icon.symbol, `variant-${icon.variant || 'original'}`);
  els.dialogFamily.textContent = `${icon.family} / ${icon.prefix}`;
  els.dialogName.textContent = icon.name;
  els.dialogTags.replaceChildren();
  for (const tag of [icon.category, ...(icon.styles || []), icon.variant].filter(Boolean)) {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = tag;
    els.dialogTags.append(span);
  }
  const rows = [
    ['Pack', icon.packName], ['ID', icon.id], ['Path', icon.path], ['License', icon.license || 'Unknown'], ['Author', typeof icon.author === 'object' ? (icon.author.name || 'See metadata') : (icon.author || 'Unknown')],
  ];
  els.dialogMeta.innerHTML = rows.map(([k,v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('');
  els.iconDialog.showModal();
}

async function copyText(text, button) {
  await navigator.clipboard.writeText(text || '');
  const old = button.textContent;
  button.textContent = 'Скопировано';
  setTimeout(() => button.textContent = old, 1000);
}

function shardKey(query) {
  const match = query.toLowerCase().match(/[a-z0-9]/);
  return match ? match[0] : '_';
}

async function globalSearch(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    renderPacks();
    return;
  }
  const token = ++state.searchToken;
  els.packGrid.classList.add('hidden');
  els.iconGrid.classList.remove('hidden');
  els.loadMore.classList.add('hidden');
  els.sectionKicker.textContent = 'GLOBAL SEARCH';
  els.sectionTitle.textContent = `«${query.trim()}»`;
  setNotice('Ищу по индексу…');
  const response = await fetch(`./data/search/${shardKey(normalized)}.json`);
  if (token !== state.searchToken) return;
  if (!response.ok) {
    state.activeIcons = [];
    els.iconGrid.replaceChildren();
    setNotice('Для этого запроса нет поискового shard.');
    return;
  }
  const rows = await response.json();
  const terms = normalized.split(/\s+/).filter(Boolean);
  const seen = new Set();
  const matches = [];
  for (const row of rows) {
    const name = String(row[0] || '').toLowerCase();
    if (!terms.every((term) => name.includes(term))) continue;
    const key = `${row[1]}:${row[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    matches.push(row);
    if (matches.length >= 600) break;
  }
  if (token !== state.searchToken) return;
  els.iconGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (const row of matches) renderIconCard(iconModelFromSearch(row), fragment);
  els.iconGrid.append(fragment);
  setNotice(matches.length ? `${nf.format(matches.length)} результатов${matches.length === 600 ? ' — показаны первые 600' : ''}.` : 'Совпадений нет. Попробуй английский синоним или более короткий запрос.');
}

function initQuickChips() {
  for (const word of QUICK) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = word;
    button.addEventListener('click', () => { els.globalSearch.value = word; globalSearch(word); });
    els.quickChips.append(button);
  }
}

function restoreTheme() {
  const saved = localStorage.getItem('icon-atlas-theme');
  if (saved) document.documentElement.dataset.theme = saved;
}

async function init() {
  restoreTheme();
  initQuickChips();
  const response = await fetch('./data/catalog.json');
  if (!response.ok) throw new Error('catalog.json unavailable');
  state.catalog = await response.json();
  state.packById = new Map(state.catalog.packs.map((pack) => [pack.id, pack]));
  els.headerStats.textContent = `${nf.format(state.catalog.totalIcons)} icons · ${nf.format(state.catalog.packCount)} packs`;
  renderFilters();
  renderPacks();

  const packParam = new URLSearchParams(location.search).get('pack');
  if (packParam && state.packById.has(packParam)) openPack(state.packById.get(packParam));
}

let searchTimer;
els.globalSearch.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => globalSearch(els.globalSearch.value), 160);
});
els.packSearch.addEventListener('input', () => { state.packQuery = els.packSearch.value.trim().toLowerCase(); renderPacks(); });
els.sortSelect.addEventListener('change', () => { state.sort = els.sortSelect.value; renderPacks(); });
els.loadMore.addEventListener('click', () => { state.visibleIcons += 120; renderIcons(); });
els.dialogClose.addEventListener('click', () => els.iconDialog.close());
els.copyPath.addEventListener('click', () => copyText(state.activeDialogIcon?.path, els.copyPath));
els.copyId.addEventListener('click', () => copyText(state.activeDialogIcon?.id, els.copyId));
els.themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('icon-atlas-theme', next);
});
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
    event.preventDefault();
    els.globalSearch.focus();
  }
  if (event.key === 'Escape' && els.iconDialog.open) els.iconDialog.close();
});

init().catch((error) => {
  console.error(error);
  setNotice('Каталог ещё не собран или GitHub Pages workflow не завершён.');
  els.headerStats.textContent = 'catalog unavailable';
});
