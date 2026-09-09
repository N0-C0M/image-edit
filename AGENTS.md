# AGENTS.md — правила работы AI с библиотекой иконок

Этот репозиторий предназначен для локального выбора иконок AI/Codex-агентами. После полной сборки в нём **300 000 SVG** в трёх семействах. Агент должен сначала использовать локальную библиотеку и только затем искать внешние ассеты.

## 1. Семейства

- `library/` + `manifest.jsonl` — **Core**, 100k универсальных иконок.
- `library-handdrawn/` + `manifest-handdrawn.jsonl` — **Hand-drawn**, 100k friendly/freehand вариантов.
- `library-beautiful/` + `manifest-beautiful.jsonl` — **Beautiful**, 100k дополнительных современных UI-иконок.
- `ICON_MAP.md` — карта коллекций для человека.
- `catalog/icon-map.json` — компактная карта для машины.
- `THIRD_PARTY_LICENSES.md` — авторы, лицензии и provenance.

Не сканируй все SVG по содержимому. Используй индекс и CLI-поиск.

## 2. Главный способ поиска

```bash
node scripts/search-icons.mjs calendar
node scripts/search-icons.mjs "security shield" --family=beautiful --limit=30
node scripts/search-icons.mjs upload --family=handdrawn
node scripts/search-icons.mjs sword --family=core
```

Если CLI недоступен, используй `rg`/`grep` по соответствующему JSONL manifest.

Не загружай в контекст десятки тысяч manifest-строк. Сначала сузь запрос до 2–10 кандидатов.

## 3. Выбор family

### Core
Используй для:
- navigation/action/system UI;
- Material/Fluent/Phosphor/Tabler-подобных интерфейсов;
- брендов;
- игр/RPG;
- emoji и обычных универсальных символов.

### Beautiful
Используй, когда нужен более современный или выразительный продуктовый UI: landing, SaaS, dashboard, mobile app, cards, premium-looking interface.

Не смешивай красивую коллекцию с другой только ради разнообразия — консистентность важнее.

### Hand-drawn
Используй для:
- onboarding;
- empty states;
- friendly SaaS;
- игровых/playful интерфейсов;
- крупных feature icons;
- креативных карточек и иллюстративных элементов.

`variant=native-freehand` означает исходную hand-drawn иконку автора. `variant=generated-freehand` означает автоматически стилизованную производную. Для hero/marketing, где качество особенно заметно, сначала предпочитай `native-freehand`.

## 4. Порядок выбора

1. Определи точную семантику: `search`, `settings`, `download`, `calendar`, `security`, `game`, `user`, `mail` и т. д.
2. Определи визуальный язык текущего экрана.
3. Выбери family.
4. Ищи по английскому semantic name и 2–4 синонимам.
5. Выбери 2–5 кандидатов.
6. По возможности используй одну исходную коллекцию для одной панели/группы controls.
7. Проверь optical weight и размер.
8. Проверь accessibility.
9. Проверь лицензию.
10. Только после этого интегрируй SVG.

## 5. Рекомендуемые Core-коллекции

- `tabler` — чистый универсальный outline UI.
- `ph` — Phosphor, современный UI и много вариантов.
- `fluent` — Microsoft/Fluent.
- `material-symbols`, `material-symbols-light` — Material.
- `mdi` — широкое покрытие системных сценариев.
- `hugeicons` — выразительный современный UI.
- `solar` — rounded/duotone язык.
- `game-icons` — игры, предметы, оружие, способности, RPG.
- `simple-icons` — бренды.
- `openmoji`, `twemoji`, `noto` — emoji/illustrative accents.

Для Beautiful и Hand-drawn фактический состав всегда смотри в `ICON_MAP.md`, потому что он генерируется из актуального Iconify snapshot.

## 6. Консистентность

- Для navbar/sidebar/toolbar используй одну коллекцию или максимально совместимые варианты.
- Не смешивай outline, filled, emoji, 3D и hand-drawn в одной группе controls.
- Второй стиль допустим для feature/empty-state/decorative слоя.
- Сохраняй aspect ratio SVG.
- Не меняй stroke-width вручную без причины.
- Не растягивай SVG по одной оси.
- Не выбирай иконку только потому, что она визуально эффектнее: семантика важнее.

## 7. Семантические синонимы

- удалить: `delete`, `trash`, `remove`;
- настройки: `settings`, `gear`, `cog`;
- аккаунт: `user`, `person`, `profile`, `account`;
- безопасность: `shield`, `lock`, `security`, `key`;
- загрузка: `download`, `save`, `arrow-down`;
- отправка: `send`, `paper-plane`, `arrow-up`;
- редактирование: `edit`, `pencil`, `pen`;
- меню: `menu`, `hamburger`, `navigation`;
- уведомление: `bell`, `notification`, `alert`.

## 8. Размеры

- 16 px — dense desktop UI.
- 18–20 px — secondary actions.
- 24 px — default navigation/action.
- 32–48 px — cards/features.
- 64–128 px — onboarding, empty states, decorative/hand-drawn.

Сравнивай optical weight соседних иконок, а не только номинальный размер.

## 9. Цвет

- Для монохромных SVG используй design tokens/currentColor, если исходник это поддерживает.
- Не ломай исходную палитру color/emoji коллекций.
- Проверяй light/dark theme и контраст.
- Не вводи новый цвет только из-за палитры иконки.

## 10. Accessibility

- Decorative icon: `aria-hidden="true"`.
- Icon-only button: обязательный `aria-label`/accessible name.
- Не передавай критический статус только цветом.
- Для touch UI интерактивная область обычно должна быть около 40–44 px или больше.

## 11. Web/React

```tsx
<button className="iconButton" aria-label="Открыть настройки">
  <img src="/icons/settings.svg" alt="" aria-hidden="true" width={24} height={24} />
</button>
```

Если SVG импортируется как компонент:

```tsx
<button aria-label="Поиск">
  <SearchIcon aria-hidden="true" focusable="false" />
</button>
```

Не вставляй огромные inline SVG в JSX без необходимости.

## 12. Лицензии и производные

Разные коллекции используют MIT, Apache, ISC, CC0, CC BY, CC BY-SA и другие открытые лицензии.

- Проверяй `license` в manifest выбранной иконки.
- Сохраняй attribution, когда он требуется.
- Не удаляй `THIRD_PARTY_LICENSES.md`.
- `generated-freehand` остаётся производным от указанного `sourceId`; исходная лицензия продолжает применяться.
- Не утверждай, что автоматически стилизованный hand-drawn файл является оригинальной работой автора исходной коллекции.

## 13. Анти-паттерны

Без веской причины запрещено:

- emoji вместо обычного UI icon;
- Unicode-символ вместо имеющейся SVG;
- 3+ визуально разных стиля в одной toolbar/navigation группе;
- внешний поиск до локального поиска;
- генерация новой иконки, если локально уже есть качественный кандидат;
- использование generated hand-drawn для мелкой плотной toolbar, если обычный outline читается лучше;
- удаление provenance/license metadata.

## 14. Главное правило

**Семантика → `scripts/search-icons.mjs` → 2–5 локальных кандидатов → визуальная консистентность → accessibility/license → интеграция → внешний источник только при отсутствии подходящего локального результата.**
