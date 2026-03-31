import React, { FC } from "react";
import Image from "next/image";
import { Blog } from "@/types/blog";
import { format } from "date-fns";
import Link from "next/link";

const FALLBACK_COVER = "/images/blog/blog_1.png";

function coverImageSrc(coverImage?: string) {
  if (!coverImage || typeof coverImage !== "string") return FALLBACK_COVER;
  const t = coverImage.trim();
  if (!t) return FALLBACK_COVER;
  if (t.startsWith("/")) return t;
  return `/${t}`;
}

const BlogCard = ({ blog }: { blog: Blog }) => {
    const { title, coverImage, date, slug } = blog;
    const postHref = slug ? `/blog/${encodeURIComponent(slug)}` : "/blog";
    return (
        <>
            <div className="group mb-0 relative">
                <div className="mb-8 overflow-hidden rounded-sm">
                    <Link href={postHref} aria-label={title ? `Read: ${title}` : "Read blog post"} className="block">
                        <Image
                            src={coverImageSrc(coverImage)}
                            alt={title ? `${title} cover` : "Blog post cover"}
                            className="w-full transition group-hover:scale-125"
                            width={408}
                            height={272}
                            style={{ width: '100%', height: 'auto' }}
                            quality={100}
                        />
                    </Link>
                </div>
                <div className="absolute top-0 bg-primary py-2 ml-4 mt-4 px-5 rounded-sm">
                    <span className="text-white font-medium text-sm">
                        Blog
                    </span>
                </div>
                <div>
                    <h3>
                        <Link
                            href={postHref}
                            className="mb-4 inline-block font-semibold text-dark text-black hover:text-primary dark:text-white dark:hover:text-primary text-[22px] leading-tight"
                        >
                            {title}
                        </Link>
                    </h3>
                    <span className="text-sm font-semibold leading-loose text-SereneGray">
                        {format(new Date(date), "dd MMM yyyy")}
                    </span>
                </div>
            </div>
        </>
    );
};

export default BlogCard;