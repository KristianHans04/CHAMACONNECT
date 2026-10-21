import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    const isDev =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    const payload = {
      error: error.message,
      stack: isDev ? error.stack : undefined,
      componentStack: isDev ? errorInfo.componentStack : undefined,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      source: "react-error-boundary",
    };

    console.error("[ErrorBoundary]", error.message);
    if (isDev) {
      console.error(error.stack);
      console.error("Component stack:", errorInfo.componentStack);
    }

    fetch("/api/errors/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const isDev =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="max-w-xl w-full rounded-2xl bg-white p-8 shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-semibold text-gray-900">
              Something went wrong
            </h1>
            <p className="mb-4 text-sm text-gray-500">
              An unexpected error occurred. Please try refreshing the page.
            </p>

            {isDev && this.state.error && (
              <div className="mb-4">
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-2">
                  <p className="text-sm font-medium text-red-800 mb-1">Error</p>
                  <p className="text-red-700 font-mono text-xs whitespace-pre-wrap">
                    {this.state.error.message}
                  </p>
                </div>
                {this.state.error.stack && (
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Stack Trace</p>
                    <pre className="text-gray-600 text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                {this.state.errorInfo && (
                  <div className="mt-2 rounded-lg bg-gray-50 border border-gray-200 p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Component Stack</p>
                    <pre className="text-gray-600 text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
