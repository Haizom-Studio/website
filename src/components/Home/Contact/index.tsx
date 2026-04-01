import React from 'react'
import Image from 'next/image'
import { getImgPath } from '@/utils/image'
import ContactForm from '@/components/Contact/Form'

const Contactform = () => {
  return (
    <section className='overflow-x-hidden bg-darkmode dark:bg-darklight'>
      <div className='container mx-auto max-w-6xl px-4'>
        <div className='grid md:grid-cols-12 grid-cols-1 md:gap-7 gap-0'>
          <div
            className='row-start-1 col-start-1 row-end-2 md:col-end-7 col-end-12'
            data-aos='fade-left'
            data-aos-delay='200'
            data-aos-duration='1000'>
            <div className='flex gap-2 items-center justify-start'>
              <span className='w-3 h-3 rounded-full bg-success'></span>
              <span className='font-medium text-sm text-white'>
              Engineering ideas to reality
              </span>
            </div>
            <h2 className='sm:text-4xl text-[28px] leading-tight font-bold text-white py-12'>
              Let’s discuss about your project and take it the next level.
            </h2>
            <div className='grid grid-cols-6 pb-12 border-b border-dark_border '>
              <div className='col-span-3'>
                <span className='text-white/50 text-lg'>Phone</span>
                <p className='bg-transparent border-0 text-white text-lg'>
                  +92 334 5577900
                </p>
              </div>
              <div className='col-span-3'>
                <span className='text-white/50 text-lg'>Email</span>
                <p className='bg-transparent border-0 text-white text-lg'>
                  contact@haizomstudios.com
                </p>
              </div>
              <div className='col-span-6 pt-8'>
                <span className='text-white/50 text-lg'>Location</span>
                <p className='bg-transparent border-0 text-white text-lg'>
                  Islamabad 44000, Pakistan
                </p>
              </div>
            </div>
            <div className='pt-12'>
              <p className='text-white/50 pb-4 text-base'>Trusted by</p>
              <div className='flex items-center flex-wrap md:gap-14 gap-7'>
                <Image
                  src={getImgPath('/images/contact/google-pay.png')}
                  alt='Google-pay'
                  width={100}
                  height={20}
                  style={{ width: 'auto', height: 'auto' }}
                  quality={100}
                  className='w_f max-w-28 w-full h-5'
                />
                <Image
                  src={getImgPath('/images/contact/play-juction.png')}
                  alt='play-juction'
                  width={100}
                  height={20}
                  style={{ width: 'auto', height: 'auto' }}
                  quality={100}
                  className='w_f max-w-24 w-full h-6'
                />
                <Image
                  src={getImgPath('/images/contact/stripe.png')}
                  alt='stripe'
                  width={100}
                  height={20}
                  style={{ width: 'auto', height: 'auto' }}
                  quality={100}
                  className='w_f max-w-14 w-full h-6'
                />
                <Image
                  src={getImgPath('/images/contact/wise.png')}
                  alt='wise'
                  width={100}
                  height={20}
                  style={{ width: 'auto', height: 'auto' }}
                  quality={100}
                  className='w_f max-w-16 w-full h-4'
                />
              </div>
            </div>
          </div>
          <div
            data-aos='fade-right'
            data-aos-delay='200'
            data-aos-duration='1000'
            className="relative before:content-[''] before:absolute before:bg-[url('/images/contact/form-line.png')] before:bg-no-repeat before:w-[13rem] before:h-24 before:top-5% before:bg-contain before:left-[35%] before:z-1 before:translate-x-full lg:before:inline-block before:hidden after:content-[''] after:absolute after:bg-[url('/images/contact/from-round-line.png')] after:bg-no-repeat after:w-[6.3125rem] after:h-[6.3125rem] after:bg-contain after:top-1/2 after:-left-[25%] after:z-1 after:translate-x-1/2 after:translate-y-1/2 md:after:inline-block after:hidden md:row-start-1 row-start-2 md:col-start-8 col-start-1 row-end-2 col-end-13">
            <div className='lg:mt-0 mt-8  bg-white dark:bg-darkmode max-w-[50rem] m-auto pt-[2.1875rem] pb-8 px-[2.375rem] rounded-md relative z-10'>
              <h2 className='sm:text-3xl text-lg font-bold text-midnight_text mb-3 dark:text-white'>
                Get Online Consultation
              </h2>
              <ContactForm variant='home' />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contactform
