import { useCallback, useEffect, useState } from 'react';
import type { KeyItem } from './types';
import { listItems, subscribe } from './storage';

/** React hook that keeps a live list of KeyStash items in sync with storage. */
export function useItems() {
  const [items, setItems] = useState<KeyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await listItems();
    setItems(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const unsub = subscribe(() => {
      void refresh();
    });
    return unsub;
  }, [refresh]);

  return { items, loading, refresh };
}
