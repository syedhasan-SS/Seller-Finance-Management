import type { AppearanceConditions, YesNoAny } from '@/types/adminContent';
import type { LifecycleStage } from '@/types/homeConfig';

const LIFECYCLES: LifecycleStage[] = ['new', 'active', 'power', 'dormant'];
const BANK_STATUSES = ['none', 'submitted', 'under_review', 'approved', 'rejected'] as const;
const YN: YesNoAny[] = ['any', 'yes', 'no'];

interface Props {
  value: AppearanceConditions;
  onChange: (v: AppearanceConditions) => void;
}

function toggleInArray<T extends string>(arr: T[] | undefined, item: T): T[] {
  const set = new Set(arr ?? []);
  if (set.has(item)) set.delete(item);
  else set.add(item);
  return Array.from(set);
}

export default function ConditionsEditor({ value, onChange }: Props) {
  const lifecycles = value.lifecycles ?? [];
  const bankStatuses = value.bankStatuses ?? [];

  return (
    <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-xs text-gray-600">
        Show this item when <span className="font-semibold">all</span> of these match. Leave a row
        blank/"any" to skip it.
      </p>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Lifecycle stage</label>
        <div className="flex flex-wrap gap-2">
          {LIFECYCLES.map((l) => (
            <label
              key={l}
              className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                lifecycles.includes(l)
                  ? 'bg-fleek-yellow text-fleek-black border-fleek-yellow'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-fleek-yellow'
              }`}
            >
              <input
                type="checkbox"
                checked={lifecycles.includes(l)}
                onChange={() => onChange({ ...value, lifecycles: toggleInArray(lifecycles, l) })}
                className="sr-only"
              />
              {l}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Bank account status</label>
        <div className="flex flex-wrap gap-2">
          {BANK_STATUSES.map((s) => (
            <label
              key={s}
              className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                bankStatuses.includes(s)
                  ? 'bg-fleek-yellow text-fleek-black border-fleek-yellow'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-fleek-yellow'
              }`}
            >
              <input
                type="checkbox"
                checked={bankStatuses.includes(s)}
                onChange={() => onChange({ ...value, bankStatuses: toggleInArray(bankStatuses, s) })}
                className="sr-only"
              />
              {s.replace('_', ' ')}
            </label>
          ))}
        </div>
      </div>

      <YesNoRow
        label="Has first listing?"
        value={value.hasFirstListing}
        onChange={(v) => onChange({ ...value, hasFirstListing: v })}
      />
      <YesNoRow
        label="Has first order?"
        value={value.hasFirstOrder}
        onChange={(v) => onChange({ ...value, hasFirstOrder: v })}
      />
      <YesNoRow
        label="Has received payout?"
        value={value.hasReceivedPayout}
        onChange={(v) => onChange({ ...value, hasReceivedPayout: v })}
      />
      <YesNoRow
        label="Profile complete?"
        value={value.profileComplete}
        onChange={(v) => onChange({ ...value, profileComplete: v })}
      />
    </div>
  );
}

function YesNoRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: YesNoAny | undefined;
  onChange: (v: YesNoAny) => void;
}) {
  const current = value ?? 'any';
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2">
        {YN.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
              current === v
                ? 'bg-fleek-black text-white border-fleek-black'
                : 'bg-white text-gray-600 border-gray-300 hover:border-fleek-black'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
