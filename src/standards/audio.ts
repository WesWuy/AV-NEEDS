/**
 * audio.ts — A104.01:2018 / A102.01:2017 audio coverage SANITY FLAGS.
 * Not a full coverage/uniformity design — raises plain-language flags so the
 * operator knows when a proper A104/A102 design is required.
 */
import { AUDIO, STANDARDS_REVISIONS } from './standardsConfig';
import type { AudioResult, Flag, Space } from '../types';

export function computeAudio(space: Space): AudioResult {
  const flags: Flag[] = [];
  const std = STANDARDS_REVISIONS.audioCoverage;

  if (space.audioIntent === 'none') {
    return {
      targetSplDba: null,
      assumedNoiseFloorDba: space.noiseFloorDba ?? AUDIO.assumedNoiseFloorDba,
      signalToNoiseAdequate: null,
      estimatedSourcesNeeded: null,
      flags: [],
    };
  }

  const targetSplDba = AUDIO.targetSplDba[space.audioIntent];
  const noiseFloor = space.noiseFloorDba ?? AUDIO.assumedNoiseFloorDba;
  const sn = targetSplDba - noiseFloor;
  const signalToNoiseAdequate = sn >= AUDIO.minSignalToNoiseDb;

  if (space.noiseFloorDba == null) {
    flags.push({
      level: 'info',
      message: `Room noise floor not measured — assuming ${AUDIO.assumedNoiseFloorDba} dBA. Verify on site.`,
      standard: std,
    });
  }
  if (!signalToNoiseAdequate) {
    flags.push({
      level: 'warn',
      message:
        `Target ${targetSplDba} dBA over a ${noiseFloor} dBA noise floor gives only ${sn} dB ` +
        `S/N (< ${AUDIO.minSignalToNoiseDb} dB target). Intelligibility at risk — treat noise ` +
        `source or increase/optimize coverage.`,
      standard: std,
    });
  }

  // Single-source coverage check: largest room plan dimension vs one source radius.
  let estimatedSourcesNeeded: number | null = null;
  const { lengthM, widthM } = space.dimensions;
  if (lengthM != null && widthM != null && lengthM > 0 && widthM > 0) {
    const area = lengthM * widthM;
    const sourceArea = Math.PI * AUDIO.singleSourceCoverageRadiusM ** 2;
    estimatedSourcesNeeded = Math.max(1, Math.ceil(area / sourceArea));
    if (estimatedSourcesNeeded > 1) {
      flags.push({
        level: 'info',
        message:
          `~${area.toFixed(0)} m² floor likely needs ≈${estimatedSourcesNeeded} distributed ` +
          `sources for uniform coverage (A102) — a single source is probably inadequate. ` +
          `Confirm with a coverage/uniformity design.`,
        standard: STANDARDS_REVISIONS.audioUniformity,
      });
    }
  }

  return {
    targetSplDba,
    assumedNoiseFloorDba: noiseFloor,
    signalToNoiseAdequate,
    estimatedSourcesNeeded,
    flags,
  };
}
