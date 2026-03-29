import React from 'react'
import Link from 'next/link'

const Location = () => {
  const breadcrumbLinks = [
    { href: '/', text: 'Home' },
    { href: '/contact', text: 'Contact' },
  ]
  return (
    <>
      <section className='bg-primary md:py-24 py-16'>
        <div className='container mx-auto max-w-6xl px-4'>
          <div className=''>
            <div className='grid md:grid-cols-6 lg:grid-cols-9 grid-cols-1 gap-7 border-b border-solid border-white border-opacity-50 pb-11'>
              <div className='col-span-3'>
                <h2 className='text-white max-w-56 text-[40px] leading-tight font-bold'>
                 Main Head Office
                </h2>
              </div>
              <div className='col-span-3'>
                <p className='sm:text-2xl text-xl text-IceBlue font-normal max-w-64 leading-7 text-white/50'>
                  Islamabad 44000, Pakistan
                </p>
              </div>
              <div className='col-span-3'>
                <Link
                  href='mailto:contact@haizomstudios.com'
                  className='sm:text-2xl text-xl text-white font-medium underline'>
                 contact@haizomstudios.com
                </Link>
                <Link
                  href='tel:+923345577900'
                  className='sm:text-2xl text-xl text-white/80 flex items-center gap-2 hover:text-opacity-100 w-fit'>
                  <span className='text-white/40!'>Call</span>
                  92 334 5577900
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Location
