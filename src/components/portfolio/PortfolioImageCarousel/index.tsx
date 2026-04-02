'use client'

import React, { useState } from 'react'
import Slider from 'react-slick'
import Image from 'next/image'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

type Props = {
  images: string[]
  alt: string
}

export default function PortfolioImageCarousel({ images, alt }: Props) {
  const slides = images.length > 0 ? images : ['/images/portfolio/cozycasa.png']
  const [index, setIndex] = useState(0)
  const multi = slides.length > 1

  const settings = {
    dots: multi,
    arrows: multi,
    infinite: multi,
    speed: 450,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipe: true,
    touchMove: true,
    adaptiveHeight: false,
    beforeChange: (_: number, next: number) => setIndex(next),
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
                className="object-cover"
                sizes="(max-width: 1152px) 100vw, 1152px"
                unoptimized
              />
            </div>
          </div>
        ))}
      </Slider>
      {multi ? (
        <p className="mt-3 text-center text-sm text-secondary dark:text-white/60">
          {index + 1} / {slides.length}
        </p>
      ) : null}
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
      className={`${className ?? ''} !flex z-10 h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/60 md:h-12 md:w-12 before:!content-none`}>
      <span className="text-xl leading-none" aria-hidden>
        {direction === 'prev' ? '‹' : '›'}
      </span>
    </button>
  )
}
