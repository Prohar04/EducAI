"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: 320, padding: "40px 24px",
          textAlign: "center",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "rgba(192,57,43,0.10)",
            border: "1px solid rgba(192,57,43,0.20)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
          }}>
            <AlertCircle size={24} style={{ color: "#C0392B" }} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#E8EEF8", marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 13, color: "#7A8BA8", maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(74,144,217,0.12)",
              border: "1px solid rgba(74,144,217,0.25)",
              color: "#4A90D9", fontSize: 13, fontWeight: 500,
              padding: "10px 20px", borderRadius: 10, cursor: "pointer",
            }}
            aria-label="Refresh page"
          >
            <RefreshCw size={14} />
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
