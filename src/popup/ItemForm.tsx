import { useEffect, useState } from 'react';
import type { KeyItem, ValueType } from '@/lib/types';
import { VALUE_TYPE_LABELS, VALUE_TYPE_ORDER } from '@/lib/types';
import { inputTypeFor, validateName, validateValue } from '@/lib/validators';
import { addItem, updateItem } from '@/lib/storage';
import { CloseIcon } from '@/components/icons';

interface ItemFormProps {
  editing?: KeyItem | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function ItemForm({ editing, onClose, onSaved }: ItemFormProps) {
  const [name, setName] = useState(editing?.name ?? '');
  const [type, setType] = useState<ValueType>(editing?.type ?? 'text');
  const [value, setValue] = useState(editing?.value ?? '');
  const [pinned, setPinned] = useState(editing?.pinned ?? false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [valueError, setValueError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValueError(null);
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameCheck = validateName(name);
    const valueCheck = validateValue(type, value);
    setNameError(nameCheck.error ?? null);
    setValueError(valueCheck.error ?? null);
    if (!nameCheck.success || !valueCheck.success) return;

    setSaving(true);
    try {
      if (editing) {
        await updateItem(editing.id, { name, type, value, pinned });
        onSaved('Updated');
      } else {
        await addItem({ name, type, value, pinned });
        onSaved('Added');
      }
      onClose();
    } catch (err) {
      setValueError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-white dark:bg-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {editing ? 'Edit key' : 'Add a key'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Key name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. GitHub profile"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-900"
          />
          {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ValueType)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-900"
          >
            {VALUE_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {VALUE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Value
          </label>
          {type === 'other' || type === 'text' ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              placeholder="Enter the value"
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-900"
            />
          ) : (
            <input
              type={inputTypeFor(type)}
              inputMode={type === 'number' ? 'decimal' : undefined}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholderFor(type)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-900"
            />
          )}
          {valueError && <p className="mt-1 text-xs text-red-500">{valueError}</p>}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Pin this key
        </label>

        <div className="mt-auto flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : editing ? 'Save changes' : 'Add key'}
          </button>
        </div>
      </form>
    </div>
  );
}

function placeholderFor(type: ValueType): string {
  switch (type) {
    case 'url':
      return 'https://example.com';
    case 'email':
      return 'name@example.com';
    case 'uuid':
      return '123e4567-e89b-12d3-a456-426614174000';
    case 'number':
      return '42';
    default:
      return '';
  }
}
