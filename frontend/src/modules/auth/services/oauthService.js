import { PublicClientApplication } from '@azure/msal-browser'
import { post } from '@/utils/requestClient.js'

// Microsoft OAuth Configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

const msalInstance = new PublicClientApplication(msalConfig)

// Initialize MSAL
await msalInstance.initialize()

// Microsoft Login
export const loginWithMicrosoft = async () => {
  try {
    const loginRequest = {
      scopes: ['openid', 'profile', 'email'],
    }

    const response = await msalInstance.loginPopup(loginRequest)
    
    if (response && response.account) {
      const { account } = response
      
      // Send OAuth data to backend
      const oauthData = {
        email: account.username,
        provider: 'microsoft',
        provider_id: account.homeAccountId,
      }

      const backendResponse = await post('/v1/api/users/oauth-login', oauthData)
      return backendResponse.data
    }
    
    throw new Error('Microsoft login failed')
  } catch (error) {
    console.error('Microsoft OAuth error:', error)
    throw new Error(error.message || 'Microsoft login failed')
  }
}

// Google Login
export const loginWithGoogle = async () => {
  try {
    await loadGoogleScript();
    
    return new Promise((resolve, reject) => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        ux_mode: 'popup',
        callback: async (response) => {
          try {
            console.log(response)
            const oauthData = {
              code: response?.credential,
            };

            const backendResponse = await post('/auth/oauth/google', oauthData);
            resolve(backendResponse.data);
          } catch (error) {
            reject(new Error(error.message || 'Google login failed'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Show sign-in button if FedCM fails
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const buttonDiv = document.createElement('div');
          document.body.appendChild(buttonDiv);

          window.google.accounts.id.renderButton(buttonDiv, {
            theme: 'outline',
            size: 'large',
            width: 250,
          });

          buttonDiv.click();
          document.body.removeChild(buttonDiv);
        }
      });
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw new Error(error.message || 'Google login failed');
  }
};

const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve()
        return
      }
  
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  


// Helper function to parse JWT token
// const parseJwt = (token) => {
//   try {
//     console.log(123, token)
//     const base64Url = token.split('.')[1]
//     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split('')
//         .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//         .join('')
//     )
//     return JSON.parse(jsonPayload)
//   } catch (error) {
//     throw new Error('Invalid token')
//   }
// }

// Logout functions
export const logoutMicrosoft = async () => {
  try {
    await msalInstance.logoutPopup()
  } catch (error) {
    console.error('Microsoft logout error:', error)
  }
}

export const logoutGoogle = () => {
  if (window.google && window.google.accounts) {
    window.google.accounts.id.disableAutoSelect()
  }
}