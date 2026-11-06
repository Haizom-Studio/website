import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PortfolioDetail from '@/components/portfolio/PortfolioDetail'
import {
  getPortfolioBySlug,
  portfolioinfo,
} from '@/app/api/data'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return portfolioinfo.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getPortfolioBySlug(slug)
  if (!project) {
    return { title: 'Project | Portfolio' }
  }
  return {
    title: `${project.title} | Portfolio`,
    description: project.description.split('\n\n')[0] ?? project.info,
  }
}

export default async function PortfolioProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = getPortfolioBySlug(slug)
  if (!project) {
    notFound()
  }
  return <PortfolioDetail project={project} />
}
