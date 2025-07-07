import { PublicClientApplication } from '@azure/msal-browser'
import { post } from '@/utils/requestClient.js'

// Microsoft OAuth Configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}`,
    redirectUri: window.location.origin, // Update with your redirect URI
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

export const msalInstance = new PublicClientApplication(msalConfig)

// Initialize MSAL
msalInstance.initialize()

// Microsoft Login
export const loginWithMicrosoft = async () => {
  try {
    const loginRequest = {
      scopes: ['openid', 'profile', 'User.Read', 'email', 'offline_access'],
      prompt: 'select_account'
    }

        const response = await msalInstance.loginPopup(loginRequest)
        console.log('Microsoft OAuth response:', response)
    
    if (response && response.account) {
      // Send OAuth data to backend
      const oauthData = {
       id_token : response.idToken,
      }

      const backendResponse = await post('/auth/oauth/microsoft', oauthData)
      return backendResponse.data
    }
    
    throw new Error('Microsoft login failed')
  } catch (error) {
    console.error('Microsoft OAuth error:', error)
    throw new Error(error.message || 'Microsoft login failed')
  }
}

// Google Login
export const loginWithGoogle = async (code) => {
  try {
    // Send the authorization code to your backend
    const response = await post('/auth/oauth/google', { code })
    return response.data
  } catch (error) {
    console.error('Google OAuth error:', error)
    throw new Error(error.response?.data?.message || error.message || 'Google login failed')
  }
}