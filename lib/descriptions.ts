// Clinician-facing descriptions, written for PTs and other clinicians.
// Definitions only (what it is, how it's measured) — interpretation comes later.
// See docs/plan-clinician-descriptions.md.

export const SESSION_TEXT = {
  emg: {
    short: "Muscle activity recorded during the run, and the level the patient needed to reach to make the astronaut rise.",
    more: [
      {
        title: "What this chart shows",
        body: "A surface EMG sensor on the patient's leg records muscle activity for the whole run. Time runs left to right; signal strength (mV) runs bottom to top.",
      },
      {
        title: "How the astronaut moves",
        body: "The astronaut's height follows how strongly the patient contracts. At the threshold the astronaut sits at the bottom of the screen. Contracting harder lifts it higher, reaching the top at 20% of max at level 1 up to 40% at level 5. Relaxing lets it sink.",
      },
      {
        title: "How the signal is processed",
        body: "The sensor (MyoWare 2.0) sends a reading every 20 ms that it has already rectified and smoothed. The game averages it again into the RMS line (about the last 0.1 s). The astronaut follows a further average of about 0.4 s, so its movement lags slightly behind the contraction.",
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
    "Max voltage": "The patient's strongest signal, recorded in the Max test during calibration. The game scales everything to this value, so each patient plays relative to their own strength.",
    Threshold: "The activation needed to lift the astronaut at this level. It is a set share of max voltage: 5% at level 1, rising 5% per level to 25% at level 5.",
    // Score scale still to be confirmed against the game.
    Score: "Points earned during the run.",
    "Lives left": "The patient starts with 3 lives and loses one each time the astronaut hits a gate. Losing all 3 ends the run as Failed.",
    Duration: "Length of the run in minutes and seconds.",
    "Kp / Ki / Kd": "Controller settings (PID gains) that decide how smoothly the astronaut moves toward the height set by the contraction. They change how the game feels, not the recorded muscle data.",
  } as Record<string, string>,
  gates: {
    short: "Each gate is an opening the astronaut has to fly through. Missed means the astronaut hit that gate and lost a life.",
  },
};
