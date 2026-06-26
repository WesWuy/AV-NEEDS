/**
 * discas.ts — ANSI/AVIXA V202.01:2016 (DISCAS) image-size calculations.
 *
 * Implements both viewing categories using ONLY the constants from
 * standardsConfig.ts (no inline magic numbers). Cross-reference AVIXA's free
 * official DISCAS calculator as the source of truth for the math; this is an
 * implementation of the documented METHOD, with the perception/geometry
 * constants centralized and flagged for operator verification.
 */
import { DISCAS, PANEL_DIAGONALS_IN, STANDARDS_REVISIONS } from './standardsConfig';
import { formatFtIn } from '../units';
import type { DiscasResult, Flag, Space } from '../types';

/** 16:9 active-area image height (m) for a given diagonal in inches. */
export function diagonalInToImageHeightM(diagonalIn: number, arW: number, arH: number): number {
  const diagM = diagonalIn * 0.0254;
  // height = diag / sqrt((w/h)^2 + 1)
  const ratio = arW / arH;
  return diagM / Math.sqrt(ratio * ratio + 1);
}

/** Smallest standard panel whose image height meets or exceeds the requirement. */
function smallestPanelForHeight(minHeightM: number, arW: number, arH: number): number | null {
  for (const d of PANEL_DIAGONALS_IN) {
    if (diagonalInToImageHeightM(d, arW, arH) >= minHeightM) return d;
  }
  return null;
}

export function computeDiscas(space: Space): DiscasResult {
  const flags: Flag[] = [];
  const std = STANDARDS_REVISIONS.discas;
  const arW = space.aspectRatioW || DISCAS.defaultAspectRatioW;
  const arH = space.aspectRatioH || DISCAS.defaultAspectRatioH;
  const fvd = space.farthestViewerM;

  let minImageHeightM: number | null = null;
  let viewingRatio: number | null = null;
  let explanation = '';

  if (fvd == null || fvd <= 0) {
    flags.push({
      level: 'warn',
      message: 'Farthest viewer distance not set — DISCAS minimum image height cannot be computed.',
      standard: std,
    });
  } else if (space.viewingCategory === 'ADM') {
    // ADM: each display line must subtend at least the acuity angle at the
    // farthest viewer.  minImageHeight = FVD × lines × acuityAngleRad
    const lines = space.verticalResolutionLines || 1080;
    minImageHeightM = fvd * lines * DISCAS.acuityAngleRad;
    explanation =
      `Analytical (ADM): farthest viewer at ${formatFtIn(fvd)} needs each of ${lines} ` +
      `lines to subtend ≥1 arcminute → minimum image height ${formatFtIn(minImageHeightM)}.`;
  } else {
    // BDM: smallest element (%EH of image height) must subtend at least the
    // BDM minimum element angle.  minImageHeight = FVD × angle / %EH
    const pct = space.percentElementHeight || DISCAS.defaultPercentElementHeightBDM;
    minImageHeightM = (fvd * DISCAS.bdmMinElementSubtenseRad) / pct;
    viewingRatio = pct / DISCAS.bdmMinElementSubtenseRad; // = FVD / imageHeight
    explanation =
      `Basic (BDM): farthest viewer at ${formatFtIn(fvd)} with smallest element ` +
      `${(pct * 100).toFixed(1)}% of image height → minimum image height ` +
      `${formatFtIn(minImageHeightM)} (viewing ratio ≈ ${viewingRatio.toFixed(1)}).`;
  }

  const minImageWidthM = minImageHeightM != null ? (minImageHeightM * arW) / arH : null;
  if (minImageHeightM != null && viewingRatio == null && fvd != null) {
    viewingRatio = fvd / minImageHeightM;
  }

  const recommendedDiagonalIn =
    minImageHeightM != null ? smallestPanelForHeight(minImageHeightM, arW, arH) : null;

  if (minImageHeightM != null && recommendedDiagonalIn == null) {
    flags.push({
      level: 'warn',
      message:
        `Required image height ${formatFtIn(minImageHeightM)} exceeds the largest catalog ` +
        `panel — consider projection, dvLED, or multiple displays.`,
      standard: std,
    });
  }

  // Closest viewer geometric bound
  let closestViewerMinM: number | null = null;
  if (minImageWidthM != null) {
    const halfAngleRad = (DISCAS.maxHorizontalViewingAngleDeg / 2) * (Math.PI / 180);
    closestViewerMinM = minImageWidthM / 2 / Math.tan(halfAngleRad);
    if (space.closestViewerM != null && space.closestViewerM < closestViewerMinM) {
      flags.push({
        level: 'warn',
        message:
          `Closest viewer at ${formatFtIn(space.closestViewerM)} is nearer than the ` +
          `${formatFtIn(closestViewerMinM)} geometric minimum (image subtends > ` +
          `${DISCAS.maxHorizontalViewingAngleDeg}° horizontally).`,
        standard: std,
      });
    }
  }

  // Mounting / image offset sanity
  let imageTopHeightM: number | null = null;
  let mountingExceedsCeiling = false;
  if (minImageHeightM != null) {
    imageTopHeightM = DISCAS.minBottomOfImageHeightM + minImageHeightM;
    const ceiling = space.dimensions.ceilingHeightM;
    if (ceiling != null && imageTopHeightM + DISCAS.imageTopCeilingMarginM > ceiling) {
      mountingExceedsCeiling = true;
      flags.push({
        level: 'critical',
        message:
          `Image top (~${formatFtIn(imageTopHeightM)} above floor at the recommended size) ` +
          `does not fit under the ${formatFtIn(ceiling)} ceiling — reduce bottom-of-image ` +
          `height, split the image, or revisit viewer distance.`,
        standard: std,
      });
    }
  }

  return {
    category: space.viewingCategory,
    minImageHeightM,
    minImageWidthM,
    recommendedDiagonalIn,
    viewingRatio,
    closestViewerMinM,
    imageTopHeightM,
    mountingExceedsCeiling,
    explanation,
    flags,
  };
}
