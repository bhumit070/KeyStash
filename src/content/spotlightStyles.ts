// Self-contained styles injected into the spotlight's shadow root so the
// overlay is fully isolated from (and does not leak into) the host page.
export const spotlightCss = `
:host { all: initial; }
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }

.ks-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
}

.ks-panel {
  width: 100%;
  max-width: 560px;
  margin: 0 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  animation: ks-pop 120ms ease-out;
}

@keyframes ks-pop {
  from { transform: translateY(-8px) scale(0.98); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.ks-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid #e2e8f0;
}

.ks-search svg { width: 18px; height: 18px; color: #94a3b8; flex: none; }

.ks-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: #0f172a;
  background: transparent;
}
.ks-input::placeholder { color: #94a3b8; }

.ks-list {
  max-height: 320px;
  overflow-y: auto;
  padding: 6px;
}

.ks-empty {
  padding: 28px 18px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.ks-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
}
.ks-row.active { background: #eef2ff; }
.ks-row:hover { background: #f1f5f9; }

.ks-row-main { min-width: 0; flex: 1; }
.ks-row-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ks-row-value {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ks-badge {
  flex: none;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6366f1;
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 999px;
}

.ks-footer {
  display: flex;
  gap: 14px;
  padding: 8px 16px;
  border-top: 1px solid #e2e8f0;
  font-size: 11px;
  color: #94a3b8;
}
.ks-kbd {
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 10px;
  color: #475569;
  background: #f8fafc;
}

@media (prefers-color-scheme: dark) {
  .ks-panel { background: #0f172a; }
  .ks-search { border-bottom-color: #1e293b; }
  .ks-input { color: #f1f5f9; }
  .ks-row.active { background: #1e293b; }
  .ks-row:hover { background: #1e293b; }
  .ks-row-name { color: #f1f5f9; }
  .ks-badge { background: #312e81; color: #c7d2fe; }
  .ks-footer { border-top-color: #1e293b; }
  .ks-kbd { background: #1e293b; border-color: #334155; color: #cbd5e1; }
}
`;
