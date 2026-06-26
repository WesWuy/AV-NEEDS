/** ComputedPanel.tsx — live recompute display for the selected space. */
import { useMemo } from 'react';
import type { Space } from '../types';
import { computeSpace } from '../standards/compute';
import { STANDARDS_REVISIONS, VERIFY_QUALIFIER } from '../standards/standardsConfig';
import { formatFtIn } from '../units';
import { flagBoxClass } from './ui';

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

export default function ComputedPanel({ space }: { space: Space }) {
  const c = useMemo(() => computeSpace(space), [space]);
  const d = c.discas;
  const m = (v: number | null) => formatFtIn(v);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-800">Live recommendations</h3>
        <p className="mt-0.5 text-[11px] italic text-slate-500">{VERIFY_QUALIFIER}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat
          label={`Min image height · ${d.category}`}
          value={m(d.minImageHeightM)}
          sub={d.minImageWidthM != null ? `width ${m(d.minImageWidthM)}` : undefined}
        />
        <Stat
          label="Indicative panel"
          value={d.recommendedDiagonalIn ? `~${d.recommendedDiagonalIn}"` : '—'}
          sub="16:9 or larger / projection / dvLED"
        />
        <Stat
          label="Viewing ratio"
          value={d.viewingRatio != null ? `≈ ${d.viewingRatio.toFixed(1)}` : '—'}
        />
        <Stat
          label="Closest-viewer min"
          value={m(d.closestViewerMinM)}
          sub={`${STANDARDS_REVISIONS.discas}`}
        />
      </div>

      {d.explanation && (
        <p className="rounded-md bg-brand-50 px-3 py-2 text-xs text-brand-900">{d.explanation}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Est. power" value={`${c.infra.totalPowerW} W`} sub={`~${c.infra.estimatedCircuits} circuit(s)`} />
        <Stat label="Est. heat load" value={`${c.infra.heatLoadBtuPerHr.toFixed(0)}`} sub="BTU/hr · HVAC" />
      </div>

      {c.flags.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-bold uppercase text-slate-600">
            Flags ({c.flags.length})
          </h4>
          <div className="space-y-1.5">
            {c.flags.map((f, i) => (
              <div key={i} className={flagBoxClass(f.level)}>
                {f.message}
                {f.standard && <span className="opacity-70"> · {f.standard}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {c.openQuestions.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-bold uppercase text-slate-600">
            Open items ({c.openQuestions.length})
          </h4>
          <ul className="list-disc space-y-0.5 pl-5 text-xs text-slate-600">
            {c.openQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
