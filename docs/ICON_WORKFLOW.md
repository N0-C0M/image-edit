# ICON_WORKFLOW

Практический workflow для AI-агента и разработчика.

## Шаг 1. Классифицировать задачу

Перед поиском иконки определи её роль:

- `navigation` — переход между разделами;
- `action` — выполнить действие;
- `status` — показать состояние;
- `feature` — визуально подчеркнуть функцию;
- `empty-state` — поддержать пустой экран;
- `decorative` — визуальный акцент без отдельного смысла.

Для `navigation/action/status` приоритет — ясность. Для `feature/empty-state/decorative` допускается более выразительный стиль.

## Шаг 2. Выбрать pack

Используй `catalog/icons8-packs.json`.

Быстрый выбор:

- Human/friendly product UI → Claude Hand Drawn.
- Glassmorphism / premium → Liquid Glass.
- Compact/dense UI → Tiny Color.
- Large editorial/marketing → Dotted.
- Playful/game → Puffy Outline.
- Big illustrative accent → 3D Fluency.

## Шаг 3. Искать по семантике

Ищи английское действие или сущность. Примеры:

- `search`
- `filter`
- `calendar`
- `download`
- `upload`
- `settings`
- `security`
- `user`
- `notification`
- `edit`
- `delete`
- `analytics`

Если найдено несколько вариантов, выбирай тот, который лучше соответствует остальным пиктограммам экрана по толщине, заполнению и оптической массе.

## Шаг 4. Получить иконку легально

Используй официальный Icons8 интерфейс либо официальный API:

- https://icons8.com/icons
- https://developers.icons8.com/docs/getting-started
- https://developers.icons8.com/docs/searchIcons
- https://developers.icons8.com/docs/renderer

Для API ключ передавай через environment variable/secret store. Не записывай его в исходный код и Git.

## Шаг 5. Не хранить Icons8 pack в этом Git-репозитории

Этот репозиторий предназначен для правил и метаданных, а не для распространения исходных Icons8 assets.

Рекомендуемые локальные пути:

```text
vendor/icons8/
.local/icons8/
.tmp/icons8/
```

Они исключены через `.gitignore`.

## Шаг 6. Интеграция

### Кнопка с текстом

```tsx
<button className="primaryAction">
  <img src={downloadIcon} alt="" aria-hidden="true" width={20} height={20} />
  Скачать
</button>
```

### Icon-only button

```tsx
<button className="iconButton" aria-label="Удалить файл">
  <img src={deleteIcon} alt="" aria-hidden="true" width={20} height={20} />
</button>
```

### Декоративная feature icon

```tsx
<img src={featureIcon} alt="" aria-hidden="true" width={64} height={64} />
```

## Шаг 7. Visual QA

Перед завершением проверь:

- одинаковый визуальный вес соседних иконок;
- одинаковый размер canvas/контейнера;
- вертикальное выравнивание;
- контраст на светлом и тёмном фоне;
- hover/focus/disabled состояния;
- отсутствие растяжения SVG;
- нет ли смешения несовместимых styles;
- понятен ли смысл без угадывания.

## Шаг 8. Accessibility QA

- У icon-only button должен быть accessible name.
- Декоративная графика скрывается от screen reader.
- Важный статус не кодируется только цветом.
- Touch target должен быть существенно больше самой пиктограммы.

## Шаг 9. License QA

Перед релизом проверь актуальную лицензию:

- https://icons8.com/license
- https://icons8.com/terms-and-conditions

Free usage обычно требует attribution. Не распространяй исходные Icons8 SVG/PNG как самостоятельную библиотеку и не зеркаль их каталог.

## Правило для агента при нехватке иконки

Если точной иконки нет:

1. Проверь синонимы.
2. Проверь другой icon внутри **того же style**.
3. Если всё равно нет — используй нейтральный понятный symbol из того же набора.
4. Только затем предложи смену всего icon style для этого UI-контекста.

Нельзя брать случайную иконку из другого pack только потому, что она «красивее».
