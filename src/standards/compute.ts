/**
 * compute.ts — orchestrates the per-space computation: DISCAS + audio +
 * contrast + infrastructure, plus a derived "open questions" list (data the
 * tool needs but doesn't have). All consumers (UI panel, exports) call this so
 * the live values and the exported values are guaranteed identical.
 */
import type { Flag, Space, SpaceComputation } from '../types';
import { computeDiscas } from './discas';
import { computeAudio } from './audio';
import { computeContrast } from './contrast';
import { computeInfra } from './infrastructure';

function deriveOpenQuestions(space: Space): string[] {
  const q: string[] = [];
  const d = space.dimensions;
  if (d.lengthM == null || d.widthM == null || d.ceilingHeightM == null)
    q.push('Confirm room dimensions (L × W × ceiling height).');
  if (space.farthestViewerM == null) q.push('Measure farthest viewer distance to the display.');
  if (space.closestViewerM == null) q.push('Measure closest viewer distance to the display.');
  if (space.ambientLightLux == null) q.push('Measure ambient light (lux) at the screen wall.');
  if (space.noiseFloorDba == null && space.audioIntent !== 'none')
    q.push('Measure room noise floor (dBA / NC) for audio S/N.');
  if (space.maxParticipants == null) q.push('Confirm maximum participant / occupancy count.');
  if (!space.vcPlatform && /conf|huddle|town|training|lecture/.test(space.type))
    q.push('Confirm conferencing platform and topology (e.g. Teams/Zoom, BYOD vs MTR).');
  if (space.budgetTier === 'unknown') q.push('Establish budget tier / order-of-magnitude budget.');
  if (!space.controlNeeds.trim()) q.push('Define control system / user-experience expectations.');
  if (!space.networkNotes.trim())
    q.push('Coordinate network/IT & security requirements (VLAN, ports, PoE, firewall).');
  return q;
}

export function computeSpace(space: Space): SpaceComputation {
  const discas = computeDiscas(space);
  const audio = computeAudio(space);
  const contrast = computeContrast(space);
  const infra = computeInfra(space, discas.recommendedDiagonalIn);
  const openQuestions = deriveOpenQuestions(space);

  const flags: Flag[] = [
    ...discas.flags,
    ...audio.flags,
    ...contrast.flags,
    ...infra.flags,
  ];

  return { discas, audio, contrast, infra, openQuestions, flags };
}
