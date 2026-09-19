import { useEffect, useState, useRef } from 'react';
import type { Settings, StorageUsage, ValueType } from '@/lib/types';
import { VALUE_TYPE_ORDER } from '@/lib/types';
import { useItems } from '@/lib/useItems';
import { getSettings, getUsage, updateSettings, addItems } from '@/lib/storage';
import { downloadCsv, parseCsv } from '@/lib/csv';
import { sendMessage } from '@/lib/messages';
import { useToast } from '@/components/Toast';
import { PinIcon } from '@/components/icons';

export function App() {
  const { items } = useItems();
  const toast = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [usage, setUsage] = useState<StorageUsage | null>(null);

  const refreshMeta = async () => {
    setSettings(await getSettings());
    setUsage(await getUsage());
  };

  useEffect(() => {
    void refreshMeta();
  }, [items]);

  const pinnedItems = items.filter((it) => it.pinned);

  const toggleContextMenuEnabled = async (enabled: boolean) => {
    const next = await updateSettings({ contextMenuEnabled: enabled });
    setSettings(next);
    await sendMessage({ type: 'REBUILD_CONTEXT_MENU' });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (items.length === 0) {
      toast('Nothing to export');
      return;
    }
    downloadCsv(items);
    toast('CSV exported');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const records = parseCsv(text);
      if (records.length === 0) {
        toast('No records found in CSV');
        return;
      }
      
      const inputs = records.map((record) => ({
        name: record.name || 'Unnamed',
        value: record.value || '',
        type: (VALUE_TYPE_ORDER.includes(record.type as ValueType) ? record.type : 'text') as ValueType,
        pinned: record.pinned === 'true',
      }));

      await addItems(inputs);
      toast(`Imported ${inputs.length} keys`);
    } catch (err) {
      console.error(err);
      toast('Failed to import CSV');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const usagePct = usage
    ? Math.min(100, Math.round((usage.bytesInUse / usage.quotaBytes) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-2xl px-6">
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white">
            K
          </div>
          <div>
            <h1 className="text-xl font-semibold">KeyStash Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage context menu, exports, and sync usage.
            </p>
          </div>
        </header>

        <Section title="Context menu">
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Show pinned keys in the right-click menu</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Right-click any page to quickly copy selected pinned keys.
              </p>
            </div>
            <Toggle
              checked={settings?.contextMenuEnabled ?? false}
              onChange={toggleContextMenuEnabled}
            />
          </label>

          {settings?.contextMenuEnabled && (
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              {pinnedItems.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pin keys in the popup and they'll automatically appear in the right-click menu.
                </p>
              ) : (
                <>
                  <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                    All {pinnedItems.length} pinned{' '}
                    {pinnedItems.length === 1 ? 'key is' : 'keys are'} available in the right-click
                    menu:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pinnedItems.map((it) => (
                      <span
                        key={it.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs dark:border-slate-700"
                      >
                        <PinIcon filled width={11} height={11} className="text-brand-500" />
                        <span className="max-w-[160px] truncate">{it.name}</span>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </Section>

        <Section title="Import / Export">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Export all keys to CSV</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Download a backup of every stored key and value.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Export CSV
              </button>
            </div>
            
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <div>
                <p className="text-sm font-medium">Import keys from CSV</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Restore keys from a previously exported CSV file.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                  Import CSV
                </button>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Sync storage">
          <p className="text-sm">
            KeyStash uses <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">chrome.storage.sync</code>,
            which syncs across your signed-in Chrome browsers but is size limited.
          </p>
          {usage && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {formatBytes(usage.bytesInUse)} / {formatBytes(usage.quotaBytes)}
                </span>
                <span>
                  {usage.itemCount} / {usage.maxItems} items
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full ${
                    usagePct > 90 ? 'bg-red-500' : usagePct > 70 ? 'bg-amber-500' : 'bg-brand-500'
                  }`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            </div>
          )}
        </Section>

        <Section title="Keyboard shortcut">
          <p className="text-sm">
            Open the spotlight search with{' '}
            <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-xs dark:border-slate-600 dark:bg-slate-800">
              Ctrl/Cmd + Shift + K
            </kbd>
            .
          </p>
          <button
            type="button"
            onClick={() => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })}
            className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Change shortcut
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
