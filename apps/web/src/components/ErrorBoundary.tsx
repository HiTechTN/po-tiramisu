'use client';

import { Component, ReactNode } from 'react';

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

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="glass-card p-12 text-center m-8">
            <h2 className="text-3xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-white/70 mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white font-bold py-3 px-8 rounded-xl"
            >
              Reload
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
