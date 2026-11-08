# Kâbe Ustaları: Robustness, Polish, and the Second Layer: Report

7 November 2026 · Web version: artifact **v16** · App: `app/www` (synced with Capacitor 6)

## In short
- **Robustness:** all 18 verified Codex findings (T03–T20) are fixed. I also added the Android back button, recovery from graphics loss, and on-screen clamping for the target label.
- **Polish:** loads now fly between the pile and the hero's arms. Other changes:
  - Vibration (with an off switch).
  - A "Buy" card for upgrades.
  - A one-line HUD task ("Take to: Wall").
  - The type of load you're carrying is shown.
  - The scaffolding is translucent.
  - The results screen says "Next: …".
  - The settings screen has real content.
- **Second layer, "Hacılara Hizmet":** it unlocks after Chapter 7 and has endless pilgrimage seasons.
- **Tests:** 31/31 new tests passed, and 17/17 Phase 1 tests passed again (no regressions).

## 1. Robustness (Codex T03–T20)

| No | Problem | Fix | Test |
|---|---|---|---|
| T03 | Result → Next → Back gave a blank screen | Back opens the map when nothing else is on screen | ✅ 20 repeats, 0 blank screens |
| T04 | Time and workshops kept running while the book or map was open | A single `gameActive()` gate. The world stops while the book, map, a sheet, or a background state is open | ✅ 30 s with the book open: time, stone, and workshops unchanged |
| T05 | In Chapter 4, "fight" and "dawn" could happen in the same frame | Only one result is possible. In the same frame, dawn wins | ✅ Both orders give a single screen |
| T06 | Progress was lost when the app was closed | Saved every 2 s and when the app goes to the background. "Play" offers Continue / Start over | ✅ Chapters 1–7: save → close → open → continue |
| T07 | The discovery book was lost | Now saved inside the profile | ✅ |
| T08 | The arrow pointed to the wrong place while carrying the wrong material | The target is based on what you are holding | ✅ 6 cases |
| T09 | A broken save could break the game | Versioned save with a whitelist and range limits. Falls back to the backup copy | ✅ 4 kinds of corrupt save + backup recovery |
| T10 | Upgrade pads spent your bereket automatically | A "Buy" card appears. Nothing is spent unless you buy | ✅ 5 s standing on a pad: 0 spent |
| T11/T12 | The bonus was missing from chapter earnings; the Chapter 7 threshold was wrong | Single ledger. Bonus is paid before results. Threshold = actual capacity | ✅ Profile +28 = chapter +28 |
| T13 | Cutscene objects were never freed | Freed. Shared objects are protected | ✅ 10 repeats: +2 geometries |
| T14 | Each Chapter 4 run added new fires | A pool of 4 fires | ✅ 20 tries: 8 → 8 |
| T15 | Held keys/touches stayed stuck | Reset in all 6 situations | ✅ 0.000 m movement |
| T16 | Audio kept running in the background | Suspends in the background, resumes on the first touch | (verified in code) |
| T17 | Controls/About opened nothing | Content now shows inside Settings | ✅ |
| T18 | Reduced motion wasn't supported | System setting + toggle in Settings. Shake/flash is off in cutscenes | ✅ |
| T19 | Time shown as "1:60" | "2:00" | ✅ |
| T20 | The HUD was rewritten every frame | Only changed values are written | (verified in code) |
| New | Android back button | Sheet → pause → map → title → exit | ✅ Logic tested |
| New | Graphics context loss | Save, show a message, reload, resume | (verified in code) |
| New | Target label clipped at the screen edge | Measured and kept inside the screen | ✅ 16/16 frames fully visible |

## 2. Second layer: Hacılara Hizmet (Serving the Pilgrims)
**Historical basis:** pilgrims were given water (*sikâye*) and food (*rifâde*). Kusay b. Kilâb organised these duties. The name "Hâşim" comes from making tirit (bread soaked in broth). The opening card states clearly which parts are historical and which are game mechanics.

**How it works:**
- There are three stands:
  - **Water:** from Zemzem, 2 bereket per serving.
  - **Dates:** from the caravan, 4 bereket.
  - **Bread:** flour → oven → bread, 6 bereket.
- Pilgrims join the shortest queue and get served.
- After being served, they do one tawaf circuit (Kaaba on their left, counter-clockwise) and leave.
- If they wait too long, they leave unhappy.
- Bereket piles up on the counter; you collect it by walking to the counter.
- **Seasons:** 15 → 25 → 40 → 60 … pilgrims, endless. Each season ends with a reward and a "Did you know?" card.
- **9 upgrades,** shown 3 at a time and bought through the card:
  - Helpers: water carrier (saka), date helper, baker's apprentice.
  - Capacity, shade (patience +50%), large counter.
- **While you are away:** only hired helpers work. Earnings are capped at 2 hours and paid at 50%. A "Welcome back" card shows what they made.
- **On the map:** a locked teaser before Chapter 7. After that, an "∞ Season N" node.
- The hero is still nameless. No historical person is depicted.

## 3. Tests (Chromium on Linux, mobile emulation, SwiftShader)
- `test/t22_saglamlik.py`: **31/31**. Details are in `test/t22_cikti.txt` and `t22_sonuc.json`.
- `test/t21_asama1.py` (Phase 1 again):
  - **17/17.** Viewport, large text, CDN failure, offline app.
- **Not tested, so not counted as passed:**
  - A real iPhone or Android device.
  - The native Android back button. Only the logic was tested; the native event needs a device.
  - Vibration on a real device.
  - The GPU-loss scenario on a real device.
  - Audio suspend in the background (browser emulation can't do this).

## 4. Files
| Path | Contents |
|---|---|
| `web/kabe-ustalari.html` | The web version (the same file as the artifact) |
| `app/www/` | Offline app package (already copied into the Capacitor project with `npx cap sync`) |
| `app/package.json` | Added `@capacitor/app` and `@capacitor/haptics` 6.0.3 |
| `kaynak/` | Full source; `python build.py` rebuilds everything |
| `asama2-4.patch` | Changes since Phase 1 (l9, l10, l11, build.py + new l12, l13) |
| `CODEX_SON_KONTROL.md` | Instructions for Codex's single final check |
| `BUILD_MANIFEST.json` | Hashes of all inputs and outputs |
