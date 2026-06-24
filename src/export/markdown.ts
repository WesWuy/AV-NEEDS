/**
 * markdown.ts — Program Report (client-facing, D401.01 PROGRAM intent) +
 * Infrastructure/BOM skeleton, as Markdown and CSV. Every computed value
 * carries its standard citation and the verify qualifier.
 */
import type { Project, Space } from '../types';
import { computeSpace } from '../standards/compute';
import { STANDARDS_REVISIONS, VERIFY_QUALIFIER } from '../standards/standardsConfig';
import { QUESTION_GROUPS } from '../data/questionSet';

function m2(v: number | null, unit = 'm'): string {
  return v == null ? '—' : `${v.toFixed(2)} ${unit}`;
}

function answeredGroups(space: Space): string {
  const out: string[] = [];
  for (const g of QUESTION_GROUPS) {
    const lines = g.questions
      .filter((q) => (space.answers[q.id] ?? '').trim())
      .map((q) => `- **${q.label}** ${space.answers[q.id].trim()}`);
    if (lines.length) {
      out.push(`#### ${g.title}\n${lines.join('\n')}`);
    }
  }
  return out.length ? out.join('\n\n') : '_No interview notes captured for this space yet._';
}

export function spaceSectionMarkdown(space: Space): string {
  const c = computeSpace(space);
  const d = c.discas;
  const dims = space.dimensions;

  const recs: string[] = [];
  recs.push(
    `- **Minimum image height (DISCAS ${d.category}):** ${m2(d.minImageHeightM)} ` +
      `${d.minImageWidthM != null ? `(width ${m2(d.minImageWidthM)})` : ''}`,
  );
  if (d.recommendedDiagonalIn)
    recs.push(`- **Indicative panel size:** ~${d.recommendedDiagonalIn}" 16:9 (or larger / projection / dvLED)`);
  if (d.viewingRatio != null) recs.push(`- **Viewing ratio:** ≈ ${d.viewingRatio.toFixed(1)}`);
  if (d.closestViewerMinM != null)
    recs.push(`- **Closest-viewer minimum distance:** ${m2(d.closestViewerMinM)}`);
  if (c.contrast.bandLabel)
    recs.push(`- **Ambient / contrast (${STANDARDS_REVISIONS.contrast}):** ${c.contrast.bandLabel} — ${c.contrast.guidance}`);
  if (c.audio.targetSplDba != null)
    recs.push(
      `- **Audio (${STANDARDS_REVISIONS.audioCoverage}):** target ${c.audio.targetSplDba} dBA, ` +
        `S/N ${c.audio.signalToNoiseAdequate ? 'adequate' : 'AT RISK'}` +
        (c.audio.estimatedSourcesNeeded ? `, ≈${c.audio.estimatedSourcesNeeded} sources for uniform coverage` : ''),
    );

  const flagLines = c.flags.length
    ? c.flags.map((f) => `- ${f.level.toUpperCase()}: ${f.message}${f.standard ? ` _(${f.standard})_` : ''}`).join('\n')
    : '- None at this stage.';

  const openLines = c.openQuestions.length
    ? c.openQuestions.map((q) => `- ${q}`).join('\n')
    : '- None outstanding.';

  return `### Space: ${space.name} (${space.type})

**Room:** ${m2(dims.lengthM)} L × ${m2(dims.widthM)} W × ${m2(dims.ceilingHeightM)} ceiling · ` +
    `max ${space.maxParticipants ?? '—'} people · ${space.seatingLayout || 'layout TBD'}
**Viewer geometry:** farthest ${m2(space.farthestViewerM)}, closest ${m2(space.closestViewerM)}
**Primary use cases:** ${space.useCases.length ? space.useCases.join(', ') : '—'}

#### Indicative recommendations
> ${VERIFY_QUALIFIER}

${recs.join('\n')}

_${d.explanation}_

#### Flags & professional-judgement items
${flagLines}

#### Open items / data still needed
${openLines}

#### Needs-analysis interview notes
${answeredGroups(space)}
`;
}

export function programReportMarkdown(project: Project): string {
  const header = `# AV Program Report — ${project.clientName || 'Untitled Client'}

**Site:** ${project.siteName || '—'}
**Contact:** ${project.contact || '—'}
**Integrator:** ${project.integrator || '—'}
**Date:** ${project.projectDate}

> Structured per the PROGRAM phase of **${STANDARDS_REVISIONS.process}**. This is a
> non-technical needs-analysis summary for client review and sign-off **before**
> detailed design. ${VERIFY_QUALIFIER}

${project.notes ? `**Project notes:** ${project.notes}\n` : ''}
## Spaces (${project.spaces.length})
`;

  const sections = project.spaces.map(spaceSectionMarkdown).join('\n\n---\n\n');

  const verify = `

## Standards referenced
- ${STANDARDS_REVISIONS.process} — design & coordination process (PROGRAM phase)
- ${STANDARDS_REVISIONS.discas} — display image size
- ${STANDARDS_REVISIONS.contrast} — image system contrast ratio
- ${STANDARDS_REVISIONS.audioCoverage} / ${STANDARDS_REVISIONS.audioUniformity} — audio coverage & uniformity
- ${STANDARDS_REVISIONS.rack} / ${STANDARDS_REVISIONS.cableLabel} / ${STANDARDS_REVISIONS.power} — rack, labeling, power
- ${STANDARDS_REVISIONS.verification} — performance verification (closeout)
- ${STANDARDS_REVISIONS.vcLighting} — lighting for VC spaces

Requirements captured here that map to measurable metrics are intended to be
**verifiable at closeout** per ${STANDARDS_REVISIONS.verification}.

## Client sign-off
By signing, the client confirms the needs and indicative direction above
accurately represent requirements and approves progression to detailed design.

| | |
|---|---|
| Client name | __________________________ |
| Signature | __________________________ |
| Date | __________________________ |
| Integrator | ${project.integrator || '__________________________'} |

> ${VERIFY_QUALIFIER}
`;

  return header + '\n' + sections + verify;
}

/* ----------------------------- BOM exports ------------------------------- */

export function bomMarkdown(project: Project): string {
  let out = `# Infrastructure / BOM Skeleton — ${project.clientName || 'Untitled Client'}

> **NOT YET ENGINEERED.** A starting point for design derived from captured
> requirements. Quantities, models, and ratings are placeholders to be replaced
> during detailed design. ${VERIFY_QUALIFIER}\n`;

  for (const space of project.spaces) {
    const c = computeSpace(space);
    out += `\n## ${space.name} (${space.type})\n\n`;
    out += `| Category | Item | Qty | Power (W) | Rack U | Note |\n`;
    out += `|---|---|---:|---:|---:|---|\n`;
    for (const b of c.infra.bom) {
      out += `| ${b.category} | ${b.item} | ${b.qty} | ${b.powerW} | ${b.rackU} | ${b.note} |\n`;
    }
    out += `\n_Estimated load **${c.infra.totalPowerW} W** → **${c.infra.heatLoadBtuPerHr.toFixed(0)} BTU/hr**, ` +
      `~${c.infra.estimatedCircuits} circuit(s), ~${c.infra.estimatedRackU}U rack._\n`;
  }
  return out;
}

export function bomCsv(project: Project): string {
  const rows: string[] = ['Space,Category,Item,Qty,Power_W,Rack_U,Note'];
  const esc = (s: string | number) => {
    const v = String(s);
    return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  };
  for (const space of project.spaces) {
    const c = computeSpace(space);
    for (const b of c.infra.bom) {
      rows.push(
        [space.name, b.category, b.item, b.qty, b.powerW, b.rackU, b.note].map(esc).join(','),
      );
    }
  }
  return rows.join('\n');
}
