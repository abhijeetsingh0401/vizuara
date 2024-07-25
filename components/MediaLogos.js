'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

const logos = [
  { src: "/cbs-logo.png", alt: "CBS" },
  { src: "/abc-news-logo.png", alt: "ABC News" },
  { src: "/wired-logo.png", alt: "Wired" },
  { src: "/techcrunch-logo.webp", alt: "TechCrunch" },
]

export default function MediaLogos() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % logos.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex justify-center space-x-8 mb-12">
      {logos.map((logo, index) => (
        <div key={logo.alt} className={`transition-opacity duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-50'}`}>
          <Image src={logo.src} alt={logo.alt} width={100} height={50} />
        </div>
      ))}
    </div>
  )
}