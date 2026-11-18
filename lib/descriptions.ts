// Clinician-facing descriptions, written for PTs and other clinicians.
// Definitions only (what it is, how it's measured) — interpretation comes later.
// See docs/plan-clinician-descriptions.md.

export const SESSION_TEXT = {
  emg: {
    short: "Muscle activity recorded during the run, and the level the patient needed to reach to make the astronaut rise.",
    more: [
      {
        title: "What this chart shows",
        body: "A surface EMG sensor on the patient's leg records muscle activity for the whole run. Time runs left to right; signal strength runs bottom to top, in a.u. (see About the units).",
      },
      {
        title: "How the astronaut moves",
        body: "The astronaut's height follows how strongly the patient contracts. At the threshold the astronaut sits at the bottom of the screen. Contracting harder lifts it higher, reaching the top at 20% of max at level 1 up to 40% at level 5. Relaxing lets it sink.",
      },
      {
        title: "How the signal is processed",
        body: "The sensor (MyoWare 2.0) sends a reading every 20 ms that it has already rectified and smoothed. The game averages it again into the RMS line (about the last 0.1 s). The astronaut follows a further average of about 0.4 s, so its movement lags slightly behind the contraction.",
      },
      {
        title: "About the units",
        body: "Values are in a.u. (arbitrary units): the raw sensor reading on a 0–4095 scale, not millivolts. Higher means more muscle activity. Because electrode placement and skin contact change the reading, compare values only within the same patient, and prefer percentages of their max.",
      },
    ],
    legend: {
      Raw: "The reading as it arrives from the sensor, every 20 ms. The sensor has already rectified and smoothed it, so this is not unfiltered EMG.",
      RMS: "Root mean square: the sensor reading averaged over about the last 0.1 s. A steadier measure of how strongly the muscle is working.",
      Threshold: "The level the signal has to reach for the astronaut to rise. Below it, the astronaut sinks.",
      Collision: "A moment the astronaut hit a gate and lost a life.",
    } as Record<string, string>,
  },
  tiles: {
    "Max strength": "The patient's strongest contraction, from their latest Astro Boost test, in a.u. The game scales everything to this value, so each patient plays relative to their own strength.",
    Threshold: "The activation needed to lift the astronaut at this level. It is a set share of max strength: 5% at level 1, rising 5% per level to 25% at level 5.",
    Score: "Gates passed cleanly, out of the gates in the level. A gate the astronaut hits doesn't count.",
    "Lives left": "The patient starts with 3 lives and loses one each time the astronaut hits a gate. Losing all 3 ends the run as Failed.",
    Duration: "Length of the run in minutes and seconds.",
    "Kp / Ki / Kd": "Controller settings (PID gains) that decide how smoothly the astronaut moves toward the height set by the contraction. They change how the game feels, not the recorded muscle data. Kd is set from the patient's Glide Practice result; Kp and Ki stay at the game's defaults.",
  } as Record<string, string>,
  gates: {
    short: "Each gate is an opening the astronaut has to fly through. Missed means the astronaut hit that gate and lost a life.",
  },
};

const AU_NOTE =
  "Values are in a.u. (arbitrary units): the raw sensor reading on a 0–4095 scale, not millivolts. Compare them only within the same patient, with the sensor placed the same way.";

export const PATIENT_TEXT = {
  baseline:
    "Baseline means the patient has done both calibration tests: Astro Boost (max strength) and Glide Practice (control). Planets stay locked until both are done. Recalibrated is the date the patient last redid them.",
  tiles: {
    "Max strength": "The patient's strongest contraction from their latest Astro Boost test, in a.u. The change is measured against their first Astro Boost test.",
    "Current level": "The highest planet (level) the patient has unlocked, out of 5. Passing their highest unlocked level unlocks the next one.",
    "PID gains (Kp / Ki / Kd)": SESSION_TEXT.tiles["Kp / Ki / Kd"],
    Engagement: "Coins the patient has earned: 25 plus 5 per gate passed, for each passed run. They spend coins on astronaut skins, which are cosmetic only.",
  } as Record<string, string>,
  astroBoost: [
    {
      title: "What the test is",
      body: "Astro Boost is the first calibration test. The patient contracts as hard as they can for 6 seconds, and the game records the strongest RMS reading. Patients redo it when they recalibrate.",
    },
    {
      title: "What the chart shows",
      body: "Each point is one Astro Boost test: the patient's max strength on that date.",
    },
    {
      title: "How the game uses it",
      body: "Everything in Planets scales to the latest max: the threshold to rise (5–25% of max by level) and the contraction that reaches the top of the screen (20–40% of max). When max goes up after a recalibration, the game asks for more muscle activity in absolute terms.",
    },
    { title: "About the units", body: AU_NOTE },
  ],
  glidePractice: [
    {
      title: "What the test is",
      body: "Glide Practice is the second calibration test. A ghost astronaut rises for 4 seconds, holds at the top for 2, lowers for 4, then rests for 2. This repeats 3 times, and the patient tries to make their astronaut follow it.",
    },
    {
      title: "What it measures",
      body: "Tracking error: how far, in pixels, the patient's astronaut is from the ghost, averaged over the test. A lower number means closer tracking.",
    },
    {
      title: "How the game uses it",
      body: "The result sets Kd, one of the movement-smoothing settings (PID gains), for this patient.",
    },
    {
      title: "Why there's no data",
      body: "The game calculates the tracking error but doesn't save it yet, so there is nothing to chart. It will appear here once the game records it.",
    },
  ],
  planets: [
    {
      title: "What the planets are",
      body: "Planets 1–5 are the game's levels. Each has 10 gates. Higher planets bring gates closer together and need a stronger contraction to rise (5% of max at planet 1 up to 25% at planet 5).",
    },
    {
      title: "What a bar shows",
      body: "One bar per session: the number of gates passed cleanly, out of 10. A gate the astronaut hits doesn't count. The label under each bar is the planet played (L = level). Hover over or tap a bar to see its date, score and result.",
    },
    {
      title: "Passed and failed",
      body: "A run is passed when all 10 gates go by with at least one life left. Each hit costs one of 3 lives; losing all 3 ends the run as failed.",
    },
  ],
  levelProgress:
    "Cleared: passed at least once. Current: the highest planet unlocked. Locked: not unlocked yet. Underneath, how many attempts at that planet were passed.",
};
