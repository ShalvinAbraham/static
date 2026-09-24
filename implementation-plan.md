# Maths Practice — Implementation Plan

A standalone HTML/CSS/JS app (matches repo convention — see `books/` layout) that lets an ~8‑year‑old **practice one/two‑digit arithmetic** interactively in a fast, engaging loop.

Sibling of `Maths_Worksheet_Generator.html` (printable worksheets). This one is the on‑screen, feedback‑driven trainer.

**Folder layout** (mirrors `books/`):

```
maths/
  Maths_Practice.html   # thin shell markup
  Maths_Practice.js     # all logic
  styles.css            # all styles
```

Open `maths/Maths_Practice.html` in any browser or tablet — no server needed.

---

## 1. Goals

- Rapid repetition of add / subtract / multiply facts to build recall.
- Ignore negative numbers for now (subtraction always yields ≥ 0).
- Very low friction: one screen, one question at a time, auto‑advance.
- Reward feel: streaks, score, stars, celebratory feedback.
- Works on a laptop **and** a touch tablet (on‑screen numeric keypad).
- No dependencies, no build. Just open the HTML file.

## 2. Non‑goals (for now)

- No accounts, no cloud sync (data can be exported/imported as JSON).
- No word problems (can add later).
- No printable worksheet output (that’s the sibling worksheet app). Certificate printing is supported.

## 3. Design decisions

| Topic | Decision |
|---|---|
| Layout | `maths/` folder — HTML shell + `Maths_Practice.js` + `styles.css` (like `books/`) |
| Target device | **Tablet‑first** (large tap targets ≥ 60 px, no hover‑only UI, viewport locked) |
| Style | Inline CSS, bright kid palette (aligned with `index.html` / `styles.css`) |
| Font | `Comic Neue` (already used in `index.html`) |
| Persistence | `localStorage` — settings, total stars, best streak, weak‑fact list (Phase 1) |
| Question modes (rotated) | **Type answer**, **Multiple choice (4 tiles)**, **True/False** |
| Input | Big number field + on‑screen numeric keypad + physical keyboard fallback |
| Feedback | Pop + chime on correct, shake + buzz on wrong; mascot emoji reacts to streak; confetti on milestones |
| Sound | Synth via WebAudio (no assets); mute toggle in HUD; state saved |
| Operations | +, −, ×, ÷ (division uses clean quotients only) |
| Hints | Visual **emoji icons** (dolphin default, changeable): pair-colored icons for +, cross-out for −, grid for ×, grouped icons for ÷. Icon count is exact (no ten-frame clamping). |
| Wrong answer | Type mode: 2 tries; Choice/TF: 1 try. Missed → mark as “weak” |
| Skip | Advances **immediately** — counts as missed, no learn pause. |
| Learn pause | On final wrong answer, hint stays with a **countdown + Continue button**; delay is configurable (3 / 6 / 10 / 15 / 30 s or **Tap Next** manual mode, default 6 s). Purpose: learning, not speed‑farming points. |
| Negatives | Off by default. Setting `allowNegative` enables subtraction results below zero (adds ± key to keypad). |
| Multiplication ranges | Easy 0–9 × 0–9, Medium 0–12 × 0–9, Hard 0–19 × 0–9 |
| Division ranges | Easy q≤9, b≤9; Medium q≤12, b≤10; Hard q≤15, b≤12 |
| Session length | 10 / 20 / 50 / Endless |
| Milestones | Star chime + confetti at streak 3 / 5 / 10 and at 10 / 25 correct |
| Personalization | Child name (persisted), used on home + certificate |
| Certificate | End-screen “🏆 Certificate” opens a printable page (Print / Save as PDF) |
| Data portability | Settings screen: **Export** / **Import** JSON (all `maths.*` keys) |
| Layout | Fixed tablet-safe layout: page never scrolls; only the hint region scrolls internally; mascot stays visible. |

## 4. Phases

### Phase 1 — Playable core ✅
- Home / Setup / Play / End screens.
- Three answer modes rotated: **Type**, **Choose**, **True/False**.
- HUD, mascot, confetti, WebAudio SFX, weak-fact tracker, “Focus on Tricky”.
- Configurable learn-pause on wrong answers.

### Phase 1.5 — Engagement + fixes ✅ (this commit)
- **Division** operator added.
- **Emoji icon hints** with pair colors: primary+secondary species for +, cross-out for −, grid for ×, grouped icons for ÷. **Dolphin default**, chooser in Settings.
- **Fixed hint bug** where `8 + 5` clamped the ten-frame to 10 cells — counts are now always exact.
- **Sub hint upgrade**: shows countable icons instead of the confusing “what plus b makes a” text.
- **Skip fix**: skip now advances instantly (still counts as missed).
- **Manual next** (“👆 Tap Next”) option for the learn pause — no auto-advance.
- **Layout fix**: viewport never scrolls; only `#hint-slot` scrolls internally, so the mascot / question / actions stay visible.
- **Child name** setting; greeting on home, name on certificate.
- **Certificate export**: printable page with name, date, stars, streak, games played.
- **Allow negatives** setting (default off); ± key appears on the keypad when enabled.
- **Export / Import** JSON of all localStorage data from Settings.
- **Icon chooser** in Settings (7 pairs).

### Phase 2 — Stickiness
- Milestone star animation at 50 / 100 correct in a row.
- Adaptive difficulty: nudge harder after long streaks, easier after repeated misses.
- Missing‑operand mode: `7 + ? = 12`.
- Simple badge / trophy system (e.g., “Doubles Master”, “Tens Wizard”).

### Phase 3 — Depth
- Timed mode (e.g., “how many in 60 s”).
- Times‑table drill mode (pick a table, cycle it).
- Progress dashboard (accuracy per operation / per table).
- **Tap-the-pair** mode: “Make 15” — pick two tiles that add/multiply to the target.

### Phase 4 — Polish / integration
- Link the app from a simple home page (currently `index.html` is a placeholder).
- Optional PWA manifest for “add to home screen”.
- Accessibility pass (ARIA, focus order, contrast).

## 5. Data model (in‑memory)

```js
question = { a, b, op, ans }                    // op in '+', '-', '*', '/'
session  = {
  target, index, correct, wrong,
  streak, bestStreak, startedAt,
  focusWeak, current, currentMode, attempts, answered,
  missed: [{ a, b, op, ans }],
  history: [{ a, b, op, ans, ok, attempts, skipped? }]
}
settings = {
  ops, difficulty, length, modes, sound,
  learnDelay,        // number of seconds OR 'manual'
  iconPrimary,       // one of ICON_PAIRS keys, default '🛂'
  allowNegative,     // boolean
  childName,         // string
}
```

Weak fact key: `${op}:${a}x${b}` (normalized so `3+5` == `5+3` for `+` and `*`).

## 6. Open questions

- Include 0 in operands? (Currently: yes for add/sub, yes for mul but boring — consider excluding for mul.)
- Auto‑advance on correct, or require Enter? (Current: auto‑advance ~700 ms.)
- Should “wrong” cost the streak immediately, or only after 2nd wrong? (Current: streak resets on first wrong.)
- Store any data across sessions? (Phase 2.)

## 7. How to run

Just open `maths/Maths_Practice.html` in a browser. No server required.

## 8. Change log

- Phase 1 scaffolded: setup + practice + results screens, keypad, feedback, no‑negative subtraction.
- Split app into `maths/` folder (HTML shell + JS + CSS), matching `books/` layout.
- Added **configurable learn pause** after wrong answers: hint stays visible with a countdown and an early‑continue button; default 6 s, chosen in Setup.
- **Phase 1.5** — engagement + fixes:
  - Division operator; allow-negatives toggle (default off) with ± keypad key.
  - Emoji-icon hints (dolphin default) with icon chooser; fixed count-clamp bug on addition ten-frame; sub hint now shows countable cross-outs.
  - Skip advances instantly (still counts as missed).
  - “Tap Next” manual option for the learn pause.
  - Tablet layout fix: page never scrolls; only `#hint-slot` scrolls internally so the mascot stays visible.
  - Child name setting; certificate export (printable page); JSON export/import of all localStorage data.
