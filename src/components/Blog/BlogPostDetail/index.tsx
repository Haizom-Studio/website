'use client'

import React, { FC } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import HeroSub from '@/components/SharedComponent/HeroSub'

const FALLBACK_COVER = '/images/blog/blog_1.png'

function coverImageSrc(coverImage?: string) {
  if (!coverImage || typeof coverImage !== 'string') return FALLBACK_COVER
  const t = coverImage.trim()
  if (!t) return FALLBACK_COVER
  if (t.startsWith('/')) return t
  return `/${t}`
}

type BlogPostDetailProps = {
  title: string
  excerpt: string
  date: string
  coverImage?: string
  author?: string
  authorImage?: string
  html: string
  slug: string
}

const BlogPostDetail: FC<BlogPostDetailProps> = ({
  title,
  excerpt,
  date,
  coverImage,
  author,
  authorImage,
  html,
  slug,
}) => {
  const breadcrumbLinks = [
    { href: '/', text: 'Home' },
    { href: '/blog', text: 'Blog' },
    { href: '#', text: title },
  ]

  const authorName = author?.trim() || 'Author'
  const authorImg =
    authorImage?.trim() || '/images/blogdetail-page/silicaman.png'

  return (
    <>
      <HeroSub
        title={title}
        description={excerpt}
        breadcrumbLinks={breadcrumbLinks}
      />
      <section className='md:pb-24 pb-16 dark:bg-darkmode'>
        <div className='container mx-auto max-w-6xl px-4'>
          <div className='relative overflow-hidden rounded-lg shadow-[0px_20px_80px_0px_#68758D26] mb-10 md:mb-14'>
            <Image
              src={coverImageSrc(coverImage)}
              alt={title}
              width={1200}
              height={600}
              priority
              className='w-full max-h-[600px] object-cover'
              sizes='(max-width: 1152px) 100vw, 1152px'
            />
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 pb-8 border-b border-border dark:border-dark_border'>
            <span className='text-sm font-semibold text-grey dark:text-SereneGray'>
              {format(new Date(date), 'dd MMM yyyy')}
            </span>
            <div className='flex items-center gap-4'>
              <Image
                src={authorImg}
                alt=''
                className='rounded-full'
                width={56}
                height={56}
                quality={100}
              />
              <div>
                <p className='text-lg font-semibold text-midnight_text dark:text-white'>
                  {authorName}
                </p>
                <p className='text-sm text-grey dark:text-SereneGray'>Author</p>
              </div>
            </div>
          </div>

          <article
            className='max-w-4xl [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-bold [&_h1]:text-midnight_text [&_h1]:dark:text-white [&_h1]:mb-6 [&_h1]:mt-10 [&_h1]:first:mt-0 [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:text-midnight_text [&_h2]:dark:text-white [&_h2]:mb-4 [&_h2]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-midnight_text [&_h3]:dark:text-white [&_h3]:mb-3 [&_h3]:mt-6 [&_p]:text-secondary [&_p]:dark:text-white/70 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-secondary [&_ul]:dark:text-white/70 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_hr]:my-10 [&_hr]:border-border [&_hr]:dark:border-dark_border [&_img]:rounded-lg [&_img]:max-w-full [&_img]:h-auto [&_img]:my-6 [&_strong]:text-midnight_text [&_strong]:dark:text-white'
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className='mt-14 pt-8 border-t border-border dark:border-dark_border'>
            <Link
              href='/blog'
              className='inline-flex items-center gap-2 text-base font-medium text-primary hover:underline'>
              ← Back to blog
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default BlogPostDetail
