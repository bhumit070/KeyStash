import type { Message } from '@/lib/messages';
import { getSettings, listItems } from '@/lib/storage';

const MENU_PARENT = 'keystash-parent';
const MENU_ITEM_PREFIX = 'keystash-item:';

async function rebuildContextMenu(): Promise<void> {
  await chrome.contextMenus.removeAll();
  const settings = await getSettings();
  if (!settings.contextMenuEnabled) return;

  const items = (await listItems()).filter((it) => it.pinned);
  if (items.length === 0) return;

  chrome.contextMenus.create({
    id: MENU_PARENT,
    title: 'KeyStash',
    contexts: ['all'],
  });

  for (const item of items) {
    chrome.contextMenus.create({
      id: `${MENU_ITEM_PREFIX}${item.id}`,
      parentId: MENU_PARENT,
      title: item.name,
      contexts: ['all'],
    });
  }
}

/** Copies text into the page by injecting a small function into the tab. */
async function copyInTab(tabId: number, value: string): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (text: string) => {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        el.remove();
      },
      args: [value],
    });
  } catch {
    // Injection can fail on restricted pages (chrome://, web store, etc.).
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void rebuildContextMenu();
});

chrome.runtime.onStartup.addListener(() => {
  void rebuildContextMenu();
});

// Keep the menu fresh when pinned/context-menu selections change.
chrome.storage.onChanged.addListener((_changes, areaName) => {
  if (areaName === 'sync') void rebuildContextMenu();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (typeof info.menuItemId !== 'string') return;
  if (!info.menuItemId.startsWith(MENU_ITEM_PREFIX)) return;
  const id = info.menuItemId.slice(MENU_ITEM_PREFIX.length);
  const items = await listItems();
  const item = items.find((it) => it.id === id);
  if (item && tab?.id != null) {
    await copyInTab(tab.id, item.value);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'open-spotlight') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id != null) {
    await chrome.tabs
      .sendMessage(tab.id, { type: 'OPEN_SPOTLIGHT' } satisfies Message)
      .catch(() => {
        // No content script on this page (e.g. chrome:// pages).
      });
  }
});

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.type === 'REBUILD_CONTEXT_MENU') {
    rebuildContextMenu().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message.type === 'COPY_TO_CLIPBOARD' && sender.tab?.id != null) {
    copyInTab(sender.tab.id, message.value).then(() => sendResponse({ ok: true }));
    return true;
  }
  return undefined;
});
