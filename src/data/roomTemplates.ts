/**
 * roomTemplates.ts — preloaded, FULLY EDITABLE baselines per room type.
 * These pre-fill typical use cases, the DISCAS content category (BDM vs ADM),
 * and sensible starting geometry the operator adjusts on site.
 */
import type { Space, SpaceType } from '../types';
import { DISCAS } from '../standards/standardsConfig';
import { ftToM } from '../units';

/** Baselines are authored in round feet (US convention) and stored as meters. */
const ft = (n: number): number => ftToM(n);

export interface RoomTemplate {
  type: SpaceType;
  label: string;
  blurb: string;
  defaults: Partial<Space>;
}

const base = (over: Partial<Space>): Partial<Space> => ({
  viewingCategory: 'BDM',
  percentElementHeight: DISCAS.defaultPercentElementHeightBDM,
  verticalResolutionLines: 2160,
  aspectRatioW: DISCAS.defaultAspectRatioW,
  aspectRatioH: DISCAS.defaultAspectRatioH,
  audioIntent: 'speechReinforcement',
  displayTech: 'lcd',
  budgetTier: 'unknown',
  ...over,
});

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    type: 'huddle',
    label: 'Huddle (2–4)',
    blurb: 'Small ad-hoc collaboration; single display, BYOD or small MTR.',
    defaults: base({
      type: 'huddle',
      maxParticipants: 4,
      seatingLayout: 'Open / sofa or small table',
      farthestViewerM: ft(8),
      closestViewerM: ft(4),
      useCases: ['Video calls', 'Content sharing', 'Ad-hoc collaboration'],
      vcTopology: 'BYOD or small MTR',
    }),
  },
  {
    type: 'small-conf',
    label: 'Small conference (5–8)',
    blurb: 'Single display, dedicated MTR, table mics.',
    defaults: base({
      type: 'small-conf',
      maxParticipants: 8,
      seatingLayout: 'Boardroom table',
      farthestViewerM: ft(13),
      closestViewerM: ft(5),
      useCases: ['Video conferencing', 'Presentations', 'Content sharing'],
      vcTopology: 'Dedicated MTR',
    }),
  },
  {
    type: 'medium-conf',
    label: 'Medium conference (8–12)',
    blurb: 'Single or dual display, ceiling mics, camera.',
    defaults: base({
      type: 'medium-conf',
      maxParticipants: 12,
      seatingLayout: 'Boardroom table',
      farthestViewerM: ft(20),
      closestViewerM: ft(6),
      useCases: ['Video conferencing', 'Presentations', 'Spreadsheets/detail review'],
      audioIntent: 'speechReinforcement',
    }),
  },
  {
    type: 'large-conf',
    label: 'Large conference / Boardroom',
    blurb: 'Detail review, dual displays, reinforced audio.',
    defaults: base({
      type: 'large-conf',
      maxParticipants: 18,
      seatingLayout: 'Large boardroom',
      farthestViewerM: ft(26),
      closestViewerM: ft(7),
      viewingCategory: 'ADM',
      useCases: ['Detailed financials/CAD', 'Video conferencing', 'Board presentations'],
      audioIntent: 'speechReinforcement',
    }),
  },
  {
    type: 'training',
    label: 'Training / Classroom',
    blurb: 'Instructor + students, detailed content, reinforcement.',
    defaults: base({
      type: 'training',
      maxParticipants: 24,
      seatingLayout: 'Classroom rows',
      farthestViewerM: ft(30),
      closestViewerM: ft(8),
      viewingCategory: 'ADM',
      useCases: ['Instruction', 'Detailed content', 'Hybrid learners'],
      audioIntent: 'speechReinforcement',
    }),
  },
  {
    type: 'town-hall',
    label: 'Town hall / Divisible room',
    blurb: 'Large flexible space, combinable, distributed audio.',
    defaults: base({
      type: 'town-hall',
      maxParticipants: 80,
      seatingLayout: 'Banquet / theater, divisible',
      farthestViewerM: ft(46),
      closestViewerM: ft(10),
      displayTech: 'dvled',
      useCases: ['All-hands', 'Presentations', 'Streaming/recording'],
      audioIntent: 'programAudio',
    }),
  },
  {
    type: 'lecture',
    label: 'Lecture / Auditorium',
    blurb: 'Large fixed-seat venue, projection or LED, reinforced audio.',
    defaults: base({
      type: 'lecture',
      maxParticipants: 150,
      seatingLayout: 'Theater / raked',
      farthestViewerM: ft(66),
      closestViewerM: ft(13),
      displayTech: 'projection',
      viewingCategory: 'ADM',
      useCases: ['Lectures', 'Presentations', 'Capture/streaming'],
      audioIntent: 'programAudio',
    }),
  },
  {
    type: 'signage',
    label: 'Reception / Digital signage',
    blurb: 'Wayfinding / branding; basic legibility, often bright ambient.',
    defaults: base({
      type: 'signage',
      maxParticipants: 0,
      seatingLayout: 'Standing / transient',
      farthestViewerM: ft(20),
      closestViewerM: ft(5),
      viewingCategory: 'BDM',
      percentElementHeight: 0.08,
      displayTech: 'lcd',
      audioIntent: 'none',
      ambientLightLux: 400,
      useCases: ['Branding', 'Wayfinding', 'Announcements'],
    }),
  },
  {
    type: 'custom',
    label: 'Custom / blank',
    blurb: 'Start from scratch.',
    defaults: base({ type: 'custom', useCases: [] }),
  },
];

export function templateFor(type: SpaceType): RoomTemplate {
  return ROOM_TEMPLATES.find((t) => t.type === type) ?? ROOM_TEMPLATES[ROOM_TEMPLATES.length - 1];
}
