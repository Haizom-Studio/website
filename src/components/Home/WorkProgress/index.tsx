'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Progress as ProgressData } from '@/app/api/data' // Assuming Progress is correctly imported
import { getImgPath } from '@/utils/image'


// Define the interface for ProgressItem
interface ProgressItem {
  title: string
  Progress: number
}

const Progresswork = ({ isColorMode }: { isColorMode: Boolean }) => {
  const [progressValues, setProgressValues] = useState<ProgressItem[]>([]) // Initialize with ProgressItem[]
  useEffect(() => {
    // Fetch progress data or use static data (Progress array)
    setProgressValues(ProgressData)
  }, [])

  return (
    <section
      className={`scroll-mt-25 ${
        isColorMode
          ? 'dark:bg-darklight bg-section'
          : 'dark:bg-darkmode bg-white'
      }`}
      id='about'>
      <div className='container mx-auto max-w-6xl px-4'>
        <div className='grid md:grid-cols-12 items-center gap-7'>
          <div className='md:col-span-6'>
            <Image
              src={getImgPath('/images/work-progress/layout-to-board.webp')}
              alt='A PCB layout and the finished 3D board it produced'
              width={1200}
              height={1390}
              quality={100}
              style={{ width: '100%', height: 'auto' }}
              className='md:block hidden'
            />
          </div>
          <div
            className='md:col-span-6'
            data-aos='fade-left'
            data-aos-delay='200'
            data-aos-duration='1000'>
            <div className='flex gap-2 items-center'>
              <span className='w-3 h-3 rounded-full bg-success'></span>
              <span className='font-medium text-midnight_text text-sm dark:text-white/50'>
                About us
              </span>
            </div>
            <h2 className='pt-9 pb-8 text-midnight_text font-bold dark:text-white text-4xl'>
              Hardware and software, designed by one team.
            </h2>
            <p className='text-gray dark:text-white/70 text-base font-semibold'>
              Haizom Studios is an engineering studio based in Pakistan. We
              capture schematics and lay out multi-layer PCBs, bring prototypes
              up on the bench, write the firmware that runs them, and build the
              web and mobile apps that connect to them. Keeping it all in one
              team means fewer hand-offs and products that work together from
              the first prototype.
            </p>

            <div className='block mx-auto pt-12'>
              {progressValues.map((item, index) => (
                <div
                  key={index}
                  className='progress_bar_item flex flex-wrap mb-8'>
                  <div className='flex-1 w-auto text-sm font-normal text-grey mb-2 dark:text-white/50'>
                    {item.title}
                  </div>
                  <div className='item_value shrink text-sm font-normal text-grey mb-2 dark:text-white/50'>
                    {item.Progress}%
                  </div>
                  <div className='relative h-1 w-full bg-primary/30 rounded-md'>
                    <div
                      className='progress absolute left-0 top-0 bottom-0 h-full bg-primary rounded-md duration-100 ease-in-out'
                      style={{ width: `${item.Progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Progresswork
