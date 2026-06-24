/** ui.tsx — small reusable form primitives. */
import React from 'react';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className="field-input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className="field-input resize-y"
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  step = 'any',
  placeholder,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  step?: string;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className="field-input"
      step={step}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === '' ? null : Number(v));
      }}
    />
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select className="field-input" value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

const FLAG_STYLES: Record<string, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  warn: 'border-amber-300 bg-amber-50 text-amber-900',
  critical: 'border-red-300 bg-red-50 text-red-900',
};

export function FlagPill({ level }: { level: string }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
        FLAG_STYLES[level] ?? FLAG_STYLES.info
      }`}
    >
      {level}
    </span>
  );
}

export function flagBoxClass(level: string): string {
  return `rounded-md border px-3 py-2 text-xs ${FLAG_STYLES[level] ?? FLAG_STYLES.info}`;
}
