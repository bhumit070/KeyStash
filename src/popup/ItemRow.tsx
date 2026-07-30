import { useState } from 'react';
import type { KeyItem } from '@/lib/types';
import { VALUE_TYPE_LABELS } from '@/lib/types';
import { copyText } from '@/lib/clipboard';
import { removeItem, togglePin } from '@/lib/storage';
import { useToast } from '@/components/Toast';
import { CheckIcon, CopyIcon, EditIcon, PinIcon, TrashIcon } from '@/components/icons';

interface ItemRowProps {
  item: KeyItem;
  onEdit: (item: KeyItem) => void;
}

export function ItemRow({ item, onEdit }: ItemRowProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(item.value);
    if (ok) {
      setCopied(true);
      toast('Copied to clipboard');
      setTimeout(() => setCopied(false), 1200);
    } else {
      toast('Copy failed');
    }
  };

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:border-brand-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-700">
      <button
        type="button"
        onClick={handleCopy}
        className="flex min-w-0 flex-1 flex-col items-start text-left"
        title="Click to copy"
      >
        <div className="flex w-full items-center gap-2">
          <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {item.name}
          </span>
          {item.pinned && (
            <PinIcon filled width={12} height={12} className="shrink-0 text-brand-500" />
          )}
          <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            {VALUE_TYPE_LABELS[item.type]}
          </span>
        </div>
        <span className="mt-0.5 w-full truncate text-xs text-slate-500 dark:text-slate-400">
          {item.value}
        </span>
      </button>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-700"
          title="Copy value"
        >
          {copied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
        </button>
        <button
          type="button"
          onClick={() => void togglePin(item.id)}
          className={`rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 ${
            item.pinned ? 'text-brand-500' : 'text-slate-400 hover:text-brand-600'
          }`}
          title={item.pinned ? 'Unpin' : 'Pin'}
        >
          <PinIcon filled={item.pinned} />
        </button>
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-700"
          title="Edit"
        >
          <EditIcon />
        </button>
        {confirmDelete ? (
          <button
            type="button"
            onClick={() => void removeItem(item.id)}
            className="rounded-md bg-red-50 px-1.5 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
            onMouseLeave={() => setConfirmDelete(false)}
            title="Confirm delete"
          >
            Sure?
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-700"
            title="Delete"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}
