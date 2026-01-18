import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: 'Inter, sans-serif' }}>
          <h2 style={{ color: '#b00020' }}>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff3f3', padding: 12, borderRadius: 8, border: '1px solid #ffcdd2' }}>
            {String(this.state.error)}
          </pre>
          {this.state.info && (
            <details>
              <summary>Stack</summary>
              <pre>{this.state.info.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
