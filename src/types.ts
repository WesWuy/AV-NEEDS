/**
 * types.ts — Project / Space data model and computed-output types.
 * The persisted shape (Project) is what gets serialized to localStorage and
 * exported as JSON, so changing it requires a SCHEMA_VERSION bump + migration.
 */

export const SCHEMA_VERSION = 1;

export type ViewingCategory = 'BDM' | 'ADM';
export type BudgetTier = 'value' | 'standard' | 'premium' | 'unknown';
export type DisplayTech = 'lcd' | 'dvled' | 'projection' | 'undecided';

export type SpaceType =
  | 'huddle'
  | 'small-conf'
  | 'medium-conf'
  | 'large-conf'
  | 'training'
  | 'town-hall'
  | 'lecture'
  | 'signage'
  | 'custom';

/** Free-text + structured answers for the D401.01 program question groups. */
export interface QuestionAnswers {
  [questionId: string]: string;
}

export interface SpaceDimensions {
  lengthM: number | null;
  widthM: number | null;
  ceilingHeightM: number | null;
}

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  dimensions: SpaceDimensions;
  maxParticipants: number | null;
  seatingLayout: string;

  // DISCAS viewer geometry
  farthestViewerM: number | null;
  closestViewerM: number | null;
  viewingCategory: ViewingCategory;
  percentElementHeight: number; // fraction, e.g. 0.05 (BDM input)
  verticalResolutionLines: number; // ADM input
  aspectRatioW: number;
  aspectRatioH: number;

  // Environment
  ambientLightLux: number | null;
  noiseFloorDba: number | null;
  acousticNotes: string;

  // Intent / systems
  useCases: string[];
  audioIntent: 'speechReinforcement' | 'programAudio' | 'criticalListening' | 'none';
  vcPlatform: string;
  vcTopology: string;
  controlNeeds: string;
  networkNotes: string;
  displayTech: DisplayTech;
  budgetTier: BudgetTier;

  // Program-phase question answers, keyed by question id
  answers: QuestionAnswers;

  // Operator's running open-items / flags they add manually
  operatorNotes: string;
}

export interface Project {
  schemaVersion: number;
  id: string;
  clientName: string;
  siteName: string;
  contact: string;
  integrator: string;
  projectDate: string; // ISO date
  notes: string;
  spaces: Space[];
  createdAt: string;
  updatedAt: string;
}

/* ----------------------------- Computed types ---------------------------- */

export type FlagLevel = 'info' | 'warn' | 'critical';

export interface Flag {
  level: FlagLevel;
  message: string;
  standard?: string;
}

export interface DiscasResult {
  category: ViewingCategory;
  minImageHeightM: number | null;
  minImageWidthM: number | null;
  recommendedDiagonalIn: number | null;
  viewingRatio: number | null;
  // Closest-viewer geometric minimum distance
  closestViewerMinM: number | null;
  // Mounting sanity
  imageTopHeightM: number | null;
  mountingExceedsCeiling: boolean;
  explanation: string;
  flags: Flag[];
}

export interface AudioResult {
  targetSplDba: number | null;
  assumedNoiseFloorDba: number;
  signalToNoiseAdequate: boolean | null;
  estimatedSourcesNeeded: number | null;
  flags: Flag[];
}

export interface ContrastResult {
  bandLabel: string | null;
  risk: string | null;
  guidance: string | null;
  flags: Flag[];
}

export interface BomLine {
  category: string;
  item: string;
  qty: number;
  powerW: number;
  rackU: number;
  note: string;
}

export interface InfraResult {
  bom: BomLine[];
  totalPowerW: number;
  heatLoadBtuPerHr: number;
  estimatedCircuits: number;
  estimatedRackU: number;
  flags: Flag[];
}

export interface SpaceComputation {
  discas: DiscasResult;
  audio: AudioResult;
  contrast: ContrastResult;
  infra: InfraResult;
  openQuestions: string[];
  flags: Flag[]; // aggregated
}
