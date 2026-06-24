/** ExportBar.tsx — generate & download all v1 outputs (no backend). */
import { useRef } from 'react';
import type { Project } from '../types';
import { programReportMarkdown, bomMarkdown, bomCsv } from '../export/markdown';
import { programReportPdf } from '../export/pdf';
import { projectToJson, parseProjectJson } from '../export/json';
import { downloadText, triggerDownload, slug } from '../export/download';

export default function ExportBar({
  project,
  onImport,
}: {
  project: Project;
  onImport: (p: Project) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const base = slug(project.clientName || project.siteName);

  const exportPdf = () => {
    const doc = programReportPdf(project);
    triggerDownload(`${base}-program-report.pdf`, doc.output('blob'));
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      onImport(parseProjectJson(text));
    } catch (e) {
      alert(`Could not import project: ${(e as Error).message}`);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="btn-primary" onClick={exportPdf}>Program Report (PDF)</button>
      <button
        className="btn-ghost"
        onClick={() => downloadText(`${base}-program-report.md`, programReportMarkdown(project), 'text/markdown')}
      >
        Report (MD)
      </button>
      <button
        className="btn-ghost"
        onClick={() => downloadText(`${base}-bom-skeleton.md`, bomMarkdown(project), 'text/markdown')}
      >
        BOM (MD)
      </button>
      <button
        className="btn-ghost"
        onClick={() => downloadText(`${base}-bom-skeleton.csv`, bomCsv(project), 'text/csv')}
      >
        BOM (CSV)
      </button>
      <button
        className="btn-ghost"
        onClick={() => downloadText(`${base}-project.json`, projectToJson(project), 'application/json')}
      >
        Save JSON
      </button>
      <button className="btn-ghost" onClick={() => fileRef.current?.click()}>Load JSON</button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
