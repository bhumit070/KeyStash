import { useMemo, useState } from 'react';
import type { KeyItem } from '@/lib/types';
import { useItems } from '@/lib/useItems';
import { useToast } from '@/components/Toast';
import { PlusIcon, SearchIcon, SettingsIcon } from '@/components/icons';
import { ItemRow } from './ItemRow';
import { ItemForm } from './ItemForm';

export function App() {
  const { items, loading } = useItems();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<KeyItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) || it.value.toLowerCase().includes(q),
    );
  }, [items, query]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: KeyItem) => {
    setEditing(item);
    setFormOpen(true);
  };

  return (
    <div className="relative flex h-[520px] w-[380px] flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          K
        </div>
        <h1 className="text-base font-semibold">KeyStash</h1>
        <button
          type="button"
          onClick={() => chrome.runtime.openOptionsPage()}
          className="ml-auto rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="Settings"
        >
          <SettingsIcon />
        </button>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:ring-brand-900">
          <SearchIcon className="shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keys..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <p className="mt-10 text-center text-sm text-slate-400">Loading...</p>
        ) : items.length === 0 ? (
          <EmptyState onAdd={openAdd} />
        ) : filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-400">
            No keys match "{query}"
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item) => (
              <ItemRow key={item.id} item={item} onEdit={openEdit} />
            ))}
          </div>
        )}
      </main>

      <button
        type="button"
        onClick={openAdd}
        className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 hover:shadow-xl"
        title="Add key"
      >
        <PlusIcon width={22} height={22} />
      </button>

      {formOpen && (
        <ItemForm
          editing={editing}
          onClose={() => setFormOpen(false)}
          onSaved={(msg) => toast(msg)}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300">
        <PlusIcon width={26} height={26} />
      </div>
      <h2 className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Nothing stashed yet
      </h2>
      <p className="mt-1 max-w-[240px] text-xs text-slate-500 dark:text-slate-400">
        Save your GitHub profile, LinkedIn URL, or anything else you need on demand.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Add your first key
      </button>
    </div>
  );
}
