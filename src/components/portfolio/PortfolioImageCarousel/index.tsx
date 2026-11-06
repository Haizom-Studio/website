'use client'

import React from 'react'
import Slider from 'react-slick'
import Image from 'next/image'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

type Props = {
  images: string[]
  alt: string
}

export default function PortfolioImageCarousel({ images, alt }: Props) {
  const slides = images.length > 0 ? images : ['/images/services/schematic-capture-pcb-design.webp']
  const multi = slides.length > 1

  const settings = {
    dots: multi,
    arrows: multi,
    infinite: multi,
    speed: 450,
    autoplay: multi,
    autoplaySpeed: 3200,
    pauseOnHover: true,
    pauseOnFocus: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipe: true,
    touchMove: true,
    adaptiveHeight: false,
    nextArrow: multi ? <CarouselArrow direction="next" /> : undefined,
    prevArrow: multi ? <CarouselArrow direction="prev" /> : undefined,
  }

  return (
    <div className="portfolio-detail-carousel relative pb-2 [&_.slick-arrow:before]:hidden [&_.slick-arrow]:flex [&_.slick-arrow]:items-center [&_.slick-arrow]:justify-center">
      <Slider {...settings}>
        {slides.map((src, i) => (
          <div key={`${src}-${i}`} className="outline-none">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-black/5 dark:bg-white/5 md:aspect-[2/1]">
              <Image
                src={src}
                alt={multi ? `${alt} — ${i + 1} of ${slides.length}` : alt}
                fill
                priority={i === 0}
                quality={80}
                className="object-contain"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}

function CarouselArrow({
  direction,
  className,
  style,
  onClick,
}: {
  direction: 'prev' | 'next'
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}) {
  const label = direction === 'prev' ? 'Previous image' : 'Next image'
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={style}
      className={`${className ?? ''} !flex z-10 !h-11 !w-11 !items-center !justify-center rounded-md bg-black/35 !text-white shadow-md backdrop-blur-sm transition hover:bg-black/55 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70 md:!h-12 md:!w-12 before:!content-none`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="block h-6 w-6 text-current md:h-7 md:w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === 'prev' ? (
          <path d="M15 18l-6-6 6-6" />
        ) : (
          <path d="M9 6l6 6-6 6" />
        )}
      </svg>
    </button>
  )
}
