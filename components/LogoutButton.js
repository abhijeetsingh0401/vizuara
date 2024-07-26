// components/LogoutButton.js
'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@lib/firebase';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to homepage after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-fuchsia-500 text-white py-2 px-4 rounded hover:bg-fuchsia-600 transition-colors duration-300"
    >
      Logout
    </button>
  );
}