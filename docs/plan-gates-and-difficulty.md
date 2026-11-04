# Plan: Explain "Randomize gates" and Difficulty for clinicians

Feedback from lab professor (Nov 2026):
1. Explain what **Randomize gates** means, so a clinician knows what happens when they flip it.
2. Explain the **perceived effort** behind **Easy / Medium / Hard**: what exactly changes when you move between them.

---

## 1. What the game actually does today (from the Python source)

Read this first. It shapes everything below.

| Thing | Where | Current behavior |
|---|---|---|
| Gates | `sprites.py` `IslandPair` | A gate is a pair of islands with a **170 px opening** the astronaut must fly through. |
| Gate height | `sprites.py:125` | **Always random.** Each opening's height is `randint(...)` across the full playable range. |
| Time between gates | `game_loop.py:361-364`, `constants.py:46` | **Always random**, a whole number of seconds within a range per level: L1 8–12 s, L2 7–10, L3 6–8, L4 5–6, L5 4–5. |
| Gates per level | `game_loop.py:508` | **10**, hardcoded ("Pass 10 islands"). |
| Scroll speed | `constants.py:7` | 0.150 → 0.170 px/ms from L1 to L5 (very small change). |
| Muscle effort needed | `core/profile_store.py:215` | Threshold = **max EMG × 5 / 10 / 15 / 20 / 25 %** for L1–L5. This is the main effort lever. |
| Easy / Medium / Hard | none | **Does not exist in the game.** |
| Randomize on/off | none | **Does not exist.** Gates are always random; there is no saved/fixed layout. |

Mismatches in the dashboard (`lib/mockData.ts`):
- `LEVEL_DEFAULTS` shows 8/10/12/14/16 gates and 22/20/18/16/14 s between gates. The game uses 10 gates and the ranges above.
- The "EMG threshold" field on Protocols is entered by hand. The game computes it from max × level %.

The dashboard isn't wired to the game yet (`lib/firebase.ts` is empty), so this work is **explanation and UI**. But the text has to describe what the game *will* do, which is why I need your answers on the open questions below.

---

## 2. Proposed definitions (need sign-off)

### Randomize gates
- **On (default from L3):** each gate opening appears at an unpredictable height and with unpredictable spacing. The patient must read each gate and grade their contraction in the moment (*motor control / adaptation*).
- **Off:** the level uses a **fixed, repeatable layout**: same gate heights and same spacing every session. The patient can learn the pattern, and sessions are directly comparable (*motor learning / consistency, good for tracking progress*).

### Difficulty (inside a level)
Level controls *pace* (how often gates come). Difficulty would control **how hard each gate is for the muscle**:

| Parameter | Easy | Medium | Hard | What the patient feels |
|---|---|---|---|---|
| Activation to rise (% of their max EMG) | level % − 5 | level % | level % + 5 | How hard they must squeeze to lift off |
| Gate opening height | 220 px | 170 px (today) | 130 px | How precisely they must control the squeeze |
| High gates (must hold contraction) | fewer | normal | more | How long they must sustain it |
| Rest between gates | +2 s | level default | −1 s | Recovery time between efforts |

*Numbers are placeholders for discussion with the professor.*

For the patient selected, the dashboard would turn the % into **their actual mV** (e.g. "Marisol: ~0.20 mV of her 1.02 mV max"). That is the clearest way to show perceived effort.

---

## 3. UI changes (Protocols page, `components/Protocols.tsx`)

### A. Randomize gates toggle (each Level card)
- A one-line helper under the toggle that changes with its state:
  - On: "Gate heights and spacing change every run"
  - Off: "Same gate layout every session"
- An **ⓘ button** that opens a short explainer with a small diagram: two strips of gates, *fixed* (repeating pattern) vs *randomized* (varied heights), plus 2–3 sentences on when a clinician would choose each.

### B. Difficulty selector
- Under the Easy/Medium/Hard control, add a **"What changes" panel** that updates live:
  - Plain-language summary, e.g. *"Medium: moderate squeeze (~15% of max) to rise, standard gate opening, 6–8 s rest between gates."*
  - The comparison table above, with the **selected column highlighted** and values computed for the patient's level and calibration.
  - An optional perceived-effort label (see question 3).

### C. Level settings card
- Fix the defaults to match the game (10 gates; spacing ranges) so the explanations don't contradict the numbers next to them.

### D. Code structure
- Put all definitions (difficulty profiles, randomize copy, level constants) in **one place** in `lib/mockData.ts` (or a new `lib/gameRules.ts`). The text and tables read from it, and later the game and Firestore sync can share the same values.
- No new dependencies. Matches the existing Tailwind styling.

---

## 4. Decisions (3 Nov 2026)

1. **Difficulty values:** use placeholders for now; final values will come from testing. The UI labels them as placeholders.
2. **Randomize off:** uses the game's set layout.
3. **Perceived effort / RPE:** not shown for now (no data yet). Maybe later.
4. **Scope:** dashboard only. Game-side gaps go in [game-todo.md](game-todo.md).
5. **Defaults:** match the game (10 gates, spacing ranges per level, randomize on for every level).

## 5. Order of work
1. Lock the definitions (answers above).
2. Add the shared rules module plus fixed defaults.
3. Randomize helper text and explainer.
4. Difficulty "What changes" panel.
5. Lint, build, check in the browser on desktop and narrow widths.
