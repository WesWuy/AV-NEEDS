/** SpaceEditor.tsx — structured requirement fields + D401 interview tabs. */
import { useState } from 'react';
import type { Space, SpaceType } from '../types';
import { Field, FeetInchesInput, NumberInput, Select, TextArea, TextInput } from './ui';
import { QUESTION_GROUPS } from '../data/questionSet';
import { ROOM_TEMPLATES, templateFor } from '../data/roomTemplates';
import { VERTICAL_RESOLUTIONS } from '../standards/standardsConfig';

type Patch = (s: Space) => Space;

export default function SpaceEditor({
  space,
  onChange,
}: {
  space: Space;
  onChange: (fn: Patch) => void;
}) {
  const [tab, setTab] = useState(QUESTION_GROUPS[0].id);
  const set = <K extends keyof Space>(key: K, value: Space[K]) =>
    onChange((s) => ({ ...s, [key]: value }));
  const setDim = (key: keyof Space['dimensions'], value: number | null) =>
    onChange((s) => ({ ...s, dimensions: { ...s.dimensions, [key]: value } }));
  const setAnswer = (qid: string, value: string) =>
    onChange((s) => ({ ...s, answers: { ...s.answers, [qid]: value } }));

  const applyTemplate = () => {
    if (!confirm('Apply template baseline values? Existing field values for this space will be overwritten (interview notes kept).')) return;
    const t = templateFor(space.type);
    onChange((s) => ({ ...s, ...t.defaults, id: s.id, name: s.name, answers: s.answers }));
  };

  const group = QUESTION_GROUPS.find((g) => g.id === tab)!;

  return (
    <div className="space-y-6">
      {/* Identity */}
      <section className="card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Space name">
            <TextInput value={space.name} onChange={(v) => set('name', v)} />
          </Field>
          <Field label="Room type">
            <Select<SpaceType>
              value={space.type}
              onChange={(v) => set('type', v)}
              options={ROOM_TEMPLATES.map((t) => ({ value: t.type, label: t.label }))}
            />
          </Field>
          <div className="flex items-end">
            <button className="btn-ghost w-full" onClick={applyTemplate}>
              Apply template baseline
            </button>
          </div>
        </div>
      </section>

      {/* Space & environment */}
      <section className="card p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-800">Space & viewer geometry</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Length (ft / in)"><FeetInchesInput meters={space.dimensions.lengthM} onChange={(v) => setDim('lengthM', v)} /></Field>
          <Field label="Width (ft / in)"><FeetInchesInput meters={space.dimensions.widthM} onChange={(v) => setDim('widthM', v)} /></Field>
          <Field label="Ceiling height (ft / in)"><FeetInchesInput meters={space.dimensions.ceilingHeightM} onChange={(v) => setDim('ceilingHeightM', v)} /></Field>
          <Field label="Max participants"><NumberInput value={space.maxParticipants} onChange={(v) => set('maxParticipants', v)} /></Field>
          <Field label="Farthest viewer (ft / in)" hint="Drives DISCAS minimum image size"><FeetInchesInput meters={space.farthestViewerM} onChange={(v) => set('farthestViewerM', v)} /></Field>
          <Field label="Closest viewer (ft / in)" hint="Geometric closest-viewer bound"><FeetInchesInput meters={space.closestViewerM} onChange={(v) => set('closestViewerM', v)} /></Field>
          <Field label="Seating layout"><TextInput value={space.seatingLayout} onChange={(v) => set('seatingLayout', v)} /></Field>
          <Field label="Ambient light (lux at screen)"><NumberInput value={space.ambientLightLux} onChange={(v) => set('ambientLightLux', v)} /></Field>
          <Field label="Noise floor (dBA / NC)"><NumberInput value={space.noiseFloorDba} onChange={(v) => set('noiseFloorDba', v)} /></Field>
        </div>
      </section>

      {/* Display / DISCAS inputs */}
      <section className="card p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-800">Display (DISCAS inputs)</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Viewing category" hint="BDM = general legibility · ADM = fine detail">
            <Select
              value={space.viewingCategory}
              onChange={(v) => set('viewingCategory', v)}
              options={[
                { value: 'BDM', label: 'Basic Decision Making (BDM)' },
                { value: 'ADM', label: 'Analytical Decision Making (ADM)' },
              ]}
            />
          </Field>
          {space.viewingCategory === 'BDM' ? (
            <Field label="Smallest element (% of image height)" hint="e.g. 0.05 = 5%">
              <NumberInput value={space.percentElementHeight} onChange={(v) => set('percentElementHeight', v ?? 0.05)} step="0.005" />
            </Field>
          ) : (
            <Field label="Vertical resolution">
              <Select
                value={String(space.verticalResolutionLines)}
                onChange={(v) => set('verticalResolutionLines', Number(v))}
                options={VERTICAL_RESOLUTIONS.map((r) => ({ value: String(r.lines), label: r.label }))}
              />
            </Field>
          )}
          <Field label="Display technology">
            <Select
              value={space.displayTech}
              onChange={(v) => set('displayTech', v)}
              options={[
                { value: 'lcd', label: 'Flat-panel LCD' },
                { value: 'dvled', label: 'Direct-view LED' },
                { value: 'projection', label: 'Projection' },
                { value: 'undecided', label: 'Undecided' },
              ]}
            />
          </Field>
        </div>
      </section>

      {/* Systems */}
      <section className="card p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-800">Audio, conferencing, control & IT</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Audio intent">
            <Select
              value={space.audioIntent}
              onChange={(v) => set('audioIntent', v)}
              options={[
                { value: 'speechReinforcement', label: 'Speech reinforcement' },
                { value: 'programAudio', label: 'Program audio' },
                { value: 'criticalListening', label: 'Critical listening' },
                { value: 'none', label: 'None' },
              ]}
            />
          </Field>
          <Field label="VC platform"><TextInput value={space.vcPlatform} onChange={(v) => set('vcPlatform', v)} placeholder="Teams / Zoom / …" /></Field>
          <Field label="VC topology"><TextInput value={space.vcTopology} onChange={(v) => set('vcTopology', v)} placeholder="MTR / BYOD" /></Field>
          <Field label="Budget tier">
            <Select
              value={space.budgetTier}
              onChange={(v) => set('budgetTier', v)}
              options={[
                { value: 'unknown', label: 'Unknown' },
                { value: 'value', label: 'Value' },
                { value: 'standard', label: 'Standard' },
                { value: 'premium', label: 'Premium' },
              ]}
            />
          </Field>
          <Field label="Use cases (comma-separated)">
            <TextInput
              value={space.useCases.join(', ')}
              onChange={(v) => set('useCases', v.split(',').map((x) => x.trim()).filter(Boolean))}
            />
          </Field>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Control / UX needs"><TextArea value={space.controlNeeds} onChange={(v) => set('controlNeeds', v)} /></Field>
          <Field label="Network / IT & security notes"><TextArea value={space.networkNotes} onChange={(v) => set('networkNotes', v)} /></Field>
          <Field label="Acoustic notes"><TextArea value={space.acousticNotes} onChange={(v) => set('acousticNotes', v)} /></Field>
          <Field label="Operator notes / manual flags"><TextArea value={space.operatorNotes} onChange={(v) => set('operatorNotes', v)} /></Field>
        </div>
      </section>

      {/* Interview question tabs */}
      <section className="card p-4">
        <h3 className="mb-1 text-sm font-bold text-slate-800">Needs-analysis interview</h3>
        <p className="mb-3 text-[11px] text-slate-500">
          Grouped per the PROGRAM phase of ANSI/AVIXA D401.01:2023 — read aloud to stakeholders.
        </p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {QUESTION_GROUPS.map((g) => {
            const answered = g.questions.filter((q) => (space.answers[q.id] ?? '').trim()).length;
            return (
              <button
                key={g.id}
                onClick={() => setTab(g.id)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  tab === g.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g.title}
                {answered > 0 && (
                  <span className={`ml-1 ${tab === g.id ? 'text-brand-100' : 'text-brand-600'}`}>({answered})</span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mb-3 text-xs italic text-slate-500">{group.intent}</p>
        <div className="space-y-3">
          {group.questions.map((q) => (
            <Field key={q.id} label={q.label} hint={q.hint}>
              {q.long ? (
                <TextArea value={space.answers[q.id] ?? ''} onChange={(v) => setAnswer(q.id, v)} />
              ) : (
                <TextInput value={space.answers[q.id] ?? ''} onChange={(v) => setAnswer(q.id, v)} />
              )}
            </Field>
          ))}
        </div>
      </section>
    </div>
  );
}
