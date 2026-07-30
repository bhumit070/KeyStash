import { createRoot, type Root } from 'react-dom/client';
import type { KeyItem } from '@/lib/types';
import type { Message } from '@/lib/messages';
import { copyText } from '@/lib/clipboard';
import { SpotlightOverlay } from './SpotlightOverlay';
import { spotlightCss } from './spotlightStyles';

const HOST_ID = 'keystash-spotlight-host';

let host: HTMLDivElement | null = null;
let root: Root | null = null;
let capturedTarget: Element | null = null;

function isEditable(el: Element | null): el is HTMLElement {
  if (!el) return false;
  const node = el as HTMLElement;
  if (node.isContentEditable) return true;
  const tag = node.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') {
    const type = (node as HTMLInputElement).type;
    return !['checkbox', 'radio', 'button', 'submit', 'file', 'range', 'color'].includes(type);
  }
  return false;
}

function pasteInto(el: HTMLElement, text: string): void {
  el.focus();
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const setter = Object.getOwnPropertyDescriptor(
      el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype,
      'value',
    )?.set;
    const next = el.value.slice(0, start) + text + el.value.slice(end);
    if (setter) setter.call(el, next);
    else el.value = next;
    const caret = start + text.length;
    el.setSelectionRange(caret, caret);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (el.isContentEditable) {
    const ok = document.execCommand('insertText', false, text);
    if (!ok) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
      }
    }
  }
}

function close(selected?: KeyItem): void {
  const target = capturedTarget;
  root?.unmount();
  root = null;
  host?.remove();
  host = null;

  if (selected) {
    void copyText(selected.value);
    if (isEditable(target)) {
      pasteInto(target, selected.value);
    }
  }
  capturedTarget = null;
}

function open(): void {
  if (host) return; // Already open.
  capturedTarget = document.activeElement;

  host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = spotlightCss;
  shadow.appendChild(style);

  const mount = document.createElement('div');
  shadow.appendChild(mount);
  document.documentElement.appendChild(host);

  root = createRoot(mount);
  root.render(<SpotlightOverlay onClose={close} />);
}

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === 'OPEN_SPOTLIGHT') {
    if (host) close();
    else open();
  }
});
