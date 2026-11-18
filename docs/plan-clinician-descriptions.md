# Plan: Clinician-friendly descriptions across the dashboard

Started: 17 Nov 2026
Context: clinicians are the main users, and the professor asked for more detailed descriptions so they read the dashboard correctly. The format (longer text, expandable "learn more", an index or glossary) is still undecided. This document is for deciding **what** to describe and **how**.

---

## 1. How we'll work through it

1. **Agree on the inventory** (section 2): which terms need explaining, in priority order.
2. **Pick a format** (section 3). Prototype it on one screen first, then decide.
3. **Draft the wording** using one template (section 4). Claude pulls facts from the game code. You and the professor add what each value means for treatment.
4. **Review with a clinician**, ideally someone who hasn't seen the project before.
5. **Roll it out** to the remaining screens.

All wording lives in one file (like `lib/gameRules.ts`), so the text is edited in one place and screens just display it.

---

## 2. Inventory: every term a clinician sees today

Priority: **High** = jargon or easy to misread · **Med** = game concept · **Low** = mostly self-explanatory.
"Source" says where the facts come from: **Game** = can be checked in the code · **Clinical** = needs you or the professor · **Unclear** = needs a decision first.

### Patients list
| Term | Shown as | Priority | Source |
|---|---|---|---|
| Level | "4 of 5" | Med | Game |
| Last result | Passed / Failed | Med | Game (what counts as a pass) |

### Patient detail
| Term | Shown as | Priority | Source |
|---|---|---|---|
| Baseline / recalibrated | "Baseline complete, recalibrated 12 Sep" / "Baseline pending" | **High** | Game + Clinical (how often to recalibrate?) |
| Max RMS voltage | "1.02 mV, +64% since first baseline" | **High** | Game (how measured) + Clinical (what a change means) |
| PID gains (Kp / Ki / Kd) | "0.85 / 0.04 / 0.12, tuned for this patient" | **High** | Game + **Unclear**: should clinicians see this at all? |
| Engagement | coins, skins unlocked | Low | Game (coins = 5 × score + 25 per session) |
| Baseline strength chart | Max RMS per recalibration | **High** | same as Max RMS |
| Glide Practice (was "Flight Practice") | "Control accuracy: time the RMS signal stayed in the target band" | **High** | Game (the flex/relax test) + **Unclear**: what is the target band? |
| Astro Boost | score + gates passed per session | Med | **Unclear**: is this the main game? Score scale doesn't match the game (see 5) |
| Level progress | Cleared / Current / Locked, "2 of 3 passed" | Med | Game |
| Sessions table | score, lives left, result, duration | Med | Game |

### Session detail
| Term | Shown as | Priority | Source |
|---|---|---|---|
| EMG signal chart | Raw, RMS, Threshold, Collision | **High** | Game + Clinical (how to read the trace) |
| Max voltage / Threshold | mV values | **High** | Game (threshold = max × level %) |
| Score / Lives left | "3,240" / "1 of 3" | Med | Game (1 point per gate; 3 lives, lose 1 per crash) |
| Kp / Ki / Kd | gains | **High** | as above |
| Gates list | passed / missed per gate | Low | Game |
| Pass banner | "Level 4 cleared… Level 5 unlocked" | Low | Game |

### Protocols
| Term | Shown as | Priority | Source |
|---|---|---|---|
| EMG threshold / Max EMG output | hand-entered mV | **High** | Game + **Unclear**: hand-entered vs measured (see game-todo) |
| Presets | built-in + saved | Med | ours |
| Session days / Target levels / locked | buttons | Low | ours |
| Difficulty + "What changes" table | already explained | Med | placeholder values |
| Gates to clear / time between gates | per-level inputs | Med | Game |
| Randomize gates | already explained (ⓘ) | Done | |
| Assign plan / "visible in game" | status | Low | ours |

### Game Launcher
| Term | Shown as | Priority | Source |
|---|---|---|---|
| Baseline pending | "game opens on calibration first" | Med | Game |

---

## 3. Format options

| | Option | Good for | Downside |
|---|---|---|---|
| A | **Longer inline text** under each heading | Always visible, no clicks | Clutters the screen; experienced users scroll past it |
| B | **ⓘ "Learn more" that expands** in place (like Randomize gates) | Detail when needed, clean otherwise | Clinicians must notice and click it |
| C | **Hover/tap tooltips** on individual terms | Quick definitions inside tables and charts | Too small for long explanations; hover doesn't work on tablets |
| D | **Glossary / index page** in the sidebar | One reference for everything; good for training new staff | Leaves the screen; easy to forget it exists |

**Recommendation: layers, combining several options.** *(Decided: A + B + C, no D. See section 6.)*
- One short plain-language line stays visible (as today, made clearer).
- **B** for anything rated **High**: an ⓘ that expands to the full explanation.
- **D** as the complete reference. Each expanded explanation links to its glossary entry, and the glossary links back.
- Use **C** only for short labels inside charts and tables (Raw, RMS, Kp…).

Since every format reads from the same text file, we can change the format later without rewriting the content.

---

## 4. Template for each description

Every High-priority term gets these parts. Keep each part to 1–2 sentences, in plain language, with units spelled out.

1. **What it is**: a plain definition. *"RMS is a smoothed measure of how strongly the muscle is firing."*
2. **How it's measured**: where the number comes from. *"Recorded during the Max test in Astronaut Training…"*
3. **How to read it**: what higher or lower means, and typical ranges if known. *(Clinical input)*
4. **What you can do about it**: which setting changes it, if any. *"Lower the difficulty to…"* *(Clinical input)*

Parts 1–2 can be drafted from the code now. Parts 3–4 are clinical claims, so they need the professor's sign-off. Until then they're marked as drafts in the UI, the same way the difficulty values are.

---

## 5. Things to resolve before writing

- **Astro Boost:** this name isn't in the game. Is it the main game levels? (Flight Practice is resolved: it's Glide Practice.)
- **"Target band"** (Glide Practice): how is it defined?
- **Score scale:** the game gives 1 point per gate (at most 10 per level), but the dashboard's mock scores are in the thousands. Either the mock data is wrong, or score means something else.
- **PID gains:** show them to clinicians with an explanation, move them under an "Advanced" section, or hide them?
- **Session detail mock data** shows 14 gates, but the game uses 10.

---

## 6. Decisions (17 Nov 2026)

1. **Audience:** mainly PTs, but it could be any clinician, so explain in a fair amount of detail and don't assume EMG expertise.
2. **Format:** use A (short visible line), B (ⓘ learn more) and C (tooltips). **No glossary page (D).**
3. **Content:** definitions only (template parts 1–2). Interpretation (parts 3–4) is a good future addition.
4. **Reviewer:** Tomas for now; no clinician yet.
5. **Start with Session detail.** Done as the pilot (see 7).
6. **Flight Practice is renamed Glide Practice** to match the game.
7. **Score scale:** Tomas will confirm with the game's agent. The Score tooltip stays generic until then.
8. **PID gains:** not sure they're needed. They have a tooltip for now; decide later whether to hide them.

## 7. Session detail pilot (done)

- Wording lives in `lib/descriptions.ts`. Shared pieces (ⓘ toggle, learn-more panel, tooltip) are in `components/Explain.tsx`, which Protocols also uses now.
- **EMG signal:** a short line under the title, a "How to read this chart" ⓘ (what the chart shows, how the astronaut moves, how the signal is processed), and tooltips on the Raw / RMS / Threshold / Collision legend.
- **Stat tiles:** a tooltip on each label (Max voltage, Threshold, Score, Lives left, Duration, Kp / Ki / Kd).
- **Gates:** a short line explaining what passed and missed mean.

Facts found in the code while writing:
- **"Raw" isn't raw EMG.** The firmware sends MyoWare's ENV (envelope) output, which the sensor has already rectified and smoothed, every 20 ms. The game's RMS averages the last 5 readings (~0.1 s), and the astronaut follows an average of 20 RMS values (~0.4 s). Consider renaming "Raw" to "Sensor" or "Envelope".
- **The astronaut's height is proportional to the contraction:** bottom of the screen at the threshold, top at 20–40% of max depending on level (`game_loop.py`, `max_multipliers`).
- **Units:** the firmware sends `analogRead` values (ADC counts, 0–4095), but the game and dashboard label them mV. Check whether they're converted anywhere before we tell clinicians they're mV.

## 8. Next
- Tomas reviews the Session detail wording.
- Then Patient detail (baseline, Max RMS, Glide Practice "target band", Astro Boost), Protocols (EMG calibration), and Game Launcher.
