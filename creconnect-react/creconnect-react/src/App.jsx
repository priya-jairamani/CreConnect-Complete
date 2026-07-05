import { Component } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@/routes';
import { AuthProvider }         from '@/context/AuthContext';
import { UserProvider }         from '@/context/UserContext';
import { CampaignProvider }     from '@/context/CampaignContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ToastProvider }        from '@/context/ToastContext';
import { ThemeProvider }        from '@/context/ThemeContext';
import { CallProvider }         from '@/context/CallContext';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', color: '#f0445f', background: '#0a0b14', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>⚠ App crashed — runtime error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#f2f4fb', background: '#12131f', padding: '1rem', borderRadius: '8px' }}>
            {this.state.error?.message}{'\n\n'}{this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <CampaignProvider>
              <NotificationProvider>
                <ToastProvider>
                  <CallProvider>
                    <RouterProvider router={router} />
                  </CallProvider>
                </ToastProvider>
              </NotificationProvider>
            </CampaignProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
