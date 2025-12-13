import React from "react";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

const RELOAD_MARKER = "pianocrm-chunk-reloaded";

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled app error", error, info?.componentStack);
    if (await attemptStaleAssetRecovery(error)) return;
  }

  handleReload = async () => {
    await clearClientCaches();
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
          <div className="max-w-lg space-y-3">
            <div className="text-lg font-semibold">Something went wrong.</div>
            <div className="text-sm opacity-80">
              We hit an unexpected error{isChunkError(this.state.error) ? " while loading the latest app files." : "."} Try reloading to continue.
            </div>
            <button
              onClick={this.handleReload}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 focus-ring"
            >
              Reload the portal
            </button>
            <div className="text-xs opacity-70 break-words">Details: {this.state.error?.message}</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function isChunkError(error: Error) {
  const msg = (error?.message || "").toLowerCase();
  return (
    error?.name === "ChunkLoadError" ||
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("loading chunk") ||
    msg.includes("import()") ||
    msg.includes("chunk load")
  );
}

async function attemptStaleAssetRecovery(error: Error) {
  if (!isChunkError(error)) return false;
  const alreadyReloaded = sessionStorage.getItem(RELOAD_MARKER) === "1";
  if (alreadyReloaded) return false;
  sessionStorage.setItem(RELOAD_MARKER, "1");
  await clearClientCaches();
  window.location.reload();
  return true;
}

async function clearClientCaches() {
  try { localStorage.removeItem("token"); localStorage.removeItem("user"); } catch {}
  try { sessionStorage.removeItem("token"); sessionStorage.removeItem("user"); } catch {}
  if ("caches" in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {}
  }
}
