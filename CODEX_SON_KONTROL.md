# Codex: final independent check (one pass)

This is a single check pass. No new features are being asked for. Please report only real bugs, and show the file and line for each.

## Where to look
- `kaynak/`: the complete source. Build it with `python build.py`.
- `kaynak/l12.js`: new. Robustness and polish.
- `kaynak/l13.js`: new. "Hacılara Hizmet" (the second layer after the story).
- `kaynak/l9.js`, `l10.js`, `l11.js`: changed. Changes since Phase 1 are in `asama2-4.patch`.
- `test/t22_saglamlik.py` + `test/tlib.py`: the tests I ran. Results are in `test/t22_sonuc.json`.

## Your earlier findings (T03–T20) and where they were fixed

| No | Fix | Where |
|---|---|---|
| T03 | The story card's "Back" opens the map when nothing else is on screen | l11 `showStory` |
| T04 | A single `gameActive()` gate: the simulation clock stops while the book, map, a sheet or a hidden page is open | l9 `siteStep`, `sdt` |
| T05 | `R.ended` guard. Order inside one frame: first dawn, then the fight | l11 `ch4Step`, `fail4`, `chapterDone` |
| T06 | A running chapter is saved every 2 s and when the app goes to the background. "Play" offers "Continue / Start over" | l12 `saveRun` / `resumeRun` |
| T07 | `D.codex` is persisted and merged back into `G.found` | l9 `ssave` / `sload` |
| T08 | The target depends on what the player is holding first | l12 `siteTarget` |
| T09 | Versioned save with a whitelist and range clamping. Falls back to the `-bak` copy | l9 `cleanProfile` |
| T10 | Pads no longer spend automatically. A card with a "Buy" button appears | l9 + l12 `#kpad` |
| T11/T12 | One `award()` ledger. The bonus is paid out before results. The capacity threshold is `hooks.cap()` | l9 |
| T13 | Cutscene objects are disposed. Objects in the scene at load time are shared | l10 `disposeObj`, l12 baseline |
| T14 | The clan fires are a pool | l10 `FIRE_POOL` |
| T15 | `resetInput()`: blur, pagehide, visibility, lostpointercapture, sheet/cutscene | l12 |
| T16 | AudioContext suspend/resume | l12 |
| T17 | Controls/About show their content inside settings | l12 `infoToggle` |
| T18 | `body.rm` + a toggle in settings + no shake/flash in cutscenes | l12 |
| T19 | `Math.round` first, then minutes:seconds | l11 |
| T20 | The HUD writes only values that changed | l12 `setT` |

Also added: the Android back button (`@capacitor/app`), WebGL context loss (save + reload), and keeping the target label on screen.

## What I would like checked
1. Is there any route through the state machine (title / map / sheet / play / cine) that leads to a blank screen or a stuck `state`?
2. Can the `D.run` (resume) and `D.meta` (second layer) saves be corrupted, or can money be gained twice?
3. In `l13.js`, can pilgrims/helpers get stuck, can queues fill without end, and can offline earnings be abused (for example by changing the clock)?
4. Is anything in `disposeObj` wrongly releasing a shared material or geometry?

Not tested: real iOS/Android devices, and the native Android back button (it could only be checked as logic in the browser).
