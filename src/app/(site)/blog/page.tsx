import React from 'react'
import BlogList from '@/components/Blog/BlogList'
import HeroSub from '@/components/SharedComponent/HeroSub'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Blog',
  description: 'Practical notes from our engineering work on PCB design, prototyping, firmware and web development.',
}

const BlogPage = () => {
  const breadcrumbLinks = [
    { href: '/', text: 'Home' },
    { href: '/blog', text: 'Blog' },
  ]
  return (
    <>
      <HeroSub
        title='Blog'
        description='Practical notes from our engineering work on PCB design, prototyping, firmware and web development.'
        breadcrumbLinks={breadcrumbLinks}
      />
      <BlogList />
    </>
  )
}

export default BlogPage
