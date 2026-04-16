import React, { FC } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import HeroSub from '@/components/SharedComponent/HeroSub'
import type { ServiceItem } from '@/app/api/data'

interface ServiceDetailProps {
  service: ServiceItem
}

const ServiceDetail: FC<ServiceDetailProps> = ({ service }) => {
  const breadcrumbLinks = [
    { href: '/', text: 'Home' },
    { href: '/services', text: 'Services' },
    { href: `/services/${service.slug}`, text: service.title },
  ]

  const paragraphs = service.fullDescription.split('\n\n').filter(Boolean)
  const lead = paragraphs[0]
  const columnA = paragraphs[1]
  const columnB = paragraphs[2]
  const rest = paragraphs.slice(3)

  return (
    <>
      <HeroSub
        title={service.title}
        description={service.description}
        breadcrumbLinks={breadcrumbLinks}
      />
      <section className='md:pb-24 pb-16 dark:bg-darkmode'>
        <div className='container mx-auto max-w-6xl px-4'>
          <div className='relative overflow-hidden rounded-lg shadow-[0px_20px_80px_0px_#68758D26] mb-12 md:mb-16'>
            <Image
              src={service.image}
              alt={service.alt}
              width={1200}
              height={600}
              priority
              className='w-full h-[600px] object-cover'
              sizes='(max-width: 1152px) 100vw, 1152px'
            />
          </div>
          <div className='flex md:flex-row flex-col items-start w-full justify-between flex-wrap sm:flex-nowrap lg:gap-0 gap-8'>
            <div className='lg:w-[60%] w-full'>
              {lead ? (
                <div className='pb-[3.625rem]'>
                  <p className='md:text-[1.6875rem] text-[1.0625rem] md:leading-[2.25rem] leading-[2rem] font-normal text-midnight_text dark:text-white'>
                    {lead}
                  </p>
                </div>
              ) : null}
              {columnA || columnB ? (
                <div className='flex items-start justify-between sm:flex-row flex-col lg:gap-0 gap-4'>
                  {columnA ? (
                    <p className='sm:text-lg text-base font-normal text-secondary max-w-[19.4375rem] dark:text-white/50'>
                      {columnA}
                    </p>
                  ) : null}
                  {columnB ? (
                    <p className='sm:text-lg text-base font-normal text-secondary max-w-[19.4375rem] dark:text-white/50'>
                      {columnB}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {rest.length > 0 ? (
                <div className='mt-8 space-y-6'>
                  {rest.map((block, i) => (
                    <p
                      key={i}
                      className='sm:text-lg text-base font-normal text-secondary dark:text-white/50 leading-relaxed'>
                      {block}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
            <div
              className='flex flex-col items-start bg-white shadow-[0px_20px_80px_0px_#68758D26] pt-10 lg:pl-14 pl-9 pb-8 lg:pr-40 pr-10 lg:w-[30%] w-full dark:bg-darklight'
              data-aos='fade-left'
              data-aos-delay='200'
              data-aos-duration='1000'>
              <span className='pb-2 text-sm font-medium text-primary uppercase tracking-wide'>
                {service.info}
              </span>
              <span className='pb-6 text-2xl text-midnight_text font-semibold dark:text-white'>
                What we deliver
              </span>
              {service.deliverables.map((item) => (
                <span
                  key={item}
                  className='pb-6 text-lg text-secondary dark:text-white/70'>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className='pt-14 flex justify-center'>
            <Link
              href='/services'
              className='text-lg font-medium text-primary hover:underline dark:text-primary'>
              ← Back to services
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default ServiceDetail
