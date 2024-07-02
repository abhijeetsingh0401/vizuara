import { auth, firestore, doc, onSnapshot } from '@lib/firebase';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

// Custom hook to read auth record and user profile doc
export function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // turn off realtime subscription
    let unsubscribe;

    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        setUsername(docSnap.data()?.username);
      });
    } else {
      setUsername(null);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return { user, username };
}
