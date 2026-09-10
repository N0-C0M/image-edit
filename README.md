# AERO Icon Atlas — 640k Open Icon Library

Большая локальная SVG-библиотека для сайтов, приложений, игр, SaaS, mobile UI и AI/Codex-агентов. Репозиторий объединяет открытые icon sets, хранит provenance и лицензии, классифицирует иконки по смыслу и стилю и предоставляет браузер **AERO Icon Atlas** для визуального поиска.

## Масштаб

Сейчас библиотека содержит **640 000 SVG** в восьми семействах:

| Семейство | Путь | Количество | Назначение |
|---|---|---:|---|
| **Core** | `library/` | 100 000 | универсальный UI, system actions, brands, emoji, game icons |
| **Hand-drawn** | `library-handdrawn/` | 100 000 | friendly UI, onboarding, cards, creative/game interfaces |
| **Beautiful** | `library-beautiful/` | 100 000 | аккуратные современные product/UI packs |
| **Extended** | `library-extended/` | 100 000 | дополнительные оригинальные открытые коллекции |
| **Neon** | `library-neon/` | 60 000 | glow/neon интерфейсы, игры, hero/feature accents |
| **Sticker** | `library-sticker/` | 60 000 | playful, promo, cards, game/reward UI |
| **Soft** | `library-soft/` | 60 000 | мягкий rounded consumer/product UI |
| **Glass** | `library-glass/` | 60 000 | glass/translucent visual accents |

**Итого: 640 000 SVG.** Актуальные автоматически рассчитанные цифры смотри в [`ICON_LIBRARY_STATS.md`](ICON_LIBRARY_STATS.md).

## AERO Icon Atlas

В `site/` находится статический браузер библиотеки. Он умеет:

- искать иконки глобально;
- показывать и фильтровать паки;
- фильтровать по family, semantic category и visual style;
- открывать большие preview;
- показывать ID, путь, автора и лицензию;
- копировать ID/путь;
- переключать dark/light theme;
- открывать pack по URL;
- работать с sharded search index, не загружая сотни тысяч записей сразу.

Подробности: [`docs/ICON_ATLAS.md`](docs/ICON_ATLAS.md).

Workflow публикует собранный каталог в ветку `gh-pages`. Для первого запуска GitHub Pages может потребоваться один раз выбрать `gh-pages / (root)` в **Settings → Pages**.

## Классификация

Каждая иконка рассматривается сразу по нескольким осям:

1. **family** — `core`, `beautiful`, `handdrawn`, `extended`, `neon`, `sticker`, `soft`, `glass`;
2. **pack** — исходная коллекция внутри family;
3. **semantic category** — например `security`, `gaming`, `commerce`, `files`, `media`, `development`, `maps-travel`, `health`, `education`;
4. **visual style** — например `outline`, `filled`, `duotone`, `color`, `rounded`, `pixel`, `handdrawn`, `neon`, `sticker`, `soft`, `glass`;
5. **variant/provenance** — original/native/generated + ссылка на исходный asset для производных вариантов.

Полная модель: [`docs/CLASSIFICATION.md`](docs/CLASSIFICATION.md).

Машиночитаемые индексы:

```text
catalog/taxonomy.json
catalog/packs.json
catalog/categories.json
catalog/styles.json
catalog/classification-stats.json
catalog/icon-map.json
```

## Поиск из терминала / AI-агента

Главный инструмент:

```bash
node scripts/search-icons.mjs shield --category=security
node scripts/search-icons.mjs upload --family=beautiful --style=outline
node scripts/search-icons.mjs sword --category=gaming
node scripts/search-icons.mjs camera --family=neon
node scripts/search-icons.mjs wallet --pack=ph
```

Поддерживаются и русские запросы через `catalog/search-aliases.json`:

```bash
node scripts/search-icons.mjs настройки
node scripts/search-icons.mjs безопасность --family=beautiful
node scripts/search-icons.mjs меч --category=gaming
node scripts/search-icons.mjs деньги --limit=20
```

Дополнительные режимы:

```bash
node scripts/search-icons.mjs calendar --json
node scripts/search-icons.mjs download --path-only
```

Не сканируй 640 000 SVG напрямую. Сначала используй CLI/manifest/taxonomy и открывай только несколько подходящих кандидатов.

## Manifests

Полные индексы иконок:

```text
manifest.jsonl                 # core
manifest-handdrawn.jsonl       # hand-drawn
manifest-beautiful.jsonl       # beautiful
manifest-extended.jsonl        # extended originals
manifest-neon.jsonl            # generated neon
manifest-sticker.jsonl         # generated sticker
manifest-soft.jsonl            # generated soft
manifest-glass.jsonl           # generated glass
```

Каждая запись хранит semantic name, pack/prefix, путь, source metadata, license и provenance. Производные варианты сохраняют `sourceId`.

## Как выбирать семейство

- **navbar / toolbar / settings:** начинай с `core` или `beautiful`;
- **premium modern product UI:** `beautiful`;
- **friendly / human / onboarding:** `handdrawn`;
- **редкие темы и дополнительное покрытие:** `extended`;
- **horror/cyber/game UI:** `neon` как акцент;
- **rewards / loot / playful cards:** `sticker`;
- **consumer/mobile rounded UI:** `soft`;
- **glassmorphism / translucent feature blocks:** `glass`;
- **игровые предметы/RPG:** semantic category `gaming`, затем выбирай подходящий family/pack.

Для одной toolbar/navigation группы старайся использовать **один pack**. Огромное количество иконок нужно для точного выбора, а не для случайного смешивания стилей.

## Hand-drawn и generated families

`handdrawn` содержит как нативные freehand collections, так и детерминированные generated-freehand варианты открытых исходников. `neon`, `sticker`, `soft` и `glass` также являются визуальными производными там, где это указано в `variant`.

Они не выдаются за новые авторские исходные наборы: manifest сохраняет source ID, автора и лицензию исходной коллекции.

## Структура

```text
.
├── library/                     # 100k core
├── library-handdrawn/           # 100k
├── library-beautiful/           # 100k
├── library-extended/            # 100k originals
├── library-neon/                # 60k
├── library-sticker/             # 60k
├── library-soft/                # 60k
├── library-glass/               # 60k
├── manifest*.jsonl
├── catalog/
│   ├── taxonomy.json
│   ├── search-aliases.json
│   ├── icon-map.json
│   ├── packs.json
│   ├── categories.json
│   ├── styles.json
│   └── classification-stats.json
├── site/                        # AERO Icon Atlas frontend
├── docs/
│   ├── CLASSIFICATION.md
│   ├── ICON_ATLAS.md
│   └── ICON_WORKFLOW.md
├── scripts/
│   ├── search-icons.mjs
│   ├── build-classification.mjs
│   ├── build-pages-data.mjs
│   ├── build-icon-library.mjs
│   ├── build-expanded-library.mjs
│   └── build-ultra-library.mjs
├── AGENTS.md
├── ICON_MAP.md
├── ICON_LIBRARY_STATS.md
├── THIRD_PARTY_LICENSES.md
└── EXTENDED_LICENSES.md
```

## Для AI / Codex

Перед UI-задачей прочитай [`AGENTS.md`](AGENTS.md).

Рекомендуемый цикл:

1. определить точную семантику;
2. выбрать family/style под текущий экран;
3. запустить поиск по нескольким синонимам;
4. сузить по category/pack/style;
5. открыть 2–5 SVG-кандидатов;
6. выбрать иконку с подходящим optical weight;
7. сохранить консистентность соседних controls;
8. проверить attribution/license;
9. только после этого искать внешние ассеты, если локальной иконки действительно нет.

## Лицензии

Оригинальные иконки приходят из открытых коллекций, агрегированных Iconify. У отдельных паков разные лицензии: MIT, Apache, ISC, CC0, CC BY, CC BY-SA и другие.

- Не считай всю библиотеку одной лицензией.
- Сохраняй attribution для коллекций, где она требуется.
- Проверяй manifest и `THIRD_PARTY_LICENSES.md` / `EXTENDED_LICENSES.md` перед публичным распространением конкретных assets.
- Generated variants продолжают подчиняться лицензии исходной иконки.

Этот репозиторий не заявляет авторство над сторонними исходными icon sets.

## Автоматизация

GitHub Actions выполняет отдельные задачи:

- строит/расширяет SVG-библиотеки;
- валидирует точное число файлов;
- пересобирает taxonomy/indexes;
- собирает оптимизированный AERO Icon Atlas;
- публикует статический каталог в `gh-pages`.

Так проект можно расширять дальше без ручного редактирования сотен тысяч файлов.
