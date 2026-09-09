# Icon Map

Карта локальной библиотеки для разработчиков и AI-агентов. Полный поиск выполняется по JSONL-манифестам; этот файл показывает семейства, коллекции и стратегию выбора.

## Быстрый выбор

| Семейство | Путь | Количество | Когда использовать |
|---|---|---:|---|
| Core | `library/` | 100000 | Базовый UI, системные действия, бренды, emoji, игровые и общие пиктограммы |
| Hand-drawn | `library-handdrawn/` | 100000 | Friendly UI, onboarding, карточки, empty states, игровые/креативные интерфейсы |
| Beautiful | `library-beautiful/` | 100000 | Современные landing/SaaS/mobile интерфейсы, где нужен более выразительный визуальный стиль |

**Всего: 300000 SVG.**

## Как искать

```bash
node scripts/search-icons.mjs calendar
node scripts/search-icons.mjs "security shield" --family=beautiful --limit=30
node scripts/search-icons.mjs upload --family=handdrawn
```

Для машинного доступа:
- `manifest.jsonl` — core;
- `manifest-handdrawn.jsonl` — hand-drawn;
- `manifest-beautiful.jsonl` — beautiful;
- `catalog/icon-map.json` — компактная карта семейств и коллекций.

> В hand-drawn семействе варианты `native-freehand` — исходные hand-drawn иконки автора; `generated-freehand` — детерминированные производные SVG с rough/freehand-эффектом. Исходный `sourceId`, автор и лицензия сохраняются в манифесте.

## Core collections

| Prefix | Collection | Icons | Variant | License |
|---|---|---:|---|---|
| iconmind | IconMind | 5000 | original | MIT / MIT |
| fluent | Fluent UI System Icons | 5000 | original | MIT / MIT |
| material-symbols-light | Material Symbols Light | 5000 | original | Apache 2.0 / Apache-2.0 |
| material-symbols | Material Symbols | 5000 | original | Apache 2.0 / Apache-2.0 |
| arcticons | Arcticons | 5000 | original | CC BY-SA 4.0 / CC-BY-SA-4.0 |
| ic | Google Material Icons | 5000 | original | Apache 2.0 / Apache-2.0 |
| ph | Phosphor | 5000 | original | MIT / MIT |
| solar | Solar | 5000 | original | CC BY 4.0 / CC-BY-4.0 |
| mdi | Material Design Icons | 5000 | original | Apache 2.0 / Apache-2.0 |
| selfhst | selfh.st/icons | 5000 | original | CC BY 4.0 / CC-BY-4.0 |
| reicon | Reicon | 5000 | original | MIT / MIT |
| tabler | Tabler Icons | 5000 | original | MIT / MIT |
| hugeicons | Huge Icons | 5000 | original | MIT / MIT |
| thesvg-color | theSVG Color | 4864 | original | MIT / MIT |
| twemoji | Twitter Emoji | 4728 | original | CC BY 4.0 / CC-BY-4.0 |
| openmoji | OpenMoji | 4651 | original | CC BY-SA 4.0 / CC-BY-SA-4.0 |
| token-branded | Web3 Icons Branded | 4167 | original | MIT / MIT |
| game-icons | Game Icons | 4137 | original | CC BY 3.0 / CC-BY-3.0 |
| noto | Noto Emoji | 4104 | original | Apache 2.0 / Apache-2.0 |
| boxicons | Boxicons | 3768 | original | MIT / MIT |
| thesvg | theSVG | 3751 | original | MIT / MIT |
| simple-icons | Simple Icons | 830 | original | CC0 1.0 / CC0-1.0 |

## Hand-drawn collections

| Prefix | Collection | Icons | Variant | License |
|---|---|---:|---|---|
| fluent | Fluent UI System Icons | 3000 | generated-freehand | MIT / MIT |
| ph | Phosphor | 3000 | generated-freehand | MIT / MIT |
| solar | Solar | 3000 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| tabler | Tabler Icons | 3000 | generated-freehand | MIT / MIT |
| hugeicons | Huge Icons | 3000 | generated-freehand | MIT / MIT |
| mingcute | MingCute Icon | 3000 | generated-freehand | Apache 2.0 / Apache-2.0 |
| ri | Remix Icon | 3000 | generated-freehand | Apache 2.0 / Apache-2.0 |
| streamline | Streamline | 3000 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| fluent-emoji | Fluent Emoji | 3000 | generated-freehand | MIT / MIT |
| iconmind | IconMind | 3000 | generated-freehand | MIT / MIT |
| reicon | Reicon | 3000 | generated-freehand | MIT / MIT |
| boxicons | Boxicons | 3000 | generated-freehand | MIT / MIT |
| glyphs | Glyphs | 3000 | generated-freehand | MIT / MIT |
| keyline-icons | Keyline Icons | 3000 | generated-freehand | MIT / MIT |
| mynaui | Myna UI Icons | 2892 | generated-freehand | MIT / MIT |
| carbon | Carbon | 2779 | generated-freehand | Apache 2.0 / Apache-2.0 |
| icon-park | IconPark | 2658 | generated-freehand | Apache 2.0 / Apache-2.0 |
| icon-park-outline | IconPark Outline | 2658 | generated-freehand | Apache 2.0 / Apache-2.0 |
| ion | IonIcons | 2607 | generated-freehand | MIT / MIT |
| tdesign | TDesign Icons | 2370 | generated-freehand | MIT / MIT |
| lucide | Lucide | 2102 | generated-freehand | ISC / ISC |
| bi | Bootstrap Icons | 2090 | generated-freehand | MIT / MIT |
| griddy-icons | Griddy Icons | 2010 | generated-freehand | MIT / MIT |
| streamline-color | Streamline color | 2000 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| streamline-ultimate | Ultimate free icons | 1999 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| fa7-solid | Font Awesome Solid | 1971 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| icon-park-solid | IconPark Solid | 1970 | generated-freehand | Apache 2.0 / Apache-2.0 |
| icon-park-twotone | IconPark TwoTone | 1947 | generated-freehand | Apache 2.0 / Apache-2.0 |
| iconamoon | IconaMoon | 1818 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| fluent-mdl2 | Fluent UI MDL2 | 1735 | generated-freehand | MIT / MIT |
| streamline-sharp | Sharp free icons | 1500 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| streamline-flex | Flex free icons | 1500 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| streamline-plump | Plump free icons | 1499 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| heroicons | HeroIcons | 1297 | generated-freehand | MIT / MIT |
| teenyicons | Teenyicons | 1200 | generated-freehand | MIT / MIT |
| clarity | Clarity | 1105 | generated-freehand | MIT / MIT |
| majesticons | Majesticons | 1045 | generated-freehand | MIT / MIT |
| streamline-freehand | Freehand free icons | 1000 | native-freehand | CC BY 4.0 / CC-BY-4.0 |
| streamline-freehand-color | Freehand color icons | 1000 | native-freehand | CC BY 4.0 / CC-BY-4.0 |
| streamline-plump-color | Plump color icons | 1000 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| streamline-flex-color | Flex color icons | 1000 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| streamline-sharp-color | Sharp color icons | 1000 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| streamline-ultimate-color | Ultimate color icons | 998 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| octicon | Octicons | 951 | generated-freehand | MIT / MIT |
| fluent-color | Fluent UI System Color Icons | 890 | generated-freehand | MIT / MIT |
| gravity-ui | Gravity UI Icons | 799 | generated-freehand | MIT / MIT |
| streamline-pixel | Pixel free icons | 662 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| streamline-cyber-color | Cyber color icons | 500 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| streamline-cyber | Cyber free icons | 500 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| streamline-kameleon-color | Kameleon color icons | 400 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| heroicons-solid | HeroIcons v1 Solid | 389 | generated-freehand | MIT / MIT |
| lucide-lab | Lucide Lab | 388 | generated-freehand | ISC / ISC |
| heroicons-outline | HeroIcons v1 Outline | 385 | generated-freehand | MIT / MIT |
| radix-icons | Radix Icons | 345 | generated-freehand | MIT / MIT |
| streamline-block | Streamline Block | 300 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |
| feather | Feather Icons | 286 | generated-freehand | MIT / MIT |
| fe | Feather Icon | 255 | generated-freehand | MIT / MIT |
| streamline-stickies-color | Stickies color icons | 200 | generated-freehand | CC BY 4.0 / CC-BY-4.0 |

## Beautiful collections

| Prefix | Collection | Icons | Variant | License |
|---|---|---:|---|---|
| streamline | Streamline | 4000 | original | CC BY 4.0 / CC-BY-4.0 |
| glyphs | Glyphs | 3452 | original | MIT / MIT |
| mingcute | MingCute Icon | 3364 | original | Apache 2.0 / Apache-2.0 |
| keyline-icons | Keyline Icons | 3250 | original | MIT / MIT |
| ri | Remix Icon | 3244 | original | Apache 2.0 / Apache-2.0 |
| fluent-emoji | Fluent Emoji | 3181 | original | MIT / MIT |
| mynaui | Myna UI Icons | 2892 | original | MIT / MIT |
| carbon | Carbon | 2779 | original | Apache 2.0 / Apache-2.0 |
| icon-park | IconPark | 2658 | original | Apache 2.0 / Apache-2.0 |
| icon-park-outline | IconPark Outline | 2658 | original | Apache 2.0 / Apache-2.0 |
| ion | IonIcons | 2607 | original | MIT / MIT |
| tdesign | TDesign Icons | 2370 | original | MIT / MIT |
| lucide | Lucide | 2102 | original | ISC / ISC |
| bi | Bootstrap Icons | 2090 | original | MIT / MIT |
| iconoir | Iconoir | 2020 | original | MIT / MIT |
| griddy-icons | Griddy Icons | 2010 | original | MIT / MIT |
| streamline-color | Streamline color | 2000 | original | CC BY 4.0 / CC-BY-4.0 |
| fa7-solid | Font Awesome Solid | 2000 | original | CC BY 4.0 / CC-BY-4.0 |
| streamline-ultimate | Ultimate free icons | 1999 | original | CC BY 4.0 / CC-BY-4.0 |
| icon-park-solid | IconPark Solid | 1970 | original | Apache 2.0 / Apache-2.0 |
| icon-park-twotone | IconPark TwoTone | 1947 | original | Apache 2.0 / Apache-2.0 |
| iconamoon | IconaMoon | 1818 | original | CC BY 4.0 / CC-BY-4.0 |
| fluent-mdl2 | Fluent UI MDL2 | 1735 | original | MIT / MIT |
| lets-icons | Lets Icons | 1544 | original | CC BY 4.0 / CC-BY-4.0 |
| streamline-sharp | Sharp free icons | 1500 | original | CC BY 4.0 / CC-BY-4.0 |
| streamline-flex | Flex free icons | 1500 | original | CC BY 4.0 / CC-BY-4.0 |
| streamline-plump | Plump free icons | 1499 | original | CC BY 4.0 / CC-BY-4.0 |
| ix | Siemens Industrial Experience Icons | 1498 | original | MIT / MIT |
| famicons | Famicons | 1342 | original | MIT / MIT |
| pixelarticons | Pixelarticons | 1308 | original | MIT / MIT |
| si | Sargam Icons | 1305 | original | MIT / MIT |
| pepicons-pop | Pepicons Pop! | 1298 | original | CC BY 4.0 / CC-BY-4.0 |
| heroicons | HeroIcons | 1297 | original | MIT / MIT |
| pepicons-print | Pepicons Print | 1286 | original | CC BY 4.0 / CC-BY-4.0 |
| pepicons-pencil | Pepicons Pencil | 1275 | original | CC BY 4.0 / CC-BY-4.0 |
| f7 | Framework7 Icons | 1253 | original | MIT / MIT |
| uil | Unicons | 1244 | original | Apache 2.0 / Apache-2.0 |
| teenyicons | Teenyicons | 1200 | original | MIT / MIT |
| dinkie-icons | Dinkie Icons | 1198 | original | MIT / MIT |
| clarity | Clarity | 1105 | original | MIT / MIT |
| majesticons | Majesticons | 1045 | original | MIT / MIT |
| mage | Mage Icons | 1042 | original | Apache 2.0 / Apache-2.0 |
| streamline-plump-color | Plump color icons | 1000 | original | CC BY 4.0 / CC-BY-4.0 |
| streamline-freehand-color | Freehand color icons | 1000 | original | CC BY 4.0 / CC-BY-4.0 |
| streamline-flex-color | Flex color icons | 1000 | original | CC BY 4.0 / CC-BY-4.0 |
| streamline-sharp-color | Sharp color icons | 1000 | original | CC BY 4.0 / CC-BY-4.0 |
| streamline-freehand | Freehand free icons | 1000 | original | CC BY 4.0 / CC-BY-4.0 |
| streamline-ultimate-color | Ultimate color icons | 998 | original | CC BY 4.0 / CC-BY-4.0 |
| stash | Stash Icons | 982 | original | MIT / MIT |
| octicon | Octicons | 951 | original | MIT / MIT |
| jam | Jam Icons | 940 | original | MIT / MIT |
| fluent-color | Fluent UI System Color Icons | 890 | original | MIT / MIT |
| glyphs-poly | Glyphs Poly | 863 | original | MIT / MIT |
| gravity-ui | Gravity UI Icons | 799 | original | MIT / MIT |
| streamline-pixel | Pixel free icons | 662 | original | CC BY 4.0 / CC-BY-4.0 |
| marketeq | Marketeq | 590 | original | MIT / MIT |
| streamline-cyber-color | Cyber color icons | 500 | original | CC BY 4.0 / CC-BY-4.0 |
| streamline-cyber | Cyber free icons | 500 | original | CC BY 4.0 / CC-BY-4.0 |
| garden | Garden SVG Icons | 492 | original | Apache 2.0 / Apache-2.0 |
| streamline-kameleon-color | Kameleon color icons | 400 | original | CC BY 4.0 / CC-BY-4.0 |
| heroicons-solid | HeroIcons v1 Solid | 389 | original | MIT / MIT |
| lucide-lab | Lucide Lab | 388 | original | ISC / ISC |
| heroicons-outline | HeroIcons v1 Outline | 385 | original | MIT / MIT |
| radix-icons | Radix Icons | 345 | original | MIT / MIT |
| streamline-block | Streamline Block | 300 | original | CC BY 4.0 / CC-BY-4.0 |
| feather | Feather Icons | 286 | original | MIT / MIT |
| fe | Feather Icon | 255 | original | MIT / MIT |
| streamline-stickies-color | Stickies color icons | 200 | original | CC BY 4.0 / CC-BY-4.0 |
