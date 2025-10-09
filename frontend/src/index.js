import React from 'react';
import { RecoilRoot } from 'recoil';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { userManager } from './api';

import './index.css';
import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));

async function boot() {
  // Callback route handling
  if (window.location.pathname === '/callback') {
    try {
      await userManager.signinRedirectCallback();
      const url = sessionStorage.getItem('post_login_redirect') || '/';
      sessionStorage.removeItem('post_login_redirect');
      window.history.replaceState({}, '', url);
    } catch (e) {
      console.error('OIDC callback failed', e);
      window.history.replaceState({}, '', '/');
    }
  }

  root.render(
    <RecoilRoot>
      <App />
    </RecoilRoot>
  );
}

boot();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
