import Header from '@components/Header'
import Hero from '@components/Hero'
import MediaLogos from '@components/MediaLogos'
import CTAButtons from '@components/CTAButtons'
import TrustedPartners from '@components/TrustedPartners'
import EducatorStats from '@components/EducatorStats'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col justify-between">
        <div>
          <Hero />
          <MediaLogos />
          <CTAButtons />
          <TrustedPartners />
        </div>
        <EducatorStats />
      </main>
    </div>
  )
}