// src/components/SuccessPageWrapper.jsx
import { useState } from 'react';
import SuccessPage from './SucessPage';

export default function SuccessPageWrapper({ onNewSubmission, ...props }) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectUrl = 'https://congresswomanrosemariepanotes.vercel.app/NameChecker';
  const allowedDomains = ['congresswomanrosemariepanotes.vercel.app'];

  const isValidRedirect = (url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        console.error('Security: Only HTTPS allowed');
        return false;
      }
      const domain = parsed.hostname;
      return allowedDomains.some(allowed =>
        domain === allowed || domain.endsWith('.' + allowed)
      );
    } catch (e) {
      console.error('Invalid URL format');
      return false;
    }
  };

  const handleNewSubmission = () => {
    if (onNewSubmission) {
      onNewSubmission();
    }

    if (!isValidRedirect(redirectUrl)) {
      alert('Security: Invalid redirect URL. Please contact support.');
      return;
    }

    try {
      // First: hide everything immediately
      const root = document.getElementById('root');
      if (root) {
        root.style.display = 'none';
      }

      // Second: show overlay
      setIsRedirecting(true);

      // Third: wait and redirect
      setTimeout(() => {
        window.location.replace(redirectUrl);
      }, 1000);

    } catch (error) {
      console.error('Redirect failed:', error);
      setIsRedirecting(false);
      alert('Unable to redirect. Please try again.');
    }
  };

  if (isRedirecting) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999999,
        width: '100vw',
        height: '100vh'
      }}>
        <div
          className="spinner-border mb-3"
          role="status"
          style={{ color: '#1a5c38', width: '3rem', height: '3rem' }}
        />
        <h4 style={{ color: '#1a5c38', fontWeight: 700 }}>
          ✅ Thank you!
        </h4>
        <p className="text-muted" style={{ marginTop: '10px' }}>
          Redirecting you to the next page...
        </p>
      </div>
    );
  }

  return <SuccessPage {...props} onNewSubmission={handleNewSubmission} />;
}