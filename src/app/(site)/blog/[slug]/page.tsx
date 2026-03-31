import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import BlogPostDetail from '@/components/Blog/BlogPostDetail'
import { getPostSlugs, getPostBySlug, postExists } from '@/utils/markdown'
import markdownToHtml from '@/utils/markdownToHtml'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getPostSlugs().map((file) => ({
    slug: file.replace(/\.mdx$/, ''),
  }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (!postExists(slug)) {
    return {
      title: 'Blog',
      description:
        'Discover a wealth of insightful materials meticulously crafted to provide you with a comprehensive understanding of the latest trends.',
    }
  }
  const post = getPostBySlug(slug, ['title', 'excerpt', 'date'])
  return {
    title: `${post.title ?? 'Blog'} | Blog`,
    description:
      typeof post.excerpt === 'string'
        ? post.excerpt
        : 'Blog post from Haizom Studio.',
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  if (!postExists(slug)) {
    notFound()
  }

  const post = getPostBySlug(slug, [
    'title',
    'excerpt',
    'date',
    'coverImage',
    'author',
    'authorImage',
    'content',
    'slug',
  ])

  const html = await markdownToHtml((post.content as string) || '')

  return (
    <BlogPostDetail
      title={(post.title as string) || 'Untitled'}
      excerpt={(post.excerpt as string) || ''}
      date={(post.date as string) || ''}
      coverImage={post.coverImage as string | undefined}
      author={post.author as string | undefined}
      authorImage={post.authorImage as string | undefined}
      html={html}
      slug={(post.slug as string) || slug}
    />
  )
}
