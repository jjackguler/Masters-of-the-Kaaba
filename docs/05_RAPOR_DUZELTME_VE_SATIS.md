# Kâbe Ustaları: fix block, sales model and polish report

7 November 2026 · Base: d4cc584 (the version Codex reviewed).

## Decisions taken (by the account owner)
| Topic | Decision | Effect on the work |
|---|---|---|
| Target age | **13+** | Families / Kids category rules do not apply. Age rating forms will be filled in as 13+. The privacy text has been updated accordingly. |
| Bâkûm | **Stays as is** | The carpenter figure keeps its name. *Note: whether he is counted among the Companions has not been checked. This is the owner's decision.* |
| Developer account | **Company** | Google Play's "12 testers / 14 days" requirement applies only to new personal accounts. Apple needs a D-U-N-S number. |
| Sales model | **Free demo + one-time unlock** | Chapters 1–2 are free. Chapters 3–7 and Hacılara Hizmet open with a single non-consumable purchase. No ads, no subscription, no consumables; bereket is never sold for real money. |

## 1. Fixes (K1–K13 from 04_CLAUDE_DOGRULAMA_VE_PLAN.md)
| # | Fix | Test |
|---|---|---|
| K1 | **Single save path:** `ssave()` refreshes the current run and the Hacılara Hizmet state before every write (`PRESAVE`). | ✅ After collecting 24 from the counter: saved balance + counter = 224 (no duplication) |
| K2 | The course-end reward is saved together with the course. | ✅ Saved during the cutscene: course 2, inCourse 0, +22 |
| K3 | The time mark for away earnings never goes backwards. | ✅ Clock forward +360 → back: 0 → forward again: 0 · a real hour later: +180 |
| K4 | Loads in the player's and helpers' hands are saved; helpers wait at a full stand. | ✅ 3 waters return on reopening; the water carrier still holds its 3 |
| K5 | A load can be put back onto its own pile when its destination is full; the arrow shows this; more cannot be picked up while the destination is full. | ✅ Full workshop: "Put back: Raw stone" → hands empty → cut stone picked up |
| K6 | The late season screen checks the session token. | ✅ No screen appears on the map after leaving |
| K7 | Stuck watchdog for helpers. | (in code; not reproduced on a device) |
| K8 | An invalid chapter number in a save is rejected. | ✅ `ch:1.5` → no resume offered, no error |
| K9 | Full-load bonus threshold = actual capacity (minimum 2). | ✅ Chapter 7, capacity 3: 3 beams pay +27 (with bonus) |
| K10 | Purchased upgrade circles free their memory. | ✅ Texture count 26 → 24 after 4 purchases |
| K11 | Errors from pausing/resuming audio are caught. | (in code) |
| K12 | The arrow doesn't bob in reduced-motion mode. | ✅ Scale fixed over 6 frames |
| K13 | The night bars only write what changed. | (in code) |

## 2. Polish
- **T2 Status chip (bottom right):** "Loading / Delivering / Full: wait or put back / Wrong material / Being prepared, wait / Hands full". Always icon + text; red on a warning. ✅ Full: "⛔ Dolu"; wrong load: "✖ Yanlış malzeme".
- **T1 Short opening:** Chapter 1's intro dropped from 5 scenes (24.5 s) to 3 scenes (~14 s); the reading time of the speech bubbles stays. The story card has a "Watch the full intro (20 s)" link. ✅
- **T4 Hacılara Hizmet tutorial:** on the first visit, 4 steps (water → stand → serve → collect from the counter). ✅ Each season also has a **mastery goal** in rotation:
  - nobody leaves upset
  - at least X date servings
  - finish within X minutes

  If you achieve it, the season gift is doubled. The season-end screen shows the next upgrade and its benefit. ✅

## 3. Sales mechanism
- Only the **app package** is locked (`STORE_BUILD=true`). The web version (artifact) stays fully open.
- The map shows a "🔒 Full version" badge on chapters 3–7 and on Hacılara Hizmet. Opening them brings up the "Rest of the story" screen with these buttons:
  - **Buy** (the price comes from the store),
  - **Restore purchases**,
  - **Back**.
- Integration: `cordova-plugin-purchase` 13.x (Google Play Billing + StoreKit). Product ID: **`kabe_full_unlock`** (non-consumable). It has to be created in both stores with this exact ID.
- ✅ The lock, badges, Back and opening after purchase were tested in the app build.
- ❌ **Real payment, restore and refund cannot be tested yet:** this requires a store account, a product and a test user (Play license tester, Apple sandbox).
- The privacy policy has been updated: one-time purchase; payment is handled by the store; no data collected; 13+.

## 4. Tests
| Suite | Result |
|---|---|
| `t23_duzeltme.py` (new: K1–K12, T1, T2, T4, sales lock, web fully open) | **16/16** |
| `t22_saglamlik.py` (robustness + Hacılara Hizmet) | **31/31** |
| `t21_asama1.py` (viewport, offline app, fonts) | **17/17** |

**Not tested:**
- real devices;
- real purchase/restore;
- the Android back button on a device;
- audio interruption;
- K7 (helper stuck) on a device.

## 5. What's next
1. **Account owner:** open the company accounts (Google Play Console, Apple Developer + D-U-N-S), settle the support email, publish the privacy policy at a URL.
2. Create the product `kabe_full_unlock` in both stores; I then do the sandbox purchase tests.
3. Native build (Android .aab; iOS needs a Mac or a cloud Mac build), device tests, new store screenshots + 30 s video.
