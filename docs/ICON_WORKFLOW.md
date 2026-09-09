# ICON_WORKFLOW

Практический workflow для AI-агента и разработчика, работающего с локальной библиотекой иконок.

## 1. Определи роль иконки

Перед поиском классифицируй задачу:

- `navigation` — переход между разделами;
- `action` — выполнить действие;
- `status` — показать состояние;
- `feature` — подчеркнуть функцию;
- `empty-state` — поддержать пустой экран;
- `decorative` — визуальный акцент;
- `brand` — логотип/сервис;
- `game` — предмет, способность, оружие, ресурс или игровое действие.

Для navigation/action/status приоритет — ясность и консистентность. Для feature/empty-state/decorative можно использовать более выразительные семейства.

## 2. Сначала выбери family

Основные семейства описаны в `ICON_MAP.md` и `catalog/icon-map.json`.

- `core` — универсальные UI, system, brand, emoji, game и common icons.
- `beautiful` — более выразительные современные UI packs.
- `handdrawn` — friendly/freehand UI и иллюстративные варианты.
- дополнительные производные families могут использоваться для accent/marketing/game UI, если они присутствуют в карте.

Не смешивай несколько визуальных языков внутри одной toolbar/sidebar/navigation-группы.

## 3. Ищи по семантике

Используй CLI:

```bash
node scripts/search-icons.mjs search
node scripts/search-icons.mjs "security shield" --family=beautiful --limit=30
node scripts/search-icons.mjs upload --family=handdrawn
node scripts/search-icons.mjs sword --family=core
```

Полезные английские ключи: `search`, `filter`, `calendar`, `download`, `upload`, `settings`, `security`, `user`, `notification`, `edit`, `delete`, `analytics`, `mail`, `camera`, `play`, `wallet`, `cart`, `shield`, `sword`.

Если результатов много, сузь поиск по family, pack, taxonomy category или style tag.

## 4. Выбери 2–5 кандидатов

Сравни:

- семантическую точность;
- stroke/fill;
- оптическую массу;
- corner radius;
- размер canvas;
- наличие цвета;
- совместимость с уже используемым pack.

Красота не должна побеждать понятность действия.

## 5. Интеграция

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

## 6. Visual QA

Перед завершением проверь:

- одинаковый визуальный вес соседних иконок;
- одинаковую логику размера и отступов;
- вертикальное выравнивание;
- light/dark backgrounds;
- hover/focus/disabled states;
- отсутствие растяжения SVG;
- отсутствие случайного смешения styles;
- понятность смысла без угадывания.

## 7. Accessibility QA

- Icon-only button всегда имеет accessible name.
- Decorative graphics скрываются от screen reader.
- Критический статус не передаётся только цветом.
- Touch target обычно должен быть около 40–44 px или больше, даже если сама иконка меньше.

## 8. License QA

Каждый pack сохраняет исходные `author` и `license` metadata. Перед публичным релизом:

1. проверь `THIRD_PARTY_LICENSES.md`;
2. сохрани attribution для лицензий, где он требуется;
3. не удаляй provenance/source metadata у производных вариантов;
4. не утверждай, что вся библиотека имеет одну общую лицензию.

## 9. Если точной иконки нет

1. Проверь синонимы.
2. Проверь варианты внутри того же pack.
3. Проверь другой pack внутри той же family/style-группы.
4. Только затем используй другую family.
5. Генерируй новую иконку только если локальная библиотека действительно не покрывает задачу.

## Главное правило

**Семантика → family → pack → 2–5 кандидатов → визуальная консистентность → accessibility → license/provenance.**
