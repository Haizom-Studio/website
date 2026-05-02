'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import type { PortfolioItem } from '@/app/api/data'
import { filterAndSortPortfolio, parseSearchTokens } from '@/utils/portfolioSearch'

type Props = {
  items: PortfolioItem[]
}

const PortfolioList = ({ items }: Props) => {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => filterAndSortPortfolio(items, query), [items, query])
  const tokens = useMemo(() => parseSearchTokens(query), [query])
  const showingAll = tokens.length === 0

  return (
    <section id='portfolio' className='md:pb-24 pb-16 pt-8 dark:bg-darkmode'>
      <div className='mx-auto w-full max-w-[120rem] px-4 lg:px-[2.125rem]'>
        <div className='mx-auto mb-10 max-w-2xl' role='search' aria-label='Search portfolio projects'>
          <label htmlFor='portfolio-search' className='mb-2 block text-sm font-medium text-midnight_text dark:text-white'>
            Search portfolio
          </label>
          <div className='relative'>
            <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-grey dark:text-white/40' aria-hidden>
              <Icon icon='ion:search-outline' className='h-5 w-5' />
            </span>
            <input
              id='portfolio-search'
              type='search'
              name='portfolio-search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try title, industry, or keywords — e.g. healthcare PCB SaaS'
              autoComplete='off'
              spellCheck={false}
              className='w-full rounded-lg border border-border border-solid bg-white py-3 pl-11 pr-4 text-base text-midnight_text placeholder:text-grey/80 transition focus:border-primary focus:outline-none dark:border-dark_border dark:bg-darklight dark:text-white dark:placeholder:text-white/35 dark:focus:border-primary'
            />
          </div>
          <p className='mt-2 text-sm text-secondary dark:text-white/50' aria-live='polite'>
            {showingAll
              ? `${items.length} project${items.length === 1 ? '' : 's'}`
              : filtered.length === 0
                ? 'No projects match your search'
                : `${filtered.length} of ${items.length} project${items.length === 1 ? '' : 's'} — keywords are combined (all must match)`}
          </p>
        </div>
      </div>
      <div className='flex flex-wrap gap-[2.125rem] lg:px-[2.125rem] px-0 max-w-[120rem] w-full justify-center m-auto'>
        {filtered.map((item, index) => (
          <Link key={item.slug || index} href={`/portfolio/${item.slug}`} passHref>
            <div className={`w-[18rem] group ${item.Class}`}>
              <div className='relative overflow-hidden rounded-lg bg-white dark:bg-white/5 aspect-[3/2] w-full group-hover:scale-[1.1] group-hover:cursor-pointer transition-all duration-500'>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes='(max-width: 768px) 100vw, 288px'
                  className='object-contain'
                />
              </div>
              <h4 className='pb-[0.3125rem] pt-[2.1875rem] group-hover:text-primary group-hover:cursor-pointer text-2xl text-midnight_text font-bold dark:text-white'>
                {item.title}
              </h4>
              <p className='text-secondary font-normal text-lg group-hover:text-primary group-hover:cursor-pointer dark:text-white/50'>
                {item.info}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default PortfolioList
