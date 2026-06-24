/**
 * questionSet.ts — the needs-analysis question set, organized by the
 * D401.01:2023 PROGRAM-phase intent. Plain-language wording so the operator can
 * read each aloud to a non-technical stakeholder. Answers are stored on
 * Space.answers keyed by question id; this set drives both the on-screen
 * interview tabs and the Program Report structure.
 */
export interface Question {
  id: string;
  label: string;
  hint?: string;
  long?: boolean; // textarea vs single line
}

export interface QuestionGroup {
  id: string;
  title: string;
  intent: string;
  questions: Question[];
}

export const QUESTION_GROUPS: QuestionGroup[] = [
  {
    id: 'purpose',
    title: '1. Purpose & success criteria',
    intent: 'What outcome must this space enable, and how will we know it succeeded?',
    questions: [
      { id: 'purpose.primary', label: 'What is the primary purpose of this space?', long: true },
      { id: 'purpose.success', label: 'What does success look like 6 months after install?', long: true },
      { id: 'purpose.problem', label: 'What problem with the current space are we solving?', long: true },
      { id: 'purpose.frequency', label: 'How often and by whom will it be used?' },
    ],
  },
  {
    id: 'users',
    title: '2. Users & use cases',
    intent: 'Who uses the room and for what scenarios?',
    questions: [
      { id: 'users.who', label: 'Who are the typical users (roles, tech comfort)?', long: true },
      { id: 'users.scenarios', label: 'List the main use cases / meeting types.', long: true },
      { id: 'users.remote', label: 'What share of meetings include remote participants?' },
      { id: 'users.guests', label: 'Will external guests / BYOD need to present?' },
    ],
  },
  {
    id: 'space',
    title: '3. Space & environment',
    intent: 'Physical room, sightlines, acoustics, lighting.',
    questions: [
      { id: 'space.shape', label: 'Describe room shape, obstructions, windows.', long: true },
      { id: 'space.glass', label: 'Glass walls / hard surfaces affecting acoustics?' },
      { id: 'space.lighting', label: 'Lighting type and control (daylight, dimming)?' },
      { id: 'space.existing', label: 'Existing furniture/layout constraints?' },
    ],
  },
  {
    id: 'display',
    title: '4. Display & visual',
    intent: 'What must people see, from where, and in what detail?',
    questions: [
      { id: 'display.content', label: 'What content is shown (slides, video, CAD, spreadsheets)?', long: true },
      { id: 'display.detail', label: 'Is fine detail required (analytical) or general legibility (basic)?' },
      { id: 'display.count', label: 'One display or multiple? Confidence monitors?' },
      { id: 'display.tech', label: 'Any preference/constraint on display technology?' },
    ],
  },
  {
    id: 'audio',
    title: '5. Audio',
    intent: 'Speech reinforcement, program audio, intelligibility needs.',
    questions: [
      { id: 'audio.need', label: 'Speech reinforcement, program audio, or both?' },
      { id: 'audio.capture', label: 'How should voices be captured (table/ceiling/wireless)?' },
      { id: 'audio.noise', label: 'Known noise sources (HVAC, corridor, adjacent rooms)?', long: true },
      { id: 'audio.privacy', label: 'Any speech-privacy / confidentiality requirements?' },
    ],
  },
  {
    id: 'vc',
    title: '6. Conferencing & collaboration',
    intent: 'Platform, topology, and collaboration workflows.',
    questions: [
      { id: 'vc.platform', label: 'Which platform(s)? (Teams, Zoom, Webex, Google Meet)' },
      { id: 'vc.topology', label: 'Native room system (MTR) or BYOD/USB?' },
      { id: 'vc.share', label: 'Wired and/or wireless content sharing expectations?' },
      { id: 'vc.camera', label: 'Camera framing needs (speaker track, multi-cam)?' },
    ],
  },
  {
    id: 'control',
    title: '7. Control & UX',
    intent: 'How users operate the room.',
    questions: [
      { id: 'control.ux', label: 'Desired control experience (one-touch join, touch panel, automation)?', long: true },
      { id: 'control.scenes', label: 'Common scenes/presets (present, VC, blackout)?' },
      { id: 'control.support', label: 'Remote monitoring / help-desk integration needed?' },
    ],
  },
  {
    id: 'network',
    title: '8. Network / IT & security',
    intent: 'Connectivity, security posture, IT ownership.',
    questions: [
      { id: 'net.vlan', label: 'AV VLAN / network segmentation requirements?', long: true },
      { id: 'net.ports', label: 'Available drops, PoE, bandwidth at the location?' },
      { id: 'net.security', label: 'Security/compliance constraints (firewall, certs, MDM)?', long: true },
      { id: 'net.owner', label: 'Who owns the network and provisions accounts?' },
    ],
  },
  {
    id: 'infra',
    title: '9. Infrastructure',
    intent: 'Power, conduit, mounting, structure, HVAC.',
    questions: [
      { id: 'infra.power', label: 'Available power circuits at display & rack locations?' },
      { id: 'infra.conduit', label: 'Conduit / pathway / floor-box availability?' },
      { id: 'infra.mount', label: 'Wall/ceiling structure for mounting (stud, concrete, glass)?', long: true },
      { id: 'infra.hvac', label: 'HVAC capacity / heat-load concerns near equipment?' },
    ],
  },
  {
    id: 'access',
    title: '10. Accessibility & compliance',
    intent: 'ADA, assistive listening, inclusive design.',
    questions: [
      { id: 'access.al', label: 'Assistive-listening requirement (ADA)?' },
      { id: 'access.reach', label: 'Reach/height/ADA constraints for controls & displays?' },
      { id: 'access.captions', label: 'Captioning / transcription expectations?' },
    ],
  },
  {
    id: 'budget',
    title: '11. Budget, schedule & constraints',
    intent: 'Money, time, and hard limits.',
    questions: [
      { id: 'budget.range', label: 'Budget tier or order-of-magnitude range?' },
      { id: 'budget.schedule', label: 'Key dates / occupancy deadline?' },
      { id: 'budget.standards', label: 'Corporate AV standards / preferred brands to match?', long: true },
    ],
  },
  {
    id: 'existing',
    title: '12. Existing conditions / pain points',
    intent: 'What exists today and what frustrates users.',
    questions: [
      { id: 'exist.gear', label: 'Existing equipment to reuse or remove?', long: true },
      { id: 'exist.pain', label: 'Top complaints about the current setup?', long: true },
      { id: 'exist.risks', label: 'Known risks / site access / phasing constraints?', long: true },
    ],
  },
];

/** Flat lookup of question label by id, for exports. */
export const QUESTION_LABELS: Record<string, string> = Object.fromEntries(
  QUESTION_GROUPS.flatMap((g) => g.questions.map((q) => [q.id, q.label])),
);
