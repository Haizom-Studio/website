'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import type { PortfolioItem } from '@/app/api/data'
import { filterAndSortPortfolio, parseSearchTokens } from '@/utils/portfolioSearch'
import { portfolioCategory, portfolioCategoryCounts } from '@/lib/portfolio-categories'

const ALL = 'All'

type Props = {
  items: PortfolioItem[]
}

const PortfolioList = ({ items }: Props) => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>(ALL)

  const categories = useMemo(() => portfolioCategoryCounts(items), [items])

  // Read ?category= on first load so filtered views can be shared as links.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('category')
    if (fromUrl && categories.some((c) => c.name === fromUrl)) setCategory(fromUrl)
  }, [categories])

  function selectCategory(name: string) {
    setCategory(name)
    const url = new URL(window.location.href)
    if (name === ALL) url.searchParams.delete('category')
    else url.searchParams.set('category', name)
    window.history.replaceState(null, '', url.toString())
  }

  const inCategory = useMemo(
    () => (category === ALL ? items : items.filter((item) => portfolioCategory(item) === category)),
    [items, category]
  )
  const filtered = useMemo(() => filterAndSortPortfolio(inCategory, query), [inCategory, query])
  const tokens = useMemo(() => parseSearchTokens(query), [query])
  const showingAll = tokens.length === 0 && category === ALL

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
                : tokens.length === 0
                  ? `${filtered.length} of ${items.length} project${items.length === 1 ? '' : 's'}`
                  : `${filtered.length} of ${items.length} project${items.length === 1 ? '' : 's'} — keywords are combined (all must match)`}
          </p>
        </div>
        {categories.length > 1 ? (
          <div className='mx-auto mb-12 flex max-w-5xl flex-wrap justify-center gap-2' role='group' aria-label='Filter projects by category'>
            {[{ name: ALL, count: items.length }, ...categories].map((c) => {
              const active = c.name === category
              return (
                <button
                  key={c.name}
                  type='button'
                  onClick={() => selectCategory(c.name)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-white text-midnight_text hover:border-primary hover:text-primary dark:border-dark_border dark:bg-darklight dark:text-white dark:hover:border-primary dark:hover:text-primary'
                  }`}>
                  {c.name}
                  <span className={`ml-1.5 text-xs ${active ? 'text-white/80' : 'text-grey dark:text-white/40'}`}>{c.count}</span>
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
      <div className='flex flex-wrap gap-[2.125rem] lg:px-[2.125rem] px-0 max-w-[120rem] w-full justify-center m-auto'>
        {filtered.map((item, index) => (
          <Link key={item.slug || index} href={`/portfolio/${item.slug}`} passHref>
            <div className={`w-[18rem] group ${showingAll ? item.Class : ''}`}>
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
