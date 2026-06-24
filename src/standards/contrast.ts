/**
 * contrast.ts — V201.01:2021 ambient-light / display-technology risk flag.
 * Surfaces a plain-language suitability flag; a real contrast-ratio design per
 * V201.01 is still required.
 */
import { CONTRAST, STANDARDS_REVISIONS } from './standardsConfig';
import type { ContrastResult, Flag, Space } from '../types';

export function computeContrast(space: Space): ContrastResult {
  const flags: Flag[] = [];
  const std = STANDARDS_REVISIONS.contrast;
  const lux = space.ambientLightLux;

  if (lux == null) {
    flags.push({
      level: 'info',
      message: 'Ambient light (lux at screen) not captured — needed to assess contrast / tech choice.',
      standard: std,
    });
    return { bandLabel: null, risk: null, guidance: null, flags };
  }

  let idx = CONTRAST.ambientBands.findIndex((b) => lux <= b.maxLux);
  if (idx < 0) idx = CONTRAST.ambientBands.length - 1;
  const band = CONTRAST.ambientBands[idx];
  const guidance = CONTRAST.techGuidance[idx];

  if (band.risk === 'elevated' || band.risk === 'high') {
    flags.push({
      level: band.risk === 'high' ? 'warn' : 'info',
      message: `Ambient ~${lux} lux (${band.label}): ${guidance}`,
      standard: std,
    });
    if (space.displayTech === 'projection') {
      flags.push({
        level: 'warn',
        message:
          `Projection selected in a ${band.label.toLowerCase()} room — high contrast-ratio risk. ` +
          `Consider direct-view LCD or dvLED, or guarantee light control.`,
        standard: std,
      });
    }
  }

  return { bandLabel: band.label, risk: band.risk, guidance, flags };
}
