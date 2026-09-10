# AGENTS.md — правила работы AI с AERO Icon Atlas

В репозитории находится **640 000 SVG-иконок**. Любой AI/Codex-агент, меняющий UI/UX, должен сначала использовать локальную библиотеку и её классификацию и только затем обращаться к внешним источникам.

## 1. Семейства

| Family | Manifest | Root | Count | Роль |
|---|---|---|---:|---|
| `core` | `manifest.jsonl` | `library/` | 100k | системный UI, brands, game, emoji, общие icons |
| `handdrawn` | `manifest-handdrawn.jsonl` | `library-handdrawn/` | 100k | friendly/freehand |
| `beautiful` | `manifest-beautiful.jsonl` | `library-beautiful/` | 100k | modern product UI |
| `extended` | `manifest-extended.jsonl` | `library-extended/` | 100k | дополнительное оригинальное покрытие |
| `neon` | `manifest-neon.jsonl` | `library-neon/` | 60k | cyber/game/neon accents |
| `sticker` | `manifest-sticker.jsonl` | `library-sticker/` | 60k | playful/rewards/promo |
| `soft` | `manifest-soft.jsonl` | `library-soft/` | 60k | rounded/soft consumer UI |
| `glass` | `manifest-glass.jsonl` | `library-glass/` | 60k | glass/translucent accents |

Итого: **640k**.

## 2. Не сканировать библиотеку вручную

Не обходи сотни тысяч SVG и не загружай большие manifests целиком в контекст. Начинай с:

```bash
node scripts/search-icons.mjs <query>
```

Фильтры:

```bash
--family=beautiful
--pack=tabler
--category=security
--style=outline
--limit=20
--json
--path-only
```

CLI поддерживает русские алиасы из `catalog/search-aliases.json`:

```bash
node scripts/search-icons.mjs настройки
node scripts/search-icons.mjs безопасность --family=beautiful
node scripts/search-icons.mjs меч --category=gaming
```

## 3. Порядок выбора

1. Определи точное действие/сущность.
2. Посмотри уже существующий визуальный язык экрана.
3. Выбери подходящий family.
4. Выполни semantic search по точному слову и синонимам.
5. При необходимости сузь результаты по category/style/pack.
6. Открой 2–5 SVG-кандидатов.
7. Сравни смысл, optical weight, canvas, fill/stroke и читаемость.
8. Для одной toolbar/sidebar/navigation группы предпочитай один pack.
9. Проверь accessibility.
10. Проверь provenance/license.
11. Только при отсутствии подходящего локального кандидата ищи внешний asset.

## 4. Приоритет оригинальных и производных assets

Для маленьких функциональных controls сначала предпочитай **original/native** SVG из `core`, `beautiful` или `extended`.

Производные families `handdrawn`, `neon`, `sticker`, `soft`, `glass` полезны для визуального характера, но не должны ухудшать читаемость.

Рекомендуемый приоритет:

- toolbar/navigation/settings → `core` / `beautiful`;
- premium SaaS/mobile → `beautiful`;
- редкая семантика → `extended`;
- onboarding/empty-state/friendly cards → `handdrawn`;
- game/cyber/horror accent → `neon`;
- loot/reward/promo/playful → `sticker`;
- friendly consumer/mobile → `soft`;
- translucent/glass feature layer → `glass`.

## 5. Классификация

Используй [`docs/CLASSIFICATION.md`](docs/CLASSIFICATION.md) и `catalog/taxonomy.json`.

Основные semantic categories:

`actions`, `navigation`, `communication`, `users`, `security`, `files`, `commerce`, `finance`, `media`, `devices`, `development`, `gaming`, `maps-travel`, `weather`, `health`, `education`, `time-calendar`, `social-brands`, `arrows`, `shapes`, `misc`.

Style tags могут включать:

`outline`, `filled`, `duotone`, `color`, `monochrome`, `rounded`, `sharp`, `thin`, `bold`, `pixel`, `emoji`, `brand`, `handdrawn`, `neon`, `sticker`, `soft`, `glass`.

Классификация эвристическая. **Точное имя иконки важнее broad category.**

## 6. Pack consistency

Большая библиотека существует для более точного выбора, а не для смешивания максимального количества наборов.

- Одна toolbar/navigation group → один pack, если возможно.
- Не смешивай outline/fill/emoji/generated FX случайно.
- Второй визуальный язык допускается для feature/empty-state/decorative слоя.
- Не меняй `stroke-width` и aspect ratio без веской причины.
- Не растягивай SVG по одной оси.

## 7. Семантика важнее красоты

Не заменяй понятный `delete` красивым, но неоднозначным символом. Для destructive действий, оплаты, безопасности и системных статусов выбирай максимально однозначные пиктограммы.

Если icon-only действие может быть непонятно, добавь текст/tooltip/accessible name.

## 8. Размеры

Ориентир:

- 16 px — плотный desktop UI;
- 18–20 px — secondary actions;
- 24 px — default navigation/action;
- 32–48 px — cards/features;
- 64–128 px — onboarding, empty states, decorative/generated icons.

Сравнивай реальную оптическую массу соседних иконок.

## 9. Цвет

- Монохромные SVG по возможности подчиняй design tokens/currentColor, если структура файла это позволяет.
- Не ломай исходную палитру color/emoji packs.
- Проверяй light/dark theme.
- Generated neon/glass/sticker не должны создавать новые случайные цвета в системной панели.

## 10. Accessibility

- Decorative icon → `aria-hidden="true"`.
- Icon-only button → обязательный `aria-label`/accessible name.
- Не передавай критический статус только цветом.
- Для touch UI целевая интерактивная зона обычно около 40–44 px или больше.

## 11. Provenance и лицензии

Оригинальные packs имеют разные открытые лицензии. Generated variants остаются производными от своих исходных SVG.

- Всегда сохраняй `sourceId`, если он присутствует.
- Проверяй `license`/`author` в manifest.
- Для attribution-required packs сохраняй attribution.
- Не удаляй `THIRD_PARTY_LICENSES.md` и `EXTENDED_LICENSES.md`.
- Не заявляй авторство репозитория над сторонними оригинальными иконками.
- Не выдавай `generated-*` asset за вручную созданный оригинал исходного автора.

## 12. AERO Icon Atlas

Для визуального просмотра используй web explorer из `site/` / `gh-pages`. Он предназначен для быстрого выбора pack/style и preview без перебора файлов.

Документация: [`docs/ICON_ATLAS.md`](docs/ICON_ATLAS.md).

## 13. Web/React

```tsx
<button className="iconButton" aria-label="Открыть настройки">
  <img src="/icons/settings.svg" alt="" aria-hidden="true" width={24} height={24} />
</button>
```

Если build pipeline импортирует SVG как компонент:

```tsx
<button aria-label="Поиск">
  <SearchIcon aria-hidden="true" focusable="false" />
</button>
```

Не вставляй огромные inline SVG в JSX без необходимости.

## 14. Анти-паттерны

Без необходимости запрещено:

- внешний поиск до локального;
- случайные Unicode/emoji вместо подходящего SVG;
- 3+ несовместимых styles в одной control group;
- generated FX для мелкого функционального UI, если original читается лучше;
- обход всех SVG вместо индекса;
- загрузка полного manifest в LLM-контекст;
- потеря provenance/license metadata;
- генерация новой пиктограммы, когда качественный локальный кандидат уже существует.

## 15. Главное правило

**Семантика → локальный search → family/category/style → 2–5 кандидатов → pack consistency → accessibility/license → интеграция. Внешний источник — только последний шаг.**
