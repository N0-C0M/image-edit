# Icon Map

Удобная карта локальной библиотеки. Она генерируется автоматически из manifests и semantic taxonomy.

- **Icons:** 300000
- **Families:** 3
- **Packs:** 148
- Машинный каталог: `catalog/packs.json`
- Категории: `catalog/categories.json`
- Стили: `catalog/styles.json`
- Taxonomy rules: `catalog/taxonomy.json`
- Поиск: `node scripts/search-icons.mjs <query>`

## Families

| Family | Icons | Packs | Root | Manifest |
|---|---:|---:|---|---|
| beautiful | 100000 | 68 | library-beautiful/ | manifest-beautiful.jsonl |
| core | 100000 | 22 | library/ | manifest.jsonl |
| handdrawn | 100000 | 58 | library-handdrawn/ | manifest-handdrawn.jsonl |

## Semantic categories

| Category | Icons | Top packs |
|---|---:|---|
| misc | 107294 | core:selfhst, core:thesvg-color, core:token-branded, core:arcticons, core:thesvg |
| shapes-symbols | 37310 | core:ph, beautiful:glyphs, handdrawn:glyphs, beautiful:streamline, core:fluent |
| navigation | 27046 | core:fluent, handdrawn:fluent, beautiful:keyline-icons, handdrawn:keyline-icons, core:ph |
| actions | 18695 | core:mdi, core:material-symbols-light, core:material-symbols, beautiful:pepicons-print, core:reicon |
| emoji | 15698 | core:twemoji, core:openmoji, core:noto, beautiful:fluent-emoji, handdrawn:fluent-emoji |
| files | 13264 | beautiful:fluent-mdl2, handdrawn:fluent-mdl2, core:ph, core:mdi, core:fluent |
| communication | 8767 | core:fluent, core:solar, core:hugeicons, core:reicon, handdrawn:solar |
| analytics | 8516 | beautiful:mingcute, handdrawn:mingcute, beautiful:ri, handdrawn:ri, core:solar |
| finance | 6060 | core:iconmind, core:tabler, handdrawn:tabler, core:mdi, core:ph |
| gaming | 6001 | core:game-icons, beautiful:mynaui, handdrawn:mynaui, core:solar, beautiful:tdesign |
| development | 5615 | core:iconmind, beautiful:keyline-icons, handdrawn:keyline-icons, core:fluent, handdrawn:iconmind |
| people | 5496 | core:noto, core:twemoji, core:openmoji, beautiful:fluent-emoji, handdrawn:fluent-emoji |
| devices | 5316 | beautiful:streamline, core:ic, handdrawn:streamline, core:material-symbols-light, core:material-symbols |
| security | 4698 | core:solar, beautiful:iconamoon, handdrawn:iconamoon, core:mdi, core:hugeicons |
| time-calendar | 4498 | core:fluent, core:arcticons, beautiful:keyline-icons, handdrawn:keyline-icons, core:mdi |
| maps-travel | 4187 | core:mdi, core:tabler, beautiful:glyphs, core:material-symbols, core:material-symbols-light |
| media | 4144 | core:solar, beautiful:streamline, core:reicon, core:mdi, core:ic |
| commerce | 3838 | core:solar, handdrawn:solar, core:reicon, beautiful:streamline, core:hugeicons |
| nature | 2566 | core:openmoji, core:ph, core:twemoji, core:noto, beautiful:glyphs |
| brands | 2542 | core:tabler, handdrawn:tabler, beautiful:ion, handdrawn:ion, core:ph |
| health | 2540 | core:openmoji, core:twemoji, core:noto, core:solar, core:reicon |
| weather | 2229 | core:boxicons, core:solar, beautiful:carbon, handdrawn:carbon, beautiful:streamline |
| education | 1916 | core:fluent, handdrawn:fluent, core:material-symbols, core:twemoji, core:openmoji |
| food | 1764 | beautiful:streamline, core:mdi, handdrawn:streamline, core:ph, core:boxicons |

## Visual styles

| Style | Icons | Top packs |
|---|---:|---|
| handdrawn | 103524 | handdrawn:boxicons, handdrawn:fluent-emoji, handdrawn:fluent, handdrawn:glyphs, handdrawn:hugeicons |
| filled | 63669 | core:fluent, core:reicon, beautiful:fa7-solid, handdrawn:fa7-solid, beautiful:icon-park-solid |
| standard | 60073 | core:hugeicons, core:tabler, core:mdi, beautiful:streamline, beautiful:carbon |
| color | 59526 | core:selfhst, core:thesvg-color, core:twemoji, core:openmoji, core:token-branded |
| outline | 42702 | core:iconmind, beautiful:icon-park-outline, handdrawn:icon-park-outline, core:solar, core:fluent |
| brand | 26073 | core:arcticons, core:selfhst, core:thesvg-color, core:token-branded, core:thesvg |
| duotone | 24607 | core:iconmind, core:noto, core:twemoji, core:openmoji, beautiful:icon-park-twotone |
| sharp | 12213 | beautiful:keyline-icons, beautiful:streamline-sharp, handdrawn:streamline-sharp, handdrawn:keyline-icons, core:material-symbols |
| rounded | 10043 | core:material-symbols-light, core:material-symbols, beautiful:streamline-plump, handdrawn:streamline-plump, beautiful:streamline-plump-color |
| game | 4517 | core:game-icons, beautiful:streamline-freehand-color, beautiful:streamline-freehand, handdrawn:streamline-freehand-color, handdrawn:streamline-freehand |
| minimal | 1444 | core:simple-icons, core:ph, handdrawn:ph, core:arcticons, beautiful:si |
| pixel | 1393 | beautiful:streamline-pixel, handdrawn:streamline-pixel, beautiful:glyphs, beautiful:streamline-ultimate, core:selfhst |
| sticker | 812 | beautiful:f7, core:tabler, core:material-symbols, core:material-symbols-light, handdrawn:tabler |
| glass | 359 | beautiful:streamline, beautiful:fa7-solid, beautiful:heroicons, handdrawn:heroicons, handdrawn:streamline |
| neon | 11 | core:token-branded, core:thesvg-color, core:arcticons, core:game-icons, core:thesvg |

## Packs

| Family | Prefix | Pack | Icons | Dominant category | Styles | License |
|---|---|---|---:|---|---|---|
| core | arcticons | Arcticons | 5000 | misc | brand, color, minimal, rounded | CC-BY-SA-4.0 |
| core | fluent | Fluent UI System Icons | 5000 | shapes-symbols | outline, filled, standard, sticker | MIT |
| core | ic | Google Material Icons | 5000 | misc | outline, standard, rounded, filled | Apache-2.0 |
| core | hugeicons | Huge Icons | 5000 | misc | standard, outline, sticker, rounded | MIT |
| core | iconmind | IconMind | 5000 | misc | outline, duotone, filled, sticker | MIT |
| core | mdi | Material Design Icons | 5000 | misc | standard, outline, filled, sticker | Apache-2.0 |
| core | material-symbols | Material Symbols | 5000 | misc | outline, rounded, standard, sharp | Apache-2.0 |
| core | material-symbols-light | Material Symbols Light | 5000 | misc | outline, rounded, sharp, standard | Apache-2.0 |
| core | ph | Phosphor | 5000 | shapes-symbols | standard, filled, duotone, minimal | MIT |
| core | reicon | Reicon | 5000 | misc | filled, standard, duotone, rounded | MIT |
| core | selfhst | selfh.st/icons | 5000 | misc | brand, color, outline, pixel | CC-BY-4.0 |
| core | solar | Solar | 5000 | misc | outline, duotone, filled, standard | CC-BY-4.0 |
| core | tabler | Tabler Icons | 5000 | misc | standard, filled, brand, sticker | MIT |
| core | thesvg-color | theSVG Color | 4864 | misc | brand, color, game, outline | MIT |
| core | twemoji | Twitter Emoji | 4728 | emoji | color, duotone, glass, game | CC-BY-4.0 |
| core | openmoji | OpenMoji | 4651 | emoji | color, duotone, rounded, glass | CC-BY-SA-4.0 |
| core | token-branded | Web3 Icons Branded | 4167 | misc | brand, color, neon, game | MIT |
| core | game-icons | Game Icons | 4137 | gaming | game, rounded, duotone, glass | CC-BY-3.0 |
| core | noto | Noto Emoji | 4104 | emoji | color, duotone, glass, game | Apache-2.0 |
| beautiful | streamline | Streamline | 4000 | shapes-symbols | standard, filled, outline, color | CC-BY-4.0 |
| core | boxicons | Boxicons | 3768 | misc | filled, standard, outline, rounded | MIT |
| core | thesvg | theSVG | 3751 | misc | brand, game, outline, sharp | MIT |
| beautiful | glyphs | Glyphs | 3452 | shapes-symbols | standard, filled, outline, handdrawn | MIT |
| beautiful | mingcute | MingCute Icon | 3364 | analytics | outline, filled, handdrawn, color | Apache-2.0 |
| beautiful | keyline-icons | Keyline Icons | 3250 | navigation | sharp, duotone, filled, standard | MIT |
| beautiful | ri | Remix Icon | 3244 | misc | outline, filled, standard, handdrawn | Apache-2.0 |
| beautiful | fluent-emoji | Fluent Emoji | 3181 | emoji | color, glass, duotone, game | MIT |
| handdrawn | boxicons | Boxicons | 3000 | misc | handdrawn, filled, outline, rounded | MIT |
| handdrawn | fluent-emoji | Fluent Emoji | 3000 | emoji | color, handdrawn, glass, duotone | MIT |
| handdrawn | fluent | Fluent UI System Icons | 3000 | navigation | handdrawn, outline, filled, sticker | MIT |
| handdrawn | glyphs | Glyphs | 3000 | shapes-symbols | handdrawn, filled, outline, rounded | MIT |
| handdrawn | hugeicons | Huge Icons | 3000 | misc | handdrawn, outline, sticker, game | MIT |
| handdrawn | iconmind | IconMind | 3000 | misc | handdrawn, outline, duotone, filled | MIT |
| handdrawn | keyline-icons | Keyline Icons | 3000 | navigation | handdrawn, sharp, duotone, filled | MIT |
| handdrawn | mingcute | MingCute Icon | 3000 | analytics | handdrawn, outline, filled, color | Apache-2.0 |
| handdrawn | ph | Phosphor | 3000 | shapes-symbols | handdrawn, filled, duotone, minimal | MIT |
| handdrawn | reicon | Reicon | 3000 | misc | handdrawn, filled, duotone, rounded | MIT |
| handdrawn | ri | Remix Icon | 3000 | misc | handdrawn, outline, filled, color | Apache-2.0 |
| handdrawn | solar | Solar | 3000 | misc | handdrawn, outline, filled, duotone | CC-BY-4.0 |
| handdrawn | streamline | Streamline | 3000 | shapes-symbols | handdrawn, filled, outline, color | CC-BY-4.0 |
| handdrawn | tabler | Tabler Icons | 3000 | misc | handdrawn, filled, brand, sticker | MIT |
| beautiful | mynaui | Myna UI Icons | 2892 | misc | filled, standard, brand, duotone | MIT |
| handdrawn | mynaui | Myna UI Icons | 2892 | misc | handdrawn, filled, brand, duotone | MIT |
| beautiful | carbon | Carbon | 2779 | misc | standard, filled, outline, brand | Apache-2.0 |
| handdrawn | carbon | Carbon | 2779 | misc | handdrawn, filled, outline, brand | Apache-2.0 |
| beautiful | icon-park | IconPark | 2658 | misc | color, duotone, outline, rounded | Apache-2.0 |
| handdrawn | icon-park | IconPark | 2658 | misc | color, handdrawn, duotone, outline | Apache-2.0 |
| beautiful | icon-park-outline | IconPark Outline | 2658 | misc | outline, duotone, rounded, game | Apache-2.0 |
| handdrawn | icon-park-outline | IconPark Outline | 2658 | misc | handdrawn, outline, duotone, rounded | Apache-2.0 |
| beautiful | ion | IonIcons | 2607 | misc | standard, outline, sharp, brand | MIT |
| handdrawn | ion | IonIcons | 2607 | misc | handdrawn, outline, sharp, brand | MIT |
| beautiful | tdesign | TDesign Icons | 2370 | misc | standard, filled, brand, outline | MIT |
| handdrawn | tdesign | TDesign Icons | 2370 | misc | handdrawn, filled, brand, outline | MIT |
| beautiful | lucide | Lucide | 2102 | misc | standard, outline, sticker, rounded | ISC |
| handdrawn | lucide | Lucide | 2102 | misc | handdrawn, outline, sticker, rounded | ISC |
| beautiful | bi | Bootstrap Icons | 2090 | misc | standard, filled, color, sticker | MIT |
| handdrawn | bi | Bootstrap Icons | 2090 | misc | handdrawn, filled, color, sticker | MIT |
| beautiful | iconoir | Iconoir | 2020 | misc | standard, filled, outline, color | MIT |
| beautiful | griddy-icons | Griddy Icons | 2010 | misc | standard, filled, duotone, outline | MIT |
| handdrawn | griddy-icons | Griddy Icons | 2010 | misc | handdrawn, filled, duotone, outline | MIT |
| beautiful | fa7-solid | Font Awesome Solid | 2000 | shapes-symbols | filled, outline, glass, minimal | CC-BY-4.0 |
| beautiful | streamline-color | Streamline color | 2000 | misc | color, game, duotone, rounded | CC-BY-4.0 |
| handdrawn | streamline-color | Streamline color | 2000 | misc | color, handdrawn, game, duotone | CC-BY-4.0 |
| beautiful | streamline-ultimate | Ultimate free icons | 1999 | misc | filled, standard, brand, color | CC-BY-4.0 |
| handdrawn | streamline-ultimate | Ultimate free icons | 1999 | misc | handdrawn, filled, brand, color | CC-BY-4.0 |
| handdrawn | fa7-solid | Font Awesome Solid | 1971 | shapes-symbols | filled, handdrawn, outline, glass | CC-BY-4.0 |
| beautiful | icon-park-solid | IconPark Solid | 1970 | misc | filled, duotone, rounded, game | Apache-2.0 |
| handdrawn | icon-park-solid | IconPark Solid | 1970 | misc | filled, handdrawn, duotone, rounded | Apache-2.0 |
| beautiful | icon-park-twotone | IconPark TwoTone | 1947 | misc | duotone, rounded, game, outline | Apache-2.0 |
| handdrawn | icon-park-twotone | IconPark TwoTone | 1947 | misc | duotone, handdrawn, rounded, game | Apache-2.0 |
| beautiful | iconamoon | IconaMoon | 1818 | misc | standard, filled, duotone, sticker | CC-BY-4.0 |
| handdrawn | iconamoon | IconaMoon | 1818 | misc | handdrawn, filled, duotone, sticker | CC-BY-4.0 |
| beautiful | fluent-mdl2 | Fluent UI MDL2 | 1735 | files | standard, filled, brand, color | MIT |
| handdrawn | fluent-mdl2 | Fluent UI MDL2 | 1735 | files | handdrawn, filled, brand, color | MIT |
| beautiful | lets-icons | Lets Icons | 1544 | misc | standard, duotone, filled, outline | CC-BY-4.0 |
| beautiful | streamline-flex | Flex free icons | 1500 | shapes-symbols | standard, filled, outline, sticker | CC-BY-4.0 |
| handdrawn | streamline-flex | Flex free icons | 1500 | shapes-symbols | handdrawn, filled, outline, sticker | CC-BY-4.0 |
| beautiful | streamline-sharp | Sharp free icons | 1500 | misc | sharp, filled, outline, game | CC-BY-4.0 |
| handdrawn | streamline-sharp | Sharp free icons | 1500 | misc | handdrawn, sharp, filled, outline | CC-BY-4.0 |
| beautiful | streamline-plump | Plump free icons | 1499 | misc | rounded, filled, outline, game | CC-BY-4.0 |
| handdrawn | streamline-plump | Plump free icons | 1499 | misc | handdrawn, rounded, filled, outline | CC-BY-4.0 |
| beautiful | ix | Siemens Industrial Experience Icons | 1498 | shapes-symbols | standard, filled, outline, brand | MIT |
| beautiful | famicons | Famicons | 1342 | misc | sharp, outline, standard, brand | MIT |
| beautiful | pixelarticons | Pixelarticons | 1308 | misc | standard, sharp, filled, sticker | MIT |
| beautiful | si | Sargam Icons | 1305 | misc | duotone, filled, outline, minimal | MIT |
| beautiful | pepicons-pop | Pepicons Pop! | 1298 | shapes-symbols | standard, filled, outline, color | CC-BY-4.0 |
| beautiful | heroicons | HeroIcons | 1297 | shapes-symbols | filled, standard, glass, sticker | MIT |
| handdrawn | heroicons | HeroIcons | 1297 | shapes-symbols | handdrawn, filled, glass, sticker | MIT |
| beautiful | pepicons-print | Pepicons Print | 1286 | shapes-symbols | standard, filled, outline, color | CC-BY-4.0 |
| beautiful | pepicons-pencil | Pepicons Pencil | 1275 | shapes-symbols | handdrawn, filled, outline, color | CC-BY-4.0 |
| beautiful | f7 | Framework7 Icons | 1253 | shapes-symbols | standard, filled, sticker, outline | MIT |
| beautiful | uil | Unicons | 1244 | misc | standard, outline, glass, filled | Apache-2.0 |
| beautiful | teenyicons | Teenyicons | 1200 | shapes-symbols | outline, filled, sharp, game | MIT |
| handdrawn | teenyicons | Teenyicons | 1200 | shapes-symbols | handdrawn, outline, filled, sharp | MIT |
| beautiful | dinkie-icons | Dinkie Icons | 1198 | shapes-symbols | standard, filled, duotone, glass | MIT |
| beautiful | clarity | Clarity | 1105 | shapes-symbols | outline, filled, sticker, color | MIT |
| handdrawn | clarity | Clarity | 1105 | shapes-symbols | handdrawn, outline, filled, sticker | MIT |
| beautiful | majesticons | Majesticons | 1045 | analytics | outline, standard, minimal, color | MIT |
| handdrawn | majesticons | Majesticons | 1045 | analytics | handdrawn, outline, minimal, color | MIT |
| beautiful | mage | Mage Icons | 1042 | misc | standard, filled, rounded, color | Apache-2.0 |
| beautiful | streamline-flex-color | Flex color icons | 1000 | misc | color, sticker, rounded, outline | CC-BY-4.0 |
| handdrawn | streamline-flex-color | Flex color icons | 1000 | misc | color, handdrawn, sticker, rounded | CC-BY-4.0 |
| beautiful | streamline-freehand-color | Freehand color icons | 1000 | misc | color, handdrawn, game, outline | CC-BY-4.0 |
| handdrawn | streamline-freehand-color | Freehand color icons | 1000 | misc | color, handdrawn, game, outline | CC-BY-4.0 |
| beautiful | streamline-freehand | Freehand free icons | 1000 | shapes-symbols | handdrawn, game, color, outline | CC-BY-4.0 |
| handdrawn | streamline-freehand | Freehand free icons | 1000 | shapes-symbols | handdrawn, game, color, outline | CC-BY-4.0 |
| beautiful | streamline-plump-color | Plump color icons | 1000 | misc | color, rounded, game, handdrawn | CC-BY-4.0 |
| handdrawn | streamline-plump-color | Plump color icons | 1000 | misc | color, handdrawn, rounded, game | CC-BY-4.0 |
| beautiful | streamline-sharp-color | Sharp color icons | 1000 | misc | color, sharp, game, duotone | CC-BY-4.0 |
| handdrawn | streamline-sharp-color | Sharp color icons | 1000 | misc | color, handdrawn, sharp, game | CC-BY-4.0 |
| beautiful | streamline-ultimate-color | Ultimate color icons | 998 | misc | color, brand, game, outline | CC-BY-4.0 |
| handdrawn | streamline-ultimate-color | Ultimate color icons | 998 | misc | color, handdrawn, brand, game | CC-BY-4.0 |
| beautiful | stash | Stash Icons | 982 | misc | standard, duotone, filled, color | MIT |
| beautiful | octicon | Octicons | 951 | shapes-symbols | standard, filled, brand, handdrawn | MIT |
| handdrawn | octicon | Octicons | 951 | shapes-symbols | handdrawn, filled, brand, sticker | MIT |
| beautiful | jam | Jam Icons | 940 | misc | standard, filled, glass, color | MIT |
| beautiful | fluent-color | Fluent UI System Color Icons | 890 | misc | color, sticker, outline, game | MIT |
| handdrawn | fluent-color | Fluent UI System Color Icons | 890 | misc | color, handdrawn, sticker, outline | MIT |
| beautiful | glyphs-poly | Glyphs Poly | 863 | shapes-symbols | color, filled, outline, handdrawn | MIT |
| core | simple-icons | Simple Icons | 830 | misc | brand, minimal, sharp | CC0-1.0 |
| beautiful | gravity-ui | Gravity UI Icons | 799 | misc | standard, filled, brand, outline | MIT |
| handdrawn | gravity-ui | Gravity UI Icons | 799 | misc | handdrawn, filled, brand, outline | MIT |
| beautiful | streamline-pixel | Pixel free icons | 662 | misc | pixel, brand, color, handdrawn | CC-BY-4.0 |
| handdrawn | streamline-pixel | Pixel free icons | 662 | misc | handdrawn, pixel, brand, color | CC-BY-4.0 |
| beautiful | marketeq | Marketeq | 590 | misc | color, handdrawn, outline, rounded | MIT |
| beautiful | streamline-cyber-color | Cyber color icons | 500 | misc | color, sticker, glass, handdrawn | CC-BY-4.0 |
| handdrawn | streamline-cyber-color | Cyber color icons | 500 | misc | color, handdrawn, sticker, glass | CC-BY-4.0 |
| beautiful | streamline-cyber | Cyber free icons | 500 | misc | standard, sticker, glass, handdrawn | CC-BY-4.0 |
| handdrawn | streamline-cyber | Cyber free icons | 500 | misc | handdrawn, sticker, glass, outline | CC-BY-4.0 |
| beautiful | garden | Garden SVG Icons | 492 | shapes-symbols | filled, outline, standard, sticker | Apache-2.0 |
| beautiful | streamline-kameleon-color | Kameleon color icons | 400 | misc | color, handdrawn, glass | CC-BY-4.0 |
| handdrawn | streamline-kameleon-color | Kameleon color icons | 400 | misc | color, handdrawn, glass | CC-BY-4.0 |
| beautiful | heroicons-solid | HeroIcons v1 Solid | 389 | files | filled, glass, color, handdrawn | MIT |
| handdrawn | heroicons-solid | HeroIcons v1 Solid | 389 | files | filled, handdrawn, glass, color | MIT |
| beautiful | lucide-lab | Lucide Lab | 388 | misc | standard, filled, glass | ISC |
| handdrawn | lucide-lab | Lucide Lab | 388 | misc | handdrawn, filled, glass | ISC |
| beautiful | heroicons-outline | HeroIcons v1 Outline | 385 | files | outline, glass, color, handdrawn | MIT |
| handdrawn | heroicons-outline | HeroIcons v1 Outline | 385 | files | handdrawn, outline, glass, color | MIT |
| beautiful | radix-icons | Radix Icons | 345 | shapes-symbols | standard, brand, filled, handdrawn | MIT |
| handdrawn | radix-icons | Radix Icons | 345 | shapes-symbols | handdrawn, brand, filled, sticker | MIT |
| beautiful | streamline-block | Streamline Block | 300 | misc | standard, color, filled | CC-BY-4.0 |
| handdrawn | streamline-block | Streamline Block | 300 | misc | handdrawn, color, filled | CC-BY-4.0 |
| beautiful | feather | Feather Icons | 286 | misc | standard, filled | MIT |
| handdrawn | feather | Feather Icons | 286 | misc | handdrawn, filled | MIT |
| beautiful | fe | Feather Icon | 255 | misc | standard, glass, filled, outline | MIT |
| handdrawn | fe | Feather Icon | 255 | misc | handdrawn, glass, filled, outline | MIT |
| beautiful | streamline-stickies-color | Stickies color icons | 200 | misc | color | CC-BY-4.0 |
| handdrawn | streamline-stickies-color | Stickies color icons | 200 | misc | color, handdrawn | CC-BY-4.0 |

## AI routing

1. Определи semantic category.
2. Выбери family под визуальный язык проекта.
3. Выбери pack, не смешивая соседние controls из разных наборов без причины.
4. Выполни поиск по имени/синонимам.
5. Открой 2–5 кандидатов и выбери по семантике и optical weight.
6. Проверь license metadata и accessibility.

## Web explorer

GitHub Pages собирается workflow `.github/workflows/deploy-pages.yml`. Сайт использует pack indexes, search shards и SVG sprites вместо загрузки сотен тысяч отдельных файлов.
