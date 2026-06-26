/**
 * pdf.ts — client-side Program Report PDF via jsPDF (bundled locally, no CDN).
 * A lightweight flowing-text renderer: headings, wrapped paragraphs, bullets,
 * automatic page breaks, footer with the verify qualifier, and a sign-off block.
 */
import { jsPDF } from 'jspdf';
import type { Project, Space } from '../types';
import { computeSpace } from '../standards/compute';
import { STANDARDS_REVISIONS, VERIFY_QUALIFIER } from '../standards/standardsConfig';
import { QUESTION_GROUPS } from '../data/questionSet';
import { formatFtIn } from '../units';

const MARGIN = 48;
const LINE = 14;

class Doc {
  doc = new jsPDF({ unit: 'pt', format: 'a4' });
  y = MARGIN;
  pageW = this.doc.internal.pageSize.getWidth();
  pageH = this.doc.internal.pageSize.getHeight();
  contentW = this.pageW - MARGIN * 2;

  footer() {
    const n = this.doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      this.doc.setPage(i);
      this.doc.setFont('helvetica', 'italic').setFontSize(7).setTextColor(120);
      this.doc.text(VERIFY_QUALIFIER, MARGIN, this.pageH - 24, { maxWidth: this.contentW });
      this.doc.text(`Page ${i} of ${n}`, this.pageW - MARGIN, this.pageH - 12, { align: 'right' });
      this.doc.setTextColor(0);
    }
  }

  break(need = LINE) {
    if (this.y + need > this.pageH - MARGIN) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  text(s: string, opts: { size?: number; style?: 'normal' | 'bold' | 'italic'; indent?: number; color?: number } = {}) {
    const { size = 10, style = 'normal', indent = 0, color = 0 } = opts;
    this.doc.setFont('helvetica', style).setFontSize(size).setTextColor(color);
    const lines = this.doc.splitTextToSize(s, this.contentW - indent) as string[];
    for (const ln of lines) {
      this.break();
      this.doc.text(ln, MARGIN + indent, this.y);
      this.y += size + 4;
    }
  }

  heading(s: string, size = 13) {
    this.break(size + 10);
    this.y += 6;
    this.text(s, { size, style: 'bold', color: 20 });
    this.y += 2;
  }

  bullet(s: string) {
    this.break();
    this.doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(0);
    const lines = this.doc.splitTextToSize(s, this.contentW - 14) as string[];
    this.doc.text('•', MARGIN, this.y);
    lines.forEach((ln, i) => {
      this.break();
      this.doc.text(ln, MARGIN + 12, this.y);
      if (i < lines.length - 1) this.y += LINE;
    });
    this.y += LINE;
  }

  rule() {
    this.break(12);
    this.doc.setDrawColor(200).line(MARGIN, this.y, this.pageW - MARGIN, this.y);
    this.y += 10;
  }
}

function m2(v: number | null): string {
  return formatFtIn(v);
}

function renderSpace(d: Doc, space: Space) {
  const c = computeSpace(space);
  d.heading(`Space: ${space.name} (${space.type})`, 12);
  const dims = space.dimensions;
  d.text(
    `Room ${m2(dims.lengthM)} × ${m2(dims.widthM)} × ${m2(dims.ceilingHeightM)} ceiling · ` +
      `max ${space.maxParticipants ?? '—'} people · ${space.seatingLayout || 'layout TBD'}`,
    { size: 9, color: 80 },
  );
  d.text(
    `Viewer geometry: farthest ${m2(space.farthestViewerM)}, closest ${m2(space.closestViewerM)} · ` +
      `Use cases: ${space.useCases.join(', ') || '—'}`,
    { size: 9, color: 80 },
  );

  d.heading('Indicative recommendations', 10.5);
  const dr = c.discas;
  d.bullet(`Minimum image height (DISCAS ${dr.category}): ${m2(dr.minImageHeightM)}` +
    (dr.minImageWidthM != null ? ` (width ${m2(dr.minImageWidthM)})` : ''));
  if (dr.recommendedDiagonalIn) d.bullet(`Indicative panel: ~${dr.recommendedDiagonalIn}" 16:9 (or larger / projection / dvLED)`);
  if (dr.viewingRatio != null) d.bullet(`Viewing ratio ≈ ${dr.viewingRatio.toFixed(1)}`);
  if (dr.closestViewerMinM != null) d.bullet(`Closest-viewer minimum distance: ${m2(dr.closestViewerMinM)}`);
  if (c.contrast.bandLabel) d.bullet(`Ambient/contrast: ${c.contrast.bandLabel} — ${c.contrast.guidance}`);
  if (c.audio.targetSplDba != null)
    d.bullet(`Audio: target ${c.audio.targetSplDba} dBA, S/N ${c.audio.signalToNoiseAdequate ? 'adequate' : 'AT RISK'}`);
  d.text(dr.explanation, { size: 8.5, style: 'italic', color: 90 });

  if (c.flags.length) {
    d.heading('Flags & professional-judgement items', 10.5);
    c.flags.forEach((f) => d.bullet(`${f.level.toUpperCase()}: ${f.message}${f.standard ? ` (${f.standard})` : ''}`));
  }

  if (c.openQuestions.length) {
    d.heading('Open items / data still needed', 10.5);
    c.openQuestions.forEach((q) => d.bullet(q));
  }

  // Interview notes (only answered)
  const groups = QUESTION_GROUPS.map((g) => ({
    g,
    items: g.questions.filter((q) => (space.answers[q.id] ?? '').trim()),
  })).filter((x) => x.items.length);
  if (groups.length) {
    d.heading('Needs-analysis interview notes', 10.5);
    groups.forEach(({ g, items }) => {
      d.text(g.title, { size: 9.5, style: 'bold', color: 40 });
      items.forEach((q) => d.bullet(`${q.label} ${space.answers[q.id].trim()}`));
    });
  }
  d.rule();
}

export function programReportPdf(project: Project): jsPDF {
  const d = new Doc();
  d.text('AV PROGRAM REPORT', { size: 18, style: 'bold', color: 13 });
  d.text(project.clientName || 'Untitled Client', { size: 13, style: 'bold' });
  d.text(`Site: ${project.siteName || '—'}   ·   Contact: ${project.contact || '—'}`, { size: 9, color: 80 });
  d.text(`Integrator: ${project.integrator || '—'}   ·   Date: ${project.projectDate}`, { size: 9, color: 80 });
  d.y += 4;
  d.text(
    `Structured per the PROGRAM phase of ${STANDARDS_REVISIONS.process}. Non-technical ` +
      `needs-analysis summary for client review and sign-off before detailed design.`,
    { size: 9, style: 'italic', color: 70 },
  );
  if (project.notes) d.text(`Project notes: ${project.notes}`, { size: 9, color: 80 });
  d.rule();

  project.spaces.forEach((s) => renderSpace(d, s));

  d.heading('Standards referenced', 12);
  [
    `${STANDARDS_REVISIONS.process} — design & coordination process (PROGRAM phase)`,
    `${STANDARDS_REVISIONS.discas} — display image size`,
    `${STANDARDS_REVISIONS.contrast} — image system contrast ratio`,
    `${STANDARDS_REVISIONS.audioCoverage} / ${STANDARDS_REVISIONS.audioUniformity} — audio coverage & uniformity`,
    `${STANDARDS_REVISIONS.rack} / ${STANDARDS_REVISIONS.cableLabel} / ${STANDARDS_REVISIONS.power} — rack, labeling, power`,
    `${STANDARDS_REVISIONS.verification} — performance verification (verifiable at closeout)`,
    `${STANDARDS_REVISIONS.vcLighting} — lighting for VC spaces`,
  ].forEach((s) => d.bullet(s));

  d.heading('Client sign-off', 12);
  d.text(
    'By signing, the client confirms the needs and indicative direction above accurately ' +
      'represent requirements and approves progression to detailed design.',
    { size: 9.5 },
  );
  d.y += 18;
  const fields = ['Client name', 'Signature', 'Date', 'Integrator'];
  fields.forEach((f) => {
    d.break(28);
    d.doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(0);
    d.doc.text(`${f}:`, MARGIN, d.y);
    d.doc.setDrawColor(140).line(MARGIN + 90, d.y, d.pageW - MARGIN, d.y);
    d.y += 28;
  });

  d.footer();
  return d.doc;
}
