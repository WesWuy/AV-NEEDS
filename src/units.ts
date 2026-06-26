/**
 * units.ts — imperial (feet/inches) display helpers.
 *
 * The persisted data model and every standards calculation stay in SI (meters)
 * because the DISCAS geometry/perception constants are defined that way. These
 * helpers convert ONLY at the presentation boundary — form inputs, computed
 * displays, flag prose, and exports — so US users see feet and inches and never
 * touch metric.
 */

export const FT_PER_M = 3.280839895;
export const IN_PER_M = 39.37007874;
export const SQFT_PER_SQM = 10.76391042;

export const mToFt = (m: number) => m * FT_PER_M;
export const ftToM = (ft: number) => ft / FT_PER_M;
export const mToIn = (m: number) => m * IN_PER_M;
export const sqmToSqft = (sqm: number) => sqm * SQFT_PER_SQM;

/** meters → feet for a number input field (2 decimals), null-safe. */
export const mToFtInput = (m: number | null): number | null =>
  m == null ? null : Math.round(mToFt(m) * 100) / 100;

/** feet (from a number input) → meters for storage, null-safe. */
export const ftInputToM = (ft: number | null): number | null =>
  ft == null ? null : ftToM(ft);

/** Format meters as feet-and-inches, e.g. 3.81 → `12' 6"`. Null-safe. */
export function formatFtIn(m: number | null, dash = '—'): string {
  if (m == null) return dash;
  const totalIn = mToIn(m);
  let ft = Math.floor(totalIn / 12);
  let inch = Math.round(totalIn - ft * 12);
  if (inch === 12) {
    ft += 1;
    inch = 0;
  }
  return `${ft}' ${inch}"`;
}

/** Format meters as decimal feet, e.g. 3.81 → `12.5 ft`. Null-safe. */
export function formatFt(m: number | null, digits = 1, dash = '—'): string {
  return m == null ? dash : `${mToFt(m).toFixed(digits)} ft`;
}

/** Format square meters as square feet, e.g. 18 → `194 ft²`. */
export function formatSqFt(sqm: number, digits = 0): string {
  return `${sqmToSqft(sqm).toFixed(digits)} ft²`;
}

/**
 * Parse a feet/inches text entry to meters. Forgiving about notation:
 *   `16' 5"`, `16'5"`, `16' 5`, `16 5`, `16'`, `16`, `16.5`, `5"`.
 * A bare number is treated as feet; two bare numbers as feet then inches.
 * Returns null for empty/unparseable input.
 */
export function parseFtInToM(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;

  let feet = 0;
  let inches = 0;
  let matched = false;

  const ftMatch = s.match(/(-?\d+(?:\.\d+)?)\s*(?:'|ft\b)/i);
  const inMatch = s.match(/(-?\d+(?:\.\d+)?)\s*(?:"|in\b)/i);
  if (ftMatch) {
    feet = parseFloat(ftMatch[1]);
    matched = true;
  }
  if (inMatch) {
    inches = parseFloat(inMatch[1]);
    matched = true;
  }

  if (!matched) {
    const parts = s.split(/\s+/);
    const num = /^-?\d+(?:\.\d+)?$/;
    if (parts.length === 2 && num.test(parts[0]) && num.test(parts[1])) {
      feet = parseFloat(parts[0]);
      inches = parseFloat(parts[1]);
    } else if (num.test(s)) {
      feet = parseFloat(s);
    } else {
      return null;
    }
  }

  return ftToM(feet + inches / 12);
}
