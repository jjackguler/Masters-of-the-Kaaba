# Masters of the Kaaba — Kâbe Ustaları: Mecca 605

A 3D mobile game (three.js r128, TR/EN): rebuilding the Kaaba in 605 CE. 7 story chapters with a stack-and-carry core loop, then the endless "Hacılara Hizmet" (Serving the Pilgrims) layer.
**Rule:** the Prophet (pbuh) and the Companions are never depicted, only narrated.

| Folder / file | Contents |
|---|---|
| `kaynak/` | Full source. `python build.py` (Python 3.8+, no packages) → `bekke-kabe.html`, `dist/web/`, `dist/app/www/` |
| `kaynak/l9.js` – `l14.js` | Site game: core (l9), cutscenes (l10), chapters/UI (l11), robustness+polish (l12), second layer (l13), full-version unlock + service tutorial + mastery goals (l14) |
| `web/kabe-ustalari.html` | Built web version (single file; three.js from cdnjs) |
| `test/` | Playwright tests: `t21_asama1.py` (17/17), `t22_saglamlik.py` (31/31), `t23_duzeltme.py` (16/16), outputs and screenshots |
| `docs/05_RAPOR_DUZELTME_VE_SATIS.md` | **Latest report:** K1–K13 fixes, sales model (free Chapters 1–2 + one-time unlock), polish |
| `docs/04_CLAUDE_DOGRULAMA_VE_PLAN.md` | Verification of Codex's final review + launch plan |
| `00_RAPOR.md` | Previous report (robustness, polish, second layer) |
| `duzeltme-satis.patch` | Changes after d4cc584 |
| `CODEX_SON_KONTROL.md` | What was fixed + what Codex should check |
| `asama2-4.patch` | Changes since Phase 1 |
| `docs/` | Codex's first analysis, Phase 1 report, store/publishing documents |
| `app/` | Capacitor 6 native project (Android + iOS; appId `com.kabeustalari.game`; plugins: app, haptics, purchase). Not compiled or signed yet |

Running the tests: `pip install playwright` + Chromium, then from inside `kaynak/` run `python build.py`, and copy `test/*.py` into `kaynak/` and run them (the paths in `tlib.py` point to `/home/claude/kabe`; change `ROOT` to your own folder).
