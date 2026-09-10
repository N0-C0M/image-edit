const $ = (selector) => document.querySelector(selector);
const els = {
  headerStats: $('#headerStats'), globalSearch: $('#globalSearch'), quickChips: $('#quickChips'),
  familyFilters: $('#familyFilters'), categoryFilters: $('#categoryFilters'), styleFilters: $('#styleFilters'),
  packSearch: $('#packSearch'), sortSelect: $('#sortSelect'), packGrid: $('#packGrid'), iconGrid: $('#iconGrid'),
  loadMore: $('#loadMore'), sectionKicker: $('#sectionKicker'), sectionTitle: $('#sectionTitle'), notice: $('#notice'),
  themeButton: $('#themeButton'), iconDialog: $('#iconDialog'), dialogClose: $('#dialogClose'),
  dialogPreview: $('#dialogPreview'), dialogFamily: $('#dialogFamily'), dialogName: $('#dialogName'),
  dialogTags: $('#dialogTags'), dialogMeta: $('#dialogMeta'), copyPath: $('#copyPath'), copyId: $('#copyId'),
  favoriteIcon: $('#favoriteIcon'), favoritesToggle: $('#favoritesToggle'), favoritesCount: $('#favoritesCount'),
  packCardTemplate: $('#packCardTemplate'), iconCardTemplate: $('#iconCardTemplate'),
};

const state = {
  catalog: null,
  aliases: {},
  packById: new Map(),
  shardCache: new Map(),
  family: 'all',
  category: 'all',
  style: 'all',
  packQuery: '',
  searchQuery: '',
  sort: 'count',
  activePack: null,
  activeIcons: [],
  visibleIcons: 120,
  activeDialogIcon: null,
  searchToken: 0,
  favoritesOnly: false,
  favorites: new Map(),
};

const nf = new Intl.NumberFormat('ru-RU');
const QUICK = ['security','calendar','game','download','user','wallet','camera','code'];
const FAVORITES_KEY = 'aero-icon-atlas-favorites-v1';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}

function variantClass(variant) {
  return `variant-${String(variant || 'original').replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
}

function svgUse(sprite, symbol, variant = 'original', exact = true) {
  if (!sprite || !symbol) return '<span class="missing-preview">?</span>';
  const cls = `${variantClass(variant)}${exact ? '' : ' source-preview'}`;
  return `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="./${sprite}#${symbol}"></use></svg>`;
}

function setNotice(text = '') {
  els.notice.textContent = text;
  els.notice.classList.toggle('hidden', !text);
}

function favoriteKey(icon) {
  return icon?.id || `${icon?.packId || ''}:${icon?.name || ''}`;
}

function isFavorite(icon) {
  return state.favorites.has(favoriteKey(icon));
}

function serializeFavorite(icon) {
  return {
    name: icon.name, id: icon.id, symbol: icon.symbol, category: icon.category, styles: icon.styles || [], path: icon.path,
    variant: icon.variant, exact: icon.exact, sprite: icon.sprite, family: icon.family, prefix: icon.prefix,
    packName: icon.packName, packId: icon.packId, license: icon.license, author: icon.author,
  };
}

function loadFavorites() {
  try {
    const rows = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    state.favorites = new Map(Array.isArray(rows) ? rows.map((icon) => [favoriteKey(icon), icon]) : []);
  } catch {
    state.favorites = new Map();
  }
  updateFavoritesUi();
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...state.favorites.values()]));
  updateFavoritesUi();
}

function updateFavoritesUi() {
  if (els.favoritesCount) els.favoritesCount.textContent = nf.format(state.favorites.size);
  if (els.favoritesToggle) els.favoritesToggle.setAttribute('aria-pressed', String(state.favoritesOnly));
  if (els.favoriteIcon && state.activeDialogIcon) {
    const active = isFavorite(state.activeDialogIcon);
    els.favoriteIcon.classList.toggle('is-favorite', active);
    els.favoriteIcon.textContent = active ? '★ В избранном' : '☆ В избранное';
  }
}

function toggleFavorite(icon) {
  const key = favoriteKey(icon);
  if (!key) return;
  if (state.favorites.has(key)) state.favorites.delete(key);
  else state.favorites.set(key, serializeFavorite(icon));
  saveFavorites();
  if (state.activePack) renderIcons();
  else if (state.favoritesOnly) renderFavoriteIcons();
}

function syncUrl({ pack = state.activePack?.id || null, icon = state.activeDialogIcon?.id || null } = {}) {
  const url = new URL(location.href);
  const set = (key, value, fallback = null) => {
    if (value && value !== fallback) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  };
  set('q', state.searchQuery);
  set('family', state.family, 'all');
  set('category', state.category, 'all');
  set('style', state.style, 'all');
  set('pack', pack);
  set('icon', icon);
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

function clearPackAndIconUrl() {
  state.activeDialogIcon = null;
  syncUrl({ pack: null, icon: null });
}

function filterButton(label, count, active, onClick) {
  const button = document.createElement('button');
  button.className = `filter-button${active ? ' active' : ''}`;
  button.type = 'button';
  button.innerHTML = `<span>${escapeHtml(label)}</span><span>${nf.format(count || 0)}</span>`;
  button.addEventListener('click', onClick);
  return button;
}

function refreshCurrentView() {
  state.favoritesOnly = false;
  updateFavoritesUi();
  renderFilters();
  if (state.searchQuery) globalSearch(state.searchQuery, { updateUrl: true });
  else renderPacks({ updateUrl: true });
}

function renderFilters() {
  const c = state.catalog;
  const selectFamily = (value) => { state.family = value; refreshCurrentView(); };
  const selectCategory = (value) => { state.category = value; refreshCurrentView(); };
  const selectStyle = (value) => { state.style = value; refreshCurrentView(); };

  els.familyFilters.replaceChildren();
  els.familyFilters.append(filterButton('Все', c.totalIcons, state.family === 'all', () => selectFamily('all')));
  for (const [family, count] of Object.entries(c.families).sort((a,b) => b[1] - a[1])) {
    els.familyFilters.append(filterButton(family, count, state.family === family, () => selectFamily(family)));
  }

  els.categoryFilters.replaceChildren();
  els.categoryFilters.append(filterButton('Все', c.totalIcons, state.category === 'all', () => selectCategory('all')));
  for (const [category, count] of Object.entries(c.categories).sort((a,b) => b[1] - a[1])) {
    if (!count) continue;
    els.categoryFilters.append(filterButton(category, count, state.category === category, () => selectCategory(category)));
  }

  els.styleFilters.replaceChildren();
  els.styleFilters.append(filterButton('Все', c.totalIcons, state.style === 'all', () => selectStyle('all')));
  for (const [style, count] of Object.entries(c.styles).sort((a,b) => b[1] - a[1])) {
    if (!count) continue;
    els.styleFilters.append(filterButton(style, count, state.style === style, () => selectStyle(style)));
  }
}

function filteredPacks() {
  const q = state.packQuery;
  const rows = state.catalog.packs.filter((pack) => {
    if (state.family !== 'all' && pack.family !== state.family) return false;
    if (state.category !== 'all' && !pack.categories?.[state.category]) return false;
    if (state.style !== 'all' && !pack.styles?.[state.style]) return false;
    if (q && !`${pack.name} ${pack.prefix} ${pack.family}`.toLowerCase().includes(q)) return false;
    return true;
  });
  if (state.sort === 'name') rows.sort((a,b) => a.name.localeCompare(b.name));
  else if (state.sort === 'family') rows.sort((a,b) => a.family.localeCompare(b.family) || b.count - a.count);
  else rows.sort((a,b) => b.count - a.count || a.name.localeCompare(b.name));
  return rows;
}

function renderPacks({ updateUrl = false } = {}) {
  state.searchQuery = '';
  state.activePack = null;
  state.activeIcons = [];
  state.activeDialogIcon = null;
  els.globalSearch.value = '';
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
    for (const icon of pack.preview.slice(0, 8)) {
      const tile = document.createElement('span');
      tile.className = 'preview-tile';
      tile.innerHTML = svgUse(icon.r, icon.s, icon.v, icon.e);
      preview.append(tile);
    }
    const tags = card.querySelector('.pack-tags');
    for (const tag of [...new Set([pack.dominantCategory, ...pack.dominantStyles])].slice(0, 4)) {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag;
      tags.append(span);
    }
    card.addEventListener('click', () => openPack(pack, { updateUrl: true }));
    fragment.append(card);
  }
  els.packGrid.append(fragment);
  if (updateUrl) syncUrl({ pack: null, icon: null });
}

async function openPack(pack, { updateUrl = true, iconId = null } = {}) {
  state.favoritesOnly = false;
  state.searchQuery = '';
  els.globalSearch.value = '';
  updateFavoritesUi();
  setNotice('Загружаю индекс пака…');
  const response = await fetch(`./data/packs/${pack.fileId}.json`);
  if (!response.ok) {
    setNotice('Не удалось загрузить pack index.');
    return;
  }
  state.activePack = await response.json();
  state.activeIcons = state.activePack.icons;
  state.visibleIcons = 120;
  state.activeDialogIcon = null;
  els.packGrid.classList.add('hidden');
  els.iconGrid.classList.remove('hidden');
  els.sectionKicker.textContent = `${state.activePack.family} / ${state.activePack.prefix}`.toUpperCase();
  els.sectionTitle.textContent = `${state.activePack.name} · ${nf.format(state.activePack.count)}`;
  setNotice('');
  renderIcons();
  if (updateUrl) syncUrl({ pack: pack.id, icon: null });

  if (iconId) {
    const record = state.activePack.icons.find((item) => item.i === iconId || item.n === iconId);
    if (record) openIcon(iconModelFromPack(record), { updateUrl: true });
  }
}

function iconModelFromPack(record, pack = state.activePack) {
  return {
    name: record.n, id: record.i, symbol: record.s, category: record.c, styles: record.t || [], path: record.p,
    variant: record.v, exact: record.e, sprite: record.r, family: pack.family, prefix: pack.prefix,
    packName: pack.name, packId: pack.id, license: pack.license, author: pack.author,
  };
}

function iconModelFromSearch(record) {
  const [name, packId, symbol, category, styles, iconPath, variant, sprite, exact] = record;
  const pack = state.packById.get(packId);
  return {
    name, id: `${packId}:${name}`, symbol, category, styles: styles || [], path: iconPath, variant, exact, sprite,
    family: pack?.family || packId.split(':')[0], prefix: pack?.prefix || packId.split(':')[1],
    packName: pack?.name || packId, packId, license: pack?.license, author: pack?.author,
  };
}

function renderIconCard(icon, fragment) {
  const card = els.iconCardTemplate.content.firstElementChild.cloneNode(true);
  card.classList.toggle('is-favorite', isFavorite(icon));
  card.querySelector('.icon-preview').innerHTML = svgUse(icon.sprite, icon.symbol, icon.variant, icon.exact);
  card.querySelector('.icon-name').textContent = icon.name;
  card.querySelector('.icon-pack').textContent = `${icon.family} · ${icon.packName}`;
  if (!icon.exact) card.title = 'Preview uses shared source geometry; repository SVG contains the exact generated variant.';
  card.addEventListener('click', () => openIcon(icon, { updateUrl: true }));
  fragment.append(card);
}

function renderIcons() {
  els.iconGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (const record of state.activeIcons.slice(0, state.visibleIcons)) renderIconCard(iconModelFromPack(record), fragment);
  els.iconGrid.append(fragment);
  els.loadMore.classList.toggle('hidden', state.visibleIcons >= state.activeIcons.length);
}

function renderFavoriteIcons() {
  state.activePack = null;
  state.searchQuery = '';
  state.favoritesOnly = true;
  state.activeDialogIcon = null;
  els.globalSearch.value = '';
  updateFavoritesUi();
  els.packGrid.classList.add('hidden');
  els.iconGrid.classList.remove('hidden');
  els.loadMore.classList.add('hidden');
  els.sectionKicker.textContent = 'FAVORITES';
  els.sectionTitle.textContent = `Избранное · ${nf.format(state.favorites.size)}`;
  els.iconGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (const icon of state.favorites.values()) renderIconCard(icon, fragment);
  els.iconGrid.append(fragment);
  setNotice(state.favorites.size ? 'Избранное хранится только в этом браузере.' : 'Пока ничего не сохранено. Открой иконку и нажми «В избранное».');
  syncUrl({ pack: null, icon: null });
}

function openIcon(icon, { updateUrl = true } = {}) {
  state.activeDialogIcon = icon;
  els.dialogPreview.innerHTML = svgUse(icon.sprite, icon.symbol, icon.variant, icon.exact);
  els.dialogFamily.textContent = `${icon.family} / ${icon.prefix}`;
  els.dialogName.textContent = icon.name;
  els.dialogTags.replaceChildren();
  for (const tag of [icon.category, ...(icon.styles || []), icon.variant, !icon.exact ? 'source-preview' : null].filter(Boolean)) {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = tag;
    els.dialogTags.append(span);
  }
  const rows = [
    ['Pack', icon.packName], ['ID', icon.id], ['Path', icon.path],
    ['Preview', icon.exact ? 'exact SVG' : 'shared source geometry + style preview'],
    ['License', icon.license || 'Unknown'],
    ['Author', typeof icon.author === 'object' ? (icon.author.name || 'See metadata') : (icon.author || 'Unknown')],
  ];
  els.dialogMeta.innerHTML = rows.map(([k,v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('');
  updateFavoritesUi();
  els.iconDialog.showModal();
  if (updateUrl) syncUrl({ pack: icon.packId || state.activePack?.id || null, icon: icon.id });
}

async function copyText(text, button) {
  await navigator.clipboard.writeText(text || '');
  const old = button.textContent;
  button.textContent = 'Скопировано';
  setTimeout(() => { button.textContent = old; }, 1000);
}

function shardKey(query) {
  const match = query.toLowerCase().match(/[a-z0-9]/);
  return match ? match[0] : '_';
}

function expandedQueries(raw) {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return [];
  const direct = state.aliases[normalized];
  if (Array.isArray(direct) && direct.length) return [...new Set(direct.slice(0, 8))];

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const pools = tokens.map((token) => Array.isArray(state.aliases[token]) ? state.aliases[token].slice(0, 3) : [token]);
  let combos = [''];
  for (const pool of pools) {
    const next = [];
    for (const base of combos) {
      for (const value of pool) {
        next.push(`${base} ${value}`.trim());
        if (next.length >= 12) break;
      }
      if (next.length >= 12) break;
    }
    combos = next;
  }
  return [...new Set(combos.length ? combos : [normalized])];
}

async function loadShard(key) {
  if (state.shardCache.has(key)) return state.shardCache.get(key);
  const promise = fetch(`./data/search/${encodeURIComponent(key)}.json`)
    .then((response) => response.ok ? response.json() : [])
    .catch(() => []);
  state.shardCache.set(key, promise);
  return promise;
}

function rowPassesFilters(row) {
  const [, packId,, category, styles] = row;
  const pack = state.packById.get(packId);
  if (state.family !== 'all' && pack?.family !== state.family) return false;
  if (state.category !== 'all' && category !== state.category) return false;
  if (state.style !== 'all' && !(styles || []).includes(state.style)) return false;
  return true;
}

async function globalSearch(query, { updateUrl = true } = {}) {
  state.favoritesOnly = false;
  updateFavoritesUi();
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    renderPacks({ updateUrl });
    return;
  }

  state.searchQuery = query.trim();
  state.activePack = null;
  state.activeDialogIcon = null;
  const token = ++state.searchToken;
  const candidates = expandedQueries(normalized);
  els.packGrid.classList.add('hidden');
  els.iconGrid.classList.remove('hidden');
  els.loadMore.classList.add('hidden');
  els.sectionKicker.textContent = 'GLOBAL SEARCH';
  els.sectionTitle.textContent = `«${query.trim()}»`;
  setNotice('Ищу по индексу…');

  const seen = new Set();
  const matches = [];
  for (const candidate of candidates) {
    const rows = await loadShard(shardKey(candidate));
    if (token !== state.searchToken) return;
    const terms = candidate.split(/\s+/).filter(Boolean);
    for (const row of rows) {
      const name = String(row[0] || '').toLowerCase();
      if (!terms.every((term) => name.includes(term))) continue;
      if (!rowPassesFilters(row)) continue;
      const key = `${row[1]}:${row[2]}:${row[6]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push(row);
      if (matches.length >= 600) break;
    }
    if (matches.length >= 600) break;
  }

  if (token !== state.searchToken) return;
  els.iconGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (const row of matches) renderIconCard(iconModelFromSearch(row), fragment);
  els.iconGrid.append(fragment);

  const aliasUsed = candidates.length > 1 || candidates[0] !== normalized;
  const aliasHint = aliasUsed ? ` · алиасы: ${candidates.slice(0, 4).join(', ')}` : '';
  setNotice(matches.length
    ? `${nf.format(matches.length)} результатов${matches.length === 600 ? ' — показаны первые 600' : ''}${aliasHint}`
    : `Совпадений нет${aliasHint}. Попробуй более короткий запрос или другой синоним.`);
  if (updateUrl) syncUrl({ pack: null, icon: null });
}

function initQuickChips() {
  for (const word of QUICK) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = word;
    button.addEventListener('click', () => {
      els.globalSearch.value = word;
      globalSearch(word, { updateUrl: true });
    });
    els.quickChips.append(button);
  }
}

function restoreTheme() {
  const saved = localStorage.getItem('icon-atlas-theme');
  if (saved) document.documentElement.dataset.theme = saved;
}

async function init() {
  restoreTheme();
  loadFavorites();
  initQuickChips();

  const [catalogResponse, aliasResponse] = await Promise.all([
    fetch('./data/catalog.json'),
    fetch('./search-aliases.json').catch(() => null),
  ]);
  if (!catalogResponse.ok) throw new Error('catalog.json unavailable');
  state.catalog = await catalogResponse.json();
  state.aliases = aliasResponse?.ok ? await aliasResponse.json() : {};
  state.packById = new Map(state.catalog.packs.map((pack) => [pack.id, pack]));
  els.headerStats.textContent = `${nf.format(state.catalog.totalIcons)} icons · ${nf.format(state.catalog.packCount)} packs`;

  const params = new URLSearchParams(location.search);
  const family = params.get('family');
  const category = params.get('category');
  const style = params.get('style');
  if (family && state.catalog.families[family]) state.family = family;
  if (category && Object.prototype.hasOwnProperty.call(state.catalog.categories, category)) state.category = category;
  if (style && Object.prototype.hasOwnProperty.call(state.catalog.styles, style)) state.style = style;
  renderFilters();

  const packParam = params.get('pack');
  const iconParam = params.get('icon');
  const queryParam = params.get('q');
  if (packParam && state.packById.has(packParam)) {
    await openPack(state.packById.get(packParam), { updateUrl: false, iconId: iconParam });
    syncUrl({ pack: packParam, icon: iconParam });
  } else if (queryParam) {
    els.globalSearch.value = queryParam;
    await globalSearch(queryParam, { updateUrl: false });
    syncUrl({ pack: null, icon: null });
  } else {
    renderPacks({ updateUrl: false });
  }
}

let searchTimer;
els.globalSearch.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => globalSearch(els.globalSearch.value, { updateUrl: true }), 160);
});
els.packSearch.addEventListener('input', () => {
  state.packQuery = els.packSearch.value.trim().toLowerCase();
  state.favoritesOnly = false;
  updateFavoritesUi();
  renderPacks({ updateUrl: true });
});
els.sortSelect.addEventListener('change', () => {
  state.sort = els.sortSelect.value;
  renderPacks({ updateUrl: true });
});
els.loadMore.addEventListener('click', () => {
  state.visibleIcons += 120;
  renderIcons();
});
els.dialogClose.addEventListener('click', () => {
  els.iconDialog.close();
  clearPackAndIconUrl();
});
els.iconDialog.addEventListener('close', () => {
  if (state.activeDialogIcon) clearPackAndIconUrl();
});
els.copyPath.addEventListener('click', () => copyText(state.activeDialogIcon?.path, els.copyPath));
els.copyId.addEventListener('click', () => copyText(state.activeDialogIcon?.id, els.copyId));
els.favoriteIcon.addEventListener('click', () => state.activeDialogIcon && toggleFavorite(state.activeDialogIcon));
els.favoritesToggle.addEventListener('click', () => {
  if (state.favoritesOnly) {
    state.favoritesOnly = false;
    updateFavoritesUi();
    renderPacks({ updateUrl: true });
  } else {
    renderFavoriteIcons();
  }
});
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
