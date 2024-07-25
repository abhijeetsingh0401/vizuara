'use client'

import { useContext } from 'react'
import { UserContext } from '@lib/context'
import { signIn } from '@lib/auth'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { user } = useContext(UserContext)
  const router = useRouter()

  const handleClick = (path) => {
    if (user) {
      router.push(path)
    } else {
      signIn()
    }
  }

  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex justify-between items-center">
        <div className="text-2xl font-bold text-purple-600">Vizuara</div>
        <div className="space-x-4">
          <a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Community</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Resources</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
          {!user && (
            <>
              <button onClick={() => handleClick('/tools')} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Log in / SignUp</button>
            </>
          )}
          {user && (
            <>
              <button onClick={() => handleClick('/tools')} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Tools</button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}