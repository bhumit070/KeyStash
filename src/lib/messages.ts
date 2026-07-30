/** Typed messages passed between the popup, background SW, and content script. */

export type Message =
  | { type: 'OPEN_SPOTLIGHT' }
  | { type: 'REBUILD_CONTEXT_MENU' }
  | { type: 'COPY_TO_CLIPBOARD'; value: string };

export function sendMessage(message: Message): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}

export async function sendToActiveTab(message: Message): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id != null) {
    await chrome.tabs.sendMessage(tab.id, message).catch(() => {
      // Content script may not be injected on this page (e.g. chrome:// pages).
    });
  }
}
