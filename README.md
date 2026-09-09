# 300k Open-Source Icon Library for AI & UI Projects

Локальная SVG-библиотека для сайтов, приложений, игр, SaaS, mobile UI и AI/Codex-агентов. Репозиторий собирает открытые icon sets в единую структуру, сохраняет авторов/лицензии и даёт быстрый машинный поиск без ручного просмотра сотен тысяч файлов.

## Что внутри

После полной сборки библиотека состоит из трёх независимых семейств:

| Семейство | Путь | Цель | Назначение |
|---|---|---:|---|
| **Core** | `library/` | 100 000 SVG | универсальный UI, Material, Fluent, Phosphor, Tabler, game, emoji, brands и др. |
| **Hand-drawn** | `library-handdrawn/` | 100 000 SVG | friendly/creative UI, onboarding, empty states, игровые и выразительные интерфейсы |
| **Beautiful** | `library-beautiful/` | 100 000 SVG | современные UI-наборы, Streamline, Lucide и другие аккуратные коллекции |

**Целевой итог: 300 000 SVG.** Текущие фактические числа всегда смотри в [`ICON_LIBRARY_STATS.md`](ICON_LIBRARY_STATS.md).

## Важно про Hand-drawn

В open-source каталогах нет 100 000 уникальных вручную нарисованных freehand-иконок одного уровня качества. Поэтому слой устроен честно:

- нативные `Streamline Freehand` и `Streamline Freehand Color` сохраняются как `native-freehand`;
- оставшаяся часть — детерминированные `generated-freehand` варианты открытых UI-иконок с rough/freehand SVG-эффектом;
- у каждого производного файла сохраняются `sourceId`, исходная коллекция, автор и лицензия.

Это позволяет получить большой согласованный hand-drawn слой, не выдавая автоматически стилизованные ассеты за оригинальную авторскую коллекцию.

## Карта библиотеки

Главная точка входа — [`ICON_MAP.md`](ICON_MAP.md).

Она показывает:

- семейства и пути;
- коллекции и количество иконок;
- native/generated варианты;
- лицензии;
- правила выбора стиля.

Для агента есть компактная машинная карта: `catalog/icon-map.json`.

Полные индексы:

- `manifest.jsonl` — Core;
- `manifest-handdrawn.jsonl` — Hand-drawn;
- `manifest-beautiful.jsonl` — Beautiful.

## Быстрый поиск

Не сканируй 300 000 SVG напрямую. Используй индекс:

```bash
node scripts/search-icons.mjs calendar
node scripts/search-icons.mjs "security shield" --family=beautiful --limit=30
node scripts/search-icons.mjs upload --family=handdrawn
node scripts/search-icons.mjs sword --family=core
```

Вывод содержит family, variant, исходный ID, коллекцию и готовый путь к SVG.

Если нужен ручной поиск по manifest:

```bash
rg -i '"name":"[^"]*(search|magnify)[^"]*"' manifest.jsonl
rg -i 'security|shield|lock' manifest-beautiful.jsonl
```

## Структура

```text
.
├── library/                       # 100k core SVG
├── library-handdrawn/             # 100k hand-drawn/native+generated SVG
├── library-beautiful/             # 100k additional curated SVG
├── manifest.jsonl                 # core full index
├── manifest-handdrawn.jsonl       # hand-drawn full index
├── manifest-beautiful.jsonl       # beautiful full index
├── collections-selected.json
├── collections-handdrawn.json
├── collections-beautiful.json
├── ICON_MAP.md                    # human-readable icon map
├── ICON_LIBRARY_STATS.md
├── THIRD_PARTY_LICENSES.md
├── catalog/icon-map.json          # compact machine-readable map
├── scripts/search-icons.mjs
├── scripts/build-icon-library.mjs
└── scripts/build-expanded-library.mjs
```

## Для AI / Codex

Перед UI-задачей прочитай [`AGENTS.md`](AGENTS.md).

Базовый алгоритм:

1. Определи смысл иконки.
2. Выбери family: `core`, `beautiful` или `handdrawn`.
3. Запусти `scripts/search-icons.mjs` по нескольким английским синонимам.
4. Выбери 2–5 кандидатов.
5. Проверь визуальную совместимость с экраном.
6. Предпочитай одну коллекцию для одного navigation/toolbar уровня.
7. Проверь лицензию выбранной коллекции.
8. Только если локального результата нет — ищи внешний ассет.

## Рекомендуемый выбор

- **обычный продуктовый UI:** `beautiful` → Lucide/Streamline/современные UI collections;
- **строгая системная навигация:** `core` → Tabler, Phosphor, Fluent, Material;
- **игры/RPG:** `core` → Game Icons и тематические наборы;
- **onboarding / empty state / friendly SaaS:** `handdrawn`;
- **бренды:** `core` → Simple Icons/Web3/theSVG и соответствующие наборы;
- **emoji/illustrative accents:** `core` → OpenMoji/Twemoji/Noto, но не как замена обычным toolbar icons.

## Лицензии

Источник данных — открытые коллекции Iconify. Iconify объединяет icon sets с разными лицензиями; лицензия Iconify как проекта не заменяет лицензию конкретного набора.

В репозитории сохраняются метаданные каждой исходной коллекции и генерируется [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md). Некоторые наборы требуют attribution (например CC BY), другие разрешают использование без атрибуции (MIT, Apache, ISC, CC0 и т. п.).

Перед публичным распространением конкретного ассета проверь его запись в manifest и соответствующий раздел `THIRD_PARTY_LICENSES.md`.

## Сборка

Core:

```bash
node scripts/build-icon-library.mjs .cache/iconify 100000
```

Дополнительные 200k:

```bash
node scripts/build-expanded-library.mjs .cache/iconify 100000 100000
```

GitHub Actions автоматически проверяет точное количество SVG перед commit.

## Источник

Иконки берутся из проекта Iconify / `iconify/icon-sets`, который агрегирует открытые icon sets и хранит для них метаданные авторов и лицензий.

Этот репозиторий не утверждает авторство над сторонними иконками. Generated hand-drawn варианты являются производными от указанных исходных коллекций и продолжают подчиняться их лицензиям.
