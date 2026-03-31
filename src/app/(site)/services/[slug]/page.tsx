import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ServiceDetail from '@/components/services/ServiceDetail'
import { getServiceBySlug, servicesinfo } from '@/app/api/data'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return servicesinfo.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) {
    return { title: 'Service | Venus' }
  }
  return {
    title: `${service.title} | Services | Venus`,
    description: service.description,
  }
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) {
    notFound()
  }
  return <ServiceDetail service={service} />
}
