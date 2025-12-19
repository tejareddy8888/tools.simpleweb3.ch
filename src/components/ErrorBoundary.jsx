import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // keep logging (you can hook Sentry/LogRocket here)
    console.error("React ErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  reset = () => {
    // “Retry” without full reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    });
  };

  copyDetails = async () => {
    try {
      const text = [
        "=== ERROR ===",
        this.state.error?.toString?.() || String(this.state.error),
        "",
        "=== STACK ===",
        this.state.errorInfo?.componentStack || "(no component stack)",
      ].join("\n");
      await navigator.clipboard.writeText(text);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 1400);
    } catch {
      // fallback
      alert("Copy failed. Your browser may block clipboard access.");
    }
  };

  render() {
    const { hasError, error, errorInfo, copied, showDetails } = this.state;
    const dev = typeof import.meta !== "undefined"
      ? !!import.meta.env?.DEV
      : process.env.NODE_ENV !== "production";

    if (!hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center px-4 py-10">
        <div
          className="relative w-full max-w-[720px] bg-white border-[4px] border-black shadow-[8px_8px_0_0_black] p-6"
          style={{ imageRendering: "pixelated" }}
        >
          {/* Pixel corners */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-black" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-black" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-black" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-black" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-[#FF2EDD] text-black font-['Press_Start_2P'] text-[10px]">
                ⚠️ SYSTEM ERROR
              </div>

              <h2 className="mt-3 text-[16px] sm:text-[18px] font-['Press_Start_2P'] text-black leading-snug">
                Something went wrong.
              </h2>

              <p className="mt-2 text-sm text-black/70 font-sans">
                Try retrying the render. If it keeps happening, reload the page.
              </p>
            </div>

            {/* Tiny pixel icon */}
            <div className="shrink-0 w-12 h-12 border-[3px] border-black bg-[#00FE77] shadow-[4px_4px_0_0_black] grid place-items-center">
              <span className="font-['Press_Start_2P'] text-[14px]">X</span>
            </div>
          </div>

          {/* Error preview */}
          <div className="mt-5 border-2 border-black bg-[#f7f7f7] p-3 shadow-[4px_4px_0_0_black]">
            <div className="font-['Press_Start_2P'] text-[10px] text-black/70">
              Error message
            </div>
            <div className="mt-1 font-mono text-[12px] text-black whitespace-pre-wrap break-words">
              {error ? (error.toString?.() || String(error)) : "Unknown error"}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={this.reset}
              className="inline-flex items-center justify-center rounded-none border-2 border-black shadow-[4px_4px_0_0_#fffcfc] bg-[#00FE77] hover:bg-[#c1ef00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#fffcfc] px-5 py-3 text-[11px] font-['Press_Start_2P']"
              style={{ imageRendering: "pixelated" }}
            >
              Retry
            </button>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-none border-2 border-black shadow-[4px_4px_0_0_#fffcfc] bg-white hover:bg-[#eaeaea] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#fffcfc] px-5 py-3 text-[11px] font-['Press_Start_2P']"
              style={{ imageRendering: "pixelated" }}
            >
              Reload
            </button>

            <button
              onClick={this.copyDetails}
              className="inline-flex items-center justify-center rounded-none border-2 border-black shadow-[4px_4px_0_0_#fffcfc] bg-black text-white hover:bg-[#222] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#fffcfc] px-5 py-3 text-[11px] font-['Press_Start_2P']"
              style={{ imageRendering: "pixelated" }}
              title="Copy error + component stack"
            >
              {copied ? "Copied!" : "Copy"}
            </button>

            <button
              onClick={() => this.setState({ showDetails: !showDetails })}
              className="inline-flex items-center justify-center rounded-none border-2 border-black shadow-[4px_4px_0_0_#fffcfc] bg-white hover:bg-[#eaeaea] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#fffcfc] px-5 py-3 text-[11px] font-['Press_Start_2P']"
              style={{ imageRendering: "pixelated" }}
            >
              {showDetails ? "Hide" : "Details"}
            </button>
          </div>

          {/* Details (dev-friendly) */}
          {showDetails && (
            <div className="mt-5 border-2 border-black bg-white p-3 shadow-[4px_4px_0_0_black]">
              <div className="font-['Press_Start_2P'] text-[10px] text-black/70">
                Component stack
              </div>
              <pre className="mt-2 text-[12px] font-mono whitespace-pre-wrap break-words text-black/90">
                {errorInfo?.componentStack || "(no component stack available)"}
              </pre>

              {!dev && (
                <div className="mt-2 text-xs text-black/60 font-sans">
                  (Detailed stack is usually more useful in development.)
                </div>
              )}
            </div>
          )}

          {/* Footer hint */}
          <div className="mt-6 text-xs text-black/60 font-sans">
            Tip: If this happens after connecting a wallet, try disconnecting and reconnecting.
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
