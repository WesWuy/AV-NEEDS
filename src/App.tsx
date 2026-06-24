import { useEffect, useState } from 'react';
import { useProjectStore } from './state/store';
import type { Project, SpaceType } from './types';
import { ROOM_TEMPLATES } from './data/roomTemplates';
import { computeSpace } from './standards/compute';
import { VERIFY_QUALIFIER } from './standards/standardsConfig';
import { Field, TextArea, TextInput } from './components/ui';
import SpaceEditor from './components/SpaceEditor';
import ComputedPanel from './components/ComputedPanel';
import ExportBar from './components/ExportBar';

function timeAgo(ts: number | null): string {
  if (!ts) return 'not yet';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 2) return 'just now';
  if (s < 60) return `${s}s ago`;
  return `${Math.round(s / 60)}m ago`;
}

export default function App() {
  const store = useProjectStore();
  const { project } = store;
  const [selectedId, setSelectedId] = useState<string>(project.spaces[0]?.id ?? '');
  const [showAdd, setShowAdd] = useState(false);
  const [, force] = useState(0);

  // keep a relative "saved Xs ago" label fresh
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const selected = project.spaces.find((s) => s.id === selectedId) ?? project.spaces[0];

  const setProjField = <K extends keyof Project>(key: K, value: Project[K]) =>
    store.update((p) => ({ ...p, [key]: value }));

  const addSpace = (type: SpaceType) => {
    const id = store.addSpace(type);
    setSelectedId(id);
    setShowAdd(false);
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-brand-900 text-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-2.5">
          <div className="mr-auto">
            <div className="text-sm font-bold leading-tight">AVIXA Discovery Instrument</div>
            <div className="text-[11px] text-brand-100">Needs analysis · indicative standards-based recommendations</div>
          </div>
          <span className="text-[11px] text-brand-100">Autosaved {timeAgo(store.savedAt)}</span>
          <ExportBar project={project} onImport={(p) => { store.replaceProject(p); setSelectedId(p.spaces[0]?.id ?? ''); }} />
        </div>
      </header>

      {/* Verify banner */}
      <div className="bg-amber-100 px-4 py-1.5 text-center text-[11px] text-amber-900">
        ⚠ {VERIFY_QUALIFIER}
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-4 px-4 py-4">
        {/* Sidebar navigator */}
        <aside className="w-56 shrink-0 space-y-3">
          <div className="card p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase text-slate-500">Spaces ({project.spaces.length})</h2>
              <button className="text-brand-600 hover:text-brand-700" onClick={() => setShowAdd((v) => !v)}>+ Add</button>
            </div>
            {showAdd && (
              <div className="mb-2 space-y-1 rounded-md border border-slate-200 p-2">
                {ROOM_TEMPLATES.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => addSpace(t.type)}
                    className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-slate-100"
                    title={t.blurb}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
            <ul className="space-y-1">
              {project.spaces.map((s) => {
                const flags = computeSpace(s).flags.filter((f) => f.level !== 'info').length;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${
                        s.id === selected?.id ? 'bg-brand-50 font-semibold text-brand-900' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{s.name || 'Untitled'}</span>
                      {flags > 0 && (
                        <span className="ml-1 rounded-full bg-amber-200 px-1.5 text-[10px] font-bold text-amber-900">{flags}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            {project.spaces.length > 1 && selected && (
              <button
                className="mt-2 w-full text-left text-[11px] text-red-500 hover:text-red-700"
                onClick={() => {
                  if (confirm(`Delete space "${selected.name}"?`)) {
                    store.removeSpace(selected.id);
                    const rest = project.spaces.filter((s) => s.id !== selected.id);
                    setSelectedId(rest[0]?.id ?? '');
                  }
                }}
              >
                Delete selected space
              </button>
            )}
          </div>

          {/* Project info */}
          <div className="card space-y-2 p-3">
            <h2 className="text-xs font-bold uppercase text-slate-500">Project</h2>
            <Field label="Client"><TextInput value={project.clientName} onChange={(v) => setProjField('clientName', v)} /></Field>
            <Field label="Site"><TextInput value={project.siteName} onChange={(v) => setProjField('siteName', v)} /></Field>
            <Field label="Contact"><TextInput value={project.contact} onChange={(v) => setProjField('contact', v)} /></Field>
            <Field label="Integrator"><TextInput value={project.integrator} onChange={(v) => setProjField('integrator', v)} /></Field>
            <Field label="Date"><TextInput value={project.projectDate} onChange={(v) => setProjField('projectDate', v)} /></Field>
            <Field label="Project notes"><TextArea rows={2} value={project.notes} onChange={(v) => setProjField('notes', v)} /></Field>
            <button
              className="w-full text-left text-[11px] text-slate-400 hover:text-red-600"
              onClick={() => { if (confirm('Start a new blank project? Export first to keep the current one.')) { store.resetProject(); setSelectedId(''); } }}
            >
              New blank project…
            </button>
          </div>
        </aside>

        {/* Editor */}
        <main className="min-w-0 flex-1">
          {selected && (
            <div className="card mb-4 p-4 xl:hidden">
              <ComputedPanel space={selected} />
            </div>
          )}
          {selected ? (
            <SpaceEditor space={selected} onChange={(fn) => store.updateSpace(selected.id, fn)} />
          ) : (
            <div className="card p-8 text-center text-slate-500">No space selected. Add one from the left.</div>
          )}
        </main>

        {/* Computed panel */}
        <aside className="hidden w-80 shrink-0 xl:block">
          {selected && (
            <div className="card sticky top-24 p-4">
              <ComputedPanel space={selected} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
