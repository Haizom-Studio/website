import React from 'react'
import Image from 'next/image'
import { getImgPath } from '@/utils/image'

const Testimonial = () => {
  return (
    <section
      className='scroll-mt-24 bg-section dark:bg-darklight border-none'
      id='testimonials'>
      <div className='container mx-auto max-w-6xl px-4'>
        <div
          className='flex gap-2 items-center justify-center'
          data-aos='fade-up'
          data-aos-delay='200'
          data-aos-duration='1000'>
          <span className='w-3 h-3 rounded-full bg-success'></span>
          <span className='font-medium text-midnight_text text-sm dark:text-white/50'>
            Testimonials
          </span>
        </div>
        <h2
          className='sm:text-4xl text-[28px] leading-tight font-bold text-midnight_text text-center pt-7 pb-14 md:w-4/6 w-full m-auto dark:text-white'
          data-aos='fade-up'
          data-aos-delay='200'
          data-aos-duration='1000'>
          What our clients say
        </h2>
        <div>
          <Image
            src={getImgPath('/images/testimonial/vector-smart.png')}
            alt=''
            width={150}
            height={0}
            quality={100}
            className='w_f w-94! h-52! m-auto'
          />
          <div className='pt-16 pb-28'>
            <p className='font-medium md:text-xl text-base text-midnight_text dark:text-white text-center max-w-3xl mx-auto'>
              Haizom Studio designed our prototype PCB and embedded firmware in just two weeks—it worked flawlessly on first run.
            </p>
          </div>
          <div className='text-center'>
            <strong className='text-lg font-bold text-midnight_text dark:text-primary'>
              Marshall
            </strong>
            <p className='text-base text-gray dark:text-white/50 '>
              CEO, PlebSource.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonial
