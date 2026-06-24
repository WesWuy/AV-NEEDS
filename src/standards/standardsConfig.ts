/**
 * standardsConfig.ts
 * ============================================================================
 * SINGLE SOURCE OF TRUTH for every numeric constant, threshold, and assumption
 * used by this tool's calculations.
 *
 * ⚠️  STANDARDS INTEGRITY — READ BEFORE TRUSTING ANY OUTPUT  ⚠️
 * ----------------------------------------------------------------------------
 * This tool does NOT reproduce AVIXA's standards verbatim and is NOT a
 * substitute for the published documents or AVIXA's official free calculators.
 * Some constants below are the genuine, well-documented physical/perceptual
 * values cited by the standard (e.g. 1-arcminute visual acuity). OTHERS are
 * REASONABLE OPERATOR-EDITABLE DEFAULTS that approximate the published method
 * so the tool produces sane numbers out of the box. Every such value is marked:
 *
 *      // VERIFY: ...
 *
 * The operator (a qualified integrator) MUST confirm each VERIFY value against
 * the current revision of the cited standard and AVIXA's official calculator
 * before relying on a recommendation. Where the standard requires professional
 * judgement or data this tool cannot derive, the compute layer raises a FLAG
 * instead of guessing.
 *
 * Cited standards (confirm revision currency yourself):
 *   - ANSI/AVIXA V202.01:2016  DISCAS — Display Image Size for 2D Content
 *   - ANSI/AVIXA V201.01:2021  Image System Contrast Ratio
 *   - ANSI/AVIXA A104.01:2018  Audio Coverage — required SPL & S/N by venue
 *   - ANSI/AVIXA A102.01:2017  Audio Coverage Uniformity
 *   - ANSI/AVIXA F502.01:2018  Rack design/build (population, thermal, cable)
 *   - ANSI/AVIXA F501.01:2015  Cable labeling
 *   - ANSI/AVIXA S601.01:2021  Power / energy management
 *   - ANSI/AVIXA 10:2013       Performance Verification
 *   - ANSI/AVIXA D401.01:2023  AV Design & Coordination Processes (PROGRAM phase)
 *   - RP-38-17                 Lighting for small/medium VC spaces
 * ============================================================================
 */

/** Short revision string shown next to every computed value and in exports. */
export const STANDARDS_REVISIONS = {
  discas: 'ANSI/AVIXA V202.01:2016 (DISCAS)',
  contrast: 'ANSI/AVIXA V201.01:2021',
  audioCoverage: 'ANSI/AVIXA A104.01:2018',
  audioUniformity: 'ANSI/AVIXA A102.01:2017',
  rack: 'ANSI/AVIXA F502.01:2018',
  cableLabel: 'ANSI/AVIXA F501.01:2015',
  power: 'ANSI/AVIXA S601.01:2021',
  verification: 'ANSI/AVIXA 10:2013',
  process: 'ANSI/AVIXA D401.01:2023',
  vcLighting: 'RP-38-17',
} as const;

/** The qualifier appended to EVERY computed recommendation, in UI and exports. */
export const VERIFY_QUALIFIER =
  'Indicative per the cited AVIXA standard + revision; verify against the current ' +
  "revision and AVIXA's official calculator. Not a stamped engineering design.";

/* ===========================================================================
 * DISCAS — ANSI/AVIXA V202.01:2016 (Display Image Size for 2D Content)
 * ---------------------------------------------------------------------------
 * The standard defines two viewing categories. This tool implements both. The
 * Farthest Viewer drives minimum image height; the Closest Viewer drives an
 * upper geometric bound. Cross-check all results against AVIXA's free official
 * DISCAS calculator, which is the source of truth for the math.
 * =========================================================================== */
export const DISCAS = {
  /**
   * ANALYTICAL DECISION MAKING (ADM)
   * --------------------------------------------------------------------------
   * Driven by display VERTICAL RESOLUTION and human visual acuity. The criterion:
   * a single display line (pixel row) must subtend at least the acuity angle at
   * the farthest viewer, so full detail is resolvable.
   *
   *   minImageHeight = farthestViewerDist × verticalResolutionLines × acuityAngleRad
   *
   * acuityAngleRad below is the genuine, well-documented "20/20" reference:
   * 1 arcminute = (1/60)° expressed in radians. This is a real perceptual
   * constant, not an invented one — but still confirm the standard uses 1.0'.
   */
  // 1 arcminute in radians = (1/60) * (pi/180). Standard 20/20 visual acuity.
  acuityAngleRad: (1 / 60) * (Math.PI / 180), // ≈ 0.000290888

  /**
   * BASIC DECISION MAKING (BDM)
   * --------------------------------------------------------------------------
   * Driven by the smallest essential ELEMENT expressed as a percentage of image
   * height (%EH). The element must subtend at least a minimum vertical angle at
   * the farthest viewer:
   *
   *   elementSubtense = (%EH × imageHeight) / farthestViewerDist  ≥  bdmMinElementSubtenseRad
   *   ⇒ minImageHeight = farthestViewerDist × bdmMinElementSubtenseRad / %EH
   *
   * The resulting Viewing Ratio (FVD / imageHeight) = %EH / bdmMinElementSubtenseRad
   * is reported as an output.
   *
   * VERIFY: bdmMinElementSubtenseRad is an EDITABLE DEFAULT approximating the
   * published BDM legibility threshold. Confirm the exact angular criterion (and
   * whether it is stated as an angle, a viewing-ratio table, or a %EH curve)
   * against V202.01:2016 and the official calculator, then edit this value.
   */
  // VERIFY: ~15 arcminutes (0.25°) default minimum element subtense for BDM.
  bdmMinElementSubtenseRad: 15 * ((1 / 60) * (Math.PI / 180)), // ≈ 0.0043633

  /**
   * Default %EH (smallest element height as fraction of image height) offered by
   * the UI when an operator has not specified content-specific element size.
   * VERIFY against content type; this is just a starting value the operator edits.
   */
  defaultPercentElementHeightBDM: 0.05, // VERIFY: 5% of image height

  /**
   * CLOSEST VIEWER geometric bound.
   * The closest viewer should not sit so near that the image subtends an
   * excessive horizontal angle (causing neck strain / off-axis distortion). The
   * standard expresses this via a maximum horizontal viewing angle (the "from
   * the edge" bound). Geometry (viewer on centerline):
   *
   *   closestViewerMinDist = (imageWidth / 2) / tan(maxHorizontalAngleDeg/2)
   *
   * VERIFY: maxHorizontalViewingAngleDeg default 60° total horizontal cone.
   * Confirm the exact value and reference geometry in V202.01:2016.
   */
  maxHorizontalViewingAngleDeg: 60, // VERIFY

  /** Aspect ratio used to derive image width from image height (16:9 default). */
  defaultAspectRatioW: 16,
  defaultAspectRatioH: 9,

  /**
   * MOUNTING / IMAGE OFFSET sanity (not a DISCAS formula per se — practical
   * sightline heuristics flagged for operator confirmation).
   * VERIFY all three against sightline analysis and ADA where relevant.
   */
  minBottomOfImageHeightM: 1.07, // VERIFY: ~42" bottom-of-image so seated heads don't block
  typicalSeatedEyeHeightM: 1.2, // VERIFY: seated eye height reference
  imageTopCeilingMarginM: 0.1, // VERIFY: min clearance between image top and ceiling
} as const;

/* ===========================================================================
 * Common display panel sizes (diagonal inches → image height) for the
 * "what panel satisfies the requirement" lookup. 16:9 active-area heights.
 * These are physical panel facts, not standards constants.
 * =========================================================================== */
export const PANEL_DIAGONALS_IN = [
  43, 50, 55, 65, 75, 85, 86, 98, 110, 115, 135,
] as const;

/** Vertical resolution options for the ADM calculation. */
export const VERTICAL_RESOLUTIONS = [
  { label: '1080p (1920×1080)', lines: 1080 },
  { label: '4K UHD (3840×2160)', lines: 2160 },
  { label: '8K UHD (7680×4320)', lines: 4320 },
] as const;

/* ===========================================================================
 * V201.01:2021 — Image System Contrast Ratio → ambient-light technology flag.
 * ---------------------------------------------------------------------------
 * VERIFY: ambient illuminance bands and the technology suitability mapping are
 * OPERATOR-EDITABLE heuristics, not verbatim from the standard. The standard
 * defines contrast-ratio targets by viewing category; here we surface a
 * plain-language risk flag tied to ambient light to prompt proper analysis.
 * =========================================================================== */
export const CONTRAST = {
  // VERIFY: ambient illuminance (lux) bands at the screen surface.
  ambientBands: [
    { maxLux: 50, label: 'Dim / controlled', risk: 'low' },
    { maxLux: 150, label: 'Typical office', risk: 'moderate' },
    { maxLux: 400, label: 'Bright office / some daylight', risk: 'elevated' },
    { maxLux: Infinity, label: 'High daylight / atrium', risk: 'high' },
  ],
  // VERIFY: technology suitability guidance by ambient band index.
  techGuidance: [
    'Projection, LCD, or dvLED all viable with proper contrast design.',
    'LCD or dvLED preferred; projection needs high lumens + shading.',
    'Direct-view LCD or dvLED recommended; projection marginal.',
    'High-brightness dvLED or sunlight-readable LCD; projection not advised.',
  ],
} as const;

/* ===========================================================================
 * A104.01:2018 / A102.01:2017 — Audio coverage sanity flags.
 * ---------------------------------------------------------------------------
 * VERIFY: target SPL, S/N, and the single-source coverage radius are
 * OPERATOR-EDITABLE planning defaults to raise flags — NOT the standard's full
 * design method. A real coverage/uniformity design per A104/A102 is required.
 * =========================================================================== */
export const AUDIO = {
  // VERIFY: target program/speech SPL (dBA) at the listener by use intent.
  targetSplDba: {
    speechReinforcement: 70, // VERIFY
    programAudio: 75, // VERIFY
    criticalListening: 80, // VERIFY
  },
  // VERIFY: minimum speech-to-noise ratio (dB) for intelligibility.
  minSignalToNoiseDb: 25, // VERIFY (A104 references S/N for intelligibility)
  // VERIFY: assumed effective coverage radius (m) of ONE ceiling source before
  // uniformity (A102) likely fails and multiple sources are needed.
  singleSourceCoverageRadiusM: 3.5, // VERIFY
  // VERIFY: assumed room noise floor (dBA) when operator hasn't measured NC/dBA.
  assumedNoiseFloorDba: 40, // VERIFY
} as const;

/* ===========================================================================
 * F502.01:2018 (rack/thermal) + S601.01:2021 (power) → infra estimator.
 * ---------------------------------------------------------------------------
 * VERIFY: per-device typical power draws (W) and rack-U sizes are PLANNING
 * ESTIMATES for an early budget, not nameplate data. Replace with actual device
 * specs during design. Heat load uses the exact conversion 1 W = 3.412 BTU/hr.
 * =========================================================================== */
export const INFRA = {
  // VERIFY: typical operating power (watts) per element class for budgeting.
  devicePowerW: {
    displayPerDiagonalInch: 1.6, // VERIFY: ~1.6 W per diagonal inch (LCD)
    dvLedPerSqMeter: 350, // VERIFY: W/m² for direct-view LED
    projector: 350, // VERIFY
    codecMtr: 90, // VERIFY: meeting-room compute / codec
    dsp: 60, // VERIFY
    ampPerChannel: 60, // VERIFY: at typical duty, not max
    controlProcessor: 40, // VERIFY
    networkSwitchPoe: 150, // VERIFY: small PoE switch budget
    ptzCamera: 12, // VERIFY (PoE)
    miscPerRack: 100, // VERIFY: headroom for small accessories
  },
  // VERIFY: rack space (U) per element class for an early rack-fit check.
  deviceRackU: {
    codecMtr: 1,
    dsp: 1,
    amp: 2,
    controlProcessor: 1,
    networkSwitch: 1,
    powerConditioner: 1,
    shelfMisc: 2,
  },
  wattsToBtuPerHr: 3.412, // exact unit conversion
  // VERIFY: standard branch circuit capacity (W) for circuit-count estimate.
  circuitCapacityW: 1800, // VERIFY: 120V × 15A × 0.8 derate ≈ 1440–1800; confirm locale
} as const;
