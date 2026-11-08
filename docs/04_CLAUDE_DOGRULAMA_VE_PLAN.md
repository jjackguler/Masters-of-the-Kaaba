# Kâbe Ustaları: verifying Codex's final review and the action plan

Date: 7 November 2026 · Repo: [jjackguler/Masters-of-the-Kaaba](https://github.com/jjackguler/Masters-of-the-Kaaba) · main = **d4cc584**. This is the same commit Codex reviewed, so nothing has changed since.

Code reading stayed within the token rule: only l9 to l13 were read. No code was changed and nothing was published to the stores.

**Labels:**
- **reproduced:** I reproduced it myself with a headless browser test on the current build.
- **verified in code:** I saw the path in the code but did not reproduce it.
- **possible:** depends on a condition.
- **refuted:** not a real problem.

---

## A. Technical findings (most important first)

| # | Finding · label | Evidence / how to reproduce | Proposed fix | Acceptance test |
|---|---|---|---|---|
| K1 | **Bereket can be collected twice (Pilgrim Service), P1 · reproduced** | Counter holds 24 → collect it (balance 200→224, counter 0) → pause. The save contains **coins 224 + counter 24**. After a reload, the 24 can be collected again. Cause: the "dirty save" in `l12.js` extraStep writes the profile without first updating `D.meta`. `l13.js:183`, `l12.js:204` | **One save path:** `ssave()` always calls `saveMeta()` (counters, stock, items being carried) and `snapRun()` before writing. Remove every other write. | Collect → pause → reload, repeated ×10. The total "balance + counters + stock" never goes up. |
| K2 | **End-of-course reward can be paid again (story), P1 · verified in code** | `award(15)` → course-end cutscene (`state='cine'`) → the dirty save writes coins+15 while `D.run` still holds the **old** course. If the app is closed during the cutscene and reopened, the same course is finished again for another +15. `l11.js:194`, `l12.js:53`, `l12.js:204` | Same as K1: every write includes the current run snapshot. | Close the app during the course-end cutscene; on reopening, `R.course` is ahead and bereket is unchanged. |
| K3 | **Clock trick earns bereket repeatedly, P1 · reproduced** | Water carrier hired, clock moved forward 2 h: **+360**. Clock moved back: `lastT` is pulled back too (null). Forward again: **+360** again. `l13.js:139-143` | `lastT` never goes backwards (high-water mark). The cap is applied to time since the last payout. Note: a forward clock change can't be fully stopped without a trusted external clock. The goal is to make it non-repeatable. | Forward, back, forward again: the second payout is 0. |
| K4 | **Loads being carried are lost (Pilgrim Service), P1 · verified in code** | `startMeta` resets `stack=[]`, and items in hand are not saved. A helper **deletes** its load when the target is full (`h.carry.length=0`). `l13.js:90`, `l13.js:147` | Save the player's and helpers' loads in `D.meta`. If the target is full, the helper waits beside it. | Save while carrying 4 dates → reopen: 4 dates in hand. Helper with a full stand: its load is still there 30 s later. |
| K5 | **Full-workshop deadlock (T08 remainder), P1 · reproduced** | Chapter 3: cutter input 16/16 and output 18/18, player holding raw stone. After 15 s the hand is still raw and the arrow still points at the cutter. Raw stone can't be dropped, and cut stone can't be picked up because the hand is not empty. `l9.js:167`, `l9.js:182`, `l12.js:109` | (1) A load can be **put back** on its own source pile (raw → quarry, log → timber pile). (2) If the target is full, the arrow points to the return spot. (3) A "Full" status chip. | Same setup: within 10 s the player can put down the raw stone, pick up cut stone, and the chain continues. |
| K6 | **Delayed season screen, P1 · possible** | `setTimeout(700)` checks only `R.ch` (`l13.js:124`). `cleanupChapter` leaves `R.ch=8`. If the player goes Pause → Chapters within 700 ms, a sheet can open on top of the map, and "Next" switches to `play` with no world built. | Session token: `leaveMeta` increments it, and the callback runs only if the token matches, the service world is visible and state is `play`. | Leave within 700 ms ×20: no season sheet appears on the map. |
| K7 | **Helper can get stuck, P2 · possible** | Helpers move in a straight line with collisions; the pilgrims' anti-stuck nudge isn't applied to them. `l13.js:88` | Apply the pilgrims' watchdog to helpers too. | 10 min accelerated simulation: every helper moves at least once every 30 s. |
| K8 | **T09 remainder, P2 · verified in code** | `run.ch=1.5` is accepted; `CH[1.5]` doesn't exist, so "Continue" breaks. `l9.js` `cleanProfile`, `l12.js` `resumeRun` | `Number.isInteger` plus a check that `CH[n]` exists. | 1.5, "3", -1, 99 → no resume offered; the game opens normally. |
| K9 | **T12 remainder, P2 · verified in code** | The full-load bonus requires `n>=4`. In Chapter 7 the capacity is 2–3, so it never pays. `l9.js` `unloadBonus` | Condition: `n>=max(2, effective capacity)`. | Chapter 7, capacity 3: 3 beams pay the bonus. |
| K10 | T13 remainder, P3 · verified in code | Removed upgrade pads don't free their texture/material. | Call `disposeObj` on pad removal. | 20 purchases: texture count stays flat. |
| K11 | T16, P3 · verified in code | `resume()`/`suspend()` promise rejections are not caught. | Add `.catch(()=>{})`. | No console error. |
| K12 | T18 remainder, P3 · verified in code | The ground arrow keeps bobbing even with reduced motion on. `l9.js:62` | No bobbing when `RM()` is on. | With reduced motion, arrow scale and distance stay fixed. |
| K13 | T20 remainder, P3 · verified in code | The night bars update the DOM every frame. `l11.js:170` | Write only when values change (the existing `setT/setW` approach). | Night chapter: no DOM writes when nothing changed. |

**Not rejected:** I did not find any Codex finding unfounded. The items marked "possible" (K6, K7) remain possible; I did not reproduce them on a device.

### Depiction boundary
- **El-Emîn:** in the black-stone scene no body or hand of the Prophet (pbuh) is depicted; it is told through narration. Pilgrims and helpers are unnamed. *Status: no violation found. This is not a full compliance statement.*
- **Bâkûm, needs clarification (the decision belongs to a subject expert):** in the Chapter 5 cutscene a visible carpenter speaks under the name "Bâkûm" (`l10.js:180`), and the learning card mentions him (`l11.js:22`).
  - Some biographical works may count him among the Companions. I did not verify this, so I am **not** saying "this is fine".
  - **Safe interim proposal:** drop the name from the visible figure and call him only "Gemi ustası" (ship's carpenter). Mention Bâkûm's name only in narration, with no body.
  - Final decision: after a scholar's opinion.

---

## B. Design: 5 priority tasks
Already in place, so not requested again:
- a one-line task line and the load type with capacity;
- confirm-to-buy upgrades;
- flying loads, vibration and reduced motion;
- the result screen shows what's next and the settings screens have content;
- translucent scaffolding and on-screen labels;
- the angriest clan shown in the night timer.

| # | Task | Change | Acceptance | New visuals needed? |
|---|---|---|---|---|
| T1 | **First 60 seconds** | Chapter 1 intro gets a ~8–10 s short version, with "the full story" moved into the book. Target: first delivery ≤45 s after Play. | Automated test: Play→first load ≤25 s, first delivery ≤45 s. A new player with no explanation can say where to take the load. | No (but timing on a real phone is needed) |
| T2 | **Interaction status chip** (also completes K5) | Bottom right: "Loading / Delivering / Full / Wrong material / Waiting for production", always icon + text. | Every state shows up; it is understandable without colour and without sound. | No |
| T3 | **Camera framing** | Slight look-ahead in the walking direction. Near a delivery or stand the frame widens slightly so the stand and its queue fit together (in Pilgrim Service the stall can fall outside the frame). | Stand and queue visible in the same frame at 360/390/430 px. | **Yes:** screenshots of the new version on the same devices plus a real-device recording |
| T4 | **Pilgrim Service tutorial and goal variety** | First time: water → stand → serve a pilgrim → collect from the counter, in 4 steps. Seasons alternate between short mastery goals ("no one leaves upset", "serve 10 dates") and a preview of the next helper's benefit. | A new player finishes the first season without help. The season goal isn't just "a bigger number". | No |
| T5 | **Visual readability pass** | Screens: title, first task, building, night, result, service. Compared at 360/390/430 px and large text. Reduce the weight of the menu buttons. Gather bars on the night screen near the player. | No overlap or clipping. Clear target-and-route contrast in day and night shots. | **Yes:** new screenshots + device recordings |

---

## C. Marketing and sales
- **Positioning (one sentence):** "Mecca, 605: play the story of the Meccans who rebuilt the Kaaba stone by stone after the flood, through work, solidarity and peace."
- **Target audience hypothesis (needs testing):**
  1. Muslim families: a parent plus children aged 8–14, looking for something educational and trustworthy.
  2. Turkish-speaking casual adult players who already know the Pizza Ready style of loop.
  3. Families abroad who prefer English.
- **Revenue model comparison (no prices are invented):**

| | Paid from the start (premium) | Free demo + one-time unlock |
|---|---|---|
| Reach | Narrow; most people don't pay without trying | Wide; Chapters 1–2 are free |
| Technical work | None (no purchases) | Play Billing + StoreKit, a **restore purchases** button, sandbox tests |
| Policy | Simple | Must be designed to fit the purchase rules if the target audience includes children |
| Values fit | Good | Good, **if** bereket/iyilik are never sold for real money and there are no ads or consumables |
| **Recommendation** | | **Demo (Chapters 1–2) + "Full story and Pilgrim Service" unlocked with a single purchase.** Decision: the account owner. |

- **6 store screenshots (must be retaken from the new build; the old shots show the old HUD):**
  1. "Start with a single stone" (first delivery)
  2. "Raise it step by step" (wall rising)
  3. "Share the work with craftsmen" (helpers / upgrade card)
  4. "Keep the peace" (night chapter)
  5. "Discover the story" (cutscene + learning card)
  6. "Serve the pilgrims" (stands and queue)
- **30-second video:** start with gameplay, not the snake/eagle scenes.

| Seconds | Content |
|---|---|
| 0–3 | A stone is placed and the wall visibly rises |
| 3–6 | "Mecca, 605" plus the flood, very short |
| 6–11 | Raw stone → craftsman → wall |
| 11–16 | Upgrade card + helper |
| 16–21 | Night: water, peace |
| 21–26 | Pilgrim Service: queue, serving, tawaf |
| 26–30 | Logo + one call to action |

  Record it with the existing deterministic capture tool, on the new build. "Ad-free" is true (there are no ads in the code). Keep "Works offline" and "Pick up where you left off" off the ad and store page until the K1–K2 fixes and device tests are done.

---

## D. App Store and Google Play: launch checklist in order
Legend: ✅ ready · ⛔ missing · 🔑 decision for the account owner

| Step | Content | Status |
|---|---|---|
| 1 | Fix K1–K9, retest, pin the candidate commit with a tag | ⛔ |
| 2 | Decisions: final name (TR/EN), **permanent** package/bundle ID (currently `com.kabeustalari.game`), revenue model, target age (if under 13: Families/Kids rules), support email | 🔑 |
| 3 | Developer accounts: Google Play (personal or organisation; organisation affects the testing requirement) and Apple Developer Program | 🔑 |
| 4 | Capacitor 6 project: in Claude's cloud workspace, `npx cap sync` is done and the App/Haptics plugins are in place. **Not in the repo, never compiled, never signed.** It needs to be added to the repo. | ⛔ |
| 5 | Android: JDK 17 + Android SDK → signed **.aab** → Play App Signing. The upload key is created and kept by you; never share it. | ⛔ |
| 6 | iOS: a Mac with Xcode or a cloud Mac build service; certificate/provisioning → archive → App Store Connect | ⛔ |
| 7 | Real-device tests (Android low/mid, two iPhones). The browser tests did not cover these: offline cold start, background/back to the game, back button, haptics, audio interruption (phone call), notch, 15-minute FPS/heat, kill→reopen in every chapter, Pilgrim Service away earnings | ⛔ |
| 8 | If purchases are chosen: product setup, purchase + **restore** + refund tests (Play license testers, Apple sandbox) | 🔑/⛔ |
| 9 | Privacy: draft policy ✅ (`docs/privacy-policy.html`), **needs to be hosted at a URL** ⛔. The game collects no data (local save only) → Play Data Safety / Apple App Privacy "no data collected". Must be re-checked if any SDK is added. | partly |
| 10 | Age rating questionnaires (Play IARC, Apple). Also evaluate how child-friendly the chapter title "Kanlı Yemin" is | ⛔ |
| 11 | Store texts: TR/EN drafts exist ✅ (`docs/MAGAZA_METINLERI.md`, old version), need updating for Pilgrim Service ⛔. Icon ✅; screenshots/feature graphic need to be retaken ⛔ | partly |
| 12 | Testing: Play internal → closed testing (if the account is new and personal: **12 testers, 14 days**) → production; TestFlight internal → external (beta review) | ⛔ |
| 13 | Review notes: no sign-in required; Pilgrim Service opens after Chapter 7 (explain how a reviewer can reach it) | ⛔ |
| 14 | Submit the final build for review; choose manual release | ⛔ |

**Missing evidence:** a native build was never compiled or signed; there is no real-device test; account details are unknown; the privacy URL isn't live; no purchase system is implemented; the store screenshots belong to the old build; the audio hasn't been reviewed by listening.

---

## Suggested order
1. **Fix block 1 (code, can start immediately):** K1–K9 + K10–K13 together with T2 (status chip + put-back). Includes new tests; all of T21/T22 run again.
2. **Decision gate (yours):** revenue model, target age, the Bâkûm decision, account type.
3. **Polish block:** T1, T3, T4, T5, then retake new screenshots.
4. **Release block:** native build in the repo, device tests, store materials, testing tracks.

I am waiting for your instruction to start implementing.
