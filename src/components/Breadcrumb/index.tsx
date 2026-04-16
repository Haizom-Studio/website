import React, { FC } from 'react'
import Link from 'next/link'

interface BreadcrumbProps {
  links: { href: string; text: string }[]
}

const Breadcrumb: FC<BreadcrumbProps> = ({ links }) => {
  const siteUrl = "https://haizomstudios.com";

  // `Rich Results Test` looks for `application/ld+json` breadcrumbs.
  // We emit BreadcrumbList JSON-LD based on the same links rendered visually.
  const breadcrumbItems = links
    .filter((l) => l.href && l.href !== "#")
    .map((link, index) => {
      const href = link.href.startsWith("http")
        ? link.href
        : `${siteUrl}${link.href.startsWith("/") ? "" : "/"}${link.href}`;

      return {
        "@type": "ListItem",
        position: index + 1,
        name: link.text,
        item: href,
      };
    });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  const lastIndex = links.length - 1
  return (
    <>
      <div className='flex items-baseline flex-wrap justify-center my-[0.9375rem] mx-0'>
      {links.map((link, index) => (
        <React.Fragment key={index}>
          {index !== lastIndex ? (
            <Link
              href={link.href}
              className="no-underline flex items-center text-midnight_text dark:text-white/70 font-normal md:text-xl text-lg hover:underline after:relative after:content-[''] after:ml-2.5 after:mr-[0.8125rem] after:my-0 after:inline-block after:top-[0.0625rem] after:w-2 after:h-2 after:border-r-2 after:border-solid after:border-b-2 after:border-midnight_text dark:after:border-white after:-rotate-45">
              {link.text}
            </Link>
          ) : (
            <span className='dark:text-white text-midnight_text md:text-xl text-lg mx-2.5'>
              {link.text}
            </span>
          )}
        </React.Fragment>
      ))}
      </div>

      {breadcrumbItems.length > 0 ? (
        <script
          type='application/ld+json'
          // JSON-LD must be inline so the crawler sees it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      ) : null}
    </>
  )
}

export default Breadcrumb
