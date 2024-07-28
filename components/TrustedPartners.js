'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import styles from './TrustedPartners.module.css'; // Assuming you have CSS module for styles

const partners = [
  { src: "/1702561558197.jpeg", alt: "CBS" },
  { src: "/Orbis Logo.jpeg", alt: "Orbis" },
  { src: "/Vidya Prathishtan.jpg", alt: "Vidya Prathishtan" },
  { src: "/CityPride School Pune.png", alt: "CityPride School Pune" },
  { src: "/kaveri_new.png", alt: "kaveri_new" },
  { src: "/SES-GURUKUL-LOGO.png", alt: "SES-GURUKUL-LOGO" },
  { src: "/SGI-Logo.fd27914984c3b0765392.png", alt: "SGI" },
  { src: "/Zeal College Pune.png", alt: "Zeal College Pune" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/659738d7e575003017da1350_DCS_FullColor_Main_RGB.png", alt: "Dublin City Schools" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a1a9c33b3d6f019a4379cb_Relay%20GSE.png", alt: "Relay GSE" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a1a9ad894444fd351a715d_Catawba.png", alt: "Catawba County Schools" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65b81632d0bc9865c16e2411_image%20(11).png", alt: "Seattle Public Schools" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65b8163643dbd2983d368d72_image%20(13).png", alt: "Adams 14" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65b8164125a29a575f96660b_image__12_-removebg-preview.png", alt: "Iowa City Community School District" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a1a9bfd4fae8343a389886_Kenosha%20Unified.png", alt: "Kenosha Unified School District" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a1a9bb5fff6b437eebde31_ISB.png", alt: "International School of Busan" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a1a9b7e1a1775028c9dd4f_Galveston.png", alt: "Galveston Independent School District" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a1ad8a0e667ebd124394d8_Untitled%20design%20(22).png", alt: "Centennial School District" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/651730d7e03e5aa9873faaf1_Ednovate%2Blogo-full%2Bcolor-RGB.png", alt: "Ednovate" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/651730c8e03e5aa9873f9bd8_Aurora_Logo_Alternate_Full_Color_RGB.png", alt: "Aurora Public Schools" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/651730e85de378d41a6e7454_logo.png", alt: "Rocky Mountain Prep" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/651730c15de378d41a6e4b96_KIPP-Chicago-lt-blue-3.png", alt: "Kipp Chicago Public Schools" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/651730bb1d8243b73a5d5b54_HighTechHigh-nobackground.png", alt: "High Tech High" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a1a9c703d12dd31426e8c3_St%20Patrick%27s.png", alt: "St Patrick's Episcopal Day School" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a1aadc83e06e9c61a15ef1_Chagrin%20Falls.png", alt: "Chagrin Falls" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a71fba063b5bf95b2087d4_image%20(7).png", alt: "Laguna Beach Unified School District" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a71fbc764ff134e71bfcad_image%20(8).png", alt: "American School of Paris" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a71fc7fd6586f364b10115_image%20(9).png", alt: "Hilton Central School District" },
  { src: "https://cdn.prod.website-files.com/645187265d5e5e386be40629/65a7200ab25c7e3bd12a8eea_image%20(10).png", alt: "Hamilton County Schools" },
];

export default function TrustedPartners() {
  const containerRef = useRef(null);

  return (
    <div className={styles.carouselContainer}>
      <h2>TRUSTED BY 25+ SCHOOL AND COLLEGE PARTNERS WORLDWIDE</h2>
      <div className={styles.carouselInner} ref={containerRef}>
        <div className={styles.carouselTrack}>
          {partners.map((partner, index) => (
            <div key={index} className={styles.carouselItem}>
              <Image
                src={partner.src}
                alt={partner.alt}
                width={140}
                height={80}
                className={styles.carouselImage}
              />
            </div>
          ))}
          {partners.map((partner, index) => (
            <div key={index + partners.length} className={styles.carouselItem}>
              <Image
                src={partner.src}
                alt={partner.alt}
                width={200}
                height={100}
                className={styles.carouselImage}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


