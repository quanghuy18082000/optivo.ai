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

    console.log(response)
    
    if (response && response.account) {

      
      // Send OAuth data to backend
      const oauthData = {
       code : response.accessToken,
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