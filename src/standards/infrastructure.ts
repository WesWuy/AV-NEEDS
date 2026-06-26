/**
 * infrastructure.ts — F502.01:2018 (rack/thermal) + S601.01:2021 (power) early
 * BOM SKELETON + power/heat/rack estimate. Explicitly NOT engineered: every
 * line is a planning placeholder derived from captured requirements.
 */
import { INFRA, STANDARDS_REVISIONS } from './standardsConfig';
import { formatSqFt } from '../units';
import type { BomLine, Flag, InfraResult, Space } from '../types';

export function computeInfra(space: Space, recommendedDiagonalIn: number | null): InfraResult {
  const flags: Flag[] = [];
  const p = INFRA.devicePowerW;
  const u = INFRA.deviceRackU;
  const bom: BomLine[] = [];

  const usesVc = /conf|huddle|town|training|lecture/.test(space.type) || !!space.vcPlatform;

  // Display
  if (space.displayTech === 'dvled') {
    const w = space.dimensions.widthM ?? 4;
    const approxAreaSqM = Math.max(2, (w * 0.4)); // VERIFY rough wall area estimate
    bom.push({
      category: 'Display',
      item: `Direct-view LED wall (~${formatSqFt(approxAreaSqM, 1)})`,
      qty: 1,
      powerW: Math.round(approxAreaSqM * p.dvLedPerSqMeter),
      rackU: 0,
      note: 'Area is a rough placeholder; size per DISCAS + wall survey.',
    });
  } else if (space.displayTech === 'projection') {
    bom.push({
      category: 'Display',
      item: 'Projector + screen',
      qty: 1,
      powerW: p.projector,
      rackU: 0,
      note: 'Lumens per ambient-light/contrast analysis (V201.01).',
    });
  } else {
    const diag = recommendedDiagonalIn ?? 75;
    bom.push({
      category: 'Display',
      item: `Flat panel display (~${diag}")`,
      qty: 1,
      powerW: Math.round(diag * p.displayPerDiagonalInch),
      rackU: 0,
      note: 'Size from DISCAS recommendation.',
    });
  }

  // Conferencing compute / codec
  if (usesVc) {
    bom.push({
      category: 'Conferencing',
      item: 'Codec / meeting-room compute (MTR/Zoom Room)',
      qty: 1,
      powerW: p.codecMtr,
      rackU: u.codecMtr,
      note: `Platform: ${space.vcPlatform || 'TBD'} (${space.vcTopology || 'topology TBD'}).`,
    });
    bom.push({
      category: 'Conferencing',
      item: 'PTZ / intelligent camera',
      qty: 1,
      powerW: p.ptzCamera,
      rackU: 0,
      note: 'Count/placement per room size & sightlines.',
    });
    flags.push({
      level: 'info',
      message: 'Video-conferencing space — confirm lighting per RP-38-17.',
      standard: STANDARDS_REVISIONS.vcLighting,
    });
  }

  // Audio
  if (space.audioIntent !== 'none') {
    bom.push({
      category: 'Audio',
      item: 'DSP (echo cancel / mix)',
      qty: 1,
      powerW: p.dsp,
      rackU: u.dsp,
      note: 'Channel count per mic/speaker design (A104/A102).',
    });
    bom.push({
      category: 'Audio',
      item: 'Amplifier',
      qty: 1,
      powerW: p.ampPerChannel * 2,
      rackU: u.amp,
      note: 'Channels & wattage per coverage design.',
    });
    bom.push({
      category: 'Audio',
      item: 'Microphones (ceiling/table)',
      qty: 1,
      powerW: 0,
      rackU: 0,
      note: 'Quantity per coverage/uniformity design.',
    });
    bom.push({
      category: 'Audio',
      item: 'Loudspeakers',
      qty: 1,
      powerW: 0,
      rackU: 0,
      note: 'Quantity per A102 uniformity (see audio flags).',
    });
  }

  // Control
  if (space.controlNeeds.trim()) {
    bom.push({
      category: 'Control',
      item: 'Control processor + touch panel',
      qty: 1,
      powerW: p.controlProcessor,
      rackU: u.controlProcessor,
      note: space.controlNeeds.slice(0, 80),
    });
  }

  // Network
  bom.push({
    category: 'Network',
    item: 'PoE network switch (AV VLAN)',
    qty: 1,
    powerW: p.networkSwitchPoe,
    rackU: u.networkSwitch,
    note: 'Port count + PoE budget per device list; coordinate with IT.',
  });

  // Power conditioning + rack misc
  bom.push({
    category: 'Power',
    item: 'Rack power conditioner / PDU',
    qty: 1,
    powerW: 0,
    rackU: u.powerConditioner,
    note: 'Sized to total load + headroom (S601.01).',
  });
  bom.push({
    category: 'Infrastructure',
    item: 'Equipment rack + cable management + labeling',
    qty: 1,
    powerW: p.miscPerRack,
    rackU: u.shelfMisc,
    note: 'Thermal & population per F502.01; labeling per F501.01.',
  });

  const totalPowerW = bom.reduce((s, b) => s + b.powerW, 0);
  const heatLoadBtuPerHr = totalPowerW * INFRA.wattsToBtuPerHr;
  const estimatedCircuits = Math.max(1, Math.ceil(totalPowerW / INFRA.circuitCapacityW));
  const estimatedRackU = bom.reduce((s, b) => s + b.rackU, 0);

  flags.push({
    level: 'info',
    message:
      `Estimated load ${totalPowerW} W → ${heatLoadBtuPerHr.toFixed(0)} BTU/hr of HVAC heat, ` +
      `~${estimatedCircuits} branch circuit(s), ~${estimatedRackU}U of rack space. Planning ` +
      `estimate only — confirm against actual device nameplates (S601.01 / F502.01).`,
    standard: STANDARDS_REVISIONS.power,
  });

  return { bom, totalPowerW, heatLoadBtuPerHr, estimatedCircuits, estimatedRackU, flags };
}
