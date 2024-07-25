import { auth, googleAuthProvider } from './firebase'
import { signInWithPopup } from 'firebase/auth'

export const signIn = async () => {
  try {
    await signInWithPopup(auth, googleAuthProvider)
  } catch (error) {
    console.error('Error signing in with Google', error)
  }
}