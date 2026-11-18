# Game changes needed to match the dashboard

Things the dashboard now shows or lets clinicians set that the Galactic Glide game (Python) does not do yet. Add to this list as the dashboard changes.

## Randomize gates on/off
- **Set layout when Randomize is off.** Opening heights come from `randint` in `sprites.py:125` (`IslandPair.__init__`), and spacing comes from `random.choice` in `game_loop.py:364` and `:668`. In the code as it stands, every run is random. Add a fixed layout per level (opening heights + spacing) and use it when Randomize is off.
- Read the per-level `rand` flag from the patient's protocol (dashboard → Firestore → game).

## Difficulty (Easy / Medium / Hard)
- **Not in the game at all.** The dashboard's placeholder definitions live in `lib/gameRules.ts` (`DIFFICULTY_PROFILES`). Medium = the game today.
  - **Squeeze to rise:** scale the level's activation % (`core/profile_store.py:215`, `threshold_multipliers`) by 0.75 / 1 / 1.25.
  - **Gate opening:** `ISLAND_GAP_SIZE` (`core/constants.py`) is fixed at 170 px. Make it depend on difficulty (placeholder 220 / 170 / 130).
  - **Time between gates:** shift the level's spacing range by +2 / 0 / −1 s, never below 2 s.
- Final values to be set through testing.

## Level settings from the dashboard
- **Gates to clear:** hardcoded to 10 (`game_loop.py:508`, plus the "Pass 10 islands" text at `:402` and `:408`). Read it from the protocol instead.
- **Time between gates:** `LEVEL_ISLAND_SPACING_RANGES` (`core/constants.py:46`) is hardcoded. Read the clinician's min–max from the protocol.

## EMG calibration
- The dashboard has a hand-entered EMG threshold, but the game computes the threshold as max EMG × level % (`core/profile_store.py:211-219`). Decide which one wins and make both sides agree.

## Plumbing
- The dashboard isn't connected to the game yet (`lib/firebase.ts` is empty). None of the above takes effect until protocols are saved and the game reads them.
- Clinician-saved presets are held only in dashboard memory and disappear on reload. They need to be stored (e.g. Firestore) to persist. The game never needs presets: applying one just fills in the protocol the game reads.

## Units
- Every "mV" label in the game (CSV headers, logs, UI) is really the raw ESP32 ADC reading, 0–4095, unconverted (`firmware/wireless_shield_peripheral.ino:51`). The dashboard now says "a.u." Rename it in the game too. Converting to real millivolts would rescale every stored threshold and PID gain, so treat that as a separate, deliberate change.

## Glide Practice tracking error
- The Flex Test (`screens/baseline/flex_test.py`) computes the average and standard deviation of the tracking error (pixels between the patient's astronaut and the ghost), uses them to set Kd, then throws them away. Save, per test: date and time, leg, average tracking error (px) and its standard deviation, and the resulting Kd. The dashboard's Glide Practice chart is already built on sample data (`GLIDE_TRACKING` in `lib/mockData.ts`) and just needs the real values swapped in.
- Optional later: a real "time in band" metric (a tolerance band around the ghost, plus time spent inside it). This would be a new feature.
