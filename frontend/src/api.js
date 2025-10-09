import axios from 'axios';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const api = axios.create({
  baseURL: `${baseURL}`,
});

// OIDC setup
const oidcConfig = {
  authority: process.env.REACT_APP_OIDC_AUTHORITY,
  client_id: process.env.REACT_APP_OIDC_CLIENT_ID,
  redirect_uri: window.location.origin + '/callback',
  post_logout_redirect_uri: window.location.origin,
  response_type: 'code',
  scope: process.env.REACT_APP_OIDC_SCOPE || 'openid profile email',
  loadUserInfo: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

export const userManager = new UserManager(oidcConfig);

export async function getAccessToken() {
  try {
    const user = await userManager.getUser();
    if (user && !user.expired) {
      return user.access_token;
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
}

// Attach token to all requests
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.setItem('post_login_redirect', window.location.pathname);
      try {
        await userManager.signinRedirect();
      } catch (e) {
        // noop
      }
    }
    return Promise.reject(error);
  }
);

export default api;