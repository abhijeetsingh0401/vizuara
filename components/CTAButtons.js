'use client'

import { useContext } from 'react'
import { UserContext } from '@lib/context'
import { signIn } from '@lib/auth'
import { useRouter } from 'next/navigation'

export default function CTAButtons() {
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
    <div className="flex justify-center space-x-4 mb-12">
      <button onClick={() => handleClick('/tools')} className="px-6 py-3 bg-cyan-400 text-white rounded-md hover:bg-cyan-500 transition-colors duration-300">For Schools</button>
      <button onClick={() => handleClick('/tools')} className="px-6 py-3 bg-fuchsia-500 text-white rounded-md hover:bg-fuchsia-600 transition-colors duration-300">For Teachers</button>
    </div>
  )
}