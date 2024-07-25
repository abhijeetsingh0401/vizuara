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
      <button onClick={() => handleClick('/schools')} className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800">For Schools</button>
      <button onClick={() => handleClick('/teachers')} className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700">For Teachers</button>
    </div>
  )
}