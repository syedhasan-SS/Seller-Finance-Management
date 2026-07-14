/**
 * Seller University signature component kit (wireframes S4).
 * Screens must assemble from these — no ad-hoc styled elements.
 */
import type { ReactNode } from 'react';

export function SwingTag({ children }: { children: ReactNode }) {
  return <span className="uni-swingtag">{children}</span>;
}

export function Stamp({ children }: { children: ReactNode }) {
  return <span className="uni-stamp">{children}</span>;
}

/** Marker-highlighted span inside a heading. */
export function Marker({ children }: { children: ReactNode }) {
  return <em className="uni-marker">{children}</em>;
}

export function GradeStack() {
  return (
    <span className="uni-gradestack" aria-label="Grades A, B, C">
      <span>A</span>
      <span>B</span>
      <span>C</span>
    </span>
  );
}

export function StrokeProgress({ pct, label }: { pct: number; label?: string }) {
  return (
    <div
      className="uni-stroke"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progress'}
    >
      <i style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="uni-label">{children}</div>;
}
