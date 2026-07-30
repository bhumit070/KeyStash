import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyItem } from '@/lib/types';
import { VALUE_TYPE_LABELS } from '@/lib/types';
import { listItems } from '@/lib/storage';
import { SearchIcon } from '@/components/icons';

interface SpotlightOverlayProps {
  onClose: (selected?: KeyItem) => void;
}

export function SpotlightOverlay({ onClose }: SpotlightOverlayProps) {
  const [items, setItems] = useState<KeyItem[]>([]);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void listItems().then(setItems);
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) || it.value.toLowerCase().includes(q),
    );
  }, [items, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('.ks-row.active');
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[active];
      if (item) onClose(item);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="ks-backdrop" onClick={() => onClose()}>
      <div className="ks-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ks-search">
          <SearchIcon />
          <input
            ref={inputRef}
            className="ks-input"
            placeholder="Search KeyStash..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="ks-list" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="ks-empty">
              {items.length === 0 ? 'No keys stored yet' : 'No matches'}
            </div>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.id}
                type="button"
                className={`ks-row${i === active ? ' active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => onClose(item)}
              >
                <div className="ks-row-main">
                  <div className="ks-row-name">{item.name}</div>
                  <div className="ks-row-value">{item.value}</div>
                </div>
                <span className="ks-badge">{VALUE_TYPE_LABELS[item.type]}</span>
              </button>
            ))
          )}
        </div>

        <div className="ks-footer">
          <span>
            <span className="ks-kbd">↑</span> <span className="ks-kbd">↓</span> navigate
          </span>
          <span>
            <span className="ks-kbd">↵</span> copy &amp; paste
          </span>
          <span>
            <span className="ks-kbd">esc</span> close
          </span>
        </div>
      </div>
    </div>
  );
}
