import type { KeyItem, Settings, StorageUsage } from './types';
import { DEFAULT_SETTINGS } from './types';

const ITEM_PREFIX = 'ks:item:';
const INDEX_KEY = 'ks:index';
const SETTINGS_KEY = 'ks:settings';

// chrome.storage.sync documented limits.
const SYNC_QUOTA_BYTES = 102_400; // ~100KB total
const SYNC_MAX_ITEMS = 512;

const area = chrome.storage.sync;

function itemKey(id: string): string {
  return `${ITEM_PREFIX}${id}`;
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function getIndex(): Promise<string[]> {
  const res = await area.get(INDEX_KEY);
  const idx = res[INDEX_KEY];
  return Array.isArray(idx) ? (idx as string[]) : [];
}

async function setIndex(ids: string[]): Promise<void> {
  await area.set({ [INDEX_KEY]: ids });
}

export async function listItems(): Promise<KeyItem[]> {
  const ids = await getIndex();
  if (ids.length === 0) return [];
  const keys = ids.map(itemKey);
  const res = await area.get(keys);
  const items = ids
    .map((id) => res[itemKey(id)] as KeyItem | undefined)
    .filter((it): it is KeyItem => Boolean(it));
  // Pinned first, then most recently updated.
  return items.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

export async function getItem(id: string): Promise<KeyItem | undefined> {
  const res = await area.get(itemKey(id));
  return res[itemKey(id)] as KeyItem | undefined;
}

export interface NewItemInput {
  name: string;
  value: string;
  type: KeyItem['type'];
  pinned?: boolean;
  inContextMenu?: boolean;
}

export async function addItem(input: NewItemInput): Promise<KeyItem> {
  const now = Date.now();
  const item: KeyItem = {
    id: newId(),
    name: input.name.trim(),
    value: input.value,
    type: input.type,
    pinned: input.pinned ?? false,
    inContextMenu: input.inContextMenu ?? false,
    createdAt: now,
    updatedAt: now,
  };
  const ids = await getIndex();
  await area.set({ [itemKey(item.id)]: item, [INDEX_KEY]: [item.id, ...ids] });
  return item;
}

export async function updateItem(
  id: string,
  patch: Partial<Omit<KeyItem, 'id' | 'createdAt'>>,
): Promise<KeyItem | undefined> {
  const existing = await getItem(id);
  if (!existing) return undefined;
  const updated: KeyItem = {
    ...existing,
    ...patch,
    name: patch.name !== undefined ? patch.name.trim() : existing.name,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: Date.now(),
  };
  await area.set({ [itemKey(id)]: updated });
  return updated;
}

export async function removeItem(id: string): Promise<void> {
  const ids = await getIndex();
  await area.remove(itemKey(id));
  await setIndex(ids.filter((x) => x !== id));
}

export async function togglePin(id: string): Promise<KeyItem | undefined> {
  const existing = await getItem(id);
  if (!existing) return undefined;
  return updateItem(id, { pinned: !existing.pinned });
}

export async function setContextMenu(id: string, inContextMenu: boolean): Promise<KeyItem | undefined> {
  return updateItem(id, { inContextMenu });
}

export async function getSettings(): Promise<Settings> {
  const res = await area.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(res[SETTINGS_KEY] as Partial<Settings> | undefined) };
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await area.set({ [SETTINGS_KEY]: next });
  return next;
}

export async function getUsage(): Promise<StorageUsage> {
  const bytesInUse = await area.getBytesInUse(null);
  const ids = await getIndex();
  return {
    bytesInUse,
    quotaBytes: SYNC_QUOTA_BYTES,
    itemCount: ids.length,
    maxItems: SYNC_MAX_ITEMS,
  };
}

/**
 * Subscribe to changes to KeyStash sync data. Fires whenever any item, the
 * index, or settings change. Returns an unsubscribe function.
 */
export function subscribe(callback: () => void): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName !== 'sync') return;
    const relevant = Object.keys(changes).some(
      (k) => k.startsWith(ITEM_PREFIX) || k === INDEX_KEY || k === SETTINGS_KEY,
    );
    if (relevant) callback();
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
